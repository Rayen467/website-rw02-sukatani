<script>
  import { onMount } from "svelte";
  import { isi, muatKonten, konten, muatSuara, muatKoleksi } from "../keadaan/isi.svelte.js";
  import { waktu } from "../keadaan/waktu.svelte.js";
  import { gambarWaktuAbsolut } from "../inti/waktu.js";
  import { KONTEN, KOLEKSI } from "../inti/nama.js";
  import { POLLING_BAWAAN } from "../inti/bawaan.js";
  import { keDaftar } from "../inti/format.js";

  const KALENDER_KEY = "kalender";
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

  function tanggalIso(k) {
    return String(k?.tgl || k?.tanggal || "").slice(0, 10);
  }

  function kategoriBerita(k) {
    return k?.kategori || (String(k?.penting) === "true" ? "Penting" : "Informasi");
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

  const beritaAktif = $derived(
    [...daftar].sort((a, b) => tanggalIso(b).localeCompare(tanggalIso(a)))
  );
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
        tempat: k.tempat || "",
        kategori: k.kategori || "Agenda",
        keterangan: k.ringkas || k.isi || ""
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
      return {
        label,
        jumlah,
        persen: totalSuara ? Math.round((jumlah / totalSuara) * 100) : 0
      };
    })
  );
</script>

