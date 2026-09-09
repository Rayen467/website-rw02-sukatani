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
  const lampiran = $derived(keDaftar(nilai("lampiranPendaftaran")));
  const ketuaTerkini = MAJELIS_TAKLIM_BAWAAN.ketua;
  const fotoKetuaTerkini = MAJELIS_TAKLIM_BAWAAN.fotoKetua || "";
</script>

<nav class="remah"><a href="#/">Beranda</a><span>›</span><span>Majelis Taklim Al-Ikhlas</span></nav>

<div class="kepala-halaman">
  <p class="alis">Kelembagaan warga</p>
  <h1>{nilai("nama")}</h1>
  <p>
    Profil dan ringkasan ketentuan organisasi berdasarkan Surat Keterangan Terdaftar,
    AD/ART, serta dokumen permohonan pendaftaran Majelis Taklim Al-Ikhlas RW 02.
  </p>
</div>

<section class="blok">
  <div class="petak petak-2">
    <div class="kartu">
      <p class="alis">Status terdaftar</p>
      <h3>Surat Keterangan Terdaftar</h3>
      {#if fotoKetuaTerkini}
        <div class="majelis-ketua">
          <img src={fotoKetuaTerkini} alt="Foto Ketua Majelis Taklim Al-Ikhlas RW 02 PSP" decoding="async" />
          <div>
            <span>Ketua Majelis Taklim</span>
            <strong>{ketuaTerkini}</strong>
          </div>
        </div>
      {/if}
      <div class="tabel-bungkus" style="border:0;background:none">
        <table class="data"><tbody>
          <tr><th>No. SKT</th><td>{nilai("noSkt")}</td></tr>
          <tr><th>Dasar</th><td>{nilai("dasarSkt")}</td></tr>
          <tr><th>Tanggal diterbitkan</th><td>{nilai("tanggalSkt")}</td></tr>
          <tr><th>Masa berlaku</th><td>{nilai("masaBerlaku")}</td></tr>
          <tr><th>Ketua saat ini</th><td>{ketuaTerkini}</td></tr>
          <tr><th>Sekretaris</th><td>{nilai("sekretaris")}</td></tr>
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
          <tr><th>Jumlah anggota</th><td>{nilai("jumlahAnggota")}</td></tr>
          <tr><th>Alamat</th><td>{nilai("alamat")}</td></tr>
          <tr><th>Masa bakti pengurus</th><td>{nilai("masaBakti")}</td></tr>
        </tbody></table>
      </div>
    </div>
  </div>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Dokumen pendaftaran ke KUA Rajeg</h2></div>
  <div class="petak petak-2">
    <div class="kartu">
      <div class="tabel-bungkus" style="border:0;background:none">
        <table class="data"><tbody>
          <tr><th>Nomor surat</th><td>{nilai("nomorPermohonan")}</td></tr>
          <tr><th>Tanggal</th><td>{nilai("tanggalPermohonan")}</td></tr>
          <tr><th>Tujuan</th><td>Kantor Urusan Agama Kecamatan Rajeg</td></tr>
          <tr><th>Jumlah anggota</th><td>{nilai("jumlahAnggota")}</td></tr>
        </tbody></table>
      </div>
      <p>{nilai("tujuanPendaftaran")}</p>
    </div>
    <div class="kartu">
      <h3>Lampiran permohonan</h3>
      <ol class="poin">{#each lampiran as x}<li>{x}</li>{/each}</ol>
    </div>
  </div>
</section>

<section class="blok">
  <div class="catatan">
    <p class="alis">Arsip RW terkait Majelis Taklim</p>
    <h3 style="margin:4px 0 10px">{nilai("dokumenRwNomor")}</h3>
    <p><b>{nilai("dokumenRwJudul")}</b></p>
    <p>{nilai("dokumenRwDasar")}</p>
    <p>{nilai("dokumenRwCatatan")}</p>
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
    Ringkasan ini disusun dari dokumen SKT, AD/ART, surat permohonan pendaftaran,
    dan arsip RW yang diberikan kepada pengelola situs. Dokumen dengan nama/periode berbeda
    tidak digabungkan secara paksa; masing-masing ditampilkan sesuai konteksnya.
  </p>
</section>


<style>
  .majelis-ketua {
    display: grid;
    grid-template-columns: 72px minmax(0,1fr);
    gap: 12px;
    align-items: center;
    margin: 12px 0 14px;
    padding: 10px;
    border: 1px solid var(--garis);
    border-radius: 12px;
    background: color-mix(in srgb, var(--permukaan) 88%, transparent);
  }
  .majelis-ketua img {
    width: 72px;
    height: 86px;
    object-fit: cover;
    object-position: center 18%;
    border-radius: 9px;
  }
  .majelis-ketua span,
  .majelis-ketua strong { display: block; }
  .majelis-ketua span { color: var(--tinta-3); font-size: 11px; }
  .majelis-ketua strong { margin-top: 3px; color: var(--tinta); font-size: 15px; }
</style>
