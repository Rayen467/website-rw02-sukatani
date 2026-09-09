<script>
  import { isi } from "../keadaan/isi.svelte.js";
  import { waktu } from "../keadaan/waktu.svelte.js";
  import { gambarWaktuAbsolut } from "../inti/waktu.js";

  const daftar = $derived(isi.pengumuman || []);
  const gambarHero = $derived(gambarWaktuAbsolut(waktu.fase));

  const fotoBerita = [
    "./foto/kegiatan-kerja-bakti.jpg",
    "./foto/kegiatan-rapat-warga.jpg",
    "./foto/kegiatan-posyandu.jpg",
    "./foto/kegiatan-saluran-air.jpg",
    "./foto/kegiatan-pengecatan.jpg"
  ];

  const beritaContoh = [
    {
      id: "",
      judul: "Warga RW 02 Gelar Kerja Bakti Bersama Jaga Kebersihan Lingkungan",
      ringkas: "Kegiatan kerja bakti rutin kembali dilaksanakan dengan antusias oleh warga RW 02 Sukatani. Gotong royong ini bertujuan menjaga kebersihan lingkungan dan mempererat tali silaturahmi antarwarga.",
      tglText: "Sabtu, 12 September 2026",
      tipe: "lingkungan",
      penting: "true"
    },
    {
      id: "",
      judul: "Rapat Rutin Pengurus RW 02 Bahas Program Kerja Triwulan",
      ringkas: "Pengurus RW membahas evaluasi layanan warga dan agenda lingkungan berikutnya.",
      tglText: "8 September 2026",
      tipe: "pemerintahan"
    },
    {
      id: "",
      judul: "Posyandu Balita: Pemeriksaan Rutin dan Imunisasi",
      ringkas: "Pelayanan kesehatan balita dan konsultasi keluarga kembali dibuka untuk warga.",
      tglText: "6 September 2026",
      tipe: "posyandu"
    },
    {
      id: "",
      judul: "Penyaluran Bantuan Pangan untuk Warga RW 02",
      ringkas: "Informasi penyaluran bantuan sosial dan jadwal penerimaan untuk warga.",
      tglText: "3 September 2026",
      tipe: "bantuan sosial"
    },
    {
      id: "",
      judul: "Perbaikan Saluran Air Dilakukan Secara Gotong Royong",
      ringkas: "Warga bersama pengurus melakukan perbaikan saluran air untuk mencegah genangan.",
      tglText: "30 Agustus 2026",
      tipe: "pembangunan"
    }
  ];

  const agenda = [
    { tanggal: "14", bulan: "SEP", judul: "Kerja Bakti Lingkungan", jam: "07.00 – 10.00 WIB", lokasi: "Seluruh RW 02" },
    { tanggal: "17", bulan: "SEP", judul: "Posyandu Balita", jam: "08.00 – 11.00 WIB", lokasi: "Balai Warga" },
    { tanggal: "21", bulan: "SEP", judul: "Rapat Warga Triwulan", jam: "19.00 – 21.00 WIB", lokasi: "Balai Warga" },
    { tanggal: "28", bulan: "SEP", judul: "Pemeriksaan Kesehatan Gratis", jam: "08.00 – 12.00 WIB", lokasi: "Poskes RW 02" }
  ];

  const galeriFallback = [
    { foto: "./foto/kegiatan-kerja-bakti.jpg", judul: "Kerja Bakti September 2026" },
    { foto: "./foto/kegiatan-posyandu.jpg", judul: "Posyandu RW 02" },
    { foto: "./foto/kegiatan-rapat-warga.jpg", judul: "Rapat Warga" },
    { foto: "./foto/kegiatan-pengecatan.jpg", judul: "Pengecatan Lingkungan" },
    { foto: "./foto/kegiatan-kemerdekaan.jpg", judul: "Perayaan Kemerdekaan" },
    { foto: "./foto/kegiatan-saluran-air.jpg", judul: "Perbaikan Saluran Air" }
  ];

  const beritaAktif = $derived(daftar.length ? daftar.slice(0, 5) : beritaContoh);
  const unggulan = $derived(beritaAktif[0] || beritaContoh[0]);

  const galeriBerita = $derived.by(() => {
    const dariServer = isi.galeri || [];
    if (!dariServer.length) return galeriFallback;

    return dariServer.slice(0, 6).map((g, i) => ({
      foto: g.sampul || g.foto || galeriFallback[i % galeriFallback.length].foto,
      judul: g.judul || "Dokumentasi kegiatan RW 02"
    }));
  });

  function fotoUntuk(k, i = 0) {
    return k?.foto || k?.sampul || fotoBerita[i % fotoBerita.length];
  }

  function hrefBerita(k) {
    return k?.id ? "#/berita/" + k.id : "#/berita";
  }

  function labelTipe(k) {
    if (k?.tipe === "agenda") return "Kegiatan";
    return (k?.tipe || "Informasi").toString();
  }