<div class="kabar-page">
  <section class="kabar-hero" style={`--hero:url('${gambarHero}')`}>
    <div class="hero-lapis"></div>
    <div class="kabar-shell hero-grid">
      <div class="hero-copy">
        <p class="hero-kicker"><span>→</span> Informasi &amp; Kabar Terkini</p>
        <h1>Kabar RW 02 Sukatani</h1>
        <h2>Bersama membangun lingkungan yang lebih baik, guyub, maju, dan sejahtera</h2>
        <p class="hero-desc">Portal informasi resmi warga RW 02 Sukatani. Dapatkan berita, agenda, layanan, dokumentasi, dan suara warga dalam satu halaman yang mudah dipahami.</p>
        <div class="hero-actions">
          <a href="#berita-utama">Jelajahi Berita <span>→</span></a>
          <a class="hero-secondary" href="#galeri"><span class="play-mini">▶</span> Foto &amp; Video RW 02</a>
        </div>
      </div>

      <aside class="hero-side">
        <div class="waktu-card">
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

  <main class="kabar-shell kabar-main">
    <nav class="menu-cepat" aria-label="Navigasi informasi dan komunikasi">
      <a href="#berita-utama">
        <span class="menu-icon orange"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4l4 1 8 4V5L8 9l-4 1Zm4 5v4h3v-3" /></svg></span>
        <span><strong>Pengumuman</strong><small>Info penting untuk warga</small></span>
      </a>
      <a href="#agenda">
        <span class="menu-icon mint"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4M17 3v4M3 10h18M7 14h2M12 14h2M17 14h1M7 18h2M12 18h2" /></svg></span>
        <span><strong>Kalender Kegiatan</strong><small>Agenda dan jadwal RW</small></span>
      </a>
      <a href="#galeri">
        <span class="menu-icon green"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="2" /><path d="m5 18 5-5 3 3 2-2 4 4" /></svg></span>
        <span><strong>Galeri</strong><small>Foto &amp; video kegiatan</small></span>
      </a>
      <a href="#suara-warga">
        <span class="menu-icon teal"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" /><path d="M8 11h.01M12 11h.01M16 11h.01" /></svg></span>
        <span><strong>Suara Warga</strong><small>Polling &amp; diskusi</small></span>
      </a>
    </nav>

    <section class="berita-grid" id="berita-utama">
      <div class="berita-utama-wrap">
        <header class="judul-bagian">
          <div><span class="judul-icon orange">▣</span><h2>Berita Utama</h2></div>
          <a href="#/berita">Lihat Semua Berita <span>→</span></a>
        </header>

        {#if unggulan}
          <article class="berita-utama-card">
            <img src={gambarKabar(unggulan) || gambarHero} alt={unggulan.judul || "Berita utama RW 02"} decoding="async" />
            <div class="berita-gelap"></div>
            <div class="berita-utama-copy">
              <span class="tag-kabar">{kategoriBerita(unggulan)}</span>
              <h3>{unggulan.judul}</h3>
              <div class="meta-kabar"><span>◷ {tanggalPublik(unggulan) || "Publikasi RW 02"}</span><span>•</span><span>RW 02 Sukatani</span></div>
              {#if unggulan.ringkas || unggulan.isi}<p>{ringkas(unggulan.ringkas || unggulan.isi, 190)}</p>{/if}
              <div class="utama-foot">
                <a href={hrefBerita(unggulan)}>Baca Selengkapnya <span>→</span></a>
                {#if sorotan.length > 1}
                  <div class="sorotan-nav">
                    <small>{String(indeksSorotan + 1).padStart(2, "0")} / {String(sorotan.length).padStart(2, "0")}</small>
                    <button type="button" aria-label="Berita sebelumnya" onclick={() => geserSorotan(-1)}>←</button>
                    <button type="button" aria-label="Berita berikutnya" onclick={() => geserSorotan(1)}>→</button>
                  </div>
                {/if}
              </div>
            </div>
          </article>
        {:else}
          <div class="kosong besar"><b>Belum ada berita yang diterbitkan.</b><span>Berita dari Portal Petugas akan langsung tampil di area ini.</span></div>
        {/if}
      </div>

      <aside class="berita-terbaru-wrap">
        <header class="judul-bagian">
          <div><span class="judul-icon mint">▤</span><h2>Berita Terbaru</h2></div>
          <a href="#/berita">Lihat Semua <span>→</span></a>
        </header>
        {#if terbaru.length}
          <div class="berita-terbaru-list">
            {#each terbaru as k}
              <a href={hrefBerita(k)} class="berita-mini">
                <span class="mini-thumb">
                  {#if gambarKabar(k)}<img src={gambarKabar(k)} alt="" loading="lazy" decoding="async" />{:else}<span>RW02</span>{/if}
                </span>
                <span class="mini-copy">
                  <small><b>{kategoriBerita(k)}</b> {tanggalPublik(k)}</small>
                  <strong>{k.judul}</strong>
                  <em>◉ {ringkas(k.ringkas || k.isi, 58) || "Baca informasi selengkapnya"}</em>
                </span>
                <span class="mini-arrow">›</span>
              </a>
            {/each}
          </div>
        {:else}
          <div class="kosong mini"><span>Belum ada berita lain.</span></div>
        {/if}
      </aside>
    </section>

    <section class="agenda-layout" id="agenda">
      <div class="agenda-kiri">
        <header class="judul-bagian judul-dengan-sub">
          <div><span class="judul-icon mint">▦</span><span><h2>Kalender Kegiatan</h2><p>Agenda kegiatan RW 02 yang akan datang.</p></span></div>
          <a href="#/kalender">Lihat Kalender Lengkap <span>→</span></a>
        </header>

        {#if agendaTerdekat.length}
          <div class="agenda-cards">
            {#each agendaTerdekat as a}
              <article class="agenda-card">
                <time datetime={a.tanggal}><b>{hariTanggal(a.tanggal)}</b><span>{bulanPendek(a.tanggal)}</span></time>
                <div class="agenda-card-copy">
                  <h3>{a.judul}</h3>
                  <p>◷ {a.mulai ? `${a.mulai}${a.selesai ? ` – ${a.selesai}` : ""} WIB` : "Waktu menyusul"}</p>
                  <p>● {a.tempat || "Lokasi diinformasikan pengurus"}</p>
                  <a href="#/kalender">Lihat agenda</a>
                </div>
              </article>
            {/each}
          </div>
        {:else}
          <div class="kosong"><b>Belum ada agenda mendatang.</b><span>Agenda yang dibuat Petugas akan tampil otomatis di sini.</span></div>
        {/if}
      </div>

      <aside class="kalender-mini" aria-label="Kalender bulan berjalan">
        <header><span>‹</span><strong>{kalenderMini.judul}</strong><span>›</span></header>
        <div class="hari-head"><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span></div>
        <div class="tanggal-grid">
          {#each kalenderMini.sel as hari}
            {#if hari}
              <span class:ada-acara={kalenderMini.aktif.has(hari)} class:hari-ini={hari === kalenderMini.hariIni}>{hari}</span>
            {:else}
              <i></i>
            {/if}
          {/each}
        </div>
        <footer><span><i class="dot acara"></i>Ada kegiatan</span><span><i class="dot today"></i>Hari ini</span></footer>
      </aside>
    </section>

    <section class="galeri-bagian" id="galeri">
      <header class="judul-bagian judul-dengan-sub">
        <div><span class="judul-icon mint">▣</span><span><h2>Galeri Foto &amp; Video</h2><p>Dokumentasi kegiatan, pembangunan, dan momen kebersamaan warga.</p></span></div>
        <a href="#/galeri">Lihat Semua Galeri <span>→</span></a>
      </header>

      <div class="galeri-strip">
        {#if galeriTampil.length}
          {#each galeriTampil as g}
            <a class="galeri-item" href="#/galeri">
              {#if g.sampul || g.foto}<img src={g.sampul || g.foto} alt={g.judul || "Dokumentasi RW 02"} loading="lazy" decoding="async" />{:else}<span class="galeri-fallback">RW 02</span>{/if}
              <span class="galeri-lapis"></span>
              <strong>{g.judul || "Dokumentasi kegiatan"}</strong>
              <small>{formatTanggal(g.tanggal) || "RW 02 Sukatani"}</small>
            </a>
          {/each}
        {:else}
          <a class="galeri-item placeholder" href="#/galeri" style={`--galeri-fallback:url('${gambarHero}')`}><span class="galeri-lapis"></span><strong>Galeri RW 02 Sukatani</strong><small>Dokumentasi akan tampil di sini</small></a>
        {/if}

        <a class="galeri-item video-item" href={videoUtama?.tautan || "#/galeri"} target={videoUtama?.tautan ? "_blank" : undefined} rel={videoUtama?.tautan ? "noopener noreferrer" : undefined} style={`--galeri-fallback:url('${gambarHero}')`}>
          <span class="galeri-lapis"></span><span class="play-besar">▶</span>
          <strong>{videoUtama?.judul || "Video Kegiatan RW 02"}</strong>
          <small>{videoUtama ? (formatTanggal(videoUtama.tgl || videoUtama.tanggal) || "Dokumentasi video") : "Video pengurus akan tampil di sini"}</small>
        </a>
      </div>
    </section>

    <section class="warga-grid" id="suara-warga">
      <article class="polling-card">
        <header class="judul-bagian judul-dengan-sub">
          <div><span class="judul-icon mint">▥</span><span><h2>Suara Warga</h2><p>Polling untuk membangun lingkungan yang lebih baik.</p></span></div>
        </header>
        <div class="panel-putih">
          <div class="poll-head"><span>POLLING</span>{#if polling.keterangan}<small>{ringkas(polling.keterangan, 54)}</small>{/if}</div>
          <h3>{polling.pertanyaan}</h3>
          <div class="poll-list">
            {#each hasilPolling as opsi}
              <div class="poll-row"><span class="radio"></span><span class="poll-label">{opsi.label}</span><span class="bar"><i style={`width:${opsi.persen}%`}></i></span><b>{opsi.persen}%</b></div>
            {/each}
          </div>
          <footer><span>Total {totalSuara} suara</span><a href="#/forum">Lihat Hasil Lengkap →</a></footer>
        </div>
      </article>

      <article class="forum-card">
        <header class="judul-bagian judul-dengan-sub">
          <div><span class="judul-icon mint">◌</span><span><h2>Forum Diskusi</h2><p>Temukan topik menarik dan sampaikan pendapat Anda.</p></span></div>
          <a href="#/forum">Lihat Semua Diskusi →</a>
        </header>
        <div class="panel-putih">
          <div class="buat-diskusi"><span class="chat-bubble">◉</span><span><strong>Ada berita atau informasi penting?</strong><small>Mulai diskusi dengan warga lainnya.</small></span><a href="#/forum">＋ Buat Diskusi</a></div>
          <div class="topik-list">
            <b>Topik Terbaru:</b>
            {#if topikTampil.length}
              {#each topikTampil as t}
                <a href="#/forum"><span>◌</span><strong>{t.judul}</strong><small>{hitungBalasan(t.id)} komentar</small></a>
              {/each}
            {:else}
              <p>Belum ada topik diskusi. Warga dapat memulai percakapan pertama dari halaman Forum.</p>
            {/if}
          </div>
        </div>
      </article>

      <a class="kontribusi-card" href="#/forum" style={`--kontribusi:url('${gambarHero}')`}>
        <span class="kontribusi-lapis"></span>
        <strong>Lingkungan<br />Harmonis,<br />Warga Bahagia</strong>
        <span>Ayo Berkontribusi →</span>
      </a>
    </section>
  </main>
</div>

<style>
  .kabar-page{--ink:#0d3151;--deep:#004f43;--green:#07856a;--mint:#d9f5ec;--muted:#5e7182;--line:#dce9e5;width:100vw;margin-left:calc(50% - 50vw);margin-top:-32px;margin-bottom:-64px;background:#f7fbf9;color:var(--ink);overflow:hidden}.kabar-shell{width:min(1210px,calc(100% - 42px));margin-inline:auto}.kabar-hero{position:relative;min-height:410px;display:flex;align-items:center;background:#0c5147 var(--hero) center/cover no-repeat;color:#fff}.hero-lapis{position:absolute;inset:0;background:linear-gradient(90deg,rgba(3,54,48,.94) 0%,rgba(4,75,64,.77) 47%,rgba(2,32,29,.4) 78%,rgba(1,25,24,.6) 100%),linear-gradient(180deg,rgba(0,20,18,.18),rgba(0,31,27,.42))}.hero-grid{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1fr) 310px;gap:42px;align-items:center;padding:54px 0 68px}.hero-copy{max-width:720px}.hero-kicker{display:flex;align-items:center;gap:9px;margin:0 0 13px;font-size:12px;font-weight:800}.hero-kicker span{width:26px;height:26px;display:grid;place-items:center;border:1px solid #d7c836;border-radius:50%;color:#ffe457}.hero-copy h1{margin:0;font-size:clamp(48px,6vw,76px);line-height:.96;letter-spacing:-.055em;color:#fff}.hero-copy h2{max-width:690px;margin:8px 0 10px;color:#86efd0;font-size:clamp(20px,2.2vw,30px);line-height:1.12;letter-spacing:-.02em}.hero-desc{max-width:670px;margin:0;color:rgba(255,255,255,.9);font-size:14px;line-height:1.65}.hero-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:20px}.hero-actions a{min-height:44px;display:inline-flex;align-items:center;justify-content:center;gap:12px;padding:0 22px;border:1px solid #d8fff3;border-radius:999px;background:linear-gradient(180deg,#12b58e,#078269);color:#fff;text-decoration:none;font-size:13px;font-weight:850;box-shadow:0 10px 24px rgba(0,0,0,.18)}.hero-actions .hero-secondary{background:rgba(8,34,32,.56);backdrop-filter:blur(8px)}.play-mini{width:25px;height:25px;display:grid;place-items:center;border:1px solid #fff;border-radius:50%;font-size:10px}.hero-side{display:grid;gap:14px;align-self:stretch;align-content:center}.waktu-card{justify-self:end;min-width:230px;padding:16px 18px;border:1px solid rgba(255,255,255,.32);border-radius:16px;background:rgba(5,53,48,.72);box-shadow:0 16px 34px rgba(0,0,0,.18);backdrop-filter:blur(10px)}.waktu-card small,.waktu-card span{display:block;color:#d7e9e4;font-size:11px}.waktu-card strong{display:block;margin:3px 0;font-size:27px;line-height:1}.hero-side blockquote{position:relative;margin:0;padding:22px 20px 18px 52px;border:1px solid rgba(255,255,255,.36);border-radius:16px;background:rgba(1,56,50,.78);backdrop-filter:blur(10px)}.hero-side blockquote>b{position:absolute;left:17px;top:8px;color:#d6fff2;font:700 44px/1 Georgia,serif}.hero-side blockquote p{margin:0;color:#fff;font-size:13px;line-height:1.55}.hero-side blockquote footer{margin-top:9px;color:#c8ded8;font-size:11px;text-align:right}.kabar-main{position:relative;z-index:3;margin-top:-28px;padding-bottom:64px}.menu-cepat{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;padding:12px;border:1px solid #e1ebe7;border-radius:18px;background:rgba(255,255,255,.96);box-shadow:0 16px 40px rgba(20,73,59,.1);backdrop-filter:blur(10px)}.menu-cepat>a{min-width:0;display:grid;grid-template-columns:52px minmax(0,1fr);gap:12px;align-items:center;padding:8px 10px;border-radius:13px;color:var(--ink);text-decoration:none;transition:.2s ease}.menu-cepat>a:hover{background:#f2f8f5;transform:translateY(-1px)}.menu-icon{width:48px;height:48px;display:grid;place-items:center;border-radius:13px}.menu-icon svg{width:25px;height:25px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.menu-icon.orange{background:#fff0dc;color:#e97b20}.menu-icon.mint{background:#dff6ef;color:#08695a}.menu-icon.green{background:#d9f6ec;color:#08785e}.menu-icon.teal{background:#d6f4ee;color:#006c60}.menu-cepat strong,.menu-cepat small{display:block}.menu-cepat strong{font-size:13px}.menu-cepat small{margin-top:3px;color:#6c7f8f;font-size:10px}.judul-bagian{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:10px}.judul-bagian>div{display:flex;align-items:center;gap:9px;min-width:0}.judul-bagian h2{margin:0;color:#0c315a;font-size:22px;letter-spacing:-.025em}.judul-bagian p{margin:2px 0 0;color:#708395;font-size:11px}.judul-bagian>a{color:#08785f;text-decoration:none;font-size:11px;font-weight:850;white-space:nowrap}.judul-icon{width:32px;height:32px;display:grid;place-items:center;border-radius:10px;font-size:16px}.judul-icon.orange{background:#fff0dc;color:#e57b24}.judul-icon.mint{background:#dff6ef;color:#07725b}.judul-dengan-sub>div>span:last-child{display:block}.berita-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(340px,.95fr);gap:24px;padding-top:18px}.berita-utama-card{position:relative;min-height:400px;border-radius:13px;overflow:hidden;background:#0b4c42;box-shadow:0 12px 28px rgba(19,64,54,.14)}.berita-utama-card>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.berita-gelap{position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,24,22,.04) 20%,rgba(3,36,31,.88) 100%)}.berita-utama-copy{position:absolute;inset:auto 0 0;padding:24px;color:#fff}.tag-kabar{display:inline-flex;padding:5px 10px;border-radius:6px;background:#ffd552;color:#143234;font-size:10px;font-weight:900;text-transform:uppercase}.berita-utama-copy h3{max-width:620px;margin:10px 0 8px;font-size:clamp(25px,3vw,36px);line-height:1.08;letter-spacing:-.03em;color:#fff}.meta-kabar{display:flex;flex-wrap:wrap;gap:7px;align-items:center;font-size:10px;color:#ebf7f3}.berita-utama-copy>p{max-width:610px;margin:10px 0 14px;color:#e7f1ee;font-size:12px;line-height:1.55}.utama-foot{display:flex;justify-content:space-between;align-items:center;gap:16px}.utama-foot>a{display:inline-flex;align-items:center;gap:12px;padding:9px 17px;border:1px solid #d8fff3;border-radius:999px;background:#09856b;color:#fff;text-decoration:none;font-size:11px;font-weight:850}.sorotan-nav{display:flex;align-items:center;gap:8px}.sorotan-nav small{font-weight:800}.sorotan-nav button{width:34px;height:34px;border:1px solid rgba(255,255,255,.85);border-radius:50%;background:rgba(3,44,39,.52);color:#fff;cursor:pointer}.berita-terbaru-list{display:grid;gap:8px}.berita-mini{min-height:87px;display:grid;grid-template-columns:128px minmax(0,1fr) 18px;gap:11px;align-items:center;padding:8px;border:1px solid #e2eae7;border-radius:11px;background:#fff;color:var(--ink);text-decoration:none;box-shadow:0 7px 20px rgba(27,70,60,.055)}.mini-thumb{height:72px;display:grid;place-items:center;overflow:hidden;border-radius:8px;background:#e4f3ed;color:#08705b;font-weight:900}.mini-thumb img{width:100%;height:100%;object-fit:cover}.mini-copy{min-width:0}.mini-copy small{display:block;color:#798b99;font-size:9px}.mini-copy small b{display:inline-block;margin-right:6px;padding:3px 6px;border-radius:999px;background:#dbf5e9;color:#08705b;font-size:8px;text-transform:uppercase}.mini-copy strong{display:-webkit-box;margin:5px 0;color:#0b315a;font-size:13px;line-height:1.22;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.mini-copy em{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#69808d;font-size:9px;font-style:normal}.mini-arrow{font-size:24px;color:#0c5e55}.agenda-layout{display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:18px;margin-top:22px}.agenda-cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.agenda-card{display:grid;grid-template-columns:54px minmax(0,1fr);gap:10px;padding:10px;border:1px solid #e2ebe7;border-radius:11px;background:#fff;box-shadow:0 7px 20px rgba(27,70,60,.05)}.agenda-card time{width:50px;height:50px;display:grid;place-items:center;align-content:center;border-radius:10px;background:linear-gradient(180deg,#0d665a,#063f38);color:#fff;text-align:center}.agenda-card time b{font-size:20px;line-height:1}.agenda-card time span{margin-top:2px;font-size:9px;font-weight:850}.agenda-card-copy h3{margin:1px 0 7px;font-size:11px;line-height:1.2}.agenda-card-copy p{margin:3px 0;color:#62798c;font-size:8px;line-height:1.25}.agenda-card-copy>a{display:inline-block;margin-top:8px;padding:5px 9px;border-radius:6px;background:#dcf5ed;color:#08735c;text-decoration:none;font-size:8px;font-weight:850}.kalender-mini{padding:12px 14px;border:1px solid #e2ebe7;border-radius:12px;background:#fff;box-shadow:0 7px 20px rgba(27,70,60,.055)}.kalender-mini>header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;color:#0c315a}.kalender-mini>header strong{font-size:11px;text-transform:capitalize}.hari-head,.tanggal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;text-align:center}.hari-head span{padding:3px 0;color:#718394;font-size:7px}.tanggal-grid span,.tanggal-grid i{height:24px;display:grid;place-items:center;border-radius:50%;font-size:8px;font-style:normal}.tanggal-grid span.ada-acara{background:#0d7561;color:#fff;font-weight:900}.tanggal-grid span.hari-ini:not(.ada-acara){background:#dcf5ed;color:#08705b;font-weight:900}.kalender-mini footer{display:flex;gap:10px;margin-top:8px;color:#708291;font-size:7px}.kalender-mini footer span{display:flex;align-items:center;gap:4px}.dot{width:7px;height:7px;border-radius:50%}.dot.acara{background:#0d7561}.dot.today{background:#bfeee0}.galeri-bagian{margin-top:22px}.galeri-strip{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}.galeri-item{position:relative;aspect-ratio:1.15;min-height:112px;display:flex;flex-direction:column;justify-content:end;padding:11px;border-radius:9px;overflow:hidden;background:#0c4a42 var(--galeri-fallback) center/cover no-repeat;color:#fff;text-decoration:none}.galeri-item>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.galeri-lapis{position:absolute;inset:0;background:linear-gradient(180deg,transparent 36%,rgba(2,31,28,.86) 100%)}.galeri-item strong,.galeri-item small{position:relative;z-index:2}.galeri-item strong{font-size:10px;line-height:1.2}.galeri-item small{margin-top:2px;color:#e5f2ee;font-size:8px}.galeri-fallback{position:absolute;inset:0;display:grid;place-items:center;background:#dff4ed;color:#08705a;font-weight:900}.play-besar{position:absolute;z-index:2;left:50%;top:42%;transform:translate(-50%,-50%);width:48px;height:48px;display:grid;place-items:center;border:2px solid #fff;border-radius:50%;background:rgba(0,41,36,.48);color:#fff}.warga-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) 210px;gap:15px;margin-top:22px}.polling-card,.forum-card{min-width:0}.panel-putih{height:calc(100% - 42px);padding:13px;border:1px solid #e0eae6;border-radius:11px;background:#fff;box-shadow:0 7px 20px rgba(27,70,60,.05)}.poll-head{display:flex;justify-content:space-between;gap:12px;align-items:center}.poll-head>span{padding:4px 9px;border-radius:999px;background:#12aa79;color:#fff;font-size:8px;font-weight:900}.poll-head small{padding:4px 8px;border-radius:999px;background:#ddf4ed;color:#377364;font-size:8px}.panel-putih>h3{margin:8px 0 10px;color:#0b315a;font-size:14px}.poll-list{display:grid;gap:7px}.poll-row{display:grid;grid-template-columns:12px minmax(100px,1fr) minmax(70px,1.2fr) 30px;gap:7px;align-items:center;font-size:9px}.radio{width:10px;height:10px;border:1px solid #09836a;border-radius:50%}.bar{height:9px;overflow:hidden;border-radius:999px;background:#edf2f5}.bar i{display:block;height:100%;border-radius:999px;background:#a6e4d4}.poll-row b{text-align:right;color:#0c315a}.panel-putih>footer{display:flex;justify-content:space-between;gap:10px;margin-top:12px;color:#708395;font-size:8px}.panel-putih>footer a{color:#08745c;font-weight:850;text-decoration:none}.buat-diskusi{display:grid;grid-template-columns:34px minmax(0,1fr) auto;gap:10px;align-items:center;padding:9px;border-radius:9px;background:linear-gradient(90deg,#eef9f6,#f9fffd)}.chat-bubble{width:30px;height:30px;display:grid;place-items:center;border-radius:50%;background:#178be9;color:#fff}.buat-diskusi strong,.buat-diskusi small{display:block}.buat-diskusi strong{font-size:10px}.buat-diskusi small{margin-top:2px;color:#718394;font-size:8px}.buat-diskusi>a{padding:8px 12px;border-radius:7px;background:#0b8b6d;color:#fff;text-decoration:none;font-size:9px;font-weight:850}.topik-list{display:grid;gap:4px;margin-top:10px}.topik-list>b{font-size:9px}.topik-list>a{display:grid;grid-template-columns:14px minmax(0,1fr) auto;gap:6px;align-items:center;color:#315b82;text-decoration:none;font-size:8px}.topik-list>a strong{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500}.topik-list>a small{color:#1683e4}.topik-list p{margin:4px 0;color:#718394;font-size:9px;line-height:1.45}.kontribusi-card{position:relative;min-height:245px;display:flex;flex-direction:column;justify-content:space-between;padding:24px 18px;border-radius:11px;overflow:hidden;background:#0b5146 var(--kontribusi) center/cover no-repeat;color:#fff;text-decoration:none}.kontribusi-lapis{position:absolute;inset:0;background:linear-gradient(180deg,rgba(3,38,34,.18),rgba(3,47,41,.8))}.kontribusi-card strong,.kontribusi-card>span:last-child{position:relative;z-index:2}.kontribusi-card strong{align-self:end;margin-top:auto;margin-bottom:24px;font:italic 700 24px/1.05 Georgia,serif;text-align:right;text-shadow:0 2px 8px rgba(0,0,0,.4)}.kontribusi-card>span:last-child{align-self:end;padding:8px 12px;border:1px solid rgba(255,255,255,.8);border-radius:999px;background:rgba(3,45,39,.5);font-size:9px;font-weight:850}.kosong{display:grid;gap:5px;padding:24px;border:1px dashed #bed8ce;border-radius:11px;background:#fff;color:#6a7f8d}.kosong.besar{min-height:400px;place-content:center;text-align:center}.kosong.mini{min-height:120px;place-content:center}.kosong b{color:#173c55}.kosong span{font-size:11px}.berita-mini:hover,.agenda-card:hover,.galeri-item:hover,.menu-cepat>a:hover{box-shadow:0 12px 28px rgba(20,73,59,.12)}
  @media(max-width:1040px){.hero-grid{grid-template-columns:1fr 270px}.berita-grid{grid-template-columns:1.25fr .9fr}.agenda-layout{grid-template-columns:1fr}.agenda-cards{grid-template-columns:repeat(2,1fr)}.kalender-mini{max-width:420px}.galeri-strip{grid-template-columns:repeat(3,1fr)}.warga-grid{grid-template-columns:1fr 1fr}.kontribusi-card{grid-column:1/-1;min-height:190px}.kontribusi-card strong{max-width:360px}}
  @media(max-width:800px){.kabar-page{margin-top:-18px}.kabar-shell{width:min(100% - 26px,1210px)}.hero-grid{grid-template-columns:1fr;padding:44px 0 55px}.hero-side{grid-template-columns:1fr 1fr;align-items:stretch}.waktu-card{justify-self:stretch}.menu-cepat{grid-template-columns:1fr 1fr}.berita-grid{grid-template-columns:1fr}.berita-utama-card{min-height:380px}.agenda-cards{grid-template-columns:repeat(2,1fr)}.warga-grid{grid-template-columns:1fr}.kontribusi-card{grid-column:auto}.galeri-strip{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:520px){.kabar-hero{min-height:auto}.hero-copy h1{font-size:43px}.hero-copy h2{font-size:20px}.hero-desc{font-size:12px}.hero-side{grid-template-columns:1fr}.menu-cepat{grid-template-columns:1fr;padding:8px}.berita-utama-card{min-height:430px}.berita-utama-copy{padding:18px}.berita-utama-copy h3{font-size:25px}.utama-foot{align-items:flex-end}.sorotan-nav small{display:none}.berita-mini{grid-template-columns:96px minmax(0,1fr) 14px}.mini-thumb{height:68px}.agenda-cards{grid-template-columns:1fr}.judul-bagian{align-items:flex-start}.judul-bagian>a{font-size:9px}.galeri-strip{grid-template-columns:1fr 1fr}.warga-grid{gap:20px}.poll-row{grid-template-columns:12px minmax(0,1fr) 42px}.poll-row .bar{grid-column:2/3}.poll-row b{grid-column:3;grid-row:1}.buat-diskusi{grid-template-columns:34px minmax(0,1fr)}.buat-diskusi>a{grid-column:1/-1;text-align:center}.kontribusi-card{min-height:210px}}
</style>