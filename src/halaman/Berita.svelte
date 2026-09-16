<script>
  import { onMount } from "svelte";
  import { isi, muatKonten } from "../keadaan/isi.svelte.js";
  import { waktu } from "../keadaan/waktu.svelte.js";
  import { gambarWaktuAbsolut } from "../inti/waktu.js";

  const KALENDER_KEY = "kalender";
  const gambarHero = $derived(gambarWaktuAbsolut(waktu.fase));
  const daftar = $derived(isi.pengumuman || []);
  const galeri = $derived(isi.galeri || []);
  const video = $derived((isi.berkas || []).filter((d) => d.kategori === "video"));

  onMount(() => { muatKonten(KALENDER_KEY); });

  function parse(teks) {
    try { const v = JSON.parse(String(teks || "")); return Array.isArray(v) ? v : []; }
    catch { return []; }
  }

  function formatTanggal(teks) {
    if (!teks) return "";
    const d = new Date(`${String(teks).slice(0, 10)}T00:00:00`);
    if (Number.isNaN(d.getTime())) return String(teks);
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(d);
  }

  function tanggalPublik(k) {
    if (k?.tglText) return k.tglText;
    return formatTanggal(k?.tgl || k?.tanggal || "");
  }

  function labelTipe(k) {
    return k?.tipe === "agenda" ? "Agenda" : "Pengumuman";
  }

  function hrefBerita(k) {
    return k?.id ? `#/berita/${k.id}` : "#/berita";
  }

  function ringkas(teks, maks = 145) {
    const t = String(teks || "").replace(/\s+/g, " ").trim();
    if (!t) return "";
    return t.length > maks ? `${t.slice(0, maks - 1).trimEnd()}…` : t;
  }

  function gambarKabar(k) {
    return k?.foto || k?.sampul || "";
  }

  const beritaAktif = $derived([...daftar].sort((a, b) => String(b.tgl || b.tanggal || "").localeCompare(String(a.tgl || a.tanggal || ""))));
  const unggulan = $derived(beritaAktif.find((k) => String(k.penting) === "true") || beritaAktif[0] || null);
  const terbaru = $derived(beritaAktif.filter((k) => k.id !== unggulan?.id).slice(0, 5));

  const acaraKelola = $derived.by(() => {
    const dok = isi.konten?.[KALENDER_KEY] || {};
    return parse(dok.acara).filter((a) => a && String(a.tampil) !== "false");
  });

  const agendaBerita = $derived(daftar
    .filter((k) => k.tipe === "agenda" && k.tanggal)
    .map((k) => ({ id: `berita-${k.id}`, judul: k.judul, tanggal: k.tanggal, mulai: "", selesai: "", tempat: "", kategori: "Agenda berita", keterangan: k.ringkas || "" })));

  const agendaTerdekat = $derived.by(() => {
    const hariIni = new Date();
    const tahun = hariIni.getFullYear();
    const isoHariIni = `${tahun}-${String(hariIni.getMonth() + 1).padStart(2, "0")}-${String(hariIni.getDate()).padStart(2, "0")}`;
    const normal = acaraKelola.map((a) => {
      let tanggal = String(a.tanggal || "");
      if (a.ulang === "tahunan" && /^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
        const md = tanggal.slice(5);
        tanggal = `${tahun}-${md}`;
        if (tanggal < isoHariIni) tanggal = `${tahun + 1}-${md}`;
      }
      return { ...a, tanggal };
    });
    return [...normal, ...agendaBerita]
      .filter((a) => a.tanggal && a.tanggal >= isoHariIni)
      .sort((a, b) => String(a.tanggal).localeCompare(String(b.tanggal)) || String(a.mulai || "").localeCompare(String(b.mulai || "")))
      .slice(0, 4);
  });

  const galeriTampil = $derived(galeri.slice(0, 6));
  const videoTampil = $derived(video.slice(0, 3));
</script>

