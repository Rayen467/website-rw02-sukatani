<script>
  import { sesi, namaPeran } from "../../keadaan/sesi.svelte.js";
  import { isi, galatMuatPengurus, muatPengurus } from "../../keadaan/isi.svelte.js";
  import { rute, pergi } from "../../keadaan/rute.svelte.js";
  import { keluar } from "../../sumber/akun.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import UmkmProHub from "../../komponen/kelola/UmkmProHub.svelte";
  import TabDashboard from "./TabDashboard.svelte";
  import TabKiriman from "./TabKiriman.svelte";
  import TabCrud from "./TabCrud.svelte";
  import TabUmkm from "./TabUmkm.svelte";
  import TabBeranda from "./TabBeranda.svelte";
  import TabLaporan from "./TabLaporan.svelte";
  import TabTerbit from "./TabTerbit.svelte";
  import TabAngka from "./TabAngka.svelte";
  import TabProfil from "./TabProfil.svelte";
  import TabLayanan from "./TabLayanan.svelte";
  import TabLain from "./TabLain.svelte";
  import TabBerkas from "./TabBerkas.svelte";
  import TabTampilan from "./TabTampilan.svelte";
  import TabOrang from "./TabOrang.svelte";

  const IKON = {
    dashboard: "⌂",
    crud: "✎",
    kiriman: "▤",
    orang: "♙",
    layanan: "▣",
    umkm: "▦",
    terbit: "▧",
    beranda: "◎",
    berkas: "□",
    angka: "◇",
    laporan: "▥",
    profil: "◉",
    lain: "◌",
    tampilan: "⚙"
  };

  const GRUP = [
    { label: "Menu utama", item: [
      ["dashboard", "Ikhtisar", "Situasi layanan & data", "01", TabDashboard],
      ["crud", "Pusat Data", "Kelola seluruh data website dari satu tempat", "02", TabCrud]
    ]},
    { label: "UMKM", item: [
      ["umkm", "Pusat UMKM", "Profil publik, katalog, legalitas & pendampingan", "05", TabUmkm]
    ]},
    { label: "Operasional", item: [
      ["kiriman", "Layanan masuk", "Surat, aduan, reservasi", "03", TabKiriman],
      ["orang", "Warga & pengurus", "Verifikasi & akses akun", "04", TabOrang],
      ["layanan", "Layanan & fasilitas", "Jenis layanan & jadwal", "06", TabLayanan]
    ]},
    { label: "Publikasi", item: [
      ["terbit", "Berita & galeri", "Informasi publik", "07", TabTerbit],
      ["beranda", "Beranda", "Konten halaman depan", "08", TabBeranda],
      ["berkas", "Dokumen & video", "Arsip publik", "09", TabBerkas]
    ]},
    { label: "Data & transparansi", item: [
      ["angka", "Kas & program", "Keuangan dan program kerja", "10", TabAngka],
      ["laporan", "Laporan", "Rekap siap cetak", "11", TabLaporan],
      ["profil", "Profil & katalog", "Identitas dan kelembagaan", "12", TabProfil]
    ]},
    { label: "Lainnya", item: [
      ["lain", "Tautan & polling", "Partisipasi warga", "13", TabLain],
      ["tampilan", "Pengaturan tampilan", "Warna & tipografi", "14", TabTampilan]
    ]}
  ];

  const TAB = GRUP.flatMap((g) => g.item);
  const NAV_HP = [
    ["dashboard", "Ikhtisar"],
    ["kiriman", "Layanan"],
    ["umkm", "UMKM"],
    ["orang", "Warga"]
  ];
  const pangkal = $derived(rute.bagian[0] === "petugas" ? "petugas" : "kelola");
  const dariAlamat = $derived(TAB.some((t) => t[0] === rute.bagian[1]) ? rute.bagian[1] : "dashboard");
  const aktif = $derived(dariAlamat);
  const dipilih = $derived(TAB.find((t) => t[0] === aktif) || TAB[0]);
  const grupDipilih = $derived(GRUP.find((g) => g.item.some((t) => t[0] === aktif))?.label || "Portal Petugas");
  const Terpilih = $derived(dipilih[4]);
  const galatData = $derived(Object.entries(galatMuatPengurus));
  const daftarPengurus = $derived(Array.isArray(isi.pengurus) ? isi.pengurus : []);
  const pengurusTop = $derived(daftarPengurus.slice(0, 3));
  const sisaPengurus = $derived(Math.max(0, daftarPengurus.length - pengurusTop.length));
  const profilAkun = $derived(
    daftarPengurus.find((o) => String(o?.email || o?.id || "").toLowerCase() === String(sesi.pengguna?.email || "").toLowerCase()) || null
  );
  const namaAkun = $derived(profilAkun?.nama || sesi.pengguna?.displayName || "Petugas RW 02");
  const emailAkun = $derived(sesi.pengguna?.email || profilAkun?.email || "");

  let pencarian = $state("");
  let menuHpTerbuka = $state(false);

  function inisial(o) {
    const nama = String(o?.nama || o?.id || o?.email || "P").trim();
    return nama ? nama.slice(0, 1).toUpperCase() : "P";
  }

  function cariPortal(e) {
    e.preventDefault();
    const q = pencarian.trim().toLowerCase();
    if (!q) return;
    const tujuan = TAB.find((t) => `${t[1]} ${t[2]}`.toLowerCase().includes(q));
    if (!tujuan) {
      beriTahu("Menu tidak ditemukan. Coba kata seperti pusat data, layanan, warga, UMKM, legalitas, berita, kas, laporan, atau fasilitas.");
      return;
    }
    pencarian = "";
    menuHpTerbuka = false;
    pergi(`/${pangkal}/${tujuan[0]}`);
  }

  function bukaNotifikasi() {
    if (galatData.length) {
      beriTahu(`Ada ${galatData.length} sumber data yang perlu perhatian: ${galatData.map(([nama]) => nama).join(", ")}.`);
      return;
    }
    beriTahu("Tidak ada peringatan data. Semua sumber yang termuat dalam kondisi normal.");
  }

  async function keluarPengurus() {
    menuHpTerbuka = false;
    await keluar();
    beriTahu("Anda sudah keluar dari akun pengurus.");
    pergi("/");
  }
