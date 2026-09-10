<script>
  import { KONTEN } from "../inti/nama.js";
  import { BERANDA_BAWAAN } from "../inti/bawaan.js";
  import { isi, konten, kontenNilai } from "../keadaan/isi.svelte.js";
  import { gambarWaktuAbsolut } from "../inti/waktu.js";
  import { waktu, FASE_WAKTU, pilihWaktu, kembaliOtomatis } from "../keadaan/waktu.svelte.js";
  import Kosong from "../komponen/Kosong.svelte";

  const kabar = $derived((isi.pengumuman || []).slice(0, 3));
  const usaha = $derived((isi.usaha || []).slice(0, 4));
  const album = $derived((isi.galeri || []).slice(0, 4));
  const profil = $derived(konten(KONTEN.PROFIL) || {});

  const t = $derived(
    Object.fromEntries(
      Object.keys(BERANDA_BAWAAN).map((k) => [k, kontenNilai(KONTEN.BERANDA, k, BERANDA_BAWAAN[k])])
    )
  );

  const gambarHero = $derived(gambarWaktuAbsolut(waktu.fase));

  const layanan = [
    {
      judul: "Pengajuan Surat",
      teks: "Urus surat pengantar dan keterangan secara online.",
      href: "#/surat",
      ikon: "surat"
    },
    {
      judul: "Pengaduan & Aspirasi",
      teks: "Laporkan masalah lingkungan dan pantau tindak lanjutnya.",
      href: "#/pengaduan",
      ikon: "aduan"
    },
    {
      judul: "Reservasi Fasilitas",
      teks: "Lihat jadwal dan ajukan penggunaan fasilitas RW 02.",
      href: "#/reservasi",
      ikon: "fasilitas"
    },
    {
      judul: "Bantuan Sosial",
      teks: "Lihat program, syarat pengajuan, dan informasi penerima.",
      href: "#/bansos",
      ikon: "bansos"
    },
    {
      judul: "UMKM Warga",
      teks: "Temukan dan dukung usaha milik warga sekitar.",
      href: "#/umkm",
      ikon: "umkm"
    },
    {
      judul: "Kontak & Lokasi",
      teks: "Alamat sekretariat, jam pelayanan, kontak, dan peta lokasi.",
      href: "#/kontak",
      ikon: "kontak"
    }
  ];

  const infoPenting = [
    {
      label: "BANTUAN SOSIAL",
      judul: "Program & syarat bansos",
      teks: "Informasi program bantuan, syarat, jalur usulan, dan jumlah penerima per RT.",
      href: "#/bansos",
      warna: "merah",
      ikon: "♥"
    },
    {
      label: "LINK PENTING",
      judul: "Layanan pemerintah",
      teks: "Akses Kelurahan Sukatani, Kecamatan Rajeg, Dukcapil, KTP-el, dan layanan terkait.",
      href: "#/tautan",
      warna: "biru",
      ikon: "↗"
    },
    {
      label: "TRANSPARANSI",
      judul: "Kas & program RW",
      teks: "Lihat ringkasan transparansi, laporan kas, serta rencana dan realisasi program.",
      href: "#/transparansi",
      warna: "emas",
      ikon: "▤"
    },
    {
      label: "KONTAK & LOKASI",
      judul: "Sekretariat RW 02",
      teks: "Alamat, jam pelayanan, kontak pengurus yang dipublikasikan, dan petunjuk lokasi.",
      href: "#/kontak",
      warna: "hijau",
      ikon: "●"
    }
  ];

  const jelajah = [
    ["Profil RW 02", "Sejarah, visi-misi, dan gambaran lingkungan.", "#/profil", "⌂"],
    ["Struktur Pengurus", "Kenali pengurus RW dan para Ketua RT.", "#/pengurus", "◎"],
    ["Peta Wilayah", "Lihat batas wilayah dan fasilitas lingkungan.", "#/peta", "⌖"],
    ["Data Kependudukan", "Ringkasan statistik warga tanpa membuka data pribadi.", "#/kependudukan", "▥"]
  ];

  const kegiatan = [
    { judul: "Kerja Bakti Lingkungan", tanggal: "Kegiatan warga", foto: "./foto/kegiatan-kerja-bakti.jpg" },
    { judul: "Kegiatan Kemerdekaan", tanggal: "Kebersamaan warga", foto: "./foto/kegiatan-kemerdekaan.jpg" },
    { judul: "Kegiatan Posyandu", tanggal: "Pelayanan warga", foto: "./foto/kegiatan-posyandu.jpg" },
    { judul: "Rapat Warga", tanggal: "Musyawarah lingkungan", foto: "./foto/kegiatan-rapat-warga.jpg" }
  ];

  const galeriFallback = [
    "./foto/kegiatan-pengecatan.jpg",
    "./foto/kegiatan-saluran-air.jpg",
    "./foto/kegiatan-kerja-bakti.jpg",
    "./foto/kegiatan-kemerdekaan.jpg"
  ];

  function ikonFase(fase) {
    if (fase === "pagi") return "☀";
    if (fase === "siang") return "◉";
    if (fase === "sore") return "◐";
    return "☾";
  }
