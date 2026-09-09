<script>
  import { KONTEN } from "../inti/nama.js";
  import { konten, isi } from "../keadaan/isi.svelte.js";
  import { keDaftar } from "../inti/format.js";
  import { RT_BAWAAN, PENGURUS_RW_BAWAAN } from "../inti/bawaan.js";
  import { GAMBAR_WAKTU } from "../inti/waktu.js";

  const LOGO_RW =
    "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/f2bd27c4-a085-4824-923f-410a06b0adb2.png";

  const p = $derived(konten(KONTEN.PROFIL) || {});
  const misi = $derived(keDaftar(p.misi));
  const pengurus = $derived(isi.pengurus_tampil || []);

  const tentang = $derived(
    p.sejarah ||
      "Permai Sukatani adalah lingkungan hunian di wilayah Sukatani, Kecamatan Rajeg, Kabupaten Tangerang. Dengan semangat kebersamaan, halaman ini merangkum perjalanan lingkungan, nilai bersama, serta informasi wilayah RW 02."
  );

  const batas = $derived([
    { arah: "Utara", singkat: "U", nilai: p.batasUtara || "" },
    { arah: "Timur", singkat: "T", nilai: p.batasTimur || "" },
    { arah: "Selatan", singkat: "S", nilai: p.batasSelatan || "" },
    { arah: "Barat", singkat: "B", nilai: p.batasBarat || "" }
  ]);

  const statistik = $derived([
    { ikon: "peta", label: "Luas Wilayah", nilai: p.luas || "—", kecil: "ha" },
    { ikon: "warga", label: "Jumlah RT", nilai: p.jumlahRT || String(RT_BAWAAN.length), kecil: "RT" },
    { ikon: "rumah", label: "Kelurahan", nilai: "Sukatani", kecil: "" },
    { ikon: "pin", label: "Kecamatan", nilai: "Rajeg", kecil: "" },
    { ikon: "gedung", label: "Kabupaten", nilai: "Tangerang", kecil: "" },
    { ikon: "surat", label: "Kode Pos", nilai: "15540", kecil: "" }
  ]);

  const jabatanPrioritas = PENGURUS_RW_BAWAAN;

  function normal(s) {
    return String(s || "").trim().toLowerCase();
  }

  const pengurusRingkas = $derived.by(() =>
    jabatanPrioritas.map((bawaan) => {
      const cocok = pengurus.find((orang) => {
        const j = normal(orang.jabatan);
        const target = normal(bawaan.jabatan);
        return j === target || j.includes(target) || target.includes(j);
      });
      return cocok
        ? {
            ...cocok,
            ...bawaan,
            foto: bawaan.foto || cocok.foto,
            periode: cocok.periode || bawaan.periode,
            kontak: cocok.kontak || bawaan.kontak
          }
        : { ...bawaan };
    })
  );

  const perjalanan = $derived([
    {
      tahap: "Awal",
      teks: "Kawasan mulai berkembang sebagai lingkungan hunian dan ruang hidup bersama.",
      gambar: GAMBAR_WAKTU.pagi,
      kelas: "awal"
    },
    {
      tahap: "Perkembangan",
      teks: "Pertumbuhan warga dan fasilitas lingkungan berjalan dari waktu ke waktu.",
      gambar: GAMBAR_WAKTU.siang,
      kelas: "tumbuh"
    },
    {
      tahap: "Hari Ini",
      teks: "RW 02 terus berkembang melalui pelayanan, kegiatan warga, dan semangat gotong royong.",
      gambar: GAMBAR_WAKTU.sore,
      kelas: "kini"
    }
  ]);
</script>

