/**
 * ===========================================================================
 *  MULAI -- menyalakan situs dan menyambungkan tiga keadaan
 * ===========================================================================
 *
 *  LAPIS 3 (keadaan). Boleh mengimpor: inti/, sumber/, keadaan/ lainnya.
 *
 *  INI SATU-SATUNYA TEMPAT YANG MEMANTAU FIREBASE.
 *
 *  Tiga berkas keadaan sengaja tidak saling memanggil: sesi tidak tahu apa
 *  itu isi, isi tidak tahu apa itu pesan. Yang menyambungkan ketiganya
 *  cuma berkas ini. Untungnya, kalau ada yang salah dengan urutan menyala
 *  -- data kosong padahal sudah masuk, menu Kelola telat muncul --
 *  tempat mencarinya hanya satu.
 *
 *  URUTAN MENYALA
 *      1. Isi umum diambil duluan, tanpa menunggu siapa pun masuk.
 *      2. Firebase memeriksa sesi lama. Ini butuh waktu, dan selama itu
 *         sesi.siap masih false.
 *      3. Setelah tahu siapa yang masuk, baru data khususnya diambil.
 */

import { pantauMasuk, penggunaSekarang } from "../sumber/akun.js";
import { ambilPeran, ambilProfilWarga } from "../sumber/data.js";
import { sesi, namaPeran } from "./sesi.svelte.js";
import { muatSemuaKonten, muatUmum, muatPengurus, muatMilikSaya, muatSuara } from "./isi.svelte.js";
import { beriTahu } from "./pesan.svelte.js";

/** Mengosongkan sesi. Dipakai saat keluar dan saat memang belum masuk. */
function kosongkanSesi() {
  sesi.pengguna = null;
  sesi.peran = null;
  sesi.profilWarga = null;
  sesi.terverifikasi = true;
  sesi.siap = true;
}

/**
 * Menyalakan situs. Dipanggil sekali dari App.svelte.
 */
export function mulaiPantauan() {
  /* Tanpa menunggu. Warga yang cuma mau membaca pengumuman tidak perlu
     menunggu Firebase selesai memeriksa sesi lama. */
  muatSemuaKonten();
  muatUmum();

  pantauMasuk(async (u) => {
    if (!u) {
      kosongkanSesi();
      return;
    }

    const dasar = {
      email: String(u.email || "").toLowerCase(),
      nama: u.displayName || u.email,
      uid: u.uid
    };

    /* PENJAGA UTAMA. Daftar pengurus dikunci berdasarkan alamat email.
       Tanpa kewajiban memastikan email, siapa pun bisa mendaftar memakai
       alamat email Ketua RW dan langsung mendapat akses penuh. Selama
       email belum dipastikan lewat tautan, aturan Firestore menolak semua
       tulisan, dan di sini peran sengaja tidak diambil sama sekali. */
    if (!u.emailVerified) {
      sesi.pengguna = dasar;
      sesi.peran = null;
      sesi.profilWarga = null;
      sesi.terverifikasi = false;
      sesi.siap = true;
      beriTahu("Email belum dipastikan. Buka tautan yang kami kirim ke " + u.email + ".");
      return;
    }

    sesi.pengguna = dasar;
    sesi.terverifikasi = true;

    let peran = null;
    try {
      peran = await ambilPeran(u.email);
    } catch (err) {
      /* Gagal memeriksa berarti diperlakukan sebagai warga biasa. Lebih
         aman salah menutup menu daripada salah membukanya. */
    }
    sesi.peran = peran;

    if (peran) {
      sesi.profilWarga = null;
      sesi.siap = true;
      muatPengurus();
      muatSuara();
      beriTahu("Masuk sebagai " + namaPeran(peran) + ". Menu Kelola sudah terbuka.");
      return;
    }

    try {
      sesi.profilWarga = await ambilProfilWarga(u.uid);
    } catch (err) {
      sesi.profilWarga = null;
    }
    sesi.siap = true;
    muatMilikSaya(u.uid);
    muatSuara();
    beriTahu(
      sesi.profilWarga
        ? "Masuk sebagai warga."
        : "Masuk. Lengkapi keterangan di halaman Akun Saya supaya pengurus bisa mencocokkan."
    );
  });
}

/**
 * Mengambil ulang catatan warga sendiri.
 * Dipanggil setelah warga baru mendaftarkan diri, supaya halaman Akun Saya
 * langsung menampilkan catatannya tanpa perlu memuat ulang halaman.
 */
export async function segarkanProfilWarga() {
  const u = penggunaSekarang();
  if (!u) return;
  try {
    sesi.profilWarga = await ambilProfilWarga(u.uid);
  } catch (err) {}
  muatMilikSaya(u.uid);
}
