/**
 * ===========================================================================
 *  ISI -- data situs yang sudah diambil dari server
 * ===========================================================================
 *
 *  LAPIS 3 (keadaan). Boleh mengimpor: inti/, sumber/, keadaan/tampilan.js
 *
 *  Mau tahu situs ini memegang data apa saja? Cukup baca daftar di bawah.
 *  Tidak perlu menelusuri halaman satu per satu.
 *
 *  ARTI NILAI null
 *      null        belum sempat diambil dari server
 *      []          sudah diambil, memang belum ada isinya
 *  Bedanya penting: halaman menampilkan "belum ada isi" hanya untuk []
 *  supaya warga tidak melihat tulisan itu berkedip saat situs baru dibuka.
 *
 *  GALAT JARINGAN VS GALAT AKSES
 *  Galat jaringan sementara dicoba ulang otomatis. Galat akses/permission
 *  tidak diulang berkali-kali karena itu biasanya berarti aturan Firestore
 *  belum sinkron dengan kode. Untuk koleksi privat pengurus, galat terakhir
 *  dicatat agar Portal Petugas tidak salah menganggap angka 0 sebagai data
 *  kosong yang sah.
 */

import {
  ambilKoleksi,
  ambilKonten,
  ambilMilikSaya,
  ambilSuara
} from "../sumber/data.js";
import {
  KONTEN,
  KOLEKSI_UMUM,
  KOLEKSI_PENGURUS,
  KOLEKSI_KIRIMAN,
  DOKUMEN_TETAP
} from "../inti/nama.js";
import { POLLING_BAWAAN } from "../inti/bawaan.js";
import { terapkanGaya } from "./tampilan.js";

export const galatMuatPengurus = $state({});

export const isi = $state({
  /* --- Dibaca siapa pun, termasuk yang belum masuk --------------------- */
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
  berkas: null,
  forum_topik: null,
  forum_komentar: null,

  /* --- Hanya pengurus. Warga selalu ditolak server di sini ------------- */
  pengaduan_kontak: null,
  surat: null,
  reservasi: null,
  usaha_baru: null,
  usaha_admin: null,
  warga: null,
  pengurus: null,
  bansos_penerima: null,

  /* --- Dokumen tetap, satu bagian satu kunci -------------------------- */
  konten: {},

  /* --- Hasil polling: { hitung: [], milikSaya: "1" } ------------------- */
  suara: null
});

let generasiSesi = 0;

const GALAT_SEMENTARA = new Set([
  "aborted",
  "cancelled",
  "deadline-exceeded",
  "internal",
  "resource-exhausted",
  "unavailable",
  "unknown"
]);

const tunggu = (ms) => new Promise((selesai) => setTimeout(selesai, ms));

