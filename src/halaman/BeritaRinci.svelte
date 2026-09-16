<script>
  import { isi } from "../keadaan/isi.svelte.js";
  import TidakAda from "./TidakAda.svelte";

  let { kunci } = $props();
  let tersalin = $state(false);

  const k = $derived((isi.pengumuman || []).find((x) => x.id === kunci));

  const tanggal = $derived.by(() => {
    if (!k) return "";
    if (k.tglText) return k.tglText;
    if (!k.tgl) return "";
    const d = new Date(`${k.tgl}T00:00:00`);
    if (Number.isNaN(d.getTime())) return k.tgl;
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(d);
  });

  const labelTipe = $derived.by(() => {
    if (!k) return "Informasi";
    if (k.tipe === "agenda") return "Kegiatan";
    const teks = String(k.tipe || "Informasi").trim();
    return teks ? teks.charAt(0).toUpperCase() + teks.slice(1) : "Informasi";
  });

  const paragraf = $derived.by(() => {
    const teks = String(k?.isi || "").trim();
    if (!teks) return [];
    const blok = teks.split(/\n\s*\n+/).map((x) => x.trim()).filter(Boolean);
    return blok.length > 1 ? blok : teks.split(/\n+/).map((x) => x.trim()).filter(Boolean);
  });

  const menitBaca = $derived.by(() => {
    const kata = String(k?.isi || "").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(kata / 200));
  });

  const fotoUtama = $derived(k?.foto || k?.sampul || "");

  const terkait = $derived.by(() =>
    (isi.pengumuman || [])
      .filter((x) => x.id !== kunci)
      .slice(0, 4)
  );

  const kategori = $derived.by(() => {
    const hitung = new Map();
    for (const item of isi.pengumuman || []) {
      const nama = item.tipe === "agenda" ? "Kegiatan" : String(item.tipe || "Informasi").trim() || "Informasi";
      const label = nama.charAt(0).toUpperCase() + nama.slice(1);
      hitung.set(label, (hitung.get(label) || 0) + 1);
    }
    return [...hitung.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([nama, jumlah]) => ({ nama, jumlah }));
  });

  function ringkasan(item) {
    const teks = String(item?.ringkas || item?.isi || "").replace(/\s+/g, " ").trim();
    return teks.length > 110 ? `${teks.slice(0, 107)}…` : teks;
  }

  async function bagikan() {
    const judul = k?.judul || "Berita RW 02 Sukatani";
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: judul, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      tersalin = true;
      setTimeout(() => (tersalin = false), 1800);
    } catch {
      // Pembatalan dialog berbagi tidak perlu dianggap sebagai galat.
    }
  }
</script>

