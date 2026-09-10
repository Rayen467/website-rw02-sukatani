import fs from "node:fs";
import path from "node:path";

const akar = process.cwd();
const src = path.join(akar, "src");
const publik = path.join(akar, "public");
const gagal = [];
const info = [];

function baca(rel) {
  return fs.readFileSync(path.join(akar, rel), "utf8");
}

function semuaBerkas(dir, hasil = []) {
  for (const entri of fs.readdirSync(dir, { withFileTypes: true })) {
    const penuh = path.join(dir, entri.name);
    if (entri.isDirectory()) semuaBerkas(penuh, hasil);
    else if (/\.(svelte|js)$/.test(entri.name)) hasil.push(penuh);
  }
  return hasil;
}

function rel(p) {
  return path.relative(akar, p).replaceAll(path.sep, "/");
}

function cek(kondisi, pesan) {
  if (!kondisi) gagal.push(pesan);
}

const rute = new Set([
  "",
  "profil",
  "pengurus",
  "peta",
  "layanan",
  "surat",
  "pengaduan",
  "reservasi",
  "kependudukan",
  "berita",
  "kalender",
  "galeri",
  "transparansi",
  "forum",
  "kas",
  "program",
  "umkm",
  "daftar-usaha",
  "bansos",
  "tautan",
  "majelis-taklim",
  "gor-nurani",
  "berkas",
  "kontak",
  "masuk",
  "akun",
  "cari",
  "kelola"
]);

const app = baca("src/App.svelte");
for (const nama of rute) {
  if (!nama) continue;
  const biasa = new RegExp(`(^|\\n)\\s*${nama.replaceAll("-", "\\-")}\\s*:`, "m");
  const kutip = app.includes(`\"${nama}\":`);
  cek(biasa.test(app) || kutip, `Rute #/${nama} belum terdaftar di src/App.svelte`);
}

const berkas = semuaBerkas(src);
let jumlahTombol = 0;
let jumlahTautan = 0;
let jumlahAset = 0;

