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

/* Mengambil tag pembuka tanpa keliru berhenti pada tanda > di dalam ekspresi
   Svelte, misalnya disabled={jumlah > 0}. */
function tagPembuka(teks, namaTag) {
  const hasil = [];
  const awal = `<${namaTag}`;
  let pos = 0;

  while ((pos = teks.indexOf(awal, pos)) !== -1) {
    const sebelum = teks[pos + awal.length] || "";
    if (/[A-Za-z0-9_-]/.test(sebelum)) {
      pos += awal.length;
      continue;
    }

    let kutip = "";
    let kurungKurawal = 0;
    let akhir = pos + awal.length;

    for (; akhir < teks.length; akhir++) {
      const ch = teks[akhir];
      const prev = teks[akhir - 1];

      if (kutip) {
        if (ch === kutip && prev !== "\\") kutip = "";
        continue;
      }

      if (ch === '"' || ch === "'") {
        kutip = ch;
        continue;
      }
      if (ch === "{") {
        kurungKurawal++;
        continue;
      }
      if (ch === "}") {
        kurungKurawal = Math.max(0, kurungKurawal - 1);
        continue;
      }
      if (ch === ">" && kurungKurawal === 0) {
        hasil.push(teks.slice(pos, akhir + 1));
        akhir++;
        break;
      }
    }

    pos = Math.max(akhir, pos + awal.length);
  }

  return hasil;
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
const main = baca("src/main.js");
const interaksiUi = baca("src/inti/interaksi-ui.js");
const delegasiAktif = main.includes("./inti/interaksi-ui.js") && main.includes("aktifkanInteraksiUi()");

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
let jumlahDelegasi = 0;

for (const file of berkas) {
  const teks = fs.readFileSync(file, "utf8");
  const namaFile = rel(file);

  for (const tag of tagPembuka(teks, "button")) {
    jumlahTombol++;
    const langsung = /\bonclick\s*=|\bon:click\s*=|\btype\s*=\s*["'](?:submit|reset)["']/i.test(tag);
    const tombolCariUmkm =
      namaFile === "src/halaman/Umkm.svelte" &&
      /<button\s+type=["']button["']\s*>/i.test(tag) &&
      interaksiUi.includes(".umkm-cari button");
    const tombolFavoritUmkm =
      namaFile === "src/halaman/Umkm.svelte" &&
      tag.includes('aria-label="Simpan usaha"') &&
      interaksiUi.includes('button[aria-label="Simpan usaha"]');
    const terdelegasi = delegasiAktif && (tombolCariUmkm || tombolFavoritUmkm);
    if (terdelegasi) jumlahDelegasi++;

    cek(langsung || terdelegasi, `${namaFile}: tombol tanpa aksi/submit -> ${tag.replace(/\s+/g, " ").slice(0, 190)}`);
  }

  for (const tag of tagPembuka(teks, "a")) {
    jumlahTautan++;
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

cek(delegasiAktif, "Penjaga interaksi UI belum diaktifkan di src/main.js");
cek(interaksiUi.includes("KONTAK_KETUA_RW"), "Fallback WhatsApp Ketua RW belum terhubung pada penjaga UI");

const fitur = [
  ["A1 Beranda", ["src/halaman/Beranda.svelte"], ["sambutan-rw", "isi.pengumuman", "#/berita"]],
  ["A2 Profil RW", ["src/halaman/Profil.svelte"], ["Visi &amp; Misi", "Batas Wilayah", "Perjalanan Permai Sukatani"]],
  ["A3 Struktur Pengurus", ["src/halaman/Pengurus.svelte", "src/inti/kontak-resmi.js"], ["Pengurus RW", "Ketua RT", "KONTAK_KETUA_RW", "Hubungi via Ketua RW"]],
  ["A4 Peta Wilayah", ["src/halaman/PetaWilayah.svelte", "src/komponen/Peta.svelte"], ["<Peta", "KETUA_RT_BAWAAN", "Batas tiap RT", "Balai Warga", "poligon"]],
  ["B1 Pengajuan Surat", ["src/halaman/Surat.svelte", "src/halaman/SuratBorang.svelte", "src/halaman/SuratCetak.svelte"], ["nomorAntrean(\"SP\")", "window.print()", "Lihat dan cetak berkas"]],
  ["B2 Data Kependudukan", ["src/halaman/Kependudukan.svelte"], ["pengurus()", "Pendidikan terakhir", "Pekerjaan", "Pemeluk agama"]],
  ["B3 Pengaduan & Aspirasi", ["src/halaman/Pengaduan.svelte"], ["nomorAntrean(\"ADU\")", "Diproses", "Selesai"]],
  ["B4 Reservasi Fasilitas", ["src/halaman/Reservasi.svelte"], ["fasilitasTerpakai", "Ketersediaan", "Kirim permohonan"]],
  ["C1 Berita & Pengumuman", ["src/halaman/Berita.svelte"], ["isi.pengumuman", "Berita Utama", "Berita Terbaru"]],
  ["C2 Kalender Kegiatan", ["src/halaman/Kalender.svelte"], ["Kalender kegiatan", "geser(-1)", "geser(1)"]],
  ["C3 Galeri Foto & Video", ["src/halaman/Galeri.svelte"], ["Galeri foto &amp; video", "geser(-1)", "geser(1)"]],
  ["C4 Forum & Polling Online", ["src/halaman/Forum.svelte", "src/sumber/data.js", "firestore.rules"], ["pilihPolling", "kirimTopikForum", "kirimKomentarForum", "forum_topik", "forum_komentar", "Kirim Tanggapan"]],
  ["D1 Kas RW", ["src/halaman/Kas.svelte", "src/halaman/Transparansi.svelte"], ["Total pemasukan", "Total pengeluaran", "Saldo"]],
  ["D2 Program", ["src/halaman/Program.svelte", "src/halaman/Transparansi.svelte"], ["Rencana dan realisasi program", "status"]],
  ["E1 Direktori UMKM", ["src/halaman/Umkm.svelte", "src/halaman/DaftarUsaha.svelte"], ["UMKM", "Kirim pendaftaran"]],
  ["E2 Bantuan Sosial", ["src/halaman/Bansos.svelte"], ["Informasi Bantuan Sosial", "Syarat & jalur pengajuan"]],
  ["E3 Link Penting", ["src/halaman/Tautan.svelte"], ["TAUTAN_BAWAAN", "Buka laman resmi"]],
  ["E4 Kontak & Lokasi", ["src/halaman/Kontak.svelte", "src/inti/interaksi-ui.js"], ["Kirim Pesan / Pertanyaan", "Lokasi RW 02 Sukatani", "KONTAK_KETUA_RW"]],
  ["E5 Mobile Friendly", ["src/gaya/layar-kecil.css", "src/komponen/Kepala.svelte"], ["@media", "max-width", "burger"]]
];

for (const [nama, daftarFile, token] of fitur) {
  const gabung = daftarFile.map((f) => baca(f)).join("\n");
  for (const t of token) cek(gabung.includes(t), `${nama}: indikator fitur \"${t}\" tidak ditemukan`);
  info.push(`${nama}: sumber fitur ditemukan`);
}

console.log(`Audit UI: ${jumlahTombol} tombol, ${jumlahTautan} tautan, ${jumlahAset} referensi aset diperiksa (${jumlahDelegasi} tombol memakai delegasi teruji).`);
for (const baris of info) console.log(`✓ ${baris}`);

if (gagal.length) {
  console.error(`\nAudit UI GAGAL (${gagal.length} masalah):`);
  for (const masalah of gagal) console.error(`- ${masalah}`);
  process.exit(1);
}

console.log("\n✓ Audit UI lulus: tidak ada tombol inert, tautan internal menuju rute tak dikenal, fragment kosong, atau aset lokal hilang yang terdeteksi.");
