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
    <div class="admin-brand">
      <div class="admin-brand-mark" aria-hidden="true">RW</div>
      <div><strong>Portal Petugas RW 02</strong><span>Permai Sukatani · Back-office internal</span></div>
    </div>

    {#each GRUP as grup}
      <div class="admin-nav-group">
        <span class="admin-nav-label">{grup.label}</span>
        <div class="admin-nav-list">
          {#each grup.item as t}
            <a class="admin-nav-item" class:aktif={aktif === t[0]} aria-current={aktif === t[0] ? "page" : undefined} href={"#/" + pangkal + "/" + t[0]} title={t[2]}>
              <span class="admin-nav-icon" aria-hidden="true">{t[3]}</span>
              <span class="admin-nav-copy"><strong>{t[1]}</strong><small>{t[2]}</small></span>
            </a>
          {/each}
        </div>
      </div>
    {/each}

    <div class="admin-account">
      <span class="admin-account-label">Sesi aktif</span>
      <strong>{sesi.pengguna?.email || "-"}</strong>
      <span>{namaPeran()}</span>
      <button class="tombol" type="button" onclick={keluarPengurus}>Keluar</button>
    </div>
  </aside>

  <div class="admin-main">
    <header class="admin-topbar">
      <div class="admin-topbar-copy">
        <span class="admin-eyebrow">Portal Petugas · {namaPeran()}</span>
        <h1>{dipilih[1]}</h1>
        <p>{dipilih[2]}. Area ini khusus operasional internal dan terpisah dari tampilan situs warga.</p>
      </div>
      <div class="admin-topbar-actions">
        <a class="tombol" href="#/">Buka situs warga</a>
        <button class="tombol utama" type="button" onclick={() => muatPengurus()}>Segarkan data</button>
      </div>
    </header>

    {#if galatData.length}
      <div class="admin-alert" role="alert">
        <div aria-hidden="true">⚠</div>
        <div class="admin-alert-body">
          <strong>Data Petugas belum termuat lengkap.</strong>
          Server gagal membaca {galatData.map(([nama]) => nama).join(", ")}. Angka 0 pada modul terkait jangan dianggap sebagai data kosong sampai pemuatan berhasil.
          <div class="baris-tombol" style="margin-top:10px"><button class="tombol utama" type="button" onclick={() => muatPengurus()}>Coba muat ulang</button></div>
        </div>
      </div>
    {/if}

    <div class="admin-content" role="region" aria-label={dipilih[1]}>
      <Terpilih />
    </div>
  </div>
</div>
