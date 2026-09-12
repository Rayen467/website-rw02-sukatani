/**
 * ===========================================================================
 *  PINTU -- satu-satunya berkas yang menyentuh pustaka masuk Firebase
 * ===========================================================================
 *
 * Semua primitive autentikasi Firebase ditempatkan di sini supaya halaman
 * tidak menyentuh SDK langsung. Kebijakan lokal mengikuti praktik modern:
 * - email diverifikasi untuk akun email/password,
 * - reset password selalu lewat tautan Firebase,
 * - password baru minimal 15 karakter untuk akun tanpa MFA,
 * - tidak memaksa pola huruf besar/angka/simbol buatan sendiri,
 * - mendukung passphrase panjang dan password manager,
 * - username petugas hanya alias login; password tetap tidak pernah disimpan
 *   di Firestore atau kode situs.
 */

import { initializeApp } from "firebase/app";
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
  validatePassword,
  deleteUser,
  setPersistence,
  inMemoryPersistence
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore/lite";
import { app, konfigurasi, db } from "./firebase.js";
import { KOLEKSI_LOGIN_PETUGAS, periksaUsername } from "../inti/identitas-login.js";

export const auth = getAuth(app);
auth.languageCode = "id";

export const PANJANG_SANDI_MIN = 15;
export const PANJANG_SANDI_MAKS = 128;

let authPembuatPetugas = null;
let janjiAuthPembuat = null;

/** Memasang pemantauan. Mengembalikan fungsi untuk melepasnya lagi. */
export function pantau(saatBerubah) {
  return onIdTokenChanged(auth, saatBerubah);
}

export function masukGoogle() {
  const penyedia = new GoogleAuthProvider();
  penyedia.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, penyedia);
}

function buatGalat(kode, pesan) {
  const err = new Error(pesan || kode);
  err.code = kode;
  return err;
}

async function emailDariPengenal(pengenal) {
  const nilai = String(pengenal || "").trim().toLowerCase();
  if (!nilai) return null;

  if (nilai.includes("@")) return nilai;

  const cek = periksaUsername(nilai);
  if (!cek.valid) return null;

  const acuan = await getDoc(doc(db, KOLEKSI_LOGIN_PETUGAS, cek.username));
  if (!acuan.exists()) return null;

  const email = String(acuan.data()?.email || "").trim().toLowerCase();
  return email.includes("@") ? email : null;
}

/**
 * Masuk memakai email ATAU username petugas.
 * Respons untuk alias yang tidak ditemukan tetap dibuat sama dengan kredensial
 * salah supaya halaman login tidak memberi pesan "username ada/tidak ada".
 */
export async function masukEmail(pengenal, sandi) {
  const email = await emailDariPengenal(pengenal);
  if (!email) throw buatGalat("auth/invalid-credential", "Kredensial tidak cocok.");
  return signInWithEmailAndPassword(auth, email, sandi);
}

/**
 * Memeriksa password baru sebelum akun dibuat.
 *
 * Minimum lokal 15 karakter dipakai karena jalur email/password saat ini
 * adalah single-factor. Kami tetap membaca policy Firebase bila administrator
 * menambahkan aturan server di Console. Tidak ada syarat komposisi buatan
 * sendiri; passphrase dan karakter spasi tetap diterima.
 */
export async function validasiKataSandi(sandi) {
  const nilai = String(sandi ?? "");
  const masalah = [];

  if (nilai.length < PANJANG_SANDI_MIN) {
    masalah.push(`Gunakan minimal ${PANJANG_SANDI_MIN} karakter.`);
  }
  if (nilai.length > PANJANG_SANDI_MAKS) {
    masalah.push(`Gunakan maksimal ${PANJANG_SANDI_MAKS} karakter.`);
  }

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
    /* Kalau policy server tidak bisa dibaca karena jaringan, validasi lokal
       tetap berlaku. createUserWithEmailAndPassword masih menjadi penjaga akhir. */
  }

  return {
    valid: masalah.length === 0,
    masalah: [...new Set(masalah)]
  };
}

/**
 * Membuat akun email/password lalu mengirim verifikasi email.
 * Akun yang belum terverifikasi tetap dibatasi oleh lapisan sesi + rules.
 */
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

async function ambilAuthPembuatPetugas() {
  if (authPembuatPetugas) return authPembuatPetugas;
  if (janjiAuthPembuat) return janjiAuthPembuat;

  janjiAuthPembuat = (async () => {
    const appPembuat = initializeApp(konfigurasi, "rw02-pembuat-petugas");
    const authKedua = getAuth(appPembuat);
    authKedua.languageCode = "id";
    // Akun sementara tidak boleh menetap di storage browser milik admin.
    await setPersistence(authKedua, inMemoryPersistence);
    authPembuatPetugas = authKedua;
    return authKedua;
  })();

  try {
    return await janjiAuthPembuat;
  } finally {
    janjiAuthPembuat = null;
  }
}

/**
 * Membuat akun Petugas tanpa mengganti sesi admin yang sedang membuka portal.
 * Password hanya dikirim langsung ke Firebase Auth pada app sekunder dengan
 * persistence in-memory; tidak pernah ditulis ke Firestore/localStorage.
 */
export async function daftarPetugas(email, sandi, nama) {
  const cek = await validasiKataSandi(sandi);
  if (!cek.valid) throw buatGalat("auth/password-policy", cek.masalah.join(" "));

  const pembuat = await ambilAuthPembuatPetugas();
  let penggunaBaru = null;

  try {
    const hasil = await createUserWithEmailAndPassword(pembuat, String(email || "").trim().toLowerCase(), sandi);
    penggunaBaru = hasil.user;
    if (nama) await updateProfile(penggunaBaru, { displayName: String(nama).trim() });
    await sendEmailVerification(penggunaBaru);
    return penggunaBaru;
  } catch (err) {
    if (penggunaBaru) {
      try { await deleteUser(penggunaBaru); } catch { /* best effort rollback */ }
    }
    throw err;
  }
}

export async function batalkanPetugasBaru() {
  const pembuat = await ambilAuthPembuatPetugas();
  const u = pembuat.currentUser;
  if (!u) return;
  await deleteUser(u);
}

export async function selesaikanPetugasBaru() {
  const pembuat = await ambilAuthPembuatPetugas();
  if (pembuat.currentUser) await signOut(pembuat);
}

/**
 * Reset password menerima Gmail/email atau username petugas. Respons ke layar
 * tetap anti-enumerasi; alias yang tidak ada dianggap selesai tanpa membocorkan
 * apakah username tersebut terdaftar.
 */
export async function lupaSandi(pengenal) {
  const email = await emailDariPengenal(pengenal);
  if (!email) return;
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
