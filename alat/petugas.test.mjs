import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const baca = (path) => readFileSync(path, "utf8");

const rules = baca("firestore.rules");
const data = baca("src/sumber/data.js");
const terbit = baca("src/halaman/kelola/TabTerbit.svelte");
const berkas = baca("src/halaman/kelola/TabBerkas.svelte");
const kiriman = baca("src/halaman/kelola/TabKiriman.svelte");
const angka = baca("src/halaman/kelola/TabAngka.svelte");
const layanan = baca("src/halaman/kelola/TabLayanan.svelte");
const profil = baca("src/halaman/kelola/TabProfil.svelte");
const umkm = baca("src/halaman/kelola/TabUmkm.svelte");
const lain = baca("src/halaman/kelola/TabLain.svelte");
const kelola = baca("src/halaman/kelola/Kelola.svelte");
const isi = baca("src/keadaan/isi.svelte.js");
const nama = baca("src/inti/nama.js");
const reservasi = baca("src/halaman/Reservasi.svelte");
const gor = baca("src/halaman/GorNurani.svelte");

test("akses Petugas server mensyaratkan email terverifikasi dan dokumen role", () => {
  assert.match(rules, /function masuk\(\)[\s\S]*email_verified == true/);
  assert.match(rules, /function petugas\(\)[\s\S]*exists\(jalurSaya\(\)\)/);
});

test("daftar role pengurus tidak bisa dilist oleh warga biasa", () => {
  assert.match(rules, /match \/pengurus\/\{email\}[\s\S]*allow get: if masuk\(\)[\s\S]*allow list: if petugas\(\)/);
  assert.doesNotMatch(rules, /match \/pengurus\/\{email\}\s*\{\s*allow read: if masuk\(\)/);
});

test("semua koleksi yang dikelola Petugas mempunyai aturan eksplisit", () => {
  const koleksi = [
    "pengumuman", "galeri", "galeri_foto", "kas", "program",
    "usaha", "usaha_foto", "usaha_admin", "konten", "pengurus_tampil", "batas_rt",
    "tautan", "berkas", "berkas_isi", "jenis_surat", "fasilitas",
    "fasum", "rutin", "bansos", "bansos_penerima", "jadwal"
  ];
  for (const namaKoleksi of koleksi) {
    assert.ok(
      rules.includes("match /" + namaKoleksi + "/{"),
      "Firestore Rules belum punya blok untuk koleksi " + namaKoleksi
    );
  }
});

test("halaman publish kegiatan memakai jalur data terpusat", () => {
  assert.match(terbit, /tambahIsi\(KOLEKSI\.PENGUMUMAN/);
  assert.match(terbit, /simpanAlbum\(/);
  assert.match(data, /export async function simpanAlbum/);
});

test("upload galeri tahan kegagalan sebagian dan jumlah foto tetap jujur", () => {
  assert.match(data, /jumlahFoto: "0"/);
  assert.match(data, /gagal \+= 1/);
  assert.match(data, /updateDoc\(acuan, \{ jumlahFoto: String\(masuk\) \}\)/);
  assert.match(terbit, /hasil\.gagal/);
});

test("dokumen dan video memakai metadata serta isi terpisah", () => {
  assert.match(berkas, /simpanBerkas\(/);
  assert.match(data, /KOLEKSI\.BERKAS_ISI/);
  assert.match(data, /export async function hapusBerkas/);
});

test("penghapusan berkas dan foto usaha tidak menelan galat server", () => {
  const hapusBerkas = data.match(/export async function hapusBerkas[\s\S]*?\n\}/)?.[0] || "";
  const hapusUsaha = data.match(/export async function hapusUsaha[\s\S]*?\n\}/)?.[0] || "";
  assert.doesNotMatch(hapusBerkas, /catch\s*\(/);
  assert.doesNotMatch(hapusUsaha, /catch\s*\(/);
});

test("dashboard Petugas memperingatkan bila data privat gagal dimuat", () => {
  assert.match(isi, /export const galatMuatPengurus/);
  assert.match(isi, /galatMuatPengurus\[nama\]/);
  assert.match(kelola, /Data Petugas belum termuat lengkap/);
  assert.match(kelola, /muatPengurus\(\)/);
});

test("workflow reservasi Petugas punya setujui, tolak, dan selesai", () => {
  assert.match(kiriman, /setujuiReservasi/);
  assert.match(kiriman, /tolakPinjam/);
  assert.match(kiriman, /selesaikanReservasi/);
  assert.match(data, /export function selesaikanReservasi/);
});

test("warga tidak bisa mengirim reservasi untuk fasilitas yang sudah terkunci", () => {
  assert.match(reservasi, /function fasilitasTerpakai/);
  assert.match(reservasi, /if \(fasilitasTerpakai\(form\.tanggal, form\.fasilitas\)\)/);
  assert.match(reservasi, /disabled=\{mengirim \|\| bentrok\}/);
});

test("impor kas menolak jenis transaksi yang tidak dikenali", () => {
  assert.match(angka, /function normalisasiJenisKas/);
  assert.match(angka, /pemasukan/);
  assert.match(angka, /pengeluaran/);
  assert.match(angka, /throw new Error\("Jenis kas/);
  assert.doesNotMatch(angka, /startsWith\("k"\) \? "keluar" : "masuk"/);
});

test("edit kas mempertahankan format tanggal lama", () => {
  assert.match(angka, /\{ nama: "tgl", label: "Tanggal" \}/);
  assert.doesNotMatch(angka, /\{ nama: "tgl", label: "Tanggal", jenis: "tanggal" \}/);
});

test("tab Petugas utama tetap menggunakan konstanta koleksi", () => {
  for (const [namaTab, sumber] of [
    ["layanan", layanan],
    ["profil", profil],
    ["umkm", umkm],
    ["tautan-polling", lain]
  ]) {
    assert.match(sumber, /KOLEKSI|KONTEN/, namaTab + " harus memakai konstanta data");
  }
});

test("pusat UMKM punya menu khusus, legalitas, sertifikat, dan action berikutnya", () => {
  assert.match(kelola, /UMKM & legalitas/);
  assert.match(kelola, /TabUmkm/);
  assert.match(umkm, /KOLEKSI\.USAHA_ADMIN/);
  assert.match(umkm, />NIB</);
  assert.match(umkm, /Sertifikat Halal/);
  assert.match(umkm, /SPP-IRT/);
  assert.match(umkm, /BPOM MD\/ML/);
  assert.match(umkm, /Action berikutnya/);
  assert.match(umkm, /Isi saran action otomatis/);
});

test("data legalitas UMKM dipisah dari katalog publik dan hanya untuk Petugas", () => {
  assert.match(nama, /USAHA_ADMIN:\s*"usaha_admin"/);
  assert.match(nama, /KOLEKSI_PENGURUS[\s\S]*KOLEKSI\.USAHA_ADMIN/);
  assert.match(isi, /usaha_admin:\s*null/);
  assert.match(rules, /match \/usaha_admin\/\{slug\}[\s\S]*allow read, create, update, delete: if petugas\(\)/);
});

test("tab GOR tidak menghasilkan warning role tablist pada elemen nav", () => {
  assert.doesNotMatch(gor, /<nav class="gor-nav" role="tablist"/);
  assert.match(gor, /class="gor-nav" role="tablist"/);
});