{#if !k}
  <TidakAda />
{:else}
  <div class="artikel-page">
    <main class="artikel-shell">
      <nav class="artikel-breadcrumb" aria-label="Breadcrumb">
        <a href="#/">Beranda</a><span>›</span><a href="#/berita">Berita</a><span>›</span><span>{labelTipe}</span>
      </nav>

      <div class="artikel-grid">
        <article class="artikel-card">
          <header class="artikel-head">
            <span class="artikel-badge">{labelTipe}</span>
            <h1>{k.judul}</h1>
            {#if k.ringkas}
              <p class="artikel-lead">{k.ringkas}</p>
            {/if}

            <div class="artikel-meta-row">
              <div class="artikel-author">
                <div class="artikel-avatar" aria-hidden="true">RW</div>
                <div>
                  <strong>{k.penulis || "RW 02 Sukatani"}</strong>
                  <span>{tanggal || "Tanggal belum dicantumkan"}</span>
                </div>
              </div>
              <div class="artikel-meta-kanan">
                <span>{menitBaca} menit baca</span>
                <button type="button" class="artikel-share" onclick={bagikan} aria-label="Bagikan berita">
                  <span aria-hidden="true">↗</span> {tersalin ? "Tautan disalin" : "Bagikan"}
                </button>
              </div>
            </div>
          </header>

          {#if fotoUtama}
            <figure class="artikel-hero">
              <img src={fotoUtama} alt={k.judul} decoding="async" />
              {#if k.keteranganFoto}<figcaption>{k.keteranganFoto}</figcaption>{/if}
            </figure>
          {:else}
            <div class="artikel-hero artikel-hero-kosong" aria-hidden="true">
              <div><span>RW 02</span><strong>{labelTipe}</strong></div>
            </div>
          {/if}

          <div class="artikel-isi">
            {#if paragraf.length}
              {#each paragraf as p, i}
                <p class:artikel-pembuka={i === 0}>{p}</p>
              {/each}
            {:else}
              <p class="artikel-kosong">Isi berita belum ditambahkan oleh pengurus.</p>
            {/if}

            <div class="artikel-penutup">
              <div>
                <span>Bagikan informasi ini</span>
                <strong>Supaya warga lain juga mendapatkan kabar yang sama.</strong>
              </div>
              <button type="button" class="artikel-share artikel-share-bawah" onclick={bagikan}>
                <span aria-hidden="true">↗</span> {tersalin ? "Tautan disalin" : "Bagikan berita"}
              </button>
            </div>
          </div>
        </article>

        <aside class="artikel-sidebar">
          <section class="side-card side-terbaru">
            <div class="side-title"><h2>Berita Terbaru</h2><a href="#/berita">Lihat Semua</a></div>
            {#if terkait.length}
              <div class="side-list">
                {#each terkait as item}
                  <a class="side-news" href={`#/berita/${item.id}`}>
                    {#if item.foto || item.sampul}
                      <img src={item.foto || item.sampul} alt="" decoding="async" />
                    {:else}
                      <div class="side-thumb" aria-hidden="true">RW</div>
                    {/if}
                    <span>
                      <strong>{item.judul}</strong>
                      <small>{item.tglText || item.tgl || ""}</small>
                    </span>
                  </a>
                {/each}
              </div>
            {:else}
              <p class="side-empty">Belum ada berita lain.</p>
            {/if}
          </section>

          <section class="side-card">
            <div class="side-title"><h2>Kategori Berita</h2></div>
            {#if kategori.length}
              <div class="side-kategori">
                {#each kategori as item}
                  <a href="#/berita"><span>{item.nama}</span><b>{item.jumlah}</b></a>
                {/each}
              </div>
            {:else}
              <p class="side-empty">Kategori belum tersedia.</p>
            {/if}
          </section>

          <section class="side-card">
            <div class="side-title"><h2>Jelajahi</h2></div>
            <div class="side-jelajahi">
              <a href="#/profil">Profil RW</a>
              <a href="#/layanan">Layanan Warga</a>
              <a href="#/transparansi">Transparansi</a>
              <a href="#/umkm">UMKM Warga</a>
              <a href="#/galeri">Galeri Kegiatan</a>
            </div>
          </section>
        </aside>
      </div>

      {#if terkait.length}
        <section class="artikel-terkait">
          <div class="terkait-head">
            <div><span></span><h2>Berita Terkait</h2></div>
            <a href="#/berita">Lihat semua berita <span>→</span></a>
          </div>
          <div class="terkait-grid">
            {#each terkait.slice(0, 3) as item}
              <a class="terkait-card" href={`#/berita/${item.id}`}>
                <div class="terkait-media">
                  {#if item.foto || item.sampul}
                    <img src={item.foto || item.sampul} alt="" decoding="async" />
                  {:else}
                    <div class="terkait-placeholder" aria-hidden="true"><span>RW 02</span></div>
                  {/if}
                  <span class="terkait-badge">{item.tipe === "agenda" ? "Kegiatan" : (item.tipe || "Informasi")}</span>
                </div>
                <div class="terkait-copy">
                  <small>{item.tglText || item.tgl || ""}</small>
                  <h3>{item.judul}</h3>
                  {#if ringkasan(item)}<p>{ringkasan(item)}</p>{/if}
                  <strong>Baca Selengkapnya <span>→</span></strong>
                </div>
              </a>
            {/each}
          </div>
        </section>
      {/if}
    </main>
  </div>
{/if}

<style>
  .artikel-page{background:linear-gradient(180deg,#edf8ff 0,#f7fbfd 58%,#fff 100%);min-height:100vh;padding:34px 0 70px;color:#102234}
  .artikel-shell{width:min(1180px,calc(100% - 36px));margin:0 auto}
  .artikel-breadcrumb{display:flex;align-items:center;gap:9px;font-size:13px;color:#7c8995;margin:0 0 18px}
  .artikel-breadcrumb a{color:#567183;text-decoration:none}.artikel-breadcrumb a:hover{color:#0e6b78}
  .artikel-grid{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:28px;align-items:start}
  .artikel-card{background:#fff;border:1px solid #dcebf1;border-radius:12px;box-shadow:0 12px 35px rgba(30,73,94,.07);overflow:hidden}
  .artikel-head{padding:34px 42px 24px}
  .artikel-badge{display:inline-flex;align-items:center;background:#0b6973;color:#fff;border-radius:5px;padding:5px 9px;font-size:11px;font-weight:800;letter-spacing:.02em;margin-bottom:13px;text-transform:capitalize}
  .artikel-head h1{font-family:Georgia,"Times New Roman",serif;font-size:clamp(30px,4vw,49px);line-height:1.08;letter-spacing:-.035em;margin:0;max-width:900px;color:#0f1f30}
  .artikel-lead{font-size:16px;line-height:1.72;color:#63717d;margin:16px 0 0;max-width:820px}
  .artikel-meta-row{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:22px;padding-top:16px;border-top:1px solid #e8eef1}
  .artikel-author{display:flex;align-items:center;gap:11px}.artikel-avatar{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#d8efe8,#f0f8f2);border:1px solid #cfe3da;color:#0b725e;font-size:11px;font-weight:900}.artikel-author div:last-child{display:grid;gap:2px}.artikel-author strong{font-size:12px;color:#293946}.artikel-author span{font-size:11px;color:#8a959d}
  .artikel-meta-kanan{display:flex;align-items:center;gap:14px;font-size:11px;color:#8a959d}.artikel-share{border:1px solid #dbe5e9;background:#fff;color:#53636d;border-radius:8px;padding:8px 11px;font:inherit;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px}.artikel-share:hover{border-color:#0b6973;color:#0b6973;background:#f3fbfb}
  .artikel-hero{margin:0 42px;border-radius:10px;overflow:hidden;background:#edf3f5}.artikel-hero img{display:block;width:100%;aspect-ratio:16/8.7;object-fit:cover}.artikel-hero figcaption{padding:9px 12px;font-size:11px;color:#73818a;background:#f8fbfc}
  .artikel-hero-kosong{min-height:360px;display:grid;place-items:center;background:radial-gradient(circle at 22% 20%,rgba(24,139,130,.25),transparent 32%),linear-gradient(135deg,#dbeff1,#eef6f5 52%,#d7ebe6)}.artikel-hero-kosong div{display:grid;text-align:center;gap:6px;color:#0b645c}.artikel-hero-kosong span{font-size:18px;font-weight:900;letter-spacing:.15em}.artikel-hero-kosong strong{font-size:34px;font-family:Georgia,serif}
  .artikel-isi{padding:29px 42px 40px}.artikel-isi>p{font-family:Georgia,"Times New Roman",serif;font-size:17px;line-height:1.9;color:#263846;margin:0 0 21px}.artikel-isi>p.artikel-pembuka:first-letter{float:left;font-size:58px;line-height:.82;padding:8px 9px 0 0;font-weight:700;color:#102234}.artikel-kosong{font-family:inherit!important;color:#7a8890!important;font-style:italic}
  .artikel-penutup{margin-top:30px;padding:17px 0 0;border-top:1px solid #e6edef;display:flex;justify-content:space-between;align-items:center;gap:20px}.artikel-penutup div{display:grid;gap:3px}.artikel-penutup span{font-size:11px;color:#8b979e}.artikel-penutup strong{font-size:13px;color:#354750}.artikel-share-bawah{font-size:12px}
  .artikel-sidebar{display:grid;gap:18px}.side-card{background:#fff;border:1px solid #dcebf1;border-radius:10px;padding:18px;box-shadow:0 8px 24px rgba(30,73,94,.045)}.side-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:13px}.side-title h2{font-size:16px;margin:0;color:#16313b}.side-title a{font-size:11px;text-decoration:none;color:#0b6973;font-weight:700}.side-list{display:grid;gap:12px}.side-news{display:grid;grid-template-columns:72px 1fr;gap:10px;text-decoration:none;color:inherit;align-items:center}.side-news img,.side-thumb{width:72px;height:55px;border-radius:6px;object-fit:cover;background:#eaf3f1}.side-thumb{display:grid;place-items:center;color:#0a6e61;font-size:10px;font-weight:900}.side-news span{display:grid;gap:5px;min-width:0}.side-news strong{font-size:11px;line-height:1.35;color:#293b45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.side-news small{font-size:9px;color:#8a969d}.side-empty{margin:0;color:#89959c;font-size:12px}.side-kategori{display:grid}.side-kategori a{display:flex;justify-content:space-between;align-items:center;text-decoration:none;color:#52616a;padding:9px 0;border-bottom:1px solid #edf1f3;font-size:12px}.side-kategori a:last-child{border-bottom:0}.side-kategori b{width:23px;height:23px;border-radius:50%;display:grid;place-items:center;background:#eaf5f3;color:#0b7064;font-size:10px}.side-jelajahi{display:flex;flex-wrap:wrap;gap:7px}.side-jelajahi a{text-decoration:none;border:1px solid #dfe8eb;border-radius:6px;padding:7px 9px;font-size:10px;color:#5b6971;background:#fbfdfd}.side-jelajahi a:hover{border-color:#0b6973;color:#0b6973}
  .artikel-terkait{margin-top:34px}.terkait-head{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:15px}.terkait-head>div{display:flex;align-items:center;gap:9px}.terkait-head>div>span{width:4px;height:19px;border-radius:99px;background:#10916e}.terkait-head h2{margin:0;font-family:Georgia,serif;font-size:22px;color:#152c37}.terkait-head>a{text-decoration:none;font-size:11px;color:#0b6973;font-weight:700}.terkait-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.terkait-card{background:#fff;border:1px solid #dfe9ed;border-radius:9px;overflow:hidden;text-decoration:none;color:inherit;transition:transform .2s ease,box-shadow .2s ease}.terkait-card:hover{transform:translateY(-3px);box-shadow:0 12px 28px rgba(31,73,91,.09)}.terkait-media{position:relative}.terkait-media img,.terkait-placeholder{width:100%;aspect-ratio:16/7.5;object-fit:cover;background:linear-gradient(135deg,#d9ece8,#edf5f4)}.terkait-placeholder{display:grid;place-items:center;color:#0b6d61;font-weight:900}.terkait-badge{position:absolute;top:9px;left:9px;background:#0b6973;color:white;border-radius:4px;padding:4px 7px;font-size:9px;font-weight:800;text-transform:capitalize}.terkait-copy{padding:14px}.terkait-copy small{color:#8c979d;font-size:9px}.terkait-copy h3{font-family:Georgia,serif;font-size:16px;line-height:1.25;margin:7px 0;color:#1b303a}.terkait-copy p{font-size:10px;line-height:1.55;color:#7b878e;margin:0 0 12px}.terkait-copy>strong{font-size:10px;color:#0b6973}
  @media(max-width:920px){.artikel-grid{grid-template-columns:1fr}.artikel-sidebar{grid-template-columns:repeat(3,minmax(0,1fr))}.side-terbaru{grid-column:span 2}.terkait-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.terkait-card:last-child{display:none}}
  @media(max-width:680px){.artikel-page{padding-top:18px}.artikel-shell{width:min(100% - 22px,1180px)}.artikel-head{padding:24px 20px 18px}.artikel-head h1{font-size:32px}.artikel-meta-row{align-items:flex-start;flex-direction:column}.artikel-meta-kanan{width:100%;justify-content:space-between}.artikel-hero{margin:0 12px}.artikel-hero-kosong{min-height:230px}.artikel-isi{padding:24px 20px 30px}.artikel-isi>p{font-size:16px;line-height:1.82}.artikel-sidebar{grid-template-columns:1fr}.side-terbaru{grid-column:auto}.artikel-penutup{align-items:flex-start;flex-direction:column}.terkait-grid{grid-template-columns:1fr}.terkait-card:last-child{display:block}.terkait-head{align-items:flex-start}.terkait-head>a{display:none}}
</style>