</script>

<div class="berita-modern">
  <section class="berita-hero" style={"--berita-hero:url('" + gambarHero + "')"}>
    <div class="berita-hero-overlay"></div>
    <div class="berita-wadah berita-hero-grid">
      <div class="berita-hero-copy">
        <p class="berita-kicker"><span>↗</span> Informasi & Kabar Terkini</p>
        <h1>Kabar RW 02</h1>
        <h2>Informasi, Kegiatan, dan Kisah Warga</h2>
        <p>
          Berita terbaru seputar kegiatan, pembangunan, layanan warga, dan berbagai
          informasi penting di lingkungan RW 02 Sukatani.
        </p>
        <div class="berita-hero-aksi">
          <a class="berita-btn utama" href="#berita-utama">Jelajahi Berita <span>→</span></a>
          <a class="berita-btn video" href="#galeri-berita"><span class="play">▶</span> Video Kegiatan RW 02</a>
        </div>
      </div>

      <div class="berita-hero-kanan">
        <div class="berita-waktu">
          <small>{waktu.tanggal}</small>
          <strong>{waktu.jam} WIB</strong>
          <span>{waktu.label} · Permai Sukatani, Rajeg</span>
        </div>
        <blockquote>
          <span>“</span>
          <p>Berita yang baik menguatkan kebersamaan dan menjadi langkah kecil menuju lingkungan yang lebih baik.</p>
          <small>— RW 02 Sukatani</small>
        </blockquote>
      </div>
    </div>
  </section>

  <main class="berita-wadah berita-isi">
    <nav class="berita-shortcut" aria-label="Navigasi berita cepat">
      <a href="#berita-utama">
        <span class="shortcut-ikon orange">◖</span>
        <span><strong>Pengumuman</strong><small>Info penting untuk warga</small></span>
      </a>
      <a href="#kalender-berita">
        <span class="shortcut-ikon teal">▦</span>
        <span><strong>Kalender Kegiatan</strong><small>Agenda dan jadwal RW</small></span>
      </a>
      <a href="#galeri-berita">
        <span class="shortcut-ikon green">▣</span>
        <span><strong>Galeri</strong><small>Foto & video kegiatan</small></span>
      </a>
      <a href="#suara-warga">
        <span class="shortcut-ikon cyan">•••</span>
        <span><strong>Suara Warga</strong><small>Polling & diskusi</small></span>
      </a>
    </nav>

    <section class="berita-grid-utama" id="berita-utama">
      <div class="berita-unggulan-wrap">
        <div class="berita-judul-row">
          <div>
            <span class="judul-ikon orange">▣</span>
            <h2>Berita Utama</h2>
          </div>
          <a href="#/berita">Lihat Semua Berita <span>→</span></a>
        </div>

        <article class="berita-unggulan">
          <img src={fotoUntuk(unggulan, 0)} alt="" decoding="async" />
          <div class="berita-unggulan-lapis"></div>
          <div class="berita-unggulan-copy">
            <span class="berita-badge">{labelTipe(unggulan)}</span>
            <h3>{unggulan.judul}</h3>
            <p class="berita-meta">{unggulan.tglText || unggulan.tgl || "September 2026"} <span>•</span> RW 02 Sukatani</p>
            <p>{unggulan.ringkas || beritaContoh[0].ringkas}</p>
            <div class="unggulan-bawah">
              <a class="berita-btn utama" href={hrefBerita(unggulan)}>Baca Selengkapnya <span>→</span></a>
              <span class="berita-counter">01 / {String(Math.max(beritaAktif.length, 1)).padStart(2, "0")}</span>
            </div>
          </div>
        </article>
      </div>

      <aside class="berita-terbaru">
        <div class="berita-judul-row">
          <div>
            <span class="judul-ikon teal">▤</span>
            <h2>Berita Terbaru</h2>
          </div>
          <a href="#/berita">Lihat Semua <span>→</span></a>
        </div>

        <div class="berita-terbaru-list">
          {#each beritaAktif.slice(1, 5) as k, i}
            <a class="berita-list-item" href={hrefBerita(k)}>
              <img src={fotoUntuk(k, i + 1)} alt="" decoding="async" />
              <div>
                <p><span class="mini-badge">{labelTipe(k)}</span><small>{k.tglText || k.tgl || ""}</small></p>
                <h3>{k.judul}</h3>
                <span class="list-stat">◉ {98 + i * 28} &nbsp; ◌ {6 + i * 2}</span>
              </div>
              <b>›</b>
            </a>
          {/each}

          {#if beritaAktif.length < 2}
            {#each beritaContoh.slice(1, 5) as k, i}
              <a class="berita-list-item" href="#/berita">
                <img src={fotoUntuk(k, i + 1)} alt="" decoding="async" />
                <div>
                  <p><span class="mini-badge">{labelTipe(k)}</span><small>{k.tglText}</small></p>
                  <h3>{k.judul}</h3>
                  <span class="list-stat">◉ {98 + i * 28} &nbsp; ◌ {6 + i * 2}</span>
                </div>
                <b>›</b>
              </a>
            {/each}
          {/if}
        </div>
      </aside>
    </section>

    <section class="berita-kalender-section" id="kalender-berita">
      <div class="berita-agenda">
        <div class="berita-judul-row">
          <div>
            <span class="judul-ikon teal">▦</span>
            <div>
              <h2>Kalender Kegiatan</h2>
              <p>Agenda kegiatan RW 02 yang akan datang.</p>
            </div>
          </div>
          <a href="#/berita">Lihat Kalender Lengkap <span>→</span></a>
        </div>

        <div class="agenda-grid">
          {#each agenda as a}
            <article class="agenda-card">
              <div class="agenda-tanggal"><strong>{a.tanggal}</strong><small>{a.bulan}</small></div>
              <div>
                <h3>{a.judul}</h3>
                <p>◉ &nbsp; {a.jam}</p>
                <p>● &nbsp; {a.lokasi}</p>
                <span>Saya Akan Hadir</span>
              </div>
            </article>
          {/each}
        </div>
      </div>

      <aside class="kalender-mini" aria-label="Kalender September 2026">
        <div class="kalender-head"><span>‹</span><strong>September 2026</strong><span>›</span></div>
        <div class="kalender-hari"><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span></div>
        <div class="kalender-grid">
          <span></span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span>
          <span>7</span><span>8</span><span class="hari-ini">9</span><span>10</span><span>11</span><span>12</span><span>13</span>
          <span class="ada">14</span><span>15</span><span>16</span><span class="ada">17</span><span>18</span><span>19</span><span>20</span>
          <span class="ada">21</span><span>22</span><span>23</span><span>24</span><span>25</span><span>26</span><span>27</span>
          <span class="ada">28</span><span>29</span><span>30</span>
        </div>
        <div class="kalender-legenda"><span><i class="dot ada"></i>Ada kegiatan</span><span><i class="dot today"></i>Hari ini</span></div>
      </aside>
    </section>

    <section class="galeri-berita" id="galeri-berita">
      <div class="berita-judul-row">
        <div>
          <span class="judul-ikon green">◉</span>
          <div>
            <h2>Galeri Foto & Video</h2>
            <p>Dokumentasi kegiatan, pembangunan, dan momen kebersamaan warga.</p>
          </div>
        </div>
        <span class="galeri-di-berita">Galeri terintegrasi di halaman Berita</span>
      </div>

      <div class="galeri-berita-grid">
        {#each galeriBerita as g, i}
          <article class="galeri-berita-card">
            <img src={g.foto} alt="" decoding="async" />
            <span class="galeri-lapis"></span>
            {#if i === 5}<span class="galeri-play">▶</span>{/if}
            <strong>{g.judul}</strong>
          </article>
        {/each}
      </div>
    </section>

    <section class="suara-grid" id="suara-warga">
      <article class="suara-card polling">
        <div class="suara-head">
          <div><span class="judul-ikon green">▥</span><div><h2>Suara Warga</h2><p>Polling untuk membangun lingkungan yang lebih baik.</p></div></div>
        </div>
        <div class="poll-body">
          <div class="poll-meta"><span>POLLING</span><small>Berakhir 20 September 2026</small></div>
          <h3>Menurut Anda, apa prioritas pembangunan RW 02 tahun depan?</h3>
          <div class="poll-row"><span>Peningkatan penerangan jalan</span><b>39%</b></div>
          <div class="poll-bar"><i style="width:39%"></i></div>
          <div class="poll-row"><span>Perbaikan saluran drainase</span><b>28%</b></div>
          <div class="poll-bar"><i style="width:28%"></i></div>
          <div class="poll-row"><span>Penambahan ruang hijau/taman</span><b>22%</b></div>
          <div class="poll-bar"><i style="width:22%"></i></div>
          <div class="poll-row"><span>Lainnya</span><b>11%</b></div>
          <div class="poll-bar"><i style="width:11%"></i></div>
          <div class="poll-foot"><span>Total 168 suara</span><a href="#/pengaduan">Lihat Hasil Lengkap →</a></div>
        </div>
      </article>

      <article class="suara-card forum">
        <div class="suara-head">
          <div><span class="judul-ikon cyan">•••</span><div><h2>Forum Diskusi</h2><p>Temukan topik menarik dan sampaikan pendapat Anda.</p></div></div>
          <a href="#/pengaduan">Lihat Semua Diskusi →</a>
        </div>
        <div class="forum-ajakan">
          <span class="forum-chat">◉</span>
          <div><strong>Ada berita atau informasi penting?</strong><small>Mulai diskusi dengan warga lainnya.</small></div>
          <a href="#/pengaduan">＋ Buat Diskusi</a>
        </div>
        <div class="forum-topik">
          <strong>Topik Terbaru:</strong>
          <a href="#/pengaduan"><span>◌ &nbsp; Usulan penambahan tempat sampah di Blok C</span><b>12 komentar</b></a>
          <a href="#/pengaduan"><span>◌ &nbsp; Jadwal kerja bakti bulan depan</span><b>8 komentar</b></a>
          <a href="#/pengaduan"><span>◌ &nbsp; Program penghijauan lingkungan RW 02</span><b>6 komentar</b></a>
          <a href="#/pengaduan"><span>◌ &nbsp; Keamanan lingkungan dan pos ronda</span><b>5 komentar</b></a>
        </div>
      </article>

      <aside class="suara-quote">
        <img src="./foto/kegiatan-pengecatan.jpg" alt="" decoding="async" />
        <span></span>
        <blockquote>“Lingkungan harmonis, warga bahagia.”</blockquote>
        <a href="#/pengaduan">Ayo Berkontribusi →</a>
      </aside>
    </section>
  </main>
</div>

<style>
  .berita-modern {
    --news-paper: #f7f8f4;
    --news-card: #ffffff;
    --news-ink: #112f3e;
    --news-text: #526269;
    --news-line: #dfe7e2;
    --news-green: #087554;
    --news-deep: #075a47;
    --news-soft: #eaf5ef;
    width: 100vw;
    margin-left: calc(50% - 50vw);
    margin-top: -32px;
    margin-bottom: -64px;
    overflow: hidden;
    color: var(--news-ink);
    background:
      radial-gradient(circle at 4% 34%, rgba(77,149,99,.08), transparent 16%),
      radial-gradient(circle at 98% 63%, rgba(77,149,99,.07), transparent 17%),
      var(--news-paper);
    font-family: "Plus Jakarta Sans", system-ui, sans-serif;
  }

  .berita-wadah {
    width: min(1180px, calc(100% - 40px));
    margin-inline: auto;
  }

  .berita-hero {
    position: relative;
    min-height: 360px;
    display: flex;
    align-items: center;
    color: #fff;
    background: #173c35 var(--berita-hero) center 54% / cover no-repeat;
  }

  .berita-hero-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, rgba(4,43,39,.90) 0%, rgba(7,55,48,.60) 48%, rgba(4,28,26,.28) 74%, rgba(2,22,22,.45)),
      linear-gradient(180deg, rgba(3,23,22,.14), rgba(3,29,25,.38));
  }

  .berita-hero-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 250px;
    gap: 36px;
    align-items: center;
    padding: 58px 0 45px;
  }

  .berita-hero-copy { max-width: 650px; }

  .berita-kicker {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 12px;
    color: #f4fbf7;
    font-size: 9px;
    font-weight: 650;
  }

  .berita-kicker span {
    width: 25px;
    height: 25px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(244,210,82,.72);
    border-radius: 50%;
    color: #ffd24e;
    font-size: 11px;
  }

  .berita-hero h1 {
    margin: 0;
    color: #9bf0d2;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(43px, 5vw, 64px);
    line-height: .92;
    letter-spacing: -.045em;
  }

  .berita-hero h2 {
    margin: 4px 0 0;
    color: #fff;
    font-size: clamp(22px, 2.7vw, 31px);
    line-height: 1.04;
    letter-spacing: -.035em;
  }

  .berita-hero-copy > p:last-of-type {
    max-width: 53ch;
    margin: 12px 0 0;
    color: rgba(245,252,249,.91);
    font-size: 12.5px;
    line-height: 1.55;
  }

  .berita-hero-aksi {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 17px;
  }

  .berita-btn {
    min-height: 39px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 8px 16px;
    border-radius: 999px;
    font-size: 9.5px;
    font-weight: 750;
    text-decoration: none;
  }

  .berita-btn.utama {
    color: #fff;
    border: 1px solid #5fe4b7;
    background: linear-gradient(180deg, #149569, #087354);
    box-shadow: 0 12px 28px -18px rgba(28,226,158,.55);
  }

  .berita-btn.video {
    color: #fff;
    border: 1px solid rgba(255,255,255,.44);
    background: rgba(4,31,30,.36);
    backdrop-filter: blur(7px);
  }

  .play {
    width: 24px;
    height: 24px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255,255,255,.78);
    border-radius: 50%;
    font-size: 8px;
  }

  .berita-hero-kanan {
    display: grid;
    gap: 11px;
    align-self: center;
  }

  .berita-waktu,
  .berita-hero-kanan blockquote {
    border: 1px solid rgba(255,255,255,.25);
    border-radius: 12px;
    background: rgba(7,40,39,.54);
    backdrop-filter: blur(9px);
    box-shadow: 0 16px 30px -24px rgba(0,0,0,.6);
  }

  .berita-waktu {
    padding: 11px 13px;
  }

  .berita-waktu small,
  .berita-waktu span { display: block; }

  .berita-waktu small {
    color: rgba(255,255,255,.76);
    font-size: 7px;
  }

  .berita-waktu strong {
    display: block;
    margin-top: 2px;
    color: #fff;
    font-size: 19px;
    line-height: 1.05;
  }

  .berita-waktu span {
    margin-top: 4px;
    color: rgba(255,255,255,.72);
    font-size: 7px;
  }

  .berita-hero-kanan blockquote {
    margin: 0;
    padding: 14px 15px;
  }

  .berita-hero-kanan blockquote > span {
    color: #fff;
    font-family: Georgia, serif;
    font-size: 28px;
    line-height: .8;
  }

  .berita-hero-kanan blockquote p {
    margin: 5px 0 8px;
    color: #fff;
    font-family: Georgia, serif;
    font-size: 12px;
    line-height: 1.45;
  }

  .berita-hero-kanan blockquote small {
    color: rgba(255,255,255,.74);
    font-size: 7px;
  }

  .berita-isi {
    position: relative;
    z-index: 2;
    padding: 0 0 48px;
  }

  .berita-shortcut {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    margin-top: -18px;
    padding: 10px;
    border: 1px solid var(--news-line);
    border-radius: 13px;
    background: rgba(255,255,255,.94);
    box-shadow: 0 14px 36px -31px rgba(20,59,45,.42);
    backdrop-filter: blur(10px);
  }

  .berita-shortcut a {
    min-width: 0;
    min-height: 58px;
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr);
    gap: 10px;
    align-items: center;
    padding: 6px 8px;
    color: var(--news-ink);
    text-decoration: none;
    border-right: 1px solid var(--news-line);
  }

  .berita-shortcut a:last-child { border-right: 0; }

  .berita-shortcut strong,
  .berita-shortcut small { display: block; }

  .berita-shortcut strong { font-size: 10px; }

  .berita-shortcut small {
    margin-top: 2px;
    color: var(--news-text);
    font-size: 7.8px;
  }

  .shortcut-ikon,
  .judul-ikon {
    display: grid;
    place-items: center;
    border-radius: 9px;
    font-weight: 800;
  }

  .shortcut-ikon {
    width: 42px;
    height: 42px;
    font-size: 18px;
  }

  .shortcut-ikon.orange,
  .judul-ikon.orange { color: #c26f0a; background: #fff0d8; }
  .shortcut-ikon.teal,
  .judul-ikon.teal { color: #086c62; background: #dff3ed; }
  .shortcut-ikon.green,
  .judul-ikon.green { color: #107f55; background: #e1f4ea; }
  .shortcut-ikon.cyan,
  .judul-ikon.cyan { color: #087866; background: #ddf4ee; }

  .berita-grid-utama {
    display: grid;
    grid-template-columns: minmax(0, 1.18fr) minmax(330px, .82fr);
    gap: 18px;
    margin-top: 16px;
  }

  .berita-judul-row {
    min-height: 34px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 9px;
  }

  .berita-judul-row > div {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .berita-judul-row h2 {
    margin: 0;
    color: var(--news-ink);
    font-family: Georgia, "Times New Roman", serif;
    font-size: 20px;
    line-height: 1.05;
  }

  .berita-judul-row p {
    margin: 2px 0 0;
    color: var(--news-text);
    font-size: 8px;
  }

  .berita-judul-row > a {
    color: var(--news-green);
    font-size: 8px;
    font-weight: 750;
    text-decoration: none;
    white-space: nowrap;
  }

  .judul-ikon {
    width: 32px;
    height: 32px;
    flex: 0 0 32px;
    font-size: 15px;
  }

  .berita-unggulan {
    position: relative;
    min-height: 330px;
    overflow: hidden;
    border-radius: 11px;
    box-shadow: 0 17px 32px -27px rgba(0,0,0,.45);
  }

  .berita-unggulan > img,
  .berita-unggulan-lapis {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .berita-unggulan > img {
    object-fit: cover;
  }

  .berita-unggulan-lapis {
    background: linear-gradient(180deg, rgba(2,23,22,.03) 27%, rgba(2,28,25,.78) 68%, rgba(2,24,22,.94));
  }

  .berita-unggulan-copy {
    position: absolute;
    z-index: 1;
    left: 19px;
    right: 19px;
    bottom: 16px;
    color: #fff;
  }

  .berita-badge,
  .mini-badge {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    text-transform: uppercase;
    font-weight: 800;
  }

  .berita-badge {
    padding: 5px 9px;
    color: #123f30;
    background: #ffd65d;
    font-size: 7px;
  }

  .berita-unggulan h3 {
    max-width: 20ch;
    margin: 7px 0 6px;
    color: #fff;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(23px, 3vw, 34px);
    line-height: 1.02;
  }

  .berita-meta {
    margin: 0 0 7px;
    color: rgba(255,255,255,.83);
    font-size: 7.5px;
  }

  .berita-unggulan-copy > p:last-of-type {
    max-width: 66ch;
    margin: 0;
    color: rgba(255,255,255,.91);
    font-size: 9px;
    line-height: 1.45;
  }

  .unggulan-bawah {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: 10px;
  }

  .berita-counter {
    color: rgba(255,255,255,.88);
    font-size: 9px;
  }

  .berita-terbaru-list {
    display: grid;
    gap: 7px;
  }

  .berita-list-item {
    min-height: 72px;
    display: grid;
    grid-template-columns: 96px minmax(0, 1fr) 16px;
    gap: 9px;
    align-items: center;
    padding: 5px;
    border: 1px solid var(--news-line);
    border-radius: 9px;
    color: var(--news-ink);
    background: var(--news-card);
    box-shadow: 0 10px 24px -23px rgba(20,59,45,.35);
    text-decoration: none;
  }

  .berita-list-item > img {
    width: 96px;
    height: 61px;
    border-radius: 7px;
    object-fit: cover;
  }

  .berita-list-item p {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 3px;
  }

  .mini-badge {
    padding: 3px 6px;
    color: #176145;
    background: #dff3e8;
    font-size: 5.8px;
  }

  .berita-list-item p small {
    color: #77837f;
    font-size: 6px;
  }

  .berita-list-item h3 {
    margin: 0;
    color: var(--news-ink);
    font-size: 9.5px;
    line-height: 1.25;
  }

  .list-stat {
    display: block;
    margin-top: 4px;
    color: #77837f;
    font-size: 6px;
  }

  .berita-list-item > b {
    color: var(--news-green);
    font-size: 20px;
  }

  .berita-kalender-section {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 240px;
    gap: 17px;
    margin-top: 17px;
  }

  .agenda-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }

  .agenda-card {
    min-height: 112px;
    display: grid;
    grid-template-columns: 43px minmax(0, 1fr);
    gap: 8px;
    padding: 9px;
    border: 1px solid var(--news-line);
    border-radius: 9px;
    background: var(--news-card);
    box-shadow: 0 9px 23px -23px rgba(20,59,45,.35);
  }

  .agenda-tanggal {
    width: 43px;
    height: 45px;
    display: grid;
    align-content: center;
    justify-items: center;
    border-radius: 8px;
    color: #fff;
    background: linear-gradient(180deg, #0c7162, #085044);
  }

  .agenda-tanggal strong { font-size: 15px; line-height: 1; }
  .agenda-tanggal small { margin-top: 2px; font-size: 6px; }

  .agenda-card h3 {
    margin: 1px 0 6px;
    color: var(--news-ink);
    font-size: 9px;
    line-height: 1.25;
  }

  .agenda-card p {
    margin: 0 0 4px;
    color: var(--news-text);
    font-size: 6.5px;
  }

  .agenda-card > div:last-child > span {
    display: inline-flex;
    margin-top: 3px;
    padding: 4px 7px;
    border-radius: 999px;
    color: #176145;
    background: #dff3e8;
    font-size: 6.5px;
    font-weight: 700;
  }

  .kalender-mini {
    padding: 11px 12px;
    border: 1px solid var(--news-line);
    border-radius: 10px;
    background: var(--news-card);
    box-shadow: 0 12px 28px -25px rgba(20,59,45,.35);
  }

  .kalender-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 9px;
  }

  .kalender-head strong { font-size: 9px; }
  .kalender-head span { color: var(--news-green); font-size: 18px; }

  .kalender-hari,
  .kalender-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 3px;
    text-align: center;
  }

  .kalender-hari {
    margin-bottom: 3px;
    color: #75817d;
    font-size: 5.5px;
  }

  .kalender-grid span {
    min-height: 22px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: var(--news-text);
    font-size: 6.5px;
  }

  .kalender-grid .ada {
    color: #fff;
    background: #0e6856;
  }

  .kalender-grid .hari-ini {
    color: #0b7057;
    background: #d9f1e8;
    font-weight: 800;
  }

  .kalender-legenda {
    display: flex;
    gap: 10px;
    margin-top: 8px;
    color: #71807b;
    font-size: 5.5px;
  }

  .kalender-legenda span {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .dot {
    width: 7px;
    height: 7px;
    display: inline-block;
    border-radius: 50%;
  }

  .dot.ada { background: #0e6856; }
  .dot.today { background: #d9f1e8; }

  .galeri-berita {
    margin-top: 18px;
  }

  .galeri-di-berita {
    color: var(--news-green);
    font-size: 6.5px;
    font-weight: 700;
  }

  .galeri-berita-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 7px;
  }

  .galeri-berita-card {
    position: relative;
    height: 112px;
    overflow: hidden;
    border-radius: 9px;
    color: #fff;
    text-decoration: none;
  }

  .galeri-berita-card img,
  .galeri-lapis {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .galeri-berita-card img { object-fit: cover; }

  .galeri-lapis {
    background: linear-gradient(180deg, transparent 40%, rgba(2,24,22,.82));
  }

  .galeri-berita-card strong {
    position: absolute;
    z-index: 1;
    left: 8px;
    right: 8px;
    bottom: 8px;
    color: #fff;
    font-size: 7.5px;
    line-height: 1.25;
  }

  .galeri-play {
    position: absolute;
    z-index: 2;
    top: 10px;
    right: 10px;
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    border: 1px solid #fff;
    border-radius: 50%;
    background: rgba(0,0,0,.32);
    font-size: 9px;
  }

  .suara-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 180px;
    gap: 12px;
    margin-top: 18px;
  }

  .suara-card {
    min-width: 0;
  }

  .suara-head {
    min-height: 34px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 7px;
    margin-bottom: 7px;
  }

  .suara-head > div {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .suara-head h2 {
    margin: 0;
    color: var(--news-ink);
    font-family: Georgia, serif;
    font-size: 18px;
  }

  .suara-head p {
    margin: 2px 0 0;
    color: var(--news-text);
    font-size: 7px;
  }

  .suara-head > a {
    color: var(--news-green);
    font-size: 6.5px;
    font-weight: 700;
    text-decoration: none;
  }

  .poll-body,
  .forum-ajakan,
  .forum-topik {
    border: 1px solid var(--news-line);
    background: var(--news-card);
  }

  .poll-body {
    padding: 11px 12px;
    border-radius: 9px;
  }

  .poll-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .poll-meta span {
    padding: 3px 7px;
    border-radius: 999px;
    color: #fff;
    background: #13945f;
    font-size: 6px;
    font-weight: 800;
  }

  .poll-meta small {
    padding: 3px 7px;
    border-radius: 999px;
    color: #22624f;
    background: #dcf4e9;
    font-size: 6px;
  }

  .poll-body h3 {
    margin: 9px 0;
    color: var(--news-ink);
    font-size: 10px;
    line-height: 1.3;
  }

  .poll-row {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    color: var(--news-text);
    font-size: 6.8px;
  }

  .poll-bar {
    height: 7px;
    margin: 3px 0 6px;
    overflow: hidden;
    border-radius: 99px;
    background: #e5ebe8;
  }

  .poll-bar i {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #0b7655, #12a16e);
  }

  .poll-foot {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-top: 9px;
    color: #75827e;
    font-size: 6px;
  }

  .poll-foot a {
    color: var(--news-green);
    font-weight: 700;
  }

  .forum-ajakan {
    min-height: 58px;
    display: grid;
    grid-template-columns: 38px minmax(0, 1fr) auto;
    gap: 8px;
    align-items: center;
    padding: 8px;
    border-radius: 9px 9px 0 0;
  }

  .forum-chat {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: #fff;
    background: #1687e2;
    font-size: 16px;
  }

  .forum-ajakan strong,
  .forum-ajakan small { display: block; }

  .forum-ajakan strong { color: #164c8d; font-size: 8px; }
  .forum-ajakan small { margin-top: 2px; color: var(--news-text); font-size: 6px; }

  .forum-ajakan > a {
    padding: 7px 10px;
    border-radius: 6px;
    color: #fff;
    background: linear-gradient(180deg, #139765, #0a7452);
    font-size: 7px;
    font-weight: 750;
    text-decoration: none;
  }

  .forum-topik {
    display: grid;
    gap: 5px;
    padding: 9px 10px;
    border-top: 0;
    border-radius: 0 0 9px 9px;
  }

  .forum-topik > strong {
    color: var(--news-ink);
    font-size: 7.5px;
  }

  .forum-topik a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    color: var(--news-text);
    font-size: 6.5px;
    text-decoration: none;
  }

  .forum-topik a b {
    color: #1687e2;
    font-weight: 500;
    white-space: nowrap;
  }

  .suara-quote {
    position: relative;
    min-height: 222px;
    overflow: hidden;
    border-radius: 10px;
  }

  .suara-quote img,
  .suara-quote > span {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .suara-quote img { object-fit: cover; }

  .suara-quote > span {
    background: linear-gradient(180deg, rgba(5,36,28,.08), rgba(3,34,26,.70));
  }

  .suara-quote blockquote {
    position: absolute;
    z-index: 1;
    left: 15px;
    right: 15px;
    bottom: 53px;
    margin: 0;
    color: #fff;
    font-family: Georgia, serif;
    font-size: 18px;
    font-style: italic;
    line-height: 1.08;
    text-shadow: 0 2px 12px rgba(0,0,0,.42);
  }

  .suara-quote a {
    position: absolute;
    z-index: 1;
    left: 15px;
    bottom: 14px;
    padding: 7px 10px;
    border: 1px solid rgba(255,255,255,.72);
    border-radius: 999px;
    color: #fff;
    background: rgba(4,46,35,.48);
    font-size: 6.5px;
    text-decoration: none;
  }

  :global(:root[data-waktu="malam"]) .berita-modern {
    --news-paper: #071820;
    --news-card: #0b222a;
    --news-ink: #eef8f5;
    --news-text: #afc1bc;
    --news-line: rgba(196,225,216,.12);
    --news-soft: #102e2d;
  }

  :global(:root[data-waktu="malam"]) .berita-shortcut {
    background: rgba(9,31,38,.94);
  }

  :global(:root[data-waktu="malam"]) .berita-shortcut a {
    color: var(--news-ink);
  }

  @media (max-width: 980px) {
    .berita-grid-utama,
    .berita-kalender-section,
    .suara-grid {
      grid-template-columns: 1fr;
    }

    .berita-terbaru-list {
      grid-template-columns: 1fr 1fr;
    }

    .agenda-grid {
      grid-template-columns: 1fr 1fr;
    }

    .galeri-berita-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .suara-quote {
      min-height: 190px;
    }
  }

  @media (max-width: 680px) {
    .berita-modern {
      margin-top: -18px;
      margin-bottom: -44px;
    }

    .berita-wadah {
      width: 100%;
      max-width: 100%;
      padding-left: 14px;
      padding-right: 14px;
    }

    .berita-hero {
      min-height: 420px;
      background-position: 61% center;
    }

    .berita-hero-grid {
      grid-template-columns: 1fr;
      gap: 15px;
      padding: 38px 0 24px;
    }

    .berita-hero h1 {
      font-size: 42px;
    }

    .berita-hero h2 {
      max-width: 17ch;
      font-size: 24px;
    }

    .berita-hero-copy > p:last-of-type {
      max-width: 40ch;
      font-size: 11px;
    }

    .berita-hero-kanan {
      grid-template-columns: 1fr 1fr;
      gap: 7px;
    }

    .berita-hero-kanan blockquote {
      padding: 10px;
    }

    .berita-hero-kanan blockquote p {
      font-size: 9px;
    }

    .berita-waktu strong {
      font-size: 15px;
    }

    .berita-shortcut {
      grid-template-columns: 1fr 1fr;
      gap: 0;
      margin-top: -12px;
      padding: 6px;
    }

    .berita-shortcut a {
      border-right: 0;
      border-bottom: 1px solid var(--news-line);
    }

    .berita-shortcut a:nth-child(odd) {
      border-right: 1px solid var(--news-line);
    }

    .berita-shortcut a:nth-last-child(-n+2) {
      border-bottom: 0;
    }

    .berita-grid-utama {
      margin-top: 13px;
    }

    .berita-judul-row h2 {
      font-size: 18px;
    }

    .berita-unggulan {
      min-height: 300px;
    }

    .berita-unggulan-copy {
      left: 14px;
      right: 14px;
      bottom: 13px;
    }

    .berita-unggulan h3 {
      font-size: 25px;
    }

    .berita-terbaru-list {
      grid-template-columns: 1fr;
    }

    .berita-list-item {
      grid-template-columns: 88px minmax(0, 1fr) 14px;
    }

    .berita-list-item > img {
      width: 88px;
      height: 61px;
    }

    .agenda-grid {
      grid-template-columns: 1fr 1fr;
    }

    .kalender-mini {
      width: 100%;
    }

    .galeri-berita-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .galeri-berita-card {
      height: 105px;
    }

    .suara-grid {
      gap: 16px;
    }

    .suara-quote {
      min-height: 180px;
    }
  }

  @media (max-width: 420px) {
    .berita-hero {
      min-height: 450px;
    }

    .berita-hero h1 {
      font-size: 38px;
    }

    .berita-hero h2 {
      font-size: 21px;
    }

    .berita-hero-kanan {
      grid-template-columns: 1fr;
    }

    .berita-shortcut strong {
      font-size: 9px;
    }

    .berita-shortcut small {
      font-size: 7px;
    }

    .agenda-grid {
      grid-template-columns: 1fr;
    }

    .galeri-berita-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .berita-judul-row > a {
      font-size: 7px;
    }
  }
</style>
