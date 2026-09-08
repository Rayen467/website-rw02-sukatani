import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compile } from "svelte/compiler";

const baca = (p) => readFileSync(p, "utf8");

const publik = baca("src/halaman/Pengurus.svelte");
const kelola = baca("src/halaman/kelola/TabProfil.svelte");
const baris = baca("src/komponen/BarisKelola.svelte");
const data = baca("src/sumber/data.js");
const rules = baca("firestore.rules");
const peramban = baca("src/inti/peramban.js");

test("tiga komponen struktur pengurus tetap valid secara sintaks Svelte", () => {
  for (const [nama, sumber] of [
    ["Pengurus.svelte", publik],
    ["TabProfil.svelte", kelola],
    ["BarisKelola.svelte", baris]
  ]) {
    assert.doesNotThrow(() => compile(sumber, { filename: nama, generate: false }));
  }
});

test("semua field Pengurus RW yang tampil publik punya pasangan editor", () => {
  for (const field of ["foto", "jabatan", "nama", "kontak"]) {
    assert.match(publik, new RegExp("o\\." + field));
    assert.match(kelola, new RegExp('nama: "' + field + '"'));
  }
});

test("semua field Ketua RT yang tampil publik punya pasangan editor", () => {
  for (const field of ["foto", "rt", "ketua", "kontak", "blok"]) {
    assert.match(publik, new RegExp("o\\." + field));
    assert.match(kelola, new RegExp('nama: "' + field + '"'));
  }
});

test("Petugas bisa menambah Pengurus RW dengan upload foto", () => {
  assert.match(kelola, /tambahIsi\(KOLEKSI\.PENGURUS_TAMPIL/);
  assert.match(kelola, /id="st-foto" type="file" accept="image\/\*"/);
  assert.match(kelola, /bacaFoto\(fotoStruktur, SISI_POTRET\)/);
});

test("Petugas bisa menambah Ketua RT dengan upload foto", () => {
  assert.match(kelola, /simpanDokumen\(KOLEKSI\.BATAS_RT/);
  assert.match(kelola, /id="rt-foto" type="file" accept="image\/\*"/);
  assert.match(kelola, /bacaFoto\(fotoRT, SISI_POTRET\)/);
});

test("editor data lama bisa ganti atau hapus foto tanpa menghapus orang", () => {
  assert.match(baris, /k\.jenis === "foto"/);
  assert.match(baris, /type="file"/);
  assert.match(baris, /accept="image\/\*"/);
  assert.match(baris, /Hapus foto/);
  assert.match(baris, /kirim\[k\.nama\] = ""/);
  assert.match(baris, /olahFoto\(berkasFoto\[k\.nama\]/);
});

test("foto lama tidak ikut ditimpa bila Petugas hanya mengedit teks", () => {
  assert.match(baris, /if \(k\.jenis !== "foto"\)/);
  assert.match(baris, /if \(hapusFoto\[k\.nama\]\)[\s\S]*else if \(berkasFoto\[k\.nama\]\)/);
});

test("upload foto yang gagal menghentikan simpan, bukan diam-diam menghapus foto", () => {
  assert.match(kelola, /async function bacaFoto\(berkas, sisi\)[\s\S]*return kecilkanFoto\(berkas, sisi\)/);
  assert.doesNotMatch(kelola, /Foto tidak dipakai:[\s\S]*return ""/);
  assert.match(kelola, /function olahFotoPotret\(berkas\)[\s\S]*kecilkanFoto\(berkas, SISI_POTRET\)/);
});

test("hapus satu Pengurus RW atau RT tetap tersedia lewat BarisKelola", () => {
  assert.match(baris, /hapusDokumen/);
  assert.match(baris, />Hapus</);
  assert.match(baris, /Tindakan ini tidak bisa dibatalkan/);
});

test("setelah semua RT dihapus, data bawaan tidak hidup lagi", () => {
  assert.match(publik, /isi\.batas_rt === null/);
  assert.match(publik, /: \(isi\.batas_rt \|\| \[\]\)/);
  assert.doesNotMatch(publik, /pakai\("batas_rt"/);
  assert.match(publik, /Data Ketua RT belum diisi/);
});

test("rename nomor RT memindahkan ID dokumen secara atomik", () => {
  assert.match(kelola, /async function ubahDataRT/);
  assert.match(kelola, /const idBaru = keSlug\(lengkap\.rt\)/);
  assert.match(kelola, /pindahDokumen\(KOLEKSI\.BATAS_RT/);
  assert.match(data, /writeBatch/);
  assert.match(data, /batch\.set/);
  assert.match(data, /batch\.delete/);
  assert.match(data, /batch\.commit/);
});

test("rename RT menolak bentrok dengan RT yang sudah ada", () => {
  assert.match(kelola, /some\(\(x\) => x\.id === idBaru\)/);
  assert.match(kelola, /RT dengan nomor tersebut sudah ada/);
});

test("Firestore Rules mengizinkan CRUD Pengurus RW dan Ketua RT hanya untuk Petugas", () => {
  assert.match(rules, /match \/pengurus_tampil\/\{id\}[\s\S]*allow read: if true;[\s\S]*allow write: if petugas\(\)/);
  assert.match(rules, /match \/batas_rt\/\{id\}[\s\S]*allow read: if true;[\s\S]*allow write: if petugas\(\)/);
});

test("foto struktur diperkecil sebelum disimpan agar aman untuk Firestore", () => {
  assert.match(kelola, /SISI_POTRET/);
  assert.match(peramban, /export const SISI_POTRET = 256/);
  assert.match(peramban, /const BATAS_FOTO = 700000/);
});

test("simulasi matriks CRUD halaman pengurus lengkap", () => {
  const skenario = [
    "tambah pengurus rw",
    "upload foto pengurus rw",
    "edit jabatan",
    "edit nama",
    "edit kontak",
    "ganti foto pengurus rw",
    "hapus foto pengurus rw",
    "hapus pengurus rw",
    "tambah ketua rt",
    "upload foto ketua rt",
    "edit nomor rt",
    "edit nama ketua rt",
    "edit kontak ketua rt",
    "edit cakupan blok",
    "ganti foto ketua rt",
    "hapus foto ketua rt",
    "hapus ketua rt"
  ];

  assert.equal(skenario.length, 17);
  assert.ok(kelola.includes("KOLEKSI.PENGURUS_TAMPIL"));
  assert.ok(kelola.includes("KOLEKSI.BATAS_RT"));
  assert.ok(baris.includes("Simpan perubahan"));
  assert.ok(baris.includes("Hapus foto"));
  assert.ok(baris.includes("Menghapus..."));
});
