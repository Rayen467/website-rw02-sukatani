/**
 * ===========================================================================
 *  SESI -- siapa yang sedang membuka situs
 * ===========================================================================
 *
 *  LAPIS 3 (keadaan). Boleh mengimpor: inti/, sumber/
 *
 *  Berkas ini menyimpan keadaannya saja. Yang MENGISI keadaan ini adalah
 *  keadaan/mulai.js, satu-satunya tempat yang memantau Firebase.
 *
 *  YANG PERLU DIPAHAMI SEBELUM MENGUBAH APA PUN DI SINI
 *
 *  Nilai di bawah cuma menentukan APA YANG TAMPIL DI LAYAR. Bukan itu yang
 *  menjaga data. Menyulap sesi.peran jadi "master" lewat konsol peramban
 *  memang membuka menu Kelola di layar orang itu, tapi setiap tulisannya
 *  tetap ditolak server karena aturan Firestore memeriksa ulang semuanya.
 *
 *  Jadi: menambah tampilan berdasarkan peran itu aman. Yang tidak boleh
 *  adalah menganggap pemeriksaan di sini sudah cukup, lalu melonggarkan
 *  aturan di firestore.rules.
 */

import { PERAN, STATUS } from "../inti/nama.js";

export const sesi = $state({
  /** { email, nama, uid } atau null kalau belum masuk. */
  pengguna: null,

  /** "master", "petugas", atau null untuk warga biasa. */
  peran: null,

  /** Catatan warga milik pengguna ini, kalau sudah mendaftar. */
  profilWarga: null,

  /** Email sudah dipastikan lewat tautan. Selama false, server tolak tulisan. */
  terverifikasi: true,

  /** Pemeriksaan awal sudah selesai. Selama false, layar menunggu. */
  siap: false
});

/** Benar kalau yang masuk adalah pengurus, apa pun jabatannya. */
export function pengurus() {
  return sesi.terverifikasi && (sesi.peran === PERAN.MASTER || sesi.peran === PERAN.PETUGAS);
}

/**
 * Nama jabatan untuk ditampilkan.
 *
 * Master Admin dan Petugas BERWENANG SAMA PERSIS. Yang membedakan hanya
 * tulisan di layar. Ini pilihan sadar pemilik situs, bukan kelalaian --
 * penjelasan lengkapnya ada di kepala berkas firestore.rules.
 */
export function namaPeran(p = sesi.peran) {
  if (p === PERAN.MASTER) return "Master Admin";
  if (p === PERAN.PETUGAS) return "Petugas";
  return "Warga";
}

/** Warga yang catatannya sudah disahkan pengurus, bukan sekadar mendaftar. */
export function wargaAktif() {
  return !!sesi.profilWarga && sesi.profilWarga.status === STATUS.AKTIF;
}