<div class="berita-page">
  <section class="berita-hero" style={`--hero:url('${gambarHero}')`}>
    <div class="berita-hero-lapis"></div>
    <div class="berita-shell berita-hero-grid">
      <div class="berita-hero-copy">
        <p class="eyebrow">Informasi & Kabar Terkini</p>
        <h1>Kabar RW 02</h1>
        <h2>Informasi yang benar-benar diterbitkan pengurus</h2>
        <p>Berita, pengumuman, agenda, dokumentasi foto, dan video kegiatan warga tersambung langsung dengan data Portal Petugas.</p>
        <div class="hero-actions">
          <a href="#berita-utama">Lihat kabar terbaru →</a>
          <a class="secondary" href="#/kalender">Buka kalender kegiatan</a>
        </div>
      </div>
      <aside class="berita-now">
        <small>{waktu.tanggal}</small>
        <strong>{waktu.jam} WIB</strong>
        <span>Permai Sukatani · Rajeg</span>
      </aside>
    </div>
  </section>

  <main class="berita-shell berita-main">
    <nav class="shortcut" aria-label="Navigasi informasi">
      <a href="#berita-utama"><b>▣</b><span><strong>Berita</strong><small>Kabar yang sudah diterbitkan</small></span></a>
      <a href="#agenda"><b>▦</b><span><strong>Kalender</strong><small>Agenda berdasarkan tanggal asli</small></span></a>
      <a href="#galeri"><b>◉</b><span><strong>Galeri</strong><small>Dokumentasi dari dashboard</small></span></a>
      <a href="#video"><b>▶</b><span><strong>Video</strong><small>Video kegiatan RW 02</small></span></a>
    </nav>

    <section class="berita-grid" id="berita-utama">
      <div class="utama-wrap">
        <header class="section-head"><div><span>BERITA UTAMA</span><h2>Berita Utama</h2></div><small>{beritaAktif.length} publikasi</small></header>
        {#if unggulan}
          <article class:tanpa-foto={!gambarKabar(unggulan)} class="utama-card">
            {#if gambarKabar(unggulan)}<img src={gambarKabar(unggulan)} alt={unggulan.judul || "Berita RW 02"} decoding="async" />{:else}<div class="utama-placeholder">RW 02<br /><small>Informasi warga</small></div>{/if}
            <div class="utama-overlay"></div>
            <div class="utama-copy">
              <span class="badge">{labelTipe(unggulan)}{String(unggulan.penting) === "true" ? " · Penting" : ""}</span>
              <h3>{unggulan.judul}</h3>
              {#if tanggalPublik(unggulan)}<time>{tanggalPublik(unggulan)}</time>{/if}
              {#if unggulan.ringkas || unggulan.isi}<p>{ringkas(unggulan.ringkas || unggulan.isi, 180)}</p>{/if}
              <a href={hrefBerita(unggulan)}>Baca selengkapnya →</a>
            </div>
          </article>
        {:else}
          <div class="empty"><b>Belum ada berita yang diterbitkan.</b><span>Setelah Petugas menerbitkan berita atau pengumuman, kontennya akan muncul di sini tanpa data contoh.</span></div>
        {/if}
      </div>

      <aside class="terbaru-wrap">
        <header class="section-head"><div><span>TERBARU</span><h2>Berita Terbaru</h2></div></header>
        {#if terbaru.length}
          <div class="terbaru-list">
            {#each terbaru as k}
              <a href={hrefBerita(k)}>
                {#if gambarKabar(k)}<img src={gambarKabar(k)} alt="" loading="lazy" decoding="async" />{:else}<span class="thumb-placeholder">RW02</span>{/if}
                <span class="terbaru-copy"><small>{labelTipe(k)}{tanggalPublik(k) ? ` · ${tanggalPublik(k)}` : ""}</small><strong>{k.judul}</strong><em>{ringkas(k.ringkas || k.isi, 92)}</em></span>
                <b>›</b>
              </a>
            {/each}
          </div>
        {:else if unggulan}
          <div class="empty mini"><span>Belum ada publikasi lain.</span></div>
        {:else}
          <div class="empty mini"><span>Daftar berita masih kosong.</span></div>
        {/if}
      </aside>
    </section>

    <section class="agenda-section" id="agenda">
      <header class="section-head"><div><span>JADWAL</span><h2>Kalender Kegiatan</h2><p>Acara di bawah berasal dari Kalender Petugas dan agenda Berita yang mempunyai tanggal kegiatan.</p></div><a href="#/kalender">Kalender lengkap →</a></header>
      {#if agendaTerdekat.length}
        <div class="agenda-grid">
          {#each agendaTerdekat as a}
            <article>
              <time datetime={a.tanggal}><b>{String(a.tanggal).slice(8,10)}</b><span>{formatTanggal(a.tanggal).split(" ")[1] || ""}</span></time>
              <div><span class="agenda-kat">{a.kategori || "Kegiatan"}</span><h3>{a.judul}</h3><p>{[a.mulai && (a.selesai ? `${a.mulai}–${a.selesai}` : a.mulai), a.tempat].filter(Boolean).join(" · ") || "Waktu/tempat akan dilengkapi pengurus"}</p>{#if a.keterangan}<small>{ringkas(a.keterangan, 110)}</small>{/if}</div>
            </article>
          {/each}
        </div>
      {:else}
        <div class="empty"><b>Belum ada agenda mendatang.</b><span>Petugas dapat menambahkan acara 17-an, kegiatan keagamaan, rapat, HUT, olahraga, atau agenda lain dari menu Layanan → Kalender & acara.</span></div>
      {/if}
    </section>

    <section class="galeri-section" id="galeri">
      <header class="section-head"><div><span>DOKUMENTASI</span><h2>Galeri Foto</h2><p>Album yang ditambahkan Petugas tampil di sini dan di halaman Galeri.</p></div><a href="#/galeri">Lihat semua →</a></header>
      {#if galeriTampil.length}
        <div class="galeri-grid">
          {#each galeriTampil as g}
            <a href="#/galeri">
              {#if g.sampul || g.foto}<img src={g.sampul || g.foto} alt={g.judul || "Dokumentasi RW 02"} loading="lazy" decoding="async" />{:else}<span class="galeri-placeholder">RW 02</span>{/if}
              <span><strong>{g.judul || "Dokumentasi kegiatan"}</strong><small>{formatTanggal(g.tanggal) || g.keterangan || "Album kegiatan"}</small></span>
            </a>
          {/each}
        </div>
      {:else}<div class="empty"><b>Belum ada album foto.</b><span>Foto baru yang diunggah melalui Portal Petugas akan muncul di sini.</span></div>{/if}
    </section>

    <section class="video-section" id="video">
      <header class="section-head"><div><span>VIDEO</span><h2>Video Kegiatan</h2><p>Hanya video yang benar-benar ditambahkan Petugas yang ditampilkan.</p></div><a href="#/galeri">Buka Galeri Foto & Video →</a></header>
      {#if videoTampil.length}
        <div class="video-grid">
          {#each videoTampil as v}
            <a href={v.tautan || "#/berkas"} target={v.tautan ? "_blank" : undefined} rel={v.tautan ? "noopener noreferrer" : undefined}>
              <span class="video-icon">▶</span><span><strong>{v.judul || "Video kegiatan"}</strong><small>{formatTanggal(v.tgl || v.tanggal)}{v.ket ? ` · ${ringkas(v.ket, 80)}` : ""}</small></span>
            </a>
          {/each}
        </div>
      {:else}<div class="empty"><b>Belum ada video kegiatan.</b><span>Petugas dapat menambahkan tautan video, atau menggunakan upload langsung setelah konfigurasi Firebase Storage aktif.</span></div>{/if}
    </section>

    <section class="partisipasi">
      <div><span>SUARA WARGA</span><h2>Punya informasi, pertanyaan, atau usulan?</h2><p>Gunakan kanal warga yang memang tersedia. Diskusi publik dan pengaduan tetap tersimpan sebagai data terpisah dari berita.</p></div>
      <div><a href="#/forum">Buka Forum</a><a class="secondary" href="#/pengaduan">Sampaikan Pengaduan</a></div>
    </section>
  </main>
</div>

<style>
  .berita-page{--ink:#102f35;--muted:#60726d;--green:#087458;--line:#dce7e1;--paper:#f7faf7;width:100vw;margin-left:calc(50% - 50vw);margin-top:-32px;margin-bottom:-64px;background:radial-gradient(circle at 8% 35%,rgba(78,154,106,.07),transparent 22%),var(--paper);color:var(--ink);overflow:hidden}.berita-shell{width:min(1180px,calc(100% - 40px));margin-inline:auto}.berita-hero{position:relative;min-height:350px;display:flex;align-items:center;color:#fff;background:#173c35 var(--hero) center/cover no-repeat}.berita-hero-lapis{position:absolute;inset:0;background:linear-gradient(90deg,rgba(4,43,39,.92),rgba(7,55,48,.62) 54%,rgba(4,28,26,.25)),linear-gradient(180deg,rgba(3,23,22,.1),rgba(3,29,25,.42))}.berita-hero-grid{position:relative;z-index:1;display:grid;grid-template-columns:1fr 260px;gap:36px;align-items:center;padding:58px 0}.berita-hero-copy{max-width:690px}.eyebrow{margin:0 0 10px;color:#9de7cf;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.berita-hero h1{margin:0;font-family:Georgia,serif;font-size:clamp(45px,6vw,72px);line-height:.92;color:#a8efd5}.berita-hero h2{margin:8px 0 0;font-size:clamp(23px,3vw,34px);line-height:1.08}.berita-hero-copy>p:last-of-type{max-width:60ch;margin:15px 0 0;color:rgba(255,255,255,.86);line-height:1.6}.hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}.hero-actions a,.partisipasi a{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:9px 17px;border-radius:999px;background:linear-gradient(180deg,#15956e,#087458);border:1px solid #63d7b2;color:#fff;font-weight:750;text-decoration:none}.hero-actions a.secondary,.partisipasi a.secondary{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.42)}.berita-now{display:grid;gap:4px;padding:18px;border:1px solid rgba(255,255,255,.28);border-radius:15px;background:rgba(5,44,39,.56);backdrop-filter:blur(8px)}.berita-now small,.berita-now span{color:rgba(255,255,255,.74)}.berita-now strong{font-size:25px}.berita-main{padding-bottom:60px}.shortcut{position:relative;z-index:2;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:-22px;padding:10px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.96);box-shadow:0 18px 45px -34px rgba(21,61,48,.45)}.shortcut a{display:grid;grid-template-columns:42px 1fr;gap:10px;align-items:center;padding:9px;color:var(--ink);text-decoration:none;border-right:1px solid var(--line)}.shortcut a:last-child{border-right:0}.shortcut>b{}.shortcut a>b{display:grid;place-items:center;width:42px;height:42px;border-radius:10px;background:#e6f5ef;color:var(--green)}.shortcut strong,.shortcut small{display:block}.shortcut small{margin-top:2px;color:var(--muted);font-size:11px}.berita-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(310px,.75fr);gap:20px;margin-top:24px}.section-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-end;margin-bottom:12px}.section-head>div>span{color:var(--green);font-size:10px;font-weight:850;letter-spacing:.1em}.section-head h2{margin:2px 0 0;font-size:23px}.section-head p{margin:4px 0 0;color:var(--muted);font-size:12px}.section-head>a{color:var(--green);font-size:12px;font-weight:700;text-decoration:none}.section-head>small{color:var(--muted)}.utama-card{position:relative;min-height:420px;overflow:hidden;border-radius:18px;background:#183f38}.utama-card>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.utama-placeholder{position:absolute;inset:0;display:grid;place-items:center;align-content:center;color:#d8f2e8;font-size:44px;font-weight:850;background:linear-gradient(135deg,#194e43,#0a332d)}.utama-placeholder small{font-size:13px;font-weight:500}.utama-overlay{position:absolute;inset:0;background:linear-gradient(180deg,transparent 25%,rgba(5,31,28,.88) 90%)}.utama-copy{position:absolute;z-index:2;left:0;right:0;bottom:0;padding:26px;color:#fff}.badge,.agenda-kat{display:inline-flex;width:max-content;padding:5px 8px;border-radius:999px;background:#e7f6ef;color:#087458;font-size:10px;font-weight:800}.utama-copy h3{max-width:780px;margin:10px 0 4px;font-size:clamp(22px,3vw,34px);line-height:1.12}.utama-copy time{color:rgba(255,255,255,.75);font-size:11px}.utama-copy p{max-width:68ch;margin:9px 0 15px;color:rgba(255,255,255,.88);line-height:1.55}.utama-copy a{color:#fff;font-weight:750;text-decoration:none}.terbaru-wrap{padding:18px;border:1px solid var(--line);border-radius:18px;background:#fff}.terbaru-list{display:grid}.terbaru-list>a{display:grid;grid-template-columns:88px 1fr auto;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid #edf1ef;color:var(--ink);text-decoration:none}.terbaru-list>a:last-child{border-bottom:0}.terbaru-list img,.thumb-placeholder{width:88px;height:66px;border-radius:10px;object-fit:cover}.thumb-placeholder{display:grid;place-items:center;background:#edf5f1;color:#0a765d;font-weight:850}.terbaru-copy{display:grid;gap:4px}.terbaru-copy small{color:#72827c;font-size:10px}.terbaru-copy strong{font-size:13px;line-height:1.3}.terbaru-copy em{color:var(--muted);font-size:10.5px;font-style:normal;line-height:1.4}.agenda-section,.galeri-section,.video-section{margin-top:30px}.agenda-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.agenda-grid article{display:grid;grid-template-columns:66px 1fr;gap:14px;padding:16px;border:1px solid var(--line);border-radius:15px;background:#fff}.agenda-grid time{display:grid;place-items:center;align-content:center;border-radius:11px;background:#eaf6f1;color:var(--green)}.agenda-grid time b{font-size:24px}.agenda-grid time span{font-size:10px;text-transform:uppercase}.agenda-grid h3{margin:7px 0 5px;font-size:15px}.agenda-grid p,.agenda-grid small{display:block;margin:0;color:var(--muted);font-size:11px;line-height:1.45}.galeri-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.galeri-grid>a{position:relative;min-height:190px;overflow:hidden;border-radius:14px;background:#eaf2ee;color:#fff;text-decoration:none}.galeri-grid img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.galeri-grid>a::after{content:"";position:absolute;inset:35% 0 0;background:linear-gradient(transparent,rgba(5,32,28,.85))}.galeri-grid>a>span:last-child{position:absolute;z-index:2;left:14px;right:14px;bottom:13px;display:grid;gap:3px}.galeri-grid small{color:rgba(255,255,255,.76)}.galeri-placeholder{position:absolute;inset:0;display:grid;place-items:center;color:#0b765d;font-size:24px;font-weight:850}.video-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.video-grid>a{display:grid;grid-template-columns:52px 1fr;gap:12px;align-items:center;padding:16px;border:1px solid var(--line);border-radius:14px;background:#fff;color:var(--ink);text-decoration:none}.video-icon{display:grid;place-items:center;width:52px;height:52px;border-radius:50%;background:#e7f5ef;color:var(--green)}.video-grid>a>span:last-child{display:grid;gap:5px}.video-grid small{color:var(--muted);line-height:1.4}.partisipasi{display:flex;justify-content:space-between;gap:24px;align-items:center;margin-top:32px;padding:24px;border-radius:18px;background:linear-gradient(135deg,#0c634d,#0a4438);color:#fff}.partisipasi>div:first-child>span{font-size:10px;font-weight:800;color:#8be0c3}.partisipasi h2{margin:4px 0}.partisipasi p{max-width:65ch;margin:0;color:rgba(255,255,255,.8)}.partisipasi>div:last-child{display:flex;gap:8px;flex-wrap:wrap}.empty{display:grid;gap:5px;padding:26px;border:1px dashed #cbdad3;border-radius:14px;background:#fff;color:var(--muted)}.empty b{color:var(--ink)}.empty.mini{padding:16px}@media(max-width:900px){.berita-hero-grid{grid-template-columns:1fr}.berita-now{width:min(320px,100%)}.shortcut{grid-template-columns:1fr 1fr}.shortcut a:nth-child(2){border-right:0}.berita-grid{grid-template-columns:1fr}.galeri-grid,.video-grid{grid-template-columns:1fr 1fr}.partisipasi{align-items:flex-start;flex-direction:column}}@media(max-width:620px){.berita-shell{width:min(100% - 24px,1180px)}.berita-hero{min-height:390px}.berita-hero-grid{padding:45px 0 55px}.shortcut{grid-template-columns:1fr;margin-top:-30px}.shortcut a{border-right:0;border-bottom:1px solid var(--line)}.shortcut a:last-child{border-bottom:0}.agenda-grid,.galeri-grid,.video-grid{grid-template-columns:1fr}.utama-card{min-height:390px}.utama-copy{padding:20px}.terbaru-list>a{grid-template-columns:72px 1fr auto}.terbaru-list img,.thumb-placeholder{width:72px;height:58px}.section-head{align-items:flex-start;flex-direction:column}.partisipasi{padding:20px}}
</style>