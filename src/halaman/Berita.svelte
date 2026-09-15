<script>
  import { isi } from "../keadaan/isi.svelte.js";
  import { waktu } from "../keadaan/waktu.svelte.js";
  import { gambarWaktuAbsolut } from "../inti/waktu.js";
  import Kosong from "../komponen/Kosong.svelte";

  const daftar = $derived(Array.isArray(isi.pengumuman) ? isi.pengumuman : []);
  const galeri = $derived(Array.isArray(isi.galeri) ? isi.galeri : []);
  const forum = $derived(Array.isArray(isi.forum_topik) ? isi.forum_topik : []);
  const gambarHero = $derived(gambarWaktuAbsolut(waktu.fase));

  function tanggalNilai(k) {
    const nilai = k?.tgl || k?.tanggal || k?.dibuat || k?.createdAt || k?.diperbarui;
    if (!nilai) return 0;
    if (typeof nilai?.toDate === "function") return nilai.toDate().getTime();
    if (typeof nilai?.seconds === "number") return nilai.seconds * 1000;
    const d = new Date(nilai);
    return Number.isNaN(d.getTime()) ? 0 : d.getTime();
  }

  const beritaAktif = $derived.by(() =>
    [...daftar].sort((a, b) => tanggalNilai(b) - tanggalNilai(a))
  );

  const unggulan = $derived(beritaAktif[0] || null);
  const terbaru = $derived(beritaAktif.slice(1, 6));
  const galeriAktif = $derived(galeri.slice(0, 6));
  const forumAktif = $derived(forum.filter((x) => x.status !== "dihapus").slice(0, 4));

  function hrefBerita(k) {
    return k?.id ? `#/berita/${k.id}` : "#/berita";
  }

  function labelTipe(k) {
    const tipe = String(k?.tipe || k?.kategori || "Informasi").trim();
    if (!tipe) return "Informasi";
    return tipe.charAt(0).toUpperCase() + tipe.slice(1);
  }

  function tanggalTampil(k) {
    if (k?.tglText) return k.tglText;
    const nilai = k?.tgl || k?.tanggal || k?.dibuat || k?.createdAt || k?.diperbarui;
    if (!nilai) return "Tanggal belum dicantumkan";
    let d;
    if (typeof nilai?.toDate === "function") d = nilai.toDate();
    else if (typeof nilai?.seconds === "number") d = new Date(nilai.seconds * 1000);
    else d = new Date(nilai);
    if (Number.isNaN(d.getTime())) return String(nilai);
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(d);
  }

  function fotoBerita(k) {
    return k?.foto || k?.sampul || "";
  }

  function fotoGaleri(g) {
    return g?.sampul || g?.foto || "";
  }
</script>