<div class="profil-modern">
  <section class="profil-hero" style={"--profil-hero:url('" + GAMBAR_WAKTU.siang + "')"}>
    <div class="profil-hero-lapis"></div>
    <div class="profil-wadah profil-hero-isi">
      <div class="profil-hero-copy">
        <p class="profil-kicker"><span></span> Permai Sukatani · Rajeg</p>
        <h1>Profil RW 02</h1>
        <h2>Lingkungan yang tumbuh bersama</h2>
        <p class="profil-hero-ringkas">
          Mengenal wilayah, perjalanan, nilai, dan kehidupan warga Permai Sukatani, Rajeg.
        </p>

        <div class="profil-chip-baris" aria-label="Informasi wilayah">
          <span class="profil-chip">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5V20H4z"/><path d="M9 20v-5h6v5"/></svg>
            RW 02
          </span>
          <span class="profil-chip">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></svg>
            Kel. Sukatani
          </span>
          <span class="profil-chip">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V9h5v11M10 20V4h5v16M16 20v-8h4v8"/><path d="M2 20h20"/></svg>
            Kec. Rajeg
          </span>
          <span class="profil-chip">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 19 5.2-7 3.2 3.8L15.5 9 21 19Z"/></svg>
            Kab. Tangerang
          </span>
        </div>
      </div>
    </div>
  </section>

  <section class="profil-bagian profil-tentang">
    <div class="profil-wadah profil-dua-kolom">
      <div class="profil-copy-besar">
        <p class="profil-label"><span>02</span> Tentang lingkungan</p>
        <h2>Tentang<br />Permai Sukatani</h2>
        <p>{tentang}</p>
        <a class="profil-tombol" href="#/galeri">Lihat Galeri Lingkungan <span>→</span></a>
      </div>

      <div class="profil-foto-utama">
        <img src={GAMBAR_WAKTU.siang} alt="Ilustrasi lingkungan Permai Sukatani" decoding="async" />
        <div class="profil-foto-quote">
          <span>❝</span>
          <p>Rumah yang baik,<br />tumbuh bersama warganya.</p>
        </div>
        <div class="profil-foto-lokasi">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></svg>
          Permai Sukatani, Rajeg
        </div>
      </div>
    </div>
  </section>

  <section class="profil-bagian profil-perjalanan-visi">
    <div class="profil-wadah profil-dua-panel">
      <div>
        <div class="profil-judul-bagian">
          <h2>Perjalanan Permai Sukatani</h2>
          <p>Sejarah singkat</p>
        </div>

        <div class="profil-timeline">
          {#each perjalanan as item, i}
            <article class="profil-timeline-item {item.kelas}">
              <div class="profil-timeline-garis"><span></span></div>
              <h3>{item.tahap}</h3>
              <p>{item.teks}</p>
              <img
                class:grayscale={i === 0}
                src={item.gambar}
                alt=""
                aria-hidden="true"
                decoding="async"
              />
            </article>
          {/each}
        </div>
      </div>

      <div class="profil-visi">
        <div class="profil-judul-bagian profil-judul-sejajar">
          <h2>Visi &amp; Misi</h2>
          <p>Nilai dan arah</p>
        </div>

        <div class="profil-visi-kartu">
          <div class="profil-visi-ikon">⌁</div>
          <div>
            <span>Visi</span>
            <blockquote>{p.visi || "Visi belum diisi pengurus."}</blockquote>
          </div>
        </div>

        <div class="profil-misi">
          <div class="profil-misi-judul"><span>✤</span><b>Misi</b></div>
          {#if misi.length}
            <ol>
              {#each misi.slice(0, 6) as item, i}
                <li>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <p>{item}</p>
                </li>
              {/each}
            </ol>
          {:else}
            <div class="profil-belum">Misi belum diisi pengurus.</div>
          {/if}
        </div>
      </div>
    </div>
  </section>

  <section class="profil-bagian profil-data-batas">
    <div class="profil-wadah profil-dua-panel">
      <div>
        <div class="profil-judul-bagian">
          <h2>Wilayah dalam Angka</h2>
          <p>Data administratif</p>
        </div>

        <div class="profil-stat-grid">
          {#each statistik as s}
            <article class="profil-stat">
              <div class="profil-stat-ikon" aria-hidden="true">
                {#if s.ikon === "peta"}▱{:else if s.ikon === "warga"}♟{:else if s.ikon === "rumah"}⌂{:else if s.ikon === "pin"}●{:else if s.ikon === "gedung"}▥{:else}✉{/if}
              </div>
              <span>{s.label}</span>
              <strong>{s.nilai}</strong>
              {#if s.kecil}<small>{s.kecil}</small>{/if}
            </article>
          {/each}
        </div>
      </div>

      <div>
        <div class="profil-judul-bagian profil-judul-sejajar">
          <h2>Batas Wilayah</h2>
          <p>Batas administratif</p>
        </div>

        <div class="profil-kompas">
          <div class="profil-batas utara">
            <span>♠</span>
            <div><small>Sebelah Utara</small><b>{p.batasUtara || "Belum diisi"}</b></div>
          </div>
          <div class="profil-batas barat">
            <span>←</span>
            <div><small>Sebelah Barat</small><b>{p.batasBarat || "Belum diisi"}</b></div>
          </div>
          <div class="profil-kompas-tengah">
            <span class="u">U</span><span class="t">T</span><span class="s">S</span><span class="b">B</span>
            <div class="profil-kompas-logo"><img src={LOGO_RW} alt="Logo RW 02" /></div>
          </div>
          <div class="profil-batas timur">
            <span>→</span>
            <div><small>Sebelah Timur</small><b>{p.batasTimur || "Belum diisi"}</b></div>
          </div>
          <div class="profil-batas selatan">
            <span>♠</span>
            <div><small>Sebelah Selatan</small><b>{p.batasSelatan || "Belum diisi"}</b></div>
          </div>
        </div>

        <p class="profil-catatan">
          Batas wilayah diisi menurut keterangan pengurus RW dan dicocokkan dengan data kantor desa.
        </p>
      </div>
    </div>
  </section>

  <section class="profil-bagian profil-pengurus">
    <div class="profil-wadah">
      <div class="profil-judul-bagian profil-pengurus-kepala">
        <div>
          <h2>Pengurus RW 02</h2>
          <p>Struktur pengurus</p>
        </div>
        <a href="#/pengurus">Lihat Struktur Lengkap <span>→</span></a>
      </div>

      <div class="profil-pengurus-grid">
        {#each pengurusRingkas as orang}
          <article class="profil-orang">
            <div class="profil-avatar">
              {#if orang.foto}
                <img src={orang.foto} alt="" decoding="async" />
              {:else}
                <svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="14" r="8"/><path d="M7 36c1.5-9 7-13 13-13s11.5 4 13 13"/></svg>
              {/if}
            </div>
            <div>
              <span>{orang.jabatan}</span>
              <strong>{orang.nama || "Nama belum tersedia"}</strong>
              <small>{orang.periode || "Periode belum diisi"}</small>
            </div>
          </article>
        {/each}
      </div>
    </div>
  </section>

  <section class="profil-penutup" style={"--profil-penutup:url('" + GAMBAR_WAKTU.sore + "')"}>
    <div class="profil-penutup-lapis"></div>
    <div class="profil-wadah profil-penutup-isi">
      <div>
        <p class="profil-kicker"><span></span> Permai Sukatani</p>
        <h2>Lingkungan yang baik<br />berawal dari warga yang peduli.</h2>
      </div>
      <blockquote>“Bersama, kita jaga<br />rumah kita.”</blockquote>
    </div>
  </section>
</div>

<style>
  .profil-modern {
    --pm-hijau: #0c6b4b;
    --pm-hijau-tua: #093d30;
    --pm-hijau-muda: #eaf3ec;
    --pm-krim: #fbfaf5;
    --pm-tinta: #15372f;
    --pm-teks: #505b57;
    --pm-garis: rgba(19, 69, 55, 0.12);
    width: 100vw;
    margin-left: calc(50% - 50vw);
    margin-top: -32px;
    margin-bottom: -64px;
    color: var(--pm-tinta);
    background: var(--pm-krim);
    font-family: "Plus Jakarta Sans", system-ui, sans-serif;
    overflow: hidden;
  }

  .profil-wadah {
    width: min(1180px, calc(100% - 48px));
    margin-inline: auto;
  }

  .profil-hero {
    position: relative;
    min-height: 430px;
    display: flex;
    align-items: flex-end;
    color: white;
    background: #12392e var(--profil-hero) center 54% / cover no-repeat;
  }

  .profil-hero-lapis,
  .profil-penutup-lapis {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .profil-hero-lapis {
    background:
      linear-gradient(90deg, rgba(2, 26, 22, .82) 0%, rgba(2, 26, 22, .55) 42%, rgba(2, 26, 22, .06) 74%),
      linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.36));
  }

  .profil-hero-isi {
    position: relative;
    z-index: 1;
    padding: 86px 0 46px;
  }

  .profil-hero-copy { max-width: 625px; }

  .profil-kicker {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 14px;
    font-family: "IBM Plex Mono", monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
  }

  .profil-kicker span {
    width: 22px;
    height: 3px;
    flex: none;
    background: #f0bd22;
    border-radius: 99px;
  }

  .profil-hero h1 {
    margin: 0;
    font-family: "Archivo", sans-serif;
    font-size: clamp(47px, 6vw, 72px);
    line-height: .96;
    letter-spacing: -.055em;
    font-weight: 800;
    color: #fff;
  }

  .profil-hero h2 {
    margin: 8px 0 0;
    font-family: "Archivo", sans-serif;
    font-size: clamp(22px, 3vw, 31px);
    line-height: 1.05;
    letter-spacing: -.035em;
    color: #fff;
  }

  .profil-hero-ringkas {
    max-width: 560px;
    margin: 13px 0 0;
    color: rgba(255,255,255,.92);
    font-size: 14px;
    line-height: 1.55;
  }

  .profil-chip-baris {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 27px;
  }

  .profil-chip {
    min-height: 36px;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 12px;
    border: 1px solid rgba(255,255,255,.19);
    border-radius: 8px;
    color: #fff;
    background: rgba(5, 37, 30, .32);
    backdrop-filter: blur(7px);
    font-size: 10.5px;
    font-weight: 650;
  }

  .profil-chip svg,
  .profil-foto-lokasi svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .profil-bagian { padding: 52px 0; }
  .profil-tentang { background: #fbfaf6; }
  .profil-perjalanan-visi { background: #fff; }
  .profil-data-batas { background: #f7f7f1; }
  .profil-pengurus { background: #fff; }

  .profil-dua-kolom {
    display: grid;
    grid-template-columns: .78fr 1.22fr;
    gap: clamp(40px, 6vw, 76px);
    align-items: center;
  }

  .profil-label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 17px;
    color: #6f7b77;
    font-family: "IBM Plex Mono", monospace;
    font-size: 9.5px;
    letter-spacing: .09em;
    text-transform: uppercase;
  }

  .profil-label::before {
    content: "";
    width: 18px;
    height: 2px;
    background: #e3ad1b;
  }

  .profil-label span { color: var(--pm-hijau-tua); font-weight: 700; }

  .profil-copy-besar h2 {
    margin: 0;
    max-width: 10ch;
    font-family: "Archivo", sans-serif;
    font-size: clamp(34px, 4.3vw, 50px);
    line-height: .98;
    letter-spacing: -.055em;
    color: #143a30;
  }

  .profil-copy-besar > p:not(.profil-label) {
    max-width: 53ch;
    margin: 18px 0 0;
    color: var(--pm-teks);
    font-size: 14px;
    line-height: 1.68;
  }

  .profil-tombol {
    display: inline-flex;
    align-items: center;
    gap: 13px;
    margin-top: 20px;
    padding: 11px 16px;
    border-radius: 6px;
    color: #fff;
    background: linear-gradient(135deg, #0d7454, #327b2e);
    box-shadow: 0 11px 24px -17px rgba(10, 85, 54, .65);
    font-size: 11px;
    font-weight: 700;
  }

  .profil-tombol:hover { text-decoration: none; transform: translateY(-1px); }

  .profil-foto-utama {
    position: relative;
    min-height: 300px;
    overflow: hidden;
    border-radius: 12px;
    box-shadow: 0 25px 55px -38px rgba(20, 60, 45, .45);
  }

  .profil-foto-utama > img {
    width: 100%;
    height: 100%;
    min-height: 300px;
    display: block;
    object-fit: cover;
    object-position: center;
  }

  .profil-foto-quote {
    position: absolute;
    top: 18px;
    right: 18px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 14px;
    border: 1px solid rgba(255,255,255,.45);
    border-radius: 13px;
    color: #174c3e;
    background: rgba(248, 253, 249, .82);
    backdrop-filter: blur(10px);
    box-shadow: 0 10px 25px -18px rgba(0,0,0,.38);
  }

  .profil-foto-quote > span {
    width: 28px;
    height: 28px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: #12845e;
    background: #e6f4ea;
    font-size: 18px;
  }

  .profil-foto-quote p { margin: 0; font-size: 10px; line-height: 1.4; }

  .profil-foto-lokasi {
    position: absolute;
    left: 17px;
    bottom: 15px;
    display: flex;
    align-items: center;
    gap: 6px;
    color: #fff;
    font-size: 9.5px;
    font-weight: 650;
    text-shadow: 0 2px 8px rgba(0,0,0,.7);
  }

  .profil-dua-panel {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(42px, 7vw, 82px);
    align-items: start;
  }

  .profil-judul-bagian {
    margin-bottom: 25px;
  }

  .profil-judul-bagian h2 {
    margin: 0;
    font-family: "Archivo", sans-serif;
    font-size: clamp(23px, 2.8vw, 31px);
    line-height: 1.05;
    letter-spacing: -.04em;
    color: #15372f;
  }

  .profil-judul-bagian > p,
  .profil-judul-bagian > div > p {
    margin: 6px 0 0;
    color: #7b8985;
    font-family: "IBM Plex Mono", monospace;
    font-size: 8.5px;
    letter-spacing: .11em;
    text-transform: uppercase;
  }

  .profil-judul-bagian > p::before,
  .profil-judul-bagian > div > p::before {
    content: "";
    display: inline-block;
    width: 16px;
    height: 2px;
    margin-right: 7px;
    vertical-align: 3px;
    background: #1f8e66;
  }

  .profil-judul-sejajar {
    display: flex;
    align-items: baseline;
    gap: 12px;
  }

  .profil-timeline {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  .profil-timeline-item {
    min-width: 0;
  }

  .profil-timeline-garis {
    position: relative;
    height: 13px;
    border-top: 1px solid #b9cbc4;
  }

  .profil-timeline-garis span {
    position: absolute;
    top: -4px;
    left: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #167856;
    box-shadow: 0 0 0 3px white;
  }

  .profil-timeline-item.awal .profil-timeline-garis { border-color: #dfad24; }
  .profil-timeline-item.awal .profil-timeline-garis span { background: #dfad24; }

  .profil-timeline-item h3 {
    margin: 0;
    font-family: "Archivo", sans-serif;
    font-size: 12px;
    letter-spacing: -.02em;
    color: #15372f;
  }

  .profil-timeline-item > p {
    min-height: 64px;
    margin: 5px 0 12px;
    color: #69736f;
    font-size: 10px;
    line-height: 1.45;
  }

  .profil-timeline-item img {
    width: 100%;
    height: 126px;
    display: block;
    object-fit: cover;
    border-radius: 7px;
  }

  .profil-timeline-item img.grayscale {
    filter: grayscale(1) sepia(.13) contrast(.88);
  }

  .profil-visi-kartu {
    position: relative;
    overflow: hidden;
    display: grid;
    grid-template-columns: 34px 1fr;
    gap: 10px;
    padding: 17px 18px;
    border: 1px solid #d6e2d8;
    border-radius: 9px;
    background:
      radial-gradient(circle at 92% 25%, rgba(92, 153, 83, .13), transparent 24%),
      linear-gradient(135deg, #f2f7ef, #e9f1e8);
  }

  .profil-visi-ikon {
    font-size: 31px;
    line-height: 1;
    color: #2f8d62;
  }

  .profil-visi-kartu span {
    color: #1b513f;
    font-size: 11px;
    font-weight: 800;
  }

  .profil-visi-kartu blockquote {
    margin: 4px 0 0;
    color: #174c3d;
    font-family: "Archivo", sans-serif;
    font-size: clamp(17px, 2vw, 22px);
    line-height: 1.14;
    letter-spacing: -.03em;
    font-weight: 750;
  }

  .profil-misi { margin-top: 17px; }

  .profil-misi-judul {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #1a533f;
    font-size: 12px;
  }

  .profil-misi-judul span { color: #2d986b; font-size: 17px; }

  .profil-misi ol {
    margin: 12px 0 0;
    padding: 0;
    list-style: none;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 11px 18px;
  }

  .profil-misi li {
    display: grid;
    grid-template-columns: 27px 1fr;
    gap: 7px;
    align-items: start;
  }

  .profil-misi li > span {
    color: #164c3b;
    font-family: "IBM Plex Mono", monospace;
    font-size: 15px;
    font-weight: 700;
  }

  .profil-misi li p {
    margin: 0;
    color: #5c6964;
    font-size: 9.8px;
    line-height: 1.45;
  }

  .profil-belum {
    margin-top: 12px;
    padding: 14px;
    border: 1px dashed #c9d6ce;
    border-radius: 8px;
    color: #71807b;
    font-size: 11px;
  }

  .profil-stat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .profil-stat {
    position: relative;
    min-height: 112px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 14px 8px;
    border: 1px solid #dce5dc;
    border-radius: 9px;
    background: linear-gradient(145deg, #f4f8f1, #edf3eb);
    text-align: center;
  }

  .profil-stat-ikon {
    margin-bottom: 7px;
    color: #368969;
    font-size: 20px;
    line-height: 1;
  }

  .profil-stat > span {
    color: #596762;
    font-size: 9px;
  }

  .profil-stat strong {
    margin-top: 4px;
    color: #153e31;
    font-family: "Archivo", sans-serif;
    font-size: 17px;
    line-height: 1;
  }

  .profil-stat small {
    margin-top: 3px;
    color: #7d8a86;
    font-size: 8px;
  }

  .profil-kompas {
    position: relative;
    min-height: 270px;
    display: grid;
    grid-template-columns: 1fr 116px 1fr;
    grid-template-rows: 74px 116px 74px;
    gap: 6px 11px;
    align-items: center;
  }

  .profil-batas {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 10px 11px;
    border: 1px solid #dce4dd;
    border-radius: 8px;
    background: rgba(255,255,255,.75);
    box-shadow: 0 10px 25px -22px rgba(30,70,55,.45);
  }

  .profil-batas > span {
    flex: none;
    color: #448d70;
    font-size: 20px;
  }

  .profil-batas small,
  .profil-batas b { display: block; }

  .profil-batas small {
    color: #74817c;
    font-size: 7.5px;
  }

  .profil-batas b {
    margin-top: 2px;
    color: #263f37;
    font-size: 8.5px;
    line-height: 1.25;
  }

  .profil-batas.utara { grid-column: 2; grid-row: 1; }
  .profil-batas.barat { grid-column: 1; grid-row: 2; }
  .profil-batas.timur { grid-column: 3; grid-row: 2; }
  .profil-batas.selatan { grid-column: 2; grid-row: 3; }

  .profil-kompas-tengah {
    position: relative;
    grid-column: 2;
    grid-row: 2;
    width: 100px;
    height: 100px;
    margin: auto;
    border: 1px solid #9fb4aa;
    border-radius: 50%;
    background: rgba(255,255,255,.78);
  }

  .profil-kompas-logo {
    position: absolute;
    inset: 20px;
    display: grid;
    place-items: center;
    overflow: hidden;
    border-radius: 50%;
  }

  .profil-kompas-logo img {
    width: 58px;
    height: 58px;
    object-fit: contain;
  }

  .profil-kompas-tengah > span {
    position: absolute;
    color: #244a3d;
    font-family: "IBM Plex Mono", monospace;
    font-size: 10px;
    font-weight: 800;
  }

  .profil-kompas-tengah .u { top: -17px; left: 47px; }
  .profil-kompas-tengah .t { right: -14px; top: 45px; }
  .profil-kompas-tengah .s { bottom: -17px; left: 47px; }
  .profil-kompas-tengah .b { left: -14px; top: 45px; }

  .profil-catatan {
    max-width: 52ch;
    margin: 12px 0 0 auto;
    color: #7c8783;
    font-size: 8.5px;
    line-height: 1.5;
    text-align: right;
  }

  .profil-pengurus-kepala {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
  }

  .profil-pengurus-kepala > a {
    padding: 8px 12px;
    border: 1px solid #4a8d73;
    border-radius: 6px;
    color: #26644f;
    font-size: 9px;
    font-weight: 700;
  }

  .profil-pengurus-kepala > a:hover {
    background: #eef6f1;
    text-decoration: none;
  }

  .profil-pengurus-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
  }

  .profil-orang {
    min-width: 0;
    min-height: 88px;
    display: grid;
    grid-template-columns: 58px 1fr;
    gap: 10px;
    align-items: center;
    padding: 10px;
    border: 1px solid #e0e5e0;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 10px 28px -25px rgba(22,60,45,.45);
  }

  .profil-avatar {
    width: 58px;
    height: 68px;
    display: grid;
    place-items: center;
    overflow: hidden;
    border-radius: 7px;
    background: #eff1ef;
  }

  .profil-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .profil-avatar svg {
    width: 34px;
    height: 34px;
    fill: #c8ceca;
    stroke: none;
  }

  .profil-orang span,
  .profil-orang strong,
  .profil-orang small { display: block; }

  .profil-orang span {
    color: #45534e;
    font-size: 8px;
    font-weight: 700;
  }

  .profil-orang strong {
    overflow: hidden;
    margin-top: 4px;
    color: #183e32;
    font-family: "Archivo", sans-serif;
    font-size: 11px;
    line-height: 1.25;
    text-overflow: ellipsis;
  }

  .profil-orang small {
    margin-top: 5px;
    color: #929b98;
    font-size: 7.5px;
    line-height: 1.35;
  }

  .profil-penutup {
    position: relative;
    min-height: 250px;
    display: flex;
    align-items: center;
    color: #fff;
    background: #17372f var(--profil-penutup) center 58% / cover no-repeat;
  }

  .profil-penutup-lapis {
    background:
      linear-gradient(90deg, rgba(4, 34, 26, .76), rgba(4, 34, 26, .20) 62%, rgba(4, 34, 26, .48)),
      linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.28));
  }

  .profil-penutup-isi {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 40px;
    padding: 52px 0;
  }

  .profil-penutup h2 {
    margin: 0;
    font-family: "Archivo", sans-serif;
    font-size: clamp(30px, 4.4vw, 50px);
    line-height: 1.03;
    letter-spacing: -.045em;
    color: #fff;
  }

  .profil-penutup blockquote {
    margin: 0;
    padding: 0 0 7px 17px;
    border-left: 2px solid #e7b52a;
    color: rgba(255,255,255,.94);
    font-size: 11px;
    line-height: 1.55;
    text-align: right;
  }

  :global(:root[data-theme="dark"]) .profil-modern {
    --pm-krim: #091a20;
    --pm-tinta: #ecf5f2;
    --pm-teks: #b9c8c3;
    --pm-garis: rgba(205, 234, 226, .12);
    background: #07171e;
  }

  :global(:root[data-theme="dark"]) .profil-tentang,
  :global(:root[data-theme="dark"]) .profil-data-batas {
    background: #0a1b21;
  }

  :global(:root[data-theme="dark"]) .profil-perjalanan-visi,
  :global(:root[data-theme="dark"]) .profil-pengurus {
    background: #08161c;
  }

  :global(:root[data-theme="dark"]) .profil-copy-besar h2,
  :global(:root[data-theme="dark"]) .profil-judul-bagian h2,
  :global(:root[data-theme="dark"]) .profil-timeline-item h3,
  :global(:root[data-theme="dark"]) .profil-orang strong {
    color: #edf7f3;
  }

  :global(:root[data-theme="dark"]) .profil-copy-besar > p:not(.profil-label),
  :global(:root[data-theme="dark"]) .profil-timeline-item > p,
  :global(:root[data-theme="dark"]) .profil-misi li p {
    color: #adbfba;
  }

  :global(:root[data-theme="dark"]) .profil-stat {
    border-color: rgba(210,235,226,.10);
    background: #10272a;
  }

  :global(:root[data-theme="dark"]) .profil-stat strong { color: #e5f4ee; }
  :global(:root[data-theme="dark"]) .profil-stat > span { color: #a9bbb6; }

  :global(:root[data-theme="dark"]) .profil-orang,
  :global(:root[data-theme="dark"]) .profil-batas {
    border-color: rgba(210,235,226,.10);
    background: rgba(13, 34, 39, .88);
  }

  :global(:root[data-theme="dark"]) .profil-batas b { color: #e8f3ef; }

  @media (max-width: 980px) {
    .profil-dua-kolom,
    .profil-dua-panel {
      grid-template-columns: 1fr;
    }

    .profil-pengurus-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .profil-hero { min-height: 410px; }
  }

  @media (max-width: 680px) {
    .profil-modern {
      margin-top: -32px;
      margin-bottom: -64px;
    }

    .profil-wadah {
      width: min(100% - 28px, 1180px);
    }

    .profil-hero {
      min-height: 510px;
      background-position: 61% center;
    }

    .profil-hero-lapis {
      background:
        linear-gradient(90deg, rgba(2, 26, 22, .83), rgba(2, 26, 22, .32) 88%),
        linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.46));
    }

    .profil-hero-isi { padding: 88px 0 35px; }
    .profil-hero h1 { font-size: 47px; }
    .profil-hero h2 { font-size: 24px; max-width: 12ch; }
    .profil-chip { font-size: 9px; }

    .profil-bagian { padding: 39px 0; }

    .profil-copy-besar h2 { font-size: 37px; }

    .profil-foto-utama,
    .profil-foto-utama > img { min-height: 235px; }

    .profil-foto-quote {
      top: 11px;
      right: 11px;
      padding: 8px 10px;
    }

    .profil-timeline {
      grid-template-columns: 1fr;
      gap: 18px;
    }

    .profil-timeline-item > p { min-height: 0; }
    .profil-timeline-item img { height: 180px; }

    .profil-misi ol { grid-template-columns: 1fr; }

    .profil-stat-grid { grid-template-columns: 1fr 1fr; }

    .profil-kompas {
      grid-template-columns: 1fr 92px 1fr;
      grid-template-rows: 72px 92px 72px;
    }

    .profil-kompas-tengah {
      width: 82px;
      height: 82px;
    }

    .profil-kompas-logo { inset: 16px; }
    .profil-kompas-logo img { width: 48px; height: 48px; }
    .profil-kompas-tengah .u { left: 38px; }
    .profil-kompas-tengah .t { top: 36px; }
    .profil-kompas-tengah .s { left: 38px; }
    .profil-kompas-tengah .b { top: 36px; }

    .profil-batas { padding: 8px; }
    .profil-batas > span { display: none; }
    .profil-batas b { font-size: 7.8px; }

    .profil-pengurus-kepala {
      align-items: flex-start;
      flex-direction: column;
    }

    .profil-pengurus-grid { grid-template-columns: 1fr; }
    .profil-orang { grid-template-columns: 64px 1fr; }

    .profil-penutup { min-height: 300px; }
    .profil-penutup-isi {
      align-items: flex-start;
      flex-direction: column;
      padding: 42px 0;
    }
    .profil-penutup blockquote { text-align: left; }
  }
</style>
