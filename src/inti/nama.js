/**
 * ===========================================================================
 *  DAFTAR NAMA -- satu-satunya tempat nama koleksi dan kunci ditulis
 * ===========================================================================
 *
 *  LAPIS 1 (inti). Berkas ini TIDAK BOLEH mengimpor apa pun.
 *
 *  KENAPA BERKAS INI ADA
 *
 *  Firestore tidak pernah mengeluh kalau nama koleksi salah ketik. Menulis
 *  "pengumumam" tidak memunculkan galat -- hasilnya cuma kosong, dan yang
 *  mengubah kode akan mengira datanya yang belum ada. Itu jenis kesalahan
 *  yang paling lama dicari.
 *
 *  Maka nama koleksi TIDAK PERNAH ditulis langsung sebagai teks di halaman.
 *  Selalu lewat berkas ini:
 *
 *      import { KOLEKSI } from "../inti/nama.js";
 *      muatKoleksi(KOLEKSI.PENGUMUMAN);      <-- benar
 *      muatKoleksi("pengumuman");            <-- jangan
 *
 *  Salah ketik KOLEKSI.PENGUMUMAM langsung ketahuan sebagai "undefined".
 *
 *  KALAU MENAMBAH KOLEKSI BARU, ada empat tempat yang harus diisi, dan
 *  keempatnya ada di berkas ini juga -- tidak tersebar:
 *
 *      1. KOLEKSI          namanya
 *      2. KOLEKSI_UMUM atau KOLEKSI_PENGURUS   siapa yang boleh membacanya
 *      3. TANPA_URUTAN     kalau koleksinya tidak punya kolom "dibuat"
 *      4. src/keadaan/isi.svelte.js   tambahkan barisnya di daftar isi
 */

/* -------------------------------------------------------------------------
 *  1. Nama koleksi di Firestore
 * ------------------------------------------------------------------------- */

export const KOLEKSI = Object.freeze({
  /* Isi situs -- boleh dibaca siapa pun, hanya pengurus yang menulis */
  PENGUMUMAN: "pengumuman",
  GALERI: "galeri",
  PROGRAM: "program",
  KAS: "kas",
  USAHA: "usaha",
  PENGURUS_TAMPIL: "pengurus_tampil",
  BATAS_RT: "batas_rt",
  JADWAL: "jadwal",
  TAUTAN: "tautan",
  JENIS_SURAT: "jenis_surat",
  FASILITAS: "fasilitas",
  FASUM: "fasum",
  RUTIN: "rutin",
  BANSOS: "bansos",
  BANSOS_PENERIMA: "bansos_penerima",
  BERKAS: "berkas",

  /* Forum warga: topik dan komentar sama-sama terbuka untuk dibaca.
     Penulisannya dibatasi ke akun terverifikasi lewat Firestore Rules. */
  FORUM_TOPIK: "forum_topik",
  FORUM_KOMENTAR: "forum_komentar",

  /* Isi berkas dipisah dari keterangannya, dan ini BUKAN kerapian belaka.
     Koleksi "berkas" ikut diambil setiap kali situs dibuka. Kalau isi
     base64-nya ikut di dokumen yang sama, sepuluh PDF berarti 5 MB
     diunduh setiap pengunjung, termasuk yang cuma mau baca pengumuman.
     Dengan dipisah, yang diambil di awal cuma judul dan ukurannya; isinya
     baru diambil kalau ada yang menekan Unduh. */
  BERKAS_ISI: "berkas_isi",

  /* Foto galeri, satu dokumen satu foto, dengan alasan yang sama seperti
     BERKAS_ISI. Koleksi "galeri" cuma menyimpan keterangan album dan satu
     foto sampul kecil; foto ukuran penuhnya ada di sini dan baru diambil
     kalau albumnya dibuka. Satu album kerja bakti bisa 20 foto, dan kalau
     semuanya ikut dimuat di awal itu 14 MB per pengunjung. */
  GALERI_FOTO: "galeri_foto",

  /* Foto usaha ukuran penuh, id-nya sama dengan dokumen di koleksi "usaha".
     Alasannya sama seperti dua di atas, tapi di sini paling terasa.
     Koleksi "usaha" ikut diambil setiap situs dibuka -- beranda memang
     memajang tiga usaha teratas, dan halaman Cari mencari di dalamnya --
     jadi foto yang menempel di dokumennya ikut terbawa juga. Foto ukuran
     penuh besarnya 231 KB. Dua puluh usaha berarti 4,6 MB ditarik setiap
     orang membuka beranda, padahal foto sebesar itu cuma dipakai di satu
     halaman rincian yang dibuka satu per satu. Yang tinggal di "usaha"
     sekarang cuma sampul kecilnya; yang ini diambil saat rinciannya
     dibuka. */
  USAHA_FOTO: "usaha_foto",

  /* Pengaduan -- isi laporan terbuka, identitas pelapor terpisah */
  PENGADUAN: "pengaduan",
  PENGADUAN_KONTAK: "pengaduan_kontak",

  /* Kiriman warga -- hanya pengurus dan pengirimnya yang boleh membaca */
  SURAT: "surat",
  RESERVASI: "reservasi",
  USAHA_BARU: "usaha_baru",

  /* Orang */
  WARGA: "warga",
  PENGURUS: "pengurus",

  /* Dokumen tetap dan polling */
  KONTEN: "konten",
  POLLING: "polling",
  SUARA: "suara"
});