<div class="berita-modern berita-data-first">
  <section class="berita-hero" style={"--berita-hero:url('" + gambarHero + "')"}>
    <div class="berita-hero-overlay"></div>
    <div class="berita-wadah berita-hero-grid">
      <div class="berita-hero-copy">
        <p class="berita-kicker"><span>↗</span> Pusat Informasi RW 02</p>
        <h1>Kabar RW 02</h1>
        <h2>Informasi yang perlu diketahui warga.</h2>
        <p>Pengumuman, kabar kegiatan, dan informasi lingkungan yang diterbitkan pengurus RW 02 Permai Sukatani.</p>
        <div class="berita-hero-aksi">
          <a class="berita-btn utama" href="#berita-utama">Baca informasi terbaru <span>→</span></a>
          <a class="berita-btn video" href="#galeri-berita">Lihat dokumentasi</a>
        </div>
      </div>

      <div class="berita-hero-kanan">
        <div class="berita-waktu">
          <small>Waktu lokal RW 02</small>
          <strong>{waktu.jam} WIB</strong>
          <span>{waktu.tanggal} · Permai Sukatani, Rajeg</span>
        </div>
        <blockquote>
          <span>“</span>
          <p>Informasi publik harus mudah ditemukan, mudah dipahami, dan bersumber dari data yang benar.</p>
          <small>Portal Warga RW 02</small>
        </blockquote>
      </div>
    </div>
  </section>

  <main class="berita-wadah berita-isi">
    <nav class="berita-shortcut berita-shortcut-data" aria-label="Akses cepat informasi">
      <a href="#berita-utama">
        <span class="shortcut-ikon orange">N</span>
        <span><strong>Pengumuman</strong><small>Kabar yang diterbitkan pengurus</small></span>
      </a>
      <a href="#galeri-berita">
        <span class="shortcut-ikon green">▣</span>
        <span><strong>Dokumentasi</strong><small>Foto kegiatan yang sudah dipublikasikan</small></span>
      </a>
      <a href="#/kalender">
        <span class="shortcut-ikon teal">▦</span>
        <span><strong>Kalender</strong><small>Jadwal dan agenda pada halaman khusus</small></span>
      </a>
      <a href="#/forum">
        <span class="shortcut-ikon cyan">•••</span>
        <span><strong>Forum Warga</strong><small>Diskusi yang berasal dari warga terverifikasi</small></span>
      </a>
    </nav>

    <section class="berita-grid-utama" id="berita-utama">
      <div class="berita-unggulan-wrap">
        <div class="berita-judul-row">
          <div>
            <span class="judul-ikon orange">▣</span>
            <div><h2>Informasi Utama</h2><p>Publikasi terbaru dari pengurus RW 02.</p></div>
          </div>
        </div>

        {#if unggulan}
          <article class:tanpa-foto={!fotoBerita(unggulan)} class="berita-unggulan">
            {#if fotoBerita(unggulan)}
              <img src={fotoBerita(unggulan)} alt="" decoding="async" />
              <div class="berita-unggulan-lapis"></div>
            {/if}
            <div class="berita-unggulan-copy">
              <span class="berita-badge">{labelTipe(unggulan)}</span>
              <h3>{unggulan.judul || "Informasi RW 02"}</h3>
              <p class="berita-meta">{tanggalTampil(unggulan)} <span>•</span> RW 02 Sukatani</p>
              {#if unggulan.ringkas || unggulan.isi}
                <p>{unggulan.ringkas || unggulan.isi}</p>
              {/if}
              <div class="unggulan-bawah">
                <a class="berita-btn utama" href={hrefBerita(unggulan)}>Baca selengkapnya <span>→</span></a>
              </div>
            </div>
          </article>
        {:else}
          <Kosong
            judul="Belum ada pengumuman yang diterbitkan"
            ket="Informasi resmi akan tampil di sini setelah pengurus menerbitkannya dari Portal Petugas."
            tab="terbit"
            aksi="Terbitkan informasi"
          />
        {/if}
      </div>

      <aside class="berita-terbaru">
        <div class="berita-judul-row">
          <div>
            <span class="judul-ikon teal">▤</span>
            <div><h2>Publikasi Lain</h2><p>Daftar informasi berdasarkan data yang tersedia.</p></div>
          </div>
        </div>

        {#if terbaru.length}
          <div class="berita-terbaru-list">
            {#each terbaru as k}
              <a class:tanpa-foto={!fotoBerita(k)} class="berita-list-item" href={hrefBerita(k)}>
                {#if fotoBerita(k)}<img src={fotoBerita(k)} alt="" decoding="async" />{:else}<span class="berita-list-placeholder">RW</span>{/if}
                <div>
                  <p><span class="mini-badge">{labelTipe(k)}</span><small>{tanggalTampil(k)}</small></p>
                  <h3>{k.judul || "Informasi RW 02"}</h3>
                </div>
                <b>›</b>
              </a>
            {/each}
          </div>
        {:else}
          <div class="berita-side-empty">
            <strong>Belum ada publikasi tambahan.</strong>
            <p>Daftar ini akan bertambah otomatis saat informasi baru diterbitkan.</p>
          </div>
        {/if}
      </aside>
    </section>

    <section class="galeri-berita" id="galeri-berita">
      <div class="berita-judul-row">
        <div>
          <span class="judul-ikon green">◉</span>
          <div><h2>Dokumentasi Warga</h2><p>Galeri yang benar-benar sudah diterbitkan pada website RW 02.</p></div>
        </div>
        <a href="#/galeri">Buka galeri lengkap <span>→</span></a>
      </div>

      {#if galeriAktif.length}
        <div class="galeri-berita-grid">
          {#each galeriAktif as g}
            <a class:tanpa-foto={!fotoGaleri(g)} class="galeri-berita-card" href="#/galeri">
              {#if fotoGaleri(g)}<img src={fotoGaleri(g)} alt="" decoding="async" />{/if}
              <span class="galeri-lapis"></span>
              <strong>{g.judul || "Dokumentasi kegiatan RW 02"}</strong>
            </a>
          {/each}
        </div>
      {:else}
        <div class="berita-section-empty">
          <strong>Belum ada album yang diterbitkan.</strong>
          <p>Foto dokumentasi akan muncul setelah pengurus menerbitkan album dari Portal Petugas.</p>
        </div>
      {/if}
    </section>

    <section class="berita-community">
      <div class="berita-community-main">
        <span class="berita-community-label">RUANG WARGA</span>
        <h2>Informasi tidak berhenti di pengumuman.</h2>
        <p>Warga dapat melihat kalender kegiatan, membaca forum, atau menyampaikan pengaduan melalui jalur yang sudah disediakan.</p>
        <div class="berita-community-actions">
          <a href="#/kalender">Kalender kegiatan →</a>
          <a href="#/forum">Buka forum warga →</a>
          <a href="#/pengaduan">Sampaikan pengaduan →</a>
        </div>
      </div>

      <aside class="berita-forum-live">
        <div class="berita-forum-head"><span>Topik forum terbaru</span><a href="#/forum">Semua topik →</a></div>
        {#if forumAktif.length}
          {#each forumAktif as topik}
            <a href="#/forum" class="berita-forum-row"><span>◌</span><div><b>{topik.judul || "Topik warga"}</b><small>{topik.kategori || "Forum warga"}</small></div><i>›</i></a>
          {/each}
        {:else}
          <div class="berita-forum-empty">Belum ada topik forum yang aktif.</div>
        {/if}
      </aside>
    </section>
  </main>
</div>
