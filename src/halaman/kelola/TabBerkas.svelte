<script>
  /**
   * Tab Dokumen & video.
   *
   * Selain tambah dan hapus, dokumen sekarang bisa diedit penuh: metadata,
   * kategori, tanggal, tautan, bahkan mengganti file yang sudah diunggah.
   */
  import { KOLEKSI } from "../../inti/nama.js";
  import { KATEGORI_BERKAS, CARA_BERKAS } from "../../inti/bawaan.js";
  import { bacaBerkas, BATAS_BERKAS_KB } from "../../inti/peramban.js";
  import { tanggalHariIni } from "../../inti/format.js";
  import { isi, muatKoleksi } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { simpanBerkas, hapusBerkas, ubahDokumen, simpanDokumen, hapusDokumen } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";

  let b = $state({ judul: "", kategori: "notulen", cara: "unggah", tautan: "", ket: "", tgl: tanggalHariIni() });
  let berkasDipilih = $state(null);
  let sibuk = $state(false);

  let editId = $state("");
  let editCaraLama = $state("");
  let edit = $state({ judul: "", kategori: "notulen", cara: "unggah", tautan: "", ket: "", tgl: "", namaBerkas: "", kb: "" });
  let editBerkas = $state(null);
  let menghapus = $state("");

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
      muatKoleksi(KOLEKSI.BERKAS);
      const dasar = err.code ? pesanRamah(err) : err.message;
      beriTahu(
        b.cara === "unggah"
          ? dasar + " Daftar dokumen disegarkan; bila judul muncul tanpa berkas, hapus lalu unggah ulang."
          : dasar
      );
    }
    sibuk = false;
  }

  function bukaEdit(d) {
    editId = d.id;
    editCaraLama = d.cara || "tautan";
    edit = {
      judul: d.judul || "",
      kategori: d.kategori || "lainnya",
      cara: d.cara || "tautan",
      tautan: d.tautan || "",
      ket: d.ket || "",
      tgl: d.tgl || "",
      namaBerkas: d.namaBerkas || "",
      kb: d.kb || ""
    };
    editBerkas = null;
    setTimeout(() => document.getElementById("edit-berkas")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
  }

  function batalEdit() {
    editId = "";
    editCaraLama = "";
    editBerkas = null;
  }

  async function simpanEdit(e) {
    e.preventDefault();
    if (!editId) return;
    sibuk = "edit";
    try {
      const meta = {
        judul: edit.judul,
        kategori: edit.kategori,
        katLabel: labelKategori(edit.kategori),
        cara: edit.cara,
        tautan: edit.cara === "tautan" ? edit.tautan.trim() : "",
        ket: edit.ket,
        tgl: edit.tgl
      };

      if (edit.cara === "tautan") {
        if (!meta.tautan) throw new Error("Alamat tautannya belum diisi.");
        meta.namaBerkas = "";
        meta.kb = "";
        await ubahDokumen(KOLEKSI.BERKAS, editId, meta);
        if (editCaraLama === "unggah") await hapusDokumen(KOLEKSI.BERKAS_ISI, editId);
      } else {
        let hasil = null;
        if (editBerkas) hasil = await bacaBerkas(editBerkas);
        if (!hasil && editCaraLama !== "unggah") throw new Error("Pilih file baru ketika mengubah dokumen tautan menjadi unggahan.");

        meta.namaBerkas = hasil ? hasil.nama : edit.namaBerkas;
        meta.kb = hasil ? hasil.kb : edit.kb;
        await ubahDokumen(KOLEKSI.BERKAS, editId, meta);
        if (hasil) await simpanDokumen(KOLEKSI.BERKAS_ISI, editId, { data: hasil.data }, false);
      }

      await muatKoleksi(KOLEKSI.BERKAS);
      beriTahu("Dokumen diperbarui.");
      batalEdit();
    } catch (err) {
      beriTahu(err?.code ? pesanRamah(err) : (err?.message || "Perubahan belum tersimpan."));
    } finally {
      sibuk = false;
    }
  }

  async function hapus(d) {
    if (!confirm("Hapus \"" + d.judul + "\" dari situs? Tindakan ini tidak bisa dibatalkan.")) return;
    menghapus = d.id;
    try {
      await hapusBerkas(d.id);
      beriTahu("Dihapus.");
      if (editId === d.id) batalEdit();
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
        <span class="petunjuk">PDF, Word, Excel, PowerPoint, atau gambar. Batasnya sekitar {BATAS_BERKAS_KB} KB.</span>
      </div>
    {:else}
      <div class="isian">
        <label for="bk-tautan">Alamat tautan</label>
        <input id="bk-tautan" bind:value={b.tautan} inputmode="url" placeholder="https://drive.google.com/..." />
        <span class="petunjuk">Untuk Google Drive, pastikan berkasnya disetel siapa saja yang memiliki tautan.</span>
      </div>
    {/if}

    <div class="isian"><label for="bk-tgl">Tanggal</label><input id="bk-tgl" type="date" bind:value={b.tgl} /></div>
    <div class="isian"><label for="bk-ket">Keterangan singkat</label><input id="bk-ket" bind:value={b.ket} placeholder="Hasil rapat pembentukan panitia HUT RI" /></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === true}>{sibuk === true ? "Menyimpan..." : "Simpan"}</button></div>
  </form>
</section>

{#if editId}
  <section class="blok edit-berkas" id="edit-berkas">
    <div class="kepala-bagian"><h2>Ubah dokumen / video</h2><button class="tombol" type="button" onclick={batalEdit}>Batal</button></div>
    <div class="catatan" style="margin-bottom:18px"><b>Edit lengkap.</b> Anda bisa mengganti judul, kategori, tanggal, keterangan, tautan, atau file unggah. File lama tetap dipakai bila mode unggah tidak diganti dan tidak ada file baru dipilih.</div>
    <form class="isian-borang" onsubmit={simpanEdit}>
      <div class="isian"><label for="be-judul">Judul</label><input id="be-judul" bind:value={edit.judul} required /></div>
      <div class="isian"><label for="be-kat">Kelompok</label><select id="be-kat" bind:value={edit.kategori}>{#each KATEGORI_BERKAS as k}<option value={k.nilai}>{k.label}</option>{/each}</select></div>
      <div class="isian"><label for="be-cara">Cara</label><select id="be-cara" bind:value={edit.cara}>{#each CARA_BERKAS as c}<option value={c.nilai}>{c.label}</option>{/each}</select></div>
      {#if edit.cara === "unggah"}
        <div class="isian">
          <label for="be-file">{editCaraLama === "unggah" ? "Ganti file (opsional)" : "File baru"}</label>
          <input id="be-file" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,image/*" onchange={(e) => (editBerkas = e.currentTarget.files?.[0] || null)} />
          <span class="petunjuk">{editBerkas ? `File baru: ${editBerkas.name}` : editCaraLama === "unggah" ? `File sekarang: ${edit.namaBerkas || "tersimpan"}` : "Wajib pilih file untuk beralih dari tautan ke unggahan."}</span>
        </div>
      {:else}
        <div class="isian"><label for="be-tautan">Alamat tautan</label><input id="be-tautan" type="url" bind:value={edit.tautan} placeholder="https://..." /></div>
      {/if}
      <div class="isian"><label for="be-tgl">Tanggal</label><input id="be-tgl" type="date" bind:value={edit.tgl} /></div>
      <div class="isian"><label for="be-ket">Keterangan</label><textarea id="be-ket" bind:value={edit.ket}></textarea></div>
      <div class="baris-tombol"><button class="tombol utama" type="submit" disabled={sibuk === "edit"}>{sibuk === "edit" ? "Menyimpan..." : "Simpan perubahan"}</button><button class="tombol" type="button" onclick={batalEdit}>Batal</button></div>
    </form>
  </section>
{/if}

<section class="blok">
  <div class="kepala-bagian"><h2>Sudah ada di situs</h2></div>
  {#if daftar.length}
    {#each daftar as d}
      <div class="baris-kelola">
        <div class="isi">
          <b>{d.judul}</b>
          <p>{d.katLabel || ""}{d.tgl ? " · " + d.tgl : ""}</p>
          <p>{d.cara === "tautan" ? "Tautan: " + d.tautan : "Diunggah: " + (d.namaBerkas || "") + " (" + (d.kb || 0) + " KB)"}</p>
          {#if d.ket}<p>{d.ket}</p>{/if}
        </div>
        <div></div>
        <div class="baris-tombol">
          <button class="tombol" type="button" onclick={() => bukaEdit(d)}>{editId === d.id ? "Sedang diubah" : "Ubah"}</button>
          <button class="tombol" type="button" disabled={menghapus === d.id} onclick={() => hapus(d)}>{menghapus === d.id ? "Menghapus..." : "Hapus"}</button>
        </div>
      </div>
    {/each}
  {:else}
    <p class="kosong">Belum ada dokumen. Yang ditambahkan di sini tampil di halaman Dokumen &amp; Video.</p>
  {/if}
</section>

<style>
  .edit-berkas{border-color:#c9ddd5;background:linear-gradient(180deg,#fbfefd,#fff)}
</style>
