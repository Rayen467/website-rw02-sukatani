<script>
  import { isi } from "../keadaan/isi.svelte.js";

  const jumlahBerita = $derived(Array.isArray(isi.pengumuman) ? isi.pengumuman.filter((x) => x?.tipe !== "agenda").length : null);
  const jumlahAgenda = $derived(Array.isArray(isi.pengumuman) ? isi.pengumuman.filter((x) => x?.tipe === "agenda").length : null);
  const jumlahGaleri = $derived(Array.isArray(isi.galeri) ? isi.galeri.length : null);
  const jumlahVideo = $derived(Array.isArray(isi.berkas) ? isi.berkas.filter((x) => x?.kategori === "video").length : null);
  const jumlahForum = $derived(Array.isArray(isi.forum_topik) ? isi.forum_topik.filter((x) => x?.status !== "dihapus").length : null);

  const modul = $derived([
    {
      nomor: "01",
      kelas: "berita",
      ikon: "▤",
      judul: "Berita & Pengumuman",
      teks: "Kabar resmi RW, jadwal rapat, posyandu, gotong royong, bantuan sosial, dan pemberitahuan penting warga.",
      meta: jumlahBerita === null ? "Memuat publikasi…" : `${jumlahBerita} publikasi tersedia`,
      href: "#/berita",
      aksi: "Buka berita"
    },
    {
      nomor: "02",
      kelas: "kalender",
      ikon: "▦",
      judul: "Kalender Kegiatan",
      teks: "Jadwal rutin dan acara mendatang disusun berdasarkan tanggal kegiatan agar warga mudah melihat kapan acara berlangsung.",
      meta: jumlahAgenda === null ? "Memuat agenda…" : `${jumlahAgenda} agenda dari publikasi`,
      href: "#/kalender",
      aksi: "Lihat kalender"
    },
    {
      nomor: "03",
      kelas: "galeri",
      ikon: "▣",
      judul: "Galeri Foto & Video",
      teks: "Dokumentasi kegiatan, pembangunan lingkungan, acara warga, album foto, dan video tersimpan di satu galeri khusus.",
      meta: jumlahGaleri === null || jumlahVideo === null ? "Memuat dokumentasi…" : `${jumlahGaleri} album · ${jumlahVideo} video`,
      href: "#/galeri",
      aksi: "Buka galeri"
    },
    {
      nomor: "04",
      kelas: "forum",
      ikon: "◌",
      judul: "Forum / Polling Online",
      teks: "Ruang partisipasi warga untuk musyawarah, survei, polling keputusan, pertanyaan, dan pembahasan yang memang dibuka untuk warga.",
      meta: jumlahForum === null ? "Memuat diskusi…" : `${jumlahForum} topik forum`,
      href: "#/forum",
      aksi: "Ikut berpartisipasi"
    }
  ]);
</script>

