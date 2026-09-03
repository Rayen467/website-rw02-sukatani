/**
 * ===========================================================================
 *  BAWAAN -- isi awal situs sebelum pengurus mengisi apa pun
 * ===========================================================================
 *
 *  LAPIS 1 (inti). Tidak mengimpor apa pun.
 *
 *  Semua yang ada di sini bisa diganti pengurus lewat halaman Kelola tanpa
 *  menyentuh kode. Yang ditaruh di berkas ini HANYA hal yang masuk akal
 *  sebagai titik mulai untuk RW mana pun.
 *
 *  ATURAN YANG TIDAK BOLEH DILANGGAR:
 *  jangan pernah menaruh berita palsu, laporan kas karangan, atau pengaduan
 *  buatan di sini. Halaman yang belum ada isinya harus menampilkan
 *  keterangan kosong yang jujur -- warga membaca situs ini untuk tahu
 *  keadaan sebenarnya, bukan contoh yang menyesatkan.
 *
 *  Dipakai lewat fungsi pakai() di keadaan/isi.svelte.js, yang memilih isi
 *  dari server bila ada dan jatuh ke daftar di sini bila belum ada.
 */

export const RT_BAWAAN = ["RT 01", "RT 02", "RT 03", "RT 04", "RT 05"];

export const JENIS_SURAT_BAWAAN = [
  {
    id: "pengantar-ktp",
    nama: "Surat Pengantar KTP dan Kartu Keluarga",
    estimasi: "1 hari kerja",
    syarat: ["Fotokopi KTP pemohon", "Fotokopi Kartu Keluarga", "Pengantar dari Ketua RT"]
  },
  {
    id: "domisili",
    nama: "Surat Keterangan Domisili",
    estimasi: "1 hari kerja",
    syarat: ["Fotokopi KTP pemohon", "Fotokopi Kartu Keluarga", "Bukti tempat tinggal atau surat sewa"]
  },
  {
    id: "skck",
    nama: "Surat Pengantar SKCK",
    estimasi: "1 hari kerja",
    syarat: ["Fotokopi KTP pemohon", "Fotokopi Kartu Keluarga", "Pas foto terbaru"]
  },
  {
    id: "tidak-mampu",
    nama: "Surat Keterangan Tidak Mampu",
    estimasi: "2 hari kerja",
    syarat: ["Fotokopi KTP pemohon", "Fotokopi Kartu Keluarga", "Keterangan Ketua RT mengenai kondisi keluarga"]
  },
  {
    id: "penghasilan",
    nama: "Surat Keterangan Penghasilan",
    estimasi: "2 hari kerja",
    syarat: ["Fotokopi KTP pemohon", "Fotokopi Kartu Keluarga", "Keterangan pekerjaan atau usaha"]
  },
  {
    id: "usaha",
    nama: "Surat Keterangan Usaha",
    estimasi: "2 hari kerja",
    syarat: ["Fotokopi KTP pemohon", "Fotokopi Kartu Keluarga", "Keterangan lokasi dan jenis usaha"]
  },
  {
    id: "kelahiran",
    nama: "Surat Pengantar Akta Kelahiran",
    estimasi: "1 hari kerja",
    syarat: ["Fotokopi KTP kedua orang tua", "Fotokopi Kartu Keluarga", "Surat keterangan lahir dari bidan atau rumah sakit"]
  },
  {
    id: "kematian",
    nama: "Surat Pengantar Akta Kematian",
    estimasi: "1 hari kerja",
    syarat: ["Fotokopi KTP almarhum dan pelapor", "Fotokopi Kartu Keluarga", "Surat keterangan kematian dari rumah sakit atau saksi"]
  }
];

export const FASILITAS_BAWAAN = [
  { id: "balai", nama: "Balai Warga", kapasitas: "80 orang", ket: "Termasuk kursi dan listrik. Kebersihan dikembalikan seperti semula." },
  { id: "tenda", nama: "Tenda dan Terpal", kapasitas: "2 unit", ket: "Pemasangan dibantu petugas, dijadwalkan sehari sebelumnya." },
  { id: "kursi", nama: "Kursi Plastik", kapasitas: "120 buah", ket: "Diambil dan dikembalikan sendiri oleh peminjam." },
  { id: "sound", nama: "Pengeras Suara", kapasitas: "1 set", ket: "Hanya untuk kegiatan di dalam kawasan." }
];