function kodeGalat(err) {
  return String((err && err.code) || "").replace(/^firestore\//, "");
}

function teksGalat(err) {
  const kode = kodeGalat(err);
  const pesan = String((err && err.message) || "").trim();
  return kode || pesan || "gagal memuat";
}

/**
 * Operasi baca Firestore kadang gagal sesaat karena jaringan/peralihan tab.
 * Untuk jenis galat sementara kita coba ulang dua kali dengan jeda kecil.
 * permission-denied dan galat konfigurasi lain langsung dilempar kembali.
 */
async function denganRetry(aksi, maksimumUlang = 2) {
  let terakhir;
  for (let percobaan = 0; percobaan <= maksimumUlang; percobaan += 1) {
    try {
      return await aksi();
    } catch (err) {
      terakhir = err;
      const sementara = GALAT_SEMENTARA.has(kodeGalat(err));
      if (!sementara || percobaan === maksimumUlang) throw err;
      await tunggu(300 * (2 ** percobaan));
    }
  }
  throw terakhir;
}

/** Buang data pribadi dan batalkan hasil permintaan dari sesi sebelumnya. */
export function kosongkanIsiPribadi() {
  generasiSesi += 1;
  for (const nama of KOLEKSI_PENGURUS) {
    isi[nama] = null;
    delete galatMuatPengurus[nama];
  }
  isi.suara = null;
}

/* -------------------------------------------------------------------------
 *  Membaca isi
 * ------------------------------------------------------------------------- */

/**
 * Memakai isi dari server bila ada; kalau belum, memakai daftar bawaan.
 * Ini yang membuat situs tetap terpakai sejak hari pertama, sebelum
 * pengurus sempat mengisi apa pun.
 */
export function pakai(kunci, bawaan) {
  const v = isi[kunci];
  return v && v.length ? v : bawaan;
}

/** Membaca satu dokumen tetap, misalnya konten profil. */
export function konten(bagian) {
  const nilai = isi.konten[bagian] || null;

  /* Luas wilayah RW 02 dikonfirmasi dari pengukuran area pada peta yang
     diterima September 2026. Nilai dari server tetap diprioritaskan jika
     nanti pengurus memperbaruinya melalui halaman Kelola. */
  if (bagian === KONTEN.PROFIL) {
    const profil = nilai || {};
    return { ...profil, luas: profil.luas || "3,51" };
  }

  return nilai;
}

/** Membaca satu kolom dari dokumen tetap, dengan nilai cadangan. */
export function kontenNilai(bagian, kolom, bawaan = "") {
  const k = konten(bagian);
  return k && k[kolom] ? k[kolom] : bawaan;
}

/* -------------------------------------------------------------------------
 *  Mengambil dari server
 *
 *  Setiap fungsi di bawah aman dipanggil ulang. Pengurus yang baru
 *  menyimpan sesuatu memanggil muatKoleksi() lagi supaya layarnya segar
 *  tanpa perlu memuat ulang seluruh halaman.
 * ------------------------------------------------------------------------- */

/** Mengambil ulang satu koleksi. Dipanggil setelah pengurus mengubah isi. */
export async function muatKoleksi(nama) {
  const generasi = generasiSesi;
  try {
    const hasil = await denganRetry(() => ambilKoleksi(nama));
    if (KOLEKSI_PENGURUS.includes(nama) && generasi !== generasiSesi) return;
    isi[nama] = hasil;
    if (KOLEKSI_PENGURUS.includes(nama)) delete galatMuatPengurus[nama];
  } catch (err) {
    /* Koleksi privat hanya dimuat setelah peran pengurus berhasil dibaca.
       Jadi kalau yang gagal adalah koleksi pengurus, itu BUKAN penolakan
       normal warga dan perlu terlihat di Dashboard Petugas. */
    if (KOLEKSI_PENGURUS.includes(nama) && generasi === generasiSesi) {
      galatMuatPengurus[nama] = teksGalat(err);
    }
  }
}

/** Mengambil ulang satu dokumen tetap. */
export async function muatKonten(bagian) {
  try {
    const d = await denganRetry(() => ambilKonten(bagian), 1);
    if (!d) return;
    isi.konten = { ...isi.konten, [bagian]: d };
    /* Pengaturan tampilan langsung dipasang begitu sampai, supaya warna
       pilihan pengurus tidak berkedip ganti setelah halaman tampil. */
    if (bagian === KONTEN.TAMPILAN) terapkanGaya(d);
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

/** Kiriman milik satu warga, untuk halaman Akun Saya. */
export async function muatMilikSaya(uid) {
  const generasi = generasiSesi;
  for (const nama of KOLEKSI_KIRIMAN) {
    if (generasi !== generasiSesi) return;
    try {
      const hasil = await denganRetry(() => ambilMilikSaya(nama, uid), 1);
      if (generasi !== generasiSesi) return;
      isi[nama] = hasil;
    } catch (err) {}
  }
}

export async function muatSuara() {
  const generasi = generasiSesi;
  const pollId = kontenNilai(KONTEN.POLLING, "id", POLLING_BAWAAN.id);
  try {
    const hasil = await denganRetry(() => ambilSuara(pollId), 1);
    if (generasi === generasiSesi) isi.suara = hasil;
  } catch (err) {}
}