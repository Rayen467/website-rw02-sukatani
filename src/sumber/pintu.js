/**
 * ===========================================================================
 *  PINTU -- satu-satunya berkas yang menyentuh pustaka masuk Firebase
 * ===========================================================================
 *
 *  LAPIS 2 (sumber). Boleh mengimpor: inti/, sumber/firebase.js
 *
 *  KENAPA INI BERKAS TERSENDIRI, BUKAN DIGABUNG KE akun.js
 *
 *  Berkas ini tidak pernah diimpor secara biasa. Satu-satunya yang
 *  memanggilnya adalah akun.js, lewat import() -- dan itu yang membuat
 *  pustaka masuk keluar dari berkas utama situs.
 *
 *  Pemisahannya BUKAN soal kerapian. Kalau akun.js memanggil
 *  import("firebase/auth") langsung lalu mengambil isinya satu per satu
 *  waktu jalan, penggabung kode tidak bisa tahu fungsi mana saja yang
 *  benar-benar dipakai, jadi seluruh pustaka ikut -- 191 KB. Dengan
 *  daftar impor biasa di sini, yang tidak dipakai dibuang seperti biasa,
 *  dan sisanya tinggal sekitar 120 KB. Selisih 70 KB itu ditanggung
 *  pengurus setiap kali mereka masuk.
 *
 *  Jadi aturannya: SEMUA yang berasal dari "firebase/auth" ditulis di
 *  berkas ini, dengan impor biasa. Yang butuh, memanggil fungsi di sini.
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
  getIdToken
} from "firebase/auth";
import { app } from "./firebase.js";

export const auth = getAuth(app);
auth.languageCode = "id";

/** Memasang pemantauan. Mengembalikan fungsi untuk melepasnya lagi. */
export function pantau(saatBerubah) {
  return onIdTokenChanged(auth, saatBerubah);
}

export function masukGoogle() {
  const penyedia = new GoogleAuthProvider();
  /* Selalu tanya mau pakai akun yang mana. Tanpa ini, HP yang dipakai
     bergantian di rumah akan langsung masuk sebagai orang sebelumnya. */
  penyedia.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, penyedia);
}

export function masukEmail(email, sandi) {
  return signInWithEmailAndPassword(auth, email, sandi);
}

/**
 * Membuat akun baru, lalu langsung mengirim tautan pemastian email.
 *
 * Kegagalan mengirim tautan dibedakan dari kegagalan membuat akun, karena
 * akibatnya bagi warga berbeda jauh: yang pertama berarti akunnya sudah
 * ada dan tinggal minta tautan ulang, yang kedua berarti belum ada apa-apa.
 */
export async function daftarAkun(email, sandi, nama) {
  const hasil = await createUserWithEmailAndPassword(auth, email, sandi);
  if (nama) await updateProfile(hasil.user, { displayName: nama });
  try {
    await sendEmailVerification(hasil.user);
  } catch (penyebab) {
    const err = new Error("Akun sudah dibuat, tetapi tautan pemastian belum terkirim. Buka Akun Saya dan pilih Kirim ulang tautan.", { cause: penyebab });
    err.code = "auth/verification-send-failed";
    throw err;
  }
  return hasil.user;
}

export function lupaSandi(email) {
  return sendPasswordResetEmail(auth, email);
}

export function kirimUlangVerifikasi() {
  if (!auth.currentUser) throw new Error("belum masuk");
  return sendEmailVerification(auth.currentUser);
}

/**
 * Memuat status email dan token server terbaru tanpa harus keluar dahulu.
 *
 * Akun yang dipegang dicatat dulu, lalu dibandingkan lagi setelah setiap
 * penantian. Kalau di tengah jalan orangnya keluar atau berganti akun,
 * token yang telanjur diminta TIDAK boleh dipasang ke akun yang sekarang.
 */
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
