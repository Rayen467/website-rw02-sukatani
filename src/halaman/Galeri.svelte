<script>
  /**
   * Galeri publik RW 02.
   *
   * Tampilan mengikuti pola galeri editorial: hero sorotan, filter, sortir,
   * grid album/video, dan viewer album. Seluruh angka dan kartu tetap berasal
   * dari data situs; tidak ada album, tanggal, jumlah foto, atau video contoh.
   */
  import { KOLEKSI } from "../inti/nama.js";
  import { isi } from "../keadaan/isi.svelte.js";
  import { beriTahu } from "../keadaan/pesan.svelte.js";
  import { ambilCocok } from "../sumber/data.js";
  import Kosong from "../komponen/Kosong.svelte";

  const daftar = $derived(isi.galeri || []);
  const video = $derived((isi.berkas || []).filter((d) => d.kategori === "video"));

  let album = $state(null);
  let foto = $state([]);
  let memuat = $state(false);
  let ke = $state(0);
  let filter = $state("semua");
  let urut = $state("terbaru");
  let batas = $state(10);
  let sorotan = $state(0);

  const pilihanFilter = [
    { id: "semua", label: "Semua", ikon: "▦" },
    { id: "foto", label: "Foto", ikon: "▣" },
    { id: "video", label: "Video", ikon: "▶" },
    { id: "kegiatan", label: "Kegiatan", ikon: "●" },
    { id: "pembangunan", label: "Pembangunan", ikon: "▥" },
    { id: "acara", label: "Acara Warga", ikon: "▦" }
  ];

  function tanggalAlbum(g) {
    if (g?.tanggal) return String(g.tanggal);
    const cocok = String(g?.fn || "").match(/^(\d{4}-\d{2}-\d{2})/);
    return cocok?.[1] || "";
  }

  function kategoriAlbum(g) {
    const nilai = String(g?.kategori || "").toLowerCase();
    if (["kegiatan", "pembangunan", "acara"].includes(nilai)) return nilai;
    return "";
  }

  function tanggalVideo(v) {
    return String(v?.tgl || v?.tanggal || "");
  }

  function waktuAngka(teks) {
    if (!teks) return 0;
    const angka = Date.parse(teks);
    return Number.isFinite(angka) ? angka : 0;
  }

  function tanggalTampil(teks) {
    if (!teks) return "";
    const d = new Date(`${teks}T00:00:00`);
    if (Number.isNaN(d.getTime())) return teks;
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(d);
  }

  function ringkas(teks, maks = 95) {
    const bersih = String(teks || "").replace(/\s+/g, " ").trim();
    if (!bersih) return "";
    return bersih.length > maks ? `${bersih.slice(0, maks - 1).trimEnd()}…` : bersih;
  }

  const semuaItem = $derived.by(() => {
    const albumItem = daftar.map((g) => ({
      id: `foto:${g.id}`,
      jenis: "foto",
      kategori: kategoriAlbum(g),
      tanggal: tanggalAlbum(g),
      judul: g.judul || "Album kegiatan",
      ket: g.ket || g.keterangan || g.fn || "",
      sampul: g.sampul || g.foto || "",
      jumlah: Number(g.jumlahFoto || 0),
      sumber: g
    }));

    const videoItem = video.map((v) => ({
      id: `video:${v.id}`,
      jenis: "video",
      kategori: "",
      tanggal: tanggalVideo(v),
      judul: v.judul || "Video kegiatan",
      ket: v.ket || "",
      sampul: v.sampul || v.foto || v.poster || "",
      jumlah: 0,
      sumber: v
    }));

    return [...albumItem, ...videoItem];
  });

  const tersaring = $derived.by(() => {
    let hasil = semuaItem.filter((item) => {
      if (filter === "semua") return true;
      if (filter === "foto" || filter === "video") return item.jenis === filter;
      return item.kategori === filter;
    });

    hasil = [...hasil].sort((a, b) => {
      if (urut === "terlama") return waktuAngka(a.tanggal) - waktuAngka(b.tanggal);
      if (urut === "judul") return a.judul.localeCompare(b.judul, "id");
      return waktuAngka(b.tanggal) - waktuAngka(a.tanggal);
    });

    return hasil;
  });

  const terlihat = $derived(tersaring.slice(0, batas));
  const albumSorotan = $derived(daftar.length ? daftar[sorotan % daftar.length] : null);
  const tanggalSorotan = $derived(albumSorotan ? tanggalAlbum(albumSorotan) : "");

  function pilihFilter(id) {
    filter = id;
    batas = 10;
  }

  function geserSorotan(arah) {
    if (daftar.length < 2) return;
    sorotan = (sorotan + arah + daftar.length) % daftar.length;
  }

  async function buka(g) {
    album = g;
    foto = [];
    ke = 0;
    memuat = true;
    try {
      const hasil = await ambilCocok(KOLEKSI.GALERI_FOTO, "album", g.id);
      hasil.sort((a, b) => Number(a.urut || 0) - Number(b.urut || 0));
      foto = hasil;
    } catch (err) {
      beriTahu("Foto album ini gagal diambil.");
    }
    memuat = false;
  }

  function bukaItem(item) {
    if (item.jenis === "foto") {
      buka(item.sumber);
      return;
    }
    const v = item.sumber;
    if (v.cara === "tautan" && v.tautan) {
      window.open(v.tautan, "_blank", "noopener,noreferrer");
    } else {
      location.hash = "#/berkas";
    }
  }

  function tutup() {
    album = null;
    foto = [];
    ke = 0;
  }

  function geser(arah) {
    if (!foto.length) return;
    ke = (ke + arah + foto.length) % foto.length;
  }

  const sekarang = $derived(foto[ke] || null);
