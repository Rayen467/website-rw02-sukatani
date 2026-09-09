<script>
  import { KONTEN, KOLEKSI } from "../inti/nama.js";
  import { KATEGORI_PENGADUAN, PENGURUS_RW_BAWAAN } from "../inti/bawaan.js";
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
  let lampiranNama = $state("");

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

  function normalJabatan(s) {
    return String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  const pengurus = $derived.by(() => {
    const dariServer = isi.pengurus_tampil || [];
    return PENGURUS_RW_BAWAAN.map((bawaan) => {
      const cocok = dariServer.find((o) => {
        const a = normalJabatan(o.jabatan);
        const b = normalJabatan(bawaan.jabatan);
        return a === b || a.includes(b) || b.includes(a);
      });

      const hasil = cocok
        ? {
            ...cocok,
            ...bawaan,
            foto: bawaan.foto || cocok.foto,
            kontak: cocok.kontak || bawaan.kontak
          }
        : { ...bawaan };

      if (hasil.jabatan === "Seksi Keamanan" && !hasil.kontak) hasil.kontak = keamanan;
      return hasil;
    });
  });

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
    ["▣", "Transportasi Warga", "Koordinator: Bapak Handoko", "#/layanan"],
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

<div class="kontak-final">
  <section class="kontak-final__hero">
    <div class="kontak-final__hero-shade"></div>
    <div class="kontak-final__wrap kontak-final__hero-grid">
      <nav class="kontak-final__crumb"><a href="#/">Beranda</a><span>›</span><span>Kontak</span></nav>

      <div class="kontak-final__hero-copy">
        <h1>Hubungi Kami</h1>
        <h2>Kami Siap Melayani Warga RW 02</h2>
        <p>Sampaikan pertanyaan, saran, atau kebutuhan Anda. Bersama kita wujudkan Sukatani yang lebih baik, guyub, maju, dan sejahtera.</p>
        <div class="kontak-final__hero-pills">
          <span>✓ Respon Cepat</span>
          <span>✓ Pelayanan Ramah</span>
          <span>✓ Untuk Semua Warga</span>
        </div>
      </div>

      <aside class="kontak-final__hero-quote">
        <span>“</span>
        <strong>Warga<br />Bersuara,<br />RW Bergerak</strong>
      </aside>
    </div>
  </section>

  <main class="kontak-final__wrap kontak-final__main">
    <nav class="kontak-final__shortcuts" aria-label="Kontak cepat">
      <a href={sekretaris ? "https://wa.me/" + nomorWa(sekretaris) : "#form-kontak"} target={sekretaris ? "_blank" : undefined} rel={sekretaris ? "noopener noreferrer" : undefined}>
        <span class="kontak-final__shortcut-icon">◉</span>
        <span><strong>Chat WhatsApp</strong><small>Respon lebih cepat</small></span>
      </a>
      <a href={email ? "mailto:" + email : "#form-kontak"}>
        <span class="kontak-final__shortcut-icon">✉</span>
        <span><strong>Kirim Email</strong><small>Untuk surat resmi</small></span>
      </a>
      <a href="#lokasi-kontak">
        <span class="kontak-final__shortcut-icon">●</span>
        <span><strong>Datang Langsung</strong><small>Ke sekretariat RW 02</small></span>
      </a>
      <a href="#form-kontak">
        <span class="kontak-final__shortcut-icon">▤</span>
        <span><strong>Form Online</strong><small>Saran & pengaduan</small></span>
      </a>
      <a href="#/galeri">
        <span class="kontak-final__shortcut-icon">♟</span>
        <span><strong>Ikuti Media Sosial</strong><small>Update kegiatan</small></span>
      </a>
    </nav>

    <section class="kontak-final__topgrid">
      <article class="kontak-final__card kontak-final__sekretariat">
        <header class="kontak-final__title">
          <span>▥</span>
          <div><h2>Informasi Sekretariat RW</h2><p>Informasi lengkap sekretariat RW 02 Sukatani.</p></div>
        </header>

        <div class="kontak-final__sekretariat-photo">
          <img src="./foto/kegiatan-rapat-warga.jpg" alt="" decoding="async" />
          <div><strong>SEKRETARIAT</strong><small>RW 02 SUKATANI</small></div>
        </div>

        <dl class="kontak-final__info">
          <div><dt><span>●</span>Alamat</dt><dd>{alamat}</dd></div>
          <div><dt><span>◷</span>Jam Pelayanan</dt><dd>Senin – Jumat · {jamSeninJumat}<br />Sabtu · {jamSabtu}<br />Minggu · Libur / sesuai kebutuhan</dd></div>
          <div><dt><span>✉</span>Email</dt><dd>{email || "Belum dicantumkan pengurus"}</dd></div>
          <div><dt><span>⌕</span>Telepon / WhatsApp</dt><dd>{sekretaris || "Belum dicantumkan pengurus"}</dd></div>
        </dl>

        <div class="kontak-final__sekretariat-actions">
          <a href="#lokasi-kontak">⌖ &nbsp; Lihat Lokasi di Maps</a>
          <a href="https://www.google.com/maps/search/?api=1&query=Perum+Pondok+Sukatani+Permai+Rajeg" target="_blank" rel="noopener noreferrer">Dapatkan Rute</a>
        </div>
      </article>

      <article class="kontak-final__card kontak-final__form-card" id="form-kontak">
        <header class="kontak-final__title">
          <span>✎</span>
          <div><h2>Kirim Pesan / Pertanyaan</h2><p>Sampaikan pertanyaan, saran, kritik, atau pengaduan secara langsung.</p></div>
        </header>

        <form class="kontak-final__form" onsubmit={kirimPesan}>
          <label><span>Nama Lengkap *</span><input bind:value={form.nama} placeholder="Masukkan nama lengkap Anda" required /></label>
          <label><span>Email / WhatsApp *</span><input bind:value={form.kontak} placeholder="Masukkan email atau nomor WhatsApp" required /></label>
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
          <label><span>Pesan *</span><textarea bind:value={form.pesan} placeholder="Tulis pesan Anda di sini..." required></textarea></label>

          <label class="kontak-final__file">
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onchange={(e) => (lampiranNama = e.currentTarget.files?.[0]?.name || "")} />
            <span>⌕</span>
            <div><strong>Lampirkan File (Opsional)</strong><small>{lampiranNama || "PDF, JPG, PNG (Maks. 5MB)"}</small></div>
            <b>Pilih File</b>
          </label>

          <button type="submit" disabled={mengirim}>{mengirim ? "Mengirim..." : "➤  Kirim Pesan"}</button>
          <p class="kontak-final__form-note">Kami akan merespon pesan Anda secepat mungkin.</p>
        </form>
      </article>

      <aside class="kontak-final__card kontak-final__pengurus">
        <header class="kontak-final__title">
          <span>♟</span>
          <div><h2>Kontak Pengurus RW</h2><p>Hubungi pengurus sesuai kebutuhan Anda.</p></div>
        </header>

        <div class="kontak-final__pengurus-list">
          {#each pengurus as o}
            <div class="kontak-final__pengurus-row">
              <span class="kontak-final__avatar">
                {#if o.foto}<img src={o.foto} alt="" decoding="async" />{:else}{String(o.nama || o.jabatan || "?").trim().charAt(0) || "?"}{/if}
              </span>
              <div><strong>{o.jabatan || "Pengurus RW"}</strong><small>{o.nama || "Nama belum tersedia"}</small></div>
              {#if o.kontak}
                <a class="kontak-final__wa" href={"https://wa.me/" + nomorWa(o.kontak)} target="_blank" rel="noopener noreferrer">◉</a>
                <a class="kontak-final__tel" href={"tel:" + o.kontak}>⌕</a>
              {:else}
                <span class="kontak-final__wa is-off">—</span>
                <span class="kontak-final__tel is-off">—</span>
              {/if}
            </div>
          {/each}
        </div>

        <p class="kontak-final__privacy">Nomor hanya ditampilkan setelah pemiliknya memberikan izin.</p>
      </aside>
    </section>

    <section class="kontak-final__midgrid">
      <article class="kontak-final__card kontak-final__map-card" id="lokasi-kontak">
        <header class="kontak-final__title">
          <span>▣</span>
          <div><h2>Lokasi RW 02 Sukatani</h2><p>Peta wilayah RW 02 dan lokasi sekretariat.</p></div>
        </header>
        <div class="kontak-final__map"><Peta perbesaran={18} /></div>
        <div class="kontak-final__map-legend">
          <span><i class="red"></i>Batas wilayah RW 02</span>
          <span><i class="green"></i>Sekretariat RW 02</span>
          <span><i class="blue"></i>Fasilitas umum</span>
        </div>
        <p class="kontak-final__map-copy">Wilayah RW 02 Permai Sukatani, Rajeg. Peta membantu warga melihat lokasi sekretariat, fasilitas umum, dan area lingkungan RW 02.</p>
      </article>

      <article class="kontak-final__card kontak-final__services">
        <header class="kontak-final__title">
          <span>◉</span>
          <div><h2>Layanan & Kontak Cepat</h2><p>Pilih kebutuhan Anda untuk menghubungi langsung.</p></div>
        </header>
        <div class="kontak-final__services-grid">
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

    <section class="kontak-final__bottomgrid">
      <article class="kontak-final__card kontak-final__faq">
        <header class="kontak-final__title kontak-final__faq-title">
          <span>?</span>
          <div><h2>Pertanyaan yang Sering Diajukan</h2><p>Temukan jawaban cepat untuk pertanyaan umum.</p></div>
          <a href="#/layanan">Lihat Semua FAQ →</a>
        </header>

        <div class="kontak-final__faq-list">
          {#each faq as f, i}
            <button type="button" class:is-open={bukaFaq === i} onclick={() => (bukaFaq = bukaFaq === i ? -1 : i)}>
              <span><strong>{f.q}</strong>{#if bukaFaq === i}<small>{f.a}</small>{/if}</span>
              <b>{bukaFaq === i ? "−" : "⌄"}</b>
            </button>
          {/each}
        </div>
      </article>

      <aside class="kontak-final__quote-card">
        <img src="./foto/kegiatan-kerja-bakti.jpg" alt="" decoding="async" />
        <div></div>
        <blockquote>“Komunikasi yang baik adalah awal dari lingkungan yang lebih harmonis.”</blockquote>
        <small>— RW 02 Sukatani</small>
      </aside>
    </section>
  </main>
</div>

<style>
  .kontak-final,
  .kontak-final * {
    box-sizing: border-box;
  }

  .kontak-final {
    width: 100vw;
    margin-left: calc(50% - 50vw);
    margin-top: -32px;
    margin-bottom: -64px;
    overflow: hidden;
    color: #102c3b !important;
    background: #f7faf7 !important;
    font-family: "Plus Jakarta Sans", system-ui, sans-serif;
  }

  .kontak-final__wrap {
    width: min(1120px, calc(100% - 42px));
    margin-inline: auto;
  }

  .kontak-final__hero {
    position: relative;
    min-height: 292px;
    color: #fff;
    background:
      linear-gradient(90deg, rgba(3,46,39,.95), rgba(4,58,48,.72) 43%, rgba(4,50,43,.24) 74%, rgba(3,42,37,.35)),
      url("./foto/kegiatan-pengecatan.jpg") center 52% / cover no-repeat;
  }

  .kontak-final__hero-shade {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0,0,0,.03), rgba(2,37,31,.20));
  }

  .kontak-final__hero-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 190px;
    grid-template-rows: auto 1fr;
    gap: 8px 28px;
    min-height: 292px;
    padding: 22px 0 25px;
  }

  .kontak-final__crumb {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: 5px;
    color: rgba(255,255,255,.9);
    font-size: 8px;
  }

  .kontak-final__crumb a { color: inherit; text-decoration: none; }

  .kontak-final__hero-copy {
    align-self: center;
    max-width: 610px;
  }

  .kontak-final__hero-copy h1 {
    margin: 0;
    color: #fff;
    font-size: clamp(39px, 4.3vw, 52px);
    line-height: .98;
    letter-spacing: -.04em;
  }

  .kontak-final__hero-copy h2 {
    margin: 5px 0 0;
    color: #fff;
    font-size: clamp(20px, 2.1vw, 25px);
    line-height: 1.08;
  }

  .kontak-final__hero-copy > p {
    max-width: 49ch;
    margin: 10px 0 0;
    color: rgba(255,255,255,.92);
    font-size: 11px;
    line-height: 1.5;
  }

  .kontak-final__hero-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-top: 13px;
  }

  .kontak-final__hero-pills span {
    padding: 5px 8px;
    border: 1px solid rgba(93,225,185,.32);
    border-radius: 999px;
    color: #effcf8;
    background: rgba(4,79,63,.48);
    font-size: 7px;
    font-weight: 700;
  }

  .kontak-final__hero-quote {
    align-self: center;
    justify-self: end;
    width: 174px;
    padding: 15px 16px 18px;
    border: 1px solid rgba(255,255,255,.28);
    border-radius: 12px;
    background: rgba(4,49,42,.54);
    backdrop-filter: blur(8px);
  }

  .kontak-final__hero-quote > span {
    color: #fff;
    font-family: Georgia, serif;
    font-size: 28px;
    line-height: .7;
  }

  .kontak-final__hero-quote strong {
    display: block;
    margin-top: 7px;
    color: #fff;
    font-family: Georgia, serif;
    font-size: 20px;
    font-style: italic;
    line-height: 1.08;
  }

  .kontak-final__main {
    position: relative;
    z-index: 2;
    padding-bottom: 38px;
  }

  .kontak-final__shortcuts {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 8px;
    margin-top: -16px;
    padding: 8px;
    border: 1px solid #dfe8e2;
    border-radius: 12px;
    background: rgba(255,255,255,.97);
    box-shadow: 0 15px 34px -28px rgba(20,62,48,.36);
  }

  .kontak-final__shortcuts a {
    min-width: 0;
    min-height: 63px;
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr);
    gap: 9px;
    align-items: center;
    padding: 7px 8px;
    border: 1px solid #edf2ef;
    border-radius: 8px;
    color: #102c3b;
    background: #fff;
    text-decoration: none;
  }

  .kontak-final__shortcut-icon {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    color: #fff;
    background: linear-gradient(180deg,#19b985,#08745c);
    font-size: 16px;
  }

  .kontak-final__shortcuts strong,
  .kontak-final__shortcuts small { display:block; }

  .kontak-final__shortcuts strong { font-size: 9px; }
  .kontak-final__shortcuts small { margin-top:2px; color:#66777a; font-size:6.4px; }

  .kontak-final__topgrid {
    display: grid;
    grid-template-columns: minmax(0,.98fr) minmax(0,1.04fr) minmax(0,.86fr);
    gap: 10px;
    align-items: stretch;
    margin-top: 10px;
  }

  .kontak-final__card {
    min-width: 0;
    padding: 10px;
    border: 1px solid #e1e9e4;
    border-radius: 9px;
    color: #102c3b;
    background: #fff;
    box-shadow: 0 12px 28px -26px rgba(24,65,51,.28);
  }

  .kontak-final__title {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    min-height: 33px;
  }

  .kontak-final__title > span {
    width: 28px;
    height: 28px;
    display: grid;
    place-items: center;
    flex: 0 0 28px;
    border-radius: 7px;
    color: #fff;
    background: linear-gradient(180deg,#179d74,#087259);
    font-size: 12px;
  }

  .kontak-final__title h2 { margin:0; color:#102c3b; font-size:13px; line-height:1.1; }
  .kontak-final__title p { margin:3px 0 0; color:#6b7b7b; font-size:6px; line-height:1.35; }

  .kontak-final__sekretariat-photo {
    position: relative;
    height: 130px;
    overflow: hidden;
    margin-top: 7px;
    border-radius: 8px;
  }

  .kontak-final__sekretariat-photo img { width:100%; height:100%; object-fit:cover; }
  .kontak-final__sekretariat-photo::after { content:""; position:absolute; inset:0; background:linear-gradient(90deg,rgba(4,48,42,.16),transparent); }

  .kontak-final__sekretariat-photo > div {
    position:absolute;
    z-index:1;
    left:50%;
    top:50%;
    padding:7px 11px;
    border:1px solid rgba(255,255,255,.7);
    border-radius:4px;
    color:#fff;
    background:rgba(5,50,44,.76);
    text-align:center;
    transform:translate(-50%,-50%);
  }

  .kontak-final__sekretariat-photo strong,
  .kontak-final__sekretariat-photo small { display:block; }
  .kontak-final__sekretariat-photo strong { font-size:10px; }
  .kontak-final__sekretariat-photo small { margin-top:2px; font-size:7px; }

  .kontak-final__info {
    display:grid;
    margin:6px 0 0;
  }

  .kontak-final__info > div {
    display:grid;
    grid-template-columns:100px minmax(0,1fr);
    gap:6px;
    padding:7px 0;
    border-bottom:1px solid #edf2ef;
  }

  .kontak-final__info > div:last-child { border-bottom:0; }

  .kontak-final__info dt { color:#16353e; font-size:6.7px; font-weight:800; }
  .kontak-final__info dt span {
    width:20px; height:20px; display:inline-grid; place-items:center; margin-right:5px;
    border-radius:5px; color:#fff; background:#0d8b68; font-size:8px;
  }
  .kontak-final__info dd { margin:0; color:#40565a; font-size:6.8px; line-height:1.5; }

  .kontak-final__sekretariat-actions {
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:5px;
    margin-top:5px;
  }

  .kontak-final__sekretariat-actions a {
    min-height:31px; display:grid; place-items:center; padding:6px;
    border:1px solid #cfdcd5; border-radius:6px; color:#173e37; font-size:6.3px; font-weight:700; text-decoration:none;
  }

  .kontak-final__sekretariat-actions a:first-child { color:#fff; border-color:#0a785e; background:linear-gradient(180deg,#0c735e,#07513f); }

  .kontak-final__form {
    display:grid;
    gap:6px;
    margin-top:7px;
  }

  .kontak-final__form label > span { display:block; margin-bottom:4px; color:#16353e; font-size:6.5px; font-weight:750; }
  .kontak-final__form input,
  .kontak-final__form select,
  .kontak-final__form textarea {
    width:100%; min-height:33px; padding:7px 8px;
    border:1px solid #d8e1dc; border-radius:6px; outline:0;
    color:#273f43; background:#fbfcfb; font:inherit; font-size:6.9px;
  }
  .kontak-final__form textarea { min-height:92px; resize:vertical; }
  .kontak-final__form input:focus,
  .kontak-final__form select:focus,
  .kontak-final__form textarea:focus { border-color:#32b58c; box-shadow:0 0 0 2px rgba(50,181,140,.1); }

  .kontak-final__file {
    min-height:48px;
    display:grid !important;
    grid-template-columns:30px minmax(0,1fr) auto;
    gap:7px;
    align-items:center;
    padding:7px !important;
    border-radius:6px;
    background:#f1f5f3;
    cursor:pointer;
  }

  .kontak-final__file > input { position:absolute; width:1px!important; height:1px!important; opacity:0; pointer-events:none; }
  .kontak-final__file > span {
    width:30px; height:30px; display:grid!important; place-items:center; margin:0!important;
    border-radius:6px; color:#0a795d!important; background:#e0efea; font-size:13px!important;
  }
  .kontak-final__file strong,
  .kontak-final__file small { display:block; }
  .kontak-final__file strong { color:#203c3d; font-size:6.3px; }
  .kontak-final__file small { margin-top:2px; color:#71817d; font-size:5.2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .kontak-final__file > b { padding:5px 8px; border-radius:5px; color:#24483f; background:#dfe9e5; font-size:5.7px; }

  .kontak-final__form > button {
    min-height:35px; border:0; border-radius:6px; color:#fff;
    background:linear-gradient(180deg,#138768,#087159); font-size:7px; font-weight:800; cursor:pointer;
  }
  .kontak-final__form > button:disabled { opacity:.6; cursor:wait; }
  .kontak-final__form-note { margin:0; color:#83918d; font-size:5.5px; text-align:center; }

  .kontak-final__pengurus-list { display:grid; margin-top:7px; }
  .kontak-final__pengurus-row {
    min-height:44px;
    display:grid;
    grid-template-columns:32px minmax(0,1fr) 25px 25px;
    gap:6px;
    align-items:center;
    border-bottom:1px solid #edf2ef;
  }
  .kontak-final__pengurus-row:last-child { border-bottom:0; }

  .kontak-final__avatar {
    width:30px; height:30px; display:grid; place-items:center; overflow:hidden;
    border-radius:50%; color:#0a6652; background:#dceee8; font-size:8px; font-weight:800;
  }
  .kontak-final__avatar img { width:100%; height:100%; object-fit:cover; }

  .kontak-final__pengurus-row strong,
  .kontak-final__pengurus-row small { display:block; }
  .kontak-final__pengurus-row strong { color:#102c3b; font-size:6.4px; }
  .kontak-final__pengurus-row small { margin-top:2px; color:#66777a; font-size:5.3px; }

  .kontak-final__wa,
  .kontak-final__tel {
    width:24px; height:24px; display:grid; place-items:center; border-radius:50%; text-decoration:none;
  }
  .kontak-final__wa { color:#fff; background:#12b76a; }
  .kontak-final__tel { color:#0c725a; background:#edf6f2; border:1px solid #dceae4; font-size:8px; }
  .is-off { color:#8b9b96!important; background:#eef3f0!important; border-color:#e5ece8!important; }

  .kontak-final__privacy {
    margin:7px 0 0;
    padding:7px;
    border-radius:6px;
    color:#657a73;
    background:#edf4f1;
    font-size:5.6px;
    line-height:1.4;
  }

  .kontak-final__midgrid {
    display:grid;
    grid-template-columns:minmax(0,1.35fr) minmax(0,.92fr);
    gap:10px;
    margin-top:10px;
  }

  .kontak-final__map {
    position:relative;
    height:218px;
    overflow:hidden;
    margin-top:7px;
    border:1px solid #dfe7e2;
    border-radius:8px;
    background:#dfe7e2;
  }

  .kontak-final__map :global(.petabox) { height:100%!important; min-height:100%!important; }
  .kontak-final__map :global(.peta-sendiri),
  .kontak-final__map :global(.peta-gambar),
  .kontak-final__map :global(iframe) { width:100%!important; height:100%!important; min-height:100%!important; }
  .kontak-final__map :global(.keterangan-batas),
  .kontak-final__map :global(.baris-tombol),
  .kontak-final__map :global(.verifikasi) { display:none!important; }

  .kontak-final__map-legend {
    display:flex; flex-wrap:wrap; gap:14px; margin-top:6px; color:#536a65; font-size:5.6px;
  }
  .kontak-final__map-legend span { display:flex; align-items:center; gap:5px; }
  .kontak-final__map-legend i { width:8px; height:8px; display:inline-block; border-radius:50%; }
  .kontak-final__map-legend .red { background:#ff4f60; }
  .kontak-final__map-legend .green { background:#19ad6c; }
  .kontak-final__map-legend .blue { background:#319be8; }

  .kontak-final__map-copy { margin:6px 0 0; color:#607078; font-size:5.8px; line-height:1.45; }

  .kontak-final__services-grid {
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:6px;
    margin-top:7px;
  }

  .kontak-final__services-grid a {
    min-width:0;
    min-height:50px;
    display:grid;
    grid-template-columns:29px minmax(0,1fr) 10px;
    gap:6px;
    align-items:center;
    padding:6px;
    border:1px solid #e0e8e3;
    border-radius:7px;
    color:#102c3b;
    background:#fbfcfb;
    text-decoration:none;
  }

  .kontak-final__services-grid > a > span {
    width:29px; height:29px; display:grid; place-items:center;
    border-radius:7px; color:#fff; background:#0b8866; font-size:10px;
  }
  .kontak-final__services-grid strong,
  .kontak-final__services-grid small { display:block; }
  .kontak-final__services-grid strong { font-size:6.2px; }
  .kontak-final__services-grid small { margin-top:2px; color:#66777a; font-size:5px; }
  .kontak-final__services-grid b { color:#0a795d; font-size:14px; }

  .kontak-final__bottomgrid {
    display:grid;
    grid-template-columns:minmax(0,1.28fr) minmax(0,.95fr);
    gap:10px;
    margin-top:10px;
  }

  .kontak-final__faq-title > a {
    margin-left:auto;
    color:#08765d;
    font-size:6px;
    font-weight:700;
    text-decoration:none;
  }

  .kontak-final__faq-list { display:grid; gap:3px; margin-top:7px; }
  .kontak-final__faq-list button {
    width:100%;
    min-height:33px;
    display:grid;
    grid-template-columns:minmax(0,1fr) 18px;
    gap:8px;
    align-items:center;
    padding:6px 8px;
    border:1px solid #e1e8e4;
    border-radius:5px;
    color:#223e3f;
    background:#fbfcfb;
    text-align:left;
    cursor:pointer;
  }
  .kontak-final__faq-list button strong { display:block; font-size:6.3px; }
  .kontak-final__faq-list button small { display:block; margin-top:5px; color:#6a7b77; font-size:5.5px; line-height:1.45; }
  .kontak-final__faq-list button b { color:#0a765d; text-align:center; }
  .kontak-final__faq-list button.is-open { border-color:#bcded1; background:#f4faf7; }

  .kontak-final__quote-card {
    position:relative;
    min-height:184px;
    overflow:hidden;
    border-radius:10px;
  }
  .kontak-final__quote-card img,
  .kontak-final__quote-card > div {
    position:absolute; inset:0; width:100%; height:100%;
  }
  .kontak-final__quote-card img { object-fit:cover; filter:saturate(.9) brightness(.82); }
  .kontak-final__quote-card > div { background:linear-gradient(90deg,rgba(3,48,38,.72),rgba(4,54,40,.26)); }
  .kontak-final__quote-card blockquote {
    position:absolute; z-index:1; left:21px; top:31px; max-width:20ch; margin:0;
    color:#fff; font-family:Georgia,serif; font-size:17px; font-style:italic; line-height:1.25;
    text-shadow:0 2px 10px rgba(0,0,0,.3);
  }
  .kontak-final__quote-card small { position:absolute; z-index:1; left:22px; bottom:20px; color:rgba(255,255,255,.88); font-size:6px; }

  @media (max-width: 980px) {
    .kontak-final__wrap { width:min(900px,calc(100% - 30px)); }
    .kontak-final__topgrid { grid-template-columns:1fr 1fr; }
    .kontak-final__pengurus { grid-column:1 / -1; }
    .kontak-final__pengurus-list { grid-template-columns:1fr 1fr; column-gap:14px; }
    .kontak-final__midgrid,
    .kontak-final__bottomgrid { grid-template-columns:1fr; }
  }

  @media (max-width: 680px) {
    .kontak-final { margin-top:-18px; margin-bottom:-44px; }
    .kontak-final__wrap { width:100%; max-width:100%; padding-inline:14px; }

    .kontak-final__hero { min-height:360px; background-position:62% center; }
    .kontak-final__hero-grid {
      grid-template-columns:1fr;
      grid-template-rows:auto auto auto;
      gap:8px;
      min-height:360px;
      padding:23px 0 24px;
    }
    .kontak-final__crumb { grid-column:auto; }
    .kontak-final__hero-copy h1 { font-size:36px; }
    .kontak-final__hero-copy h2 { font-size:19px; }
    .kontak-final__hero-copy > p { font-size:10px; }
    .kontak-final__hero-quote { width:165px; justify-self:end; padding:10px 12px; }
    .kontak-final__hero-quote strong { font-size:16px; }

    .kontak-final__shortcuts {
      grid-template-columns:1fr 1fr;
      gap:5px;
      margin-top:-12px;
      padding:6px;
    }
    .kontak-final__shortcuts a { min-height:54px; grid-template-columns:36px 1fr; padding:5px; }
    .kontak-final__shortcut-icon { width:36px; height:36px; }
    .kontak-final__shortcuts a:last-child { grid-column:1 / -1; }

    .kontak-final__topgrid,
    .kontak-final__midgrid,
    .kontak-final__bottomgrid { grid-template-columns:1fr; }

    .kontak-final__pengurus { grid-column:auto; }
    .kontak-final__pengurus-list { grid-template-columns:1fr; }
    .kontak-final__sekretariat-photo { height:160px; }
    .kontak-final__map { height:220px; }
    .kontak-final__services-grid { grid-template-columns:1fr 1fr; }
  }

  @media (max-width: 420px) {
    .kontak-final__shortcuts { grid-template-columns:1fr; }
    .kontak-final__shortcuts a:last-child { grid-column:auto; }
    .kontak-final__info > div { grid-template-columns:1fr; gap:3px; }
    .kontak-final__sekretariat-actions,
    .kontak-final__services-grid { grid-template-columns:1fr; }
    .kontak-final__file { grid-template-columns:30px 1fr; }
    .kontak-final__file > b { grid-column:1 / -1; text-align:center; }
  }
</style>
