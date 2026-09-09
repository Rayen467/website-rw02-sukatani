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

/* RW 02 membawahi empat RT, bukan lima. Daftar ini mengisi borang surat,
   pendataan warga, dan tabel fasilitas umum -- kalau ada RT yang tidak ada
   di sini, warga bisa memilih RT yang tidak pernah ada. */
export const RT_BAWAAN = ["RT 01", "RT 02", "RT 03", "RT 04"];

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
  { id: "gor-nurani", nama: "GOR Nurani", kapasitas: "", ket: "GOR mini RW 02 untuk olahraga, kegiatan sosial, dan hajatan. Jadwal tetap warga dan tarif hajatan mengikuti AD/ART pengelolaan GOR." },
  { id: "balai", nama: "Balai Warga", kapasitas: "80 orang", ket: "Termasuk kursi dan listrik. Kebersihan dikembalikan seperti semula." },
  { id: "tenda", nama: "Tenda dan Terpal", kapasitas: "2 unit", ket: "Pemasangan dibantu petugas, dijadwalkan sehari sebelumnya." },
  { id: "kursi", nama: "Kursi Plastik", kapasitas: "120 buah", ket: "Diambil dan dikembalikan sendiri oleh peminjam." },
  { id: "sound", nama: "Pengeras Suara", kapasitas: "1 set", ket: "Hanya untuk kegiatan di dalam kawasan." }
];

export const FASUM_BAWAAN = [
  { id: "gor-nurani", nama: "GOR Nurani", jenis: "Olahraga dan sosial", rt: "Lingkungan RT 01/02" },
  { id: "balai", nama: "Balai Warga", jenis: "Pertemuan", rt: "RT 02" },
  { id: "pos", nama: "Pos Keamanan Utama", jenis: "Keamanan", rt: "Gerbang" },
  { id: "lapangan", nama: "Lapangan Serbaguna", jenis: "Olahraga", rt: "RT 03" },
  { id: "musala", nama: "Musala", jenis: "Ibadah", rt: "RT 01" },
  { id: "posyandu", nama: "Posyandu", jenis: "Kesehatan", rt: "RT 02" },
  { id: "taman", nama: "Taman Bermain Anak", jenis: "Ruang terbuka", rt: "RT 04" },
  /* Lokasinya sengaja dikosongkan, bukan ditebak. RW 02 cuma punya empat
     RT, dan sebelumnya baris ini menulis RT 05 -- RT yang tidak ada.
     Menampilkan lokasi yang salah lebih buruk daripada menampilkan
     keterangan kosong yang jujur. Pengurus mengisinya lewat Kelola. */
  { id: "banksampah", nama: "Bank Sampah", jenis: "Kebersihan", rt: "" }
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
    jalur: "Diusulkan Ketua RT, diverifikasi pengurus RW, diteruskan ke kantor kelurahan",
    syarat: ["Terdaftar dalam data kesejahteraan sosial", "Kartu Keluarga dan KTP aktif", "Tidak sedang menerima bantuan sejenis"]
  },
  {
    id: "pkh",
    nama: "Program Keluarga Harapan",
    jalur: "Pendataan melalui pendamping program dan pemerintah kelurahan",
    syarat: ["Memiliki anggota keluarga sesuai kriteria program", "Kartu Keluarga dan KTP aktif", "Bersedia mengikuti pendampingan"]
  }
];