/* -------------------------------------------------------------------------
 *  2. Kunci dokumen tetap di koleksi "konten"
 *
 *  Satu dokumen menyimpan satu bagian halaman yang diisi pengurus lewat
 *  formulir, bukan daftar yang bisa ditambah-kurang.
 * ------------------------------------------------------------------------- */

export const KONTEN = Object.freeze({
  PROFIL: "profil",
  KEPENDUDUKAN: "kependudukan",
  KONTAK: "kontak",
  SAMBUTAN: "sambutan",
  STATISTIK: "statistik",
  BANSOS: "bansos",
  IDENTITAS: "identitas",
  BERANDA: "beranda",
  POLLING: "polling",
  TAMPILAN: "tampilan",
  MAJELIS_TAKLIM: "majelis_taklim",
  GOR_NURANI: "gor_nurani"
});

/* -------------------------------------------------------------------------
 *  3. Pengelompokan koleksi
 * ------------------------------------------------------------------------- */

/** Dimuat begitu situs dibuka, sebelum siapa pun masuk. */
export const KOLEKSI_UMUM = Object.freeze([
  KOLEKSI.PENGUMUMAN,
  KOLEKSI.GALERI,
  KOLEKSI.PROGRAM,
  KOLEKSI.KAS,
  KOLEKSI.USAHA,
  KOLEKSI.PENGADUAN,
  KOLEKSI.PENGURUS_TAMPIL,
  KOLEKSI.BATAS_RT,
  KOLEKSI.JADWAL,
  KOLEKSI.TAUTAN,
  KOLEKSI.JENIS_SURAT,
  KOLEKSI.FASILITAS,
  KOLEKSI.FASUM,
  KOLEKSI.RUTIN,
  KOLEKSI.BANSOS,
  KOLEKSI.BERKAS,
  KOLEKSI.FORUM_TOPIK,
  KOLEKSI.FORUM_KOMENTAR
]);

/** Dimuat hanya setelah pengurus masuk. Warga akan ditolak aturan Firestore. */
export const KOLEKSI_PENGURUS = Object.freeze([
  KOLEKSI.PENGADUAN_KONTAK,
  KOLEKSI.SURAT,
  KOLEKSI.RESERVASI,
  KOLEKSI.USAHA_BARU,
  KOLEKSI.WARGA,
  KOLEKSI.PENGURUS,
  KOLEKSI.BANSOS_PENERIMA
]);

/** Kiriman yang bisa dilacak sendiri oleh warga yang mengirimnya. */
export const KOLEKSI_KIRIMAN = Object.freeze([
  KOLEKSI.SURAT,
  KOLEKSI.RESERVASI,
  KOLEKSI.USAHA_BARU
]);

/** Semua dokumen tetap, dimuat sekaligus saat situs dibuka. */
export const DOKUMEN_TETAP = Object.freeze(Object.values(KONTEN));

