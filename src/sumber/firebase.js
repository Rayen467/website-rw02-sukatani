/**
 * ===========================================================================
 *  SAMBUNGAN FIREBASE -- dinyalakan sekali, dipakai seluruh situs
 * ===========================================================================
 *
 *  LAPIS 2 (sumber). Boleh mengimpor: inti/
 *
 *  Berkas ini HANYA menyalakan sambungan dan menerjemahkan pesan galat.
 *  Tidak ada perintah baca-tulis di sini -- itu ada di dua tetangganya:
 *
 *      sumber/akun.js   masuk, daftar, keluar, lupa sandi
 *      sumber/data.js   membaca dan menulis isi situs
 *
 *  Halaman TIDAK BOLEH mengimpor berkas ini langsung untuk mengambil auth
 *  atau db. Kalau sebuah halaman butuh data, panggil fungsi di data.js;
 *  kalau fungsinya belum ada, tambahkan di sana. Aturan ini yang membuat
 *  seluruh perintah ke server bisa dilihat cukup dengan membuka satu berkas.
 *
 *  TENTANG NILAI DI BAWAH
 *  Nilai konfigurasi ini memang dirancang untuk ditaruh di halaman web dan
 *  boleh dilihat siapa pun. Yang menjaga data adalah aturan keamanan
 *  Firestore, bukan kerahasiaan nilai ini. Yang TIDAK BOLEH masuk ke sini:
 *  berkas kunci service account dari konsol Firebase.
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const konfigurasi = {
  apiKey: "AIzaSyAWCz3z7RNnNZOoAs217AyRTZCLcysE08Q",
  authDomain: "perumahansukatanirw02.firebaseapp.com",
  projectId: "perumahansukatanirw02",
  storageBucket: "perumahansukatanirw02.firebasestorage.app",
  messagingSenderId: "320438118706",
  appId: "1:320438118706:web:cadfa61b7afe4bf3afcf2b"
};

const app = initializeApp(konfigurasi);

export const auth = getAuth(app);
auth.languageCode = "id";
export const db = getFirestore(app);

/* -------------------------------------------------------------------------
 *  Pesan galat
 *
 *  Firebase mengembalikan kode seperti "auth/invalid-credential". Warga
 *  tidak perlu membaca itu. Setiap kode diterjemahkan jadi satu kalimat
 *  yang menyebut apa yang harus dilakukan, bukan sekadar apa yang salah.
 * ------------------------------------------------------------------------- */

const TERJEMAHAN = [
  ["verification-send-failed", "Akun sudah dibuat, tetapi tautan pemastian belum terkirim. Buka Akun Saya dan pilih Kirim ulang tautan."],
  ["user-disabled", "Akun ini dinonaktifkan. Hubungi pengurus untuk memeriksa akses Anda."],
  ["popup-closed", "Jendela masuk ditutup sebelum selesai."],
  ["cancelled-popup", "Jendela masuk ditutup sebelum selesai."],
  ["popup-blocked", "Jendela masuk diblokir peramban. Izinkan pop-up untuk situs ini."],
  ["unauthorized-domain", "Alamat situs ini belum didaftarkan di Firebase. Tambahkan di Authentication, bagian Settings, Authorized domains."],
  ["permission-denied", "Ditolak aturan keamanan. Pastikan aturan Firestore sudah dipasang dan akun Anda berhak."],
  ["api-key-not-valid", "Kunci API tidak cocok. Periksa konfigurasi Firebase."],
  ["email-already-in-use", "Alamat email itu sudah terdaftar. Coba masuk, atau pakai Lupa sandi."],
  ["invalid-email", "Alamat email tidak sah."],
  ["weak-password", "Kata sandi terlalu mudah ditebak. Pakai minimal 8 huruf atau angka."],
  ["invalid-credential", "Email atau kata sandi tidak cocok."],
  ["wrong-password", "Email atau kata sandi tidak cocok."],
  ["user-not-found", "Email atau kata sandi tidak cocok."],
  ["too-many-requests", "Terlalu banyak percobaan. Tunggu beberapa menit, lalu coba lagi."],
  ["operation-not-allowed", "Cara masuk ini belum dinyalakan di pengaturan Firebase."],
  ["network", "Sambungan ke server gagal. Periksa jaringan."]
];

/** Menerjemahkan galat Firebase menjadi kalimat yang bisa dimengerti warga. */
export function pesanRamah(err) {
  const kode = (err && err.code) || "";
  for (const [kunci, pesan] of TERJEMAHAN) {
    if (kode.includes(kunci)) return pesan;
  }
  return "Gagal: " + (kode || (err && err.message) || "penyebab tidak diketahui");
}
