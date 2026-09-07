<script>
  import { sesi, namaPeran } from "../../keadaan/sesi.svelte.js";
  import { rute } from "../../keadaan/rute.svelte.js";
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

  const TAB = [
    ["kiriman", "Kiriman warga", TabKiriman],
    ["beranda", "Beranda", TabBeranda],
    ["terbit", "Berita & galeri", TabTerbit],
    ["angka", "Kas & program", TabAngka],
    ["profil", "Profil & katalog", TabProfil],
    ["layanan", "Layanan & fasilitas", TabLayanan],
    ["lain", "Tautan & polling", TabLain],
    ["berkas", "Dokumen & video", TabBerkas],
    ["laporan", "Laporan", TabLaporan],
    ["tampilan", "Tampilan situs", TabTampilan],
    ["orang", "Warga & pengurus", TabOrang]
  ];

  /* Tab bisa dituju langsung lewat alamat, misalnya #/kelola/terbit.
     Dipakai tombol pada keadaan kosong di halaman warga: pengurus yang
     melihat "belum ada pengumuman" bisa langsung mendarat di tab yang
     mengisinya, tanpa menebak tab mana yang benar.

     Alamat yang tidak dikenali jatuh ke tab pertama, bukan layar kosong. */
  const dariAlamat = $derived(
    TAB.some((t) => t[0] === rute.bagian[1]) ? rute.bagian[1] : "kiriman"
  );
  let dipilih = $state("");
  const aktif = $derived(dipilih || dariAlamat);
  const Terpilih = $derived((TAB.find((t) => t[0] === aktif) || TAB[0])[2]);
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Kelola</span></nav>
<div class="kepala-halaman">
  <p class="alis">Pengurus</p>
  <h1>Kelola situs warga</h1>
  <p>Semua yang tampil di situs diisi dari sini. Perubahan langsung terlihat warga.</p>
</div>

  <div class="catatan" style="margin-bottom:22px">
    <b>Masuk sebagai {namaPeran()}.</b> {sesi.pengguna.email}.
    Anda punya akses penuh atas seluruh data, isi situs, dan daftar pengurus.
  </div>

  <div class="pilihan-baris">
    {#each TAB as t}
      <button class="pilihan" type="button" aria-pressed={aktif === t[0]} onclick={() => (dipilih = t[0])}>{t[1]}</button>
    {/each}
  </div>

  <Terpilih />
