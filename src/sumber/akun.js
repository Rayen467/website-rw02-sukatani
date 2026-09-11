/**
 * ===========================================================================
 *  AKUN -- masuk, daftar, keluar
 * ===========================================================================
 *
 *  LAPIS 2 (sumber). Boleh mengimpor: inti/, sumber/firebase.js, sumber/pintu.js
 *
 *  Berkas ini hanya berurusan dengan SIAPA yang membuka situs. Apa yang
 *  boleh dia lakukan setelah masuk bukan urusan di sini -- itu ditentukan
 *  aturan Firestore di server, dan ditampilkan lewat keadaan/sesi.svelte.js.
 *
 *  Fungsi di sini melempar galat apa adanya. Yang memanggil bertugas
 *  menangkapnya dan menampilkannya lewat pesanRamah().
 *
 *  ---------------------------------------------------------------------
 *  KENAPA PUSTAKA MASUK DIUNDUH BELAKANGAN, DAN TIDAK OLEH SEMUA ORANG
 *  ---------------------------------------------------------------------
 *
 *  Pustaka masuk Firebase besarnya sekitar 120 KB -- seperempat dari
 *  seluruh kode situs ini, lebih besar daripada tiga puluh satu halamannya
 *  digabung. Padahal hampir semua yang dibuka warga tidak memerlukannya:
 *  pengumuman, agenda, laporan kas, galeri, direktori usaha, peta, dan
 *  nomor kontak semuanya terbuka tanpa masuk. Yang benar-benar butuh masuk
 *  cuma pengurus, dan warga yang mengajukan surat, meminjam fasilitas,
 *  atau ikut polling.
 *
 *  Jadi pertanyaannya: bagaimana tahu perlu-tidaknya SEBELUM mengunduh?
 *
 *  Jawabannya satu penanda kecil yang DITULIS SITUS INI SENDIRI. Setiap
 *  kali Firebase memberi tahu ada yang masuk, penanda dipasang; setiap
 *  kali ia memberi tahu tidak ada, penanda dicabut. Jadi penanda itu
 *  mengikuti persis apa yang Firebase simpan, tapi dalam bentuk yang
 *  dikendalikan berkas ini.
 *
 *  Yang sengaja TIDAK dilakukan: mengintip penyimpanan dalam Firebase
 *  sendiri. Namanya tidak pernah dijanjikan tetap, dan kalau suatu hari
 *  berubah, pengurus yang sudah masuk akan terlihat keluar tanpa ada yang
 *  tahu sebabnya.
 *
 *  KALAU PENANDANYA HILANG, situs tidak rusak. Yang terjadi cuma pustaka
 *  masuk tidak diambil di awal. Begitu orangnya membuka halaman Masuk,
 *  Akun Saya, atau Kelola, pustakanya diambil, dan sesi lamanya langsung
 *  pulih sendiri tanpa perlu mengetik apa pun -- karena yang menyimpan
 *  sesi tetap Firebase, bukan penanda ini. Ketiga halaman itu memanggil
 *  siapkanAkun() supaya pemulihan itu terjadi tanpa ditunggu.
 *
 *  Ini soal kuota warga, BUKAN soal keamanan. Penanda ini tidak memberi
 *  hak apa pun kepada siapa pun. Orang yang memalsukannya cuma membuat
 *  peramban sendiri mengunduh 120 KB yang tidak ia perlukan.
 */

import { KUNCI_SIMPAN } from "../inti/nama.js";
import { simpanan } from "../inti/peramban.js";

/* Isi sumber/pintu.js, terisi sekali saat pustakanya selesai diunduh.
   Selama masih null, berarti pustakanya memang belum pernah diperlukan. */
let pintu = null;
let unduhan = null;

/* Fungsi dari mulai.js yang ingin diberi tahu setiap kali ada yang masuk
   atau keluar. Disimpan di sini karena pemantauannya baru bisa dipasang
   setelah pustakanya ada, dan itu bisa terjadi jauh setelah situs menyala
   -- misalnya waktu tombol Masuk ditekan. */
let saatBerubah = null;
let identitasSebelumnya;
let lepas = null;
let dilepas = false;

function tandaiPernahMasuk(ada) {
  if (ada) simpanan.tulis(KUNCI_SIMPAN.PERNAH_MASUK, "1");
  else simpanan.hapus(KUNCI_SIMPAN.PERNAH_MASUK);
}

/**
 * Mengunduh pustaka masuk, sekali saja, lalu memasang pemantauannya.
 */
function bukaPintu() {
  if (unduhan) return unduhan;
  unduhan = import("./pintu.js").then((p) => {
    pintu = p;
    if (saatBerubah && !dilepas) {
      lepas = p.pantau((u) => {
        const identitas = JSON.stringify(u ? [u.uid, u.email, u.emailVerified] : null);
        if (identitas === identitasSebelumnya) return;
        identitasSebelumnya = identitas;
        tandaiPernahMasuk(!!u);
        return saatBerubah(u);
      });
    }
    return p;
  });
  unduhan.catch(() => { unduhan = null; });
  return unduhan;
}

export function siapkanAkun() {
  return bukaPintu();
}

export function pantauMasuk(fn) {
  saatBerubah = fn;
  dilepas = false;

  if (simpanan.baca(KUNCI_SIMPAN.PERNAH_MASUK)) {
    bukaPintu();
  } else {
    identitasSebelumnya = JSON.stringify(null);
    fn(null);
  }

  return () => {
    dilepas = true;
    if (lepas) lepas();
    lepas = null;
    saatBerubah = null;
  };
}

export function penggunaSekarang() {
  return pintu ? pintu.auth.currentUser : null;
}

function emailBersih(email) {
  return String(email || "").trim().toLowerCase();
}

export async function masukGoogle() {
  return (await bukaPintu()).masukGoogle();
}

/** Login email biasa. Untuk akun Gmail asli petugas, gunakan tombol Google. */
export async function masukEmail(email, sandi) {
  return (await bukaPintu()).masukEmail(emailBersih(email), sandi);
}

/**
 * Mendaftarkan akun baru.
 *
 * Pendaftaran ini HANYA untuk warga. Hak pengurus tidak pernah didapat
 * lewat pendaftaran -- hanya pengurus yang sudah menjabat yang bisa
 * memberikannya, lewat halaman Kelola.
 */
export async function daftarAkun(email, sandi, nama) {
  return (await bukaPintu()).daftarAkun(emailBersih(email), sandi, nama);
}

export async function lupaSandi(email) {
  return (await bukaPintu()).lupaSandi(emailBersih(email));
}

export async function kirimUlangVerifikasi() {
  return (await bukaPintu()).kirimUlangVerifikasi();
}

export async function periksaVerifikasi() {
  return (await bukaPintu()).periksaVerifikasi();
}

export async function keluar() {
  return (await bukaPintu()).keluar();
}
