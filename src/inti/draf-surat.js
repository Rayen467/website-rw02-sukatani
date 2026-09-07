// Draf cetak berisi NIK. Simpan hanya selama halaman aplikasi masih hidup,
// terikat ke UID, dan hapus saat sesi berganti; jangan menulis ke localStorage.
let draf = null;

export function simpanDrafSurat(uid, isi) {
  if (!uid) return;
  draf = { uid, isi: { ...isi } };
}

export function ambilDrafSurat(uid, jenis) {
  return uid && draf?.uid === uid && draf.isi.jenis === jenis ? { ...draf.isi } : null;
}

export function hapusDrafSurat() {
  draf = null;
  // Bersihkan penyimpanan tanpa pemilik dari versi situs sebelumnya.
  try { globalThis.localStorage?.removeItem('surat-terakhir'); } catch (err) {}
}
