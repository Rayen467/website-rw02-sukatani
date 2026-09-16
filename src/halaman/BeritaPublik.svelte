<script>
  import { isi } from "../keadaan/isi.svelte.js";

  let filter = $state("semua");
  let cari = $state("");

  const memuat = $derived(isi.pengumuman === null);
  const semua = $derived(Array.isArray(isi.pengumuman) ? isi.pengumuman : []);
  const agenda = $derived(semua.filter((x) => x?.tipe === "agenda"));
  const publikasi = $derived(semua.filter((x) => x?.tipe !== "agenda"));

  function tanggalTampil(item) {
    if (item?.tglText) return item.tglText;
    const nilai = item?.tgl || item?.tanggal || "";
    if (!nilai) return "";
    const d = new Date(`${String(nilai).slice(0,10)}T00:00:00`);
    if (Number.isNaN(d.getTime())) return String(nilai);
    return new Intl.DateTimeFormat("id-ID", { day:"numeric", month:"long", year:"numeric" }).format(d);
  }

  function label(item) {
    if (item?.tipe === "berita") return "Berita";
    return "Pengumuman";
  }

  function ringkas(item, maks = 150) {
    const t = String(item?.ringkas || item?.isi || "").replace(/\s+/g," ").trim();
    return t.length > maks ? `${t.slice(0,maks - 1).trimEnd()}…` : t;
  }

  const hasil = $derived.by(() => {
    const q = cari.trim().toLowerCase();
    return [...publikasi]
      .filter((item) => {
        if (filter === "berita" && item?.tipe !== "berita") return false;
        if (filter === "pengumuman" && item?.tipe === "berita") return false;
        if (filter === "penting" && String(item?.penting) !== "true") return false;
        if (!q) return true;
        return `${item?.judul || ""} ${item?.ringkas || ""} ${item?.isi || ""}`.toLowerCase().includes(q);
      })
      .sort((a,b) => String(b?.tgl || "").localeCompare(String(a?.tgl || "")));
  });

  const unggulan = $derived(hasil.find((x) => String(x?.penting) === "true") || hasil[0] || null);
  const sisanya = $derived(hasil.filter((x) => x?.id !== unggulan?.id));
</script>