</script>

<div class="galeri-pro">
  <nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Galeri</span></nav>

  <section class="galeri-hero">
    <div class="galeri-hero-copy">
      <p class="galeri-eyebrow"><span></span>GALERI</p>
      <h1>Galeri Foto &amp; Video</h1>
      <p class="galeri-lead">Dokumentasi kegiatan, pembangunan, dan acara warga dalam bentuk album foto maupun video.</p>

      <blockquote>
        <span aria-hidden="true">“</span>
        <p>Cerita kebersamaan warga, tersimpan rapi sebagai dokumentasi lingkungan RW 02.</p>
      </blockquote>
    </div>

    <div class="galeri-sorotan">
      {#if albumSorotan}
        <article class="sorotan-kartu">
          <div class="sorotan-media">
            {#if albumSorotan.sampul || albumSorotan.foto}
              <img src={albumSorotan.sampul || albumSorotan.foto} alt={albumSorotan.judul || "Dokumentasi kegiatan RW 02"} decoding="async" />
            {:else}
              <div class="sorotan-kosong"><span>RW 02</span><small>Dokumentasi kegiatan</small></div>
            {/if}
            <span class="sorotan-label">{kategoriAlbum(albumSorotan) === "pembangunan" ? "Pembangunan" : kategoriAlbum(albumSorotan) === "acara" ? "Acara Warga" : "Kegiatan"}</span>
            {#if daftar.length > 1}
              <div class="sorotan-nav">
                <button type="button" aria-label="Sorotan sebelumnya" onclick={() => geserSorotan(-1)}>‹</button>
                <button type="button" aria-label="Sorotan berikutnya" onclick={() => geserSorotan(1)}>›</button>
              </div>
            {/if}
            <div class="sorotan-overlay">
              {#if tanggalSorotan}<small>▣ {tanggalTampil(tanggalSorotan)}</small>{/if}
              <h2>{albumSorotan.judul || "Dokumentasi RW 02"}</h2>
              {#if albumSorotan.ket || albumSorotan.keterangan || albumSorotan.fn}
                <p>{ringkas(albumSorotan.ket || albumSorotan.keterangan || albumSorotan.fn, 120)}</p>
              {/if}
              <button type="button" onclick={() => buka(albumSorotan)}>Lihat Galeri <span>›</span></button>
            </div>
          </div>
        </article>
      {:else}
        <div class="sorotan-belum">
          <strong>Belum ada album sorotan.</strong>
          <span>Album pertama yang diterbitkan pengurus akan muncul di area ini.</span>
        </div>
      {/if}
    </div>

    <aside class="galeri-nilai" aria-label="Nilai dokumentasi warga">
      <div class="galeri-tulisan">Bersama<br />Membangun<br />Sukatani</div>
      <span class="galeri-coret" aria-hidden="true"></span>
      <ul>
        <li><b>▣</b><span>Dokumentasi Kegiatan</span></li>
        <li><b>●</b><span>Kebersamaan Warga</span></li>
        <li><b>⌂</b><span>Pembangunan Lingkungan</span></li>
        <li><b>♥</b><span>Sukatani yang Lebih Baik</span></li>
      </ul>
    </aside>
  </section>

  <section class="galeri-kontrol" aria-label="Filter galeri">
    <div class="galeri-filter">
      {#each pilihanFilter as f}
        <button type="button" class:aktif={filter === f.id} aria-pressed={filter === f.id} onclick={() => pilihFilter(f.id)}>
          <span>{f.ikon}</span>{f.label}
        </button>
      {/each}
    </div>
    <div class="galeri-urut">
      <label for="galeri-urut">Urutkan:</label>
      <select id="galeri-urut" bind:value={urut} onchange={() => (batas = 10)}>
        <option value="terbaru">Terbaru</option>
        <option value="terlama">Terlama</option>
        <option value="judul">Judul A–Z</option>
      </select>
      <span>Menampilkan {terlihat.length} dari {tersaring.length} item</span>
    </div>
  </section>

  {#if terlihat.length}
    <section class="galeri-grid" aria-label="Daftar galeri foto dan video">
      {#each terlihat as item}
        <article class="galeri-card">
          <button class="galeri-card-media" type="button" onclick={() => bukaItem(item)} aria-label={`Buka ${item.judul}`}>
            {#if item.sampul}
              <img src={item.sampul} alt={item.judul} loading="lazy" decoding="async" />
            {:else}
              <span class="galeri-placeholder"><b>{item.jenis === "video" ? "▶" : "RW 02"}</b><small>{item.jenis === "video" ? "Video kegiatan" : "Belum ada sampul"}</small></span>
            {/if}
            <span class="galeri-card-label">{item.jenis === "video" ? "Video" : "Foto"}</span>
            {#if item.jenis === "video"}<span class="galeri-play" aria-hidden="true">▶</span>{/if}
            {#if item.jenis === "foto" && item.jumlah > 0}<span class="galeri-jumlah">▣ {item.jumlah} foto</span>{/if}
          </button>
          <div class="galeri-card-body">
            {#if item.tanggal}<small class="galeri-tanggal">▣ {tanggalTampil(item.tanggal)}</small>{/if}
            <h3>{item.judul}</h3>
            {#if item.ket}<p>{ringkas(item.ket)}</p>{/if}
            <button class="galeri-card-aksi" type="button" onclick={() => bukaItem(item)} aria-label={`Buka ${item.judul}`}>⋮</button>
          </div>
        </article>
      {/each}
    </section>

    {#if terlihat.length < tersaring.length}
      <div class="galeri-lebih">
        <button type="button" onclick={() => (batas += 10)}>Lihat lebih banyak <span>↓</span></button>
      </div>
    {/if}
  {:else}
    <div class="galeri-kosong-wrap">
      <Kosong
        judul={semuaItem.length ? "Belum ada dokumentasi pada filter ini" : "Belum ada dokumentasi kegiatan"}
        ket={semuaItem.length ? "Pilih kategori lain untuk melihat dokumentasi yang tersedia." : "Foto dan video kegiatan akan tampil di sini setelah pengurus menerbitkannya."}
        tab="terbit"
        aksi="Unggah foto kegiatan"
      />
    </div>
  {/if}
</div>

<svelte:window
  onkeydown={(e) => {
    if (!album) return;
    if (e.key === "Escape") tutup();
    if (e.key === "ArrowRight") geser(1);
    if (e.key === "ArrowLeft") geser(-1);
  }}
/>

{#if album}
  <div class="tirai galeri-modal" role="dialog" aria-modal="true" aria-label={album.judul}>
    <button class="tirai-tutup" type="button" aria-label="Tutup" onclick={tutup}></button>
    <div class="dalam galeri-modal-dalam">
      <div class="galeri-modal-media">
        {#if memuat}
          <span class="mono">Mengambil foto...</span>
        {:else if sekarang}
          <img class="gambar-penuh" src={sekarang.foto} alt={album.judul || "Foto kegiatan"} />
        {:else if album.foto || album.sampul}
          <img class="gambar-penuh" src={album.foto || album.sampul} alt={album.judul || "Foto kegiatan"} />
        {:else}
          <span class="galeri-modal-placeholder">Album belum memiliki foto.</span>
        {/if}

        {#if foto.length > 1}
          <button class="modal-panah kiri" type="button" aria-label="Foto sebelumnya" onclick={() => geser(-1)}>‹</button>
          <button class="modal-panah kanan" type="button" aria-label="Foto berikutnya" onclick={() => geser(1)}>›</button>
        {/if}
      </div>

      <div class="galeri-modal-meta">
        <div>
          <b>{album.judul}</b>
          <p>
            {#if foto.length}
              Foto {ke + 1} dari {foto.length}{album.jml ? " · " + album.jml : ""}
            {:else}
              {album.fn || ""}{album.jml ? " · " + album.jml : ""}
            {/if}
          </p>
        </div>
        <button class="tombol" type="button" onclick={tutup}>Tutup</button>
      </div>

      {#if foto.length > 1}
        <div class="jempol galeri-jempol">
          {#each foto as f, i}
            <button class="jempol-satu" class:terpilih={i === ke} type="button" aria-label={`Foto ${i + 1}`} onclick={() => (ke = i)}>
              <img src={f.foto} alt="" decoding="async" />
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .galeri-pro{margin:0 calc(50% - 50vw);padding:0 max(5vw,calc((100vw - 1240px)/2)) 38px;background:linear-gradient(180deg,#f6fbf7 0,#fff 390px,#fff 100%);color:#173f35}.galeri-pro .remah{padding-top:24px;margin-bottom:12px}.galeri-hero{position:relative;display:grid;grid-template-columns:minmax(330px,.82fr) minmax(480px,1.18fr) 190px;gap:28px;align-items:center;min-height:330px;padding:8px 0 30px}.galeri-hero:before{content:"";position:absolute;inset:-48px -8vw 0;z-index:0;background:radial-gradient(circle at 14% 30%,rgba(218,239,224,.75),transparent 34%),radial-gradient(circle at 80% 10%,rgba(215,242,228,.72),transparent 33%);pointer-events:none}.galeri-hero>*{position:relative;z-index:1}.galeri-eyebrow{display:flex;align-items:center;gap:10px;margin:0 0 14px;font-size:12px;font-weight:900;letter-spacing:.08em;color:#0b7657}.galeri-eyebrow span{width:22px;height:3px;border-radius:99px;background:#13916d}.galeri-hero-copy h1{margin:0;max-width:470px;font-size:clamp(38px,4.6vw,62px);line-height:.98;letter-spacing:-.055em;color:#103d32}.galeri-lead{max-width:470px;margin:15px 0 0;font-size:15px;line-height:1.55;color:#59716a}.galeri-hero blockquote{display:grid;grid-template-columns:34px 1fr;gap:12px;align-items:start;max-width:420px;margin:26px 0 0;padding:18px 20px;border:1px solid rgba(30,116,84,.12);border-left:3px solid #55b33b;border-radius:14px;background:rgba(255,255,255,.74);box-shadow:0 16px 45px -40px #0c563f}.galeri-hero blockquote>span{font-family:Georgia,serif;font-size:42px;line-height:.8;color:#4a8b61}.galeri-hero blockquote p{margin:0;font-size:13px;font-style:italic;line-height:1.55;color:#698078}.sorotan-kartu{padding:10px;border-radius:20px;background:#fff;box-shadow:0 12px 30px rgba(18,68,53,.12)}.sorotan-media{position:relative;overflow:hidden;min-height:285px;border-radius:14px;background:#dcebe4}.sorotan-media>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.sorotan-media:after{content:"";position:absolute;inset:40% 0 0;background:linear-gradient(transparent,rgba(6,25,20,.82))}.sorotan-kosong{position:absolute;inset:0;display:grid;place-content:center;text-align:center;background:linear-gradient(135deg,#dcefe5,#afcfbf);color:#0c634b}.sorotan-kosong span{font-size:34px;font-weight:950}.sorotan-kosong small{font-weight:700}.sorotan-label{position:absolute;z-index:3;top:14px;left:14px;padding:6px 16px;border-radius:999px;background:#0b7457;color:#fff;font-size:11px;font-weight:800;box-shadow:0 4px 12px rgba(0,0,0,.18)}.sorotan-nav{position:absolute;z-index:4;right:13px;top:12px;display:flex;gap:7px}.sorotan-nav button{width:38px;height:38px;border:0;border-radius:50%;background:rgba(250,255,252,.92);color:#184d3f;font-size:27px;line-height:1;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.12)}.sorotan-overlay{position:absolute;z-index:3;left:20px;right:20px;bottom:18px;color:#fff}.sorotan-overlay small{display:block;margin-bottom:4px;font-size:10px;font-weight:700;color:rgba(255,255,255,.9)}.sorotan-overlay h2{margin:0;font-size:21px;line-height:1.15;letter-spacing:-.02em}.sorotan-overlay p{max-width:500px;margin:5px 0 10px;font-size:11px;line-height:1.45;color:rgba(255,255,255,.9)}.sorotan-overlay button{display:inline-flex;align-items:center;gap:10px;padding:9px 15px;border:0;border-radius:999px;background:#f4fbf7;color:#155542;font-size:11px;font-weight:850;cursor:pointer}.sorotan-overlay button span{font-size:18px}.sorotan-belum{display:grid;place-content:center;min-height:300px;padding:30px;border:1px dashed #b9d0c6;border-radius:20px;background:rgba(255,255,255,.7);text-align:center;color:#607970}.sorotan-belum strong{color:#184c3e}.galeri-nilai{align-self:stretch;display:flex;flex-direction:column;justify-content:center;padding-left:6px}.galeri-tulisan{font-family:Georgia,"Times New Roman",serif;font-size:24px;line-height:1.08;font-style:italic;color:#286a58;transform:rotate(-4deg);transform-origin:left center}.galeri-coret{display:block;width:75px;height:2px;margin:12px 0 22px;background:#266e5a;transform:rotate(-15deg)}.galeri-nilai ul{display:grid;gap:15px;margin:0;padding:0;list-style:none}.galeri-nilai li{display:flex;align-items:center;gap:11px;font-size:11px;color:#486a60}.galeri-nilai li b{width:20px;text-align:center;color:#0b7256;font-size:17px}.galeri-kontrol{display:flex;justify-content:space-between;gap:20px;align-items:center;margin:0 calc(50% - 50vw);padding:14px max(5vw,calc((100vw - 1240px)/2));border-top:1px solid #e1ebe6;border-bottom:1px solid #e6eeea;background:#fff}.galeri-filter{display:flex;gap:9px;flex-wrap:wrap}.galeri-filter button{display:inline-flex;align-items:center;gap:7px;padding:9px 14px;border:1px solid #ccdcd5;border-radius:999px;background:#fff;color:#315c50;font-size:11px;font-weight:760;cursor:pointer;transition:.18s ease}.galeri-filter button:hover{border-color:#88b6a4;background:#f4faf7}.galeri-filter button.aktif{border-color:#0a7456;background:#0a7456;color:#fff;box-shadow:0 6px 16px -10px #0a7456}.galeri-filter button span{font-size:13px}.galeri-urut{display:flex;align-items:center;gap:9px;white-space:nowrap;color:#788a84;font-size:11px}.galeri-urut select{min-width:116px;padding:8px 28px 8px 12px;border:1px solid #d4dfda;border-radius:999px;background:#fff;color:#365f53;font:inherit;font-weight:700}.galeri-urut>span{margin-left:16px}.galeri-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px;margin-top:18px}.galeri-card{position:relative;min-width:0;overflow:hidden;border:1px solid #dde7e2;border-radius:10px;background:#fff;box-shadow:0 6px 18px rgba(22,64,51,.05);transition:transform .18s ease,box-shadow .18s ease}.galeri-card:hover{transform:translateY(-3px);box-shadow:0 13px 28px rgba(22,64,51,.10)}.galeri-card-media{position:relative;display:block;width:100%;aspect-ratio:1.52/1;overflow:hidden;padding:0;border:0;background:#e8f1ec;cursor:pointer}.galeri-card-media>img{width:100%;height:100%;object-fit:cover;transition:transform .28s ease}.galeri-card:hover .galeri-card-media>img{transform:scale(1.025)}.galeri-placeholder{display:grid;place-content:center;gap:4px;width:100%;height:100%;background:linear-gradient(145deg,#d8ece2,#f3f8f5);color:#4a776a}.galeri-placeholder b{font-size:23px}.galeri-placeholder small{font-size:9px;font-weight:750}.galeri-card-label{position:absolute;top:9px;left:9px;padding:5px 12px;border-radius:999px;background:#0b7759;color:#fff;font-size:10px;font-weight:850;box-shadow:0 4px 12px rgba(0,0,0,.16)}.galeri-play{position:absolute;left:50%;top:50%;display:grid;place-items:center;width:48px;height:48px;border:3px solid #fff;border-radius:50%;background:rgba(7,29,23,.45);color:#fff;font-size:17px;transform:translate(-50%,-50%);box-shadow:0 4px 16px rgba(0,0,0,.25)}.galeri-jumlah{position:absolute;left:9px;bottom:8px;padding:4px 8px;border-radius:5px;background:rgba(12,35,28,.68);color:#fff;font-size:9px;font-weight:800;backdrop-filter:blur(4px)}.galeri-card-body{position:relative;min-height:112px;padding:11px 30px 13px 12px}.galeri-tanggal{display:block;margin-bottom:5px;color:#75857f;font-size:9px;font-weight:650}.galeri-card h3{margin:0;font-size:13px;line-height:1.25;color:#183f35}.galeri-card p{margin:6px 0 0;font-size:10px;line-height:1.42;color:#6d7d78}.galeri-card-aksi{position:absolute;right:8px;top:10px;width:26px;height:28px;border:0;background:transparent;color:#49665d;font-size:18px;cursor:pointer}.galeri-lebih{display:flex;justify-content:center;margin:18px 0 0}.galeri-lebih button{display:inline-flex;align-items:center;justify-content:center;gap:30px;min-width:210px;padding:10px 20px;border:0;border-radius:999px;background:#086e53;color:#fff;font-size:11px;font-weight:850;cursor:pointer;box-shadow:0 8px 18px -13px #086e53}.galeri-lebih button span{font-size:15px}.galeri-kosong-wrap{margin-top:20px}.galeri-modal{z-index:1000}.galeri-modal-dalam{width:min(920px,92vw)}.galeri-modal-media{position:relative;display:grid;place-items:center;min-height:420px;overflow:hidden;border-radius:14px;background:#12231e}.galeri-modal-media img{width:100%;height:min(68vh,620px);object-fit:contain}.galeri-modal-media .mono,.galeri-modal-placeholder{color:#e7f2ed;font-size:13px}.modal-panah{position:absolute;top:50%;width:44px;height:44px;border:0;border-radius:50%;background:rgba(255,255,255,.9);color:#194c3e;font-size:28px;transform:translateY(-50%);cursor:pointer}.modal-panah.kiri{left:12px}.modal-panah.kanan{right:12px}.galeri-modal-meta{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:12px}.galeri-modal-meta b{font-family:Archivo,sans-serif;font-size:17px}.galeri-modal-meta p{margin:3px 0 0;color:var(--tinta-3);font:12px ui-monospace,SFMono-Regular,Menlo,monospace}.galeri-jempol{margin-top:12px}
  @media(max-width:1120px){.galeri-hero{grid-template-columns:minmax(310px,.8fr) minmax(430px,1.2fr)}.galeri-nilai{display:none}.galeri-grid{grid-template-columns:repeat(4,minmax(0,1fr))}.galeri-urut>span{display:none}}
  @media(max-width:900px){.galeri-hero{grid-template-columns:1fr;gap:20px}.galeri-hero-copy{padding-top:8px}.galeri-hero-copy h1{max-width:none}.galeri-lead{max-width:650px}.galeri-hero blockquote{max-width:620px}.galeri-sorotan{max-width:760px}.galeri-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.galeri-kontrol{align-items:flex-start;flex-direction:column}.galeri-urut{width:100%;justify-content:flex-end}}
  @media(max-width:680px){.galeri-pro{padding-left:16px;padding-right:16px}.galeri-hero{min-height:auto;padding-bottom:22px}.galeri-hero-copy h1{font-size:39px}.galeri-lead{font-size:13px}.galeri-hero blockquote{margin-top:18px;padding:14px}.sorotan-media{min-height:255px}.galeri-kontrol{margin-left:-16px;margin-right:-16px;padding:12px 16px}.galeri-filter{flex-wrap:nowrap;width:100%;overflow:auto;padding-bottom:2px}.galeri-filter button{flex:0 0 auto}.galeri-urut{justify-content:space-between}.galeri-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.galeri-card-body{min-height:106px}.galeri-modal-media{min-height:280px}}
  @media(max-width:430px){.galeri-grid{grid-template-columns:1fr}.galeri-card-media{aspect-ratio:16/10}.galeri-card-body{min-height:auto}.sorotan-overlay h2{font-size:18px}.galeri-urut label{display:none}}
</style>