for (const file of berkas) {
  const teks = fs.readFileSync(file, "utf8");
  const namaFile = rel(file);

  for (const cocok of teks.matchAll(/<button\b[^>]*>/gs)) {
    jumlahTombol++;
    const tag = cocok[0];
    const beraksi = /\bonclick\s*=|\bon:click\s*=|\btype\s*=\s*["'](?:submit|reset)["']/i.test(tag);
    cek(beraksi, `${namaFile}: tombol tanpa aksi/submit -> ${tag.replace(/\s+/g, " ").slice(0, 150)}`);
  }

  for (const cocok of teks.matchAll(/<a\b[^>]*>/gs)) {
    jumlahTautan++;
    const tag = cocok[0];
    const statis = tag.match(/\bhref\s*=\s*["']([^"']*)["']/i);
    if (!statis) continue;
    const href = statis[1].trim();

    cek(href !== "" && href !== "#", `${namaFile}: tautan kosong ditemukan`);
    cek(!/^javascript:/i.test(href), `${namaFile}: javascript: URL tidak diizinkan (${href})`);

    if (href.startsWith("#/") && !href.includes("{")) {
      const bagian = href.slice(2).split(/[/?#]/)[0] || "";
      cek(rute.has(bagian), `${namaFile}: tautan internal ${href} menuju rute yang tidak ada`);
    } else if (/^#[A-Za-z][\w-]*$/.test(href)) {
      const id = href.slice(1);
      const polaId = new RegExp(`\\bid\\s*=\\s*[\"']${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\"']`);
      cek(polaId.test(teks), `${namaFile}: fragment ${href} tidak punya target id pada halaman yang sama`);
    }
  }

  for (const cocok of teks.matchAll(/\b(?:src|poster)\s*=\s*["'](\.\/[^"']+)["']/g)) {
    jumlahAset++;
    const tujuan = path.join(publik, cocok[1].slice(2).split(/[?#]/)[0]);
    cek(fs.existsSync(tujuan), `${namaFile}: aset lokal tidak ditemukan ${cocok[1]}`);
  }

  for (const cocok of teks.matchAll(/url\(\s*["']?(\.\/[^"')]+)["']?\s*\)/g)) {
    jumlahAset++;
    const tujuan = path.join(publik, cocok[1].slice(2).split(/[?#]/)[0]);
    cek(fs.existsSync(tujuan), `${namaFile}: aset CSS lokal tidak ditemukan ${cocok[1]}`);
  }
}

const fitur = [
  ["A1 Beranda", ["src/halaman/Beranda.svelte"], ["sambutan-rw", "isi.pengumuman", "#/berita"]],
  ["A2 Profil RW", ["src/halaman/Profil.svelte"], ["Visi &amp; Misi", "Batas Wilayah", "Perjalanan Permai Sukatani"]],
  ["A3 Struktur Pengurus", ["src/halaman/Pengurus.svelte"], ["Pengurus RW", "Ketua RT", "WhatsApp"]],
  ["A4 Peta Wilayah", ["src/halaman/PetaWilayah.svelte"], ["<Peta", "batas", "Fasilitas umum"]],
  ["B1 Pengajuan Surat", ["src/halaman/Surat.svelte", "src/halaman/SuratBorang.svelte", "src/halaman/SuratCetak.svelte"], ["nomorAntrean(\"SP\")", "window.print()", "Lihat dan cetak berkas"]],
  ["B2 Data Kependudukan", ["src/halaman/Kependudukan.svelte"], ["pengurus()", "Pendidikan terakhir", "Pekerjaan", "Pemeluk agama"]],
  ["B3 Pengaduan & Aspirasi", ["src/halaman/Pengaduan.svelte"], ["nomorAntrean(\"ADU\")", "Diproses", "Selesai"]],
  ["B4 Reservasi Fasilitas", ["src/halaman/Reservasi.svelte"], ["fasilitasTerpakai", "Ketersediaan", "Kirim permohonan"]],
  ["C1 Berita & Pengumuman", ["src/halaman/Berita.svelte"], ["isi.pengumuman", "Berita Utama", "Berita Terbaru"]],
  ["C2 Kalender Kegiatan", ["src/halaman/Kalender.svelte"], ["Kalender kegiatan", "geser(-1)", "geser(1)"]],
  ["C3 Galeri Foto & Video", ["src/halaman/Galeri.svelte"], ["Galeri foto &amp; video", "geser(-1)", "geser(1)"]],
  ["C4 Polling Online", ["src/halaman/Forum.svelte"], ["pilihPolling", "Musyawarah", "Satu akun satu suara"]],
  ["D1 Kas RW", ["src/halaman/Kas.svelte", "src/halaman/Transparansi.svelte"], ["Total pemasukan", "Total pengeluaran", "Saldo"]],
  ["D2 Program", ["src/halaman/Program.svelte", "src/halaman/Transparansi.svelte"], ["Rencana dan realisasi program", "status"]],
  ["E1 Direktori UMKM", ["src/halaman/Umkm.svelte", "src/halaman/DaftarUsaha.svelte"], ["UMKM", "Kirim pendaftaran"]],
  ["E2 Bantuan Sosial", ["src/halaman/Bansos.svelte"], ["Informasi Bantuan Sosial", "Syarat & jalur pengajuan"]],
  ["E3 Link Penting", ["src/halaman/Tautan.svelte"], ["TAUTAN_BAWAAN", "Buka laman resmi"]],
  ["E4 Kontak & Lokasi", ["src/halaman/Kontak.svelte"], ["Kirim Pesan / Pertanyaan", "Lokasi RW 02 Sukatani", "WhatsApp"]],
  ["E5 Mobile Friendly", ["src/gaya/layar-kecil.css", "src/komponen/Kepala.svelte"], ["@media", "max-width", "burger"]]
];

for (const [nama, daftarFile, token] of fitur) {
  const gabung = daftarFile.map((f) => baca(f)).join("\n");
  for (const t of token) cek(gabung.includes(t), `${nama}: indikator fitur \"${t}\" tidak ditemukan`);
  info.push(`${nama}: sumber fitur ditemukan`);
}

console.log(`Audit UI: ${jumlahTombol} tombol, ${jumlahTautan} tautan, ${jumlahAset} referensi aset diperiksa.`);
for (const baris of info) console.log(`✓ ${baris}`);

if (gagal.length) {
  console.error(`\nAudit UI GAGAL (${gagal.length} masalah):`);
  for (const masalah of gagal) console.error(`- ${masalah}`);
  process.exit(1);
}

console.log("\n✓ Audit UI lulus: tidak ada tombol inert, tautan internal menuju rute tak dikenal, fragment kosong, atau aset lokal hilang yang terdeteksi.");
