<script>
  import { KONTEN } from "../inti/nama.js";
  import { MENU, IDENTITAS_BAWAAN } from "../inti/bawaan.js";
  import { kontenNilai } from "../keadaan/isi.svelte.js";
  import { sesi, pengurus } from "../keadaan/sesi.svelte.js";
  import { rute, pergi } from "../keadaan/rute.svelte.js";
  import TombolTema from "./TombolTema.svelte";
  import TombolAkun from "./TombolAkun.svelte";

  let menuTerbuka = $state(null);
  let laciTerbuka = $state(false);
  let kataCari = $state("");
  let navbarTersembunyi = $state(false);
  let gulirTerakhir = 0;

  const ident = $derived({
    lambang: kontenNilai(KONTEN.IDENTITAS, "lambang", IDENTITAS_BAWAAN.lambang),
    namaSitus: kontenNilai(KONTEN.IDENTITAS, "namaSitus", IDENTITAS_BAWAAN.namaSitus),
    namaRW: kontenNilai(KONTEN.IDENTITAS, "namaRW", IDENTITAS_BAWAAN.namaRW),
    wilayah: kontenNilai(KONTEN.IDENTITAS, "wilayah", IDENTITAS_BAWAAN.wilayah)
  });

  /* Menu tambahan yang hanya muncul untuk orang tertentu. */
  const daftarMenu = $derived([
    ...MENU,
    ...(pengurus()
      ? [{ label: sesi.peran === "petugas" ? "Dashboard Petugas" : "Dashboard Admin", alamat: "/kelola" }]
      : sesi.pengguna
        ? [{ label: "Dashboard Warga", alamat: "/akun" }]
        : [])
  ]);

  /* Beranda tetap menjadi acuan visual. Halaman lain memakai markup navbar
     yang sama; penyamaan tampilannya dilakukan lewat CSS tanpa menimpa gaya
     khusus Beranda. */
  const menuRingkas = [
    { label: "Beranda", alamat: "/" },
    { label: "Profil", alamat: "/profil" },
    { label: "Layanan", alamat: "/layanan" },
    { label: "Berita", alamat: "/berita" },
    { label: "Transparansi", alamat: "/transparansi" },
    { label: "UMKM", alamat: "/umkm" },
    { label: "Kontak", alamat: "/kontak" }
  ];

  /* Menandai menu induk dari halaman yang sedang dibuka. */
  const induk = $derived.by(() => {
    const jalur = "/" + (rute.bagian[0] || "");
    for (const g of daftarMenu) {
      if (g.alamat === jalur) return g.label;
      if (g.isi && g.isi.some((x) => x[0] === jalur)) return g.label;
    }
    return null;
  });

  function bukaMenu(label) {
    menuTerbuka = menuTerbuka === label ? null : label;
  }

  function tutupSemua() {
    menuTerbuka = null;
    laciTerbuka = false;
  }

  function cari(e) {
    e.preventDefault();
    rute.cari = kataCari;
    pergi("/cari");
    tutupSemua();
  }

  /* Smart navbar hanya mengatur perilaku scroll, BUKAN gaya/posisi normal.
   * Dengan begitu navbar Beranda tidak pernah dipaksa mengikuti halaman lain.
   * - scroll turun -> navbar hilang;
   * - scroll naik -> navbar muncul;
   * - dekat bagian atas / menu terbuka -> selalu tampil. */
  function pantauGulir() {
    const sekarang = Math.max(window.scrollY || 0, 0);
    const selisih = sekarang - gulirTerakhir;

    if (laciTerbuka || menuTerbuka || sekarang <= 18) {
      navbarTersembunyi = false;
    } else if (selisih > 7 && sekarang > 96) {
      navbarTersembunyi = true;
    } else if (selisih < -5) {
      navbarTersembunyi = false;
    }

    gulirTerakhir = sekarang;
  }

  $effect(() => {
    rute.jalur;
    tutupSemua();
    navbarTersembunyi = false;
    gulirTerakhir = typeof window !== "undefined" ? window.scrollY : 0;
  });

  $effect(() => {
    if (laciTerbuka || menuTerbuka) navbarTersembunyi = false;
  });
