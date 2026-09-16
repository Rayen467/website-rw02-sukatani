<script>
  import { isi } from "../keadaan/isi.svelte.js";
  import Kosong from "../komponen/Kosong.svelte";

  const kabar = $derived((isi.pengumuman || []).slice(0, 6));
  const album = $derived((isi.galeri || []).slice(0, 6));

  function ringkas(teks, maks = 180) {
    const bersih = String(teks || "").replace(/\s+/g, " ").trim();
    if (!bersih) return "";
    return bersih.length > maks ? bersih.slice(0, maks - 1).trimEnd() + "…" : bersih;
  }

  function labelKabar(item) {
    if (item?.tipe === "agenda") return "Agenda";
    if (item?.tipe === "pengumuman") return "Pengumuman";
    return "Informasi";
  }

  function tanggalKabar(item) {
    return item?.tglText || item?.tanggal || item?.periode || "";
  }

  function jumlahFoto(item) {
    const nilai = Number(item?.jumlahFoto || 0);
    return Number.isFinite(nilai) && nilai > 0 ? nilai : 0;
  }
</script>

<nav class="remah">
  <a href="#/">Beranda</a><span>›</span><span>Berita &amp; Galeri</span>
</nav>

<section class="gb-hero">
  <div class="gb-hero-copy">
    <p class="alis">Informasi &amp; dokumentasi warga</p>
    <h1>Berita &amp; Galeri RW 02</h1>
    <p>
      Satu halaman untuk melihat kabar yang dipublikasikan pengurus dan dokumentasi kegiatan warga.
      Semua isi di bawah berasal dari data website; bila belum ada data, halaman menampilkan keadaan kosong apa adanya.
    </p>
    <div class="gb-aksi">
      <a class="tombol utama" href="#/berita">Buka semua berita</a>
      <a class="tombol" href="#/galeri">Buka galeri lengkap</a>
    </div>
  </div>

  <div class="gb-ringkas" aria-label="Ringkasan berita dan galeri">
    <div><strong>{(isi.pengumuman || []).length}</strong><span>Kabar terpublikasi</span></div>
    <div><strong>{(isi.galeri || []).length}</strong><span>Album galeri</span></div>
  </div>
</section>