<div class="kabar-page">
  <section class="kabar-hero">
    <div class="kabar-shell">
      <nav class="remah-kabar" aria-label="Breadcrumb"><a href="#/">Beranda</a><span>›</span><a href="#/informasi">Informasi &amp; Komunikasi</a><span>›</span><span>Berita &amp; Pengumuman</span></nav>
      <div class="kabar-hero-grid">
        <div><p class="eyebrow">BERITA &amp; PENGUMUMAN RW 02</p><h1>Kabar yang perlu<br />warga ketahui.</h1><p class="lead">Khusus berita dan pemberitahuan resmi. Jadwal acara, dokumentasi foto/video, serta forum warga kini berada di halaman masing-masing supaya tidak bercampur.</p></div>
        <div class="kabar-nav" aria-label="Bagian Informasi dan Komunikasi">
          <a class="aktif" href="#/berita"><span>01</span><b>Berita &amp; Pengumuman</b></a>
          <a href="#/kalender"><span>02</span><b>Kalender Kegiatan</b></a>
          <a href="#/galeri"><span>03</span><b>Galeri Foto &amp; Video</b></a>
          <a href="#/forum"><span>04</span><b>Forum / Polling</b></a>
        </div>
      </div>
    </div>
  </section>

  <main class="kabar-shell kabar-main">
    <section class="kabar-toolbar">
      <div class="filter" aria-label="Filter berita">
        <button class:aktif={filter === "semua"} onclick={() => filter = "semua"}>Semua</button>
        <button class:aktif={filter === "berita"} onclick={() => filter = "berita"}>Berita</button>
        <button class:aktif={filter === "pengumuman"} onclick={() => filter = "pengumuman"}>Pengumuman</button>
        <button class:aktif={filter === "penting"} onclick={() => filter = "penting"}>Penting</button>
      </div>
      <label class="cari"><span aria-hidden="true">⌕</span><input bind:value={cari} type="search" placeholder="Cari berita atau pengumuman..." aria-label="Cari berita atau pengumuman" /></label>
    </section>

    {#if agenda.length}
      <aside class="agenda-note"><div><span>▦</span><p><b>{agenda.length} agenda kegiatan tidak dicampur di daftar berita.</b><small>Jadwal acara sekarang dibaca melalui Kalender Kegiatan.</small></p></div><a href="#/kalender">Buka Kalender →</a></aside>
    {/if}

    {#if memuat}
      <section class="loading" aria-live="polite"><div></div><div></div><div></div><p>Mengambil berita terbaru…</p></section>
    {:else if unggulan}
      <section class="headline">
        <header class="section-title"><div><span>TERBARU</span><h2>Berita & Pengumuman</h2></div><small>{hasil.length} publikasi ditemukan</small></header>
        <a class="featured" href={`#/berita/${unggulan.id}`}>
          <div class="featured-media">
            {#if unggulan.foto || unggulan.sampul}<img src={unggulan.foto || unggulan.sampul} alt={unggulan.judul || "Kabar RW 02"} />{:else}<div class="placeholder"><span>RW 02</span><small>Informasi warga</small></div>{/if}
          </div>
          <div class="featured-copy">
            <div class="meta"><span>{label(unggulan)}</span>{#if String(unggulan.penting) === "true"}<b>Penting</b>{/if}</div>
            <h2>{unggulan.judul}</h2>
            {#if tanggalTampil(unggulan)}<time>{tanggalTampil(unggulan)}</time>{/if}
            {#if ringkas(unggulan)}<p>{ringkas(unggulan,210)}</p>{/if}
            <strong class="read">Baca selengkapnya <span>→</span></strong>
          </div>
        </a>

        {#if sisanya.length}
          <div class="news-grid">
            {#each sisanya as item}
              <a class="news-card" href={`#/berita/${item.id}`}>
                <div class="news-media">
                  {#if item.foto || item.sampul}<img src={item.foto || item.sampul} alt="" loading="lazy" />{:else}<div class="mini-placeholder">RW02</div>{/if}
                  <span>{label(item)}</span>
                </div>
                <div class="news-body">
                  {#if tanggalTampil(item)}<time>{tanggalTampil(item)}</time>{/if}
                  <h3>{item.judul}</h3>
                  {#if ringkas(item)}<p>{ringkas(item,115)}</p>{/if}
                  <strong>Baca berita <span>→</span></strong>
                </div>
              </a>
            {/each}
          </div>
        {/if}
      </section>
    {:else}
      <section class="empty"><span>▤</span><h2>{publikasi.length ? "Tidak ada hasil pada filter ini" : "Belum ada berita atau pengumuman"}</h2><p>{publikasi.length ? "Coba filter lain atau hapus kata pencarian." : "Setelah Petugas menerbitkan informasi resmi, isinya akan muncul di halaman ini."}</p>{#if publikasi.length}<button onclick={() => { filter = "semua"; cari = ""; }}>Tampilkan semua</button>{/if}</section>
    {/if}

    <section class="lanjut-info">
      <div><span>INFORMASI LAIN</span><h2>Bukan berita yang Anda cari?</h2><p>Gunakan halaman khusus supaya informasi lebih cepat ditemukan.</p></div>
      <div class="lanjut-links"><a href="#/kalender">▦ Kalender</a><a href="#/galeri">▣ Galeri Foto & Video</a><a href="#/forum">◌ Forum / Polling</a><a href="#/informasi">↗ Semua Informasi</a></div>
    </section>
  </main>
</div>

<style>
  .kabar-page{--ink:#102a34;--muted:#65757a;--green:#08745a;--line:#dce8e4;width:100vw;margin-left:calc(50% - 50vw);margin-top:-32px;margin-bottom:-64px;background:#f7faf9;color:var(--ink);min-height:100vh}.kabar-shell{width:min(1180px,calc(100% - 40px));margin-inline:auto}.kabar-hero{background:linear-gradient(135deg,#edf8f4,#f9fbfa 62%,#e7f1ed);border-bottom:1px solid #dce9e4}.remah-kabar{display:flex;gap:8px;align-items:center;padding-top:35px;color:#81908d;font-size:11px}.remah-kabar a{color:#4d6962;text-decoration:none}.kabar-hero-grid{display:grid;grid-template-columns:minmax(0,1fr) 420px;gap:70px;align-items:end;padding:55px 0 64px}.eyebrow{margin:0 0 12px;color:#118067;font-size:10px;font-weight:900;letter-spacing:.14em}.kabar-hero h1{margin:0;font:700 clamp(40px,5.2vw,65px)/1.02 Georgia,serif;letter-spacing:-.04em}.lead{max-width:680px;margin:18px 0 0;color:var(--muted);font-size:14px;line-height:1.8}.kabar-nav{display:grid;border:1px solid #d5e5de;border-radius:16px;overflow:hidden;background:rgba(255,255,255,.8);box-shadow:0 14px 35px rgba(24,74,59,.06)}.kabar-nav a{display:grid;grid-template-columns:35px 1fr;gap:12px;align-items:center;padding:14px 17px;border-bottom:1px solid #e7efec;color:#526760;text-decoration:none;font-size:12px}.kabar-nav a:last-child{border-bottom:0}.kabar-nav a.aktif{background:#0b7159;color:#fff}.kabar-nav span{font:700 9px monospace;opacity:.68}.kabar-nav b{font-size:12px}.kabar-main{padding:34px 0 75px}.kabar-toolbar{display:flex;justify-content:space-between;gap:22px;align-items:center;margin-bottom:20px}.filter{display:flex;gap:7px;flex-wrap:wrap}.filter button{border:1px solid #d7e4df;background:#fff;color:#61726c;border-radius:999px;padding:9px 14px;font:700 11px inherit;cursor:pointer}.filter button.aktif{background:#0b7159;color:#fff;border-color:#0b7159}.cari{display:flex;align-items:center;gap:8px;min-width:min(370px,42vw);border:1px solid #d7e4df;border-radius:11px;background:#fff;padding:0 12px;color:#91a09b}.cari input{width:100%;border:0;outline:0;background:transparent;padding:10px 0;font:inherit;font-size:12px}.agenda-note{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:15px 18px;border:1px solid #d9e8e2;border-radius:13px;background:#eef8f4;margin-bottom:32px}.agenda-note>div{display:flex;align-items:center;gap:12px}.agenda-note>div>span{width:34px;height:34px;display:grid;place-items:center;border-radius:9px;background:#d8eee6;color:#08745a}.agenda-note p{display:grid;gap:2px;margin:0}.agenda-note b{font-size:11px}.agenda-note small{color:#6d7e78;font-size:10px}.agenda-note a{color:#08745a;font-size:11px;font-weight:800;text-decoration:none;white-space:nowrap}.section-title{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:18px}.section-title span{color:#128069;font-size:9px;font-weight:900;letter-spacing:.15em}.section-title h2{margin:4px 0 0;font:700 28px Georgia,serif}.section-title small{color:#83928e;font-size:10px}.featured{display:grid;grid-template-columns:minmax(0,1.18fr) minmax(320px,.82fr);background:#fff;border:1px solid var(--line);border-radius:19px;overflow:hidden;text-decoration:none;color:inherit;box-shadow:0 14px 38px rgba(31,72,60,.06);margin-bottom:22px}.featured-media{min-height:360px;background:#e9f2ee}.featured-media img{width:100%;height:100%;object-fit:cover;display:block}.placeholder{height:100%;min-height:360px;display:grid;place-content:center;text-align:center;background:radial-gradient(circle at 30% 30%,rgba(21,134,101,.18),transparent 32%),linear-gradient(135deg,#dceee7,#f3f7f5);color:#0a6d56}.placeholder span{font:900 28px Georgia,serif}.placeholder small{margin-top:5px;color:#6e817b}.featured-copy{display:flex;flex-direction:column;justify-content:center;padding:38px}.meta{display:flex;gap:7px;align-items:center;margin-bottom:14px}.meta span,.meta b{padding:5px 8px;border-radius:6px;background:#e5f3ed;color:#087158;font-size:9px;text-transform:uppercase;letter-spacing:.06em}.meta b{background:#fff1da;color:#9a6313}.featured h2{margin:0;font:700 clamp(27px,3vw,39px)/1.13 Georgia,serif;letter-spacing:-.025em}.featured time,.news-card time{display:block;color:#899792;font-size:10px;margin-top:10px}.featured p{color:var(--muted);font-size:13px;line-height:1.75;margin:15px 0 0}.read{margin-top:24px;color:#087158;font-size:11px}.read span,.news-card strong span{font-size:16px;margin-left:4px}.news-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:17px}.news-card{background:#fff;border:1px solid var(--line);border-radius:15px;overflow:hidden;color:inherit;text-decoration:none;transition:.2s ease}.news-card:hover{transform:translateY(-3px);box-shadow:0 13px 32px rgba(31,72,60,.08)}.news-media{height:175px;position:relative;background:#e9f2ee}.news-media img{width:100%;height:100%;object-fit:cover}.mini-placeholder{height:100%;display:grid;place-items:center;color:#0a7058;font:900 20px Georgia,serif;background:linear-gradient(135deg,#e0efe9,#f5f8f7)}.news-media>span{position:absolute;left:12px;bottom:11px;padding:5px 8px;border-radius:6px;background:rgba(7,56,46,.86);color:#fff;font-size:9px;font-weight:800}.news-body{padding:17px}.news-body h3{margin:7px 0 0;font:700 18px/1.25 Georgia,serif}.news-body p{min-height:55px;color:var(--muted);font-size:11px;line-height:1.65;margin:10px 0}.news-body strong{display:block;padding-top:12px;border-top:1px solid #edf2f0;color:#087158;font-size:10px}.loading{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.loading div{height:250px;border-radius:15px;background:linear-gradient(90deg,#edf3f0,#f8faf9,#edf3f0);background-size:200% 100%;animation:pulse 1.4s infinite}.loading p{grid-column:1/-1;text-align:center;color:#71817c;font-size:11px}@keyframes pulse{to{background-position:-200% 0}}.empty{text-align:center;padding:80px 20px;border:1px dashed #cadbd4;border-radius:18px;background:#fff}.empty>span{display:grid;place-items:center;margin:auto;width:52px;height:52px;border-radius:16px;background:#e6f2ed;color:#087158;font-size:25px}.empty h2{font:700 25px Georgia,serif;margin:15px 0 8px}.empty p{color:var(--muted);font-size:12px}.empty button{margin-top:12px;border:0;border-radius:9px;background:#0b7159;color:#fff;padding:10px 15px;font-weight:800;cursor:pointer}.lanjut-info{margin-top:52px;padding:29px 31px;border-radius:20px;background:#102f35;color:#fff;display:flex;align-items:center;justify-content:space-between;gap:30px}.lanjut-info>div:first-child>span{color:#8bd9c0;font-size:9px;font-weight:900;letter-spacing:.15em}.lanjut-info h2{margin:4px 0;font:700 24px Georgia,serif}.lanjut-info p{margin:0;color:#aebfba;font-size:11px}.lanjut-links{display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end}.lanjut-links a{padding:9px 11px;border:1px solid rgba(255,255,255,.15);border-radius:9px;color:#d6e8e2;text-decoration:none;font-size:10px;font-weight:700;background:rgba(255,255,255,.05)}
  @media(max-width:900px){.kabar-hero-grid{grid-template-columns:1fr;gap:30px}.kabar-nav{grid-template-columns:1fr 1fr}.kabar-nav a{border-right:1px solid #e7efec}.featured{grid-template-columns:1fr}.featured-media{min-height:300px}.news-grid{grid-template-columns:1fr 1fr}.lanjut-info{align-items:flex-start;flex-direction:column}.lanjut-links{justify-content:flex-start}}
  @media(max-width:620px){.kabar-page{margin-top:-18px}.kabar-shell{width:min(100% - 26px,1180px)}.kabar-hero-grid{padding:40px 0}.kabar-hero h1{font-size:39px}.kabar-nav{grid-template-columns:1fr}.kabar-toolbar{align-items:stretch;flex-direction:column}.cari{min-width:0;width:auto}.agenda-note{align-items:flex-start;flex-direction:column}.featured-copy{padding:24px}.news-grid{grid-template-columns:1fr}.lanjut-info{padding:23px 19px}}
</style>