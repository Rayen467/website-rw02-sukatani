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
 *
 * Dipanggil dua arah: dari pantauMasuk() waktu situs menyala kalau
 * penandanya ada, dan dari setiap tombol yang memang butuh masuk. Karena
 * janjinya disimpan di "unduhan", pemanggilan berikutnya memakai unduhan
 * yang sama -- termasuk kalau dua tombol ditekan berbarengan.
 */
function bukaPintu() {
  if (unduhan) return unduhan;
  unduhan = import("./pintu.js").then((p) => {
    pintu = p;
    if (saatBerubah && !dilepas) {
      lepas = p.pantau((u) => {
        const identitas = JSON.stringify(u ? [u.uid, u.email, u.emailVerified] : null);
        /* Penyegaran token rutin tidak boleh mengosongkan formulir yang
           sedang diisi. */
        if (identitas === identitasSebelumnya) return;
        identitasSebelumnya = identitas;
        tandaiPernahMasuk(!!u);
        return saatBerubah(u);
      });
    }
    return p;
  });
  /* Unduhan yang gagal -- jaringan putus di tengah -- tidak boleh
     mengunci pintunya selamanya. Dilupakan supaya percobaan berikutnya
     benar-benar mencoba lagi. */
  unduhan.catch(() => { unduhan = null; });
  return unduhan;
}

/**
 * Meminta pustaka masuk disiapkan lebih dulu, tanpa menunggu hasilnya.
 *
 * Dipanggil halaman yang sudah pasti berurusan dengan akun: Masuk, Akun
 * Saya, dan Kelola. Gunanya dua: mempercepat halaman-halaman itu, dan
 * memulihkan sesi lama kalau penandanya hilang.
 *
 * Janjinya dikembalikan supaya yang perlu boleh menunggu, tetapi halaman
 * sengaja tidak menunggunya: layar harus tetap tergambar walau unduhannya
 * pelan.
 */
export function siapkanAkun() {
  return bukaPintu();
}

/**
 * Memantau siapa yang sedang masuk.
 * Dipanggil sekali saat situs dinyalakan. Fungsi yang diberikan akan
 * dipanggil ulang setiap kali ada yang masuk atau keluar, termasuk saat
 * halaman baru dibuka dan Firebase selesai memeriksa sesi lama.
 */
export function pantauMasuk(fn) {
  saatBerubah = fn;
  dilepas = false;

  if (simpanan.baca(KUNCI_SIMPAN.PERNAH_MASUK)) {
    bukaPintu();
  } else {
    /* Belum pernah ada yang masuk di peramban ini, jadi tidak ada sesi
       lama yang perlu diperiksa. Jawabannya diberikan langsung, dan
       pustakanya tidak diunduh sama sekali. Efek sampingnya bagus:
       tulisan "Memeriksa sesi akun..." tidak sempat berkedip. */
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

/**
 * Siapa yang sedang masuk sekarang, atau null. Dipakai fungsi tulis.
 *
 * Selama pustakanya belum diunduh jawabannya null, dan itu memang benar:
 * pustakanya cuma tidak diunduh kalau tidak ada yang pernah masuk, atau
 * sebelum tombol masuk pertama ditekan.
 */
export function penggunaSekarang() {
  return pintu ? pintu.auth.currentUser : null;
}

function emailBersih(email) {
  return String(email || "").trim().toLowerCase();
}

export async function masukGoogle() {
  return (await bukaPintu()).masukGoogle();
}

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

/** Mengirim ulang tautan pemastian, untuk email yang tidak sampai. */
export async function kirimUlangVerifikasi() {
  return (await bukaPintu()).kirimUlangVerifikasi();
}

/** Muat status email dan token server terbaru tanpa harus keluar dahulu. */
export async function periksaVerifikasi() {
  return (await bukaPintu()).periksaVerifikasi();
}

export async function keluar() {
  return (await bukaPintu()).keluar();
}
