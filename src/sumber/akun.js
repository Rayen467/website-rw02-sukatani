/**
 * ===========================================================================
 *  AKUN -- masuk, daftar, keluar
 * ===========================================================================
 *
 *  LAPIS 2 (sumber). Boleh mengimpor: inti/, sumber/firebase.js
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

function rapikanEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function rapikanNama(nama) {
  return String(nama || "").trim();
}

/**
 * Memantau siapa yang sedang masuk.
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

export function masukEmail(email, sandi) {
  return signInWithEmailAndPassword(auth, rapikanEmail(email), sandi);
}

/**
 * Mendaftarkan akun baru, lalu langsung mengirim tautan pemastian email.
 */
export async function daftarAkun(email, sandi, nama) {
  const emailBersih = rapikanEmail(email);
  const namaBersih = rapikanNama(nama);
  const hasil = await createUserWithEmailAndPassword(auth, emailBersih, sandi);

  if (namaBersih) {
    await updateProfile(hasil.user, { displayName: namaBersih });
  }

  await sendEmailVerification(hasil.user);
  return hasil.user;
}

export function lupaSandi(email) {
  return sendPasswordResetEmail(auth, rapikanEmail(email));
}

/** Mengirim ulang tautan pemastian, untuk email yang tidak sampai. */
export function kirimUlangVerifikasi() {
  if (!auth.currentUser) throw new Error("belum masuk");
  return sendEmailVerification(auth.currentUser);
}

export function keluar() {
  return signOut(auth);
}
