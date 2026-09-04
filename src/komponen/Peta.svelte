<script>
  /**
   * Peta wilayah RW 02.
   *
   * TIGA LAPIS, DIPILIH BERURUTAN
   *
   *   1. Sematan Google My Maps, kalau pengurus mengisinya di Kelola.
   *      Peramban warga menampilkan peta Google yang sudah dikenal, lengkap
   *      dengan poligon yang digambar pengurus di sana.
   *   2. Kalau tidak ada, peta digambar sendiri: batas wilayah dari
   *      src/inti/batas.js di atas peta jalan OpenStreetMap.
   *   3. Kalau peta gagal dimuat sama sekali, tetap ada tombol membuka
   *      Google Maps di aplikasi.
   *
   * KENAPA LAPIS KEDUA ADA, PADAHAL SUDAH ADA SEMATAN
   * Sematan My Maps hidup di akun orang yang menggambarnya. Kalau akunnya
   * hilang atau petanya dihapus, batas wilayah lenyap dari situs tanpa ada
   * yang tahu penyebabnya. Titik-titik di batas.js milik situs sendiri.
   *
   * PETANYA DIPANGKAS KE BATAS WILAYAH, BUKAN MEMAKAI PERBESARAN TETAP
   * Wilayahnya cuma 206 x 218 meter. Perbesaran tetap membuat sebagian RW
   * sebelah ikut tampil dan warga bingung mana yang dimaksud. fitBounds
   * memangkasnya pas seluruh batas, apa pun ukuran layarnya -- inilah yang
   * membuat tampilannya sama benar di HP dan di laptop.
   *
   * LEAFLET DIMUAT SAAT DIBUTUHKAN, BUKAN DI AWAL
   * Pustakanya 40-an KB. Warga yang cuma membaca pengumuman tidak perlu
   * mengunduhnya, jadi impornya dinamis dan hanya jalan ketika komponen ini
   * benar-benar terpasang.
   */
  import { KONTEN } from "../inti/nama.js";
  import { kontenNilai } from "../keadaan/isi.svelte.js";
  import { KOORDINAT_BAWAAN } from "../inti/bawaan.js";
  import { sematanPeta, sematanSalah } from "../inti/peta.js";
  import { BATAS_RW, KOTAK_RW, LUAS_RW_HEKTAR, LEBAR_RW_M, TINGGI_RW_M } from "../inti/batas.js";

  let { perbesaran = 17 } = $props();

  const titik = $derived(kontenNilai(KONTEN.KONTAK, "koordinat", KOORDINAT_BAWAAN));
  const batasMentah = $derived(kontenNilai(KONTEN.KONTAK, "petaBatas", ""));
  const sematan = $derived(sematanPeta(batasMentah));
  const sematanKeliru = $derived(sematanSalah(batasMentah));

  let wadah = $state(null);
  let gagalMuat = $state(false);

  $effect(() => {
    /* Sematan Google menang; petanya sendiri tidak perlu digambar. */
    if (sematan || !wadah) return;

    let peta = null;
    let pengamat = null;
    let batal = false;

    (async () => {
      try {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");
        if (batal || !wadah) return;

        peta = L.map(wadah, { scrollWheelZoom: false, attributionControl: true });

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(peta);

        L.polygon(BATAS_RW, {
          color: "#e03131",
          weight: 3,
          opacity: 0.95,
          fillColor: "#e03131",
          fillOpacity: 0.12
        }).addTo(peta);

        /* Inilah pemangkasannya: peta menyesuaikan diri ke batas wilayah,
           bukan sebaliknya. Sedikit sisa ruang supaya garisnya tidak
           menempel persis di tepi kotak. */
        peta.fitBounds(KOTAK_RW, { padding: [18, 18] });

        /* Leaflet mengukur wadahnya sekali, saat dipasang. Kalau saat itu
           lebarnya masih nol -- tab yang belum tampil, tata letak yang
           belum selesai, jendela yang baru dibuka -- petanya tergambar
           salah dan TIDAK membetulkan diri sendiri waktu wadahnya
           akhirnya punya ukuran. Yang tampil cuma sepotong garis, tanpa
           galat apa pun di konsol.

           Pengamat ini mengukur ulang setiap kali wadahnya berubah ukuran,
           jadi memutar layar HP atau membuka peta dari tab tersembunyi
           tetap menghasilkan tampilan yang benar. */
        pengamat = new ResizeObserver(() => {
          if (!peta) return;
          peta.invalidateSize();
          peta.fitBounds(KOTAK_RW, { padding: [18, 18] });
        });
        pengamat.observe(wadah);
      } catch (err) {
        gagalMuat = true;
      }
    })();

    return () => {
      batal = true;
      if (pengamat) pengamat.disconnect();
      if (peta) peta.remove();
    };
  });
</script>

<div class="petabox">
  {#if sematan}
    <iframe
      src={sematan}
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      title="Peta batas wilayah RW 02"
    ></iframe>
  {:else if gagalMuat}
    <div class="peta-gagal">
      Peta tidak dapat dimuat. Gunakan tombol di bawah untuk membukanya di aplikasi peta.
    </div>
  {:else}
    <div class="peta-sendiri" bind:this={wadah}></div>
  {/if}
</div>

{#if !gagalMuat}
  <p class="keterangan-batas">
    <span class="contoh-garis" aria-hidden="true"></span>
    Garis merah adalah batas wilayah RW 02. Rumah di luar garis termasuk RW lain.
  </p>
{/if}

<div class="baris-tombol" style="margin-top:12px">
  <a
    class="tombol utama"
    href="https://www.google.com/maps/search/?api=1&query={encodeURIComponent(titik)}"
    target="_blank"
    rel="noopener noreferrer">Buka di Google Maps</a
  >
  <a
    class="tombol"
    href="https://www.google.com/maps/dir/?api=1&destination={encodeURIComponent(titik)}"
    target="_blank"
    rel="noopener noreferrer">Petunjuk arah ke sini</a
  >
</div>

<p class="verifikasi">
  Wilayah RW 02 seluas kurang lebih <b>{LUAS_RW_HEKTAR} hektar</b>,
  sekitar {LEBAR_RW_M} meter dari barat ke timur dan {TINGGI_RW_M} meter dari utara ke selatan,
  meliputi RT 01 sampai RT 04.
  Batasnya digambar pengurus RW 02 mengikuti garis jalan, dan
  <b>bukan batas resmi terbitan pemerintah</b> &mdash; data batas RW memang tidak tersedia
  di peta mana pun. Bila letak sebuah rumah meragukan, tanyakan kepada Ketua RT setempat.
  {#if sematanKeliru}
    <br />Catatan untuk pengurus: tautan peta yang tersimpan tidak dikenali, jadi yang
    tampil adalah peta bawaan situs. Perbaiki lewat halaman Kelola.
  {/if}
</p>

<style>
  .keterangan-batas {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 10px 0 0;
    font-size: 13px;
    color: var(--tinta-2);
  }
  .contoh-garis {
    flex: none;
    width: 26px;
    height: 4px;
    border-radius: 2px;
    background: #e03131;
  }
</style>
