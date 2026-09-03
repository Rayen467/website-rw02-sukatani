/**
 * Sambungan ke Firebase.
 *
 * Satu-satunya berkas yang berbicara langsung dengan server. Semua halaman
 * memakai fungsi dari sini, bukan memanggil Firebase sendiri-sendiri --
 * supaya kalau nanti pindah layanan, cukup berkas ini yang diganti.
 *
 * Nilai di bawah disalin dari konsol Firebase. Nilai ini memang dirancang
 * untuk ditaruh di halaman web dan boleh dilihat siapa pun; yang menjaga
 * data adalah aturan keamanan Firestore, bukan kerahasiaan nilai ini.
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
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from "firebase/firestore";

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
export const db = getFirestore(app);

/* ------------------------------------------------------------------ *
 * Pesan galat
 * ------------------------------------------------------------------ */

/** Menerjemahkan kode galat Firebase menjadi kalimat yang bisa dimengerti. */
export function pesanRamah(err) {
  const kode = (err && err.code) || "";
  const peta = [
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
  for (const [kunci, pesan] of peta) {
    if (kode.includes(kunci)) return pesan;
  }
  return "Gagal: " + (kode || (err && err.message) || "penyebab tidak diketahui");
}

/* ------------------------------------------------------------------ *
 * Masuk dan daftar
 * ------------------------------------------------------------------ */

export function pantauMasuk(saatBerubah) {
  return onAuthStateChanged(auth, saatBerubah);
}

export function masukGoogle() {
  const penyedia = new GoogleAuthProvider();
  penyedia.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, penyedia);
}

export function masukEmail(email, sandi) {
  return signInWithEmailAndPassword(auth, email, sandi);
}

export async function daftarAkun(email, sandi, nama) {
  const hasil = await createUserWithEmailAndPassword(auth, email, sandi);
  if (nama) await updateProfile(hasil.user, { displayName: nama });
  await sendEmailVerification(hasil.user);
  return hasil.user;
}

export function lupaSandi(email) {
  return sendPasswordResetEmail(auth, email);
}

export function kirimUlangVerifikasi() {
  if (!auth.currentUser) throw new Error("belum masuk");
  return sendEmailVerification(auth.currentUser);
}

export function keluar() {
  return signOut(auth);
}

/* ------------------------------------------------------------------ *
 * Membaca data
 * ------------------------------------------------------------------ */

/** Koleksi yang tidak punya kolom waktu, jadi tidak bisa diurutkan. */
const TANPA_URUTAN = [
  "pengurus", "warga", "batas_rt", "usaha", "jadwal",
  "tautan", "jenis_surat", "fasilitas", "fasum", "rutin", "bansos"
];

export async function ambilKoleksi(nama, batas = 200) {
  const acuan = TANPA_URUTAN.includes(nama)
    ? collection(db, nama)
    : query(collection(db, nama), orderBy("dibuat", "desc"), limit(batas));
  const cuplikan = await getDocs(acuan);
  const isi = [];
  cuplikan.forEach((d) => isi.push({ id: d.id, ...d.data() }));
  return isi;
}

export async function ambilKonten(bagian) {
  const d = await getDoc(doc(db, "konten", bagian));
  return d.exists() ? d.data() : null;
}

/** Kiriman milik satu pengguna. Tanpa pengurutan supaya tidak butuh indeks. */
export async function ambilMilikSaya(nama, uid) {
  const cuplikan = await getDocs(query(collection(db, nama), where("uid", "==", uid)));
  const isi = [];
  cuplikan.forEach((d) => isi.push({ id: d.id, ...d.data() }));
  return isi;
}

export async function ambilPeran(email) {
  const d = await getDoc(doc(db, "pengurus", String(email || "").toLowerCase()));
  if (!d.exists()) return null;
  /* Dokumen tanpa kolom peran dianggap master admin. Ini jalan masuk untuk
     orang pertama yang didaftarkan lewat konsol Firebase. */
  return d.data().peran === "petugas" ? "petugas" : "master";
}

export async function ambilProfilWarga(uid) {
  const d = await getDoc(doc(db, "warga", uid));
  return d.exists() ? d.data() : null;
}

export async function ambilSuara(pollId) {
  const cuplikan = await getDocs(collection(db, "polling", pollId, "suara"));
  const hitung = [];
  let milikSaya = null;
  const u = auth.currentUser;
  cuplikan.forEach((d) => {
    const n = d.data().pilihan;
    hitung[n] = (hitung[n] || 0) + 1;
    if (u && d.id === u.uid) milikSaya = String(n);
  });
  for (let i = 0; i < 10; i++) if (!hitung[i]) hitung[i] = 0;
  return { hitung, milikSaya };
}

/* ------------------------------------------------------------------ *
 * Menulis data
 * ------------------------------------------------------------------ */

function bersihkan(isi) {
  const hasil = {};
  Object.keys(isi).forEach((k) => {
    hasil[k] = isi[k] === null || isi[k] === undefined ? "" : String(isi[k]);
  });
  return hasil;
}

/** Kiriman warga: pengaduan, surat, reservasi, pendaftaran usaha. */
export function kirimWarga(koleksi, isi) {
  return addDoc(collection(db, koleksi), {
    ...bersihkan(isi),
    uid: auth.currentUser ? auth.currentUser.uid : "",
    status: "baru",
    dibuat: serverTimestamp()
  });
}

/** Isi situs yang ditambah pengurus. */
export function tambahIsi(koleksi, isi) {
  return addDoc(collection(db, koleksi), {
    ...bersihkan(isi),
    dibuat: serverTimestamp()
  });
}

/** Satu dokumen tetap, misalnya konten/profil. */
export function simpanKonten(bagian, isi) {
  return setDoc(doc(db, "konten", bagian), {
    ...bersihkan(isi),
    diubah: serverTimestamp()
  });
}

export function simpanDokumen(koleksi, id, isi, tambahWaktu = true) {
  const isian = bersihkan(isi);
  if (tambahWaktu) isian.dibuat = serverTimestamp();
  return setDoc(doc(db, koleksi, id), isian);
}

export function ubahStatus(koleksi, id, status) {
  return updateDoc(doc(db, koleksi, id), { status });
}

export function hapusDokumen(koleksi, id) {
  return deleteDoc(doc(db, koleksi, id));
}

export function daftarWarga(isi) {
  const u = auth.currentUser;
  if (!u) throw new Error("belum masuk");
  return setDoc(doc(db, "warga", u.uid), {
    ...bersihkan(isi),
    email: String(u.email || ""),
    status: "baru",
    dibuat: serverTimestamp()
  });
}

export function pilihPolling(pollId, nomor) {
  const u = auth.currentUser;
  if (!u) throw new Error("belum masuk");
  return setDoc(doc(db, "polling", pollId, "suara", u.uid), {
    pilihan: nomor,
    dibuat: serverTimestamp()
  });
}

/** Menyetujui peminjaman sekaligus mengunci tanggalnya di kalender warga. */
export async function setujuiReservasi(id, tanggal, fasilitas) {
  await updateDoc(doc(db, "reservasi", id), { status: "proses" });
  if (tanggal) {
    await setDoc(doc(db, "jadwal", tanggal), {
      fasilitas: String(fasilitas || ""),
      dibuat: serverTimestamp()
    });
  }
}