</script>

<section
  class="beranda-hero"
  class:hero-malam={waktu.fase === "malam"}
  style={"--gambar-hero:url('" + gambarHero + "')"}
>
  <div class="wadah beranda-hero-dalam">
    <div class="beranda-copy">
      <p class="beranda-eyebrow">PERMAI SUKATANI, RAJEG</p>
      <h1>{t.judul}</h1>
      <p class="beranda-ringkas">{t.ringkas}</p>

      <div class="beranda-cta">
        <a class="cta-utama" href="#/layanan">Buka Layanan Warga <span>→</span></a>
        <a class="cta-kedua" href="#informasi-penting">Lihat Informasi Penting</a>
      </div>

      <div class="beranda-meta">
        <div class="beranda-meta-item">
          <span class="meta-ikon">{ikonFase(waktu.fase)}</span>
          <span>
            <b>{waktu.jam}</b>
            <small>{waktu.label}, {waktu.tanggal}</small>
          </span>
        </div>
        <div class="beranda-meta-item">
          <span class="meta-pin" aria-hidden="true">●</span>
          <span>
            <b>Permai Sukatani, Rajeg</b>
            <small>Kabupaten Tangerang</small>
          </span>
        </div>
      </div>
    </div>

    <div class="pemilih-waktu" aria-label="Pratinjau suasana waktu">
      {#each FASE_WAKTU as fase}
        <button
          type="button"
          class:aktif={waktu.fase === fase.id}
          aria-pressed={waktu.fase === fase.id}
          onclick={() => pilihWaktu(fase.id)}
        >
          <span class="titik"></span>
          <span>{fase.label}</span>
        </button>
      {/each}
      {#if !waktu.otomatis}
        <button class="kembali-waktu" type="button" onclick={kembaliOtomatis}>
          Otomatis · {waktu.faseOtomatis}
        </button>
      {/if}
    </div>
  </div>
</section>

<section class="layanan-cepat blok" aria-label="Layanan cepat">
  {#each layanan as l}
    <a class="layanan-cepat-item" href={l.href}>
      <span class="layanan-ikon" aria-hidden="true">
        {#if l.ikon === "surat"}
          <svg viewBox="0 0 24 24"><path d="M6 3h9l3 3v15H6zM9 10h6M9 14h6M9 18h4"/><path d="M15 3v4h4"/></svg>
        {:else if l.ikon === "aduan"}
          <svg viewBox="0 0 24 24"><path d="M4 13h3l9 4V7l-9 4H4zM7 13v5h3l1-3M19 9v6"/></svg>
        {:else if l.ikon === "fasilitas"}
          <svg viewBox="0 0 24 24"><path d="M4 21h16M6 21V9h12v12M9 9V5h6v4M9 13h2v3H9zM13 13h2v3h-2z"/></svg>
        {:else if l.ikon === "bansos"}
          <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.2-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.8-7 10-7 10z"/><path d="M9 12h6M12 9v6"/></svg>
        {:else if l.ikon === "umkm"}
          <svg viewBox="0 0 24 24"><path d="M4 9l2-5h12l2 5M5 10v10h14V10M9 14h6v6"/><path d="M4 9c0 2 3 2 4 0 1 2 3 2 4 0 1 2 3 2 4 0 1 2 4 2 4 0"/></svg>
        {:else}
          <svg viewBox="0 0 24 24"><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11z"/><circle cx="12" cy="10" r="2.2"/></svg>
        {/if}
      </span>
      <strong>{l.judul}</strong>
      <small>{l.teks}</small>
      <span class="layanan-panah">→</span>
    </a>
  {/each}
</section>

<section class="home-section blok" id="informasi-penting" aria-labelledby="judul-informasi-penting">
  <div class="home-section-head">
    <div>
      <p class="home-kicker">Ringkasan Beranda</p>
      <h2 id="judul-informasi-penting">Yang perlu diketahui warga</h2>
      <p class="home-section-copy">Beranda menampilkan hal-hal paling penting. Detail lengkap tetap tersedia di halaman masing-masing.</p>
    </div>
    <a class="home-link-all" href="#/layanan">Lihat semua layanan <span>→</span></a>
  </div>

  <div class="home-info-grid">
    <section class="home-latest panel-rumah">
      <div class="home-latest-head">
        <span class="home-live-dot"></span>
        <div><small>INFORMASI TERBARU</small><h3>Pengumuman RW 02</h3></div>
        <a href="#/berita">Semua berita →</a>
      </div>

      {#if kabar.length}
        <article class="home-latest-main">
          <time>{kabar[0].tglText || kabar[0].tgl || "Informasi RW 02"}</time>
          <h4><a href="#/berita/{kabar[0].id}">{kabar[0].judul}</a></h4>
          <p>{kabar[0].ringkas || kabar[0].isi || ""}</p>
          <a class="home-read" href="#/berita/{kabar[0].id}">Baca selengkapnya <span>→</span></a>
        </article>

        {#if kabar.length > 1}
          <div class="home-latest-list">
            {#each kabar.slice(1) as k}
              <a href="#/berita/{k.id}">
                <span>{k.tglText || k.tgl || "Info"}</span>
                <strong>{k.judul}</strong>
                <b>→</b>
              </a>
            {/each}
          </div>
        {/if}
      {:else}
        <Kosong
          judul="Belum ada pengumuman terbaru"
          ket="Saat pengurus menerbitkan kabar, informasi terbaru akan langsung muncul di bagian ini."
          tab="terbit"
          aksi="Terbitkan pengumuman"
        />
      {/if}
    </section>

    <div class="home-important-grid">
      {#each infoPenting as item}
        <a class="home-important-card {item.warna}" href={item.href}>
          <span class="home-important-icon">{item.ikon}</span>
          <span class="home-important-label">{item.label}</span>
          <strong>{item.judul}</strong>
          <p>{item.teks}</p>
          <span class="home-important-go">Buka informasi <b>→</b></span>
        </a>
      {/each}
    </div>
  </div>
</section>

<section class="home-section blok" aria-labelledby="judul-jelajah-rw">
  <div class="home-section-head compact">
    <div>
      <p class="home-kicker">Kenali Lingkungan</p>
      <h2 id="judul-jelajah-rw">Jelajah RW 02</h2>
    </div>
    <p class="home-section-copy">Empat pintu singkat untuk mengenal wilayah, pengurus, dan data lingkungan.</p>
  </div>

  <div class="home-explore-grid">
    {#each jelajah as j}
      <a href={j[2]} class="home-explore-card">
        <span class="home-explore-icon">{j[3]}</span>
        <span><strong>{j[0]}</strong><small>{j[1]}</small></span>
        <b class="home-explore-arrow">→</b>
      </a>
    {/each}
  </div>
</section>

<section class="sambutan-rw blok" aria-labelledby="judul-sambutan-rw">
  <div class="sambutan-rw-copy">
    <p class="sambutan-rw-label"><span></span>Sambutan Ketua RW 02</p>

    <h2 id="judul-sambutan-rw">
      Bersama<br />
      Mewujudkan Lingkungan<br />
      yang Lebih Baik
    </h2>

    <div class="sambutan-rw-pembuka">
      <p><strong>Assalamu’alaikum Warahmatullahi Wabarakatuh,</strong></p>
      <p>
        Selamat datang di Website Resmi RW 02 Perum Pondok Sukatani Permai.
        Website ini hadir sebagai media informasi, layanan, dan komunikasi
        agar warga lebih mudah terhubung dengan pengurus dan lingkungan.
      </p>
      <p>
        Mari bersama menjaga lingkungan yang bersih, aman, nyaman, rukun,
        guyub, maju, dan sejahtera.
      </p>
    </div>

    <details class="sambutan-rw-detail">
      <summary>
        <span class="sambutan-buka">Baca Sambutan Lengkap</span>
        <span class="sambutan-tutup">Tutup Sambutan</span>
        <span class="sambutan-rw-panah">→</span>
      </summary>

      <div class="sambutan-rw-lengkap">
        <p>
          Website ini hadir sebagai jembatan informasi dan komunikasi antara Pengurus RW,
          para Ketua RT, dan seluruh warga. Melalui media ini, kami berharap segala informasi
          terkait kegiatan, pengumuman, program kerja, serta pelayanan publik dapat tersampaikan
          secara cepat, terbuka, dan transparan.
        </p>
        <p>
          Kami menyadari bahwa kemajuan lingkungan kita tidak terlepas dari kerja sama,
          kekompakan, dan gotong royong seluruh warga. Oleh karena itu, kami mengajak Bapak,
          Ibu, dan seluruh warga untuk bersama-sama menjaga kebersihan, keamanan, ketentraman,
          dan kerukunan di lingkungan yang kita cintai ini.
        </p>
        <p>
          Kami juga membuka ruang seluas-luasnya bagi seluruh warga untuk menyampaikan saran,
          masukan, dan aspirasi demi kemajuan dan kesejahteraan bersama. Semoga website ini
          bermanfaat dan menjadi sarana yang mempererat tali silaturahmi kita semua.
        </p>
        <p><strong>Wassalamu’alaikum Warahmatullahi Wabarakatuh.</strong></p>

        <div class="sambutan-rw-ttd">
          <span>Ketua RW 02</span>
          <strong>Anto Carmanto, S.T., M.T.</strong>
        </div>
      </div>
    </details>

    <blockquote class="sambutan-rw-quote">
      <span aria-hidden="true">“</span>
      <p>Lingkungan yang baik berawal dari warga yang peduli.</p>
    </blockquote>
  </div>

  <figure class="sambutan-rw-foto">
    <span class="sambutan-rw-motto" aria-hidden="true">Guyub<br />Maju<br />Sejahtera</span>

    <img
      src="https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/65bf8ecc-bfbf-48c7-adf2-620fbd94acb3.png"
      alt="Foto Ketua RW 02 Anto Carmanto"
      decoding="async"
    />

    <figcaption>
      <div>
        <strong>Anto Carmanto, S.T., M.T.</strong>
        <span>Ketua RW 02</span>
      </div>
      <blockquote>“Lingkungan yang baik berawal dari warga yang peduli.”</blockquote>
    </figcaption>
  </figure>
</section>

<section class="home-section blok" aria-labelledby="judul-kegiatan-warga">
  <div class="home-section-head compact">
    <div>
      <p class="home-kicker">Kehidupan Lingkungan</p>
      <h2 id="judul-kegiatan-warga">Kegiatan warga</h2>
    </div>
    <a class="home-link-all" href="#/galeri">Lihat galeri lengkap <span>→</span></a>
  </div>

  <div class="home-activity-grid">
    {#each kegiatan as k, i}
      <a class:unggulan={i === 0} class="home-activity-card" href="#/galeri">
        <img src={k.foto} alt="" decoding="async" />
        <span class="home-activity-shade"></span>
        <span class="home-activity-copy">
          <small>{k.tanggal}</small>
          <strong>{k.judul}</strong>
          <b>Jelajahi dokumentasi →</b>
        </span>
      </a>
    {/each}
  </div>
</section>

<div class="home-bottom-grid blok">
  <section class="home-bottom-panel">
    <div class="home-section-head mini">
      <div><p class="home-kicker">Dokumentasi</p><h2>Galeri lingkungan</h2></div>
      <a class="home-link-all" href="#/galeri">Lihat semua →</a>
    </div>
    <div class="home-gallery">
      {#if album.length}
        {#each album as g, i}
          <a href="#/galeri"><img src={g.sampul || g.foto || galeriFallback[i % galeriFallback.length]} alt="" decoding="async" /></a>
        {/each}
      {:else}
        {#each galeriFallback as foto}
          <a href="#/galeri"><img src={foto} alt="" decoding="async" /></a>
        {/each}
      {/if}
    </div>
  </section>

  <section class="home-bottom-panel">
    <div class="home-section-head mini">
      <div><p class="home-kicker">Potensi Lokal</p><h2>UMKM warga</h2></div>
      <a class="home-link-all" href="#/umkm">Lihat semua →</a>
    </div>

    {#if usaha.length}
      <div class="home-umkm">
        {#each usaha as u}
          <a href="#/umkm/{u.id}">
            <span class="home-umkm-photo">
              {#if u.sampul || u.foto}
                <img src={u.sampul || u.foto} alt="" decoding="async" />
              {:else}
                <span>RW</span>
              {/if}
            </span>
            <span class="home-umkm-copy"><strong>{u.nama}</strong><small>{u.katLabel || u.jenis || "Usaha warga"}</small></span>
            <b>→</b>
          </a>
        {/each}
      </div>
    {:else}
      <Kosong
        judul="Belum ada UMKM yang ditampilkan"
        ket="Usaha warga yang sudah disetujui pengurus akan tampil di sini."
        tab="kiriman"
        aksi="Kelola UMKM"
      />
    {/if}
  </section>
</div>

<section class="home-cta blok" aria-label="Pusat layanan warga">
  <div>
    <p class="home-kicker">Pusat Layanan Warga</p>
    <h2>Butuh mengurus sesuatu?</h2>
    <p>Surat, pengaduan, reservasi fasilitas, bantuan sosial, informasi pemerintah, dan kebutuhan warga lainnya tersedia dari satu halaman.</p>
  </div>
  <div class="home-cta-actions">
    <a href="#/layanan">Buka semua layanan <span>→</span></a>
    <a class="sekunder" href="#/kontak">Hubungi pengurus</a>
  </div>
</section>

<style>
  .home-section,
  .home-bottom-grid,
  .home-cta {
    color: var(--waktu-panel-teks);
  }

  .home-section-head {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 26px;
    margin-bottom: 18px;
  }

  .home-section-head.compact {
    align-items: center;
  }

  .home-section-head.mini {
    align-items: center;
    margin-bottom: 14px;
  }

  .home-section-head h2 {
    margin: 4px 0 0;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(25px, 3vw, 35px);
    line-height: 1.06;
    letter-spacing: -.035em;
    color: var(--waktu-panel-teks);
  }

  .home-section-head.mini h2 {
    font-size: 24px;
  }

  .home-kicker {
    margin: 0;
    color: #177457;
    font-family: "IBM Plex Mono", ui-monospace, monospace;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: .13em;
    text-transform: uppercase;
  }

  .home-section-copy {
    max-width: 54ch;
    margin: 0;
    color: var(--waktu-panel-teks-2);
    font-size: 11px;
    line-height: 1.6;
  }

  .home-section-head > div .home-section-copy {
    margin-top: 7px;
  }

  .home-link-all {
    color: var(--waktu-panel-teks);
    font-size: 10.5px;
    font-weight: 750;
    white-space: nowrap;
  }

  .home-link-all:hover {
    text-decoration: none;
    color: #0e7657;
  }

  .home-info-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr);
    gap: 16px;
  }

  .home-latest {
    min-height: 355px;
    padding: 22px;
  }

  .home-latest-head {
    display: grid;
    grid-template-columns: 10px 1fr auto;
    gap: 10px;
    align-items: center;
    padding-bottom: 13px;
    border-bottom: 1px solid var(--waktu-panel-garis);
  }

  .home-live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #e04c3e;
    box-shadow: 0 0 0 5px rgba(224, 76, 62, .1);
  }

  .home-latest-head small {
    display: block;
    color: var(--waktu-panel-teks-2);
    font-size: 8px;
    font-weight: 800;
    letter-spacing: .12em;
  }

  .home-latest-head h3 {
    margin: 2px 0 0;
    font-size: 15px;
  }

  .home-latest-head > a {
    color: var(--waktu-panel-teks-2);
    font-size: 9.5px;
    font-weight: 700;
  }

  .home-latest-main {
    padding: 22px 0 16px;
  }

  .home-latest-main time {
    display: inline-flex;
    padding: 5px 8px;
    border-radius: 999px;
    color: #116d51;
    background: rgba(31, 151, 103, .09);
    font-size: 8.5px;
    font-weight: 800;
  }

  .home-latest-main h4 {
    max-width: 24ch;
    margin: 11px 0 8px;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(22px, 2.5vw, 29px);
    line-height: 1.1;
    letter-spacing: -.025em;
  }

  .home-latest-main h4 a {
    color: inherit;
  }

  .home-latest-main p {
    display: -webkit-box;
    max-width: 62ch;
    margin: 0;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    color: var(--waktu-panel-teks-2);
    font-size: 11px;
    line-height: 1.58;
  }

  .home-read {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 13px;
    color: #126e53;
    font-size: 10px;
    font-weight: 800;
  }

  .home-latest-list {
    display: grid;
    border-top: 1px solid var(--waktu-panel-garis);
  }

  .home-latest-list a {
    display: grid;
    grid-template-columns: 76px minmax(0, 1fr) 18px;
    gap: 10px;
    align-items: center;
    min-height: 45px;
    border-bottom: 1px solid var(--waktu-panel-garis);
    text-decoration: none;
  }

  .home-latest-list a:last-child {
    border-bottom: 0;
  }

  .home-latest-list span {
    color: var(--waktu-panel-teks-2);
    font-size: 8.5px;
  }

  .home-latest-list strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--waktu-panel-teks);
    font-size: 10px;
  }

  .home-latest-list b {
    color: #177457;
  }

  .home-important-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .home-important-card {
    position: relative;
    min-height: 170px;
    padding: 18px;
    overflow: hidden;
    border-radius: 15px;
    border: 1px solid var(--waktu-panel-garis);
    background: var(--waktu-panel);
    box-shadow: var(--waktu-bayang);
    color: var(--waktu-panel-teks);
    text-decoration: none;
    transition: transform .18s ease, box-shadow .18s ease;
  }

  .home-important-card:hover {
    transform: translateY(-2px);
    text-decoration: none;
  }

  .home-important-card:after {
    content: "";
    position: absolute;
    width: 90px;
    height: 90px;
    right: -28px;
    top: -30px;
    border-radius: 50%;
    background: currentColor;
    opacity: .055;
  }

  .home-important-icon {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    border-radius: 11px;
    font-size: 17px;
    font-weight: 850;
  }

  .home-important-card.merah .home-important-icon { color: #b72e3b; background: #fce9ec; }
  .home-important-card.biru .home-important-icon { color: #17699e; background: #e8f3fa; }
  .home-important-card.emas .home-important-icon { color: #aa750c; background: #fff3d7; }
  .home-important-card.hijau .home-important-icon { color: #137151; background: #e7f5ef; }

  .home-important-label {
    display: block;
    margin-top: 11px;
    color: var(--waktu-panel-teks-2);
    font-family: "IBM Plex Mono", ui-monospace, monospace;
    font-size: 7.5px;
    font-weight: 850;
    letter-spacing: .11em;
  }

  .home-important-card > strong {
    display: block;
    margin-top: 4px;
    font-size: 13px;
  }

  .home-important-card p {
    margin: 6px 0 13px;
    color: var(--waktu-panel-teks-2);
    font-size: 9.5px;
    line-height: 1.48;
  }

  .home-important-go {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
    color: var(--waktu-panel-teks);
    font-size: 8.5px;
    font-weight: 750;
  }

  .home-important-go b {
    font-size: 14px;
  }

  .home-explore-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  .home-explore-card {
    min-width: 0;
    min-height: 92px;
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr) 20px;
    gap: 10px;
    align-items: center;
    padding: 13px;
    border: 1px solid var(--waktu-panel-garis);
    border-radius: 12px;
    color: var(--waktu-panel-teks);
    background: var(--waktu-panel);
    box-shadow: var(--waktu-bayang);
    text-decoration: none;
  }

  .home-explore-card:hover {
    text-decoration: none;
    transform: translateY(-1px);
  }

  .home-explore-icon {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    color: #116e53;
    background: rgba(37, 145, 104, .11);
    font-size: 18px;
  }

  .home-explore-card strong,
  .home-explore-card small {
    display: block;
  }

  .home-explore-card strong {
    font-size: 10.5px;
  }

  .home-explore-card small {
    margin-top: 4px;
    color: var(--waktu-panel-teks-2);
    font-size: 8px;
    line-height: 1.4;
  }

  .home-explore-arrow {
    color: #16805f;
    font-size: 16px;
  }

  .home-activity-grid {
    display: grid;
    grid-template-columns: 1.35fr repeat(3, 1fr);
    gap: 12px;
  }

  .home-activity-card {
    position: relative;
    min-height: 245px;
    overflow: hidden;
    border-radius: 15px;
    color: #fff;
    box-shadow: var(--waktu-bayang);
    text-decoration: none;
  }

  .home-activity-card img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform .35s ease;
  }

  .home-activity-card:hover img {
    transform: scale(1.035);
  }

  .home-activity-shade {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 34%, rgba(5,31,24,.82));
  }

  .home-activity-copy {
    position: absolute;
    left: 17px;
    right: 17px;
    bottom: 16px;
  }

  .home-activity-copy small,
  .home-activity-copy strong,
  .home-activity-copy b {
    display: block;
  }

  .home-activity-copy small {
    font-size: 8px;
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
    opacity: .82;
  }

  .home-activity-copy strong {
    margin-top: 4px;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 18px;
    line-height: 1.1;
  }

  .home-activity-card.unggulan .home-activity-copy strong {
    font-size: 23px;
  }

  .home-activity-copy b {
    margin-top: 9px;
    font-size: 8.5px;
    font-weight: 700;
    opacity: .9;
  }

  .home-bottom-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }

  .home-bottom-panel {
    min-width: 0;
  }

  .home-gallery {
    display: grid;
    grid-template-columns: 1.35fr .65fr;
    grid-template-rows: 110px 110px;
    gap: 7px;
  }

  .home-gallery a {
    overflow: hidden;
    border-radius: 11px;
    border: 1px solid var(--waktu-panel-garis);
    box-shadow: var(--waktu-bayang);
  }

  .home-gallery a:first-child {
    grid-row: span 2;
  }

  .home-gallery img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    transition: transform .25s ease;
  }

  .home-gallery a:hover img {
    transform: scale(1.035);
  }

  .home-gallery a:nth-child(4) {
    display: none;
  }

  .home-umkm {
    display: grid;
    gap: 7px;
  }

  .home-umkm > a {
    min-height: 50px;
    display: grid;
    grid-template-columns: 46px minmax(0, 1fr) 18px;
    gap: 10px;
    align-items: center;
    padding: 5px 9px 5px 5px;
    border: 1px solid var(--waktu-panel-garis);
    border-radius: 10px;
    color: var(--waktu-panel-teks);
    background: var(--waktu-panel);
    box-shadow: var(--waktu-bayang);
    text-decoration: none;
  }

  .home-umkm-photo {
    width: 46px;
    height: 40px;
    display: grid;
    place-items: center;
    overflow: hidden;
    border-radius: 8px;
    color: #1a7558;
    background: rgba(31, 139, 99, .1);
    font-size: 10px;
    font-weight: 800;
  }

  .home-umkm-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .home-umkm-copy strong,
  .home-umkm-copy small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .home-umkm-copy strong {
    font-size: 10px;
  }

  .home-umkm-copy small {
    margin-top: 2px;
    color: var(--waktu-panel-teks-2);
    font-size: 8px;
  }

  .home-umkm > a > b {
    color: #167958;
  }

  .home-cta {
    position: relative;
    overflow: hidden;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 30px;
    align-items: center;
    padding: 30px 34px;
    border: 1px solid rgba(19, 102, 78, .18);
    border-radius: 18px;
    background:
      radial-gradient(circle at 90% 10%, rgba(220, 173, 67, .18), transparent 27%),
      linear-gradient(135deg, rgba(236, 247, 241, .95), rgba(255,255,255,.95));
    box-shadow: var(--waktu-bayang);
  }

  .home-cta h2 {
    margin: 5px 0 7px;
    color: #153f35;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(25px, 3vw, 34px);
    letter-spacing: -.035em;
  }

  .home-cta p:not(.home-kicker) {
    max-width: 70ch;
    margin: 0;
    color: #60736d;
    font-size: 10.5px;
    line-height: 1.55;
  }

  .home-cta-actions {
    display: flex;
    gap: 9px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .home-cta-actions a {
    min-height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 9px 15px;
    border-radius: 999px;
    color: #fff;
    background: #0e704f;
    font-size: 9.5px;
    font-weight: 800;
    text-decoration: none;
  }

  .home-cta-actions a.sekunder {
    color: #155441;
    background: rgba(255,255,255,.8);
    border: 1px solid rgba(21,84,65,.16);
  }

  :global(:root[data-waktu="sore"]) .home-kicker,
  :global(:root[data-waktu="malam"]) .home-kicker {
    color: #9bd9c5;
  }

  :global(:root[data-waktu="sore"]) .home-cta,
  :global(:root[data-waktu="malam"]) .home-cta {
    border-color: var(--waktu-panel-garis);
    background: var(--waktu-panel);
  }

  :global(:root[data-waktu="sore"]) .home-cta h2,
  :global(:root[data-waktu="malam"]) .home-cta h2 {
    color: var(--waktu-panel-teks);
  }

  :global(:root[data-waktu="sore"]) .home-cta p:not(.home-kicker),
  :global(:root[data-waktu="malam"]) .home-cta p:not(.home-kicker) {
    color: var(--waktu-panel-teks-2);
  }

  @media (max-width: 980px) {
    .home-info-grid,
    .home-bottom-grid {
      grid-template-columns: 1fr;
    }

    .home-important-grid,
    .home-explore-grid,
    .home-activity-grid {
      grid-template-columns: 1fr 1fr;
    }

    .home-activity-card.unggulan {
      grid-column: span 2;
    }

    .home-activity-card {
      min-height: 230px;
    }

    .home-cta {
      grid-template-columns: 1fr;
    }

    .home-cta-actions {
      justify-content: flex-start;
    }
  }

  @media (max-width: 680px) {
    .home-section-head,
    .home-section-head.compact,
    .home-section-head.mini {
      align-items: flex-start;
      flex-direction: column;
      gap: 8px;
    }

    .home-section-head h2 {
      font-size: 26px;
    }

    .home-important-grid,
    .home-explore-grid,
    .home-activity-grid {
      grid-template-columns: 1fr;
    }

    .home-important-card {
      min-height: 155px;
    }

    .home-activity-card.unggulan {
      grid-column: auto;
    }

    .home-activity-card,
    .home-activity-card.unggulan {
      min-height: 220px;
    }

    .home-latest {
      min-height: 0;
      padding: 17px;
    }

    .home-latest-head {
      grid-template-columns: 9px 1fr;
    }

    .home-latest-head > a {
      grid-column: 2;
    }

    .home-latest-list a {
      grid-template-columns: 64px minmax(0, 1fr) 16px;
    }

    .home-gallery {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 150px 100px;
    }

    .home-gallery a:first-child {
      grid-column: span 2;
      grid-row: auto;
    }

    .home-gallery a:nth-child(4) {
      display: block;
    }

    .home-cta {
      padding: 24px 20px;
    }
  }
</style>
