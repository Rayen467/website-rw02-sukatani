<script>
  import { KONTEN } from "../inti/nama.js";
  import { kontenNilai } from "../keadaan/isi.svelte.js";
  import { keDaftar } from "../inti/format.js";
  import { GOR_NURANI_BAWAAN } from "../inti/bawaan.js";

  const nilai = (k) => kontenNilai(KONTEN.GOR_NURANI, k, GOR_NURANI_BAWAAN[k] || "");
  const misi = $derived(keDaftar(nilai("misi")));
  const tujuan = $derived(keDaftar(nilai("tujuan")));
</script>

<nav class="remah"><a href="#/">Beranda</a><span>›</span><span>GOR Nurani</span></nav>

<div class="kepala-halaman">
  <p class="alis">Fasilitas warga</p>
  <h1>{nilai("nama")}</h1>
  <p>Profil pengelolaan GOR mini RW 02 berdasarkan dokumen Anggaran Dasar dan Anggaran Rumah Tangga Pengelolaan GOR Nurani.</p>
</div>

<section class="blok">
  <div class="petak petak-2">
    <div class="kartu">
      <p class="alis">Identitas fasilitas</p>
      <h3>{nilai("jenis")}</h3>
      <div class="tabel-bungkus" style="border:0;background:none">
        <table class="data"><tbody>
          <tr><th>Pendirian</th><td>{nilai("tahunPendirian")}</td></tr>
          <tr><th>Mulai operasional</th><td>{nilai("mulaiOperasional")}</td></tr>
          <tr><th>Luas</th><td>{nilai("luas")}</td></tr>
          <tr><th>Lokasi</th><td>{nilai("alamat")}</td></tr>
        </tbody></table>
      </div>
    </div>
    <div class="kartu">
      <p class="alis">Riwayat singkat</p>
      <p>{nilai("riwayat")}</p>
    </div>
  </div>
</section>

<section class="blok">
  <div class="petak petak-2">
    <div class="kartu">
      <p class="alis">Visi</p>
      <p style="font-size:16px;color:var(--tinta);line-height:1.65">{nilai("visi")}</p>
    </div>
    <div class="kartu">
      <h3>Misi</h3>
      <ol class="poin">{#each misi as x}<li>{x}</li>{/each}</ol>
    </div>
  </div>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Landasan pengelolaan</h2></div>
  <div class="petak petak-3">
    <div class="kartu"><p class="alis">Landasan</p><p>{nilai("landasan")}</p></div>
    <div class="kartu"><p class="alis">Sifat</p><p>{nilai("sifat")}</p></div>
    <div class="kartu"><p class="alis">Asas</p><p>{nilai("asas")}</p></div>
  </div>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Tujuan GOR Nurani</h2></div>
  <div class="kartu">
    <ol class="poin">{#each tujuan as x}<li>{x}</li>{/each}</ol>
  </div>
</section>

<section class="blok">
  <div class="kartu">
    <p class="alis">Pemanfaatan</p>
    <h3>Olahraga, sosial, dan pemanfaatan fasilitas</h3>
    <p>{nilai("pemanfaatan")}</p>
    <div class="baris-tombol" style="margin-top:16px">
      <a class="tombol utama" href="#/reservasi">Ajukan pemakaian fasilitas</a>
    </div>
  </div>
</section>

<section class="blok">
  <div class="kartu">
    <p class="alis">Makna lambang dalam AD</p>
    <p>{nilai("maknaLogo")}</p>
  </div>
  <p class="verifikasi" style="margin-top:14px">
    Ringkasan ini mengikuti dokumen AD/ART GOR Nurani yang diberikan kepada pengelola situs. Tarif pemakaian tidak dicantumkan karena dokumen menyatakan tarif ditetapkan oleh pengelola.
  </p>
</section>
