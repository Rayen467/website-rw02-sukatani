/**
 * ===========================================================================
 *  PETA -- memeriksa tautan peta sebelum dipasang di bingkai
 * ===========================================================================
 *
 *  LAPIS 1 (inti). Tidak mengimpor apa pun.
 *
 *  KENAPA BERKAS INI ADA
 *
 *  Google Maps yang ditempel lewat iframe biasa TIDAK BISA menggambar garis
 *  batas wilayah. Yang bisa adalah peta buatan sendiri lewat Google My Maps:
 *  pengurus menggambar poligonnya di atas citra Google, lalu menempelkan
 *  tautan sematannya di halaman Kelola.
 *
 *  Artinya ada tulisan dari database yang masuk ke atribut src sebuah
 *  iframe. Itu jalan masuk yang berbahaya: petugas yang akunnya dibajak
 *  -- atau petugas yang iseng -- bisa menempelkan alamat apa pun, dan
 *  peramban akan memuatnya di dalam halaman warga.
 *
 *  Karena itu tautan TIDAK PERNAH dipakai apa adanya. Fungsi di bawah
 *  menerima hanya satu bentuk alamat, yaitu sematan Google My Maps, dan
 *  menolak segalanya yang lain dengan mengembalikan null. Yang memanggil
 *  bertugas jatuh ke peta titik biasa ketika hasilnya null.
 *
 *  Menambah bentuk alamat baru di sini berarti menambah pihak yang boleh
 *  menumpang di dalam halaman warga. Pikirkan dua kali.
 */

/** Satu-satunya bentuk alamat yang diterima. */
const SEMATAN_MYMAPS = /^https:\/\/www\.google\.com\/maps\/d\/(u\/\d+\/)?embed\?mid=[A-Za-z0-9_-]+/;

/**
 * Mengembalikan alamat sematan yang aman dipasang, atau null.
 *
 * Menerima dua bentuk yang sama-sama sering disalin pengurus:
 *   1. seluruh kode <iframe src="..."> yang disalin dari Google My Maps
 *   2. alamatnya saja
 *
 * Bentuk pertama diterima karena tombol di Google My Maps memang memberi
 * kode iframe utuh, dan menyuruh pengurus memotong sendiri bagian src-nya
 * adalah cara yang paling mudah salah.
 */
export function sematanPeta(nilai) {
  const teks = String(nilai || "").trim();
  if (!teks) return null;

  /* Kalau yang ditempel kode iframe utuh, ambil isi src-nya dulu. */
  const cocok = teks.match(/src\s*=\s*["']([^"']+)["']/i);
  const alamat = (cocok ? cocok[1] : teks).trim();

  return SEMATAN_MYMAPS.test(alamat) ? alamat : null;
}

/**
 * Benar kalau pengurus sudah mengisi sesuatu tetapi isinya tidak dikenali.
 * Dipakai untuk memberi tahu pengurus bahwa isiannya salah, bukan diam saja
 * lalu menampilkan peta lama seolah tidak terjadi apa-apa.
 */
export function sematanSalah(nilai) {
  return !!String(nilai || "").trim() && !sematanPeta(nilai);
}