<div class="info-page">
  <section class="info-hero">
    <div class="info-shell info-hero-grid">
      <div class="info-copy">
        <nav class="info-breadcrumb" aria-label="Breadcrumb"><a href="#/">Beranda</a><span>›</span><span>Informasi &amp; Komunikasi</span></nav>
        <p class="eyebrow">C. INFORMASI &amp; KOMUNIKASI</p>
        <h1>Satu pintu informasi.<br /><em>Empat fungsi yang jelas.</em></h1>
        <p class="lead">Berita tidak lagi bercampur dengan video, kalender, atau forum. Pilih kebutuhan Anda, lalu masuk ke halaman yang memang dibuat khusus untuk fungsi tersebut.</p>
      </div>
      <aside class="info-prinsip" aria-label="Prinsip penyajian informasi">
        <span class="info-prinsip-icon">i</span>
        <div><strong>Mudah dipahami warga</strong><p>Satu jenis informasi mempunyai satu tempat utama. Tidak ada konten yang ditampilkan ganda tanpa alasan.</p></div>
      </aside>
    </div>
  </section>

  <main class="info-shell info-main">
    <header class="info-section-head">
      <div><span>PILIH INFORMASI</span><h2>Apa yang ingin Anda lihat?</h2></div>
      <p>Empat bagian ini mengikuti fungsi layanan informasi RW 02, bukan istilah teknis pengelola website.</p>
    </header>

    <section class="info-grid" aria-label="Bagian Informasi dan Komunikasi">
      {#each modul as item}
        <a class={`info-card ${item.kelas}`} href={item.href}>
          <div class="info-card-top"><span class="nomor">{item.nomor}</span><span class="ikon" aria-hidden="true">{item.ikon}</span></div>
          <div class="info-card-copy"><h2>{item.judul}</h2><p>{item.teks}</p></div>
          <div class="info-card-foot"><small>{item.meta}</small><strong>{item.aksi} <span>→</span></strong></div>
        </a>
      {/each}
    </section>

    <section class="alur-info">
      <div class="alur-copy"><span>BIAR TIDAK SIMPANG SIUR</span><h2>Bedanya apa?</h2><p>Gunakan patokan sederhana ini saat membaca maupun saat Petugas mengelola isi website.</p></div>
      <div class="alur-list">
        <article><b>Berita & Pengumuman</b><span>Informasi yang dibaca sebagai kabar atau pemberitahuan.</span></article>
        <article><b>Kalender</b><span>Informasi yang utamanya menjawab <em>kapan</em> sebuah kegiatan berlangsung.</span></article>
        <article><b>Galeri</b><span>Dokumentasi visual setelah atau selama kegiatan berlangsung.</span></article>
        <article><b>Forum / Polling</b><span>Informasi dua arah yang membutuhkan tanggapan atau suara warga.</span></article>
      </div>
    </section>
  </main>
</div>

<style>
  .info-page{--ink:#102f35;--muted:#60736e;--green:#087458;--line:#dbe8e1;width:100vw;margin-left:calc(50% - 50vw);margin-top:-32px;margin-bottom:-64px;background:#f7faf8;color:var(--ink);min-height:100vh}.info-shell{width:min(1180px,calc(100% - 40px));margin-inline:auto}.info-hero{position:relative;overflow:hidden;background:radial-gradient(circle at 82% 16%,rgba(64,178,132,.2),transparent 27%),linear-gradient(135deg,#073f36 0%,#0a5d4b 52%,#123e39 100%);color:#fff}.info-hero:after{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:42px 42px;mask-image:linear-gradient(90deg,transparent,#000)}.info-hero-grid{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:70px;align-items:end;padding:76px 0 70px}.info-breadcrumb{display:flex;gap:8px;align-items:center;margin:0 0 46px;font-size:12px;color:rgba(255,255,255,.68)}.info-breadcrumb a{color:#fff;text-decoration:none}.eyebrow{margin:0 0 13px;color:#9ae2c9;font-size:11px;font-weight:900;letter-spacing:.14em}.info-copy h1{margin:0;font:700 clamp(38px,5.4vw,70px)/1.02 Georgia,serif;letter-spacing:-.045em}.info-copy h1 em{font-weight:400;color:#b6e8d5}.lead{max-width:720px;margin:20px 0 0;color:rgba(255,255,255,.78);font-size:15px;line-height:1.8}.info-prinsip{display:flex;gap:16px;padding:20px;border:1px solid rgba(255,255,255,.18);border-radius:18px;background:rgba(255,255,255,.08);backdrop-filter:blur(12px)}.info-prinsip-icon{flex:0 0 38px;height:38px;display:grid;place-items:center;border-radius:50%;background:#d8f5e9;color:#08614d;font:800 18px Georgia,serif}.info-prinsip strong{font-size:13px}.info-prinsip p{margin:6px 0 0;color:rgba(255,255,255,.72);font-size:12px;line-height:1.6}.info-main{padding:56px 0 78px}.info-section-head{display:flex;justify-content:space-between;gap:32px;align-items:end;margin-bottom:24px}.info-section-head span,.alur-copy>span{display:block;color:#16836a;font-size:10px;font-weight:900;letter-spacing:.14em}.info-section-head h2,.alur-copy h2{margin:6px 0 0;font:700 31px/1.1 Georgia,serif}.info-section-head>p{max-width:480px;margin:0;color:var(--muted);font-size:13px;line-height:1.65}.info-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.info-card{position:relative;min-height:288px;display:flex;flex-direction:column;padding:27px;border:1px solid var(--line);border-radius:22px;background:#fff;color:inherit;text-decoration:none;box-shadow:0 12px 34px rgba(28,72,58,.055);overflow:hidden;transition:.22s ease}.info-card:before{content:"";position:absolute;right:-58px;top:-58px;width:180px;height:180px;border-radius:50%;background:var(--tint,#e8f5ef);opacity:.9}.info-card:hover{transform:translateY(-4px);border-color:#b8d9cb;box-shadow:0 18px 44px rgba(28,72,58,.1)}.info-card.berita{--tint:#e4f5ef}.info-card.kalender{--tint:#e8f1fb}.info-card.galeri{--tint:#f4eadf}.info-card.forum{--tint:#efe9f7}.info-card-top{position:relative;display:flex;justify-content:space-between;align-items:start}.nomor{color:#92a59e;font:700 11px/1 monospace;letter-spacing:.08em}.ikon{width:56px;height:56px;display:grid;place-items:center;border-radius:17px;background:#f3f8f5;color:#0b765c;font-size:25px}.info-card-copy{position:relative;margin-top:32px}.info-card h2{margin:0 0 10px;font:700 24px/1.15 Georgia,serif}.info-card p{margin:0;color:var(--muted);font-size:13px;line-height:1.75;max-width:500px}.info-card-foot{position:relative;margin-top:auto;padding-top:24px;display:flex;align-items:end;justify-content:space-between;gap:18px;border-top:1px solid #edf2ef}.info-card-foot small{color:#83938e;font-size:10px}.info-card-foot strong{color:#0b735a;font-size:12px}.info-card-foot strong span{font-size:17px;margin-left:4px}.alur-info{margin-top:56px;padding:34px;border-radius:24px;background:#102f35;color:#fff;display:grid;grid-template-columns:310px 1fr;gap:50px}.alur-copy>span{color:#8fdbc2}.alur-copy h2{font-size:30px}.alur-copy p{color:#b9cbc6;font-size:13px;line-height:1.7}.alur-list{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.12);border-radius:16px;overflow:hidden}.alur-list article{padding:20px;background:#163b40}.alur-list b{display:block;color:#d8f5e9;font-size:12px;margin-bottom:7px}.alur-list span{color:#b8c9c5;font-size:11px;line-height:1.6}.alur-list em{color:#fff}
  @media(max-width:820px){.info-hero-grid{grid-template-columns:1fr;gap:28px;padding:50px 0}.info-breadcrumb{margin-bottom:30px}.info-prinsip{max-width:560px}.info-section-head{align-items:start;flex-direction:column}.info-grid{grid-template-columns:1fr}.alur-info{grid-template-columns:1fr;gap:24px}.alur-list{grid-template-columns:1fr 1fr}}
  @media(max-width:560px){.info-page{margin-top:-18px}.info-shell{width:min(100% - 26px,1180px)}.info-copy h1{font-size:40px}.lead{font-size:13px}.info-main{padding-top:36px}.info-card{min-height:255px;padding:22px}.alur-info{padding:24px 18px}.alur-list{grid-template-columns:1fr}}
</style>