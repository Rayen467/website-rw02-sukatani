/**
 * ===========================================================================
 *  SAMBUNGAN FIREBASE -- dinyalakan sekali, dipakai seluruh situs
 * ===========================================================================
 */

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";

export const konfigurasi = {
  apiKey: "AIzaSyAWCz3z7RNnNZOoAs217AyRTZCLcysE08Q",
  authDomain: "perumahansukatanirw02.firebaseapp.com",
  projectId: "perumahansukatanirw02",
  storageBucket: "perumahansukatanirw02.firebasestorage.app",
  messagingSenderId: "320438118706",
  appId: "1:320438118706:web:cadfa61b7afe4bf3afcf2b"
};

export const app = initializeApp(konfigurasi);
export const db = getFirestore(app);

/*
 * Pesan autentikasi sengaja tidak membedakan "email tidak ada" dan
 * "password salah". Itu mencegah halaman login menjadi alat untuk menebak
 * alamat email mana yang sudah terdaftar.
 */
const TERJEMAHAN = [
  ["verification-send-failed", "Akun sudah dibuat, tetapi tautan verifikasi belum terkirim. Buka Akun Saya dan pilih Kirim ulang tautan."],
  ["password-policy", "Kata sandi belum memenuhi kebijakan keamanan akun."],
  ["account-exists-with-different-credential", "Alamat email ini sudah terhubung dengan metode masuk lain. Gunakan metode yang sama seperti saat akun dibuat."],
  ["credential-already-in-use", "Metode masuk ini sudah terhubung dengan akun lain."],
  ["user-disabled", "Akun ini tidak dapat digunakan. Hubungi pengurus bila Anda merasa ini keliru."],
  ["popup-closed", "Jendela Google ditutup sebelum proses masuk selesai."],
  ["cancelled-popup", "Proses masuk Google dibatalkan."],
  ["popup-blocked", "Jendela Google diblokir peramban. Izinkan pop-up untuk situs ini lalu coba lagi."],
  ["unauthorized-domain", "Domain situs belum diizinkan pada Firebase Authentication."],
  ["permission-denied", "Akses ditolak oleh aturan keamanan server."],
  ["api-key-not-valid", "Konfigurasi Firebase tidak valid."],
  ["email-already-in-use", "Pendaftaran tidak dapat diselesaikan dengan data tersebut. Coba masuk atau gunakan Lupa sandi."],
  ["invalid-email", "Format alamat email tidak valid."],
  ["weak-password", "Kata sandi belum memenuhi kebijakan keamanan akun."],
  ["invalid-credential", "Email atau kata sandi tidak cocok."],
  ["wrong-password", "Email atau kata sandi tidak cocok."],
  ["user-not-found", "Email atau kata sandi tidak cocok."],
  ["too-many-requests", "Terlalu banyak percobaan. Tunggu beberapa menit sebelum mencoba kembali."],
  ["operation-not-allowed", "Metode masuk ini belum diaktifkan pada Firebase Authentication."],
  ["network", "Sambungan ke layanan autentikasi gagal. Periksa jaringan lalu coba lagi."]
];

export function pesanRamah(err) {
  const kode = String((err && err.code) || "");
  for (const [kunci, pesan] of TERJEMAHAN) {
    if (kode.includes(kunci)) return pesan;
  }
  return "Proses akun belum berhasil. Periksa data dan coba kembali.";
}
