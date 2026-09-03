/**
 * ===========================================================================
 *  PERIKSA ARSITEKTUR
 * ===========================================================================
 *
 *  Jalankan:  npm run periksa
 *
 *  KENAPA BERKAS INI ADA
 *
 *  Aturan yang tidak bisa diperiksa adalah aturan yang tidak akan dipatuhi.
 *  Menulis "halaman tidak boleh memanggil Firebase langsung" di README
 *  tidak menghentikan siapa pun. Yang menghentikan adalah pemeriksaan yang
 *  gagal sebelum kode naik ke situs.
 *
 *  Berkas ini memeriksa empat hal, dan gagal dengan pesan yang menyebut
 *  nomor barisnya:
 *
 *      1. Impor hanya boleh MENGARAH KE BAWAH, tidak pernah ke atas.
 *      2. Halaman tidak boleh saling mengimpor.
 *      3. Nama koleksi dan nama bagian konten tidak boleh ditulis sebagai
 *         teks di luar inti/nama.js.
 *      4. Hanya sumber/ yang boleh mengimpor pustaka firebase.
 *
 *  Kalau suatu saat salah satu aturan ini memang perlu dilanggar, ubah
 *  berkas ini dan tulis alasannya di sini. Yang tidak boleh: mematikan
 *  pemeriksaan diam-diam supaya kode lolos.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const AKAR = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const SRC = join(AKAR, "src");

/* Makin kecil angkanya, makin dalam lapisannya. Lapis dalam tidak boleh
   tahu apa-apa tentang lapis luar. */
const LAPIS = {
  inti: 1,
  sumber: 2,
  keadaan: 3,
  komponen: 4,
  halaman: 4,
  gaya: 4
};

const NAMA_LAPIS = {
  1: "inti (aturan dasar)",
  2: "sumber (bicara ke server)",
  3: "keadaan (data di layar)",
  4: "tampilan (halaman dan komponen)"
};

/* Nama koleksi Firestore. Kalau salah satu muncul sebagai teks di luar
   inti/nama.js, hampir pasti itu nama koleksi yang ditulis langsung. */
const KOLEKSI = [
  "pengumuman", "galeri", "program", "kas", "usaha", "pengurus_tampil",
  "batas_rt", "jadwal", "tautan", "jenis_surat", "fasilitas", "fasum",
  "rutin", "bansos", "pengaduan", "pengaduan_kontak", "surat", "reservasi",
  "usaha_baru", "warga", "pengurus", "konten", "polling"
];

/* Bagian dokumen tetap di dalam koleksi "konten". */
const BAGIAN_KONTEN = [
  "profil", "kependudukan", "kontak", "sambutan", "statistik",
  "bansos", "identitas", "polling", "tampilan"
];

/* Pemanggilan yang argumen pertamanya WAJIB tetapan dari inti/nama.js:
   [nama fungsi, daftar nilai yang sah, nama tetapannya]. */
const BUTUH_TETAPAN = [
  ["muatKoleksi", KOLEKSI, "KOLEKSI"],
  ["ambilKoleksi", KOLEKSI, "KOLEKSI"],
  ["ambilMilikSaya", KOLEKSI, "KOLEKSI"],
  ["kirimWarga", KOLEKSI, "KOLEKSI"],
  ["tambahIsi", KOLEKSI, "KOLEKSI"],
  ["simpanDokumen", KOLEKSI, "KOLEKSI"],
  ["ubahStatus", KOLEKSI, "KOLEKSI"],
  ["hapusDokumen", KOLEKSI, "KOLEKSI"],
  ["muatKonten", BAGIAN_KONTEN, "KONTEN"],
  ["simpanKonten", BAGIAN_KONTEN, "KONTEN"],
  ["konten", BAGIAN_KONTEN, "KONTEN"],
  ["kontenNilai", BAGIAN_KONTEN, "KONTEN"]
];

const masalah = [];

function semuaBerkas(dir) {
  const hasil = [];
  for (const nama of readdirSync(dir)) {
    const jalur = join(dir, nama);
    if (statSync(jalur).isDirectory()) {
      hasil.push(...semuaBerkas(jalur));
    } else if (/\.(svelte|js)$/.test(nama)) {
      hasil.push(jalur);
    }
  }
  return hasil;
}

