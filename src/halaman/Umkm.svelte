<script>
  import { isi } from "../keadaan/isi.svelte.js";
  import { JENIS_USAHA } from "../inti/bawaan.js";

  let cari = $state("");
  let saring = $state("all");
  let urut = $state("nama");

  const fallback = [
    { id: "demo-katering", nama: "Katering Harian Warga", kat: "siapsaji", katLabel: "Makanan siap saji", ringkas: "Menu rumahan untuk keluarga, rapat, dan acara lingkungan.", panjang: "Nasi box\nKatering harian\nPesanan acara", alamat: "RW 02 Sukatani", jam: "06.00 – 20.00", wa: "", sampul: "./foto/usaha-katering-harian.jpg", contoh: true },
    { id: "demo-sembako", nama: "Warung Sembako Warga", kat: "retail", katLabel: "Retail", ringkas: "Kebutuhan harian warga dengan pilihan produk rumah tangga.", panjang: "Sembako\nKebutuhan rumah tangga\nBelanja harian", alamat: "RW 02 Sukatani", jam: "06.00 – 21.00", wa: "", sampul: "./foto/usaha-warung-sembako.jpg", contoh: true },
    { id: "demo-laundry", nama: "Laundry Kiloan Warga", kat: "jasa", katLabel: "Jasa", ringkas: "Cuci kiloan dan layanan setrika praktis untuk keluarga sekitar.", panjang: "Cuci kiloan\nSetrika\nLayanan harian", alamat: "RW 02 Sukatani", jam: "08.00 – 20.00", wa: "", sampul: "./foto/usaha-laundry-kiloan.jpg", contoh: true },
    { id: "demo-jahit", nama: "Jahit & Permak Warga", kat: "jasa", katLabel: "Jasa", ringkas: "Jasa jahit, permak pakaian, dan penyesuaian ukuran.", panjang: "Permak pakaian\nJahit sederhana\nPenyesuaian ukuran", alamat: "RW 02 Sukatani", jam: "08.00 – 18.00", wa: "", sampul: "./foto/usaha-jahit-permak.jpg", contoh: true },
    { id: "demo-kue", nama: "Kue Basah Warga", kat: "siapsaji", katLabel: "Makanan siap saji", ringkas: "Aneka kue basah rumahan untuk keluarga dan acara.", panjang: "Kue basah\nSnack box\nPesanan acara", alamat: "RW 02 Sukatani", jam: "06.00 – 17.00", wa: "", sampul: "./foto/usaha-kue-basah.jpg", contoh: true },
    { id: "demo-keripik", nama: "Keripik & Sambal Rumahan", kat: "kemasan", katLabel: "Makanan kemasan", ringkas: "Camilan dan sambal rumahan dalam kemasan praktis.", panjang: "Keripik\nSambal botol\nPaket camilan", alamat: "RW 02 Sukatani", jam: "08.00 – 19.00", wa: "", sampul: "./foto/usaha-keripik-sambal.jpg", contoh: true }
  ];

  const dataAsli = $derived(Array.isArray(isi.usaha) ? isi.usaha : []);
  const semua = $derived(dataAsli.length ? dataAsli : fallback);
  const kategori = $derived([{ nilai: "all", label: "Semua usaha" }, ...JENIS_USAHA]);

  const daftar = $derived.by(() => {
    const q = cari.trim().toLowerCase();
    const hasil = semua.filter((u) => {
      const cocokKat = saring === "all" || u.kat === saring;
      const cocokCari = !q || [u.nama, u.katLabel, u.ringkas, u.panjang, u.alamat]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(q));
      return cocokKat && cocokCari;
    });
    return [...hasil].sort((a, b) => {
      if (urut === "kategori") return String(a.katLabel || a.kat || "").localeCompare(String(b.katLabel || b.kat || ""), "id");
      if (urut === "terbaru") return String(b.diperbarui || b.dibuat || b.id || "").localeCompare(String(a.diperbarui || a.dibuat || a.id || ""));
      return String(a.nama || "").localeCompare(String(b.nama || ""), "id");
    });
  });

  const jumlahKategori = $derived(new Set(semua.map((u) => u.kat || u.katLabel).filter(Boolean)).size);
  const unggulan = $derived(semua.slice(0, 3));

  function foto(u, i = 0) {
    const cadangan = ["./foto/usaha-katering-harian.jpg", "./foto/usaha-warung-sembako.jpg", "./foto/usaha-laundry-kiloan.jpg", "./foto/usaha-jahit-permak.jpg", "./foto/usaha-kue-basah.jpg", "./foto/usaha-keripik-sambal.jpg"];
    return u?.sampul || u?.foto || cadangan[i % cadangan.length];
  }

  function hrefUsaha(u) {
    return u?.contoh || !u?.id ? "#/daftar-usaha" : "#/umkm/" + u.id;
  }

  function hrefWa(u) {
    if (!u?.wa) return "";
    const n = String(u.wa).replace(/[^0-9]/g, "").replace(/^0/, "62");
    return n ? "https://wa.me/" + n : "";
  }

  function produk(u) {
    return String(u?.panjang || u?.produk || "").split(/\n|,|•/).map((x) => x.trim()).filter(Boolean).slice(0, 3);
  }

  function ikonKategori(nilai) {
    if (nilai === "siapsaji") return "🍜";
    if (nilai === "kemasan") return "🥡";
    if (nilai === "jasa") return "🧰";
    if (nilai === "retail") return "🛍";
    return "⌂";
  }

  function jumlahDalamKategori(nilai) {
    if (nilai === "all") return semua.length;
    return semua.filter((u) => u.kat === nilai).length;
  }

  function pilihKategori(nilai) {
    saring = nilai;
    document.getElementById("direktori-umkm")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
</script>

<div class="marketplace-umkm">
  <section class="market-hero">
    <div class="market-shell market-hero-grid">
      <div class="market-hero-copy">
        <span class="market-overline">DIREKTORI UMKM RW 02 SUKATANI</span>
        <h1>Belanja dekat rumah.<br /><em>Dukung usaha tetangga.</em></h1>
        <p>Temukan makanan, kebutuhan harian, dan jasa warga RW 02 dalam satu direktori yang cepat, rapi, dan mudah dihubungi.</p>

        <label class="market-search-hero">
          <span aria-hidden="true">⌕</span>
          <input bind:value={cari} placeholder="Cari katering, laundry, sembako, jasa..." aria-label="Cari UMKM warga" />
          <a href="#direktori-umkm">Cari</a>
        </label>

        <div class="market-hero-actions">
          <a class="market-primary" href="#direktori-umkm">Jelajahi UMKM</a>
          <a class="market-secondary" href="#/daftar-usaha">+ Daftarkan usaha</a>
        </div>

        <div class="market-trust">
          <span><b>{dataAsli.length || semua.length}</b><small>{dataAsli.length ? "UMKM warga aktif" : "contoh usaha"}</small></span>
          <span><b>{jumlahKategori}</b><small>kategori usaha</small></span>
          <span><b>RW 02</b><small>fokus usaha lokal</small></span>
        </div>
      </div>

      <div class="market-hero-media" aria-label="Contoh usaha warga">
        {#each unggulan as u, i}
          <a class:utama={i === 0} class="market-hero-card" href={hrefUsaha(u)}>
            <img src={foto(u, i)} alt={u.nama || "Usaha warga"} decoding="async" />
            <span></span>
            <div><small>{u.katLabel || "Usaha warga"}</small><strong>{u.nama}</strong></div>
          </a>
        {/each}
      </div>
    </div>
  </section>

  <main class="market-shell market-main">
    {#if !dataAsli.length}
      <div class="market-demo-note"><span>i</span><p><strong>Mode contoh.</strong> Kartu usaha di halaman ini adalah simulasi tampilan direktori dan akan otomatis diganti oleh data UMKM warga yang sudah disetujui Petugas.</p></div>
    {/if}

    <section class="market-category-section" aria-labelledby="judul-kategori-umkm">
      <div class="market-section-heading compact">
        <div><span>Pilih kebutuhan</span><h2 id="judul-kategori-umkm">Mau cari apa hari ini?</h2></div>
        <a href="#/daftar-usaha">Punya usaha? Daftar →</a>
      </div>

      <div class="market-category-rail">
        {#each kategori as k}
          <button type="button" class:aktif={saring === k.nilai} onclick={() => pilihKategori(k.nilai)}>
            <span class="market-category-icon">{ikonKategori(k.nilai)}</span>
            <span class="market-category-copy"><strong>{k.label}</strong><small>{jumlahDalamKategori(k.nilai)} usaha</small></span>
            <span class="market-category-arrow">›</span>
          </button>
        {/each}
      </div>
    </section>

    <section class="market-directory" id="direktori-umkm">
      <div class="market-directory-toolbar">
        <div class="market-section-heading">
          <span>Direktori warga</span>
          <h2>{saring === "all" ? "Semua UMKM" : kategori.find((k) => k.nilai === saring)?.label || "UMKM"}</h2>
          <p>{daftar.length} usaha ditemukan{cari ? ` untuk “${cari}”` : ""}.</p>
        </div>

        <div class="market-tools">
          <label class="market-search-inline"><span>⌕</span><input bind:value={cari} placeholder="Cari usaha atau produk" aria-label="Cari usaha atau produk" /></label>
          <label class="market-sort"><span>Urutkan</span><select bind:value={urut}><option value="nama">Nama A–Z</option><option value="kategori">Kategori</option><option value="terbaru">Terbaru</option></select></label>
        </div>
      </div>

      <div class="market-filter-pills" aria-label="Filter kategori UMKM">
        {#each kategori as k}<button type="button" class:aktif={saring === k.nilai} onclick={() => (saring = k.nilai)}>{k.label}</button>{/each}
      </div>

      {#if daftar.length}
        <div class="market-grid">
          {#each daftar as u, i}
            <article class="market-card">
              <a class="umkm-card-foto market-card-media" href={hrefUsaha(u)}>
                <img src={foto(u, i)} alt={u.nama || "Usaha warga RW 02"} loading={i > 3 ? "lazy" : "eager"} decoding="async" />
                <div class="market-card-topline"><span class="market-chip">{u.katLabel || "Usaha warga"}</span>{#if u.contoh}<span class="market-chip demo">Contoh</span>{/if}</div>
                <button type="button" aria-label="Simpan usaha" title="Simpan usaha">♡</button>
              </a>

              <div class="market-card-body">
                <div class="market-card-title"><div><h3><a href={hrefUsaha(u)}>{u.nama || "UMKM Warga"}</a></h3><p>{u.ringkas || "Usaha warga RW 02 Sukatani."}</p></div></div>
                {#if produk(u).length}<div class="market-product-tags">{#each produk(u) as p}<span>{p}</span>{/each}</div>{/if}
                <div class="market-meta"><span><i>⌖</i>{u.alamat || "RW 02 Sukatani"}</span><span><i>◷</i>{u.jam || "Jam layanan belum dicantumkan"}</span></div>
                <div class="market-card-actions">
                  <a class="detail" href={hrefUsaha(u)}>Lihat profil</a>
                  {#if hrefWa(u)}<a class="chat" href={hrefWa(u)} target="_blank" rel="noopener noreferrer">Chat WhatsApp</a>{:else if !u.contoh}<a class="chat muted" href={hrefUsaha(u)}>Lihat kontak</a>{:else}<a class="chat muted" href="#/daftar-usaha">Contoh tampilan</a>{/if}
                </div>
              </div>
            </article>
          {/each}
        </div>
      {:else}
        <div class="market-empty"><span>⌕</span><h3>Belum menemukan usaha yang cocok</h3><p>Coba ganti kata kunci atau pilih kategori lain.</p><button type="button" onclick={() => { cari = ""; saring = "all"; }}>Reset pencarian</button></div>
      {/if}
    </section>

    <section class="market-benefits">
      <div class="market-benefit-main"><span class="market-overline dark">KENAPA BELANJA LOKAL?</span><h2>Satu transaksi kecil bisa berputar kembali ke lingkungan sendiri.</h2><p>Direktori ini dibuat untuk mempertemukan kebutuhan warga dengan usaha yang memang berada di sekitar RW 02—tanpa biaya komisi dari website RW.</p><a href="#/daftar-usaha">Daftarkan UMKM Anda →</a></div>
      <div class="market-benefit-list">
        <article><span>01</span><div><strong>Lebih dekat</strong><p>Mudah menemukan usaha sekitar dan menghubungi pemiliknya langsung.</p></div></article>
        <article><span>02</span><div><strong>Lebih transparan</strong><p>Profil usaha, produk, jam layanan, dan kontak disajikan ringkas dalam satu tempat.</p></div></article>
        <article><span>03</span><div><strong>Lebih berdampak</strong><p>Belanja dari tetangga ikut membantu perputaran ekonomi warga.</p></div></article>
      </div>
    </section>

    <section class="market-bottom-grid">
      <article class="market-register-card"><div><span>UNTUK PELAKU USAHA</span><h2>Punya usaha di RW 02?</h2><p>Daftarkan profil usaha agar warga lebih mudah menemukan produk atau layanan Anda.</p><a href="#/daftar-usaha">Daftarkan UMKM gratis</a></div><img src="./foto/usaha-warung-sembako.jpg" alt="Warung usaha warga" decoding="async" /></article>
      <article class="market-map-card"><div class="market-map-grid" aria-hidden="true"></div><div><span>LOKASI USAHA</span><h2>Cari UMKM di sekitar Sukatani</h2><p>Buka peta untuk melihat kawasan RW 02 dan titik layanan yang dicantumkan pemilik usaha.</p><a href="https://www.google.com/maps/search/?api=1&query=Permai+Sukatani+Rajeg" target="_blank" rel="noopener noreferrer">Buka Google Maps ↗</a></div></article>
    </section>
  </main>
</div>

<style>
  .marketplace-umkm{--mk-green:#0b6b57;--mk-green-2:#13866d;--mk-green-soft:#eaf6f1;--mk-ink:#17231f;--mk-muted:#6d7975;--mk-line:#e2e8e5;--mk-bg:#f7f8f7;--mk-card:#fff;width:100vw;margin-left:calc(50% - 50vw);margin-top:-32px;margin-bottom:-64px;background:var(--mk-bg);color:var(--mk-ink);font-family:"Plus Jakarta Sans",system-ui,sans-serif;overflow:hidden}
  .market-shell{width:min(1220px,calc(100% - 40px));margin-inline:auto}
  .market-hero{position:relative;padding:54px 0 42px;background:linear-gradient(135deg,#f2f9f5 0%,#fbfcfb 55%,#edf7f2 100%);border-bottom:1px solid #e4ebe7;overflow:hidden}.market-hero::before{content:"";position:absolute;width:460px;height:460px;border-radius:50%;right:-120px;top:-220px;background:radial-gradient(circle,#d8eee5 0 42%,rgba(216,238,229,0) 72%)}.market-hero::after{content:"";position:absolute;width:340px;height:340px;border-radius:50%;left:-170px;bottom:-240px;background:#e7f4ee}
  .market-hero-grid{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1.02fr) minmax(420px,.98fr);gap:54px;align-items:center}.market-overline{display:inline-flex;align-items:center;gap:8px;color:var(--mk-green);font-size:11px;font-weight:900;letter-spacing:.12em}.market-overline::before{content:"";width:24px;height:2px;background:var(--mk-green);border-radius:99px}.market-overline.dark{color:#8bd3bb}.market-overline.dark::before{background:#8bd3bb}
  .market-hero h1{max-width:760px;margin:12px 0 14px;font-size:clamp(42px,5vw,66px);line-height:.98;letter-spacing:-.055em;color:#12211c;font-weight:850}.market-hero h1 em{font-style:normal;color:var(--mk-green)}.market-hero-copy>p{max-width:650px;margin:0;color:#65736e;font-size:15px;line-height:1.7}
  .market-search-hero{max-width:660px;min-height:58px;display:grid;grid-template-columns:36px minmax(0,1fr) auto;align-items:center;gap:8px;margin-top:24px;padding:7px 8px 7px 14px;border:1px solid #d4e1dc;border-radius:16px;background:#fff;box-shadow:0 18px 40px -32px rgba(28,69,55,.55)}.market-search-hero>span{color:#71827b;font-size:22px}.market-search-hero input{min-width:0;width:100%;border:0!important;outline:0!important;background:transparent!important;box-shadow:none!important;font:inherit;font-size:14px;color:#1a2924}.market-search-hero a{min-height:44px;display:inline-flex;align-items:center;padding:0 20px;border-radius:11px;background:var(--mk-green);color:#fff;font-size:13px;font-weight:800;text-decoration:none}
  .market-hero-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:13px}.market-primary,.market-secondary{min-height:42px;display:inline-flex;align-items:center;padding:0 15px;border-radius:10px;font-size:12px;font-weight:800;text-decoration:none}.market-primary{background:#173e34;color:#fff}.market-secondary{border:1px solid #d3dfda;background:#fff;color:#315148}
  .market-trust{display:flex;flex-wrap:wrap;gap:0;margin-top:24px}.market-trust span{min-width:135px;padding:0 20px;border-left:1px solid #dce6e1}.market-trust span:first-child{padding-left:0;border-left:0}.market-trust b,.market-trust small{display:block}.market-trust b{font-size:19px;letter-spacing:-.03em}.market-trust small{margin-top:2px;color:#74817c;font-size:11px}
  .market-hero-media{position:relative;height:390px;display:grid;grid-template-columns:1.1fr .9fr;grid-template-rows:1fr 1fr;gap:12px}.market-hero-card{position:relative;min-width:0;overflow:hidden;border-radius:22px;background:#dfe9e5;box-shadow:0 22px 60px -42px rgba(19,54,43,.72);color:#fff;text-decoration:none}.market-hero-card.utama{grid-row:1/-1}.market-hero-card img{width:100%;height:100%;object-fit:cover;transition:transform .45s ease}.market-hero-card:hover img{transform:scale(1.035)}.market-hero-card>span{position:absolute;inset:0;background:linear-gradient(180deg,transparent 48%,rgba(10,28,23,.78))}.market-hero-card div{position:absolute;left:16px;right:16px;bottom:15px}.market-hero-card small,.market-hero-card strong{display:block}.market-hero-card small{margin-bottom:3px;color:#d4eee4;font-size:10px;font-weight:750}.market-hero-card strong{font-size:15px;line-height:1.2}
  .market-main{padding:28px 0 72px}.market-demo-note{display:flex;gap:10px;align-items:flex-start;margin-bottom:24px;padding:12px 14px;border:1px solid #d9e6e1;border-radius:12px;background:#fff;color:#5d6f68}.market-demo-note>span{width:24px;height:24px;display:grid;place-items:center;flex:0 0 auto;border-radius:50%;background:#e6f4ee;color:var(--mk-green);font-size:12px;font-weight:900}.market-demo-note p{margin:1px 0 0;font-size:12.5px;line-height:1.55}.market-demo-note strong{color:#24342e}
  .market-category-section{padding:6px 0 31px}.market-section-heading{min-width:0}.market-section-heading.compact{display:flex;justify-content:space-between;align-items:end;gap:20px;margin-bottom:15px}.market-section-heading>span,.market-section-heading>div>span{display:block;color:#718079;font-size:10px;font-weight:850;letter-spacing:.1em;text-transform:uppercase}.market-section-heading h2{margin:4px 0 0;font-size:28px;line-height:1.12;letter-spacing:-.04em}.market-section-heading p{margin:5px 0 0;color:#71807a;font-size:12.5px}.market-section-heading.compact>a{color:var(--mk-green);font-size:12px;font-weight:800;text-decoration:none;white-space:nowrap}
  .market-category-rail{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}.market-category-rail button{min-width:0;min-height:86px;display:grid;grid-template-columns:46px minmax(0,1fr) 18px;gap:10px;align-items:center;padding:13px;border:1px solid var(--mk-line);border-radius:15px;background:#fff;color:#273630;text-align:left;cursor:pointer;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.market-category-rail button:hover{transform:translateY(-2px);border-color:#bdd6cd;box-shadow:0 14px 30px -28px rgba(14,77,60,.65)}.market-category-rail button.aktif{border-color:#a9d3c4;background:#f2faf6}.market-category-icon{width:46px;height:46px;display:grid;place-items:center;border-radius:13px;background:#eff6f3;font-size:21px}.market-category-copy{min-width:0}.market-category-copy strong,.market-category-copy small{display:block}.market-category-copy strong{font-size:12.5px;line-height:1.25}.market-category-copy small{margin-top:3px;color:#85918c;font-size:10.5px}.market-category-arrow{color:#9ba5a1;font-size:22px}
  .market-directory{scroll-margin-top:92px;padding-top:24px;border-top:1px solid #e1e7e4}.market-directory-toolbar{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:14px}.market-tools{display:flex;gap:9px;align-items:end}.market-search-inline{width:min(320px,32vw);min-height:44px;display:grid;grid-template-columns:25px 1fr;align-items:center;padding:0 11px;border:1px solid #d8e1dd;border-radius:11px;background:#fff}.market-search-inline span{color:#75847e}.market-search-inline input{min-width:0;width:100%;border:0!important;background:transparent!important;outline:0!important;box-shadow:none!important;font:inherit;font-size:12.5px}.market-sort{display:grid;gap:4px}.market-sort>span{font-size:9.5px;color:#7d8984}.market-sort select{min-height:44px;padding:0 34px 0 11px;border:1px solid #d8e1dd;border-radius:11px;background:#fff;color:#27362f;font-size:12px}
  .market-filter-pills{display:flex;gap:7px;overflow:auto;padding:2px 0 13px;scrollbar-width:none}.market-filter-pills::-webkit-scrollbar{display:none}.market-filter-pills button{flex:0 0 auto;min-height:34px;padding:0 12px;border:1px solid #dce4e0;border-radius:99px;background:#fff;color:#64736d;font:inherit;font-size:11px;font-weight:700;cursor:pointer}.market-filter-pills button.aktif{border-color:var(--mk-green);background:var(--mk-green);color:#fff}
  .market-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.market-card{min-width:0;overflow:hidden;border:1px solid #e0e6e3;border-radius:17px;background:#fff;box-shadow:0 8px 28px -26px rgba(18,58,45,.5);transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease}.market-card:hover{transform:translateY(-3px);border-color:#c8dad3;box-shadow:0 20px 42px -32px rgba(17,67,51,.52)}
  .market-card-media{position:relative;height:188px;display:block;overflow:hidden;background:#edf2f0}.market-card-media img{width:100%;height:100%;object-fit:cover;transition:transform .35s ease}.market-card:hover .market-card-media img{transform:scale(1.035)}.market-card-media::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,26,21,0) 55%,rgba(8,26,21,.22))}.market-card-topline{position:absolute;z-index:2;left:10px;top:10px;display:flex;gap:5px;flex-wrap:wrap}.market-chip{display:inline-flex;align-items:center;min-height:25px;padding:0 8px;border-radius:99px;background:rgba(255,255,255,.94);color:#29463c;font-size:9.5px;font-weight:800;box-shadow:0 6px 16px -12px rgba(0,0,0,.4)}.market-chip.demo{background:#fff5df;color:#8a5b12}.market-card-media>button{position:absolute;z-index:3;right:10px;top:10px;width:34px;height:34px;min-height:0!important;display:grid;place-items:center;border:0;border-radius:50%;background:rgba(255,255,255,.95);color:#31564a;font:inherit;font-size:17px;cursor:pointer;box-shadow:0 8px 18px -12px rgba(0,0,0,.5)}
  .market-card-body{padding:14px 14px 13px}.market-card-title h3{margin:0}.market-card-title h3 a{color:#1a2924;font-size:15px;line-height:1.3;letter-spacing:-.015em;text-decoration:none}.market-card-title p{display:-webkit-box;margin:5px 0 0;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;color:#72807b;font-size:11.5px;line-height:1.5}.market-product-tags{display:flex;gap:5px;overflow:hidden;margin-top:10px}.market-product-tags span{flex:0 0 auto;max-width:130px;padding:4px 7px;border-radius:7px;background:#f1f5f3;color:#64736d;font-size:9.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.market-meta{display:grid;gap:5px;margin-top:11px;padding-top:10px;border-top:1px solid #edf0ee}.market-meta span{display:flex;gap:7px;align-items:flex-start;min-width:0;color:#697771;font-size:10.5px;line-height:1.35}.market-meta i{width:16px;flex:0 0 auto;color:var(--mk-green);font-style:normal}.market-card-actions{display:grid;grid-template-columns:1fr 1.12fr;gap:7px;margin-top:12px}.market-card-actions a{min-height:37px;display:inline-flex;align-items:center;justify-content:center;padding:0 8px;border-radius:9px;font-size:10.5px;font-weight:800;text-decoration:none}.market-card-actions .detail{border:1px solid #d9e2de;color:#35554a;background:#fff}.market-card-actions .chat{background:var(--mk-green);color:#fff}.market-card-actions .chat.muted{background:#e9efec;color:#5c6b66}
  .market-empty{display:grid;justify-items:center;padding:54px 18px;border:1px dashed #cfdbd6;border-radius:17px;background:#fff;text-align:center}.market-empty>span{width:56px;height:56px;display:grid;place-items:center;border-radius:50%;background:#eef6f2;color:var(--mk-green);font-size:26px}.market-empty h3{margin:13px 0 4px;font-size:19px}.market-empty p{margin:0;color:#75817d;font-size:12px}.market-empty button{min-height:40px;margin-top:14px;padding:0 14px;border:0;border-radius:9px;background:#193f35;color:#fff;font:inherit;font-size:11px;font-weight:800;cursor:pointer}
  .market-benefits{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(360px,.95fr);gap:36px;margin-top:52px;padding:34px;border-radius:22px;background:linear-gradient(135deg,#0d483c,#0a5f4e);color:#fff;box-shadow:0 24px 60px -48px rgba(3,55,43,.75)}.market-benefit-main h2{max-width:650px;margin:10px 0 10px;font-size:30px;line-height:1.08;letter-spacing:-.04em}.market-benefit-main p{max-width:640px;margin:0;color:#c7e0d7;font-size:12.5px;line-height:1.65}.market-benefit-main a{display:inline-flex;margin-top:18px;color:#a8ead1;font-size:12px;font-weight:800;text-decoration:none}.market-benefit-list{display:grid}.market-benefit-list article{display:grid;grid-template-columns:38px 1fr;gap:12px;padding:13px 0;border-top:1px solid rgba(255,255,255,.12)}.market-benefit-list article:first-child{border-top:0}.market-benefit-list article>span{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;background:rgba(255,255,255,.1);color:#a6e7cf;font-size:10px;font-weight:900}.market-benefit-list strong{font-size:13px}.market-benefit-list p{margin:3px 0 0;color:#bfd7ce;font-size:11px;line-height:1.5}
  .market-bottom-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:16px;margin-top:16px}.market-register-card,.market-map-card{position:relative;min-height:260px;overflow:hidden;border:1px solid #e0e7e4;border-radius:19px;background:#fff}.market-register-card{display:grid;grid-template-columns:1fr 42%;align-items:stretch}.market-register-card>div{padding:27px}.market-register-card span,.market-map-card span{color:#718079;font-size:9.5px;font-weight:900;letter-spacing:.1em}.market-register-card h2,.market-map-card h2{margin:7px 0 7px;font-size:24px;line-height:1.1;letter-spacing:-.035em}.market-register-card p,.market-map-card p{margin:0;color:#74817c;font-size:11.5px;line-height:1.55}.market-register-card a,.market-map-card a{display:inline-flex;margin-top:17px;color:var(--mk-green);font-size:11.5px;font-weight:850;text-decoration:none}.market-register-card img{width:100%;height:100%;object-fit:cover}.market-map-card{display:flex;align-items:flex-end;padding:27px;background:#eef5f2}.market-map-card>div:last-child{position:relative;z-index:2;max-width:370px}.market-map-grid{position:absolute!important;inset:0!important;max-width:none!important;opacity:.55;background-image:linear-gradient(rgba(34,102,81,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(34,102,81,.12) 1px,transparent 1px);background-size:34px 34px;transform:rotate(-8deg) scale(1.15)}.market-map-card::after{content:"";position:absolute;width:220px;height:220px;right:35px;top:20px;border-radius:50%;border:42px solid rgba(11,107,87,.08);box-shadow:0 0 0 36px rgba(11,107,87,.045)}
  @media(max-width:1080px){.market-hero-grid{grid-template-columns:1fr minmax(330px,.75fr);gap:32px}.market-category-rail{grid-template-columns:repeat(3,minmax(0,1fr))}.market-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.market-benefits{grid-template-columns:1fr}.market-bottom-grid{grid-template-columns:1fr}.market-register-card{min-height:230px}}
  @media(max-width:820px){.marketplace-umkm{margin-top:-24px}.market-shell{width:min(100% - 28px,1220px)}.market-hero{padding:36px 0 28px}.market-hero-grid{grid-template-columns:1fr}.market-hero h1{font-size:clamp(38px,9vw,56px)}.market-hero-media{height:280px;grid-template-columns:1.2fr .8fr}.market-trust span{min-width:120px}.market-directory-toolbar{align-items:stretch;flex-direction:column}.market-tools{width:100%}.market-search-inline{width:100%;flex:1}.market-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.market-category-rail{grid-template-columns:repeat(2,minmax(0,1fr))}.market-benefits{padding:26px}.market-register-card{grid-template-columns:1fr 35%}}
  @media(max-width:560px){.market-shell{width:calc(100% - 22px)}.market-hero{padding-top:27px}.market-hero h1{font-size:38px}.market-hero-copy>p{font-size:13px}.market-search-hero{min-height:54px;margin-top:19px;grid-template-columns:28px 1fr auto;padding-left:10px}.market-search-hero input{font-size:12px}.market-search-hero a{min-height:40px;padding:0 13px;font-size:11px}.market-hero-actions{display:none}.market-trust{margin-top:18px}.market-trust span{min-width:33%;padding:0 10px}.market-trust b{font-size:16px}.market-trust small{font-size:9px}.market-hero-media{height:220px;gap:8px}.market-hero-card{border-radius:15px}.market-hero-card div{left:11px;right:11px;bottom:10px}.market-hero-card strong{font-size:12px}.market-main{padding-top:18px}.market-demo-note{font-size:11px}.market-section-heading.compact{align-items:flex-start}.market-section-heading.compact>a{display:none}.market-section-heading h2{font-size:23px}.market-category-rail{display:flex;gap:9px;overflow-x:auto;margin-inline:-11px;padding:0 11px 8px;scrollbar-width:none}.market-category-rail::-webkit-scrollbar{display:none}.market-category-rail button{flex:0 0 180px;min-height:72px;grid-template-columns:40px 1fr 14px;padding:10px;border-radius:13px}.market-category-icon{width:40px;height:40px;font-size:18px}.market-tools{display:grid;grid-template-columns:1fr}.market-sort{display:none}.market-filter-pills{margin-inline:-11px;padding-inline:11px}.market-grid{grid-template-columns:1fr 1fr;gap:10px}.market-card{border-radius:13px}.market-card-media{height:130px}.market-card-body{padding:11px}.market-card-title h3 a{font-size:13px}.market-card-title p{font-size:10px}.market-product-tags{display:none}.market-meta{gap:4px;margin-top:9px;padding-top:8px}.market-meta span{font-size:9px}.market-meta span:nth-child(2){display:none}.market-card-actions{grid-template-columns:1fr;margin-top:9px}.market-card-actions .detail{display:none}.market-card-actions a{min-height:34px;font-size:9.5px}.market-benefits{margin-top:34px;padding:22px;border-radius:17px}.market-benefit-main h2{font-size:24px}.market-bottom-grid{margin-top:11px;gap:11px}.market-register-card{grid-template-columns:1fr;min-height:0}.market-register-card>div{padding:22px}.market-register-card img{height:150px}.market-map-card{min-height:230px;padding:22px}.market-register-card h2,.market-map-card h2{font-size:21px}}
  @media(max-width:390px){.market-grid{grid-template-columns:1fr}.market-card-media{height:180px}.market-card-title h3 a{font-size:14px}.market-card-title p{font-size:11px}.market-meta span{font-size:10px}.market-card-actions .detail{display:inline-flex}.market-card-actions{grid-template-columns:1fr 1.1fr}}
  @media(prefers-reduced-motion:reduce){.market-card,.market-category-rail button,.market-card-media img,.market-hero-card img{transition:none}}
</style>
