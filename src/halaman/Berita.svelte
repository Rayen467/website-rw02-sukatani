<script>
  import { onMount } from "svelte";
  import { isi, muatKonten, konten, muatSuara, muatKoleksi } from "../keadaan/isi.svelte.js";
  import { waktu } from "../keadaan/waktu.svelte.js";
  import { gambarWaktuAbsolut } from "../inti/waktu.js";
  import { KONTEN, KOLEKSI } from "../inti/nama.js";
  import { POLLING_BAWAAN } from "../inti/bawaan.js";
  import { keDaftar } from "../inti/format.js";

  const KALENDER_KEY = "kalender";
  const SLOT4 = [0, 1, 2, 3];
  let indeksSorotan = $state(0);

  const gambarHero = $derived(gambarWaktuAbsolut(waktu.fase));
  const semuaPublikasi = $derived(isi.pengumuman || []);
  const daftar = $derived(semuaPublikasi.filter((x) => x?.tipe !== "agenda"));
  const galeri = $derived(isi.galeri || []);
  const video = $derived((isi.berkas || []).filter((d) => d?.kategori === "video"));
  const topikForum = $derived((isi.forum_topik || []).filter((x) => x?.status !== "dihapus"));
  const komentarForum = $derived((isi.forum_komentar || []).filter((x) => x?.status !== "dihapus"));

  onMount(() => {
    muatKonten(KALENDER_KEY);
    muatSuara();
    muatKoleksi(KOLEKSI.FORUM_TOPIK);
    muatKoleksi(KOLEKSI.FORUM_KOMENTAR);
  });

  function parse(teks) {
    try {
      const v = JSON.parse(String(teks || ""));
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }

  function ringkas(teks, maks = 120) {
    const t = String(teks || "").replace(/\s+/g, " ").trim();
    if (!t) return "";
    return t.length > maks ? `${t.slice(0, maks - 1).trimEnd()}…` : t;
  }

  function formatTanggal(teks) {
    if (!teks) return "";
    const d = new Date(`${String(teks).slice(0, 10)}T00:00:00`);
    if (Number.isNaN(d.getTime())) return String(teks);
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(d);
  }

  function tanggalIso(k) {
    return String(k?.tgl || k?.tanggal || "").slice(0, 10);
  }

  function tanggalPublik(k) {
    return k?.tglText || formatTanggal(k?.tgl || k?.tanggal || "");
  }

  function kategoriBerita(k) {
    return k?.kategori || (String(k?.penting) === "true" ? "Penting" : "Informasi");
  }

  function gambarKabar(k) {
    return k?.foto || k?.sampul || "";
  }

  function hrefBerita(k) {
    return k?.id ? `#/berita/${k.id}` : "#/berita";
  }

  function bulanPendek(teks) {
    if (!teks) return "";
    const d = new Date(`${String(teks).slice(0, 10)}T00:00:00`);
    if (Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("id-ID", { month: "short" }).format(d).replace(".", "").toUpperCase();
  }

  function hariTanggal(teks) {
    return String(teks || "").slice(8, 10) || "--";
  }

  function hitungBalasan(id) {
    return komentarForum.filter((k) => k?.topikId === id).length;
  }

  const beritaAktif = $derived([...daftar].sort((a, b) => tanggalIso(b).localeCompare(tanggalIso(a))));
  const sorotan = $derived(beritaAktif.slice(0, 4));
  const unggulan = $derived(sorotan[indeksSorotan] || sorotan[0] || null);
  const terbaru = $derived(beritaAktif.filter((k) => k?.id !== unggulan?.id).slice(0, 4));

  $effect(() => {
    if (sorotan.length && indeksSorotan >= sorotan.length) indeksSorotan = 0;
  });

  function geserSorotan(arah) {
    if (!sorotan.length) return;
    indeksSorotan = (indeksSorotan + arah + sorotan.length) % sorotan.length;
  }

  const acaraKelola = $derived.by(() => {
    const dok = isi.konten?.[KALENDER_KEY] || {};
    return parse(dok.acara).filter((a) => a && String(a.tampil) !== "false");
  });

  const agendaBerita = $derived(
    semuaPublikasi
      .filter((k) => k?.tipe === "agenda" && k?.tanggal)
      .map((k) => ({
        id: `berita-${k.id}`,
        judul: k.judul,
        tanggal: k.tanggal,
        mulai: k.mulai || "",
        selesai: k.selesai || "",
        tempat: k.tempat || ""
      }))
  );

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
      .filter((a) => a?.tanggal && a.tanggal >= isoHariIni)
      .sort((a, b) => String(a.tanggal).localeCompare(String(b.tanggal)) || String(a.mulai || "").localeCompare(String(b.mulai || "")))
      .slice(0, 4);
  });

  const kalenderMini = $derived.by(() => {
    const sekarang = new Date();
    const tahun = sekarang.getFullYear();
    const bulan = sekarang.getMonth();
    const pertama = new Date(tahun, bulan, 1);
    const jumlahHari = new Date(tahun, bulan + 1, 0).getDate();
    const offset = (pertama.getDay() + 6) % 7;
    const aktif = new Set(
      agendaTerdekat
        .map((a) => String(a.tanggal || ""))
        .filter((t) => t.startsWith(`${tahun}-${String(bulan + 1).padStart(2, "0")}-`))
        .map((t) => Number(t.slice(8, 10)))
    );
    const sel = [];
    for (let i = 0; i < offset; i += 1) sel.push(null);
    for (let hari = 1; hari <= jumlahHari; hari += 1) sel.push(hari);
    while (sel.length % 7) sel.push(null);
    return {
      judul: new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(sekarang),
      hariIni: sekarang.getDate(),
      sel,
      aktif
    };
  });

  const galeriTampil = $derived(galeri.slice(0, 5));
  const videoUtama = $derived(video[0] || null);
  const topikTampil = $derived(topikForum.slice(0, 5));

  const polling = $derived.by(() => {
    const k = konten(KONTEN.POLLING);
    if (k && k.pertanyaan) {
      return {
        id: k.id || POLLING_BAWAAN.id,
        pertanyaan: k.pertanyaan,
        keterangan: k.keterangan || "",
        opsi: keDaftar(k.opsi)
      };
    }
    return POLLING_BAWAAN;
  });

  const suara = $derived(isi.suara);
  const totalSuara = $derived(suara ? (suara.hitung || []).reduce((a, n) => a + Number(n || 0), 0) : 0);
  const hasilPolling = $derived(
    (polling.opsi || []).slice(0, 4).map((label, i) => {
      const jumlah = Number(suara?.hitung?.[i] || 0);
      return { label, jumlah, persen: totalSuara ? Math.round((jumlah / totalSuara) * 100) : 0 };
    })
  );
