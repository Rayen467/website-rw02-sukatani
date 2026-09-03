<script>
  /**
   * Halaman Dokumen & video.
   *
   * Dua sumber berkas ditampilkan bercampur dan sengaja dibedakan jelas:
   * yang diunggah bisa langsung diunduh, yang berupa tautan membuka situs
   * lain. Warga berhak tahu mana yang akan membawanya keluar dari situs RW.
   */
  import { KOLEKSI } from "../inti/nama.js";
  import { KATEGORI_BERKAS } from "../inti/bawaan.js";
  import { isi } from "../keadaan/isi.svelte.js";
  import { beriTahu } from "../keadaan/pesan.svelte.js";
  import { ambilDokumen } from "../sumber/data.js";

  const semua = $derived(isi.berkas || []);
  let kelompok = $state("semua");
  let mengunduh = $state("");

  /**
   * Isi berkas diambil BARU SAAT DITEKAN, bukan ikut dimuat bersama daftar.
   * Kalau ikut dimuat, tiap pengunjung situs mengunduh semua PDF yang
   * pernah diterbitkan, termasuk yang cuma mau membaca pengumuman.
   */
  async function unduh(d) {
    mengunduh = d.id;
    try {
      const dok = await ambilDokumen(KOLEKSI.BERKAS_ISI, d.id);
      if (!dok || !dok.data) throw new Error("Berkasnya tidak ditemukan di server.");

      /* Data URI diubah jadi blob dulu. Sebagian peramban HP menolak
         mengunduh data URI yang panjang lewat tautan biasa. */
      const jawaban = await fetch(dok.data);
      const gumpal = await jawaban.blob();
      const alamat = URL.createObjectURL(gumpal);

      const a = document.createElement("a");
      a.href = alamat;
      a.download = d.namaBerkas || "berkas";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(alamat);
    } catch (err) {
      beriTahu(err.message || "Gagal mengunduh berkas.");
    }
    mengunduh = "";
  }

  const tersaring = $derived(
    kelompok === "semua" ? semua : semua.filter((d) => d.kategori === kelompok)
  );

  /* Hanya kelompok yang benar-benar ada isinya yang muncul sebagai saringan.
     Menampilkan tombol yang selalu menghasilkan halaman kosong cuma
     membuat warga mengira ada yang rusak. */
  const kelompokTerpakai = $derived(
    KATEGORI_BERKAS.filter((k) => semua.some((d) => d.kategori === k.nilai))
  );
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Dokumen &amp; Video</span></nav>
<div class="kepala-halaman">
  <p class="alis">Warga</p>
  <h1>Dokumen dan video</h1>
  <p>Notulen rapat, surat keputusan, formulir yang bisa diunduh, laporan, dan rekaman kegiatan.</p>
</div>

{#if semua.length}
  {#if kelompokTerpakai.length > 1}
    <div class="saring">
      <button class="tombol" class:utama={kelompok === "semua"} type="button" onclick={() => (kelompok = "semua")}>
        Semua ({semua.length})
      </button>
      {#each kelompokTerpakai as k}
        <button class="tombol" class:utama={kelompok === k.nilai} type="button" onclick={() => (kelompok = k.nilai)}>
          {k.label} ({semua.filter((d) => d.kategori === k.nilai).length})
        </button>
      {/each}
    </div>
  {/if}

  <div class="petak petak-2">
    {#each tersaring as d}
      <div class="kartu berkas-kartu">
        <p class="alis">{d.katLabel || ""}{d.tgl ? " · " + d.tgl : ""}</p>
        <h3>{d.judul}</h3>
        {#if d.ket}<p>{d.ket}</p>{/if}

        {#if d.cara === "tautan" && d.tautan}
          <p class="keterangan">Berkasnya ada di situs lain.</p>
          <a class="tombol" href={d.tautan} target="_blank" rel="noopener noreferrer">Buka tautan &rarr;</a>
        {:else if d.namaBerkas}
          <p class="keterangan">
            {d.namaBerkas}{d.kb ? " · " + d.kb + " KB" : ""}
          </p>
          <button class="tombol utama" type="button" disabled={mengunduh === d.id} onclick={() => unduh(d)}>
            {mengunduh === d.id ? "Menyiapkan..." : "Unduh"}
          </button>
        {:else}
          <p class="keterangan">Berkasnya belum terpasang.</p>
        {/if}
      </div>
    {/each}
  </div>
{:else}
  <p class="kosong">
    Belum ada dokumen yang diterbitkan. Pengurus dapat menambahkannya lewat halaman Kelola,
    di tab Dokumen &amp; video.
  </p>
{/if}
