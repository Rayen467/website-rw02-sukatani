/**
 * ===========================================================================
 *  PESAN -- tulisan singkat yang muncul sebentar di bawah layar
 * ===========================================================================
 *
 *  LAPIS 3 (keadaan). Tidak mengimpor apa pun.
 *
 *  Dipakai untuk kabar sekilas: "Tersimpan", "Ditolak aturan keamanan",
 *  "Nomor disalin". Yang menampilkannya komponen/Pesan.svelte.
 *
 *  JANGAN dipakai untuk hal yang harus dibaca warga sampai selesai, atau
 *  yang perlu jawaban. Pesan ini hilang sendiri setelah beberapa detik dan
 *  tidak bisa dibuka lagi -- pertanyaan penting taruh di halamannya.
 */

export const pesan = $state({
  teks: "",
  tampil: false
});

/** Berapa lama pesan bertahan sebelum menghilang sendiri. */
const LAMA_TAMPIL = 3400;

let jeda = null;

/**
 * Menampilkan satu pesan.
 * Pesan baru menimpa yang lama, tidak menumpuk. Hitungannya diulang dari
 * awal supaya pesan terakhir tetap sempat terbaca.
 */
export function beriTahu(teks) {
  pesan.teks = teks;
  pesan.tampil = true;
  if (jeda) clearTimeout(jeda);
  jeda = setTimeout(() => (pesan.tampil = false), LAMA_TAMPIL);
}
