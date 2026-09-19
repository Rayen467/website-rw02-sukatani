import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const akar = process.cwd();
const baca = (rel) => fs.readFileSync(path.join(akar, rel), "utf8");

test("surat tidak menyimpan NIK/KK ke localStorage", () => {
  const borang = baca("src/halaman/SuratBorang.svelte");
  const main = baca("src/main.js");

  assert.doesNotMatch(borang, /localStorage\.setItem\(["']surat-terakhir["']/);
  assert.match(borang, /const acuan = await kirimWarga\(KOLEKSI\.SURAT/);
  assert.match(borang, /pengajuanId = acuan\.id/);
  assert.match(borang, /#\/surat-pengajuan\//);
  assert.match(main, /localStorage\.removeItem\(["']surat-terakhir["']\)/);
});

test("reservasi disetujui dengan transaksi atomik", () => {
  const data = baca("src/sumber/data.js");
  const kiriman = baca("src/halaman/kelola/TabKiriman.svelte");

  assert.match(data, /runTransaction/);
  assert.match(data, /const jadwalRef = doc\(db, KOLEKSI\.JADWAL, kunci\)/);
  assert.match(data, /reservasiId: id/);
  assert.match(data, /jadwalSnap\.exists\(\)/);
  assert.match(kiriman, /setujuiReservasi\(r\.id, r\.tanggal, r\.fasilitas, r\.jam\)/);
});

test("perubahan tahap dan pengaduan mencatat waktu terbaru", () => {
  const data = baca("src/sumber/data.js");
  const surat = baca("src/halaman/kelola/MejaSurat.svelte");
  const kiriman = baca("src/halaman/kelola/TabKiriman.svelte");

  assert.match(data, /export function ubahLayanan/);
  assert.match(data, /diubah: serverTimestamp\(\)/);
  assert.match(surat, /ubahLayanan\(KOLEKSI\.SURAT/);
  assert.match(kiriman, /ubahLayanan\(KOLEKSI\.PENGADUAN/);
});

test("notifikasi warga dan petugas mencakup layanan utama", () => {
  const notifikasi = baca("src/komponen/PusatNotifikasi.svelte");
  const kelola = baca("src/halaman/kelola/Kelola.svelte");
  const akun = baca("src/halaman/Akun.svelte");

  assert.match(notifikasi, /item\.tahap \|\| item\.status/);
  assert.match(notifikasi, /isi\.pengaduan_saya/);
  assert.match(notifikasi, /segarkanProfilWarga\(\)/);
  assert.match(kelola, /<PusatNotifikasi\s*\/?>/);
  assert.match(akun, /Pengaduan & aspirasi/);
});

test("pendaftaran UMKM meminta persetujuan publikasi WhatsApp", () => {
  const usaha = baca("src/halaman/DaftarUsaha.svelte");
  const kiriman = baca("src/halaman/kelola/TabKiriman.svelte");

  assert.match(usaha, /izinWaPublik/);
  assert.match(usaha, /mengizinkan nomor WhatsApp/i);
  assert.match(usaha, /type="checkbox"/);
  assert.match(kiriman, /sudahAda \? `\$\{dasarId\}-\$\{String\(u\.id\)\.slice\(0, 6\)\}` : dasarId/);
});

test("form kontak pribadi dialihkan ke WhatsApp tanpa menulis Firestore", () => {
  const interaksi = baca("src/inti/interaksi-ui.js");

  assert.match(interaksi, /document\.addEventListener\("submit", tanganiSubmitKontak, true\)/);
  assert.match(interaksi, /event\.stopImmediatePropagation\(\)/);
  assert.match(interaksi, /bukaWaKetuaRw\(pesan\)/);
  assert.match(interaksi, /tidak disimpan di database website/i);
});

test("Data Kependudukan dan Transportasi Warga tidak lagi menyesatkan", () => {
  const interaksi = baca("src/inti/interaksi-ui.js");

  assert.match(interaksi, /Akses khusus pengurus/);
  assert.match(interaksi, /Transportasi Warga/);
  assert.match(interaksi, /data-rw-transportasi/);
});
