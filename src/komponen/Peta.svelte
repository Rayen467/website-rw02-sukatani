<script>
  /**
   * Peta wilayah RW 02.
   *
   * TIGA LAPIS, DIPILIH BERURUTAN
   *
   *   1. Sematan Google My Maps, kalau pengurus mengisinya di Kelola.
   *   2. Kalau tidak ada, peta digambar sendiri: batas wilayah dari
   *      src/inti/batas.js di atas citra satelit.
   *   3. Kalau peta gagal dimuat, tetap ada tombol membuka Google Maps.
   *
   * KENAPA SATELIT JADI TAMPILAN AWAL, BUKAN PETA JALAN
   * Perumahan di Rajeg belum banyak terpetakan di OpenStreetMap: jalan-jalan
   * di dalam kawasan sebagian besar belum ada garisnya, jadi peta jalannya
   * tampil hampir kosong dan warga tidak mengenali apa pun. Citra satelit
   * menampilkan atap rumah dan jalan yang sebenarnya, jadi warga bisa
   * mencari rumahnya sendiri. Peta jalan tetap disediakan lewat tombol
   * pindah lapisan, karena nama jalan cuma ada di sana.
   *
   * KENAPA BUKAN CITRA GOOGLE LANGSUNG
   * Menggambar poligon di atas peta Google butuh Google Maps JavaScript API,
   * yang mewajibkan kunci API dan akun bertagihan. Situs ini sengaja
   * dijaga tanpa biaya. Satu-satunya cara memakai citra Google tanpa kunci
   * adalah sematan My Maps -- itulah lapis pertama di atas.
   *
   * PETANYA DIPANGKAS KE BATAS, BUKAN MEMAKAI PERBESARAN TETAP
   * Wilayahnya cuma 206 x 218 meter. fitBounds memangkasnya pas seluruh
   * batas, apa pun ukuran layarnya.
   *
   * LEAFLET DIMUAT SAAT DIBUTUHKAN, BUKAN DI AWAL
   * Pustakanya 40-an KB. Warga yang cuma membaca pengumuman tidak perlu
   * mengunduhnya, jadi impornya dinamis.
   */
  import { KONTEN } from "../inti/nama.js";
  import { kontenNilai } from "../keadaan/isi.svelte.js";
  import { KOORDINAT_BAWAAN } from "../inti/bawaan.js";
  import { sematanPeta, sematanSalah } from "../inti/peta.js";
  import { BATAS_RW, KOTAK_RW, LUAS_RW_HEKTAR, LEBAR_RW_M, TINGGI_RW_M } from "../inti/batas.js";

  const titik = $derived(kontenNilai(KONTEN.KONTAK, "koordinat", KOORDINAT_BAWAAN));
  const namaTitik = $derived(kontenNilai(KONTEN.KONTAK, "namaTitik", ""));
  const batasMentah = $derived(kontenNilai(KONTEN.KONTAK, "petaBatas", ""));
  const sematan = $derived(sematanPeta(batasMentah));
  const sematanKeliru = $derived(sematanSalah(batasMentah));

  let wadah = $state(null);
  let gagalMuat = $state(false);

  /** Mengubah "-6.13,106.49" jadi [lintang, bujur], atau null bila tidak sah. */
  function uraiTitik(teks) {
    const bagian = String(teks || "").split(",").map((x) => Number(x.trim()));
    if (bagian.length !== 2 || bagian.some((n) => !isFinite(n))) return null;
    const [lintang, bujur] = bagian;
    if (Math.abs(lintang) > 90 || Math.abs(bujur) > 180) return null;
    return [lintang, bujur];
  }

  $effect(() => {
    if (sematan || !wadah) return;

    const penanda = uraiTitik(titik);
    let peta = null;
    let pengamat = null;
    let batal = false;

    (async () => {
      try {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");
        if (batal || !wadah) return;

        peta = L.map(wadah, { scrollWheelZoom: false });

        /* Citra satelit dari Esri. Bebas dipakai tanpa kunci API asalkan
           sumbernya dicantumkan, dan cakupannya di Indonesia jauh lebih
           baik daripada peta jalan sukarela. */
        const satelit = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          { maxZoom: 19, attribution: "Citra &copy; Esri" }
        );

        const jalan = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });

        satelit.addTo(peta);
        L.control.layers({ "Citra satelit": satelit, "Peta jalan": jalan }, null,
          { collapsed: false }).addTo(peta);

        /* Garis batas dibuat putih supaya tetap terbaca di atas citra
           satelit yang gelap dan ramai. Merah di atas atap cokelat hilang. */
        L.polygon(BATAS_RW, {
          color: "#ffffff",
          weight: 4,
          opacity: 1,
          fillColor: "#e03131",
          fillOpacity: 0.14
        }).addTo(peta);

        /* Garis merah tipis di dalam garis putih: gabungan keduanya terbaca
           baik di citra terang maupun gelap. */
        L.polygon(BATAS_RW, {
          color: "#e03131",
          weight: 2,
          opacity: 1,
          fill: false
        }).addTo(peta);

        if (penanda) {
          L.circleMarker(penanda, {
            radius: 7,
            color: "#ffffff",
            weight: 3,
            fillColor: "#1971c2",
            fillOpacity: 1
          })
            .addTo(peta)
            .bindTooltip(namaTitik || "Titik utama RW 02", { permanent: false });
        }

        peta.fitBounds(KOTAK_RW, { padding: [18, 18] });

        /* Leaflet mengukur wadahnya sekali, saat dipasang. Kalau saat itu
           lebarnya masih nol, petanya tergambar salah dan TIDAK membetulkan
           diri sendiri. Yang tampil cuma sepotong garis, tanpa galat apa pun
           di konsol. Pengamat ini mengukur ulang tiap wadahnya berubah. */
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
    {#if !sematan}
      Ketuk <b>Peta jalan</b> di pojok kanan atas bila ingin melihat nama jalan.
    {/if}
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
