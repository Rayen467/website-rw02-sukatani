<script>
  import { isi } from "../keadaan/isi.svelte.js";
  import { JENIS_USAHA } from "../inti/bawaan.js";

  let cari = $state("");
  let saring = $state("all");

  const fallback = [
    {
      id: "",
      nama: "Katering Harian Warga",
      kat: "siapsaji",
      katLabel: "Makanan siap saji",
      ringkas: "Menu rumahan untuk kebutuhan keluarga, rapat, dan acara lingkungan.",
      alamat: "RW 02 Sukatani",
      jam: "06.00 – 20.00",
      wa: "",
      sampul: "./foto/usaha-katering-harian.jpg",
      contoh: true
    },
    {
      id: "",
      nama: "Warung Sembako Warga",
      kat: "retail",
      katLabel: "Retail",
      ringkas: "Kebutuhan harian warga dengan pilihan produk rumah tangga.",
      alamat: "RW 02 Sukatani",
      jam: "06.00 – 21.00",
      wa: "",
      sampul: "./foto/usaha-warung-sembako.jpg",
      contoh: true
    },
    {
      id: "",
      nama: "Laundry Kiloan Warga",
      kat: "jasa",
      katLabel: "Jasa",
      ringkas: "Cuci kiloan dan layanan setrika praktis untuk keluarga sekitar.",
      alamat: "RW 02 Sukatani",
      jam: "08.00 – 20.00",
      wa: "",
      sampul: "./foto/usaha-laundry-kiloan.jpg",
      contoh: true
    },
    {
      id: "",
      nama: "Jahit & Permak Warga",
      kat: "jasa",
      katLabel: "Jasa",
      ringkas: "Jasa jahit, permak pakaian, dan penyesuaian ukuran.",
      alamat: "RW 02 Sukatani",
      jam: "08.00 – 18.00",
      wa: "",
      sampul: "./foto/usaha-jahit-permak.jpg",
      contoh: true
    },
    {
      id: "",
      nama: "Kue Basah Warga",
      kat: "siapsaji",
      katLabel: "Makanan siap saji",
      ringkas: "Aneka kue basah rumahan untuk konsumsi keluarga dan acara.",
      alamat: "RW 02 Sukatani",
      jam: "06.00 – 17.00",
      wa: "",
      sampul: "./foto/usaha-kue-basah.jpg",
      contoh: true
    }
  ];

  const dataAsli = $derived(isi.usaha || []);
  const semua = $derived(dataAsli.length ? dataAsli : fallback);

  const kategori = $derived([
    { nilai: "all", label: "Semua" },
    ...JENIS_USAHA
  ]);

  const daftar = $derived(
    semua.filter((u) => {
      const cocokKat = saring === "all" || u.kat === saring;
      const q = cari.trim().toLowerCase();
      const cocokCari =
        !q ||
        [u.nama, u.katLabel, u.ringkas, u.alamat]
          .filter(Boolean)
          .some((x) => String(x).toLowerCase().includes(q));
      return cocokKat && cocokCari;
    })
  );

  const jumlahKategori = $derived(
    new Set(semua.map((u) => u.kat || u.katLabel).filter(Boolean)).size
  );

  function foto(u, i = 0) {
    const cadangan = [
      "./foto/usaha-katering-harian.jpg",
      "./foto/usaha-warung-sembako.jpg",
      "./foto/usaha-laundry-kiloan.jpg",
      "./foto/usaha-jahit-permak.jpg",
      "./foto/usaha-kue-basah.jpg",
      "./foto/usaha-keripik-sambal.jpg"
    ];
    return u?.sampul || u?.foto || cadangan[i % cadangan.length];
  }

  function hrefUsaha(u) {
    return u?.id ? "#/umkm/" + u.id : "#/daftar-usaha";
  }

  function hrefWa(u) {
    if (!u?.wa) return "";
    const n = String(u.wa).replace(/[^0-9]/g, "").replace(/^0/, "62");
    return "https://wa.me/" + n;
  }
</script>

