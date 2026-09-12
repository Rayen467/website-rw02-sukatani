<script>
  import { sesi, namaPeran } from "../../keadaan/sesi.svelte.js";
  import { galatMuatPengurus, muatPengurus } from "../../keadaan/isi.svelte.js";
  import { rute, pergi } from "../../keadaan/rute.svelte.js";
  import { keluar } from "../../sumber/akun.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import TabDashboard from "./TabDashboard.svelte";
  import TabKiriman from "./TabKiriman.svelte";
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

  const GRUP = [
    { label: "Ringkasan", item: [["dashboard", "Ikhtisar", "Situasi layanan & data", "01", TabDashboard]] },
    { label: "Operasional", item: [
      ["kiriman", "Layanan masuk", "Surat, aduan, reservasi", "02", TabKiriman],
      ["orang", "Warga & pengurus", "Verifikasi & akses akun", "03", TabOrang],
      ["layanan", "Layanan & fasilitas", "Jenis layanan & jadwal", "04", TabLayanan]
    ]},
    { label: "Publikasi", item: [
      ["terbit", "Berita & galeri", "Informasi publik", "05", TabTerbit],
      ["beranda", "Beranda", "Konten halaman depan", "06", TabBeranda],
      ["berkas", "Dokumen & video", "Arsip publik", "07", TabBerkas]
    ]},
    { label: "Data & transparansi", item: [
      ["angka", "Kas & program", "Keuangan dan program kerja", "08", TabAngka],
      ["laporan", "Laporan", "Rekap siap cetak", "09", TabLaporan],
      ["profil", "Profil & katalog", "Identitas dan kelembagaan", "10", TabProfil]
    ]},
    { label: "Pengaturan", item: [
      ["lain", "Tautan & polling", "Partisipasi warga", "11", TabLain],
      ["tampilan", "Tampilan situs", "Warna & tipografi", "12", TabTampilan]
    ]}
  ];

  const TAB = GRUP.flatMap((g) => g.item);
  const pangkal = $derived(rute.bagian[0] === "petugas" ? "petugas" : "kelola");
  const dariAlamat = $derived(TAB.some((t) => t[0] === rute.bagian[1]) ? rute.bagian[1] : "dashboard");
  const aktif = $derived(dariAlamat);
  const dipilih = $derived(TAB.find((t) => t[0] === aktif) || TAB[0]);
  const Terpilih = $derived(dipilih[4]);
  const galatData = $derived(Object.entries(galatMuatPengurus));

  async function keluarPengurus() {
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
        <img class="admin-brand-logo" src="./visual/brand/logo-icon.webp" alt="" />
      </span>
      <span class="admin-brand-copy">
        <strong>Portal Petugas</strong>
        <b>RW 02 Sukatani</b>
        <small>Back-office internal</small>
      </span>
    </a>

    <div class="admin-nav-scroll">
      {#each GRUP as grup}
        <div class="admin-nav-group">
          <span class="admin-nav-label">{grup.label}</span>
          <div class="admin-nav-list">
            {#each grup.item as t}
              <a class="admin-nav-item" class:aktif={aktif === t[0]} aria-current={aktif === t[0] ? "page" : undefined} href={"#/" + pangkal + "/" + t[0]} title={t[2]}>
                <span class="admin-nav-icon" aria-hidden="true">{t[3]}</span>
                <span class="admin-nav-copy"><strong>{t[1]}</strong><small>{t[2]}</small></span>
                <span class="admin-nav-arrow" aria-hidden="true">›</span>
              </a>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <div class="admin-account">
      <span class="admin-account-avatar" aria-hidden="true">{(namaPeran() || "P").slice(0, 1).toUpperCase()}</span>
      <span class="admin-account-copy">
        <small>Sesi aktif</small>
        <strong>{sesi.pengguna?.email || "-"}</strong>
        <span>{namaPeran()}</span>
      </span>
      <button class="admin-account-exit" type="button" onclick={keluarPengurus} title="Keluar dari akun">Keluar</button>
    </div>
  </aside>

  <div class="admin-main">
    <header class="admin-topbar">
      <div class="admin-topbar-copy">
        <span class="admin-eyebrow"><span class="admin-live-dot"></span> Portal Petugas <i>/</i> {namaPeran()}</span>
        <div class="admin-title-row">
          <h1>{dipilih[1]}</h1>
          <span class="admin-internal-pill">Internal</span>
        </div>
        <p>{dipilih[2]}. Workspace operasional ini terpisah dari tampilan publik warga.</p>
      </div>
      <div class="admin-topbar-actions">
        <a class="tombol admin-ghost-button" href="#/">
          <span aria-hidden="true">↗</span>
          Buka situs warga
        </a>
        <button class="tombol utama admin-refresh-button" type="button" onclick={() => muatPengurus()}>
          <span aria-hidden="true">↻</span>
          Segarkan data
        </button>
      </div>
    </header>

    {#if galatData.length}
      <div class="admin-alert" role="alert">
        <div class="admin-alert-icon" aria-hidden="true">!</div>
        <div class="admin-alert-body">
          <strong>Data Petugas belum termuat lengkap.</strong>
          <span>Server gagal membaca {galatData.map(([nama]) => nama).join(", ")}. Angka 0 pada modul terkait belum dapat dianggap sebagai data kosong.</span>
          <div class="baris-tombol" style="margin-top:10px"><button class="tombol utama" type="button" onclick={() => muatPengurus()}>Coba muat ulang</button></div>
        </div>
      </div>
    {/if}

    <div class="admin-content" role="region" aria-label={dipilih[1]}>
      <Terpilih />
    </div>
  </div>
</div>