function lapisDari(jalurRelatif) {
  const bagian = jalurRelatif.split(sep);
  return bagian.length > 1 ? LAPIS[bagian[0]] : null;
}

function catat(berkas, baris, pesan) {
  masalah.push(`${berkas}:${baris}\n    ${pesan}`);
}

for (const jalur of semuaBerkas(SRC)) {
  const rel = relative(SRC, jalur);
  const isiBerkas = readFileSync(jalur, "utf8");
  const barisBaris = isiBerkas.split("\n");
  const lapisSaya = lapisDari(rel);
  const folderSaya = rel.split(sep)[0];

  barisBaris.forEach((teks, i) => {
    const nomor = i + 1;

    /* --- 1 dan 2: arah impor ------------------------------------------ */
    const impor = teks.match(/from\s+"(\.[^"]+)"/);
    if (impor) {
      const tujuan = impor[1];
      const bersih = tujuan.replace(/^(\.\.\/)+/, "").replace(/^\.\//, "");
      const folderTujuan = bersih.split("/")[0];
      const lapisTujuan = LAPIS[folderTujuan];

      if (lapisSaya && lapisTujuan) {
        if (lapisTujuan > lapisSaya) {
          catat(rel, nomor,
            `Lapis ${NAMA_LAPIS[lapisSaya]} mengimpor dari ${NAMA_LAPIS[lapisTujuan]}. ` +
            `Impor hanya boleh mengarah ke lapis yang lebih dalam. ` +
            `Pindahkan yang dibutuhkan ke lapis yang lebih dalam.`);
        }
        if (folderSaya === "halaman" && folderTujuan === "halaman") {
          catat(rel, nomor,
            `Halaman mengimpor halaman lain. Bagian yang dipakai bersama ` +
            `harus jadi komponen di src/komponen/.`);
        }
      }
    }

    /* --- 4: hanya sumber/ yang kenal firebase -------------------------- */
    if (/from\s+"firebase\//.test(teks) && folderSaya !== "sumber") {
      catat(rel, nomor,
        `Mengimpor pustaka firebase di luar src/sumber/. Semua perintah ke ` +
        `server harus lewat src/sumber/data.js atau src/sumber/akun.js.`);
    }

    /* --- 3b: nama koleksi sebagai atribut komponen ---------------------
       Lolos dari pemeriksaan 3 karena bukan pemanggilan fungsi. Sempat
       terjadi betulan: tiga belas baris <BarisHapus koleksi="pengumuman">
       tersebar di lima tab tanpa ada yang menandai. */
    const atribut = teks.match(/\bkoleksi="([a-z_]+)"/);
    if (atribut && KOLEKSI.includes(atribut[1])) {
      catat(rel, nomor,
        `koleksi="${atribut[1]}" menulis nama koleksi sebagai teks di atribut. ` +
        `Pakai koleksi={KOLEKSI.${atribut[1].toUpperCase()}} dari inti/nama.js.`);
    }

    /* --- 3: nama koleksi ditulis langsung ------------------------------ */
    if (rel !== join("inti", "nama.js")) {
      for (const [fungsi, sah, tetapan] of BUTUH_TETAPAN) {
        const cocok = teks.match(new RegExp("\\b" + fungsi + '\\(\\s*"([a-z_]+)"'));
        if (cocok && sah.includes(cocok[1])) {
          catat(rel, nomor,
            `${fungsi}("${cocok[1]}") menulis nama sebagai teks. ` +
            `Pakai ${tetapan}.${cocok[1].toUpperCase()} dari inti/nama.js -- ` +
            `salah ketik nama tidak memunculkan galat, hasilnya cuma isi ` +
            `kosong yang sulit dilacak.`);
        }
      }
    }
  });
}

if (masalah.length) {
  console.error("\nPEMERIKSAAN ARSITEKTUR GAGAL -- " + masalah.length + " masalah\n");
  masalah.forEach((m, i) => console.error("  " + (i + 1) + ". " + m + "\n"));
  console.error("Penjelasan aturan ada di PANDUAN.md.\n");
  process.exit(1);
}

console.log("Pemeriksaan arsitektur lolos. Semua impor mengarah ke dalam.");