export const TAUTAN_BAWAAN = [
  { id: "dukcapil", nama: "Dukcapil Kementerian Dalam Negeri", ket: "Informasi administrasi kependudukan nasional", url: "https://dukcapil.kemendagri.go.id" },
  { id: "dukcapil-kab", nama: "Disdukcapil Kabupaten Tangerang", ket: "Jenis layanan, persyaratan, dan informasi administrasi kependudukan Kabupaten Tangerang", url: "https://disdukcapil.tangerangkab.go.id/" },
  { id: "ktpel-kab", nama: "Informasi KTP-el Kabupaten Tangerang", ket: "Persyaratan dan informasi pencetakan KTP elektronik dari Disdukcapil Kabupaten Tangerang", url: "https://disdukcapil.tangerangkab.go.id/detail-menu-konten/632" },
  { id: "kabtangerang", nama: "Pemerintah Kabupaten Tangerang", ket: "Laman resmi pemerintah kabupaten", url: "https://www.tangerangkab.go.id" },
  { id: "desa", nama: "Kelurahan Sukatani", ket: "Layanan administrasi dan informasi resmi Kelurahan Sukatani", url: "https://sukatani.tangerangkab.go.id/" },
  { id: "kecamatan", nama: "Kecamatan Rajeg", ket: "Layanan administrasi dan informasi resmi Kecamatan Rajeg", url: "https://rajeg.tangerangkab.go.id/" },
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

/**
 * Data pengurus yang dikonfirmasi RW 02 pada September 2026.
 * Nama di sini menjadi identitas publik bawaan. Foto, kontak dan periode
 * tetap boleh dilengkapi dari data pengurus tanpa mengubah nama resmi ini.
 */
export const PENGURUS_RW_BAWAAN = [
  { id: "ketua-rw", jabatan: "Ketua RW", nama: "Anto Carmanto, S.T., M.T.", foto: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/65bf8ecc-bfbf-48c7-adf2-620fbd94acb3.png", kontak: "", periode: "" },
  { id: "sekretaris-rw", jabatan: "Sekretaris RW", nama: "Sukarno", foto: "", kontak: "", periode: "" },
  { id: "bendahara-rw", jabatan: "Bendahara RW", nama: "Achmad Hidayat", foto: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/126a6afb-9a54-4b94-987c-7e9ac86d34c4.png", kontak: "", periode: "" },
  { id: "seksi-keamanan", jabatan: "Seksi Keamanan", nama: "Samsul Rizal", foto: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/52f88307-2546-4133-b832-cd5054438f5d.png", kontak: "", periode: "" }
];

/** Ketua RT yang dikonfirmasi RW 02. */
export const KETUA_RT_BAWAAN = [
  { id: "RT 01", rt: "RT 01/02", ketua: "Sambudi", foto: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/1ea34a54-86d4-4a40-83fc-c676073cddb8.png", kontak: "", blok: "" },
  { id: "RT 02", rt: "RT 02/02", ketua: "Sudir M. Nur", foto: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/c04b946b-22cb-4f9b-ae80-ca4e77f15044.png", kontak: "", blok: "" },
  { id: "RT 03", rt: "RT 03/02", ketua: "Gunadi", foto: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/0632e6f6-f895-497a-9f7f-14ff37df0427.png", kontak: "", blok: "" },
  { id: "RT 04", rt: "RT 04/02", ketua: "Supomo", foto: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/f8323358-8a2f-4b01-83d6-d98fb7932d8b.png", kontak: "", blok: "" }
];

/**
 * Lembaga/kelompok warga yang diminta RW untuk dimasukkan ke website.
 * Foto resmi yang sudah diterima dipasang langsung pada data bawaan.
 */
export const KELEMBAGAAN_WARGA_BAWAAN = [
  { id: "kwt", nama: "Kelompok Wanita Tani (KWT)", jabatan: "Ketua", ketua: "Ibu Yusnidawati", foto: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/03b31cbe-8bec-45dd-a85b-fee7b6f9f4e9.png" },
  { id: "paud", nama: "PAUD (Pendidikan Anak Usia Dini)", jabatan: "Ketua", ketua: "Ibu Pujiati, S.Pd.", foto: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/616d26e4-1d96-4dfd-98dd-796cc773ec65.png" },
  { id: "majelis-taklim", nama: "Majelis Taklim Al Ikhlas RW 02 PSP", jabatan: "Ketua", ketua: "Ibu Suheti", foto: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/d783be68-f2b9-4c6c-8d77-10ece68e74c7.png" },
  { id: "transportasi", nama: "Transportasi Warga", jabatan: "Ketua", ketua: "Bapak Handoko", foto: "" },
  { id: "posyandu", nama: "Posyandu", jabatan: "Ketua", ketua: "Ibu Pujiati", foto: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/616d26e4-1d96-4dfd-98dd-796cc773ec65.png" }
];

export const IDENTITAS_BAWAAN = {
  lambang: "RW",
  namaSitus: "Warga Permai Sukatani",
  namaRW: "RW 02",
  wilayah: "Kelurahan Sukatani, Kec. Rajeg",
  alamatKaki: "Perum Permai Sukatani · Kelurahan Sukatani, Kec. Rajeg, Kab. Tangerang, Banten 15540",
  alamatSitus: ""
};

export const KOORDINAT_BAWAAN = "-6.129217,106.497767";


export const MAJELIS_TAKLIM_BAWAAN = {
  nama: "Majelis Taklim Al-Ikhlas RW 02 PSP",
  noSkt: "MT025033603112026015",
  dasarSkt: "Peraturan Menteri Agama Republik Indonesia Nomor 29 Tahun 2019 tentang Majelis Taklim",
  tanggalSkt: "5 Agustus 2026",
  masaBerlaku: "5 tahun sejak tanggal diterbitkan",
  ketua: "Ibu Suheti",
  fotoKetua: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/d783be68-f2b9-4c6c-8d77-10ece68e74c7.png",
  sekretaris: "Sri Maryanti",
  tahunBerdiri: "2026",
  tanggalBerdiri: "18 Juli 2026",
  periode: "2026–2029",
  alamat: "Jl. Boulevard RW 02, Kelurahan Sukatani, Kecamatan Rajeg, Kabupaten Tangerang, Banten",
  nomorPermohonan: "01/MT-AI/VII/2026",
  tanggalPermohonan: "20 Juli 2026",
  jumlahAnggota: "250 orang",
  tujuanPendaftaran: "Permohonan pendaftaran Majelis Taklim Al-Ikhlas RW 02 PSP kepada Kantor Urusan Agama Kecamatan Rajeg agar terdaftar dan memperoleh Surat Keterangan Terdaftar sesuai ketentuan yang berlaku.",
  lampiranPendaftaran: [
    "SK Susunan Pengurus Majelis Taklim dari Ketua RW 02 Sukatani.",
    "Fotokopi KTP pengurus.",
    "AD/ART Majelis Taklim Al-Ikhlas.",
    "Foto lokasi Majelis Taklim Al-Ikhlas RW 02.",
    "Daftar hadir pengajian dan pengukuhan pengurus Majelis Taklim Al-Ikhlas RW 02."
  ].join("\n"),
  dokumenRwNomor: "04/SK/RW02/VII/2026",
  dokumenRwJudul: "Pengangkatan Pengurus Majelis Taklim Ibu-Ibu RW 02 Perum Pondok Sukatani Permai Masa Bakti 2024–2027",
  dokumenRwDasar: "Dokumen menyebut hasil Musyawarah Warga dan Jamaah Majelis Taklim Ibu-Ibu RW 02 pada 13 Juni 2026.",
  dokumenRwCatatan: "SK RW tersebut membahas pengurus PAW Majelis Taklim Ibu-Ibu RW 02 dengan judul dan periode berbeda dari SKT/AD/ART Al-Ikhlas. Karena itu, dokumen ini disimpan sebagai arsip pendukung dan tidak dipakai untuk mengganti periode Al-Ikhlas 2026–2029.",
  landasan: "Islam berdasarkan Al-Qur'an dan As-Sunnah serta berpedoman pada peraturan perundang-undangan yang berlaku di Negara Kesatuan Republik Indonesia.",
  visi: "Terwujudnya masyarakat yang beriman, bertakwa, berilmu, berakhlak mulia, serta menjunjung tinggi persatuan dan kerukunan.",
  misi: [
    "Menyelenggarakan kegiatan pengajian dan pembinaan keagamaan.",
    "Meningkatkan pemahaman dan pengamalan ajaran Islam.",
    "Mempererat ukhuwah Islamiyah di lingkungan masyarakat.",
    "Berpartisipasi dalam kegiatan sosial, pendidikan, dan kemasyarakatan."
  ].join("\n"),
  tujuan: [
    "Meningkatkan keimanan dan ketakwaan kepada Allah SWT.",
    "Membina akhlak mulia masyarakat.",
    "Menjadi wadah pendidikan Islam non-formal.",
    "Mendukung terciptanya masyarakat yang rukun, harmonis, dan peduli sesama."
  ].join("\n"),
  kegiatan: [
    "Pengajian rutin mingguan atau bulanan.",
    "Peringatan Hari Besar Islam.",
    "Kajian Al-Qur'an dan hadis.",
    "Santunan sosial.",
    "Pendidikan dan pembinaan akhlak."
  ].join("\n"),
  keanggotaan: "Anggota adalah setiap muslim atau muslimah yang bersedia mengikuti kegiatan Majelis Taklim. Anggota berhak mengikuti kegiatan, memberikan saran, dan memperoleh pembinaan; serta berkewajiban menjaga nama baik Majelis Taklim dan menaati AD/ART.",
  kepengurusan: ["Pelindung", "Ketua", "Wakil Ketua", "Sekretaris", "Bendahara"].join("\n"),
  masaBakti: "3 tahun dan dapat dipilih kembali melalui musyawarah.",
  musyawarah: "Musyawarah merupakan forum tertinggi dalam pengambilan keputusan dan dilaksanakan sekurang-kurangnya satu kali dalam satu tahun atau sewaktu-waktu apabila diperlukan.",
  keuangan: [
    "Iuran anggota.",
    "Infak dan sedekah.",
    "Donasi yang sah dan tidak mengikat.",
    "Bantuan pemerintah sesuai ketentuan yang berlaku.",
    "Sumber lain yang halal dan sah."
  ].join("\n"),
  perubahan: "Perubahan AD/ART dilakukan melalui musyawarah pengurus dan disetujui sekurang-kurangnya oleh dua pertiga peserta yang hadir.",
  rapat: "Rapat pengurus dilaksanakan minimal sekali setiap tiga bulan. Keputusan diambil berdasarkan musyawarah untuk mufakat."
};

export const GOR_NURANI_BAWAAN = {
  nama: "GOR Nurani RW 02",
  jenis: "GOR mini milik RW 02 Perum Pondok Sukatani Permai",
  tahunPendirian: "2022–2023 (2 tahap)",
  mulaiOperasional: "Januari 2024",
  alamat: "Jalan Boulevard, lingkungan RT 01/02 Perum Pondok Sukatani Permai, Kelurahan Sukatani, Kecamatan Rajeg, Kabupaten Tangerang, Provinsi Banten",
  luas: "209 m² (19 m × 11 m)",
  riwayat: "Dokumen pengelolaan menyebut GOR Nurani didirikan pada 2023, diajukan oleh Anto Carmanto, S.T., M.T. dan Supratono, S.Pd. (Ketua RW 02 periode 2021–2024) melalui Pokir Dewan Kabupaten Tangerang, Bapak Munawir Khoirul Basri, S.E., M.M. periode 2019–2024. Pengelolaan GOR Nurani dimulai pada Januari 2024.",
  visi: "Mewujudkan kesejahteraan dan kesehatan masyarakat RW 02 Perum Pondok Sukatani Permai dan sekitarnya.",
  misi: [
    "Perbaikan administrasi dan pembukuan.",
    "Mendorong kegiatan olahraga warga.",
    "Melakukan pendidikan olahraga bulu tangkis bagi anak-anak.",
    "Memberikan pemasukan rutin untuk kas RT 01/02 dan RW 02 Perum Pondok Sukatani Permai.",
    "Memberikan bantuan langsung atau tidak langsung kepada warga RW 02.",
    "Menjadikan GOR sebagai tempat kegiatan sosial warga RW 02 Perum Pondok Sukatani Permai."
  ].join("\n"),
  landasan: "Pancasila dan UUD 1945.",
  sifat: "Profesional dan demokratis.",
  asas: "Kekeluargaan dan kemandirian.",
  tujuan: [
    "Meningkatkan kesejahteraan warga.",
    "Meningkatkan kesehatan masyarakat.",
    "Menambah keahlian di bidang olahraga bulu tangkis.",
    "Menjadikan GOR untuk kegiatan sosial."
  ].join("\n"),
  pemanfaatan: "GOR Nurani dapat disewakan kepada pihak lain dengan tarif yang ditetapkan oleh pengelola dan hasil pemanfaatannya dikembalikan sebesar-besarnya untuk kepentingan serta kesejahteraan warga RW 02. Dalam kegiatannya, selain mempertimbangkan usaha atau keuntungan, GOR juga mempertimbangkan kemanfaatan bagi masyarakat.",
  maknaLogo: "Dokumen AD menjelaskan unsur shuttlecock putih sebagai lambang kebersihan hati, bara api sebagai semangat yang tidak pernah berhenti, serta warna coklat sebagai lambang cinta, keandalan, dan kesejahteraan.",
  ketuaNama: "",
  pelaksanaNama: "",
  bendaharaNama: "",
  strukturPengurus: [
    "Ketua GOR.",
    "Pelaksana Harian.",
    "Bendahara."
  ].join("\n"),
  ketentuanPengurus: "Ketua, Bendahara, dan Pelaksana Harian dipilih dari warga RW 02 melalui rapat pengurus RT dan/atau pengurus RW 02. Jabatan tersebut bukan dijabat Ketua RW 02. Pengurus diprioritaskan dari warga RT 01/02 dan masa kepengurusannya mengikuti periode kepengurusan RW.",
  tugasKetua: [
    "Mengatur dan mengontrol seluruh kegiatan GOR.",
    "Membuat rencana dan kebijakan pengelolaan GOR.",
    "Bertanggung jawab atas seluruh kegiatan GOR.",
    "Kebijakan strategis, terutama yang berkaitan dengan keuangan, ditandatangani pengurus GOR dan disetujui Ketua RW 02.",
    "Menjaga suasana kondusif di internal maupun eksternal RW 02.",
    "Membuat laporan pertanggungjawaban pada akhir masa kepengurusan."
  ].join("\n"),
  tugasPelaksana: [
    "Bertanggung jawab atas kebersihan GOR.",
    "Mendata penyewa GOR, baik anggota maupun bukan anggota.",
    "Menjaga dan merawat fasilitas GOR.",
    "Membuat laporan kegiatan harian GOR.",
    "Membayar listrik dan PAM."
  ].join("\n"),
  tugasBendahara: [
    "Menyimpan keuangan GOR dengan baik.",
    "Membuat laporan keuangan setiap bulan.",
    "Mengeluarkan dana kegiatan berdasarkan instruksi Ketua GOR dan persetujuan Ketua RW 02.",
    "Menyediakan dana taktis yang sewaktu-waktu dapat digunakan untuk kegiatan organisasi."
  ].join("\n"),
  alokasiProfit: [
    "Pelaksana Harian: 20% dari keuntungan bersih GOR setelah pembayaran listrik dan PAM.",
    "Bendahara: honorarium Rp50.000 per bulan sebelum perhitungan keuntungan bersih.",
    "Kas RW 02: 20% dari keuntungan bersih setelah pembayaran listrik dan PAM.",
    "Kas RT 01/02: 45% dari keuntungan bersih setelah pembayaran listrik dan PAM.",
    "Biaya perawatan GOR: 15% dari keuntungan bersih setelah pembayaran listrik dan PAM."
  ].join("\n"),
  batasDistribusiProfit: "Alokasi sebagaimana ketentuan pembagian profit diberikan paling lambat setiap tanggal 10.",
  jadwalTetap: [
    "Sabtu 08.00–12.00: senam ibu-ibu RW 02.",
    "Sabtu 12.00–14.00: penggunaan untuk warga RT 01/02.",
    "Sabtu 16.00–18.00: diklat/latihan anak-anak RW 02.",
    "Kamis 19.00–23.00: kegiatan bulu tangkis bapak-bapak/ibu-ibu warga RW 02 PSP."
  ].join("\n"),
  aturanBadminton: [
    "Peserta baru mendaftarkan diri kepada pengurus harian GOR.",
    "Pengurus mendata pengguna dan membedakan anggota serta bukan anggota.",
    "Lapangan disiapkan oleh pengurus harian paling lambat 30 menit sebelum jadwal."
  ].join("\n"),
  aturanHajatan: [
    "Penyewa untuk hajatan wajib mendaftarkan diri minimal 1 bulan sebelum acara.",
    "Hajatan hari Sabtu menggunakan waktu persiapan Kamis, Jumat, dan Sabtu; pada Sabtu pukul 14.00 kondisi GOR harus sudah bersih kembali.",
    "Hajatan hari Minggu menggunakan waktu persiapan Jumat, Sabtu, dan Minggu sampai pukul 14.00.",
    "Hajatan di luar hari tersebut dibahas langsung dengan pengurus dan bersifat situasional.",
    "Acara khusus dimusyawarahkan dengan pengurus GOR."
  ].join("\n"),
  tarifRt0102: "Rp1.000.000",
  komposisiRt0102: "Rp500.000 biaya kebersihan; Rp300.000 kas RT 01/02; Rp200.000 kas RW 02.",
  tarifRw02Lain: "Rp1.500.000",
  komposisiRw02Lain: "Rp500.000 biaya kebersihan; Rp500.000 kas RT 01/02; Rp500.000 kas RW 02.",
  tarifLuarRw02: "Rp2.500.000",
  komposisiLuarRw02: "Rp500.000 biaya kebersihan; Rp1.000.000 kas RT 01/02; Rp1.000.000 kas RW 02.",
  tarifCatatan: "Tarif GOR dapat dinaikkan sewaktu-waktu berdasarkan rapat pengurus GOR dan pengurus RW 02 Perum Pondok Sukatani Permai.",
  perlengkapan: [
    "Identitas GOR.",
    "Net bulu tangkis.",
    "Jam dinding.",
    "Papan pengumuman.",
    "Sapu.",
    "Lap pel.",
    "Tong sampah.",
    "Asbak rokok."
  ].join("\n"),
  rapat: "Rapat disiapkan dengan menentukan tujuan, agenda, peserta, materi, tempat, dan waktu. Pelaksanaan meliputi pembukaan, penyampaian informasi, diskusi/pembahasan, pengambilan keputusan, penutupan, lalu pencatatan serta tindak lanjut hasil rapat.",
  keputusan: "Pengambilan keputusan dapat melalui musyawarah untuk mufakat, voting, aklamasi, dan analisis. Keputusan harus dapat dipertanggungjawabkan kepada warga RW 02, dibuat tertulis, ditandatangani seluruh pengurus GOR, dan disetujui Ketua RW 02.",
  renovasi: "Pembangunan atau renovasi GOR dilakukan sesuai program kerja pengurus RW 02 dan ditandatangani seluruh pengurus GOR. Program kerja disampaikan pada awal kepengurusan dan anggaran pembangunan dibuat terlebih dahulu sebelum pembentukan panitia kecil pembangunan.",
  perubahanAdart: "AD/ART dapat dievaluasi setiap 3 tahun atau diubah sewaktu-waktu melalui rapat Pengurus GOR, Pengurus RT, dan Pengurus RW 02. Apabila belum diubah, ketentuan lama tetap berlaku.",
  sumberDokumen: "Anggaran Dasar dan Anggaran Rumah Tangga Pengelolaan GOR Nurani RW 02 Sukatani serta lampiran foto GOR dari arsip RW 02."
};



/**
 * Tulisan di beranda.
 *
 * Sebelumnya semuanya tertanam di dalam Beranda.svelte, jadi mengganti satu
 * kalimat sambutan pun harus lewat kode. Sekarang jadi bawaan yang bisa
 * ditimpa pengurus lewat Kelola, seperti isi situs yang lain.
 *
 * Yang ditaruh di sini boleh berupa kalimat sungguhan, bukan contoh
 * karangan, karena isinya menjelaskan situs ini sendiri -- bukan mengaku
 * tahu keadaan RW mana pun.
 */
export const BERANDA_BAWAAN = {
  judul: "Rumah yang Menghubungkan Kita",
  ringkas:
    "Lingkungan yang nyaman, informasi dan layanan lebih mudah dalam satu tempat. Bersama membangun Permai Sukatani yang lebih baik.",
  alamat: "Kelurahan Sukatani, Kec. Rajeg, Kab. Tangerang, Banten 15540",

  judulLayanan: "Layanan yang sering dipakai",
  layanan1Judul: "Pengajuan Surat",
  layanan1Teks:
    "Surat pengantar KTP, domisili, SKCK, keterangan tidak mampu, dan lainnya. Ada nomor antrean dan berkasnya bisa diunduh.",
  layanan2Judul: "Pengaduan dan Aspirasi",
  layanan2Teks:
    "Laporkan sampah, lampu mati, saluran tersumbat, atau gangguan keamanan. Status laporan bisa dipantau.",
  layanan3Judul: "Reservasi Fasilitas",
  layanan3Teks:
    "Pinjam GOR Nurani, balai warga, tenda, kursi, atau fasilitas RW lain. Jadwal ketersediaan terlihat langsung.",

  judulKas: "Laporan Kas RW",
  teksKas:
    "Pemasukan, pengeluaran, dan saldo kas dipublikasikan terbuka dan bisa diperiksa warga kapan saja.",
  judulProgram: "Rencana dan Realisasi Program",
  teksProgram:
    "Apa yang sudah dikerjakan, apa yang sedang berjalan, dan apa yang direncanakan berikutnya."
};

/**
 * Pengelompokan berkas dan tautan di halaman Dokumen & Video.
 * Ditaruh terpisah dari nama koleksi karena ini pilihan isi, bukan nama
 * teknis: pengurus boleh menambah atau mengganti tanpa menyentuh Firestore.
 */
export const KATEGORI_BERKAS = [
  { nilai: "notulen", label: "Notulen rapat" },
  { nilai: "keputusan", label: "Surat Keputusan & peraturan" },
  { nilai: "formulir", label: "Formulir yang bisa diunduh" },
  { nilai: "laporan", label: "Laporan & pertanggungjawaban" },
  { nilai: "video", label: "Video kegiatan" },
  { nilai: "lain", label: "Lainnya" }
];

/**
 * Dua cara berkas masuk ke situs.
 *
 * "unggah" menyimpan berkasnya di dalam situs, tapi ada batas ukuran --
 * lihat BATAS_BERKAS di inti/peramban.js. "tautan" cuma menyimpan alamat,
 * jadi tanpa batas ukuran, tapi berkasnya hidup di tempat lain dan ikut
 * mati kalau yang punya menghapusnya di sana.
 */
export const CARA_BERKAS = [
  { nilai: "unggah", label: "Unggah berkas ke situs" },
  { nilai: "tautan", label: "Tempel tautan Google Drive atau YouTube" }
];

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
      ["/layanan", "Pusat Layanan Warga", "Semua layanan dan alur pengajuan"],
      ["/surat", "Pengajuan Surat", "Surat pengantar dan keterangan"],
      ["/pengaduan", "Pengaduan dan Aspirasi", "Lapor dan pantau statusnya"],
      ["/reservasi", "Reservasi Fasilitas", "GOR Nurani, balai warga, tenda, kursi"],
      ["/daftar-usaha", "Pendaftaran UMKM", "Daftarkan usaha warga"],
      ["/kependudukan", "Data Kependudukan", "Statistik warga"]
    ]
  },
  {
    label: "Informasi",
    isi: [
      ["/berita", "Berita dan Pengumuman", "Kabar terbaru dari pengurus"],
      ["/kalender", "Kalender Kegiatan", "Jadwal rutin dan acara"],
      ["/berkas", "Dokumen dan Video", "Notulen, SK, formulir, rekaman"],
      ["/forum", "Forum dan Polling", "Musyawarah dan survei warga"]
    ]
  },
  {
    label: "Transparansi",
    isi: [
      ["/transparansi", "Transparansi & Keuangan", "Ringkasan kas dan program RW"],
      ["/kas", "Laporan Kas RW", "Pemasukan, pengeluaran, saldo"],
      ["/program", "Rencana dan Realisasi", "Program yang sudah dan akan dikerjakan"]
    ]
  },
  {
    label: "Warga",
    isi: [
      ["/umkm", "Direktori UMKM", "Usaha warga di kawasan"],
      ["/majelis-taklim", "Majelis Taklim Al-Ikhlas", "Profil, kegiatan, dan ringkasan AD/ART"],
      ["/gor-nurani", "GOR Nurani", "Profil, tujuan, dan pemanfaatan GOR RW 02"],
      ["/bansos", "Bantuan Sosial", "Syarat dan jalur pengajuan"],
      ["/tautan", "Tautan Penting", "Desa, kecamatan, Dukcapil, KTP-el"]
    ]
  },
  { label: "Kontak", alamat: "/kontak" }
];
