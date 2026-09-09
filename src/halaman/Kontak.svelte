<script>
  import { KONTEN, KOLEKSI } from "../inti/nama.js";
  import { KATEGORI_PENGADUAN } from "../inti/bawaan.js";
  import { kontenNilai, isi, muatKoleksi } from "../keadaan/isi.svelte.js";
  import { sesi } from "../keadaan/sesi.svelte.js";
  import { beriTahu } from "../keadaan/pesan.svelte.js";
  import { kirimWarga, tambahIsi } from "../sumber/data.js";
  import { pesanRamah } from "../sumber/firebase.js";
  import { nomorAntrean, simpanan } from "../inti/peramban.js";
  import Peta from "../komponen/Peta.svelte";

  let form = $state({
    nama: "",
    kontak: "",
    kategori: "Pertanyaan Umum",
    pesan: ""
  });
  let mengirim = $state(false);
  let bukaFaq = $state(-1);

  const alamat = $derived(
    kontenNilai(
      KONTEN.KONTAK,
      "alamat",
      "Perum Pondok Sukatani Permai, RW 02, Kel. Sukatani, Kec. Rajeg, Kab. Tangerang, Banten 15540"
    )
  );
  const jamSeninJumat = $derived(kontenNilai(KONTEN.KONTAK, "jamSeninJumat", "08.00 – 16.00 WIB"));
  const jamSabtu = $derived(kontenNilai(KONTEN.KONTAK, "jamSabtu", "08.00 – 12.00 WIB"));
  const email = $derived(kontenNilai(KONTEN.KONTAK, "email", ""));
  const sekretaris = $derived(kontenNilai(KONTEN.KONTAK, "sekretaris", ""));
  const keamanan = $derived(kontenNilai(KONTEN.KONTAK, "posKeamanan", ""));

  const pengurus = $derived(
    (isi.pengurus_tampil || []).length
      ? (isi.pengurus_tampil || []).slice(0, 7)
      : [
          { jabatan: "Ketua RW", nama: "Anto Carmanto, S.T., M.T.", kontak: "" },
          { jabatan: "Sekretaris RW", nama: "", kontak: "" },
          { jabatan: "Bendahara RW", nama: "", kontak: "" },
          { jabatan: "Seksi Keamanan", nama: "", kontak: keamanan },
          { jabatan: "Seksi Kebersihan", nama: "", kontak: "" },
          { jabatan: "Seksi Sarana & Prasarana", nama: "", kontak: "" },
          { jabatan: "Seksi UMKM", nama: "", kontak: "" }
        ]
  );

  const faq = [
    {
      q: "Bagaimana cara mengajukan surat pengantar?",
      a: "Buka menu Layanan lalu pilih Pengajuan Surat. Isi jenis surat dan data yang diminta, kemudian pantau statusnya melalui akun Anda."
    },
    {
      q: "Kapan jam operasional sekretariat?",
      a: "Jam pelayanan mengikuti informasi resmi yang ditampilkan di bagian Informasi Sekretariat pada halaman ini."
    },
    {
      q: "Ke mana harus melapor jika ada masalah keamanan?",
      a: "Gunakan menu Pengaduan Warga atau hubungi Pos Keamanan yang tercantum di halaman ini jika nomor sudah diizinkan untuk ditampilkan."
    },
    {
      q: "Apakah bisa mengajukan pengaduan secara online?",
      a: "Bisa. Gunakan formulir pesan di halaman ini atau menu Pengaduan & Aspirasi. Setiap laporan yang masuk akan mendapatkan nomor tiket."
    }
  ];

  const layananCepat = [
    ["▤", "Pengajuan Surat", "Urusan administrasi", "#/surat"],
    ["◖", "Pengaduan Warga", "Sampaikan keluhan", "#/pengaduan"],
    ["◆", "Keamanan", "Pos keamanan", "#/pengaduan"],
    ["▥", "Kebersihan", "Sampah & lingkungan", "#/pengaduan"],
    ["▰", "UMKM", "Informasi & pendaftaran", "#/umkm"],
    ["▣", "Transportasi Warga", "Info transportasi", "#/layanan"],
    ["∞", "Kerja Sama", "Untuk instansi/komunitas", "#form-kontak"],
    ["•••", "Lainnya", "Pertanyaan umum", "#form-kontak"]
  ];

  function nomorWa(n) {
    if (!n) return "";
    return String(n).replace(/[^0-9]/g, "").replace(/^0/, "62");
  }

  function kategoriLaporan(v) {
    const map = {
      "Pertanyaan Umum": "Lainnya",
      "Administrasi / Surat": "Usulan atau aspirasi",
      "Keamanan": "Keamanan",
      "Kebersihan": "Kebersihan",
      "Fasilitas Umum": "Fasilitas umum",
      "UMKM": "Usulan atau aspirasi",
      "Saran / Aspirasi": "Usulan atau aspirasi"
    };
    return map[v] || KATEGORI_PENGADUAN.at(-1);
  }

  async function kirimPesan(e) {
    e.preventDefault();
    if (!form.nama.trim() || !form.kontak.trim() || !form.pesan.trim()) {
      beriTahu("Lengkapi nama, email/WhatsApp, dan pesan terlebih dahulu.");
      return;
    }

    mengirim = true;
    const tiket = nomorAntrean("KON");

    try {
      await kirimWarga(KOLEKSI.PENGADUAN, {
        tiket,
        kategori: kategoriLaporan(form.kategori),
        lokasi: "Kontak Website RW 02",
        isi: "[" + form.kategori + "] " + form.pesan.trim(),
        catatan: ""
      });

      try {
        await tambahIsi(KOLEKSI.PENGADUAN_KONTAK, {
          tiket,
          nama: form.nama.trim(),
          wa: form.kontak.trim(),
          uid: sesi.pengguna ? sesi.pengguna.uid : ""
        });
      } catch (errKontak) {
        console.warn("Kontak pesan belum tersimpan:", errKontak);
      }

      simpanan.tulis("aduan-saya", tiket);
      beriTahu("Pesan terkirim. Nomor tiket " + tiket + ".");
      form = { nama: "", kontak: "", kategori: "Pertanyaan Umum", pesan: "" };
      muatKoleksi(KOLEKSI.PENGADUAN);
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      mengirim = false;
    }
  }
