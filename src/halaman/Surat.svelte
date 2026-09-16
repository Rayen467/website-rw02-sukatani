<script>
  import { pakai } from "../keadaan/isi.svelte.js";
  import { JENIS_SURAT_BAWAAN } from "../inti/bawaan.js";
  import { keDaftar } from "../inti/format.js";

  let cari = $state("");

  const daftar = $derived(
    pakai("jenis_surat", JENIS_SURAT_BAWAAN).map((s, i) => ({
      ...s,
      indeks: i,
      daftarSyarat: Array.isArray(s.syarat) ? s.syarat : keDaftar(s.syarat)
    }))
  );

  const hasil = $derived.by(() => {
    const q = cari.trim().toLowerCase();
    return daftar.filter((s) =>
      !q || [s.nama, ...(s.daftarSyarat || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  });

  const ikon = ["▤", "⌂", "✓", "♡", "₿", "▣", "◎", "✿"];
  const warna = ["hijau", "oranye", "biru", "merah"];
</script>

<div class="surat-page">
  <section class="surat-hero">
    <div class="surat-shell hero-grid">
      <div class="hero-copy">
        <nav class="surat-breadcrumb" aria-label="Breadcrumb">
          <a href="#/">Beranda</a><span>›</span><a href="#/layanan">Layanan</a><span>›</span><span>Pengajuan Surat</span>
        </nav>

        <div class="surat-eyebrow"><span>✦</span> LAYANAN WARGA</div>
        <h1>Pengajuan Surat Online</h1>
        <p class="hero-lead">Ajukan berbagai jenis surat dengan alur yang mudah, cepat, dan jelas. Pilih suratnya, isi data, unduh berkas, lalu bawa ke RT/RW untuk pengesahan.</p>

        <div class="hero-note">
          <span class="note-icon">i</span>
          <p><strong>Yang perlu diketahui:</strong> situs ini membantu menyiapkan surat sesuai data yang Anda isi. Tanda tangan dan pengesahan tetap dilakukan oleh Ketua RT dan Ketua RW.</p>
        </div>
      </div>

      <div class="hero-art" aria-hidden="true">
        <div class="hero-blob blob-a"></div>
        <div class="hero-blob blob-b"></div>
        <div class="hero-leaf leaf-a"></div>
        <div class="hero-leaf leaf-b"></div>
        <div class="paper-card">
          <div class="paper-top"></div>
          <strong>SURAT KETERANGAN</strong>
          <i></i><i></i><i></i><i class="pendek"></i>
          <div class="paper-stamp">RW<br/>02</div>
          <div class="paper-sign">✓</div>
        </div>
        <div class="hero-handwriting">Pelayanan<br/>lebih mudah<br/>untuk warga<br/>Sukatani</div>
      </div>
    </div>
  </section>

  <main class="surat-shell surat-main">
    <section class="jenis-area" aria-labelledby="judul-jenis">
      <div class="jenis-utama">
        <div class="section-head">
          <div>
            <span class="section-kicker">PILIH LAYANAN</span>
            <h2 id="judul-jenis">Pilih jenis surat yang ingin diajukan</h2>
            <p>Klik salah satu jenis surat untuk mulai. Syarat utama langsung terlihat di setiap layanan.</p>
          </div>

          <label class="surat-search">
            <span>⌕</span>
            <input bind:value={cari} type="search" placeholder="Cari jenis surat..." aria-label="Cari jenis surat" />
          </label>
        </div>

        {#if hasil.length}
          <div class="surat-grid">
            {#each hasil as s, i}
              <article class="surat-card">
                <div class="surat-card-icon {warna[(s.indeks ?? i) % warna.length]}">{ikon[(s.indeks ?? i) % ikon.length]}</div>
                <h3>{s.nama}</h3>
                {#if s.daftarSyarat.length}
                  <p class="surat-syarat">Syarat: {s.daftarSyarat.slice(0, 3).join(", ").toLowerCase()}{s.daftarSyarat.length > 3 ? "…" : "."}</p>
                {:else}
                  <p class="surat-syarat">Syarat akan ditampilkan saat Anda membuka formulir pengajuan.</p>
                {/if}
                <a class="surat-action" href="#/surat/{s.id}">Ajukan surat <span>→</span></a>
              </article>
            {/each}
          </div>
        {:else}
          <div class="surat-empty">
            <strong>Jenis surat tidak ditemukan</strong>
            <p>Coba gunakan kata kunci lain.</p>
            <button onclick={() => { cari = ""; }}>Reset pencarian</button>
          </div>
        {/if}
      </div>

      <aside class="surat-sidebar" aria-label="Informasi pengajuan surat">
        <section class="side-card">
          <div class="side-title"><span class="side-icon hijau">▤</span><h3>Syarat umum</h3></div>
          <ul class="check-list">
            <li><span>✓</span>Fotokopi KTP pemohon</li>
            <li><span>✓</span>Fotokopi Kartu Keluarga</li>
            <li><span>✓</span>Mengisi data dengan benar</li>
            <li><span>✓</span>Menyiapkan dokumen sesuai jenis surat</li>
          </ul>
        </section>

        <section class="side-card">
          <div class="side-title"><span class="side-icon oranye">◷</span><h3>Sebelum mengajukan</h3></div>
          <p>Pastikan nama, NIK, alamat, dan keperluan sudah sesuai dokumen asli. Data yang benar membuat proses lebih cepat.</p>
          <a href="#/kontak">Lihat kontak pengurus →</a>
        </section>

        <section class="side-card">
          <div class="side-title"><span class="side-icon biru">?</span><h3>Masih bingung?</h3></div>
          <p>Kalau belum tahu harus memilih surat yang mana, hubungi pengurus terlebih dahulu agar tidak salah pengajuan.</p>
          <a class="side-cta" href="#/kontak">Hubungi pengurus</a>
        </section>
      </aside>
    </section>

    <section class="alur-faq-grid">
      <section class="alur-card">
        <div class="section-head compact">
          <div>
            <span class="section-kicker">ALUR PENGURUSAN</span>
            <h2>Empat langkah sampai berkas siap dibawa</h2>
          </div>
        </div>

        <div class="flow-grid">
          <article>
            <span class="flow-icon">▤</span><b>1</b>
            <h3>Pilih jenis surat</h3>
            <p>Pilih surat yang dibutuhkan dan buka formulirnya.</p>
          </article>
          <i>→</i>
          <article>
            <span class="flow-icon">✎</span><b>2</b>
            <h3>Isi data warga</h3>
            <p>Lengkapi data diri, keperluan, dan keterangan yang diminta.</p>
          </article>
          <i>→</i>
          <article>
            <span class="flow-icon">⇩</span><b>3</b>
            <h3>Unduh PDF</h3>
            <p>Simpan berkas dan nomor antrean setelah pengajuan berhasil.</p>
          </article>
          <i>→</i>
          <article>
            <span class="flow-icon">♙</span><b>4</b>
            <h3>Bawa ke RT/RW</h3>
            <p>Bawa surat dan syarat pendukung untuk tanda tangan serta pengesahan.</p>
          </article>
        </div>
      </section>

      <section class="faq-card">
        <span class="section-kicker">PERTANYAAN UMUM</span>
        <h2>Hal yang sering ditanyakan</h2>
        <details>
          <summary>Apakah surat langsung sah setelah diajukan online?</summary>
          <p>Belum. Pengajuan online membantu menyiapkan berkas. Surat tetap perlu tanda tangan dan pengesahan sesuai prosedur RT/RW.</p>
        </details>
        <details>
          <summary>Apa yang perlu dibawa saat pengesahan?</summary>
          <p>Bawa berkas yang sudah diunduh beserta dokumen pendukung sesuai jenis surat. Pengurus RT/RW akan memeriksa kelengkapannya.</p>
        </details>
        <details>
          <summary>Bagaimana jika saya salah mengisi data?</summary>
          <p>Periksa kembali sebelum mengirim. Jika sudah terlanjur, hubungi pengurus agar mendapatkan arahan perbaikan.</p>
        </details>
        <a class="faq-help" href="#/kontak">Masih ada pertanyaan? Hubungi pengurus →</a>
      </section>
    </section>
  </main>
</div>

<style>
  .surat-page{--sg:#0b6b57;--sg2:#118268;--sink:#10241e;--muted:#667871;--line:#dfe8e4;--soft:#f3f8f5;--cream:#fff8e8;width:100vw;margin-left:calc(50% - 50vw);margin-top:-32px;margin-bottom:-64px;background:#fbfcfb;color:var(--sink);font-family:"Plus Jakarta Sans",system-ui,sans-serif;overflow:hidden}
  .surat-shell{width:min(1180px,calc(100% - 40px));margin-inline:auto}
  .surat-hero{position:relative;min-height:350px;padding:32px 0 34px;background:radial-gradient(circle at 15% 15%,rgba(255,239,192,.48),transparent 28%),linear-gradient(110deg,#f7fbf8 0%,#f8fcfa 58%,#edf8f2 100%);border-bottom:1px solid #e4ece8;overflow:hidden}
  .surat-hero::after{content:"";position:absolute;inset:auto -8% -170px auto;width:430px;height:430px;border-radius:50%;background:rgba(188,229,209,.2)}
  .hero-grid{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(360px,.85fr);gap:52px;align-items:center}
  .surat-breadcrumb{display:flex;align-items:center;gap:9px;margin-bottom:26px;color:#74857f;font-size:14px}.surat-breadcrumb a{color:inherit;text-decoration:none}.surat-breadcrumb a:hover{color:var(--sg)}
  .surat-eyebrow{display:flex;align-items:center;gap:8px;color:var(--sg);font-size:14px;font-weight:850;letter-spacing:.11em}.surat-eyebrow span{color:#c99618}
  .hero-copy h1{max-width:720px;margin:10px 0 13px;font-size:clamp(42px,5vw,64px);line-height:.98;letter-spacing:-.052em;font-weight:850}
  .hero-lead{max-width:760px;margin:0;color:#586d65;font-size:18px;line-height:1.62}
  .hero-note{max-width:780px;display:grid;grid-template-columns:34px 1fr;gap:12px;align-items:start;margin-top:24px;padding:16px 18px;border:1px solid #cfe8dc;border-radius:14px;background:rgba(227,247,237,.88)}.hero-note p{margin:0;color:#31564a;font-size:14.5px;line-height:1.55}.note-icon{width:30px;height:30px;display:grid;place-items:center;border-radius:50%;background:var(--sg);color:#fff;font-weight:900;font-family:Georgia,serif}
  .hero-art{position:relative;height:285px}.hero-blob{position:absolute;border-radius:42% 58% 53% 47% / 48% 45% 55% 52%}.blob-a{width:250px;height:205px;right:86px;top:38px;background:#c9f0d9;transform:rotate(10deg)}.blob-b{width:190px;height:145px;right:12px;bottom:16px;background:#aee1c2;transform:rotate(-12deg)}
  .hero-leaf{position:absolute;width:54px;height:105px;border-radius:100% 0 100% 0;background:#71b78d;opacity:.82}.leaf-a{right:78px;bottom:20px;transform:rotate(20deg)}.leaf-b{right:245px;bottom:6px;transform:rotate(-35deg)}
  .paper-card{position:absolute;z-index:3;right:130px;top:18px;width:190px;height:240px;padding:28px 24px;border-radius:12px;background:#fff;box-shadow:0 28px 60px -35px rgba(22,76,57,.48);transform:rotate(8deg)}.paper-top{width:56px;height:10px;margin-bottom:24px;background:#eef2f0}.paper-card strong{display:block;margin-bottom:19px;color:#547069;font-size:10px;text-align:center;letter-spacing:.06em}.paper-card i{display:block;width:100%;height:7px;margin-top:9px;border-radius:99px;background:#e6ece9}.paper-card i.pendek{width:58%}.paper-stamp{position:absolute;right:20px;bottom:28px;width:56px;height:56px;display:grid;place-items:center;border:3px double #80aee8;border-radius:50%;color:#7294c8;font-size:12px;font-weight:900;text-align:center;line-height:1}.paper-sign{position:absolute;left:38px;bottom:32px;color:#1e5873;font-family:cursive;font-size:28px;transform:rotate(-15deg)}
  .hero-handwriting{position:absolute;right:-8px;top:42px;z-index:4;color:#185f50;font-family:"Segoe Print","Comic Sans MS",cursive;font-size:22px;line-height:1.18;transform:rotate(-4deg)}

  .surat-main{padding:34px 0 76px}.jenis-area{display:grid;grid-template-columns:minmax(0,1fr) 310px;gap:22px;align-items:start}.jenis-utama{min-width:0}
  .section-head{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:16px}.section-head>div{min-width:0}.section-kicker{display:block;color:var(--sg);font-size:12px;font-weight:900;letter-spacing:.11em}.section-head h2,.faq-card h2{margin:5px 0 5px;font-size:30px;line-height:1.12;letter-spacing:-.035em}.section-head p{margin:0;color:#71807a;font-size:14px;line-height:1.55}
  .surat-search{width:min(360px,40%);min-height:48px;display:grid;grid-template-columns:28px 1fr;align-items:center;padding:0 13px;border:1px solid #d5e0db;border-radius:13px;background:#fff;box-shadow:0 10px 30px -28px rgba(20,69,53,.55)}.surat-search span{color:#74847e;font-size:20px}.surat-search input{min-width:0;width:100%;border:0!important;outline:0!important;background:transparent!important;box-shadow:none!important;color:#23352e;font:inherit;font-size:14px}
  .surat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.surat-card{min-width:0;display:flex;flex-direction:column;padding:19px;border:1px solid var(--line);border-radius:16px;background:#fff;box-shadow:0 12px 30px -29px rgba(24,70,55,.5);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.surat-card:hover{transform:translateY(-3px);border-color:#b8d6ca;box-shadow:0 20px 42px -32px rgba(18,77,59,.58)}
  .surat-card-icon,.side-icon{width:48px;height:48px;display:grid;place-items:center;border-radius:14px;font-size:23px;font-weight:850}.surat-card-icon.hijau,.side-icon.hijau{background:#e4f6ee;color:#08725b}.surat-card-icon.oranye,.side-icon.oranye{background:#fff1d8;color:#bd7412}.surat-card-icon.biru,.side-icon.biru{background:#e5f0ff;color:#2f69bd}.surat-card-icon.merah,.side-icon.merah{background:#ffe5e7;color:#b94a55}
  .surat-card h3{margin:14px 0 8px;font-size:17px;line-height:1.28;letter-spacing:-.015em}.surat-syarat{flex:1;margin:11px 0 16px;color:#667872;font-size:13px;line-height:1.55}.surat-action{min-height:40px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;border:1px solid #a9d7c5;border-radius:10px;background:#f9fdfb;color:#08644f;font-size:13px;font-weight:850;text-decoration:none}.surat-action:hover{background:#eaf7f1}.surat-action span{font-size:18px}
  .surat-empty{padding:36px;border:1px dashed #cddbd5;border-radius:16px;background:#fff;text-align:center}.surat-empty strong{font-size:18px}.surat-empty p{color:#6e7d77}.surat-empty button{min-height:40px;padding:0 15px;border:0;border-radius:9px;background:var(--sg);color:#fff;font:inherit;font-weight:800;cursor:pointer}

  .surat-sidebar{display:grid;gap:12px;position:sticky;top:92px}.side-card{padding:19px;border:1px solid var(--line);border-radius:16px;background:#fff;box-shadow:0 12px 30px -30px rgba(20,64,51,.45)}.side-title{display:flex;align-items:center;gap:11px}.side-title .side-icon{width:42px;height:42px;border-radius:12px;font-size:19px}.side-title h3{margin:0;font-size:18px;letter-spacing:-.02em}.check-list{display:grid;gap:10px;margin:16px 0 0;padding:0;list-style:none}.check-list li{display:grid;grid-template-columns:22px 1fr;gap:7px;color:#53665f;font-size:13.5px;line-height:1.4}.check-list li span{width:20px;height:20px;display:grid;place-items:center;border-radius:50%;background:#e5f5ed;color:#08715a;font-size:11px;font-weight:900}.side-card>p{margin:13px 0 0;color:#60726b;font-size:13.5px;line-height:1.55}.side-card>a:not(.side-cta){display:inline-flex;margin-top:13px;color:var(--sg);font-size:12.5px;font-weight:800;text-decoration:none}.side-cta{min-height:40px;display:flex;align-items:center;justify-content:center;margin-top:15px;border-radius:10px;background:var(--sg);color:#fff;font-size:13px;font-weight:850;text-decoration:none}

  .alur-faq-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(300px,.65fr);gap:16px;margin-top:20px}.alur-card,.faq-card{padding:23px;border:1px solid var(--line);border-radius:18px;background:#fff}.section-head.compact{margin-bottom:20px}.section-head.compact h2{font-size:26px}
  .flow-grid{display:grid;grid-template-columns:1fr 28px 1fr 28px 1fr 28px 1fr;align-items:start;gap:5px}.flow-grid>i{align-self:center;color:#a6b8b0;font-style:normal;font-size:24px;text-align:center}.flow-grid article{text-align:center}.flow-icon{width:58px;height:58px;display:grid;place-items:center;margin:0 auto 9px;border:1px solid #cbe4d9;border-radius:50%;background:#eef9f4;color:#08715a;font-size:25px;box-shadow:0 0 0 5px #f8fcfa}.flow-grid article b{width:24px;height:24px;display:grid;place-items:center;margin:-17px auto 9px;border-radius:50%;background:#fff;border:1px solid #cfe2da;color:#0b6b57;font-size:11px;position:relative;z-index:2}.flow-grid h3{margin:0;font-size:15px}.flow-grid p{margin:6px 0 0;color:#70817a;font-size:12.5px;line-height:1.5}
  .faq-card h2{font-size:24px;margin-bottom:15px}.faq-card details{border-top:1px solid #e6ece9}.faq-card summary{padding:13px 2px;cursor:pointer;color:#31463e;font-size:13.5px;font-weight:750}.faq-card details p{margin:-3px 0 13px;color:#6c7c76;font-size:12.5px;line-height:1.55}.faq-help{display:flex;margin-top:12px;padding:12px;border-radius:10px;background:#eaf7f1;color:#0a654f;font-size:12.5px;font-weight:800;text-decoration:none}

  @media(max-width:1100px){.surat-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.jenis-area{grid-template-columns:minmax(0,1fr) 280px}.hero-grid{grid-template-columns:1fr 330px;gap:30px}.hero-handwriting{display:none}.paper-card{right:65px}}
  @media(max-width:860px){.surat-page{margin-top:-24px}.surat-shell{width:min(100% - 28px,1180px)}.surat-hero{padding-top:26px}.hero-grid{grid-template-columns:1fr}.hero-art{height:210px}.paper-card{left:50%;right:auto;top:0;width:160px;height:200px;transform:translateX(-50%) rotate(6deg);padding:22px 20px}.blob-a{left:50%;right:auto;transform:translateX(-50%) rotate(8deg);top:12px;width:230px;height:180px}.blob-b{left:55%;right:auto}.hero-copy h1{font-size:46px}.hero-lead{font-size:16px}.jenis-area{grid-template-columns:1fr}.surat-sidebar{position:static;grid-template-columns:repeat(3,1fr)}.surat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.alur-faq-grid{grid-template-columns:1fr}.section-head{align-items:stretch;flex-direction:column}.surat-search{width:100%}}
  @media(max-width:620px){.surat-shell{width:calc(100% - 22px)}.surat-breadcrumb{font-size:12px;margin-bottom:19px}.surat-eyebrow{font-size:11px}.hero-copy h1{font-size:38px}.hero-lead{font-size:14px}.hero-note{grid-template-columns:29px 1fr;padding:13px}.hero-note p{font-size:12.5px}.hero-art{height:180px}.paper-card{width:140px;height:175px;padding:18px}.blob-a{width:200px;height:150px}.surat-main{padding-top:24px}.section-head h2{font-size:25px}.section-head p{font-size:12.5px}.surat-grid{grid-template-columns:1fr}.surat-card{padding:16px}.surat-card h3{font-size:16px}.surat-sidebar{grid-template-columns:1fr}.flow-grid{grid-template-columns:1fr;gap:12px}.flow-grid>i{transform:rotate(90deg)}.alur-card,.faq-card{padding:18px}.flow-grid article{display:grid;grid-template-columns:54px 28px 1fr;text-align:left;align-items:center;column-gap:8px}.flow-icon{width:52px;height:52px;margin:0}.flow-grid article b{margin:0}.flow-grid h3,.flow-grid p{grid-column:3}.flow-grid p{margin-top:3px}.flow-grid>i{font-size:18px;height:12px}}
</style>
