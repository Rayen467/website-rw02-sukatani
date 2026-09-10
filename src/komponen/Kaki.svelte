<script>
  import { KONTEN } from "../inti/nama.js";
  import { kontenNilai } from "../keadaan/isi.svelte.js";
  import { IDENTITAS_BAWAAN } from "../inti/bawaan.js";
  import { waktu } from "../keadaan/waktu.svelte.js";

  const namaRW = $derived(kontenNilai(KONTEN.IDENTITAS, "namaRW", IDENTITAS_BAWAAN.namaRW));
  const alamatKaki = $derived(kontenNilai(KONTEN.IDENTITAS, "alamatKaki", IDENTITAS_BAWAAN.alamatKaki));

  /*
   * Empat panorama footer final. Sumbernya adalah empat gambar yang dipilih
   * user, disiapkan menjadi 3840x1080 WebP agar footer desktop tidak blur.
   */
  const FOOTER_4K = Object.freeze({
    pagi: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/ac5972ef-a71b-4fdc-bf3a-f7b9c364f121.webp",
    siang: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/fd7cc752-5163-46de-89e3-9da5237b5063.webp",
    sore: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/5b8146fc-c187-43ac-85c0-11bf4a6eb9cd.webp",
    malam: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/bd68ce05-84b7-4d7e-a430-e1b4364d2984.webp"
  });

  const gambarKaki = $derived(FOOTER_4K[waktu.fase] || FOOTER_4K.malam);
  const logoKolaborasi = "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/47ada69c-77aa-4585-bb50-972c20f0a533.png";
</script>

<footer class="tanpa-cetak kaki-waktu kaki-modern" style={"--gambar-kaki:url('" + gambarKaki + "')"}>
  <div class="wadah kaki-modern-dalam">
    <div class="kaki-modern-grid">
      <section class="kaki-modern-brand" aria-label="Identitas RW 02 Sukatani">
        <a class="kaki-lockup" href="#/" aria-label="Beranda RW 02 Sukatani">
          <img class="kaki-logo-ikon" src="https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/f2bd27c4-a085-4824-923f-410a06b0adb2.png" alt="" aria-hidden="true" />
          <span class="kaki-logo-teks">
            <strong>RW 02</strong>
            <b>SUKATANI</b>
            <small>GUYUB · MAJU · SEJAHTERA</small>
          </span>
        </a>

        <div class="kaki-kolaborasi-inline" aria-label="KKN 20 Perum Sukatani Permai bersama Global Institute">
          <img
            src={logoKolaborasi}
            alt="KKN 20 Perum Sukatani Permai dan Global Institute of Technology & Business"
            loading="lazy"
            decoding="async"
          />
        </div>

        <p>Bersama membangun lingkungan yang lebih baik, guyub, maju dan sejahtera.</p>

        <a class="kaki-hubungi" href="mailto:rayenxtenri@gmail.com">Hubungi pengelola →</a>
      </section>

      <nav class="kaki-modern-kolom" aria-label="Navigasi footer">
        <h4>Navigasi</h4>
        <ul>
          <li><a href="#/">Beranda</a></li>
          <li><a href="#/profil">Profil</a></li>
          <li><a href="#/layanan">Layanan</a></li>
          <li><a href="#/berita">Berita</a></li>
          <li><a href="#/galeri">Galeri</a></li>
          <li><a href="#/umkm">UMKM</a></li>
          <li><a href="#/kontak">Kontak</a></li>
        </ul>
      </nav>

      <nav class="kaki-modern-kolom" aria-label="Layanan cepat footer">
        <h4>Layanan Cepat</h4>
        <ul>
          <li><a href="#/surat">Pengajuan Surat</a></li>
          <li><a href="#/pengaduan">Pengaduan Warga</a></li>
          <li><a href="#/kependudukan">Data Warga</a></li>
          <li><a href="#/reservasi">Peminjaman Fasilitas</a></li>
          <li><a href="#/umkm">UMKM Warga</a></li>
          <li><a href="#/kontak">Informasi Transportasi</a></li>
        </ul>
      </nav>

      <section class="kaki-modern-kolom kaki-lokasi">
        <h4>Lokasi Kami</h4>
        <div class="kaki-lokasi-isi">
          <span class="kaki-pin" aria-hidden="true">●</span>
          <p>
            <strong>Permai Sukatani, Rajeg</strong>
            <small>Kabupaten Tangerang</small>
          </p>
        </div>
        <span class="kaki-alamat-ringkas">{alamatKaki}</span>
      </section>

      <div class="kaki-motto" aria-label="Guyub Maju Sejahtera">
        <span>Guyub</span>
        <span>Maju</span>
        <span>Sejahtera</span>
      </div>
    </div>

    <div class="kaki-modern-bawah">
      <span>© 2026 {namaRW}. All rights reserved.</span>
      <span class="kaki-modern-tagline">Rumah bukan hanya tempat, tapi tentang kebersamaan.</span>
      <span class="kaki-modern-kkn">KKN 20 · rayenxtenri@gmail.com</span>
    </div>
  </div>
</footer>

<style>
  .kaki-kolaborasi-inline {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: min(100%, 250px);
    margin: 8px 0 10px 0;
    padding: 0;
    border: 0;
    background: transparent;
    box-shadow: none;
    backdrop-filter: none;
  }

  .kaki-kolaborasi-inline img {
    display: block;
    width: 100%;
    max-width: 245px;
    max-height: 62px;
    height: auto;
    object-fit: contain;
    object-position: left center;
    filter: none;
  }

  @media (max-width: 680px) {
    .kaki-kolaborasi-inline {
      width: min(100%, 225px);
      margin: 7px 0 9px;
    }

    .kaki-kolaborasi-inline img {
      max-width: 220px;
      max-height: 56px;
    }
  }
</style>
