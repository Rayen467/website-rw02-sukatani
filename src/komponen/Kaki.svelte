<script>
  import { KONTEN } from "../inti/nama.js";
  import { kontenNilai } from "../keadaan/isi.svelte.js";
  import { IDENTITAS_BAWAAN } from "../inti/bawaan.js";
  import Belum from "./Belum.svelte";

  const namaRW = $derived(kontenNilai(KONTEN.IDENTITAS, "namaRW", IDENTITAS_BAWAAN.namaRW));
  const alamatKaki = $derived(kontenNilai(KONTEN.IDENTITAS, "alamatKaki", IDENTITAS_BAWAAN.alamatKaki));
</script>

<footer class="tanpa-cetak">
  <div class="wadah">
    <div class="kaki-petak">
      <div>
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
          <li><a href="#/bansos">Bantuan Sosial</a></li>
        </ul>
      </div>
      <div>
        <h4>Informasi</h4>
        <ul>
          <li><a href="#/berita">Berita dan Pengumuman</a></li>
          <li><a href="#/kalender">Kalender Kegiatan</a></li>
          <li><a href="#/galeri">Galeri Foto</a></li>
          <li><a href="#/kas">Laporan Kas RW</a></li>
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
    <div class="kaki-bawah">
      <span class="mono">{alamatKaki}</span>
      <span>Dikelola pengurus {namaRW}.</span>
    </div>
  </div>
</footer>
