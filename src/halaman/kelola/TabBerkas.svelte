<script>
  /**
   * Tab Dokumen & video.
   *
   * Dua cara memasukkan berkas, dan pilihan di antara keduanya ditentukan
   * satu hal saja: ukuran.
   *
   *   unggah   berkasnya ikut disimpan di situs. Ada batas ukuran karena
   *            satu dokumen Firestore cuma muat 1 MB. Cocok untuk PDF surat,
   *            SK, formulir, notulen ketikan.
   *   tautan   situs cuma menyimpan alamatnya. Tanpa batas ukuran, jadi ini
   *            satu-satunya cara untuk video. Risikonya berkas itu hidup di
   *            tempat lain dan ikut mati kalau pemiliknya menghapusnya.
   *
   * Borang menyesuaikan sendiri: memilih "unggah" memunculkan pemilih
   * berkas, memilih "tautan" memunculkan kotak alamat. Pengurus tidak perlu
   * memahami alasan teknis di atas untuk bisa memakainya.
   */
  import { KOLEKSI } from "../../inti/nama.js";
  import { KATEGORI_BERKAS, CARA_BERKAS } from "../../inti/bawaan.js";
  import { bacaBerkas, BATAS_BERKAS_KB } from "../../inti/peramban.js";
  import { tanggalHariIni } from "../../inti/format.js";
  import { isi, muatKoleksi } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { simpanBerkas, hapusBerkas } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";

  let b = $state({ judul: "", kategori: "notulen", cara: "unggah", tautan: "", ket: "", tgl: tanggalHariIni() });
  let berkasDipilih = $state(null);
  let sibuk = $state(false);

  const daftar = $derived(isi.berkas || []);
  const labelKategori = (n) => (KATEGORI_BERKAS.find((k) => k.nilai === n) || {}).label || "Lainnya";

  async function simpan(e) {
    e.preventDefault();
    sibuk = true;
    try {
      let data = "";
      let namaBerkas = "";
      let kb = 0;

      if (b.cara === "unggah") {
        if (!berkasDipilih) throw new Error("Belum ada berkas dipilih.");
        const hasil = await bacaBerkas(berkasDipilih);
        data = hasil.data;
        namaBerkas = hasil.nama;
        kb = hasil.kb;
      } else if (!b.tautan.trim()) {
        throw new Error("Alamat tautannya belum diisi.");
      }

      /* Keterangan dan isi ditulis ke dua koleksi terpisah. Alasannya ada
         di catatan BERKAS_ISI di inti/nama.js: kalau isi base64 ikut di
         dokumen keterangan, seluruhnya ikut terunduh tiap situs dibuka. */
      await simpanBerkas(
        {
          judul: b.judul,
          kategori: b.kategori,
          katLabel: labelKategori(b.kategori),
          cara: b.cara,
          tautan: b.cara === "tautan" ? b.tautan.trim() : "",
          namaBerkas,
          kb,
          ket: b.ket,
          tgl: b.tgl
        },
        data
      );

      b = { judul: "", kategori: b.kategori, cara: b.cara, tautan: "", ket: "", tgl: tanggalHariIni() };
      berkasDipilih = null;
      beriTahu("Tersimpan.");
      muatKoleksi(KOLEKSI.BERKAS);
    } catch (err) {
      /* Galat dari bacaBerkas sudah berbentuk kalimat siap baca, jadi
         pesanRamah() hanya dipakai untuk galat yang datang dari Firebase. */
      beriTahu(err.code ? pesanRamah(err) : err.message);
    }
    sibuk = false;
  }

  let menghapus = $state("");

  /* Tidak memakai komponen BarisHapus seperti tab lain, karena berkas
     tersimpan di DUA dokumen. Menghapus keterangannya saja meninggalkan
     isinya sebagai sampah yang tidak muncul di layar mana pun. */
  async function hapus(d) {
    if (!confirm("Hapus \"" + d.judul + "\" dari situs? Tindakan ini tidak bisa dibatalkan.")) return;
    menghapus = d.id;
    try {
      await hapusBerkas(d.id);
      beriTahu("Dihapus.");
      muatKoleksi(KOLEKSI.BERKAS);
    } catch (err) {
      beriTahu(pesanRamah(err));
    }
    menghapus = "";
  }
