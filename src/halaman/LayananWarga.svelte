<script>
  import { sesi } from "../keadaan/sesi.svelte.js";

  const layanan = [
    {
      judul: "Pengaduan & Aspirasi",
      ringkas: "Laporkan kebersihan, keamanan, fasilitas umum, saluran air, ketertiban, atau sampaikan usulan.",
      alur: "Isi laporan → dapat nomor tiket → petugas memproses → status dan catatan tindak lanjut dapat dipantau.",
      href: "#/pengaduan",
      aksi: "Buat pengaduan"
    },
    {
      judul: "Pengajuan Surat",
      ringkas: "Ajukan surat pengantar dan surat keterangan tanpa harus datang hanya untuk mengambil nomor antrean.",
      alur: "Pilih jenis surat → lengkapi data → kirim → petugas memproses → status terlihat di Akun Saya.",
      href: "#/surat",
      aksi: "Ajukan surat"
    },
    {
      judul: "Pendaftaran UMKM",
      ringkas: "Daftarkan usaha warga agar dapat ditinjau pengurus dan ditampilkan di direktori UMKM RW.",
      alur: "Isi data usaha → kirim → petugas meninjau → disetujui dan masuk katalog, atau ditolak untuk diperbaiki.",
      href: "#/daftar-usaha",
      aksi: "Daftarkan UMKM"
    },
    {
      judul: "Reservasi Fasilitas",
      ringkas: "Ajukan peminjaman balai warga, kursi, tenda, atau fasilitas RW yang tersedia.",
      alur: "Pilih fasilitas & tanggal → kirim → petugas menyetujui/menolak → tanggal yang disetujui otomatis dikunci.",
      href: "#/reservasi",
      aksi: "Ajukan peminjaman"
    }
  ];
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Layanan Warga</span></nav>

<div class="kepala-halaman">
  <p class="alis">Pelayanan digital RW 02</p>
  <h1>Pusat layanan warga</h1>
  <p>
    Semua permohonan masuk langsung ke meja kerja petugas. Warga tidak perlu
    mencari nomor pengurus satu per satu: pilih layanan, isi data, lalu pantau
    prosesnya dari website.
  </p>
</div>

<div class="catatan" style="margin-bottom:22px">
  <b>Satu pintu pelayanan.</b>
  Pengaduan, pengajuan surat, pendaftaran UMKM, dan peminjaman fasilitas
  diteruskan ke dashboard petugas. Bila petugas membutuhkan keterangan tambahan,
  warga dapat dihubungi melalui nomor WhatsApp yang dicantumkan.
</div>

<section class="blok">
  <div class="kepala-bagian">
    <h2>Pilih layanan</h2>
  </div>

  <div class="petak petak-2">
    {#each layanan as l}
      <a class="kartu tindakan" href={l.href}>
        <p class="alis">Layanan warga</p>
        <h3>{l.judul}</h3>
        <p>{l.ringkas}</p>
        <p class="keterangan">{l.alur}</p>
        <span class="tombol utama">{l.aksi}</span>
      </a>
    {/each}
  </div>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Bagaimana prosesnya?</h2></div>
  <div class="langkah">
    <div class="langkah-butir">
      <span class="nomor">1</span>
      <div><b>Pilih layanan</b><p>Warga memilih jenis kebutuhan dan membaca syarat atau informasi yang diperlukan.</p></div>
    </div>
    <div class="langkah-butir">
      <span class="nomor">2</span>
      <div><b>Kirim dari website</b><p>Form tersimpan di Firestore dan langsung muncul di dashboard petugas tanpa perlu diketik ulang.</p></div>
    </div>
    <div class="langkah-butir">
      <span class="nomor">3</span>
      <div><b>Petugas menangani</b><p>Petugas dapat mencari kiriman, membuka detail, mengubah status, memberi catatan, dan menghubungi warga lewat WhatsApp bila diperlukan.</p></div>
    </div>
    <div class="langkah-butir">
      <span class="nomor">4</span>
      <div><b>Warga memantau</b><p>{sesi.pengguna ? "Status kiriman akun ini dapat dilihat di halaman Akun Saya." : "Masuk atau daftar akun agar pengajuan pribadi dapat dilacak dari halaman Akun Saya."}</p></div>
    </div>
  </div>
</section>

<section class="blok">
  <div class="petak petak-2">
    <div class="kartu sunyi">
      <p class="alis">Pengaduan cepat</p>
      <h3>Keluhan tetap bisa dikirim tanpa akun</h3>
      <p>Untuk gangguan lingkungan atau keamanan, warga dapat mengirim laporan tanpa login. Nama juga boleh dikosongkan.</p>
      <a class="tombol" href="#/pengaduan">Buka pengaduan</a>
    </div>
    <div class="kartu sunyi">
      <p class="alis">Pelacakan pribadi</p>
      <h3>Akun warga untuk layanan pribadi</h3>
      <p>Pengajuan surat, reservasi, dan pendaftaran UMKM memakai akun agar riwayat dan status tidak dapat dilihat warga lain.</p>
      <a class="tombol" href={sesi.pengguna ? "#/akun" : "#/masuk"}>{sesi.pengguna ? "Buka Akun Saya" : "Masuk / daftar"}</a>
    </div>
  </div>
</section>
