<script>
  import { KOLEKSI } from "../inti/nama.js";
  import { beriTahu } from "../keadaan/pesan.svelte.js";
  import { sesi } from "../keadaan/sesi.svelte.js";
  import { JENIS_USAHA } from "../inti/bawaan.js";
  import { kirimWarga } from "../sumber/data.js";
  import { pesanRamah } from "../sumber/firebase.js";
  import { pergi } from "../keadaan/rute.svelte.js";

  let form = $state({ nama: "", pemilik: "", jenis: JENIS_USAHA[0].label, produk: "", wa: "", alamat: "" });
  let mengirim = $state(false);

  async function kirim(e) {
    e.preventDefault();
    if (!sesi.pengguna) { beriTahu("Masuk dulu supaya pendaftaran bisa Anda lacak sendiri."); pergi("/masuk"); return; }
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
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><a href="#/umkm">Direktori UMKM</a><span>&rsaquo;</span><span>Daftarkan Usaha</span></nav>
<div class="kepala-halaman">
  <p class="alis">Untuk pemilik usaha</p>
  <h1>Daftarkan usaha warga</h1>
  <p>Isi keterangan usaha Anda agar masuk direktori. Pendaftaran gratis dan keterangannya diperiksa pengurus lebih dulu.</p>
</div>

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