</script>

<section class="blok">
  <div class="kepala-bagian"><h2>Tambah dokumen atau video</h2></div>

  <div class="catatan" style="margin-bottom:18px">
    <b>Dua cara, pilih sesuai ukurannya.</b>
    Berkas sampai sekitar {BATAS_BERKAS_KB} KB bisa diunggah langsung ke situs &mdash;
    cukup untuk PDF surat, SK, formulir, dan notulen ketikan.
    Yang lebih besar, dan <b>semua video</b>, diunggah dulu ke Google Drive atau
    YouTube lalu tautannya ditempel di sini.
  </div>

  <form class="isian-borang" onsubmit={simpan}>
    <div class="isian">
      <label for="bk-judul">Judul</label>
      <input id="bk-judul" bind:value={b.judul} required placeholder="Notulen Rapat Warga 12 Januari 2026" />
    </div>

    <div class="isian">
      <label for="bk-kat">Kelompok</label>
      <select id="bk-kat" bind:value={b.kategori}>
        {#each KATEGORI_BERKAS as k}<option value={k.nilai}>{k.label}</option>{/each}
      </select>
    </div>

    <div class="isian">
      <label for="bk-cara">Cara memasukkan</label>
      <select id="bk-cara" bind:value={b.cara}>
        {#each CARA_BERKAS as c}<option value={c.nilai}>{c.label}</option>{/each}
      </select>
    </div>

    {#if b.cara === "unggah"}
      <div class="isian">
        <label for="bk-berkas">Berkas</label>
        <input
          id="bk-berkas"
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,image/*"
          onchange={(e) => (berkasDipilih = e.target.files[0] || null)}
        />
        <span class="petunjuk">
          PDF, Word, Excel, PowerPoint, atau gambar. Batasnya sekitar {BATAS_BERKAS_KB} KB.
          Kalau ditolak karena kebesaran, ganti caranya jadi tautan.
        </span>
      </div>
    {:else}
      <div class="isian">
        <label for="bk-tautan">Alamat tautan</label>
        <input id="bk-tautan" bind:value={b.tautan} inputmode="url" placeholder="https://drive.google.com/..." />
        <span class="petunjuk">
          Untuk Google Drive, pastikan berkasnya disetel <b>siapa saja yang memiliki tautan</b>,
          kalau tidak warga akan melihat halaman minta izin.
        </span>
      </div>
    {/if}

    <div class="isian">
      <label for="bk-tgl">Tanggal</label>
      <input id="bk-tgl" type="date" bind:value={b.tgl} />
    </div>

    <div class="isian">
      <label for="bk-ket">Keterangan singkat</label>
      <input id="bk-ket" bind:value={b.ket} placeholder="Hasil rapat pembentukan panitia HUT RI" />
    </div>

    <div>
      <button class="tombol utama" type="submit" disabled={sibuk}>
        {sibuk ? "Menyimpan..." : "Simpan"}
      </button>
    </div>
  </form>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Sudah ada di situs</h2></div>
  {#if daftar.length}
    {#each daftar as d}
      <div class="baris-kelola">
        <div class="isi">
          <b>{d.judul}</b>
          <p>{d.katLabel || ""}{d.tgl ? " · " + d.tgl : ""}</p>
          <p>
            {d.cara === "tautan"
              ? "Tautan: " + d.tautan
              : "Diunggah: " + (d.namaBerkas || "") + " (" + (d.kb || 0) + " KB)"}
          </p>
          {#if d.ket}<p>{d.ket}</p>{/if}
        </div>
        <div></div>
        <button class="tombol" type="button" disabled={menghapus === d.id} onclick={() => hapus(d)}>
          {menghapus === d.id ? "Menghapus..." : "Hapus"}
        </button>
      </div>
    {/each}
  {:else}
    <p class="kosong">Belum ada dokumen. Yang ditambahkan di sini tampil di halaman Dokumen &amp; Video.</p>
  {/if}
</section>