<section class="blok gb-section">
  <header class="gb-head">
    <div>
      <p class="alis">Kabar terbaru</p>
      <h2>Berita, pengumuman &amp; agenda</h2>
      <p>Menampilkan data terbaru yang memang tersimpan pada kanal informasi RW 02.</p>
    </div>
    <a class="tombol" href="#/berita">Lihat semua →</a>
  </header>

  {#if kabar.length}
    <div class="gb-news-grid">
      {#each kabar as item}
        <article class="gb-news-card">
          {#if item.foto || item.sampul}
            <img src={item.foto || item.sampul} alt={item.judul || "Dokumentasi berita RW 02"} loading="lazy" decoding="async" />
          {:else}
            <div class="gb-no-image" aria-hidden="true"><span>RW 02</span></div>
          {/if}
          <div class="gb-card-copy">
            <div class="gb-meta">
              <span>{labelKabar(item)}</span>
              {#if tanggalKabar(item)}<small>{tanggalKabar(item)}</small>{/if}
            </div>
            <h3>{item.judul || "Informasi RW 02"}</h3>
            {#if item.ringkas || item.isi}<p>{ringkas(item.ringkas || item.isi)}</p>{/if}
            {#if item.id}<a href={`#/berita/${item.id}`}>Baca selengkapnya →</a>{/if}
          </div>
        </article>
      {/each}
    </div>
  {:else}
    <Kosong
      judul="Belum ada berita yang dipublikasikan"
      ket="Berita, pengumuman, atau agenda akan muncul di sini setelah pengurus menerbitkannya."
    />
  {/if}
</section>

<section class="blok gb-section">
  <header class="gb-head">
    <div>
      <p class="alis">Dokumentasi kegiatan</p>
      <h2>Galeri warga</h2>
      <p>Album dan foto yang memang telah diunggah oleh pengurus.</p>
    </div>
    <a class="tombol" href="#/galeri">Lihat galeri →</a>
  </header>

  {#if album.length}
    <div class="gb-gallery-grid">
      {#each album as g}
        <article class="gb-gallery-card">
          {#if g.sampul || g.foto}
            <img src={g.sampul || g.foto} alt={g.judul || "Album kegiatan RW 02"} loading="lazy" decoding="async" />
          {:else}
            <div class="gb-gallery-empty" aria-hidden="true"><span>Belum ada sampul</span></div>
          {/if}
          <div>
            <h3>{g.judul || "Album kegiatan"}</h3>
            {#if g.ket || g.keterangan}<p>{ringkas(g.ket || g.keterangan, 130)}</p>{/if}
            {#if jumlahFoto(g)}<small>{jumlahFoto(g)} foto</small>{/if}
          </div>
        </article>
      {/each}
    </div>
  {:else}
    <Kosong
      judul="Belum ada album galeri"
      ket="Dokumentasi kegiatan akan tampil di sini setelah pengurus mengunggah album."
    />
  {/if}
</section>

<section class="gb-footnote">
  <div>
    <strong>Tautan lama tetap aman.</strong>
    <p>Alamat <span class="mono">#/galeri-berita</span> sekarang memiliki halaman sendiri dan tidak lagi jatuh ke halaman “tidak ditemukan”.</p>
  </div>
  <a class="tombol" href="#/">Kembali ke beranda</a>
</section>

<style>
  .gb-hero{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(240px,.65fr);gap:22px;align-items:stretch;margin:10px 0 24px;padding:28px;border:1px solid #dce8e1;border-radius:22px;background:linear-gradient(135deg,#edf8f3 0%,#fff 60%,#f5faf7 100%);box-shadow:0 18px 44px -38px rgba(15,82,60,.5)}
  .gb-hero-copy h1{margin:4px 0 10px;font-size:clamp(30px,4vw,48px);line-height:1.02;letter-spacing:-.04em;color:#123d32}.gb-hero-copy>p:last-of-type{max-width:760px;margin:0;color:#5d706a;line-height:1.65}.gb-aksi{display:flex;gap:9px;flex-wrap:wrap;margin-top:18px}
  .gb-ringkas{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-self:end}.gb-ringkas div{min-height:112px;display:flex;flex-direction:column;justify-content:flex-end;padding:16px;border:1px solid #dbe8e2;border-radius:16px;background:#fff}.gb-ringkas strong{font-size:34px;line-height:1;color:#0b7457}.gb-ringkas span{margin-top:7px;color:#64736f;font-size:12px;font-weight:700}
  .gb-section{margin-top:22px}.gb-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-end;margin-bottom:16px}.gb-head h2{margin:3px 0 5px;font-size:24px;color:#173f35}.gb-head p{margin:0;color:#6b7d77}.gb-news-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.gb-news-card{overflow:hidden;border:1px solid #dfe9e4;border-radius:16px;background:#fff}.gb-news-card>img,.gb-no-image{width:100%;aspect-ratio:16/9;object-fit:cover}.gb-no-image{display:grid;place-items:center;background:linear-gradient(135deg,#d9eee5,#f3faf6);color:#0b7255;font-size:20px;font-weight:900;letter-spacing:.08em}.gb-card-copy{padding:15px}.gb-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px}.gb-meta span{padding:4px 7px;border-radius:999px;background:#e6f4ee;color:#0b7558;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.04em}.gb-meta small{color:#75847f;font-size:10px}.gb-card-copy h3{margin:0;color:#183f35;font-size:17px;line-height:1.25}.gb-card-copy p{margin:8px 0 0;color:#667873;font-size:12px;line-height:1.55}.gb-card-copy a{display:inline-flex;margin-top:12px;color:#0a7256;font-size:12px;font-weight:800;text-decoration:none}
  .gb-gallery-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.gb-gallery-card{overflow:hidden;border:1px solid #dfe9e4;border-radius:16px;background:#fff}.gb-gallery-card>img,.gb-gallery-empty{width:100%;aspect-ratio:4/3;object-fit:cover}.gb-gallery-empty{display:grid;place-items:center;background:#f1f6f3;color:#7d8d88;font-size:11px;font-weight:700}.gb-gallery-card>div:last-child{padding:14px}.gb-gallery-card h3{margin:0;color:#183f35;font-size:16px}.gb-gallery-card p{margin:7px 0 0;color:#687a74;font-size:12px;line-height:1.5}.gb-gallery-card small{display:block;margin-top:8px;color:#0a7256;font-size:10px;font-weight:800}
  .gb-footnote{display:flex;align-items:center;justify-content:space-between;gap:18px;margin:24px 0 8px;padding:17px 19px;border:1px solid #dce8e2;border-radius:16px;background:#f7faf8}.gb-footnote strong{color:#173f35}.gb-footnote p{margin:4px 0 0;color:#64756f;font-size:12px}.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
  @media(max-width:900px){.gb-hero{grid-template-columns:1fr}.gb-news-grid,.gb-gallery-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:620px){.gb-hero{padding:20px}.gb-ringkas{grid-template-columns:1fr 1fr}.gb-ringkas div{min-height:88px;padding:12px}.gb-ringkas strong{font-size:27px}.gb-head{align-items:flex-start;flex-direction:column}.gb-news-grid,.gb-gallery-grid{grid-template-columns:1fr}.gb-footnote{align-items:flex-start;flex-direction:column}}
</style>
