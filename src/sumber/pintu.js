/**
 * ===========================================================================
 *  PINTU -- satu-satunya berkas utama yang menyentuh pustaka masuk Firebase
 * ===========================================================================
 *
 * Jalur login utama sengaja tetap kecil agar sesi warga/petugas mudah diuji.
 * Pembuatan akun Petugas memakai modul sekunder terpisah sehingga admin yang
 * sedang membuka Portal Petugas tidak terganti sesinya.
 */

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onIdTokenChanged,
  reload,
  getIdToken,
  validatePassword
} from "firebase/auth";
import { app } from "./firebase.js";

export const auth = getAuth(app);
auth.languageCode = "id";

export const PANJANG_SANDI_MIN = 15;
export const PANJANG_SANDI_MAKS = 128;

/** Memasang pemantauan. Mengembalikan fungsi untuk melepasnya lagi. */
export function pantau(saatBerubah) {
  return onIdTokenChanged(auth, saatBerubah);
}

export function masukGoogle() {
  const penyedia = new GoogleAuthProvider();
  penyedia.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, penyedia);
}

/** Menerima email yang sudah dinormalisasi oleh lapisan akun. */
export function masukEmail(email, sandi) {
  return signInWithEmailAndPassword(auth, email, sandi);
}

/**
 * Memeriksa password baru sebelum akun dibuat.
 * Minimum lokal 15 karakter dipakai untuk jalur single-factor dan tetap
 * menghormati password policy Firebase bila administrator mengaktifkannya.
 */
export async function validasiKataSandi(sandi) {
  const nilai = String(sandi ?? "");
  const masalah = [];

  if (nilai.length < PANJANG_SANDI_MIN) masalah.push(`Gunakan minimal ${PANJANG_SANDI_MIN} karakter.`);
  if (nilai.length > PANJANG_SANDI_MAKS) masalah.push(`Gunakan maksimal ${PANJANG_SANDI_MAKS} karakter.`);

  try {
    const status = await validatePassword(auth, nilai);
    if (!status.isValid) {
      if (status.meetsMinPasswordLength === false) masalah.push("Belum memenuhi panjang minimum kebijakan Firebase.");
      if (status.meetsMaxPasswordLength === false) masalah.push("Melebihi panjang maksimum kebijakan Firebase.");
      if (status.containsLowercaseLetter === false) masalah.push("Kebijakan Firebase saat ini meminta huruf kecil.");
      if (status.containsUppercaseLetter === false) masalah.push("Kebijakan Firebase saat ini meminta huruf besar.");
      if (status.containsNumericCharacter === false) masalah.push("Kebijakan Firebase saat ini meminta angka.");
      if (status.containsNonAlphanumericCharacter === false) masalah.push("Kebijakan Firebase saat ini meminta karakter non-alfanumerik.");
    }
  } catch {
    /* createUserWithEmailAndPassword tetap menjadi penjaga akhir server. */
  }

  return { valid: masalah.length === 0, masalah: [...new Set(masalah)] };
}

/** Membuat akun warga email/password lalu mengirim verifikasi email. */
export async function daftarAkun(email, sandi, nama) {
  const cek = await validasiKataSandi(sandi);
  if (!cek.valid) {
    const err = new Error(cek.masalah.join(" "));
    err.code = "auth/password-policy";
    throw err;
  }

  const hasil = await createUserWithEmailAndPassword(auth, email, sandi);
  if (nama) await updateProfile(hasil.user, { displayName: nama });
  try {
    await sendEmailVerification(hasil.user);
  } catch (penyebab) {
    const err = new Error(
      "Akun sudah dibuat, tetapi tautan verifikasi belum terkirim. Buka Akun Saya dan pilih Kirim ulang tautan.",
      { cause: penyebab }
    );
    err.code = "auth/verification-send-failed";
    throw err;
  }
  return hasil.user;
}

/** Reset password berbasis email. Resolver username berada di lapisan akun. */
export async function lupaSandi(email) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err) {
    const kode = String(err?.code || "");
    if (kode.includes("user-not-found")) return;
    throw err;
  }
}

export function kirimUlangVerifikasi() {
  if (!auth.currentUser) throw new Error("belum masuk");
  return sendEmailVerification(auth.currentUser);
}

export async function periksaVerifikasi() {
  const u = auth.currentUser;
  if (!u) throw new Error("Silakan masuk terlebih dahulu.");
  await reload(u);
  if (auth.currentUser !== u) return false;
  await getIdToken(u, true);
  return auth.currentUser === u && u.emailVerified;
}

export function keluar() {
  return signOut(auth);
}