</script>

<div class="kontak-modern">
  <section class="kontak-hero">
    <div class="kontak-hero-lapis"></div>
    <div class="kontak-wadah kontak-hero-grid">
      <div class="kontak-hero-copy">
        <p class="kontak-kicker"><span>⌁</span> Kontak & Lokasi</p>
        <h1>Hubungi Kami</h1>
        <h2>Kami Siap Melayani Warga RW 02</h2>
        <p>
          Sampaikan pertanyaan, saran, aspirasi, atau kebutuhan Anda.
          Bersama kita wujudkan lingkungan Sukatani yang lebih baik,
          guyub, maju, dan sejahtera.
        </p>
        <div class="kontak-pill-row">
          <span>◉ Respon Cepat</span>
          <span>◉ Pelayanan Ramah</span>
          <span>◉ Untuk Semua Warga</span>
        </div>
      </div>

      <div class="kontak-hero-badge">
        <span>“</span>
        <strong>Warga<br />Bersuara,<br />RW Bergerak</strong>
      </div>
    </div>
  </section>

  <main class="kontak-wadah kontak-isi">
    <nav class="kontak-shortcut" aria-label="Kontak cepat">
      <a href={sekretaris ? "https://wa.me/" + nomorWa(sekretaris) : "#form-kontak"} target={sekretaris ? "_blank" : undefined} rel={sekretaris ? "noopener noreferrer" : undefined}>
        <span class="shortcut-icon whatsapp">◉</span>
        <span><strong>Chat WhatsApp</strong><small>Respon lebih cepat</small></span>
      </a>
      <a href={email ? "mailto:" + email : "#form-kontak"}>
        <span class="shortcut-icon mail">✉</span>
        <span><strong>Kirim Email</strong><small>Untuk surat resmi</small></span>
      </a>
      <a href="#lokasi-kontak">
        <span class="shortcut-icon map">●</span>
        <span><strong>Datang Langsung</strong><small>Ke sekretariat RW 02</small></span>
      </a>
      <a href="#form-kontak">
        <span class="shortcut-icon form">▤</span>
        <span><strong>Form Online</strong><small>Saran & pengaduan</small></span>
      </a>
      <a href="#/galeri">
        <span class="shortcut-icon social">♟</span>
        <span><strong>Ikuti Kegiatan</strong><small>Update warga RW 02</small></span>
      </a>
    </nav>

    <section class="kontak-grid-utama">
      <article class="kontak-panel sekretariat">
        <div class="panel-title">
          <span>▥</span>
          <div><h2>Informasi Sekretariat RW</h2><p>Informasi layanan dan lokasi sekretariat RW 02 Sukatani.</p></div>
        </div>

        <div class="sekretariat-foto">
          <img src="./foto/kegiatan-rapat-warga.jpg" alt="" decoding="async" />
          <div><strong>SEKRETARIAT</strong><small>RW 02 SUKATANI</small></div>
        </div>

        <dl class="info-list">
          <div><dt><span>●</span>Alamat</dt><dd>{alamat}</dd></div>
          <div><dt><span>◷</span>Jam Pelayanan</dt><dd>Senin – Jumat · {jamSeninJumat}<br />Sabtu · {jamSabtu}<br />Minggu · Libur / sesuai kebutuhan</dd></div>
          <div><dt><span>✉</span>Email</dt><dd>{email || "Belum dicantumkan pengurus"}</dd></div>
          <div><dt><span>⌕</span>Kontak Sekretariat</dt><dd>{sekretaris || "Belum dicantumkan pengurus"}</dd></div>
        </dl>

        <div class="sekretariat-actions">
          <a href="#lokasi-kontak">⌖ &nbsp; Lihat Lokasi di Peta</a>
          <a href="https://www.google.com/maps/search/?api=1&query=Perum+Pondok+Sukatani+Permai+Rajeg" target="_blank" rel="noopener noreferrer">Dapatkan Rute →</a>
        </div>
      </article>

      <article class="kontak-panel pesan" id="form-kontak">
        <div class="panel-title">
          <span>✎</span>
          <div><h2>Kirim Pesan / Pertanyaan</h2><p>Sampaikan pertanyaan, saran, kritik, atau aspirasi secara langsung melalui form berikut.</p></div>
        </div>

        <form onsubmit={kirimPesan}>
          <label>
            <span>Nama Lengkap *</span>
            <input bind:value={form.nama} placeholder="Masukkan nama lengkap" required />
          </label>
          <label>
            <span>Email / WhatsApp *</span>
            <input bind:value={form.kontak} placeholder="Masukkan email atau nomor WhatsApp" required />
          </label>
          <label>
            <span>Kategori *</span>
            <select bind:value={form.kategori}>
              <option>Pertanyaan Umum</option>
              <option>Administrasi / Surat</option>
              <option>Keamanan</option>
              <option>Kebersihan</option>
              <option>Fasilitas Umum</option>
              <option>UMKM</option>
              <option>Saran / Aspirasi</option>
            </select>
          </label>
          <label>
            <span>Pesan *</span>
            <textarea bind:value={form.pesan} placeholder="Tulis pesan Anda di sini..." required></textarea>
          </label>

          <div class="pesan-note">
            <span>⌕</span>
            <div><strong>Butuh mengirim foto atau berkas?</strong><small>Gunakan halaman Pengaduan setelah pesan dikirim untuk melengkapi laporan jika diperlukan.</small></div>
            <a href="#/pengaduan">Buka Pengaduan</a>
          </div>

          <button type="submit" disabled={mengirim}>{mengirim ? "Mengirim..." : "➤  Kirim Pesan"}</button>
          <p class="form-foot">Pesan masuk sebagai tiket layanan agar dapat ditindaklanjuti pengurus.</p>
        </form>
      </article>

      <aside class="kontak-panel pengurus">
        <div class="panel-title">
          <span>♟</span>
          <div><h2>Kontak Pengurus RW</h2><p>Hubungi pengurus sesuai kebutuhan Anda.</p></div>
        </div>

        <div class="pengurus-list">
          {#each pengurus as o, i}
            <div class="pengurus-row">
              <span class="pengurus-avatar">
                {#if o.foto}<img src={o.foto} alt="" decoding="async" />{:else}{String(o.nama || o.jabatan || "?").trim().charAt(0) || "?"}{/if}
              </span>
              <div>
                <strong>{o.jabatan || "Pengurus RW"}</strong>
                <small>{o.nama || "Nama belum tersedia"}</small>
              </div>
              {#if o.kontak}
                <a class="wa-icon" href={"https://wa.me/" + nomorWa(o.kontak)} target="_blank" rel="noopener noreferrer" aria-label={"WhatsApp " + (o.nama || o.jabatan)}>◉</a>
              {:else}
                <span class="wa-icon mati" title="Kontak belum diizinkan">—</span>
              {/if}
            </div>
          {/each}
        </div>

        <p class="pengurus-note">Nomor hanya ditampilkan setelah pemiliknya memberikan izin.</p>
      </aside>
    </section>

    <section class="kontak-grid-bawah">
      <article class="kontak-panel lokasi" id="lokasi-kontak">
        <div class="panel-title">
          <span>▣</span>
          <div><h2>Lokasi RW 02 Sukatani</h2><p>Peta wilayah RW 02 dan lokasi sekretariat.</p></div>
        </div>
        <div class="map-wrap"><Peta perbesaran={18} /></div>
        <div class="map-caption">
          <span><i class="merah"></i>Sekretariat RW 02</span>
          <span><i class="hijau"></i>Fasilitas umum</span>
          <span><i class="biru"></i>Wilayah Permai Sukatani</span>
        </div>
        <p>{alamat}. Peta membantu warga menemukan lokasi layanan dan fasilitas lingkungan.</p>
      </article>

      <article class="kontak-panel layanan-cepat">
        <div class="panel-title">
          <span>◉</span>
          <div><h2>Layanan & Kontak Cepat</h2><p>Pilih kebutuhan Anda untuk menuju layanan terkait.</p></div>
        </div>
        <div class="layanan-kontak-grid">
          {#each layananCepat as l}
            <a href={l[3]}>
              <span>{l[0]}</span>
              <div><strong>{l[1]}</strong><small>{l[2]}</small></div>
              <b>›</b>
            </a>
          {/each}
        </div>
      </article>
    </section>

    <section class="kontak-faq-quote">
      <article class="kontak-panel faq">
        <div class="panel-title faq-title">
          <span>?</span>
          <div><h2>Pertanyaan yang Sering Diajukan</h2><p>Temukan jawaban cepat untuk pertanyaan umum.</p></div>
          <a href="#/layanan">Lihat Semua FAQ →</a>
        </div>

        <div class="faq-list">
          {#each faq as f, i}
            <button type="button" class:terbuka={bukaFaq === i} onclick={() => (bukaFaq = bukaFaq === i ? -1 : i)}>
              <span><strong>{f.q}</strong>{#if bukaFaq === i}<small>{f.a}</small>{/if}</span>
              <b>{bukaFaq === i ? "−" : "⌄"}</b>
            </button>
          {/each}
        </div>
      </article>

      <aside class="kontak-quote">
        <img src="./foto/kegiatan-kerja-bakti.jpg" alt="" decoding="async" />
        <span></span>
        <blockquote>“Lingkungan yang baik dimulai dari komunikasi yang terbuka.”</blockquote>
        <small>— RW 02 Sukatani</small>
      </aside>
    </section>
  </main>
</div>

<style>
  .kontak-modern {
    --k-bg: #f5f8f4;
    --k-card: #ffffff;
    --k-ink: #102f3a;
    --k-text: #596b6c;
    --k-line: #dce6df;
    --k-green: #08765d;
    --k-green-2: #0e9970;
    width: 100vw;
    margin-left: calc(50% - 50vw);
    margin-top: -32px;
    margin-bottom: -64px;
    overflow: hidden;
    color: var(--k-ink);
    background:
      radial-gradient(circle at 3% 37%, rgba(50,136,91,.06), transparent 18%),
      radial-gradient(circle at 96% 54%, rgba(50,136,91,.05), transparent 19%),
      var(--k-bg);
    font-family: "Plus Jakarta Sans", system-ui, sans-serif;
  }

  .kontak-wadah {
    width: min(1180px, calc(100% - 40px));
    margin-inline: auto;
  }

  .kontak-hero {
    position: relative;
    min-height: 340px;
    color: #fff;
    background:
      linear-gradient(90deg, rgba(3,48,41,.08), rgba(3,48,41,.08)),
      url("./foto/kegiatan-pengecatan.jpg") center 52% / cover no-repeat;
  }

  .kontak-hero-lapis {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, rgba(3,43,37,.94) 0%, rgba(5,58,48,.72) 45%, rgba(5,49,41,.22) 72%, rgba(3,42,37,.55)),
      linear-gradient(180deg, rgba(3,24,22,.10), rgba(3,39,34,.42));
  }

  .kontak-hero-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 230px;
    gap: 35px;
    align-items: center;
    min-height: 340px;
    padding: 52px 0 42px;
  }

  .kontak-hero-copy { max-width: 650px; }

  .kontak-kicker {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 10px;
    color: #d8f6ea;
    font-size: 8.5px;
    font-weight: 700;
  }

  .kontak-kicker span { color: #65e7ba; font-size: 17px; }

  .kontak-hero h1 {
    margin: 0;
    color: #fff;
    font-size: clamp(42px, 5vw, 62px);
    line-height: .95;
    letter-spacing: -.045em;
  }

  .kontak-hero h2 {
    margin: 5px 0 0;
    color: #fff;
    font-size: clamp(20px, 2.4vw, 29px);
    line-height: 1.05;
  }

  .kontak-hero-copy > p:last-of-type {
    max-width: 49ch;
    margin: 12px 0 0;
    color: rgba(244,252,249,.91);
    font-size: 11.5px;
    line-height: 1.55;
  }

  .kontak-pill-row {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-top: 15px;
  }

  .kontak-pill-row span {
    padding: 6px 9px;
    border: 1px solid rgba(101,232,192,.26);
    border-radius: 999px;
    color: #eefcf7;
    background: rgba(4,79,63,.46);
    font-size: 7px;
    font-weight: 700;
    backdrop-filter: blur(6px);
  }

  .kontak-hero-badge {
    align-self: center;
    justify-self: end;
    width: 190px;
    padding: 18px 18px 20px;
    border: 1px solid rgba(255,255,255,.30);
    border-radius: 13px;
    background: rgba(4,48,42,.56);
    backdrop-filter: blur(9px);
  }

  .kontak-hero-badge > span {
    color: #fff;
    font-family: Georgia, serif;
    font-size: 28px;
    line-height: .7;
  }

  .kontak-hero-badge strong {
    display: block;
    margin-top: 7px;
    color: #fff;
    font-family: Georgia, serif;
    font-size: 20px;
    font-style: italic;
    line-height: 1.12;
  }

  .kontak-isi {
    position: relative;
    z-index: 2;
    padding: 0 0 48px;
  }

  .kontak-shortcut {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 8px;
    margin-top: -18px;
    padding: 9px;
    border: 1px solid var(--k-line);
    border-radius: 13px;
    background: rgba(255,255,255,.95);
    box-shadow: 0 15px 38px -31px rgba(18,66,50,.45);
    backdrop-filter: blur(10px);
  }

  .kontak-shortcut a {
    min-width: 0;
    min-height: 58px;
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr);
    gap: 9px;
    align-items: center;
    padding: 7px 8px;
    border-radius: 8px;
    color: var(--k-ink);
    background: #fff;
    text-decoration: none;
  }

  .shortcut-icon {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    color: #fff;
    background: linear-gradient(180deg, #18b984, #08735c);
    font-size: 17px;
  }

  .kontak-shortcut strong,
  .kontak-shortcut small { display: block; }

  .kontak-shortcut strong {
    font-size: 9px;
  }

  .kontak-shortcut small {
    margin-top: 2px;
    color: var(--k-text);
    font-size: 6.5px;
  }

  .kontak-grid-utama {
    display: grid;
    grid-template-columns: .98fr 1.06fr .84fr;
    gap: 11px;
    margin-top: 12px;
  }

  .kontak-panel {
    min-width: 0;
    border: 1px solid var(--k-line);
    border-radius: 10px;
    background: var(--k-card);
    box-shadow: 0 12px 28px -25px rgba(24,65,51,.32);
  }

  .sekretariat,
  .pesan,
  .pengurus,
  .lokasi,
  .layanan-cepat,
  .faq {
    padding: 11px;
  }

  .panel-title {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    min-height: 35px;
  }

  .panel-title > span {
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    flex: 0 0 30px;
    border-radius: 7px;
    color: #fff;
    background: linear-gradient(180deg, #179d74, #087259);
    font-size: 13px;
  }

  .panel-title h2 {
    margin: 0;
    color: var(--k-ink);
    font-size: 14px;
    line-height: 1.1;
  }

  .panel-title p {
    margin: 3px 0 0;
    color: var(--k-text);
    font-size: 6.5px;
    line-height: 1.35;
  }

  .sekretariat-foto {
    position: relative;
    height: 130px;
    overflow: hidden;
    margin-top: 8px;
    border-radius: 8px;
  }

  .sekretariat-foto img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .sekretariat-foto::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(4,48,42,.18), rgba(4,48,42,.02));
  }

  .sekretariat-foto > div {
    position: absolute;
    z-index: 1;
    left: 50%;
    top: 50%;
    padding: 8px 12px;
    border: 1px solid rgba(255,255,255,.62);
    border-radius: 4px;
    color: #fff;
    background: rgba(5,50,44,.74);
    text-align: center;
    transform: translate(-50%, -50%);
  }

  .sekretariat-foto strong,
  .sekretariat-foto small { display: block; }

  .sekretariat-foto strong { font-size: 10px; }
  .sekretariat-foto small { margin-top: 2px; font-size: 7px; }

  .info-list {
    display: grid;
    gap: 0;
    margin: 8px 0 0;
  }

  .info-list > div {
    display: grid;
    grid-template-columns: 110px 1fr;
    gap: 7px;
    padding: 8px 0;
    border-bottom: 1px solid #edf1ee;
  }

  .info-list > div:last-child { border-bottom: 0; }

  .info-list dt {
    color: var(--k-ink);
    font-size: 7px;
    font-weight: 800;
  }

  .info-list dt span {
    width: 20px;
    height: 20px;
    display: inline-grid;
    place-items: center;
    margin-right: 5px;
    border-radius: 5px;
    color: #fff;
    background: #0d8b68;
    font-size: 8px;
  }

  .info-list dd {
    margin: 0;
    color: #40565a;
    font-size: 7px;
    line-height: 1.5;
  }

  .sekretariat-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-top: 7px;
  }

  .sekretariat-actions a {
    min-height: 31px;
    display: grid;
    place-items: center;
    padding: 6px;
    border: 1px solid #cfdcd5;
    border-radius: 6px;
    color: #173e37;
    font-size: 6.3px;
    font-weight: 700;
    text-decoration: none;
  }

  .sekretariat-actions a:first-child {
    color: #fff;
    border-color: #0a785e;
    background: linear-gradient(180deg, #0c735e, #07513f);
  }

  .pesan form {
    display: grid;
    gap: 7px;
    margin-top: 8px;
  }

  .pesan label > span {
    display: block;
    margin-bottom: 4px;
    color: var(--k-ink);
    font-size: 6.7px;
    font-weight: 750;
  }

  .pesan input,
  .pesan select,
  .pesan textarea {
    width: 100%;
    min-height: 34px;
    border: 1px solid #d8e1dc;
    border-radius: 6px;
    outline: none;
    padding: 8px 9px;
    color: #273f43;
    background: #fbfcfb;
    font: inherit;
    font-size: 7px;
  }

  .pesan textarea {
    min-height: 92px;
    resize: vertical;
  }

  .pesan input:focus,
  .pesan select:focus,
  .pesan textarea:focus {
    border-color: #32b58c;
    box-shadow: 0 0 0 2px rgba(50,181,140,.10);
  }

  .pesan-note {
    min-height: 48px;
    display: grid;
    grid-template-columns: 29px minmax(0, 1fr) auto;
    gap: 7px;
    align-items: center;
    padding: 7px;
    border-radius: 6px;
    background: #f1f5f3;
  }

  .pesan-note > span {
    width: 29px;
    height: 29px;
    display: grid;
    place-items: center;
    border-radius: 6px;
    color: #0a795d;
    background: #e1efea;
  }

  .pesan-note strong,
  .pesan-note small { display: block; }
  .pesan-note strong { color: #203c3d; font-size: 6.5px; }
  .pesan-note small { margin-top: 2px; color: #71817d; font-size: 5.3px; }
  .pesan-note a {
    padding: 5px 7px;
    border-radius: 5px;
    color: #1b4a3f;
    background: #d9e9e3;
    font-size: 5.5px;
    font-weight: 700;
    text-decoration: none;
  }

  .pesan form > button {
    min-height: 35px;
    border: 0;
    border-radius: 6px;
    color: #fff;
    background: linear-gradient(180deg, #138768, #087159);
    font-size: 7px;
    font-weight: 800;
    cursor: pointer;
  }

  .pesan form > button:disabled { opacity: .6; cursor: wait; }

  .form-foot {
    margin: 0;
    color: #82908c;
    font-size: 5.5px;
    text-align: center;
  }

  .pengurus-list {
    display: grid;
    margin-top: 7px;
  }

  .pengurus-row {
    min-height: 45px;
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr) 28px;
    gap: 7px;
    align-items: center;
    border-bottom: 1px solid #edf1ee;
  }

  .pengurus-row:last-child { border-bottom: 0; }

  .pengurus-avatar {
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    overflow: hidden;
    border-radius: 50%;
    color: #0a6652;
    background: #dceee8;
    font-size: 8px;
    font-weight: 800;
  }

  .pengurus-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .pengurus-row strong,
  .pengurus-row small { display: block; }

  .pengurus-row strong {
    color: var(--k-ink);
    font-size: 6.7px;
  }

  .pengurus-row small {
    margin-top: 2px;
    color: var(--k-text);
    font-size: 5.6px;
  }

  .wa-icon {
    width: 25px;
    height: 25px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: #fff;
    background: #12b76a;
    font-size: 9px;
    text-decoration: none;
  }

  .wa-icon.mati {
    color: #80928d;
    background: #edf2ef;
  }

  .pengurus-note {
    margin: 8px 0 0;
    padding: 8px;
    border-radius: 6px;
    color: #657a73;
    background: #edf4f1;
    font-size: 5.6px;
    line-height: 1.4;
  }

  .kontak-grid-bawah {
    display: grid;
    grid-template-columns: 1.55fr 1fr;
    gap: 11px;
    margin-top: 11px;
  }

  .map-wrap {
    height: 215px;
    overflow: hidden;
    margin-top: 8px;
    border-radius: 8px;
  }

  .map-wrap :global(.peta),
  .map-wrap :global(iframe) {
    width: 100% !important;
    height: 100% !important;
  }

  .map-caption {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 7px;
    color: #536a65;
    font-size: 5.6px;
  }

  .map-caption span { display: flex; align-items: center; gap: 5px; }

  .map-caption i {
    width: 8px;
    height: 8px;
    display: inline-block;
    border-radius: 50%;
  }

  .map-caption .merah { background: #ff4f60; }
  .map-caption .hijau { background: #19ad6c; }
  .map-caption .biru { background: #319be8; }

  .lokasi > p {
    margin: 8px 0 0;
    color: var(--k-text);
    font-size: 6px;
    line-height: 1.45;
  }

  .layanan-kontak-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-top: 8px;
  }

  .layanan-kontak-grid a {
    min-width: 0;
    min-height: 52px;
    display: grid;
    grid-template-columns: 30px minmax(0, 1fr) 12px;
    gap: 7px;
    align-items: center;
    padding: 7px;
    border: 1px solid #e0e8e3;
    border-radius: 7px;
    color: var(--k-ink);
    background: #fbfcfb;
    text-decoration: none;
  }

  .layanan-kontak-grid > a > span {
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    border-radius: 7px;
    color: #fff;
    background: #0b8866;
    font-size: 11px;
  }

  .layanan-kontak-grid strong,
  .layanan-kontak-grid small { display: block; }

  .layanan-kontak-grid strong {
    font-size: 6.3px;
  }

  .layanan-kontak-grid small {
    margin-top: 2px;
    color: var(--k-text);
    font-size: 5.2px;
  }

  .layanan-kontak-grid b {
    color: #0a795d;
    font-size: 14px;
  }

  .kontak-faq-quote {
    display: grid;
    grid-template-columns: 1.35fr .85fr;
    gap: 11px;
    margin-top: 11px;
  }

  .faq-title > a {
    margin-left: auto;
    color: #08765d;
    font-size: 6px;
    font-weight: 700;
    text-decoration: none;
  }

  .faq-list {
    display: grid;
    gap: 4px;
    margin-top: 8px;
  }

  .faq-list button {
    width: 100%;
    min-height: 34px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 18px;
    gap: 8px;
    align-items: center;
    padding: 7px 9px;
    border: 1px solid #e1e8e4;
    border-radius: 5px;
    color: #223e3f;
    background: #fbfcfb;
    text-align: left;
    cursor: pointer;
  }

  .faq-list button strong {
    display: block;
    font-size: 6.5px;
  }

  .faq-list button small {
    display: block;
    margin-top: 5px;
    color: #6a7b77;
    font-size: 5.5px;
    line-height: 1.45;
  }

  .faq-list button b {
    color: #0a765d;
    text-align: center;
  }

  .faq-list button.terbuka {
    border-color: #bcded1;
    background: #f4faf7;
  }

  .kontak-quote {
    position: relative;
    min-height: 218px;
    overflow: hidden;
    border-radius: 10px;
  }

  .kontak-quote img,
  .kontak-quote > span {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .kontak-quote img { object-fit: cover; }

  .kontak-quote > span {
    background: linear-gradient(90deg, rgba(3,48,38,.70), rgba(4,54,40,.30));
  }

  .kontak-quote blockquote {
    position: absolute;
    z-index: 1;
    left: 23px;
    top: 35px;
    max-width: 17ch;
    margin: 0;
    color: #fff;
    font-family: Georgia, serif;
    font-size: 20px;
    font-style: italic;
    line-height: 1.25;
    text-shadow: 0 2px 10px rgba(0,0,0,.30);
  }

  .kontak-quote small {
    position: absolute;
    z-index: 1;
    left: 24px;
    bottom: 24px;
    color: rgba(255,255,255,.86);
    font-size: 6px;
  }

  :global(:root[data-waktu="malam"]) .kontak-modern {
    --k-bg: #071b21;
    --k-card: #0b252a;
    --k-ink: #edf8f5;
    --k-text: #adc2bc;
    --k-line: rgba(190,224,213,.12);
  }

  :global(:root[data-waktu="malam"]) .kontak-shortcut {
    background: rgba(9,33,38,.95);
  }

  :global(:root[data-waktu="malam"]) .kontak-shortcut a,
  :global(:root[data-waktu="malam"]) .pesan input,
  :global(:root[data-waktu="malam"]) .pesan select,
  :global(:root[data-waktu="malam"]) .pesan textarea,
  :global(:root[data-waktu="malam"]) .layanan-kontak-grid a,
  :global(:root[data-waktu="malam"]) .faq-list button {
    color: var(--k-ink);
    border-color: var(--k-line);
    background: rgba(13,42,47,.86);
  }

  :global(:root[data-waktu="malam"]) .info-list > div,
  :global(:root[data-waktu="malam"]) .pengurus-row {
    border-color: var(--k-line);
  }

  @media (max-width: 980px) {
    .kontak-grid-utama {
      grid-template-columns: 1fr 1fr;
    }

    .pengurus {
      grid-column: 1 / -1;
    }

    .pengurus-list {
      grid-template-columns: 1fr 1fr;
      gap: 0 14px;
    }

    .kontak-grid-bawah,
    .kontak-faq-quote {
      grid-template-columns: 1fr;
    }

    .kontak-quote {
      min-height: 190px;
    }
  }

  @media (max-width: 680px) {
    .kontak-modern {
      margin-top: -18px;
      margin-bottom: -44px;
    }

    .kontak-wadah {
      width: 100%;
      max-width: 100%;
      padding-left: 14px;
      padding-right: 14px;
    }

    .kontak-hero {
      min-height: 390px;
      background-position: 62% center;
    }

    .kontak-hero-grid {
      grid-template-columns: 1fr;
      gap: 14px;
      min-height: 390px;
      padding: 38px 0 26px;
    }

    .kontak-hero h1 {
      font-size: 40px;
    }

    .kontak-hero h2 {
      max-width: 18ch;
      font-size: 22px;
    }

    .kontak-hero-copy > p:last-of-type {
      max-width: 42ch;
      font-size: 10px;
    }

    .kontak-hero-badge {
      width: min(190px, 68%);
      justify-self: end;
      padding: 12px;
    }

    .kontak-hero-badge strong {
      font-size: 16px;
    }

    .kontak-shortcut {
      grid-template-columns: 1fr 1fr;
      gap: 5px;
      margin-top: -13px;
      padding: 6px;
    }

    .kontak-shortcut a {
      min-height: 54px;
      grid-template-columns: 36px 1fr;
      padding: 5px;
    }

    .kontak-shortcut a:last-child {
      grid-column: 1 / -1;
    }

    .shortcut-icon {
      width: 36px;
      height: 36px;
    }

    .kontak-grid-utama,
    .kontak-grid-bawah,
    .kontak-faq-quote {
      grid-template-columns: 1fr;
    }

    .pengurus {
      grid-column: auto;
    }

    .pengurus-list {
      grid-template-columns: 1fr;
    }

    .sekretariat-foto {
      height: 160px;
    }

    .info-list > div {
      grid-template-columns: 100px 1fr;
    }

    .map-wrap {
      height: 220px;
    }

    .layanan-kontak-grid {
      grid-template-columns: 1fr 1fr;
    }

    .kontak-quote {
      min-height: 175px;
    }
  }

  @media (max-width: 420px) {
    .kontak-hero h1 {
      font-size: 36px;
    }

    .kontak-hero h2 {
      font-size: 19px;
    }

    .kontak-pill-row {
      gap: 4px;
    }

    .kontak-pill-row span {
      font-size: 6.2px;
    }

    .kontak-shortcut {
      grid-template-columns: 1fr;
    }

    .kontak-shortcut a:last-child {
      grid-column: auto;
    }

    .info-list > div {
      grid-template-columns: 1fr;
      gap: 3px;
    }

    .sekretariat-actions,
    .layanan-kontak-grid {
      grid-template-columns: 1fr;
    }

    .pesan-note {
      grid-template-columns: 29px 1fr;
    }

    .pesan-note a {
      grid-column: 1 / -1;
      text-align: center;
    }
  }
</style>
