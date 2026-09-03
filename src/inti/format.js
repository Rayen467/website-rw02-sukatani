/**
 * ===========================================================================
 *  FORMAT -- mengubah nilai mentah menjadi tulisan yang enak dibaca
 * ===========================================================================
 *
 *  LAPIS 1 (inti). Tidak mengimpor apa pun.
 *
 *  Semua fungsi di sini MURNI: diberi masukan sama, hasilnya selalu sama.
 *  Tidak menyentuh Firebase, tidak menyentuh layar, tidak menyimpan apa pun.
 *  Karena itu isinya aman diubah tanpa takut merusak halaman lain, dan
 *  gampang diperiksa: panggil, bandingkan hasilnya.
 *
 *  Yang butuh peramban -- penyimpanan lokal, papan klip, kanvas --
 *  bukan di sini, tapi di inti/peramban.js.
 */

/** Penanda untuk keterangan yang belum diisi pengurus. */
export const KOSONG = "……";

/** Nama bulan dalam bahasa Indonesia, urut dari Januari (indeks 0). */
export const NAMA_BULAN = Object.freeze([
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]);

/**
 * Menampilkan nilai, atau tanda titik-titik bila belum diisi.
 * Dipakai supaya halaman yang belum diisi tetap terbaca rapi, bukan
 * menampilkan kata "undefined" di hadapan warga.
 */
export function nilai(v) {
  return v === null || v === undefined || v === "" ? KOSONG : String(v);
}

/** Mengubah angka menjadi tulisan rupiah: 250000 menjadi "Rp250.000". */
export function rupiah(n) {
  const x = parseInt(String(n).replace(/[^0-9-]/g, ""), 10);
  if (isNaN(x)) return KOSONG;
  return "Rp" + x.toLocaleString("id-ID");
}

/**
 * Membaca angka dari isian yang mungkin bercampur huruf.
 * Pengurus sering mengetik "Rp 250.000"; hasilnya tetap angka, bukan galat.
 */
export function angkaDari(v) {
  const n = parseInt(String(v).replace(/[^0-9-]/g, ""), 10);
  return isNaN(n) ? 0 : n;
}

/**
 * Mengubah teks bertingkat "label : nilai" per baris menjadi daftar pasangan.
 *
 *      "Ketua RW : Bapak Ahmad
 *       Sekretaris : Ibu Sari"
 *
 *  menjadi  [["Ketua RW", "Bapak Ahmad"], ["Sekretaris", "Ibu Sari"]]
 *
 *  Dipakai supaya pengurus cukup mengetik di satu kotak, tanpa formulir
 *  bercabang yang menyusahkan di layar HP. Baris tanpa titik dua dilewati.
 */
export function uraiBaris(teks) {
  if (!teks) return [];
  return String(teks)
    .split("\n")
    .map((baris) => {
      const potong = baris.split(":");
      if (potong.length < 2) return null;
      return [potong[0].trim(), potong.slice(1).join(":").trim()];
    })
    .filter((x) => x && x[0]);
}

/** Memecah teks menjadi daftar baris, membuang baris kosong. */
export function keDaftar(teks) {
  if (!teks) return [];
  return String(teks)
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

/**
 * Membuat nama pendek yang aman dipakai sebagai alamat halaman.
 * "Warung Bu Siti" menjadi "warung-bu-siti".
 */
export function keSlug(teks) {
  return String(teks || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

/** Tanggal hari ini dalam bentuk 2026-09-14, sesuai isian tanggal di borang. */
export function tanggalHariIni() {
  return new Date().toISOString().slice(0, 10);
}
