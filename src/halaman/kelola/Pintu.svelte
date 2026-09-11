<script>
  /**
   * Pintu masuk halaman Kelola.
   *
   * KENAPA ADA BERKAS PERANTARA DI SINI
   *
   * Halaman Kelola beserta sebelas tabnya adalah bagian terbesar dari kode
   * situs ini, dan HANYA PENGURUS yang pernah membukanya. Sebelum ini
   * semuanya ikut dalam satu berkas dengan halaman warga, jadi setiap orang
   * yang cuma ingin membaca pengumuman tetap mengunduh seluruh panel
   * pengelolaan: borang kas, penyusun laporan, tabel warga, semuanya.
   *
   * Itu bukan soal kerapian. Sebagian besar warga membuka situs ini dari HP
   * dengan kuota terbatas dan jaringan yang tidak selalu baik. Kilobyte yang
   * tidak pernah mereka pakai tetap mereka bayar.
   *
   * Berkas ini memisahkannya. Yang bukan pengurus berhenti di sini dan
   * TIDAK PERNAH mengunduh kode Kelola sama sekali. Yang pengurus mengunduh
   * begitu halamannya dibuka, sekali, lalu tersimpan di singgahan peramban.
   *
   * Penjagaan sebenarnya tetap di server. Orang yang memaksa mengunduh
   * berkas ini pun tetap ditolak aturan Firestore pada setiap tulisan --
   * pemisahan di sini soal kuota warga, bukan soal keamanan.
   */
  import { sesi, pengurus } from "../../keadaan/sesi.svelte.js";
  import { siapkanAkun } from "../../sumber/akun.js";
  import { ambilPeran, simpanDokumen } from "../../sumber/data.js";
  import { KOLEKSI } from "../../inti/nama.js";
  import { PETUGAS_SIAP_PAKAI } from "../../inti/akses.js";

  /* Halaman ini pasti berurusan dengan akun, jadi pustaka masuk diminta
     sekarang tanpa ditunggu. Kalau penanda "pernah masuk" hilang -- data
     peramban dibersihkan, misalnya -- inilah yang memulihkan sesi lama.
     Lihat catatan di kepala src/sumber/akun.js. */
  siapkanAkun();

  let Kelola = $state(null);
  let gagal = $state(false);
  let akunPetugasDisiapkan = false;

  /**
   * Saat pengurus lama yang sudah sah membuka Dashboard Petugas, pastikan
   * akun operasional bersama sudah terdaftar pada koleksi pengurus.
   *
   * Ini sengaja dilakukan dari sesi pengurus yang sudah berwenang. Akun baru
   * tidak bisa mengangkat dirinya sendiri menjadi petugas, dan kata sandi
   * tetap hanya diketahui Firebase Authentication.
   */
  $effect(() => {
    if (!pengurus() || akunPetugasDisiapkan) return;
    akunPetugasDisiapkan = true;

    (async () => {
      try {
        const ada = await ambilPeran(PETUGAS_SIAP_PAKAI.email);
        if (ada) return;

        await simpanDokumen(
          KOLEKSI.PENGURUS,
          PETUGAS_SIAP_PAKAI.email,
          {
            nama: PETUGAS_SIAP_PAKAI.nama,
            jabatan: PETUGAS_SIAP_PAKAI.jabatan,
            peran: PETUGAS_SIAP_PAKAI.peran
          },
          false
        );
      } catch (err) {
        /* Dashboard tetap boleh dibuka walau penyiapan akun tambahan gagal.
           Membuka ulang Dashboard dari akun pengurus akan mencoba lagi. */
      }
    })();
  });

  $effect(() => {
    if (!pengurus() || Kelola) return;
    let batal = false;
    import("./Kelola.svelte")
      .then((m) => {
        if (!batal) Kelola = m.default;
      })
      .catch(() => {
        if (!batal) gagal = true;
      });
    return () => (batal = true);
  });
</script>

{#if !sesi.siap}
  <p class="catatan" role="status">Memeriksa sesi akun...</p>
{:else if !pengurus()}
  <nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Kelola</span></nav>
  <div class="kepala-halaman">
    <p class="alis">Pengurus</p>
    <h1>Kelola situs warga</h1>
  </div>
  <div class="kunci">
    <h3>Tidak tersedia</h3>
    <p>
      Halaman ini hanya untuk pengurus yang sudah masuk dengan akun terdaftar.
      {#if sesi.pengguna}
        Anda masuk sebagai {sesi.pengguna.email}, dan alamat itu belum terdaftar sebagai pengurus.
      {:else}
        Silakan masuk lebih dulu.
      {/if}
    </p>
    <div class="baris-tombol" style="margin-top:14px">
      <a class="tombol utama" href="#/">Kembali ke beranda</a>
      {#if !sesi.pengguna}<a class="tombol" href="#/masuk">Masuk</a>{/if}
    </div>
  </div>
{:else if gagal}
  <nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Kelola</span></nav>
  <div class="kunci">
    <h3>Halaman Kelola gagal dimuat</h3>
    <p>Periksa sambungan jaringan, lalu muat ulang halaman ini.</p>
  </div>
{:else if Kelola}
  <Kelola />
{:else}
  <p class="catatan" role="status">Membuka halaman Kelola...</p>
{/if}
