<script>
  import { KOLEKSI } from "../inti/nama.js";
  import { beriTahu } from "../keadaan/pesan.svelte.js";
  import { sesi } from "../keadaan/sesi.svelte.js";
  import { JENIS_USAHA } from "../inti/bawaan.js";
  import { kirimWarga } from "../sumber/data.js";
  import { pesanRamah } from "../sumber/firebase.js";
  import { pergi } from "../keadaan/rute.svelte.js";
  import { kirimUlangVerifikasi, periksaVerifikasi } from "../sumber/akun.js";

  let form = $state({ nama: "", pemilik: "", jenis: JENIS_USAHA[0].label, produk: "", wa: "", alamat: "" });
  let mengirim = $state(false);
  let sibukVerifikasi = $state(false);

  async function kirim(e) {
    e.preventDefault();
    if (!sesi.pengguna) {
      beriTahu("Masuk dulu supaya pendaftaran bisa Anda lacak sendiri.");
      pergi("/masuk");
      return;
    }
    if (!sesi.terverifikasi) {
      beriTahu("Email akun belum diverifikasi. Verifikasi dulu sebelum mengirim pendaftaran UMKM.");
      pergi("/akun");
      return;
    }
    mengirim = true;
    try {
      await kirimWarga(KOLEKSI.USAHA_BARU, form);
      beriTahu("Pendaftaran terkirim. Pengurus akan meninjau sebelum ditampilkan.");
      form = { nama: "", pemilik: "", jenis: JENIS_USAHA[0].label, produk: "", wa: "", alamat: "" };
    } catch (err) {
      beriTahu(pesanRamah(err));
    }
    mengirim = false;
  }

  async function kirimVerifikasi() {
    if (sibukVerifikasi) return;
    sibukVerifikasi = true;
    try {
      await kirimUlangVerifikasi();
      beriTahu("Tautan verifikasi dikirim. Cek inbox Gmail, lalu kembali ke halaman ini.");
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      sibukVerifikasi = false;
    }
  }

  async function cekVerifikasi() {
    if (sibukVerifikasi) return;
    sibukVerifikasi = true;
    try {
      const sudah = await periksaVerifikasi();
      beriTahu(sudah ? "Email sudah terverifikasi. Pendaftaran UMKM sekarang bisa dikirim." : "Email belum terverifikasi.");
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      sibukVerifikasi = false;
    }
  }
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><a href="#/umkm">Direktori UMKM</a><span>&rsaquo;</span><span>Daftarkan Usaha</span></nav>
<div class="kepala-halaman">
  <p class="alis">Untuk pemilik usaha</p>
  <h1>Daftarkan usaha warga</h1>
  <p>Isi keterangan usaha Anda agar masuk direktori. Pendaftaran gratis dan keterangannya diperiksa pengurus lebih dulu.</p>
</div>

{#if !sesi.siap}
  <p class="catatan" role="status">Memeriksa sesi akun...</p>
{:else if !sesi.pengguna}
  <div class="kunci">
    <h3>Masuk dulu</h3>
    <p>Pendaftaran UMKM perlu akun supaya statusnya bisa dilacak.</p>
    <button class="tombol utama" type="button" onclick={() => pergi("/masuk")}>Masuk / Daftar</button>
  </div>
{:else if !sesi.terverifikasi}
  <div class="catatan awas">
    <b>Email akun belum diverifikasi.</b>
    <p>Firestore menolak pendaftaran UMKM sampai email <b>{sesi.pengguna.email}</b> dipastikan.</p>
    <div class="baris-tombol">
      <button class="tombol utama" type="button" onclick={kirimVerifikasi} disabled={sibukVerifikasi}>
        {sibukVerifikasi ? "Memproses..." : "Kirim email verifikasi"}
      </button>
      <button class="tombol" type="button" onclick={cekVerifikasi} disabled={sibukVerifikasi}>
        Saya sudah verifikasi
      </button>
    </div>
  </div>
{:else}
  <form class="isian-borang" onsubmit={kirim}>
    <div class="isian"><label for="u-nama">Nama usaha</label><input id="u-nama" bind:value={form.nama} required /></div>
    <div class="isian"><label for="u-pemilik">Nama pemilik</label><input id="u-pemilik" bind:value={form.pemilik} required /></div>
    <div class="isian"><label for="u-jenis">Jenis usaha</label><select id="u-jenis" bind:value={form.jenis}>{#each JENIS_USAHA as j}<option>{j.label}</option>{/each}</select></div>
    <div class="isian"><label for="u-produk">Produk atau layanan utama</label><textarea id="u-produk" bind:value={form.produk} placeholder="Sebutkan produk utama beserta kisaran harganya."></textarea></div>
    <div class="isian">
      <label for="u-wa">Nomor WhatsApp usaha</label>
      <input id="u-wa" bind:value={form.wa} inputmode="tel" />
      <span class="petunjuk">Nomor hanya ditampilkan di situs bila Anda mengizinkannya.</span>
    </div>
    <div class="isian"><label for="u-alamat">Alamat di dalam kawasan</label><input id="u-alamat" bind:value={form.alamat} placeholder="Blok dan nomor rumah" /></div>
    <div><button class="tombol utama" type="submit" disabled={mengirim}>{mengirim ? "Mengirim..." : "Kirim pendaftaran"}</button></div>
  </form>
{/if}
