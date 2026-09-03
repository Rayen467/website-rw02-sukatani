/**
 * Keadaan bersama seluruh situs.
 *
 * Semua halaman membaca dari sini. Kalau ingin tahu data apa saja yang
 * dipegang situs, cukup baca berkas ini -- tidak perlu menelusuri
 * halaman satu per satu.
 */

import {
  auth,
  pantauMasuk,
  ambilKoleksi,
  ambilKonten,
  ambilPeran,
  ambilProfilWarga,
  ambilMilikSaya,
  ambilSuara
} from "./firebase.js";
import { terapkanGaya } from "./gaya.js";

/* ------------------------------------------------------------------ *
 * Siapa yang sedang membuka situs
 * ------------------------------------------------------------------ */

export const sesi = $state({
  pengguna: null,        // { email, nama, uid }
  peran: null,           // 'master' | 'petugas' | null
  profilWarga: null,     // catatan warga milik pengguna ini
  terverifikasi: true,   // email sudah dipastikan lewat tautan
  siap: false            // pemeriksaan awal sudah selesai
});

export function pengurus() {
  return !!sesi.peran;
}
export function namaPeran(p = sesi.peran) {
  if (p === "master") return "Master Admin";
  if (p === "petugas") return "Petugas";
  return "Warga";
}
export function wargaAktif() {
  return sesi.profilWarga && sesi.profilWarga.status === "aktif";
}

/* ------------------------------------------------------------------ *
 * Isi situs yang datang dari server
 * ------------------------------------------------------------------ */

export const isi = $state({
  // dibaca siapa pun
  pengumuman: null,
  galeri: null,
  program: null,
  kas: null,
  usaha: null,
  pengaduan: null,
  pengurus_tampil: null,
  batas_rt: null,
  jadwal: null,
  tautan: null,
  jenis_surat: null,
  fasilitas: null,
  fasum: null,
  rutin: null,
  bansos: null,

  // hanya pengurus
  surat: null,
  reservasi: null,
  usaha_baru: null,
  warga: null,
  pengurus: null,

  // dokumen tetap
  konten: {},

  // polling
  suara: null
});

/** Memakai isi dari server bila ada; kalau belum, memakai data bawaan. */
export function pakai(kunci, bawaan) {
  const v = isi[kunci];
  return v && v.length ? v : bawaan;
}

/** Membaca satu dokumen tetap, misalnya konten profil. */
export function konten(bagian) {
  return isi.konten[bagian] || null;
}

/** Membaca satu kolom dari dokumen tetap, dengan nilai cadangan. */
export function kontenNilai(bagian, kolom, bawaan = "") {
  const k = konten(bagian);
  return k && k[kolom] ? k[kolom] : bawaan;
}

/* ------------------------------------------------------------------ *
 * Pesan singkat di bawah layar
 * ------------------------------------------------------------------ */

export const pesan = $state({ teks: "", tampil: false });

let jedaPesan = null;
export function beriTahu(teks) {
  pesan.teks = teks;
  pesan.tampil = true;
  if (jedaPesan) clearTimeout(jedaPesan);
  jedaPesan = setTimeout(() => (pesan.tampil = false), 3400);
}

/* ------------------------------------------------------------------ *
 * Memuat data
 * ------------------------------------------------------------------ */

const KOLEKSI_UMUM = [
  "pengumuman", "galeri", "program", "kas", "usaha", "pengaduan",
  "pengurus_tampil", "batas_rt", "jadwal", "tautan", "jenis_surat",
  "fasilitas", "fasum", "rutin", "bansos"
];

const KOLEKSI_PENGURUS = ["surat", "reservasi", "usaha_baru", "warga", "pengurus"];

const DOKUMEN_TETAP = [
  "profil", "kependudukan", "kontak", "sambutan", "statistik",
  "bansos", "identitas", "polling", "tampilan"
];

/** Memuat ulang satu koleksi. Dipanggil setelah pengurus mengubah sesuatu. */
export async function muatKoleksi(nama) {
  try {
    isi[nama] = await ambilKoleksi(nama);
  } catch (err) {
    /* Sebagian koleksi memang hanya boleh dibaca pengurus. Penolakan di
       sini wajar dan tidak perlu ditampilkan ke warga. */
  }
}

export async function muatKonten(bagian) {
  try {
    const d = await ambilKonten(bagian);
    if (d) {
      isi.konten = { ...isi.konten, [bagian]: d };
      if (bagian === "tampilan") terapkanGaya(d);
    }
  } catch (err) {}
}

export async function muatSemuaKonten() {
  await Promise.all(DOKUMEN_TETAP.map(muatKonten));
}

export async function muatUmum() {
  await Promise.all(KOLEKSI_UMUM.map(muatKoleksi));
}

export async function muatPengurus() {
  await Promise.all(KOLEKSI_PENGURUS.map(muatKoleksi));
}

export async function muatMilikSaya(uid) {
  for (const nama of ["surat", "reservasi", "usaha_baru"]) {
    try {
      isi[nama] = await ambilMilikSaya(nama, uid);
    } catch (err) {}
  }
}

export async function muatSuara() {
  const pollId = kontenNilai("polling", "id", "poll-2026-09");
  try {
    isi.suara = await ambilSuara(pollId);
  } catch (err) {}
}

/* ------------------------------------------------------------------ *
 * Menyalakan situs
 * ------------------------------------------------------------------ */

export function mulaiPantauan() {
  muatSemuaKonten();
  muatUmum();

  pantauMasuk(async (u) => {
    if (!u) {
      sesi.pengguna = null;
      sesi.peran = null;
      sesi.profilWarga = null;
      sesi.terverifikasi = true;
      sesi.siap = true;
      return;
    }

    const dasar = {
      email: String(u.email || "").toLowerCase(),
      nama: u.displayName || u.email,
      uid: u.uid
    };

    /* Selama email belum dipastikan lewat tautan, aturan Firestore menolak
       semua tulisan. Ini yang mencegah orang mendaftar memakai alamat email
       pengurus lalu mendapat akses penuh. */
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
    } catch (err) {}
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

/** Memuat ulang profil warga sendiri setelah mendaftar. */
export async function segarkanProfilWarga() {
  const u = auth.currentUser;
  if (!u) return;
  try {
    sesi.profilWarga = await ambilProfilWarga(u.uid);
  } catch (err) {}
  muatMilikSaya(u.uid);
}