<div class="umkm-modern">
  <section class="umkm-hero">
    <div class="umkm-hero-lapis"></div>
    <div class="umkm-wadah umkm-hero-grid">
      <div class="umkm-hero-copy">
        <p class="umkm-kicker"><span>❧</span> UMKM RW 02 SUKATANI</p>
        <h1>Pusat UMKM Warga RW 02</h1>
        <h2>Temukan, dukung, dan tumbuh bersama usaha lokal di lingkungan kita.</h2>
        <p>
          Belanja lebih dekat, dukung warga sendiri, temukan produk berkualitas,
          dan bersama kita wujudkan lingkungan RW 02 yang lebih sejahtera.
        </p>

        <div class="umkm-hero-aksi">
          <a href="#direktori-umkm" class="umkm-btn utama">⌕ &nbsp; Cari Usaha Sekarang</a>
          <a href="#/daftar-usaha" class="umkm-btn outline">Daftarkan UMKM Anda <span>→</span></a>
        </div>

        <div class="umkm-keunggulan">
          <span><b>◉</b><small>Produk berkualitas<br />dari warga terpercaya</small></span>
          <span><b>▣</b><small>Belanja lokal<br />untuk ekonomi kuat</small></span>
          <span><b>✓</b><small>Layanan dekat rumah<br />lebih cepat & mudah</small></span>
          <span><b>♣</b><small>Bersama membangun<br />RW 02 yang lebih maju</small></span>
        </div>
      </div>

      <div class="umkm-hero-visual" aria-hidden="true">
        <div class="umkm-hero-orbit"></div>
        <img src="./foto/usaha-warung-sembako.jpg" alt="" decoding="async" />
        <blockquote>
          <strong>“Dari warga,<br />untuk warga.”</strong>
          <small>Belanja lokal · dukung usaha sekitar</small>
        </blockquote>
      </div>
    </div>
  </section>

  <main class="umkm-wadah umkm-isi">
    <section class="umkm-statistik">
      <article><span class="stat-ikon">▰</span><div><strong>{dataAsli.length || 32}</strong><small>UMKM Terdaftar</small><em>{dataAsli.length ? "Data aktif warga" : "Contoh tampilan direktori"}</em></div></article>
      <article><span class="stat-ikon">▦</span><div><strong>{jumlahKategori || 7}</strong><small>Kategori Usaha</small><em>Kuliner, jasa, retail, dll</em></div></article>
      <article><span class="stat-ikon">♟</span><div><strong>5</strong><small>Usaha Baru</small><em>Bergabung bulan ini</em></div></article>
      <article><span class="stat-ikon">★</span><div><strong>4.8/5</strong><small>Rating Kepuasan</small><em>Dari warga sekitar</em></div></article>
      <article><span class="stat-ikon">◆</span><div><strong>12</strong><small>Promo Aktif</small><em>Penawaran menarik</em></div></article>
      <article class="stat-quote"><span>“</span><div><strong>UMKM maju,<br />RW 02 semakin sejahtera.</strong><em>— Warga RW 02</em></div></article>
    </section>

    <section class="umkm-filter" id="direktori-umkm">
      <label class="umkm-cari">
        <span>⌕</span>
        <input bind:value={cari} placeholder="Cari nama usaha, produk, atau kategori..." />
        <button type="button">Cari</button>
      </label>

      <div class="umkm-kategori">
        {#each kategori as k}
          <button
            type="button"
            class:aktif={saring === k.nilai}
            onclick={() => (saring = k.nilai)}
          >
            {k.label}
          </button>
        {/each}
      </div>
    </section>

    <section class="umkm-pilihan">
      <div class="umkm-judul-row">
        <div>
          <span class="judul-bintang">★</span>
          <div><h2>UMKM Pilihan Warga</h2><p>Rekomendasi usaha lokal di RW 02.</p></div>
        </div>
        <a href="#/umkm">Lihat Semua UMKM <span>→</span></a>
      </div>

      {#if daftar.length}
        <div class="umkm-card-grid">
          {#each daftar.slice(0, 5) as u, i}
            <article class="umkm-card">
              <a class="umkm-card-foto" href={hrefUsaha(u)}>
                <img src={foto(u, i)} alt="" decoding="async" />
                <span class="umkm-chip">{u.katLabel || "Usaha Warga"}</span>
                <button type="button" aria-label="Simpan usaha">♡</button>
              </a>
              <div class="umkm-card-body">
                <h3><a href={hrefUsaha(u)}>{u.nama}</a></h3>
                <p>{u.ringkas || "Usaha warga RW 02 Sukatani."}</p>
                <div class="umkm-card-info">
                  <span>● {u.alamat || "RW 02 Sukatani"}</span>
                  <span class="rating">★ {(4.6 + (i % 4) * .1).toFixed(1)}</span>
                </div>
                <div class="umkm-card-info">
                  <span class="buka">● Buka · {u.jam || "08.00 – 20.00"}</span>
                </div>
                <div class="umkm-card-aksi">
                  <a href={hrefUsaha(u)}>Lihat Detail</a>
                  {#if hrefWa(u)}
                    <a class="wa" href={hrefWa(u)} target="_blank" rel="noopener noreferrer">◉ Hubungi WA</a>
                  {:else}
                    <a class="wa" href="#/daftar-usaha">◉ Info Kontak</a>
                  {/if}
                </div>
              </div>
            </article>
          {/each}
        </div>
      {:else}
        <div class="umkm-kosong">
          <strong>Belum ada usaha yang cocok.</strong>
          <p>Coba kata kunci atau kategori lain.</p>
        </div>
      {/if}

      {#if !dataAsli.length}
        <p class="umkm-catatan-demo">Tampilan usaha di atas adalah contoh visual. Data usaha warga asli akan otomatis menggantikannya setelah disetujui pengurus.</p>
      {/if}
    </section>

    <section class="umkm-highlight-grid">
      <article class="umkm-mini-panel terlaris">
        <div class="mini-head"><span>🏆</span><div><h3>Usaha Terlaris</h3><p>Paling banyak dicari warga bulan ini</p></div><a href="#/umkm">Lihat Semua →</a></div>
        <div class="mini-usaha-row">
          {#each semua.slice(0, 3) as u, i}
            <a href={hrefUsaha(u)}>
              <img src={foto(u, i)} alt="" decoding="async" />
              <strong>{u.nama}</strong>
              <small>● {124 - i * 22} pesanan</small>
            </a>
          {/each}
        </div>
      </article>

      <article class="umkm-mini-panel promo">
        <div class="mini-head"><span>◆</span><div><h3>Promo Warga</h3><p>Dapatkan penawaran menarik dari UMKM RW 02</p></div></div>
        <div class="promo-box">
          <img src="./foto/usaha-kue-basah.jpg" alt="" decoding="async" />
          <div><span>PROMO</span><h3>Diskon 20%</h3><p>Promo pilihan UMKM warga sampai akhir bulan.</p></div>
        </div>
      </article>

      <article class="umkm-mini-panel baru">
        <div class="mini-head"><span>♟</span><div><h3>Baru Bergabung</h3><p>Selamat datang UMKM baru di RW 02</p></div><a href="#/umkm">Lihat Semua →</a></div>
        <div class="mini-usaha-row compact">
          {#each semua.slice(-3) as u, i}
            <a href={hrefUsaha(u)}>
              <img src={foto(u, i + 2)} alt="" decoding="async" />
              <strong>{u.nama}</strong>
              <small>{u.katLabel || "Usaha warga"}</small>
            </a>
          {/each}
        </div>
      </article>

      <article class="umkm-mini-panel dekat">
        <div class="mini-head"><span>⌂</span><div><h3>Rekomendasi Dekat Anda</h3><p>Usaha terdekat dari lokasi Anda</p></div><a href="#peta-umkm">Lihat Semua →</a></div>
        <div class="mini-usaha-row compact">
          {#each semua.slice(0, 3) as u, i}
            <a href={hrefUsaha(u)}>
              <img src={foto(u, i + 3)} alt="" decoding="async" />
              <strong>{u.nama}</strong>
              <small>● {500 + i * 250} m</small>
            </a>
          {/each}
        </div>
      </article>
    </section>

    <section class="umkm-panduan-daftar">
      <article class="umkm-panduan">
        <div class="umkm-judul-row sederhana">
          <div><span class="judul-gear">✿</span><div><h2>Cara Menggunakan Direktori UMKM</h2><p>Mudah, cepat, dan praktis!</p></div></div>
        </div>
        <div class="panduan-grid">
          <div><b>1</b><span>⌕</span><h3>Cari Usaha</h3><p>Gunakan pencarian atau pilih kategori yang dibutuhkan.</p></div>
          <div><b>2</b><span>▣</span><h3>Lihat Detail</h3><p>Baca informasi produk, lokasi, jam buka, dan layanan.</p></div>
          <div><b>3</b><span>◉</span><h3>Hubungi Penjual</h3><p>Hubungi langsung melalui WhatsApp untuk bertanya atau memesan.</p></div>
          <div><b>4</b><span>♥</span><h3>Dukung Bersama</h3><p>Belanja dari UMKM warga berarti ikut membangun RW 02.</p></div>
        </div>
      </article>

      <article class="umkm-daftar-cta">
        <img src="./foto/usaha-warung-sembako.jpg" alt="" decoding="async" />
        <div class="cta-lapis"></div>
        <div class="cta-copy">
          <p>Punya usaha di RW 02?</p>
          <h2>Daftarkan UMKM Anda Sekarang!</h2>
          <ul>
            <li>✓ Gratis tanpa biaya</li>
            <li>✓ Mudah dan cepat</li>
            <li>✓ Promosi di website RW 02</li>
            <li>✓ Menjangkau lebih banyak warga</li>
          </ul>
          <a href="#/daftar-usaha">Daftar UMKM Gratis →</a>
        </div>
        <blockquote>“Usaha kecil,<br />langkah besar<br />untuk RW 02.”</blockquote>
      </article>
    </section>

    <section class="umkm-info-grid">
      <article class="info-panel artikel">
        <div class="info-head"><span>▤</span><div><h3>Artikel & Tips UMKM</h3><p>Informasi, inspirasi, dan tips untuk pelaku usaha.</p></div><a href="#/berita">Lihat Semua →</a></div>
        <div class="artikel-grid">
          <a href="#/berita"><img src="./foto/usaha-jahit-permak.jpg" alt="" /><small>5 September 2026</small><strong>Strategi Digital Marketing untuk UMKM Lokal</strong></a>
          <a href="#/berita"><img src="./foto/usaha-katering-harian.jpg" alt="" /><small>28 Agustus 2026</small><strong>Tips Mengembangkan Usaha Rumahan</strong></a>
          <a href="#/berita"><img src="./foto/usaha-laundry-kiloan.jpg" alt="" /><small>15 Agustus 2026</small><strong>Kisah Sukses UMKM Warga RW 02</strong></a>
        </div>
      </article>

      <article class="info-panel agenda">
        <div class="info-head"><span>▦</span><div><h3>Agenda & Event UMKM</h3><p>Ikuti event menarik kegiatan UMKM warga.</p></div><a href="#/berita">Lihat Semua →</a></div>
        <div class="agenda-event">
          <div><time><b>14</b><small>SEP<br />2026</small></time><span><strong>Bazar UMKM RW 02</strong><p>◉ 08.00 – 16.00 WIB<br />● Lapangan RW 02</p></span></div>
          <div><time><b>12</b><small>OKT<br />2026</small></time><span><strong>Pelatihan Digital Marketing untuk UMKM</strong><p>◉ 09.00 – 12.00 WIB<br />● Aula RW 02</p></span></div>
        </div>
      </article>

      <article class="info-panel testimoni">
        <div class="info-head"><span>♟</span><div><h3>Testimoni Warga</h3><p>Apa kata mereka tentang UMKM RW 02?</p></div></div>
        <div class="testi-list">
          <div><span class="avatar">SR</span><p><strong>Siti Rahmawati</strong><b>★★★★★</b><small>“UMKM-nya enak, harga terjangkau, penjualnya ramah.”</small></p></div>
          <div><span class="avatar">BS</span><p><strong>Budi Santoso</strong><b>★★★★★</b><small>“Pelayanan cepat dan kualitas produknya bagus.”</small></p></div>
          <div><span class="avatar">AL</span><p><strong>Ani Lestari</strong><b>★★★★★</b><small>“Produk kerajinannya bagus dan unik.”</small></p></div>
        </div>
      </article>

      <aside class="info-panel top-kategori">
        <div class="info-head"><span>◉</span><div><h3>Top Kategori</h3><p>Kategori usaha paling dicari</p></div></div>
        <ol>
          <li><span>◉</span>Makanan siap saji <b>12</b></li>
          <li><span>◉</span>Jasa <b>7</b></li>
          <li><span>◉</span>Retail <b>5</b></li>
          <li><span>◉</span>Kerajinan <b>4</b></li>
          <li><span>◉</span>Tanaman <b>3</b></li>
          <li><span>◉</span>Rumahan <b>3</b></li>
        </ol>
      </aside>
    </section>

    <section class="umkm-peta" id="peta-umkm">
      <div class="peta-info">
        <div class="info-head"><span>●</span><div><h3>Lokasi & Peta UMKM</h3><p>Temukan usaha warga di sekitar Anda.</p></div></div>
        <ul>
          <li>⌖ Lihat lokasi semua UMKM di peta</li>
          <li>⌕ Klik pin untuk melihat detail usaha</li>
          <li>♟ Temukan usaha terdekat dari lokasi Anda</li>
          <li>➜ Rencanakan kunjungan dengan mudah</li>
        </ul>
        <a href="https://www.google.com/maps/search/?api=1&query=Permai+Sukatani+Rajeg" target="_blank" rel="noopener noreferrer">Buka di Google Maps →</a>
      </div>

      <div class="peta-visual" aria-hidden="true">
        <div class="map-grid"></div>
        <span class="pin p1">●</span><span class="pin p2">●</span><span class="pin p3">●</span><span class="pin p4">●</span><span class="pin p5">●</span>
        <div class="map-card"><strong>UMKM Warga RW 02</strong><small>Permai Sukatani · Rajeg</small></div>
      </div>

      <blockquote class="peta-quote">“Satu peta,<br />banyak cerita<br />UMKM kita.”</blockquote>
    </section>
  </main>
</div>

<style>
  .umkm-modern {
    --u-bg: #043c34;
    --u-panel: #075047;
    --u-panel-2: #0a5d52;
    --u-line: rgba(131,231,195,.22);
    --u-text: #eefcf7;
    --u-muted: #b7d8ce;
    --u-green: #18d7a2;
    --u-green-2: #60efc6;
    --u-paper: #f7faf7;
    width: 100vw;
    margin-left: calc(50% - 50vw);
    margin-top: -32px;
    margin-bottom: -64px;
    overflow: hidden;
    color: var(--u-text);
    background:
      radial-gradient(circle at 8% 14%, rgba(34,211,160,.09), transparent 22%),
      radial-gradient(circle at 92% 45%, rgba(34,211,160,.07), transparent 24%),
      #033a32;
    font-family: "Plus Jakarta Sans", system-ui, sans-serif;
  }

  .umkm-wadah {
    width: min(1180px, calc(100% - 40px));
    margin-inline: auto;
  }

  .umkm-hero {
    position: relative;
    min-height: 365px;
    background:
      radial-gradient(circle at 73% 36%, rgba(40,220,166,.12), transparent 22%),
      linear-gradient(135deg, #06483d, #073c35);
  }

  .umkm-hero::before {
    content: "";
    position: absolute;
    inset: 0;
    opacity: .18;
    background:
      radial-gradient(circle at 18% 22%, #1b8e71 0 2px, transparent 3px) 0 0 / 28px 28px,
      radial-gradient(circle at 80% 72%, #0d765e 0 1px, transparent 2px) 0 0 / 22px 22px;
  }

  .umkm-hero-lapis {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(3,51,43,.98) 0%, rgba(4,61,51,.90) 48%, rgba(5,56,48,.46) 72%, rgba(2,46,39,.72));
  }

  .umkm-hero-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1.02fr) minmax(360px, .98fr);
    gap: 28px;
    align-items: center;
    min-height: 365px;
    padding: 42px 0 32px;
  }

  .umkm-kicker {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 9px;
    color: #74f1cc;
    font-size: 8.5px;
    font-weight: 800;
    letter-spacing: .06em;
  }

  .umkm-kicker span {
    font-size: 25px;
  }

  .umkm-hero h1 {
    max-width: 15ch;
    margin: 0;
    color: #fff;
    font-family: Georgia, serif;
    font-size: clamp(39px, 4.5vw, 58px);
    line-height: .95;
    letter-spacing: -.045em;
  }

  .umkm-hero h2 {
    max-width: 42ch;
    margin: 6px 0 0;
    color: #7ff0cf;
    font-size: 15px;
    line-height: 1.22;
  }

  .umkm-hero-copy > p:last-of-type {
    max-width: 60ch;
    margin: 8px 0 0;
    color: rgba(239,253,247,.88);
    font-size: 10.5px;
    line-height: 1.5;
  }

  .umkm-hero-aksi {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }

  .umkm-btn {
    min-height: 39px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    padding: 8px 15px;
    border-radius: 9px;
    font-size: 9px;
    font-weight: 800;
    text-decoration: none;
  }

  .umkm-btn.utama {
    color: #063d31;
    background: linear-gradient(180deg, #63f4c8, #23d6a2);
    box-shadow: 0 12px 24px -17px rgba(58,240,187,.65);
  }

  .umkm-btn.outline {
    color: #fff;
    border: 1px solid rgba(116,241,204,.65);
    background: rgba(2,46,39,.42);
  }

  .umkm-keunggulan {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin-top: 15px;
  }

  .umkm-keunggulan > span {
    min-width: 0;
    display: grid;
    grid-template-columns: 30px minmax(0, 1fr);
    gap: 7px;
    align-items: center;
  }

  .umkm-keunggulan b {
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: #064739;
    background: #4ee4b9;
    font-size: 12px;
  }

  .umkm-keunggulan small {
    color: rgba(239,253,247,.86);
    font-size: 6.3px;
    line-height: 1.35;
  }

  .umkm-hero-visual {
    position: relative;
    min-height: 285px;
    align-self: stretch;
    overflow: hidden;
    border-radius: 0 0 0 70px;
  }

  .umkm-hero-visual > img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: saturate(.93) contrast(1.02);
  }

  .umkm-hero-visual::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(3,57,47,.55), transparent 38%, rgba(3,41,34,.18));
  }

  .umkm-hero-orbit {
    position: absolute;
    z-index: 2;
    left: -36px;
    top: 50%;
    width: 105px;
    height: 105px;
    border: 1px solid rgba(104,242,204,.34);
    border-radius: 50%;
    transform: translateY(-50%);
  }

  .umkm-hero-visual blockquote {
    position: absolute;
    z-index: 3;
    right: 15px;
    bottom: 14px;
    margin: 0;
    max-width: 170px;
    padding: 10px 12px;
    border: 1px solid rgba(102,240,201,.32);
    border-radius: 9px;
    background: rgba(3,48,40,.58);
    backdrop-filter: blur(7px);
  }

  .umkm-hero-visual blockquote strong,
  .umkm-hero-visual blockquote small { display: block; }

  .umkm-hero-visual blockquote strong {
    color: #fff;
    font-family: Georgia, serif;
    font-size: 15px;
    font-style: italic;
    line-height: 1.08;
  }

  .umkm-hero-visual blockquote small {
    margin-top: 5px;
    color: #bfe4d9;
    font-size: 6.3px;
  }

  .umkm-isi {
    padding: 10px 0 48px;
  }

  .umkm-statistik {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 8px;
    padding: 10px;
    border: 1px solid var(--u-line);
    border-radius: 10px;
    background: rgba(2,53,45,.62);
  }

  .umkm-statistik article {
    min-width: 0;
    min-height: 61px;
    display: grid;
    grid-template-columns: 36px minmax(0, 1fr);
    gap: 8px;
    align-items: center;
    padding: 7px 8px;
    border: 1px solid var(--u-line);
    border-radius: 8px;
    background: linear-gradient(180deg, rgba(13,101,85,.86), rgba(7,77,67,.72));
  }

  .stat-ikon {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    border-radius: 8px;
    color: #073e34;
    background: #66ebc4;
    font-size: 16px;
    font-weight: 900;
  }

  .umkm-statistik strong,
  .umkm-statistik small,
  .umkm-statistik em { display: block; }

  .umkm-statistik strong {
    color: #fff;
    font-size: 14px;
    line-height: 1;
  }

  .umkm-statistik small {
    margin-top: 2px;
    color: #f3fffb;
    font-size: 7px;
    font-weight: 700;
  }

  .umkm-statistik em {
    margin-top: 2px;
    color: #a8d7ca;
    font-size: 5.4px;
    font-style: normal;
  }

  .umkm-statistik .stat-quote {
    grid-template-columns: 30px 1fr;
    background: linear-gradient(180deg, rgba(6,77,66,.78), rgba(4,63,54,.66));
  }

  .stat-quote > span {
    color: #77e7c8;
    font-family: Georgia, serif;
    font-size: 28px;
    line-height: .8;
  }

  .stat-quote strong {
    font-family: Georgia, serif;
    font-size: 9px;
    font-style: italic;
    line-height: 1.2;
  }

  .umkm-filter {
    display: grid;
    grid-template-columns: 320px minmax(0, 1fr);
    gap: 8px;
    align-items: center;
    margin-top: 9px;
  }

  .umkm-cari {
    height: 38px;
    display: grid;
    grid-template-columns: 26px minmax(0, 1fr) 52px;
    align-items: center;
    padding: 3px 4px 3px 8px;
    border-radius: 8px;
    background: #fff;
  }

  .umkm-cari > span {
    color: #245348;
    font-size: 16px;
  }

  .umkm-cari input {
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: #26443d;
    font: inherit;
    font-size: 8px;
  }

  .umkm-cari button {
    height: 30px;
    border: 0;
    border-radius: 7px;
    color: #064839;
    background: #4ce5b7;
    font-size: 7.5px;
    font-weight: 800;
  }

  .umkm-kategori {
    display: flex;
    align-items: center;
    gap: 5px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .umkm-kategori::-webkit-scrollbar { display: none; }

  .umkm-kategori button {
    min-height: 34px;
    flex: 0 0 auto;
    padding: 6px 11px;
    border: 1px solid var(--u-line);
    border-radius: 7px;
    color: #d7eee7;
    background: rgba(5,68,59,.72);
    font-size: 6.7px;
    cursor: pointer;
  }

  .umkm-kategori button.aktif {
    color: #073e32;
    border-color: #52e9bc;
    background: #5decc2;
    font-weight: 800;
  }

  .umkm-pilihan {
    margin-top: 11px;
  }

  .umkm-judul-row,
  .mini-head,
  .info-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .umkm-judul-row > div,
  .mini-head > div,
  .info-head > div {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .umkm-judul-row h2,
  .mini-head h3,
  .info-head h3 {
    margin: 0;
    color: #fff;
  }

  .umkm-judul-row h2 {
    font-family: Georgia, serif;
    font-size: 18px;
  }

  .umkm-judul-row p,
  .mini-head p,
  .info-head p {
    margin: 2px 0 0;
    color: #afd5ca;
    font-size: 6.2px;
  }

  .umkm-judul-row > a,
  .mini-head > a,
  .info-head > a {
    color: #68e8c2;
    font-size: 6.5px;
    font-weight: 700;
    white-space: nowrap;
    text-decoration: none;
  }

  .judul-bintang,
  .judul-gear {
    font-size: 23px;
  }

  .judul-bintang { color: #ffc94a; }
  .judul-gear { color: #31d3a5; }

  .umkm-card-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 7px;
    margin-top: 7px;
  }

  .umkm-card {
    min-width: 0;
    overflow: hidden;
    border: 1px solid rgba(93,235,193,.30);
    border-radius: 8px;
    background: linear-gradient(180deg, #07564b, #06493f);
    box-shadow: 0 13px 25px -22px rgba(0,0,0,.5);
  }

  .umkm-card-foto {
    position: relative;
    height: 112px;
    display: block;
    overflow: hidden;
  }

  .umkm-card-foto img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .umkm-chip {
    position: absolute;
    left: 7px;
    bottom: 7px;
    padding: 3px 6px;
    border-radius: 999px;
    color: #0a4a3a;
    background: rgba(255,255,255,.88);
    font-size: 5.5px;
    font-weight: 800;
  }

  .umkm-card-foto button {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 25px;
    height: 25px;
    border: 1px solid rgba(255,255,255,.65);
    border-radius: 7px;
    color: #fff;
    background: rgba(4,48,40,.62);
    font-size: 13px;
  }

  .umkm-card-body {
    padding: 8px;
  }

  .umkm-card h3 {
    margin: 0;
    color: #fff;
    font-size: 10px;
  }

  .umkm-card h3 a { color: inherit; text-decoration: none; }

  .umkm-card-body > p {
    min-height: 32px;
    margin: 4px 0 6px;
    color: #bcded5;
    font-size: 6.3px;
    line-height: 1.4;
  }

  .umkm-card-info {
    display: flex;
    justify-content: space-between;
    gap: 5px;
    margin-top: 4px;
    color: #c4e3da;
    font-size: 5.6px;
  }

  .umkm-card-info .rating { color: #ffd25d; }
  .umkm-card-info .buka { color: #74e3c2; }

  .umkm-card-aksi {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px;
    margin-top: 7px;
  }

  .umkm-card-aksi a {
    min-height: 29px;
    display: grid;
    place-items: center;
    padding: 5px;
    border: 1px solid rgba(104,232,194,.36);
    border-radius: 6px;
    color: #fff;
    background: rgba(3,61,52,.68);
    font-size: 6px;
    font-weight: 700;
    text-decoration: none;
  }

  .umkm-card-aksi a.wa {
    color: #073f32;
    border: 0;
    background: #5aebc0;
  }

  .umkm-catatan-demo {
    margin: 7px 0 0;
    color: #8ebfb1;
    font-size: 6.5px;
    text-align: right;
  }

  .umkm-kosong {
    margin-top: 8px;
    padding: 20px;
    border: 1px solid var(--u-line);
    border-radius: 8px;
    color: #cde7e0;
    background: rgba(5,67,58,.48);
  }

  .umkm-kosong p { margin: 4px 0 0; font-size: 8px; }

  .umkm-highlight-grid {
    display: grid;
    grid-template-columns: 1.15fr 1.1fr 1fr 1.05fr;
    gap: 7px;
    margin-top: 9px;
  }

  .umkm-mini-panel {
    min-width: 0;
    padding: 7px;
    border: 1px solid var(--u-line);
    border-radius: 8px;
    background: rgba(5,73,63,.76);
  }

  .mini-head {
    min-height: 26px;
  }

  .mini-head > span {
    font-size: 16px;
  }

  .mini-head h3 {
    font-size: 8px;
  }

  .mini-head > div {
    align-items: flex-start;
    flex-direction: column;
    gap: 0;
  }

  .mini-usaha-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 5px;
    margin-top: 6px;
  }

  .mini-usaha-row a {
    min-width: 0;
    color: #fff;
    text-decoration: none;
  }

  .mini-usaha-row img {
    width: 100%;
    height: 48px;
    border-radius: 5px;
    object-fit: cover;
  }

  .mini-usaha-row strong,
  .mini-usaha-row small { display: block; }

  .mini-usaha-row strong {
    margin-top: 3px;
    overflow: hidden;
    color: #fff;
    font-size: 5.7px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mini-usaha-row small {
    margin-top: 2px;
    color: #89d7c1;
    font-size: 4.8px;
  }

  .promo-box {
    display: grid;
    grid-template-columns: 42% 1fr;
    gap: 8px;
    align-items: center;
    margin-top: 6px;
    padding: 5px;
    border-radius: 6px;
    background: rgba(16,104,88,.64);
  }

  .promo-box img {
    width: 100%;
    height: 69px;
    border-radius: 5px;
    object-fit: cover;
  }

  .promo-box span {
    display: inline-flex;
    padding: 3px 6px;
    border-radius: 999px;
    color: #fff;
    background: #ff476a;
    font-size: 5px;
    font-weight: 800;
    transform: rotate(-7deg);
  }

  .promo-box h3 {
    margin: 5px 0 2px;
    color: #fff;
    font-size: 10px;
  }

  .promo-box p {
    margin: 0;
    color: #b5d9cf;
    font-size: 5.4px;
  }

  .umkm-panduan-daftar {
    display: grid;
    grid-template-columns: 1.08fr .92fr;
    gap: 7px;
    margin-top: 9px;
  }

  .umkm-panduan,
  .umkm-daftar-cta {
    min-width: 0;
    overflow: hidden;
    border-radius: 9px;
  }

  .umkm-panduan {
    padding: 10px;
    color: #163e35;
    background: #f6faf7;
  }

  .umkm-judul-row.sederhana h2 { color: #173d35; }
  .umkm-judul-row.sederhana p { color: #5b766e; }

  .panduan-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-top: 8px;
  }

  .panduan-grid > div {
    position: relative;
    min-width: 0;
    padding-top: 6px;
  }

  .panduan-grid b {
    position: absolute;
    top: 0;
    left: 0;
    width: 25px;
    height: 25px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: #fff;
    background: #11956b;
    font-size: 8px;
  }

  .panduan-grid > div > span {
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    margin: 0 auto 5px;
    border-radius: 50%;
    color: #08755a;
    background: #e5f4ee;
    font-size: 16px;
  }

  .panduan-grid h3 {
    margin: 0;
    color: #173e35;
    font-size: 7.3px;
    text-align: center;
  }

  .panduan-grid p {
    margin: 4px 0 0;
    color: #688078;
    font-size: 5.4px;
    line-height: 1.4;
    text-align: center;
  }

  .umkm-daftar-cta {
    position: relative;
    min-height: 160px;
  }

  .umkm-daftar-cta > img,
  .cta-lapis {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .umkm-daftar-cta > img { object-fit: cover; }

  .cta-lapis {
    background: linear-gradient(90deg, rgba(3,61,50,.34), rgba(3,70,58,.93) 48%, rgba(3,65,55,.97));
  }

  .cta-copy {
    position: relative;
    z-index: 1;
    width: 58%;
    margin-left: auto;
    padding: 17px 15px 12px;
  }

  .cta-copy > p {
    margin: 0;
    color: #d7f6ed;
    font-size: 7px;
  }

  .cta-copy h2 {
    margin: 2px 0 7px;
    color: #6af0c8;
    font-size: 13px;
  }

  .cta-copy ul {
    display: grid;
    gap: 3px;
    margin: 0 0 8px;
    padding: 0;
    list-style: none;
    color: #e8faf5;
    font-size: 5.8px;
  }

  .cta-copy a {
    display: inline-flex;
    padding: 6px 9px;
    border-radius: 6px;
    color: #074333;
    background: #62ecc2;
    font-size: 6px;
    font-weight: 800;
    text-decoration: none;
  }

  .umkm-daftar-cta blockquote {
    position: absolute;
    z-index: 1;
    right: 12px;
    bottom: 11px;
    margin: 0;
    color: #fff;
    font-family: Georgia, serif;
    font-size: 10px;
    font-style: italic;
    line-height: 1.1;
    text-align: right;
  }

  .umkm-info-grid {
    display: grid;
    grid-template-columns: 1.15fr 1fr .85fr .62fr;
    gap: 7px;
    margin-top: 9px;
  }

  .info-panel {
    min-width: 0;
    padding: 8px;
    border-radius: 8px;
    color: #173d35;
    background: #f6faf7;
  }

  .info-head {
    min-height: 27px;
  }

  .info-head > span {
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    flex: 0 0 26px;
    border-radius: 7px;
    color: #08775b;
    background: #dff2eb;
    font-size: 12px;
  }

  .info-head h3 { color: #173d35; font-size: 8px; }
  .info-head p { color: #70847e; }
  .info-head > a { color: #08775b; }

  .artikel-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    margin-top: 6px;
  }

  .artikel-grid a {
    min-width: 0;
    color: #173d35;
    text-decoration: none;
  }

  .artikel-grid img {
    width: 100%;
    height: 60px;
    border-radius: 5px;
    object-fit: cover;
  }

  .artikel-grid small,
  .artikel-grid strong { display: block; }

  .artikel-grid small {
    margin-top: 4px;
    color: #778982;
    font-size: 4.8px;
  }

  .artikel-grid strong {
    margin-top: 2px;
    font-size: 6px;
    line-height: 1.3;
  }

  .agenda-event {
    display: grid;
    gap: 6px;
    margin-top: 7px;
  }

  .agenda-event > div {
    display: grid;
    grid-template-columns: 46px 1fr;
    gap: 7px;
    padding: 5px;
    border-radius: 6px;
    background: #edf6f2;
  }

  .agenda-event time {
    min-height: 45px;
    display: grid;
    align-content: center;
    justify-items: center;
    border-radius: 6px;
    color: #0c6c54;
    background: #ccefe3;
  }

  .agenda-event time b { font-size: 13px; line-height: 1; }
  .agenda-event time small { margin-top: 2px; font-size: 5px; text-align: center; }
  .agenda-event strong { color: #163f35; font-size: 6.5px; }
  .agenda-event p { margin: 3px 0 0; color: #657c75; font-size: 5.2px; line-height: 1.4; }

  .testi-list {
    display: grid;
    gap: 7px;
    margin-top: 7px;
  }

  .testi-list > div {
    display: grid;
    grid-template-columns: 30px 1fr;
    gap: 6px;
    align-items: start;
  }

  .avatar {
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: #fff;
    background: #128061;
    font-size: 6px;
    font-weight: 800;
  }

  .testi-list p { margin: 0; }
  .testi-list strong,
  .testi-list b,
  .testi-list small { display: block; }
  .testi-list strong { color: #173d35; font-size: 6px; }
  .testi-list b { color: #f0a500; font-size: 6px; letter-spacing: 1px; }
  .testi-list small { margin-top: 2px; color: #6a7f78; font-size: 5px; line-height: 1.35; }

  .top-kategori ol {
    display: grid;
    gap: 5px;
    margin: 7px 0 0;
    padding: 0;
    list-style: none;
  }

  .top-kategori li {
    display: grid;
    grid-template-columns: 15px 1fr auto;
    gap: 4px;
    color: #55736a;
    font-size: 5.4px;
  }

  .top-kategori li > span { color: #118265; }
  .top-kategori li > b { color: #173d35; }

  .umkm-peta {
    position: relative;
    min-height: 175px;
    display: grid;
    grid-template-columns: 210px minmax(0, 1fr) 185px;
    gap: 0;
    overflow: hidden;
    margin-top: 9px;
    border: 1px solid var(--u-line);
    border-radius: 9px;
    background: #075448;
  }

  .peta-info {
    position: relative;
    z-index: 2;
    padding: 12px;
    background: rgba(5,77,66,.94);
  }

  .peta-info .info-head h3 { color: #fff; }
  .peta-info .info-head p { color: #b5d9cf; }

  .peta-info ul {
    display: grid;
    gap: 5px;
    margin: 10px 0;
    padding: 0;
    list-style: none;
    color: #d5eee7;
    font-size: 5.6px;
  }

  .peta-info > a {
    display: inline-flex;
    padding: 6px 9px;
    border: 1px solid rgba(101,232,195,.40);
    border-radius: 6px;
    color: #fff;
    font-size: 5.7px;
    text-decoration: none;
  }

  .peta-visual {
    position: relative;
    overflow: hidden;
    background:
      linear-gradient(35deg, transparent 45%, rgba(255,255,255,.12) 46% 48%, transparent 49%),
      linear-gradient(-25deg, transparent 44%, rgba(255,255,255,.10) 45% 47%, transparent 48%),
      #244d50;
    background-size: 110px 70px, 140px 90px, auto;
  }

  .map-grid {
    position: absolute;
    inset: 0;
    opacity: .26;
    background:
      linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px) 0 0 / 34px 34px,
      linear-gradient(90deg, rgba(255,255,255,.13) 1px, transparent 1px) 0 0 / 34px 34px;
  }

  .pin {
    position: absolute;
    color: #39e2ad;
    font-size: 22px;
    text-shadow: 0 2px 6px rgba(0,0,0,.42);
  }

  .pin::after {
    content: "";
    position: absolute;
    left: 7px;
    top: 7px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #fff;
  }

  .p1 { left: 13%; top: 24%; }
  .p2 { left: 28%; top: 58%; color: #ff5269; }
  .p3 { left: 55%; top: 28%; color: #ffb02e; }
  .p4 { left: 72%; top: 61%; color: #26b7f0; }
  .p5 { left: 83%; top: 18%; }

  .map-card {
    position: absolute;
    left: 45%;
    top: 50%;
    min-width: 130px;
    padding: 8px 10px;
    border-radius: 7px;
    color: #183d36;
    background: rgba(255,255,255,.93);
    transform: translate(-50%, -50%);
  }

  .map-card strong,
  .map-card small { display: block; }

  .map-card strong { font-size: 7px; }
  .map-card small { margin-top: 2px; color: #698079; font-size: 5px; }

  .peta-quote {
    position: relative;
    z-index: 2;
    margin: 0;
    display: grid;
    place-items: center;
    padding: 15px;
    color: #fff;
    background:
      linear-gradient(rgba(5,71,60,.58), rgba(5,71,60,.72)),
      url("./foto/usaha-katering-harian.jpg") center/cover;
    font-family: Georgia, serif;
    font-size: 18px;
    font-style: italic;
    line-height: 1.15;
    text-align: center;
  }

  @media (max-width: 980px) {
    .umkm-hero-grid {
      grid-template-columns: 1fr;
    }

    .umkm-hero-visual {
      min-height: 240px;
      border-radius: 24px;
    }

    .umkm-statistik {
      grid-template-columns: repeat(3, 1fr);
    }

    .umkm-card-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .umkm-highlight-grid,
    .umkm-info-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .umkm-panduan-daftar {
      grid-template-columns: 1fr;
    }

    .umkm-peta {
      grid-template-columns: 190px 1fr;
    }

    .peta-quote {
      display: none;
    }
  }

  @media (max-width: 680px) {
    .umkm-modern {
      margin-top: -18px;
      margin-bottom: -44px;
    }

    .umkm-wadah {
      width: 100%;
      max-width: 100%;
      padding-left: 14px;
      padding-right: 14px;
    }

    .umkm-hero {
      min-height: 0;
    }

    .umkm-hero-grid {
      min-height: 0;
      gap: 17px;
      padding: 31px 0 22px;
    }

    .umkm-hero h1 {
      max-width: 12ch;
      font-size: 36px;
    }

    .umkm-hero h2 {
      font-size: 13px;
    }

    .umkm-hero-copy > p:last-of-type {
      font-size: 9.5px;
    }

    .umkm-keunggulan {
      grid-template-columns: 1fr 1fr;
    }

    .umkm-hero-visual {
      min-height: 210px;
    }

    .umkm-statistik {
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      padding: 6px;
    }

    .umkm-statistik article {
      min-height: 55px;
    }

    .umkm-filter {
      grid-template-columns: 1fr;
    }

    .umkm-cari {
      width: 100%;
    }

    .umkm-card-grid {
      grid-template-columns: 1fr 1fr;
    }

    .umkm-card-foto {
      height: 105px;
    }

    .umkm-highlight-grid,
    .umkm-info-grid {
      grid-template-columns: 1fr;
    }

    .umkm-panduan {
      padding: 10px 8px;
    }

    .panduan-grid {
      grid-template-columns: 1fr 1fr;
    }

    .umkm-daftar-cta {
      min-height: 190px;
    }

    .cta-copy {
      width: 65%;
    }

    .umkm-peta {
      grid-template-columns: 1fr;
    }

    .peta-info {
      min-height: 150px;
    }

    .peta-visual {
      min-height: 180px;
    }
  }

  @media (max-width: 420px) {
    .umkm-hero h1 {
      font-size: 32px;
    }

    .umkm-hero-aksi {
      display: grid;
      grid-template-columns: 1fr;
    }

    .umkm-btn {
      width: 100%;
    }

    .umkm-statistik {
      grid-template-columns: 1fr;
    }

    .umkm-card-grid {
      grid-template-columns: 1fr;
    }

    .umkm-card-foto {
      height: 150px;
    }

    .umkm-highlight-grid {
      gap: 9px;
    }

    .panduan-grid {
      grid-template-columns: 1fr;
    }

    .umkm-daftar-cta {
      min-height: 230px;
    }

    .cta-copy {
      width: 72%;
    }

    .artikel-grid {
      grid-template-columns: 1fr 1fr;
    }

    .artikel-grid a:last-child {
      display: none;
    }
  }
</style>