</script>

<div class="kabar-page">
  <section class="kabar-hero" style={`--hero:url('${gambarHero}')`}>
    <div class="hero-shade"></div>
    <div class="shell hero-layout">
      <div class="hero-copy">
        <div class="hero-kicker"><span>→</span> Informasi &amp; Kabar Terkini</div>
        <h1>Kabar RW 02 Sukatani</h1>
        <h2>Bersama Membangun Lingkungan yang<br class="desktop-break" /> Lebih Baik, Guyub, Maju, dan Sejahtera</h2>
        <p>Portal informasi resmi warga RW 02 Sukatani. Dapatkan berita, agenda, layanan, dokumentasi, dan suara warga dalam satu halaman yang mudah dipahami.</p>
        <div class="hero-actions">
          <a class="primary" href="#berita-utama">Jelajahi Berita <span>→</span></a>
          <a class="secondary" href="#galeri"><span class="play">▶</span> Foto &amp; Video RW 02</a>
        </div>
      </div>
      <aside class="hero-side">
        <div class="clock-card">
          <small>{waktu.tanggal}</small>
          <strong>{waktu.jam} WIB</strong>
          <span>Permai Sukatani · Rajeg</span>
        </div>
        <blockquote>
          <b>“</b>
          <p>Lingkungan yang bersih, aman, dan harmonis adalah tanggung jawab kita bersama. Mari terus bergotong royong demi RW 02 Sukatani yang lebih baik.</p>
          <footer>— RW 02 Sukatani</footer>
        </blockquote>
      </aside>
    </div>
  </section>

  <main class="shell kabar-main">
    <nav class="quick-menu" aria-label="Navigasi informasi dan komunikasi">
      <a href="#berita-utama"><span class="qicon orange">📣</span><span><strong>Pengumuman</strong><small>Info penting untuk warga</small></span></a>
      <a href="#agenda"><span class="qicon mint">▦</span><span><strong>Kalender Kegiatan</strong><small>Agenda dan jadwal RW</small></span></a>
      <a href="#galeri"><span class="qicon green">▣</span><span><strong>Galeri</strong><small>Foto &amp; video kegiatan</small></span></a>
      <a href="#suara-warga"><span class="qicon teal">▤</span><span><strong>Suara Warga</strong><small>Polling &amp; diskusi</small></span></a>
    </nav>

    <section class="news-layout" id="berita-utama">
      <div class="section-col main-news-col">
        <header class="section-head">
          <div><span class="head-icon orange">▣</span><h2>Berita Utama</h2></div>
          <a href="#/berita">Lihat Semua Berita <span>→</span></a>
        </header>
        {#if unggulan}
          <article class="featured-news">
            <img src={gambarKabar(unggulan) || gambarHero} alt={unggulan.judul || "Berita RW 02"} />
            <div class="featured-overlay"></div>
            <div class="featured-copy">
              <span class="tag">{kategoriBerita(unggulan)}</span>
              <h3>{unggulan.judul}</h3>
              <div class="meta">◷ {tanggalPublik(unggulan) || "Publikasi RW 02"} <span>•</span> RW 02 Sukatani</div>
              <p>{ringkas(unggulan.ringkas || unggulan.isi, 165)}</p>
              <div class="featured-foot">
                <a href={hrefBerita(unggulan)}>Baca Selengkapnya <span>→</span></a>
                <div class="slider-nav">
                  <small>{String(indeksSorotan + 1).padStart(2, "0")} / {String(Math.max(sorotan.length, 1)).padStart(2, "0")}</small>
                  <button type="button" aria-label="Sebelumnya" onclick={() => geserSorotan(-1)}>←</button>
                  <button type="button" aria-label="Berikutnya" onclick={() => geserSorotan(1)}>→</button>
                </div>
              </div>
            </div>
          </article>
        {:else}
          <article class="featured-news empty-featured" style={`--empty-bg:url('${gambarHero}')`}>
            <div class="featured-overlay"></div>
            <div class="featured-copy">
              <span class="tag">INFORMASI</span>
              <h3>Belum ada berita yang diterbitkan</h3>
              <p>Berita dari Portal Petugas akan tampil di area ini tanpa mengubah ukuran layout.</p>
              <div class="featured-foot"><a href="#/berita">Lihat halaman berita <span>→</span></a></div>
            </div>
          </article>
        {/if}
      </div>

      <aside class="section-col latest-col">
        <header class="section-head">
          <div><span class="head-icon mint">▤</span><h2>Berita Terbaru</h2></div>
          <a href="#/berita">Lihat Semua <span>→</span></a>
        </header>
        <div class="latest-list">
          {#each SLOT4 as i}
            {#if terbaru[i]}
              <a class="latest-card" href={hrefBerita(terbaru[i])}>
                <span class="latest-thumb">{#if gambarKabar(terbaru[i])}<img src={gambarKabar(terbaru[i])} alt="" />{:else}<span>RW02</span>{/if}</span>
                <span class="latest-copy">
                  <small><b>{kategoriBerita(terbaru[i])}</b> {tanggalPublik(terbaru[i])}</small>
                  <strong>{terbaru[i].judul}</strong>
                  <em>{ringkas(terbaru[i].ringkas || terbaru[i].isi, 64) || "Baca informasi selengkapnya"}</em>
                </span>
                <span class="chevron">›</span>
              </a>
            {:else}
              <div class="latest-card placeholder-row">
                <span class="latest-thumb placeholder-thumb">RW02</span>
                <span class="latest-copy"><small><b>INFORMASI</b></small><strong>Berita berikutnya akan tampil di sini</strong><em>Menunggu publikasi Petugas</em></span>
                <span class="chevron">›</span>
              </div>
            {/if}
          {/each}
        </div>
      </aside>
    </section>

    <section class="agenda-layout" id="agenda">
      <div class="agenda-main">
        <header class="section-head with-sub">
          <div><span class="head-icon mint">▦</span><span><h2>Kalender Kegiatan</h2><p>Agenda kegiatan RW 02 yang akan datang.</p></span></div>
          <a href="#/kalender">Lihat Kalender Lengkap <span>→</span></a>
        </header>
        <div class="agenda-grid">
          {#each SLOT4 as i}
            {#if agendaTerdekat[i]}
              <article class="agenda-card">
                <time datetime={agendaTerdekat[i].tanggal}><b>{hariTanggal(agendaTerdekat[i].tanggal)}</b><span>{bulanPendek(agendaTerdekat[i].tanggal)}</span></time>
                <div class="agenda-copy">
                  <h3>{agendaTerdekat[i].judul}</h3>
                  <p>◷ {agendaTerdekat[i].mulai ? `${agendaTerdekat[i].mulai}${agendaTerdekat[i].selesai ? ` – ${agendaTerdekat[i].selesai}` : ""} WIB` : "Waktu menyusul"}</p>
                  <p>● {agendaTerdekat[i].tempat || "Lokasi diinformasikan"}</p>
                  <a href="#/kalender">Lihat agenda</a>
                </div>
              </article>
            {:else}
              <article class="agenda-card placeholder-agenda"><time><b>--</b><span>RW</span></time><div class="agenda-copy"><h3>Agenda berikutnya</h3><p>◷ Jadwal menyusul</p><p>● RW 02 Sukatani</p><a href="#/kalender">Lihat agenda</a></div></article>
            {/if}
          {/each}
        </div>
      </div>

      <aside class="mini-calendar">
        <header><button type="button" aria-label="Bulan sebelumnya">‹</button><strong>{kalenderMini.judul}</strong><button type="button" aria-label="Bulan berikutnya">›</button></header>
        <div class="day-head"><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span></div>
        <div class="date-grid">
          {#each kalenderMini.sel as hari}
            {#if hari}<span class:has-event={kalenderMini.aktif.has(hari)} class:today={hari === kalenderMini.hariIni}>{hari}</span>{:else}<i></i>{/if}
          {/each}
        </div>
        <footer><span><i class="dot event"></i>Ada kegiatan</span><span><i class="dot now"></i>Hari ini</span></footer>
      </aside>
    </section>

    <section class="gallery-section" id="galeri">
      <header class="section-head with-sub">
        <div><span class="head-icon mint">▣</span><span><h2>Galeri Foto &amp; Video</h2><p>Dokumentasi kegiatan, pembangunan, dan momen kebersamaan warga.</p></span></div>
        <a href="#/galeri">Lihat Semua Galeri <span>→</span></a>
      </header>
      <div class="gallery-grid">
        {#each [0,1,2,3,4] as i}
          {#if galeriTampil[i]}
            <a class="gallery-card" href="#/galeri">
              {#if galeriTampil[i].sampul || galeriTampil[i].foto}<img src={galeriTampil[i].sampul || galeriTampil[i].foto} alt={galeriTampil[i].judul || "Galeri RW 02"} />{:else}<span class="gallery-fallback">RW 02</span>{/if}
              <span class="gallery-overlay"></span>
              <strong>{galeriTampil[i].judul || "Dokumentasi RW 02"}</strong>
              <small>{formatTanggal(galeriTampil[i].tanggal) || "RW 02 Sukatani"}</small>
            </a>
          {:else}
            <a class="gallery-card placeholder-gallery" href="#/galeri" style={`--gallery-bg:url('${gambarHero}')`}><span class="gallery-overlay"></span><strong>Dokumentasi RW 02</strong><small>Foto kegiatan akan tampil di sini</small></a>
          {/if}
        {/each}
        <a class="gallery-card video-card" href={videoUtama?.tautan || "#/galeri"} style={`--gallery-bg:url('${gambarHero}')`}>
          <span class="gallery-overlay"></span><span class="big-play">▶</span>
          <strong>{videoUtama?.judul || "Video Kegiatan RW 02"}</strong>
          <small>{videoUtama ? (formatTanggal(videoUtama.tgl || videoUtama.tanggal) || "Dokumentasi video") : "Video pengurus akan tampil di sini"}</small>
        </a>
      </div>
    </section>

    <section class="community-layout" id="suara-warga">
      <article class="community-col poll-col">
        <header class="section-head with-sub compact-head"><div><span class="head-icon mint">▥</span><span><h2>Suara Warga</h2><p>Polling untuk membangun lingkungan yang lebih baik.</p></span></div></header>
        <div class="white-panel poll-panel">
          <div class="poll-head"><span>POLLING</span><small>{ringkas(polling.keterangan || "Hasil polling menjadi bahan musyawarah", 42)}</small></div>
          <h3>{polling.pertanyaan}</h3>
          <div class="poll-list">
            {#if hasilPolling.length}
              {#each hasilPolling as opsi}
                <div class="poll-row"><span class="radio"></span><span class="poll-label">{opsi.label}</span><span class="bar"><i style={`width:${opsi.persen}%`}></i></span><b>{opsi.persen}%</b></div>
              {/each}
            {:else}
              <div class="poll-empty">Opsi polling akan tampil di sini.</div>
            {/if}
          </div>
          <footer><span>Total {totalSuara} suara</span><a href="#/forum">Lihat Hasil Lengkap →</a></footer>
        </div>
      </article>

      <article class="community-col forum-col">
        <header class="section-head with-sub compact-head"><div><span class="head-icon mint">▤</span><span><h2>Forum Diskusi</h2><p>Temukan topik menarik dan sampaikan pendapat Anda.</p></span></div><a href="#/forum">Lihat Semua Diskusi →</a></header>
        <div class="white-panel forum-panel">
          <div class="start-discussion"><span class="chat-dot">◉</span><span><strong>Ada berita atau informasi penting?</strong><small>Mulai diskusi dengan warga lainnya.</small></span><a href="#/forum">＋ Buat Diskusi</a></div>
          <div class="topic-list">
            <b>Topik Terbaru:</b>
            {#if topikTampil.length}
              {#each topikTampil as t}<a href="#/forum"><span>◌</span><strong>{t.judul}</strong><small>{hitungBalasan(t.id)} komentar</small></a>{/each}
            {:else}
              <p>Belum ada topik diskusi. Warga dapat memulai percakapan pertama dari halaman Forum.</p>
            {/if}
          </div>
        </div>
      </article>

      <a class="contribution-card" href="#/forum" style={`--contribution:url('${gambarHero}')`}>
        <span class="contribution-overlay"></span>
        <strong>Lingkungan<br />Harmonis,<br />Warga Bahagia</strong>
        <span class="contribution-btn">Ayo Berkontribusi →</span>
      </a>
    </section>
  </main>
</div>

<style>
  :global(body){overflow-x:hidden}
  .kabar-page{--ink:#0d3151;--green:#087b64;--deep:#024c42;--mint:#dff5ed;--line:#dce8e4;width:100vw;margin-left:calc(50% - 50vw);margin-top:-32px;margin-bottom:-64px;background:#fff!important;color:var(--ink);overflow:hidden}
  .shell{width:min(1210px,calc(100% - 38px));margin-inline:auto}
  .kabar-hero{position:relative;min-height:356px;background:#0a5548 var(--hero) center/cover no-repeat;color:#fff}
  .hero-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(2,47,42,.94) 0%,rgba(2,72,62,.78) 48%,rgba(1,37,32,.34) 75%,rgba(1,26,23,.58) 100%)}
  .hero-layout{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:38px;align-items:center;padding:40px 0 52px}
  .hero-copy{max-width:720px}.hero-kicker{display:flex;align-items:center;gap:8px;margin-bottom:10px;font-size:12px;font-weight:800}.hero-kicker span{width:25px;height:25px;display:grid;place-items:center;border:1px solid #f4db38;border-radius:50%;color:#ffe75a}
  .hero-copy h1{margin:0;color:#fff;font-size:clamp(43px,5vw,64px);line-height:.96;letter-spacing:-.05em;font-weight:900}.hero-copy h2{margin:7px 0 8px;color:#72e8c7;font-size:clamp(19px,2vw,27px);line-height:1.1;letter-spacing:-.025em}.hero-copy p{max-width:660px;margin:0;color:rgba(255,255,255,.92);font-size:13px;line-height:1.55}.hero-actions{display:flex;gap:11px;flex-wrap:wrap;margin-top:16px}.hero-actions a{height:42px;display:inline-flex;align-items:center;gap:12px;padding:0 21px;border:1px solid rgba(255,255,255,.88);border-radius:999px;color:#fff;text-decoration:none;font-size:12px;font-weight:850}.hero-actions .primary{background:linear-gradient(180deg,#11b38d,#06856b)}.hero-actions .secondary{background:rgba(3,43,38,.48)}.play{width:23px;height:23px;display:grid;place-items:center;border:1px solid #fff;border-radius:50%;font-size:9px}
  .hero-side{display:grid;gap:12px}.clock-card{justify-self:end;width:228px;padding:13px 16px;border:1px solid rgba(255,255,255,.32);border-radius:14px;background:rgba(4,55,49,.76);backdrop-filter:blur(8px)}.clock-card small,.clock-card span{display:block;color:#dceae6;font-size:10px}.clock-card strong{display:block;margin:3px 0;font-size:25px;line-height:1}.hero-side blockquote{position:relative;margin:0;padding:18px 17px 16px 48px;border:1px solid rgba(255,255,255,.34);border-radius:14px;background:rgba(2,57,50,.78);backdrop-filter:blur(8px)}.hero-side blockquote>b{position:absolute;left:15px;top:5px;font:700 40px/1 Georgia,serif}.hero-side blockquote p{margin:0;font-size:12px;line-height:1.48;color:#fff}.hero-side blockquote footer{margin-top:7px;text-align:right;color:#d2e4df;font-size:10px}
  .kabar-main{position:relative!important;z-index:3!important;margin-top:-22px!important;padding:0 0 58px!important;background:#fff!important;color:var(--ink)!important}
  .quick-menu{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding:9px;border:1px solid #e2ebe7;border-radius:16px;background:#fff!important;box-shadow:0 12px 30px rgba(25,70,58,.1)}.quick-menu>a{min-width:0;height:67px;display:grid;grid-template-columns:45px minmax(0,1fr);align-items:center;gap:10px;padding:7px 10px;border-radius:11px;color:var(--ink)!important;text-decoration:none;background:#fff!important}.quick-menu>a:hover{background:#f6faf8!important}.qicon{width:43px;height:43px;display:grid;place-items:center;border-radius:11px;font-size:20px}.qicon.orange{background:#fff0db;color:#e67820}.qicon.mint,.qicon.green,.qicon.teal{background:#dcf5ed;color:#08715d}.quick-menu strong,.quick-menu small{display:block}.quick-menu strong{font-size:12px}.quick-menu small{margin-top:2px;color:#708293;font-size:9px}
  .section-head{height:36px;display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:8px;background:transparent!important}.section-head>div{display:flex;align-items:center;gap:8px;min-width:0}.section-head h2{margin:0;color:#0c315a!important;font-size:20px;line-height:1.05;letter-spacing:-.03em}.section-head p{margin:2px 0 0;color:#718394!important;font-size:9px;line-height:1.2}.section-head>a{color:#08785f!important;text-decoration:none;font-size:9px;font-weight:850;white-space:nowrap}.head-icon{width:30px;height:30px;display:grid;place-items:center;border-radius:9px;font-size:14px}.head-icon.orange{background:#fff0db;color:#e87820}.head-icon.mint{background:#dff6ef;color:#08725d}.with-sub{height:42px}.with-sub>div>span:last-child{display:block}
  .news-layout{display:grid!important;grid-template-columns:minmax(0,1.28fr) minmax(360px,.92fr)!important;gap:22px!important;padding-top:14px!important;background:#fff!important}.section-col{min-width:0;background:transparent!important}.featured-news{position:relative!important;height:360px!important;border-radius:12px!important;overflow:hidden!important;background:#0b5146 var(--empty-bg) center/cover no-repeat!important;box-shadow:0 8px 22px rgba(20,66,55,.12)!important}.featured-news>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.featured-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,24,21,.04) 24%,rgba(2,31,28,.9) 100%)}.featured-copy{position:absolute;inset:auto 0 0;padding:20px;color:#fff}.tag{display:inline-flex;padding:4px 9px;border-radius:6px;background:#ffd64f;color:#183737;font-size:8px;font-weight:900;text-transform:uppercase}.featured-copy h3{max-width:630px;margin:7px 0 7px;color:#fff!important;font-size:clamp(22px,2.4vw,31px);line-height:1.07;letter-spacing:-.03em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.meta{font-size:9px;color:#edf7f4}.meta span{margin:0 5px}.featured-copy p{max-width:600px;height:36px;margin:7px 0 11px;color:#e6f0ed!important;font-size:10px;line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.featured-foot{height:37px;display:flex;align-items:center;justify-content:space-between;gap:14px}.featured-foot>a{height:34px;display:inline-flex;align-items:center;gap:9px;padding:0 15px;border:1px solid #d7fff3;border-radius:999px;background:#07866c;color:#fff!important;text-decoration:none;font-size:10px;font-weight:850}.slider-nav{display:flex;align-items:center;gap:7px}.slider-nav small{font-size:9px;font-weight:800}.slider-nav button{width:31px;height:31px;border:1px solid rgba(255,255,255,.85);border-radius:50%;background:rgba(3,44,39,.55);color:#fff;cursor:pointer}.empty-featured{background-image:linear-gradient(180deg,rgba(2,45,39,.18),rgba(2,35,31,.82)),var(--empty-bg)!important}
  .latest-list{height:360px;display:grid!important;grid-template-rows:repeat(4,1fr)!important;gap:7px!important;background:transparent!important}.latest-card{min-height:0!important;height:auto!important;display:grid!important;grid-template-columns:116px minmax(0,1fr) 16px!important;gap:10px!important;align-items:center!important;padding:7px!important;border:1px solid #e2eae7!important;border-radius:10px!important;background:#fff!important;color:var(--ink)!important;text-decoration:none!important;overflow:hidden!important;box-shadow:0 5px 14px rgba(25,70,58,.045)!important}.latest-thumb{height:68px!important;display:grid;place-items:center;overflow:hidden;border-radius:7px;background:#e1f3ed;color:#08705b;font-size:11px;font-weight:900}.latest-thumb img{width:100%;height:100%;object-fit:cover}.latest-copy{min-width:0}.latest-copy small{height:16px;display:block;overflow:hidden;color:#7a8996;font-size:8px;white-space:nowrap;text-overflow:ellipsis}.latest-copy small b{display:inline-block;margin-right:5px;padding:2px 5px;border-radius:999px;background:#dff5ea;color:#08705b;font-size:7px}.latest-copy strong{height:29px;display:-webkit-box;margin:2px 0;color:#0c315a!important;font-size:11px;line-height:1.27;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.latest-copy em{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#6e8090;font-size:8px;font-style:normal}.chevron{font-size:20px;color:#0b685b}.placeholder-row{opacity:.78}.placeholder-thumb{font-size:10px}
  .agenda-layout{display:grid!important;grid-template-columns:minmax(0,1fr) 255px!important;gap:15px!important;margin-top:16px!important;background:#fff!important}.agenda-main{min-width:0;background:#fff!important}.agenda-grid{height:112px;display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:8px!important}.agenda-card{min-width:0!important;height:112px!important;display:grid!important;grid-template-columns:49px minmax(0,1fr)!important;gap:8px!important;padding:8px!important;border:1px solid #e2ebe7!important;border-radius:10px!important;background:#fff!important;overflow:hidden!important;box-shadow:0 5px 14px rgba(25,70,58,.045)!important}.agenda-card time{width:46px;height:46px;display:grid;place-items:center;align-content:center;border-radius:9px;background:linear-gradient(180deg,#0c6659,#06443c);color:#fff}.agenda-card time b{font-size:18px;line-height:1}.agenda-card time span{margin-top:1px;font-size:8px;font-weight:900}.agenda-copy{min-width:0;overflow:hidden}.agenda-copy h3{height:28px;margin:0 0 5px;color:#0c315a!important;font-size:10px;line-height:1.2;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.agenda-copy p{height:13px;margin:1px 0;color:#687d8e!important;font-size:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.agenda-copy>a{display:inline-flex;margin-top:4px;padding:4px 7px;border-radius:5px;background:#dcf5ed;color:#08725c!important;text-decoration:none;font-size:7px;font-weight:850}.placeholder-agenda{opacity:.75}
  .mini-calendar{height:162px!important;padding:10px 12px!important;border:1px solid #e1ebe7!important;border-radius:11px!important;background:#fff!important;color:#0c315a!important;box-shadow:0 5px 14px rgba(25,70,58,.045)!important;overflow:hidden!important}.mini-calendar>header{height:20px;display:flex;align-items:center;justify-content:space-between}.mini-calendar>header strong{font-size:10px;text-transform:capitalize}.mini-calendar button{border:0;background:transparent;color:#0c315a;cursor:pointer}.day-head,.date-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center}.day-head span{padding:2px 0;color:#728392;font-size:6px}.date-grid span,.date-grid i{height:19px;display:grid;place-items:center;border-radius:50%;font-size:7px;font-style:normal}.date-grid span.has-event{background:#0c7561;color:#fff;font-weight:900}.date-grid span.today:not(.has-event){background:#dff5ed;color:#08705b;font-weight:900}.mini-calendar footer{height:18px;display:flex;align-items:end;gap:8px;color:#718394;font-size:6px}.mini-calendar footer span{display:flex;align-items:center;gap:3px}.dot{width:6px;height:6px;border-radius:50%}.dot.event{background:#0c7561}.dot.now{background:#bcebdd}
  .gallery-section{margin-top:16px!important;background:#fff!important}.gallery-grid{height:126px!important;display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:7px!important}.gallery-card{position:relative!important;min-width:0!important;height:126px!important;display:flex!important;flex-direction:column!important;justify-content:end!important;padding:9px!important;border-radius:9px!important;overflow:hidden!important;background:#0b5146 var(--gallery-bg) center/cover no-repeat!important;color:#fff!important;text-decoration:none!important}.gallery-card>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.gallery-overlay{position:absolute;inset:0;background:linear-gradient(180deg,transparent 35%,rgba(2,31,28,.88) 100%)}.gallery-card strong,.gallery-card small{position:relative;z-index:2}.gallery-card strong{height:24px;display:-webkit-box;color:#fff!important;font-size:9px;line-height:1.2;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.gallery-card small{height:12px;margin-top:2px;color:#e5f2ee!important;font-size:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.gallery-fallback{position:absolute;inset:0;display:grid;place-items:center;background:#dff4ed;color:#08705a;font-weight:900}.placeholder-gallery{background-image:linear-gradient(180deg,rgba(2,55,48,.08),rgba(2,40,35,.55)),var(--gallery-bg)!important}.big-play{position:absolute;z-index:2;left:50%;top:43%;transform:translate(-50%,-50%);width:42px;height:42px;display:grid;place-items:center;border:2px solid #fff;border-radius:50%;background:rgba(0,41,36,.5);font-size:14px}
  .community-layout{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr) 200px!important;gap:13px!important;margin-top:16px!important;background:#fff!important}.community-col{min-width:0;background:#fff!important}.compact-head{height:42px}.white-panel{height:207px!important;padding:11px!important;border:1px solid #e0eae6!important;border-radius:10px!important;background:#fff!important;color:var(--ink)!important;overflow:hidden!important;box-shadow:0 5px 14px rgba(25,70,58,.045)!important}.poll-head{height:25px;display:flex;align-items:center;justify-content:space-between;gap:8px}.poll-head>span{padding:3px 8px;border-radius:999px;background:#12aa79;color:#fff;font-size:7px;font-weight:900}.poll-head small{max-width:180px;padding:3px 7px;border-radius:999px;background:#ddf4ed;color:#377364;font-size:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.poll-panel>h3{height:34px;margin:5px 0 7px;color:#0c315a!important;font-size:12px;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.poll-list{height:92px;display:grid;align-content:start;gap:5px;overflow:hidden}.poll-row{display:grid;grid-template-columns:10px minmax(85px,.95fr) minmax(65px,1.15fr) 28px;gap:5px;align-items:center;font-size:8px}.radio{width:9px;height:9px;border:1px solid #09836a;border-radius:50%}.poll-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bar{height:8px;overflow:hidden;border-radius:999px;background:#edf2f5}.bar i{display:block;height:100%;border-radius:999px;background:#a6e4d4}.poll-row b{text-align:right;color:#0c315a}.poll-empty{padding:20px;text-align:center;color:#788995;font-size:9px}.white-panel>footer{height:20px;display:flex;align-items:end;justify-content:space-between;gap:8px;color:#708395;font-size:7px}.white-panel>footer a{color:#08745c!important;text-decoration:none;font-weight:850}
  .start-discussion{height:55px;display:grid;grid-template-columns:31px minmax(0,1fr) auto;gap:8px;align-items:center;padding:7px;border-radius:8px;background:linear-gradient(90deg,#eef9f6,#f9fffd)}.chat-dot{width:29px;height:29px;display:grid;place-items:center;border-radius:50%;background:#178be9;color:#fff}.start-discussion strong,.start-discussion small{display:block}.start-discussion strong{font-size:9px}.start-discussion small{margin-top:1px;color:#718394;font-size:7px}.start-discussion>a{padding:7px 10px;border-radius:6px;background:#0b8b6d;color:#fff!important;text-decoration:none;font-size:8px;font-weight:850}.topic-list{height:125px;display:grid;align-content:start;gap:3px;margin-top:7px;overflow:hidden}.topic-list>b{font-size:8px}.topic-list>a{display:grid;grid-template-columns:13px minmax(0,1fr) auto;gap:5px;align-items:center;color:#315b82!important;text-decoration:none;font-size:7px}.topic-list>a strong{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500}.topic-list>a small{color:#1683e4}.topic-list p{margin:3px 0;color:#718394!important;font-size:8px;line-height:1.4}
  .contribution-card{position:relative!important;height:249px!important;display:flex!important;flex-direction:column!important;justify-content:flex-end!important;padding:18px!important;border-radius:10px!important;overflow:hidden!important;background:#0b5146 var(--contribution) center/cover no-repeat!important;color:#fff!important;text-decoration:none!important}.contribution-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(3,38,34,.12),rgba(3,47,41,.78))}.contribution-card strong,.contribution-btn{position:relative;z-index:2}.contribution-card strong{align-self:flex-end;margin-bottom:18px;color:#fff!important;font:italic 700 21px/1.05 Georgia,serif;text-align:right;text-shadow:0 2px 8px rgba(0,0,0,.4)}.contribution-btn{align-self:flex-end;padding:7px 10px;border:1px solid rgba(255,255,255,.82);border-radius:999px;background:rgba(3,45,39,.5);font-size:8px;font-weight:850}
  @media(max-width:1050px){.news-layout{grid-template-columns:1.15fr .9fr!important}.agenda-layout{grid-template-columns:1fr 240px!important}.agenda-grid{grid-template-columns:repeat(2,1fr)!important;height:232px}.agenda-card{height:112px!important}.mini-calendar{height:232px!important}.gallery-grid{grid-template-columns:repeat(3,1fr)!important;height:auto!important}.gallery-card{height:126px!important}.community-layout{grid-template-columns:1fr 1fr!important}.contribution-card{grid-column:1/-1;height:180px!important}.contribution-card strong{max-width:280px}}
  @media(max-width:820px){.kabar-page{margin-top:-18px}.shell{width:min(100% - 24px,1210px)}.hero-layout{grid-template-columns:1fr;padding:38px 0 45px}.hero-side{grid-template-columns:1fr 1fr}.clock-card{justify-self:stretch;width:auto}.quick-menu{grid-template-columns:1fr 1fr}.news-layout{grid-template-columns:1fr!important}.featured-news,.latest-list{height:340px!important}.agenda-layout{grid-template-columns:1fr!important}.mini-calendar{height:auto!important;min-height:180px}.gallery-grid{grid-template-columns:repeat(2,1fr)!important}.community-layout{grid-template-columns:1fr!important}.white-panel{height:auto!important;min-height:205px}.contribution-card{grid-column:auto;height:210px!important}}
  @media(max-width:540px){.desktop-break{display:none}.hero-copy h1{font-size:41px}.hero-copy h2{font-size:19px}.hero-copy p{font-size:11px}.hero-side{grid-template-columns:1fr}.quick-menu{grid-template-columns:1fr;padding:7px}.quick-menu>a{height:58px}.section-head h2{font-size:17px}.featured-news{height:390px!important}.latest-list{height:auto!important;grid-template-rows:none!important}.latest-card{height:83px!important}.agenda-grid{grid-template-columns:1fr!important;height:auto!important}.agenda-card{height:105px!important}.gallery-grid{grid-template-columns:1fr 1fr!important}.gallery-card{height:118px!important}.start-discussion{grid-template-columns:31px minmax(0,1fr)}.start-discussion>a{grid-column:1/-1;text-align:center}.forum-panel{min-height:250px!important}.contribution-card{height:200px!important}}
</style>