</script>

<nav class="remah" aria-label="Breadcrumb"><a href="#/">Beranda</a><span aria-hidden="true">›</span><span>Portal Petugas</span></nav>

<div class="admin-shell">
  <aside class="admin-sidebar" aria-label="Navigasi Portal Petugas">
    <a class="admin-brand" href="#/" aria-label="Buka situs warga RW 02 Sukatani">
      <span class="admin-brand-logo-wrap" aria-hidden="true">
        <img class="admin-brand-logo" src="https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/f2bd27c4-a085-4824-923f-410a06b0adb2.png" alt="" />
      </span>
      <span class="admin-brand-copy">
        <strong>Portal Petugas</strong>
        <b>RW 02 Sukatani</b>
        <small>Pengelolaan internal</small>
      </span>
    </a>

    <div class="admin-nav-scroll">
      {#each GRUP as grup}
        <div class="admin-nav-group">
          <span class="admin-nav-label">{grup.label}</span>
          <div class="admin-nav-list">
            {#each grup.item as t}
              <a class="admin-nav-item" class:aktif={aktif === t[0]} aria-current={aktif === t[0] ? "page" : undefined} href={"#/" + pangkal + "/" + t[0]} title={t[2]}>
                <span class="admin-nav-icon" aria-hidden="true">{IKON[t[0]] || t[3]}</span>
                <span class="admin-nav-copy"><strong>{t[1]}</strong></span>
                <span class="admin-nav-arrow" aria-hidden="true">›</span>
              </a>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <div class="admin-account">
      <span class="admin-account-avatar" aria-hidden="true">{namaAkun.slice(0, 1).toUpperCase()}</span>
      <span class="admin-account-copy">
        <strong title={namaAkun}>{namaAkun}</strong>
        <span>{namaPeran()} · RW 02</span>
        {#if emailAkun}<small title={emailAkun}>{emailAkun}</small>{/if}
      </span>
      <button class="admin-account-exit" type="button" onclick={keluarPengurus} title="Keluar dari akun" aria-label="Keluar dari akun">↪</button>
    </div>
  </aside>

  <div class="admin-main">
    <header class="admin-topbar">
      <div class="admin-topbar-copy">
        <span class="admin-topbar-kicker">{grupDipilih}</span>
        <div class="admin-title-row"><h1>{dipilih[1]}</h1></div>
        <p>{dipilih[2]}</p>
      </div>

      <form class="admin-top-search" onsubmit={cariPortal} role="search">
        <span aria-hidden="true">⌕</span>
        <input bind:value={pencarian} aria-label="Cari menu Portal Petugas" placeholder="Cari menu, data, atau layanan..." />
        <kbd>⌘ K</kbd>
      </form>

      <div class="admin-topbar-actions">
        <button class="admin-notification" type="button" onclick={bukaNotifikasi} title={galatData.length ? `${galatData.length} sumber data perlu perhatian` : "Tidak ada peringatan data"} aria-label="Notifikasi data">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
          {#if galatData.length}<i></i>{/if}
        </button>

        <div class="admin-team" aria-label="Petugas aktif">
          {#if pengurusTop.length}
            {#each pengurusTop as o}
              <span class="admin-team-avatar" title={o.nama || o.id || "Petugas"}>{inisial(o)}</span>
            {/each}
            {#if sisaPengurus}<span class="admin-team-more">+{sisaPengurus}</span>{/if}
          {:else}
            <span class="admin-team-avatar">{(namaPeran() || "P").slice(0, 1).toUpperCase()}</span>
          {/if}
        </div>

        <a class="tombol admin-ghost-button" href="#/">
          Buka situs warga <span aria-hidden="true">↗</span>
        </a>
        <button class="tombol utama admin-refresh-button" type="button" onclick={() => muatPengurus()}>
          <span aria-hidden="true">↻</span> Segarkan data
        </button>
      </div>
    </header>

    {#if galatData.length}
      <div class="admin-alert" role="alert">
        <div class="admin-alert-icon" aria-hidden="true">!</div>
        <div class="admin-alert-body">
          <strong>Data Petugas belum termuat lengkap.</strong>
          <span>Server gagal membaca {galatData.map(([nama]) => nama).join(", ")}. Angka pada modul terkait belum dapat dianggap sebagai data kosong.</span>
          <div class="baris-tombol"><button class="tombol utama" type="button" onclick={() => muatPengurus()}>Coba muat ulang</button></div>
        </div>
      </div>
    {/if}

    <div class="admin-content" role="region" aria-label={dipilih[1]}>
      {#if aktif === "umkm"}
        <UmkmProHub />
        <details class="admin-umkm-internal">
          <summary>Administrasi, legalitas & pendampingan UMKM</summary>
          <div><Terpilih /></div>
        </details>
      {:else}
        <Terpilih />
      {/if}
    </div>
  </div>

  <nav class="mobile-bottom-nav" aria-label="Navigasi utama Petugas">
    {#each NAV_HP as n}
      <a class="mobile-bottom-item" class:aktif={aktif === n[0]} aria-current={aktif === n[0] ? "page" : undefined} href={"#/" + pangkal + "/" + n[0]} onclick={() => (menuHpTerbuka = false)}>
        <span class="mobile-bottom-icon" aria-hidden="true">{IKON[n[0]]}</span>
        <span>{n[1]}</span>
      </a>
    {/each}
    <button class="mobile-bottom-item mobile-menu-trigger" class:aktif={menuHpTerbuka} type="button" aria-expanded={menuHpTerbuka} aria-label="Buka semua menu" onclick={() => (menuHpTerbuka = !menuHpTerbuka)}>
      <span class="mobile-bottom-icon" aria-hidden="true">☰</span>
      <span>Menu</span>
    </button>
  </nav>

  {#if menuHpTerbuka}
    <div class="mobile-menu-backdrop" role="presentation" onclick={(e) => { if (e.target === e.currentTarget) menuHpTerbuka = false; }}>
      <section class="mobile-menu-sheet" role="dialog" aria-modal="true" aria-label="Semua menu Portal Petugas">
        <div class="mobile-menu-handle" aria-hidden="true"></div>
        <header class="mobile-menu-head">
          <div>
            <small>Portal Petugas</small>
            <h2>Semua menu</h2>
          </div>
          <button type="button" aria-label="Tutup menu" onclick={() => (menuHpTerbuka = false)}>×</button>
        </header>

        <div class="mobile-menu-groups">
          {#each GRUP as grup}
            <section class="mobile-menu-group">
              <h3>{grup.label}</h3>
              <div class="mobile-menu-grid">
                {#each grup.item as t}
                  <a class="mobile-menu-card" class:aktif={aktif === t[0]} href={"#/" + pangkal + "/" + t[0]} onclick={() => (menuHpTerbuka = false)}>
                    <span class="mobile-menu-card-icon" aria-hidden="true">{IKON[t[0]] || t[3]}</span>
                    <span class="mobile-menu-card-copy"><strong>{t[1]}</strong><small>{t[2]}</small></span>
                  </a>
                {/each}
              </div>
            </section>
          {/each}
        </div>

        <div class="mobile-menu-actions">
          <a href="#/" onclick={() => (menuHpTerbuka = false)}>↗ Buka situs warga</a>
          <button type="button" onclick={keluarPengurus}>↪ Keluar akun</button>
        </div>
      </section>
    </div>
  {/if}
</div>

<style>
  .admin-umkm-internal{margin-top:14px;border:1px solid #dce7e3;border-radius:16px;background:#fff;overflow:hidden}.admin-umkm-internal>summary{padding:15px 18px;cursor:pointer;font-weight:850;color:#203a31;background:#f8fbfa}.admin-umkm-internal[open]>summary{border-bottom:1px solid #e4ece9}.admin-umkm-internal>div{padding:0 0 2px}
</style>