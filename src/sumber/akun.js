/**
 * ===========================================================================
 *  AKUN -- masuk, daftar, keluar
 * ===========================================================================
 *
 *  LAPIS 2 (sumber). Boleh mengimpor: inti/, sumber/firebase.js
 *
 *  Berkas ini hanya berurusan dengan SIAPA yang membuka situs. Apa yang
 *  boleh dia lakukan setelah masuk bukan urusan di sini -- itu ditentukan
 *  aturan Firestore di server, dan ditampilkan lewat keadaan/sesi.svelte.js.
 *
 *  Fungsi di sini melempar galat apa adanya. Yang memanggil bertugas
 *  menangkapnya dan menampilkannya lewat pesanRamah().
 */

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from "./firebase.js";

/**
 * Memantau siapa yang sedang masuk.
 * Dipanggil sekali saat situs dinyalakan. Fungsi yang diberikan akan
 * dipanggil ulang setiap kali ada yang masuk atau keluar, termasuk saat
 * halaman baru dibuka dan Firebase selesai memeriksa sesi lama.
 */
export function pantauMasuk(saatBerubah) {
  return onAuthStateChanged(auth, saatBerubah);
}

/** Siapa yang sedang masuk sekarang, atau null. Dipakai fungsi tulis. */
export function penggunaSekarang() {
  return auth.currentUser;
}

export function masukGoogle() {
  const penyedia = new GoogleAuthProvider();
  /* Selalu tanya mau pakai akun yang mana. Tanpa ini, HP yang dipakai
     bergantian di rumah akan langsung masuk sebagai orang sebelumnya. */
  penyedia.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, penyedia);
}

function emailBersih(email) {
  return String(email || "").trim().toLowerCase();
}

export function masukEmail(email, sandi) {
  return signInWithEmailAndPassword(auth, emailBersih(email), sandi);
}

/**
 * Mendaftarkan akun baru, lalu langsung mengirim tautan pemastian email.
 *
 * Pendaftaran ini HANYA untuk warga. Hak pengurus tidak pernah didapat
 * lewat pendaftaran -- hanya pengurus yang sudah menjabat yang bisa
 * memberikannya, lewat halaman Kelola.
 */
export async function daftarAkun(email, sandi, nama) {
  const hasil = await createUserWithEmailAndPassword(auth, emailBersih(email), sandi);
  if (nama) await updateProfile(hasil.user, { displayName: nama });
  await sendEmailVerification(hasil.user);
  return hasil.user;
}

export function lupaSandi(email) {
  return sendPasswordResetEmail(auth, emailBersih(email));
}

/** Mengirim ulang tautan pemastian, untuk email yang tidak sampai. */
export function kirimUlangVerifikasi() {
  if (!auth.currentUser) throw new Error("belum masuk");
  return sendEmailVerification(auth.currentUser);
}

export function keluar() {
  return signOut(auth);
}