export const FASUM_BAWAAN = [
  { id: "balai", nama: "Balai Warga", jenis: "Pertemuan", rt: "RT 02" },
  { id: "pos", nama: "Pos Keamanan Utama", jenis: "Keamanan", rt: "Gerbang" },
  { id: "lapangan", nama: "Lapangan Serbaguna", jenis: "Olahraga", rt: "RT 03" },
  { id: "musala", nama: "Musala", jenis: "Ibadah", rt: "RT 01" },
  { id: "posyandu", nama: "Posyandu", jenis: "Kesehatan", rt: "RT 02" },
  { id: "taman", nama: "Taman Bermain Anak", jenis: "Ruang terbuka", rt: "RT 04" },
  { id: "banksampah", nama: "Bank Sampah", jenis: "Kebersihan", rt: "RT 05" }
];

export const RUTIN_BAWAAN = [
  { id: "ronda", kegiatan: "Ronda malam", waktu: "", tempat: "Pos ronda tiap blok" },
  { id: "kerjabakti", kegiatan: "Kerja bakti", waktu: "", tempat: "Bergilir per blok" },
  { id: "posyandu", kegiatan: "Posyandu balita dan lansia", waktu: "", tempat: "Balai warga" },
  { id: "pengajian", kegiatan: "Pengajian rutin", waktu: "", tempat: "Musala" },
  { id: "banksampah", kegiatan: "Bank sampah", waktu: "", tempat: "" },
  { id: "rapat", kegiatan: "Rapat pengurus", waktu: "", tempat: "Balai warga" }
];

export const BANSOS_BAWAAN = [
  {
    id: "bpnt",
    nama: "Bantuan Pangan Non Tunai",
    jalur: "Diusulkan Ketua RT, diverifikasi pengurus RW, diteruskan ke kantor desa",
    syarat: ["Terdaftar dalam data kesejahteraan sosial", "Kartu Keluarga dan KTP aktif", "Tidak sedang menerima bantuan sejenis"]
  },
  {
    id: "pkh",
    nama: "Program Keluarga Harapan",
    jalur: "Pendataan melalui pendamping program dan pemerintah desa",
    syarat: ["Memiliki anggota keluarga sesuai kriteria program", "Kartu Keluarga dan KTP aktif", "Bersedia mengikuti pendampingan"]
  }
];

export const TAUTAN_BAWAAN = [
  { id: "dukcapil", nama: "Dukcapil Kementerian Dalam Negeri", ket: "Informasi administrasi kependudukan nasional", url: "https://dukcapil.kemendagri.go.id" },
  { id: "kabtangerang", nama: "Pemerintah Kabupaten Tangerang", ket: "Laman resmi pemerintah kabupaten", url: "https://www.tangerangkab.go.id" },
  { id: "desa", nama: "Kantor Desa Sukatani", ket: "Layanan administrasi tingkat desa", url: "" },
  { id: "kecamatan", nama: "Kecamatan Rajeg", ket: "Layanan administrasi tingkat kecamatan", url: "" },
  { id: "darurat", nama: "Panggilan darurat 112", ket: "Layanan darurat terpadu", url: "" }
];

export const KATEGORI_PENGADUAN = [
  "Kebersihan", "Keamanan", "Fasilitas umum", "Saluran air",
  "Ketertiban", "Usulan atau aspirasi", "Lainnya"
];

export const JENIS_USAHA = [
  { nilai: "siapsaji", label: "Makanan siap saji" },
  { nilai: "kemasan", label: "Makanan kemasan" },
  { nilai: "jasa", label: "Jasa" },
  { nilai: "retail", label: "Retail" }
];

export const JABATAN_BAWAAN = [
  "Ketua RW", "Sekretaris RW", "Bendahara RW",
  "Seksi Keamanan", "Seksi Kebersihan", "Ketua PKK"
];

export const IDENTITAS_BAWAAN = {
  lambang: "RW",
  namaSitus: "Warga Permai Sukatani",
  namaRW: "RW 02",
  wilayah: "Desa Sukatani, Kec. Rajeg",
  alamatKaki: "Perum Permai Sukatani · Desa Sukatani, Kec. Rajeg, Kab. Tangerang, Banten 15540",
  alamatSitus: ""
};

export const KOORDINAT_BAWAAN = "-6.129217,106.497767";

