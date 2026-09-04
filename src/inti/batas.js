/**
 * ===========================================================================
 *  BATAS RW 02 -- gambaran pengurus, disalin ke dalam kode
 * ===========================================================================
 *
 *  LAPIS 1 (inti). Tidak mengimpor apa pun.
 *
 *  ASALNYA
 *  Digambar pengurus di Google My Maps pada 4 September 2026, lalu diekspor
 *  sebagai KML. Berkas aslinya ada di public/batas-rw02.kml, jadi ikut
 *  terbit bersama situs dan bisa diunduh siapa pun lewat
 *  <alamat situs>/batas-rw02.kml -- lalu dibuka lagi di Google My Maps
 *  kalau batasnya perlu diubah. Satu salinan saja, sengaja: dua salinan
 *  berakhir dengan satu yang basi dan tidak ada yang tahu mana yang benar.
 *
 *  KALAU BATASNYA BERUBAH: sunting di My Maps, ekspor KML baru, timpa
 *  berkas di public/, lalu perbarui titik di bawah dari berkas itu.
 *
 *  KENAPA DISALIN KE KODE, BUKAN CUKUP DISEMATKAN
 *  Sematan Google My Maps hidup di akun orang yang menggambarnya. Kalau
 *  akunnya hilang, petanya diganti, atau bagi-pakainya dicabut, batas
 *  wilayah di situs ikut hilang tanpa ada yang tahu penyebabnya. Titik-titik
 *  di bawah ini milik situs sendiri dan tidak bisa hilang begitu saja.
 *
 *  URUTAN ANGKANYA
 *  [lintang, bujur] -- KEBALIKAN dari KML, yang menulis bujur dulu. Ini
 *  mengikuti Leaflet. Salah urutan tidak memunculkan galat; petanya cuma
 *  melompat ke Samudra Hindia, dan itu susah dilacak kalau tidak diingat.
 *
 *  Titik penutup dari KML sengaja dibuang. Leaflet menutup poligonnya
 *  sendiri, dan titik ganda membuat sudut terakhir tergambar dua kali.
 *
 *  BUKAN BATAS RESMI PEMERINTAH. Google tidak punya data batas RW untuk
 *  Indonesia; cakupannya berhenti di kabupaten/kota. Garis ini gambaran
 *  pengurus RW 02 untuk memudahkan warga, bukan dokumen hukum.
 */

/** Titik sudut batas wilayah, urut memutar. */
export const BATAS_RW = [
  [-6.1292393, 106.4960183],
  [-6.1295185, 106.4960363],
  [-6.1296794, 106.4960493],
  [-6.1297619, 106.4960531],
  [-6.1297984, 106.4960551],
  [-6.1298363, 106.4960529],
  [-6.1302092, 106.4960655],
  [-6.1301990, 106.4962297],
  [-6.1302662, 106.4962277],
  [-6.1304291, 106.4962394],
  [-6.1306509, 106.4962633],
  [-6.1308365, 106.4962673],
  [-6.1310047, 106.4962726],
  [-6.1309874, 106.4964026],
  [-6.1309770, 106.4966141],
  [-6.1309292, 106.4972473],
  [-6.1306653, 106.4972408],
  [-6.1306582, 106.4974111],
  [-6.1306586, 106.4974956],
  [-6.1306537, 106.4975868],
  [-6.1306466, 106.4977230],
  [-6.1306404, 106.4977931],
  [-6.1306408, 106.4978403],
  [-6.1306270, 106.4978464],
  [-6.1305827, 106.4978457],
  [-6.1305066, 106.4978419],
  [-6.1304728, 106.4978439],
  [-6.1304216, 106.4978471],
  [-6.1302962, 106.4978446],
  [-6.1302922, 106.4978802],
  [-6.1301176, 106.4978702],
  [-6.1301163, 106.4977364],
  [-6.1300630, 106.4977317],
  [-6.1299375, 106.4977205],
  [-6.1297213, 106.4977093],
  [-6.1295235, 106.4977120],
  [-6.1294459, 106.4977046],
  [-6.1293550, 106.4977026],
  [-6.1293059, 106.4977017],
  [-6.1292621, 106.4977036],
  [-6.1291874, 106.4976958],
  [-6.1291514, 106.4976878],
  [-6.1291221, 106.4976864],
  [-6.1290847, 106.4976878],
  [-6.1290411, 106.4976824],
  [-6.1290454, 106.4975026],
  [-6.1290567, 106.4973496],
  [-6.1290660, 106.4970301],
  [-6.1290740, 106.4966565],
  [-6.1292300, 106.4966547],
  [-6.1292340, 106.4965323]
];

/** Titik tengah kotak batas. Dipakai memusatkan peta. */
export const PUSAT_RW = [-6.1300229, 106.4969493];

/**
 * Kotak terluar batas: [[selatan, barat], [utara, timur]].
 * Dipakai memangkas tampilan peta supaya pas seluruh wilayah, bukan
 * memakai perbesaran tetap yang ikut menampilkan RW sebelah.
 */
export const KOTAK_RW = [[-6.1310047, 106.4960183], [-6.1290411, 106.4978802]];

/** Luas kira-kira dalam meter persegi, dihitung dari titik di atas. */
export const LUAS_RW_M2 = 34899;

/** Luas dalam hektar, dibulatkan dua angka di belakang koma. */
export const LUAS_RW_HEKTAR = 3.49;

/** Ukuran kotak batas dalam meter, untuk keterangan di layar. */
export const LEBAR_RW_M = 206;
export const TINGGI_RW_M = 218;
