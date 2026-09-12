/**
 * Identitas login petugas.
 *
 * Firebase Authentication memakai email sebagai identifier untuk provider
 * email/password. Username di situs RW 02 dipakai sebagai alias yang dipetakan
 * ke email akun Firebase. Password tetap hanya ditangani Firebase Auth.
 */

export const KOLEKSI_LOGIN_PETUGAS = "login_petugas";

const POLA_USERNAME = /^[a-z0-9][a-z0-9._-]{2,30}[a-z0-9]$/;
const DILARANG = new Set([
  "admin",
  "administrator",
  "root",
  "master",
  "petugas",
  "support",
  "firebase",
  "rw02",
  "sukatani"
]);

export function bersihkanUsername(nilai) {
  return String(nilai || "").trim().toLowerCase();
}

export function periksaUsername(nilai) {
  const username = bersihkanUsername(nilai);
  const masalah = [];

  if (username.length < 4 || username.length > 32) {
    masalah.push("Username harus 4 sampai 32 karakter.");
  }
  if (username && !POLA_USERNAME.test(username)) {
    masalah.push("Gunakan huruf kecil, angka, titik, garis bawah, atau tanda minus; awal dan akhir harus huruf/angka.");
  }
  if (DILARANG.has(username)) {
    masalah.push("Username tersebut dicadangkan. Pilih username lain.");
  }

  return {
    username,
    valid: masalah.length === 0,
    masalah
  };
}