/**
 * Sambutan Ketua RW.
 *
 * INI PENGECUALIAN dari aturan di kepala berkas. Isi lain di sini sengaja
 * dibuat umum supaya cocok untuk RW mana pun; yang satu ini tidak. Ini
 * naskah asli yang diberikan Ketua RW 02, Bapak Anto Carmanto, S.T., M.T.,
 * jadi bukan contoh karangan -- justru satu-satunya isi di situs ini yang
 * datang langsung dari yang berwenang.
 *
 * Ditaruh sebagai bawaan supaya sambutan langsung tampil sejak hari
 * pertama. Begitu pengurus menyimpan sambutan lewat Kelola, isi dari
 * server yang dipakai dan yang di sini diabaikan. Kalau nanti ketua RW
 * berganti, GANTI LEWAT KELOLA, bukan lewat berkas ini.
 *
 * Baris kosong memisahkan alinea. Beranda memecahnya jadi paragraf sendiri.
 */
export const SAMBUTAN_BAWAAN = {
  nama: "Anto Carmanto, S.T., M.T.",
  foto: "",
  teks: [
    "Assalamu’alaikum Warahmatullahi Wabarakatuh,",
    "Selamat datang di Website Resmi RW 02 Perum Pondok Sukatani Permai!",
    "Puji syukur kehadirat Allah SWT, Tuhan Yang Maha Esa, atas rahmat dan karunia-Nya, sehingga kita dapat meluncurkan website resmi RW 02 Perumahan Pondok Sukatani Permai, Kecamatan Rajeg, Kabupaten Tangerang.",
    "Website ini hadir sebagai jembatan informasi dan komunikasi antara Pengurus RW, para Ketua RT, dan seluruh warga. Melalui media ini, kami berharap segala informasi terkait kegiatan, pengumuman, program kerja, serta pelayanan publik dapat tersampaikan secara cepat, terbuka, dan transparan.",
    "Kami menyadari bahwa kemajuan lingkungan kita tidak terlepas dari kerja sama, kekompakan, dan gotong royong seluruh warga. Oleh karena itu, kami mengajak Bapak, Ibu, dan seluruh warga untuk bersama-sama menjaga kebersihan, keamanan, ketentraman, dan kerukunan di lingkungan yang kita cintai ini.",
    "Kami juga membuka ruang seluas-luasnya bagi seluruh warga untuk menyampaikan saran, masukan, dan aspirasi demi kemajuan dan kesejahteraan bersama. Sekali lagi, selamat berkunjung. Semoga website ini bermanfaat dan menjadi sarana yang mempererat tali silaturahmi kita semua.",
    "Wassalamu’alaikum Warahmatullahi Wabarakatuh."
  ].join("\n\n")
};

export const POLLING_BAWAAN = {
  id: "poll-2026-09",
  pertanyaan: "",
  keterangan: "Hasil polling menjadi bahan musyawarah, bukan keputusan akhir. Keputusan tetap diambil dalam rapat warga.",
  opsi: []
};

/** Susunan menu utama. Menambah halaman berarti menambah baris di sini. */
export const MENU = [
  { label: "Beranda", alamat: "/" },
  {
    label: "Profil RW",
    isi: [
      ["/profil", "Profil RW", "Sejarah, visi-misi, wilayah"],
      ["/pengurus", "Struktur Pengurus", "Pengurus RW dan Ketua RT"],
      ["/peta", "Peta Wilayah", "Batas RT dan fasilitas umum"]
    ]
  },
  {
    label: "Layanan",
    isi: [
      ["/surat", "Pengajuan Surat", "Surat pengantar dan keterangan"],
      ["/pengaduan", "Pengaduan dan Aspirasi", "Lapor dan pantau statusnya"],
      ["/reservasi", "Reservasi Fasilitas", "Balai warga, tenda, kursi"],
      ["/kependudukan", "Data Kependudukan", "Statistik warga"]
    ]
  },
  {
    label: "Informasi",
    isi: [
      ["/berita", "Berita dan Pengumuman", "Kabar terbaru dari pengurus"],
      ["/kalender", "Kalender Kegiatan", "Jadwal rutin dan acara"],
      ["/galeri", "Galeri Foto", "Dokumentasi kegiatan"],
      ["/forum", "Forum dan Polling", "Musyawarah dan survei warga"]
    ]
  },
  {
    label: "Transparansi",
    isi: [
      ["/kas", "Laporan Kas RW", "Pemasukan, pengeluaran, saldo"],
      ["/program", "Rencana dan Realisasi", "Program yang sudah dan akan dikerjakan"]
    ]
  },
  {
    label: "Warga",
    isi: [
      ["/umkm", "Direktori UMKM", "Usaha warga di kawasan"],
      ["/bansos", "Bantuan Sosial", "Syarat dan jalur pengajuan"],
      ["/tautan", "Tautan Penting", "Desa, kecamatan, Dukcapil"]
    ]
  },
  { label: "Kontak", alamat: "/kontak" }
];
