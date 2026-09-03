<script>
  import { pakai } from "../keadaan/isi.svelte.js";
  import { JENIS_SURAT_BAWAAN } from "../inti/bawaan.js";
  import { keDaftar } from "../inti/format.js";

  const daftar = $derived(
    pakai("jenis_surat", JENIS_SURAT_BAWAAN).map((s) => ({
      ...s,
      daftarSyarat: Array.isArray(s.syarat) ? s.syarat : keDaftar(s.syarat)
    }))
  );
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Pengajuan Surat</span></nav>
<div class="kepala-halaman">
  <p class="alis">Layanan warga</p>
  <h1>Pengajuan surat online</h1>
  <p>Pilih jenis surat, isi keterangannya, lalu simpan nomor antreannya. Berkas dapat dicetak atau disimpan sebagai PDF dan dibawa ke pengurus untuk ditandatangani.</p>
</div>

<div class="catatan">
  <b>Cara kerjanya.</b> Pengajuan lewat situs mempercepat pengetikan, bukan menggantikan tanda tangan.
  Warga tetap menemui Ketua RT dan Ketua RW untuk pengesahan, tetapi suratnya sudah rapi dan syaratnya sudah jelas sejak awal.
</div>

<section class="blok" style="margin-top:26px">
  <div class="kepala-bagian"><h2>Jenis surat yang dilayani</h2></div>
  <div class="petak petak-2">
    {#each daftar as s}
      <a class="kartu" href="#/surat/{s.id}">
        <h3>{s.nama}</h3>
        <p class="keterangan">Perkiraan selesai {s.estimasi || "\u2026\u2026"}</p>
        {#if s.daftarSyarat.length}
          <p>Syarat: {s.daftarSyarat.join(", ").toLowerCase()}.</p>
        {/if}
      </a>
    {/each}
  </div>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Alur pengurusan</h2></div>
  <div class="kartu">
    <div class="langkah">
      <div class="langkah-butir"><span class="nomor">1</span><div><b>Ajukan lewat situs</b><p>Pilih jenis surat, isi keterangan, kirim. Nomor antrean muncul seketika.</p></div></div>
      <div class="langkah-butir"><span class="nomor">2</span><div><b>Cetak berkasnya</b><p>Berkas sudah berisi keterangan yang diisi, tinggal dibawa.</p></div></div>
      <div class="langkah-butir"><span class="nomor">3</span><div><b>Tanda tangan Ketua RT</b><p>Bawa berkas beserta syarat yang diminta.</p></div></div>
      <div class="langkah-butir"><span class="nomor">4</span><div><b>Pengesahan Ketua RW</b><p>Setelah disahkan, surat siap dibawa ke kantor desa bila diperlukan.</p></div></div>
    </div>
  </div>
</section>
