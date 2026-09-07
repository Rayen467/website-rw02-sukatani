<script>
  import { KONTEN } from "../inti/nama.js";
  import { kontenNilai } from "../keadaan/isi.svelte.js";
  import { keDaftar } from "../inti/format.js";
  import { MAJELIS_TAKLIM_BAWAAN } from "../inti/bawaan.js";

  const nilai = (k) => kontenNilai(KONTEN.MAJELIS_TAKLIM, k, MAJELIS_TAKLIM_BAWAAN[k] || "");
  const misi = $derived(keDaftar(nilai("misi")));
  const tujuan = $derived(keDaftar(nilai("tujuan")));
  const kegiatan = $derived(keDaftar(nilai("kegiatan")));
  const kepengurusan = $derived(keDaftar(nilai("kepengurusan")));
  const keuangan = $derived(keDaftar(nilai("keuangan")));
</script>

<nav class="remah"><a href="#/">Beranda</a><span>›</span><span>Majelis Taklim Al-Ikhlas</span></nav>

<div class="kepala-halaman">
  <p class="alis">Kelembagaan warga</p>
  <h1>{nilai("nama")}</h1>
  <p>Profil dan ringkasan ketentuan organisasi berdasarkan Surat Keterangan Terdaftar serta AD/ART Majelis Taklim Al-Ikhlas RW 02.</p>
</div>

<section class="blok">
  <div class="petak petak-2">
    <div class="kartu">
      <p class="alis">Status terdaftar</p>
      <h3>Surat Keterangan Terdaftar</h3>
      <div class="tabel-bungkus" style="border:0;background:none">
        <table class="data"><tbody>
          <tr><th>No. SKT</th><td>{nilai("noSkt")}</td></tr>
          <tr><th>Dasar</th><td>{nilai("dasarSkt")}</td></tr>
          <tr><th>Tanggal diterbitkan</th><td>{nilai("tanggalSkt")}</td></tr>
          <tr><th>Masa berlaku</th><td>{nilai("masaBerlaku")}</td></tr>
          <tr><th>Ketua</th><td>{nilai("ketua")}</td></tr>
          <tr><th>Tahun berdiri</th><td>{nilai("tahunBerdiri")}</td></tr>
        </tbody></table>
      </div>
    </div>
    <div class="kartu">
      <p class="alis">Identitas organisasi</p>
      <h3>Al-Ikhlas RW 02</h3>
      <div class="tabel-bungkus" style="border:0;background:none">
        <table class="data"><tbody>
          <tr><th>Didirikan</th><td>{nilai("tanggalBerdiri")}</td></tr>
          <tr><th>Periode</th><td>{nilai("periode")}</td></tr>
          <tr><th>Alamat</th><td>{nilai("alamat")}</td></tr>
          <tr><th>Masa bakti pengurus</th><td>{nilai("masaBakti")}</td></tr>
        </tbody></table>
      </div>
    </div>
  </div>
</section>

<section class="blok">
  <div class="petak petak-2">
    <div class="kartu">
      <p class="alis">Landasan</p>
      <p>{nilai("landasan")}</p>
    </div>
    <div class="kartu">
      <p class="alis">Visi</p>
      <p style="font-size:16px;color:var(--tinta);line-height:1.65">{nilai("visi")}</p>
    </div>
  </div>
</section>

<section class="blok">
  <div class="petak petak-2">
    <div class="kartu">
      <h3>Misi</h3>
      <ol class="poin">{#each misi as x}<li>{x}</li>{/each}</ol>
    </div>
    <div class="kartu">
      <h3>Tujuan</h3>
      <ol class="poin">{#each tujuan as x}<li>{x}</li>{/each}</ol>
    </div>
  </div>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Kegiatan Majelis Taklim</h2></div>
  <div class="petak petak-3">
    {#each kegiatan as x}
      <div class="kartu"><p>{x}</p></div>
    {/each}
  </div>
</section>

<section class="blok">
  <div class="petak petak-2">
    <div class="kartu">
      <h3>Keanggotaan</h3>
      <p>{nilai("keanggotaan")}</p>
    </div>
    <div class="kartu">
      <h3>Susunan kepengurusan</h3>
      <ul class="poin">{#each kepengurusan as x}<li>{x}</li>{/each}</ul>
    </div>
  </div>
</section>

<section class="blok">
  <div class="petak petak-2">
    <div class="kartu">
      <h3>Musyawarah dan rapat</h3>
      <p>{nilai("musyawarah")}</p>
      <p>{nilai("rapat")}</p>
    </div>
    <div class="kartu">
      <h3>Sumber keuangan</h3>
      <ol class="poin">{#each keuangan as x}<li>{x}</li>{/each}</ol>
    </div>
  </div>
</section>

<section class="blok">
  <div class="catatan">
    <b>Perubahan AD/ART.</b> {nilai("perubahan")}
  </div>
  <p class="verifikasi" style="margin-top:14px">
    Ringkasan ini disusun dari dokumen SKT dan AD/ART yang diberikan kepada pengelola situs. Jika dokumen resmi diperbarui, pengurus dapat memperbarui isinya lewat halaman Kelola.
  </p>
</section>
