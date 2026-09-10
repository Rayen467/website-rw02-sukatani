import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compile } from "svelte/compiler";

const baca = (p) => readFileSync(p, "utf8");
const nama = baca("src/inti/nama.js");
const isi = baca("src/keadaan/isi.svelte.js");
const data = baca("src/sumber/data.js");
const forum = baca("src/halaman/Forum.svelte");
const pengurus = baca("src/halaman/Pengurus.svelte");
const peta = baca("src/halaman/PetaWilayah.svelte");
const rules = baca("firestore.rules");

test("Forum, Pengurus, dan Peta tetap valid secara sintaks Svelte", () => {
  for (const [file, sumber] of [
    ["Forum.svelte", forum],
    ["Pengurus.svelte", pengurus],
    ["PetaWilayah.svelte", peta]
  ]) {
    assert.doesNotThrow(() => compile(sumber, { filename: file, generate: false }));
  }
});

test("koleksi forum terdaftar dan dimuat sebagai data publik", () => {
  assert.match(nama, /FORUM_TOPIK:\s*"forum_topik"/);
  assert.match(nama, /FORUM_KOMENTAR:\s*"forum_komentar"/);
  assert.match(nama, /KOLEKSI\.FORUM_TOPIK/);
  assert.match(nama, /KOLEKSI\.FORUM_KOMENTAR/);
  assert.match(isi, /forum_topik:\s*null/);
  assert.match(isi, /forum_komentar:\s*null/);
});

test("forum mendukung buat topik, balas, dan soft delete", () => {
  assert.match(data, /export function kirimTopikForum/);
  assert.match(data, /export function kirimKomentarForum/);
  assert.match(data, /export function hapusTopikForum/);
  assert.match(data, /export function hapusKomentarForum/);
  assert.match(data, /status:\s*STATUS\.AKTIF/);
  assert.match(data, /status:\s*"dihapus"/);
  assert.match(forum, /onsubmit=\{kirimTopik\}/);
  assert.match(forum, /onsubmit=\{kirimKomentar\}/);
  assert.match(forum, /Kirim Tanggapan/);
  assert.match(forum, /bolehHapus/);
});

test("Firestore forum hanya menerima tulisan akun terverifikasi dan uid sendiri", () => {
  const blokTopik = rules.match(/match \/forum_topik\/\{id\}[\s\S]*?\n    \}/)?.[0] || "";
  const blokKomentar = rules.match(/match \/forum_komentar\/\{id\}[\s\S]*?\n    \}/)?.[0] || "";
  for (const blok of [blokTopik, blokKomentar]) {
    assert.match(blok, /allow read: if true/);
    assert.match(blok, /allow create: if masuk\(\)/);
    assert.match(blok, /request\.resource\.data\.uid == request\.auth\.uid/);
    assert.match(blok, /request\.resource\.data\.status == 'aktif'/);
    assert.match(blok, /affectedKeys\(\)\.hasOnly\(\['status'\]\)/);
    assert.match(blok, /request\.resource\.data\.status == 'dihapus'/);
  }
});

test("kontak pengurus tidak pernah buntu walau nomor pribadi belum tersedia", () => {
  assert.match(pengurus, /KONTAK_KETUA_RW/);
  assert.match(pengurus, /Hubungi via Ketua RW/);
  assert.match(pengurus, /hrefKontak\(o\.kontak\)/);
});

test("peta selalu menampilkan empat RT resmi tanpa mengarang batas", () => {
  assert.match(peta, /KETUA_RT_BAWAAN/);
  assert.match(peta, /Menunggu verifikasi batas RT/);
  assert.match(peta, /Data batas RT yang belum dikonfirmasi tidak pernah diisi dengan perkiraan/);
  assert.match(peta, /Balai Warga/);
});