</script>

<svelte:window
  onscroll={pantauGulir}
  onclick={(e) => {
    if (!e.target.closest(".menu-butir") && !e.target.closest(".burger")) tutupSemua();
  }}
  onkeydown={(e) => e.key === "Escape" && tutupSemua()}
/>

<header
  class="situs tanpa-cetak navbar-pintar"
  class:navbar-tersembunyi={navbarTersembunyi}
>
  <div class="wadah">
    <div class="situs-atas">
      <a class="merek merek-visual" href="#/" aria-label={ident.namaSitus}>
        <img class="merek-logo-ikon" src="https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/f2bd27c4-a085-4824-923f-410a06b0adb2.png" alt="" aria-hidden="true" />
        <span class="merek-teks">
          <strong>RW 02</strong>
          <b>SUKATANI</b>
          <small>GUYUB · MAJU · SEJAHTERA</small>
        </span>
      </a>

      <nav class="menu-utama menu-ringkas" aria-label="Menu utama">
        {#each menuRingkas as g}
          <div
            class="menu-butir"
            class:terpilih={rute.jalur === g.alamat || (g.alamat !== "/" && rute.jalur.startsWith(g.alamat))}
          >
            <a href="#{g.alamat}">{g.label}</a>
          </div>
        {/each}
      </nav>

      <form class="cari-kotak" role="search" onsubmit={cari}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.6-3.6" />
        </svg>
        <input
          type="search"
          bind:value={kataCari}
          placeholder="Cari informasi..."
          aria-label="Cari di situs ini"
        />
        <button type="submit">Cari</button>
      </form>

      <TombolAkun />
      <TombolTema />

      <button
        class="tombol-kecil burger"
        type="button"
        aria-expanded={laciTerbuka}
        onclick={(e) => {
          e.stopPropagation();
          laciTerbuka = !laciTerbuka;
          navbarTersembunyi = false;
        }}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        <span class="teks">Menu</span>
      </button>
    </div>

    {#if laciTerbuka}
      <div class="laci">
        <form class="cari-laci" role="search" onsubmit={cari}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.6-3.6" />
          </svg>
          <input
            type="search"
            bind:value={kataCari}
            placeholder="Cari informasi di situs..."
            aria-label="Cari di situs ini"
          />
          <button type="submit">Cari</button>
        </form>
        {#each daftarMenu as g}
          {#if g.alamat}
            <a href="#{g.alamat}">{g.label}</a>
          {:else}
            <div class="kelompok">{g.label}</div>
            {#each g.isi as it}
              <a href="#{it[0]}">{it[1]}</a>
            {/each}
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</header>

<style>
  /* Jangan memberi transform pada keadaan normal. Gaya normal (terutama
     translateX(-50%) navbar floating Beranda) harus tetap menjadi milik CSS
     halaman, bukan ditimpa komponen smart-scroll. */
  .navbar-pintar {
    transition:
      transform 220ms cubic-bezier(.22, .61, .36, 1),
      background-color .75s ease,
      border-color .75s ease,
      color .75s ease,
      box-shadow .3s ease;
    will-change: transform;
  }

  .navbar-pintar.navbar-tersembunyi {
    transform: translate3d(0, calc(-100% - 12px), 0);
    pointer-events: none;
  }

  /* Beranda desktop memang dipusatkan dengan left:50% + translateX(-50%).
     Saat disembunyikan koordinat X itu harus tetap dipertahankan. */
  :global(body:has(.beranda-hero)) .navbar-pintar.navbar-tersembunyi {
    transform: translate3d(-50%, calc(-100% - 28px), 0);
  }

  /* Di HP header Beranda dan halaman lain sama-sama full width. Rule mobile
     lama memakai transform:none!important, jadi state sembunyi perlu menang
     secara eksplisit agar fitur scroll tetap bekerja. */
  @media (max-width: 680px) {
    .navbar-pintar.navbar-tersembunyi,
    :global(body:has(.beranda-hero)) .navbar-pintar.navbar-tersembunyi {
      transform: translate3d(0, calc(-100% - 10px), 0) !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .navbar-pintar {
      transition: none;
    }
  }
</style>
