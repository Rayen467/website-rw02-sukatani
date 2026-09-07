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
 *  KENAPA GALAT DIABAIKAN DIAM-DIAM
 *  Sebagian koleksi memang hanya boleh dibaca pengurus. Warga yang membuka
 *  situs pasti ditolak saat mencobanya, dan itu WAJAR -- bukan kerusakan
 *  yang perlu ditampilkan. Karena itu penangkap galat di berkas ini
 *  sengaja dibiarkan kosong.
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

  /* --- Hanya pengurus. Warga selalu ditolak server di sini ------------- */
  pengaduan_kontak: null,
  surat: null,
  reservasi: null,
  usaha_baru: null,
  warga: null,
  pengurus: null,

  /* --- Dokumen tetap, satu bagian satu kunci -------------------------- */
  konten: {},

  /* --- Hasil polling: { hitung: [], milikSaya: "1" } ------------------- */
  suara: null
});

let generasiSesi = 0;

/** Buang data pribadi dan batalkan hasil permintaan dari sesi sebelumnya. */
export function kosongkanIsiPribadi() {
  generasiSesi += 1;
  for (const nama of KOLEKSI_PENGURUS) isi[nama] = null;
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
  return isi.konten[bagian] || null;
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
    const hasil = await ambilKoleksi(nama);
    if (KOLEKSI_PENGURUS.includes(nama) && generasi !== generasiSesi) return;
    isi[nama] = hasil;
  } catch (err) {
    /* Ditolak karena memang bukan haknya. Lihat catatan di kepala berkas. */
  }
}

/** Mengambil ulang satu dokumen tetap. */
export async function muatKonten(bagian) {
  try {
    const d = await ambilKonten(bagian);
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
      const hasil = await ambilMilikSaya(nama, uid);
      if (generasi !== generasiSesi) return;
      isi[nama] = hasil;
    } catch (err) {}
  }
}

export async function muatSuara() {
  const generasi = generasiSesi;
  const pollId = kontenNilai(KONTEN.POLLING, "id", POLLING_BAWAAN.id);
  try {
    const hasil = await ambilSuara(pollId);
    if (generasi === generasiSesi) isi.suara = hasil;
  } catch (err) {}
}
