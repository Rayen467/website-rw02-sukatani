<script>
  import { KOLEKSI } from "../inti/nama.js";
  import { isi, muatKoleksi } from "../keadaan/isi.svelte.js";
  import { beriTahu } from "../keadaan/pesan.svelte.js";
  import { sesi } from "../keadaan/sesi.svelte.js";
  import { KATEGORI_PENGADUAN } from "../inti/bawaan.js";
  import { nomorAntrean, simpanan } from "../inti/peramban.js";
  import { kirimWarga, tambahIsi } from "../sumber/data.js";
  import { pesanRamah } from "../sumber/firebase.js";
  import Lencana from "../komponen/Lencana.svelte";

  let saring = $state("all");
  let form = $state({ kategori: KATEGORI_PENGADUAN[0], lokasi: "", isi: "", nama: "", wa: "" });
  let mengirim = $state(false);

  const semua = $derived(isi.pengaduan || []);
  const daftar = $derived(saring === "all" ? semua : semua.filter((p) => p.status === saring));
  const tiketSaya = $derived(simpanan.baca("aduan-saya"));

  async function kirim(e) {
    e.preventDefault();
    mengirim = true;
    const tiket = nomorAntrean("ADU");
    try {
      await kirimWarga(KOLEKSI.PENGADUAN, {
        tiket, kategori: form.kategori, lokasi: form.lokasi, isi: form.isi, catatan: ""
      });
      if (form.nama || form.wa) {
        await tambahIsi(KOLEKSI.PENGADUAN_KONTAK, { tiket, nama: form.nama, wa: form.wa, uid: sesi.pengguna ? sesi.pengguna.uid : "" });
      }
      simpanan.tulis("aduan-saya", tiket);
      beriTahu("Laporan terkirim. Nomor tiket " + tiket + ".");
      form = { kategori: KATEGORI_PENGADUAN[0], lokasi: "", isi: "", nama: "", wa: "" };
      muatKoleksi(KOLEKSI.PENGADUAN);
    } catch (err) {
      beriTahu(pesanRamah(err));
    }
    mengirim = false;
  }
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Pengaduan dan Aspirasi</span></nav>
<div class="kepala-halaman">
  <p class="alis">Layanan warga</p>
  <h1>Pengaduan dan aspirasi</h1>
  <p>Sampaikan keluhan atau usulan, lalu pantau statusnya. Setiap laporan mendapat nomor tiket dan tercatat terbuka agar warga tahu tindak lanjutnya.</p>
</div>

{#if tiketSaya}
  <div class="catatan" style="margin-bottom:22px">
    <b>Laporan Anda tercatat.</b> Nomor tiket <b class="mono">{tiketSaya}</b>.
    Simpan nomor ini untuk menanyakan perkembangannya kepada pengurus.
  </div>
{/if}

<section class="blok">
  <div class="kepala-bagian"><h2>Laporan yang masuk</h2></div>
  <div class="pilihan-baris">
    {#each [["all", "Semua"], ["baru", "Diterima"], ["proses", "Diproses"], ["selesai", "Selesai"]] as f}
      <button class="pilihan" type="button" aria-pressed={saring === f[0]} onclick={() => (saring = f[0])}>{f[1]}</button>
    {/each}
    <span class="jumlah-kecil">{daftar.length} dari {semua.length} laporan</span>
  </div>

  {#if daftar.length}
    <div class="tabel-bungkus">
      <table class="data">
        <thead><tr><th>Nomor tiket</th><th>Kategori</th><th>Isi laporan</th><th>Status</th></tr></thead>
        <tbody>
          {#each daftar as p}
            <tr>
              <td><b class="mono" style="font-size:12.5px">{p.tiket || p.id}</b></td>
              <td>{p.kategori}</td>
              <td>
                {p.isi}
                {#if p.catatan}<br /><span style="font-size:12.5px;color:var(--tinta-3)">{p.catatan}</span>{/if}
              </td>
              <td><Lencana status={p.status} /></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <p class="kosong">{semua.length ? "Tidak ada laporan pada status ini." : "Belum ada laporan yang masuk."}</p>
  {/if}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Sampaikan laporan baru</h2></div>
  <form class="isian-borang" onsubmit={kirim}>
    <div class="isian"><label for="a-kat">Kategori</label><select id="a-kat" bind:value={form.kategori}>{#each KATEGORI_PENGADUAN as k}<option>{k}</option>{/each}</select></div>
    <div class="isian"><label for="a-lokasi">Lokasi kejadian</label><input id="a-lokasi" bind:value={form.lokasi} placeholder="Blok, nomor rumah, atau patokan terdekat" /></div>
    <div class="isian"><label for="a-isi">Isi laporan</label><textarea id="a-isi" bind:value={form.isi} required placeholder="Jelaskan singkat apa yang terjadi dan sejak kapan."></textarea></div>
    <div class="isian">
      <label for="a-nama">Nama pelapor</label>
      <input id="a-nama" bind:value={form.nama} />
      <span class="petunjuk">Boleh dikosongkan bila ingin melapor tanpa nama. Laporan tanpa nama tetap ditindaklanjuti, tetapi pengurus tidak bisa mengabari hasilnya.</span>
    </div>
    <div class="isian"><label for="a-wa">Nomor WhatsApp</label><input id="a-wa" bind:value={form.wa} inputmode="tel" /></div>
    <div><button class="tombol utama" type="submit" disabled={mengirim}>{mengirim ? "Mengirim..." : "Kirim laporan"}</button></div>
    <p class="catatan-borang">Nama dan nomor pelapor disimpan terpisah dari isi laporan, dan tidak ikut terbaca warga lain di daftar di atas.</p>
  </form>
</section>
