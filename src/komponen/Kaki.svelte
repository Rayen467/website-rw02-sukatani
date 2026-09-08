<script>
  import { KONTEN } from "../inti/nama.js";
  import { kontenNilai } from "../keadaan/isi.svelte.js";
  import { IDENTITAS_BAWAAN } from "../inti/bawaan.js";
  import Belum from "./Belum.svelte";
  import { waktu } from "../keadaan/waktu.svelte.js";

  const namaRW = $derived(kontenNilai(KONTEN.IDENTITAS, "namaRW", IDENTITAS_BAWAAN.namaRW));
  const alamatKaki = $derived(kontenNilai(KONTEN.IDENTITAS, "alamatKaki", IDENTITAS_BAWAAN.alamatKaki));

  // Footer punya panorama khusus untuk pagi, siang, dan malam.
  // Sore memakai panorama sore yang tersedia sampai aset footer-sore khusus ada.
  // document.baseURI menjaga URL tetap benar saat situs berada di sub-path GitHub Pages.
  const gambarKaki = $derived.by(() => {
    const nama =
      waktu.fase === "pagi"
        ? "footer-pagi.webp"
        : waktu.fase === "siang"
          ? "footer-siang.webp"
          : waktu.fase === "malam"
            ? "footer-malam.webp"
            : "hero-sore.webp";

    if (typeof document === "undefined") return "./visual/waktu/" + nama;
    return new URL("./visual/waktu/" + nama, document.baseURI).href;
  });
</script>

<footer class="tanpa-cetak kaki-waktu" style={"--gambar-kaki:url('" + gambarKaki + "')"}>
  <div class="wadah">
    <div class="kaki-petak">
      <div class="kaki-brand">
        <div class="kaki-lockup" aria-label="RW 02 Sukatani — Guyub, Maju, Sejahtera">
          <img class="kaki-logo-ikon" src="./visual/brand/logo-icon.webp" alt="" aria-hidden="true" />
          <span class="kaki-logo-teks">
            <strong>RW 02</strong>
            <b>SUKATANI</b>
            <small>GUYUB · MAJU · SEJAHTERA</small>
          </span>
        </div>
        <h4>Tentang situs ini</h4>
        <p>
          Situs informasi warga {namaRW}, Perum Permai Sukatani. Dikelola pengurus RW bersama kader warga.
          Grup WhatsApp tetap menjadi tempat pemberitahuan; situs ini menyimpannya agar bisa dicari kembali.
        </p>
      </div>
      <div>
        <h4>Layanan</h4>
        <ul>
          <li><a href="#/surat">Pengajuan Surat</a></li>
          <li><a href="#/pengaduan">Pengaduan dan Aspirasi</a></li>
          <li><a href="#/reservasi">Reservasi Fasilitas</a></li>
          <li><a href="#/kependudukan">Data Kependudukan</a></li>
        </ul>
      </div>
      <div>
        <h4>Informasi</h4>
        <ul>
          <li><a href="#/berita">Berita dan Pengumuman</a></li>
          <li><a href="#/kalender">Kalender Kegiatan</a></li>
          <li><a href="#/galeri">Galeri Foto &amp; Video</a></li>
          <li><a href="#/berkas">Dokumen &amp; Video</a></li>
        </ul>
      </div>
      <div>
        <h4>Sekretariat</h4>
        <ul>
          <li>Balai warga <Belum nilai={kontenNilai(KONTEN.KONTAK, "alamat")} /></li>
          <li>Jam layanan <Belum nilai={kontenNilai(KONTEN.KONTAK, "jamSeninJumat")} /></li>
          <li>Pos keamanan <Belum nilai={kontenNilai(KONTEN.KONTAK, "posKeamanan")} /></li>
        </ul>
      </div>
    </div>
    <div class="kaki-bawah kaki-bawah-identitas">
      <span class="mono kaki-alamat">{alamatKaki}</span>
      <div class="kaki-pengelola">
        <span>Dikelola pengurus {namaRW}.</span>
        <span class="kaki-kkn">KKN 20</span>
        <a href="mailto:rayenxtenri@gmail.com">rayenxtenri@gmail.com</a>
      </div>
    </div>
  </div>
</footer>