/**
 * Koleksi yang isinya TIDAK punya kolom "dibuat", jadi tidak bisa diurutkan
 * berdasarkan waktu. Kalau koleksi di sini ikut diurutkan, Firestore
 * mengembalikan daftar kosong tanpa pesan galat apa pun.
 */
export const TANPA_URUTAN = Object.freeze([
  KOLEKSI.PENGURUS,
  KOLEKSI.WARGA,
  KOLEKSI.BATAS_RT,
  KOLEKSI.USAHA,
  KOLEKSI.JADWAL,
  KOLEKSI.TAUTAN,
  KOLEKSI.JENIS_SURAT,
  KOLEKSI.FASILITAS,
  KOLEKSI.FASUM,
  KOLEKSI.RUTIN,
  KOLEKSI.BANSOS
]);

/* -------------------------------------------------------------------------
 *  4. Alamat halaman
 *
 *  Ditulis setelah tanda pagar, misalnya #/surat. Dipakai di kode; di
 *  dalam markup boleh ditulis langsung sebagai href="#/surat" karena di
 *  sana salah ketik langsung terlihat waktu diklik.
 * ------------------------------------------------------------------------- */

export const JALUR = Object.freeze({
  BERANDA: "/",
  PROFIL: "/profil",
  PENGURUS: "/pengurus",
  PETA: "/peta",
  LAYANAN: "/layanan",
  SURAT: "/surat",
  PENGADUAN: "/pengaduan",
  RESERVASI: "/reservasi",
  KEPENDUDUKAN: "/kependudukan",
  BERITA: "/berita",
  KALENDER: "/kalender",
  GALERI: "/galeri",
  TRANSPARANSI: "/transparansi",
  FORUM: "/forum",
  KAS: "/kas",
  PROGRAM: "/program",
  UMKM: "/umkm",
  DAFTAR_USAHA: "/daftar-usaha",
  BANSOS: "/bansos",
  TAUTAN: "/tautan",
  MAJELIS_TAKLIM: "/majelis-taklim",
  GOR_NURANI: "/gor-nurani",
  BERKAS: "/berkas",
  KONTAK: "/kontak",
  MASUK: "/masuk",
  AKUN: "/akun",
  KELOLA: "/kelola",
  CARI: "/cari"
});

/* -------------------------------------------------------------------------
 *  5. Nilai tetap lain
 * ------------------------------------------------------------------------- */

/** Status kiriman warga. Ditulis apa adanya ke Firestore. */
export const STATUS = Object.freeze({
  BARU: "baru",
  PROSES: "proses",
  SELESAI: "selesai",
  DITOLAK: "ditolak",
  AKTIF: "aktif"
});

/**
 * Pilihan status yang boleh dipasang pengurus pada kiriman warga, beserta
 * sebutannya di layar. Urutannya sengaja mengikuti perjalanan sebuah
 * kiriman, bukan urutan abjad.
 */
export const PILIHAN_STATUS = Object.freeze([
  { nilai: STATUS.BARU, label: "Diterima" },
  { nilai: STATUS.PROSES, label: "Diproses" },
  { nilai: STATUS.SELESAI, label: "Selesai" },
  { nilai: STATUS.DITOLAK, label: "Ditolak" }
]);

/** Peran pengurus. Keduanya berwenang sama; ini hanya penanda jabatan. */
export const PERAN = Object.freeze({
  MASTER: "master",
  PETUGAS: "petugas"
});

/** Kunci penyimpanan di peramban pengunjung. */
export const KUNCI_SIMPAN = Object.freeze({
  TEMA: "tema",
  ANTREAN: "antrean-",

  /* Penanda bahwa peramban ini PERNAH dipakai masuk. Bukan bukti, dan
     bukan pengaman: yang menentukan siapa yang masuk tetap Firebase, dan
     yang menjaga data tetap aturan Firestore di server. Penanda ini cuma
     dipakai untuk menjawab satu pertanyaan sebelum apa pun diunduh --
     "perlukah pustaka masuk diambil sekarang?" Alasannya di catatan di
     kepala src/sumber/akun.js. */
  PERNAH_MASUK: "pernah-masuk"
});
