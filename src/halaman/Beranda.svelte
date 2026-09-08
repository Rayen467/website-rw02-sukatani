<script>
  import { KONTEN } from "../inti/nama.js";
  import { keDaftar } from "../inti/format.js";
  import { SAMBUTAN_BAWAAN, BERANDA_BAWAAN } from "../inti/bawaan.js";
  import { isi, konten, kontenNilai } from "../keadaan/isi.svelte.js";
  import { waktu, FASE_WAKTU, pilihWaktu, kembaliOtomatis } from "../keadaan/waktu.svelte.js";
  import Belum from "../komponen/Belum.svelte";
  import TombolSalin from "../komponen/TombolSalin.svelte";
  import Kosong from "../komponen/Kosong.svelte";

  const sambutan = $derived({
    teks: kontenNilai(KONTEN.SAMBUTAN, "teks", SAMBUTAN_BAWAAN.teks),
    nama: kontenNilai(KONTEN.SAMBUTAN, "nama", SAMBUTAN_BAWAAN.nama),
    foto: kontenNilai(KONTEN.SAMBUTAN, "foto", "")
  });

  const kabar = $derived((isi.pengumuman || []).slice(0, 3));
  const penting = $derived((isi.pengumuman || []).find((x) => x.penting === "true") || null);
  const usaha = $derived((isi.usaha || []).slice(0, 4));
  const album = $derived((isi.galeri || []).slice(0, 4));
  const profil = $derived(konten(KONTEN.PROFIL) || {});
  const namaRW = $derived(kontenNilai(KONTEN.IDENTITAS, "namaRW", "RW 02"));

  const t = $derived(
    Object.fromEntries(
      Object.keys(BERANDA_BAWAAN).map((k) => [k, kontenNilai(KONTEN.BERANDA, k, BERANDA_BAWAAN[k])])
    )
  );

  const gambarHero = $derived(
    waktu.fase === "malam"
      ? "./visual/waktu/hero-malam.webp"
      : "./visual/waktu/hero-pagi.webp"
  );

  const layanan = [
    {
      judul: "Pengajuan Surat",
      teks: "Ajukan surat secara online dengan mudah",
      href: "#/surat",
      ikon: "surat"
    },
    {
      judul: "Pengaduan Warga",
      teks: "Sampaikan keluhan dan masukan",
      href: "#/pengaduan",
      ikon: "aduan"
    },
    {
      judul: "Data Warga",
      teks: "Informasi data kependudukan",
      href: "#/kependudukan",
      ikon: "warga"
    },
    {
      judul: "Peminjaman Fasilitas",
      teks: "Ajukan peminjaman fasilitas RW 02",
      href: "#/reservasi",
      ikon: "fasilitas"
    },
    {
      judul: "UMKM Warga",
      teks: "Dukung usaha warga lokal",
      href: "#/umkm",
      ikon: "umkm"
    },
    {
      judul: "Transportasi Warga",
      teks: "Informasi transportasi dan mobilitas",
      href: "#/kontak",
      ikon: "transportasi"
    }
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
        <a class="cta-utama" href="#/layanan">Ajukan Layanan <span>→</span></a>
        <a class="cta-kedua" href="#/profil">Tentang RW 02</a>
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
        {:else if l.ikon === "warga"}
          <svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-4 2.5-6 6-6s6 2 6 6M14 15c3.5-.6 6 1.2 6 5"/></svg>
        {:else if l.ikon === "fasilitas"}
          <svg viewBox="0 0 24 24"><path d="M4 21h16M6 21V9h12v12M9 9V5h6v4M9 13h2v3H9zM13 13h2v3h-2z"/></svg>
        {:else if l.ikon === "umkm"}
          <svg viewBox="0 0 24 24"><path d="M4 9l2-5h12l2 5M5 10v10h14V10M9 14h6v6"/><path d="M4 9c0 2 3 2 4 0 1 2 3 2 4 0 1 2 3 2 4 0 1 2 4 2 4 0"/></svg>
        {:else}
          <svg viewBox="0 0 24 24"><path d="M5 17h14M6 17v3M18 17v3M4 12h16v5H4zM6 12V6h12v6M8 8h8"/><circle cx="7" cy="15" r="1"/><circle cx="17" cy="15" r="1"/></svg>
        {/if}
      </span>
      <strong>{l.judul}</strong>
      <small>{l.teks}</small>
      <span class="layanan-panah">→</span>
    </a>
  {/each}
</section>

<div class="beranda-grid-utama blok">
  <section class="panel-rumah panel-pengumuman">
    <div class="panel-kepala">
      <h2>Pengumuman Terbaru</h2>
      <a href="#/berita">Lihat Semua →</a>
    </div>

    {#if kabar.length}
      <div class="pengumuman-ringkas">
        {#each kabar as k, i}
          <article>
            <span class="pengumuman-ikon" aria-hidden="true">{i === 0 ? "◁" : i === 1 ? "▣" : "△"}</span>
            <time>{k.tglText || k.tgl || ""}</time>
            <div>
              <h3><a href="#/berita/{k.id}">{k.judul}</a></h3>
              <p>{k.ringkas || k.isi || ""}</p>
            </div>
            <span class="label-kecil {k.tipe === 'agenda' ? 'agenda' : ''}">
              {k.tipe === "agenda" ? "Kegiatan" : "Informasi"}
            </span>
          </article>
        {/each}
      </div>
    {:else}
      <Kosong
        judul="Belum ada pengumuman"
        ket="Kabar terbaru dari pengurus akan tampil di sini."
        tab="terbit"
        aksi="Terbitkan pengumuman"
      />
    {/if}
  </section>

  <section class="panel-rumah panel-tentang">
    <img class="ornamen-daun" src="./visual/brand/ornamen-daun.webp" alt="" aria-hidden="true" />
    <div class="panel-kepala">
      <h2>Tentang Permai Sukatani</h2>
      <a href="#/profil" aria-label="Buka profil RW">→</a>
    </div>
    <div class="tentang-isi">
      <img src={gambarHero} alt="" decoding="async" />
      <div>
        <p>
          {profil.sejarah ||
            "Permai Sukatani adalah lingkungan warga yang tumbuh bersama, saling terhubung, peduli, dan membangun lingkungan yang lebih baik."}
        </p>
        <a class="cta-mini" href="#/profil">Lihat Profil →</a>
      </div>
    </div>
    <blockquote>Lingkungan yang baik berawal dari warga yang peduli.</blockquote>
  </section>
</div>

<section class="blok">
  <div class="panel-kepala beranda-judul-bagian">
    <h2>Kegiatan Warga</h2>
    <a href="#/galeri">Lihat Semua →</a>
  </div>
  <div class="kegiatan-grid">
    {#each kegiatan as k}
      <a class="kegiatan-card" href="#/galeri">
        <img src={k.foto} alt="" decoding="async" />
        <span>
          <strong>{k.judul}</strong>
          <small>{k.tanggal}</small>
        </span>
      </a>
    {/each}
  </div>
</section>

<div class="beranda-grid-bawah blok">
  <section>
    <div class="panel-kepala beranda-judul-bagian">
      <h2>Galeri Lingkungan</h2>
      <a href="#/galeri">Lihat Semua →</a>
    </div>
    <div class="galeri-home">
      {#if album.length}
        {#each album as g, i}
          <a href="#/galeri">
            <img src={g.sampul || g.foto || galeriFallback[i % galeriFallback.length]} alt="" decoding="async" />
          </a>
        {/each}
      {:else}
        {#each galeriFallback as foto}
          <a href="#/galeri"><img src={foto} alt="" decoding="async" /></a>
        {/each}
      {/if}
    </div>
  </section>

  <section>
    <div class="panel-kepala beranda-judul-bagian">
      <h2>UMKM Warga</h2>
      <a href="#/umkm">Lihat Semua →</a>
    </div>
    {#if usaha.length}
      <div class="umkm-home">
        {#each usaha as u}
          <a href="#/umkm/{u.id}">
            <span class="umkm-home-foto">
              {#if u.sampul || u.foto}
                <img src={u.sampul || u.foto} alt="" decoding="async" />
              {:else}
                <span>RW</span>
              {/if}
            </span>
            <strong>{u.nama}</strong>
            <small>{u.katLabel || u.jenis || "Usaha warga"}</small>
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

{#if penting}
  <section class="blok">
    <div class="catatan awas">
      <p class="alis">Pengumuman penting</p>
      <h3 style="margin:4px 0 8px"><a href="#/berita/{penting.id}">{penting.judul}</a></h3>
      <p>{penting.ringkas || penting.isi || ""}</p>
      <div class="baris-tombol" style="margin-top:10px">
        <a class="tombol utama" href="#/berita/{penting.id}">Baca pengumuman</a>
        <TombolSalin judul={penting.judul} jalur="/berita/{penting.id}" />
      </div>
    </div>
  </section>
{/if}

<section class="blok zona">
  <div class="darurat">
    <span class="judul">Nomor penting</span>
    <span class="butir"><span class="nama">Pos keamanan</span><span class="nomor"><Belum nilai={kontenNilai(KONTEN.KONTAK, "posKeamanan")} /></span></span>
    <span class="butir"><span class="nama">Ketua RW</span><span class="nomor"><Belum nilai={kontenNilai(KONTEN.KONTAK, "ketuaRW")} /></span></span>
    <span class="butir"><span class="nama">Transportasi warga</span><span class="nomor"><Belum nilai={kontenNilai(KONTEN.KONTAK, "ambulans")} /></span></span>
  </div>
</section>

{#if sambutan.teks}
  <section class="blok">
    <div class="sambutan">
      <p class="alis">Sambutan Ketua RW</p>
      <div class="orang" class:tanpa-foto={!sambutan.foto}>
        {#if sambutan.foto}
          <span class="foto"><img class="gambar-penuh" src={sambutan.foto} alt="" decoding="async" /></span>
        {/if}
        <div>
          {#each keDaftar(sambutan.teks) as alinea}
            <p class="alinea">{alinea}</p>
          {/each}
          <p class="tanda-tangan"><b class="mono">Ketua {namaRW}{sambutan.nama ? " — " + sambutan.nama : ""}</b></p>
        </div>
      </div>
    </div>
  </section>
{/if}

<section class="blok">
  <div class="petak petak-2">
    <a class="kartu sunyi" href="#/kas"><p class="alis">Transparansi</p><h3>{t.judulKas}</h3><p>{t.teksKas}</p></a>
    <a class="kartu sunyi" href="#/program"><p class="alis">Transparansi</p><h3>{t.judulProgram}</h3><p>{t.teksProgram}</p></a>
  </div>
</section>
