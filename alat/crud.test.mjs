import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compile } from "svelte/compiler";

const baca = (p) => readFileSync(p, "utf8");
const kelola = baca("src/halaman/kelola/Kelola.svelte");
const crud = baca("src/halaman/kelola/TabCrud.svelte");
const berkas = baca("src/halaman/kelola/TabBerkas.svelte");
const terbit = baca("src/halaman/kelola/TabTerbit.svelte");
const foto = baca("src/komponen/kelola/GaleriFotoKelola.svelte");
const rules = baca("firestore.rules");

test("komponen CRUD baru valid secara sintaks Svelte", () => {
  for (const [nama, sumber] of [
    ["TabCrud.svelte", crud],
    ["TabBerkas.svelte", berkas],
    ["TabTerbit.svelte", terbit],
    ["GaleriFotoKelola.svelte", foto]
  ]) {
    assert.doesNotThrow(() => compile(sumber, { filename: nama, generate: false }));
  }
});

test("Portal Petugas memiliki pusat CRUD lengkap", () => {
  assert.match(kelola, /import TabCrud/);
  assert.match(kelola, /"crud",\s*"CRUD lengkap"/);
  for (const nama of [
    "PENGADUAN", "PENGADUAN_KONTAK", "SURAT", "RESERVASI", "USAHA_BARU",
    "WARGA", "FORUM_TOPIK", "FORUM_KOMENTAR", "JADWAL", "BANSOS_PENERIMA"
  ]) {
    assert.match(crud, new RegExp(`KOLEKSI\\.${nama}`), `Pusat CRUD belum memuat ${nama}`);
  }
  assert.match(crud, /Editor lengkap dokumen tetap/);
  assert.match(crud, /simpanJsonDokumen/);
});

test("CRUD menjaga relasi pengaduan, forum, dan kalender reservasi", () => {
  assert.match(crud, /pengaduan_kontak/);
  assert.match(crud, /forum_komentar/);
  assert.match(crud, /sinkronJadwalReservasi/);
  assert.match(crud, /kunciJadwal/);
  assert.match(crud, /hapusKhusus/);
  assert.match(crud, /hapusDokumen\(KOLEKSI\.JADWAL/);
});

test("dokumen dan video dapat diubah termasuk mengganti file", () => {
  assert.match(berkas, /function bukaEdit/);
  assert.match(berkas, /async function simpanEdit/);
  assert.match(berkas, /editBerkas/);
  assert.match(berkas, /KOLEKSI\.BERKAS_ISI/);
  assert.match(berkas, /Simpan perubahan/);
});

test("galeri mendukung tambah ganti sampul dan hapus foto", () => {
  assert.match(terbit, /GaleriFotoKelola/);
  assert.match(terbit, /nama:\s*"tanggal"/);
  assert.match(foto, /tambahFotoAlbum/);
  assert.match(foto, /hapusFotoAlbum/);
  assert.match(foto, /jadikanSampul/);
  assert.match(foto, /function ganti|async function ganti/);
});

test("rules memberi Petugas CRUD penuh pada data operasional yang dikelola", () => {
  for (const koleksi of [
    "warga", "pengaduan", "pengaduan_kontak", "surat", "reservasi",
    "usaha_baru", "forum_topik", "forum_komentar"
  ]) {
    const mulai = rules.indexOf(`match /${koleksi}/{`);
    assert.notEqual(mulai, -1, `rules tidak punya ${koleksi}`);
    const berikut = rules.indexOf("\n    match /", mulai + 1);
    const blok = rules.slice(mulai, berikut === -1 ? rules.length : berikut);
    assert.match(blok, /allow create, update, delete: if petugas\(\)/, `${koleksi} belum CRUD penuh untuk Petugas`);
  }
});
