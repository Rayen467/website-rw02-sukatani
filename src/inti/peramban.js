/**
 * ===========================================================================
 *  PERAMBAN -- semua yang butuh peramban, dikumpulkan di satu tempat
 * ===========================================================================
 *
 *  LAPIS 1 (inti). Hanya mengimpor sesama inti.
 *
 *  Isinya: penyimpanan lokal, papan klip, dan pengecilan foto. Semuanya
 *  hal yang BISA GAGAL di HP tertentu -- mode penyamaran mematikan
 *  penyimpanan lokal, sebagian peramban menolak papan klip kalau tidak
 *  dipanggil tepat saat layar disentuh. Karena itu setiap fungsi di sini
 *  menangkap galatnya sendiri dan tidak pernah melempar ke pemanggilnya.
 *
 *  Dipisah dari inti/format.js supaya jelas mana yang bisa dijalankan di
 *  luar peramban dan mana yang tidak.
 */

import { KUNCI_SIMPAN } from "./nama.js";

/**
 * Membaca dan menulis penyimpanan peramban tanpa pernah melempar galat.
 * Di mode penyamaran penyimpanan bisa ada tapi menolak ditulis; itu bukan
 * alasan seluruh halaman ikut mati.
 */
export const simpanan = {
  baca(kunci) {
    try {
      return localStorage.getItem(kunci);
    } catch (e) {
      return null;
    }
  },
  tulis(kunci, isi) {
    try {
      localStorage.setItem(kunci, isi);
    } catch (e) {}
  },
  hapus(kunci) {
    try {
      localStorage.removeItem(kunci);
    } catch (e) {}
  }
};

/**
 * Menyusun nomor antrean berurutan, disimpan di peramban pemohon.
 *
 * Nomor ini penanda untuk pemohon sendiri, BUKAN nomor resmi dari server:
 * dua orang di HP berbeda bisa mendapat nomor sama. Yang mengikat tetap
 * dokumen di Firestore. Kalau nanti perlu nomor tunggal yang benar, itu
 * harus dihitung di server, bukan di sini.
 */
export function nomorAntrean(awalan) {
  const kunci = KUNCI_SIMPAN.ANTREAN + awalan;
  const tersimpan = simpanan.baca(kunci);
  let n = parseInt(tersimpan, 10) + 1;
  if (isNaN(n)) n = 41;
  simpanan.tulis(kunci, String(n));
  return awalan + "-" + new Date().getFullYear() + "-" + String(n).padStart(4, "0");
}

/**
 * Menyalin teks ke papan klip.
 * Cara baru dicoba lebih dulu, lalu cara lama sebagai cadangan.
 */
export async function salinTeks(teks) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(teks);
      return true;
    }
  } catch (e) {}

  try {
    const ta = document.createElement("textarea");
    ta.value = teks;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    const berhasil = document.execCommand("copy");
    document.body.removeChild(ta);
    return berhasil;
  } catch (e) {
    return false;
  }
}

/**
 * Batas panjang teks berkas yang boleh disimpan di satu dokumen Firestore.
 *
 * Firestore membatasi SATU DOKUMEN 1.048.576 huruf. Berkas disimpan sebagai
 * teks base64, dan base64 membengkakkan ukuran asli sekitar sepertiga. Sisa
 * ruangnya masih dipakai judul, keterangan, dan tanggal. Karena itu batasnya
 * ditaruh di 700.000 huruf, yang setara berkas asli sekitar 510 KB.
 *
 * Angka ini yang menentukan apa yang muat dan apa yang tidak:
 *      muat        PDF surat, SK, formulir, notulen ketikan, foto
 *      tidak muat  video apa pun, PDF hasil pindaian tebal
 * Yang tidak muat ditempel sebagai tautan Google Drive atau YouTube.
 */
export const BATAS_BERKAS = 700000;

/** Berapa KB kira-kira berkas asli yang masih muat. Dipakai di keterangan. */
export const BATAS_BERKAS_KB = Math.round((BATAS_BERKAS * 3) / 4 / 1024);

/** Batas ukuran foto setelah dikecilkan, dihitung dari panjang teksnya. */
const BATAS_FOTO = 700000;

/**
 * Mengecilkan foto di perangkat sebelum dikirim.
 *
 * Firestore membatasi satu dokumen 1 MB, jadi hasilnya dijaga di bawah
 * 700 KB dengan menurunkan mutu bertahap. Foto disimpan sebagai teks di
 * dalam dokumen, bukan di penyimpanan berkas terpisah -- pilihan ini
 * menjaga situs tetap di paket Firebase tanpa biaya dan tanpa pengaturan
 * tambahan di konsol.
 *
 * Kalau nanti fotonya sudah puluhan, INI titik yang perlu diganti: cukup
 * berkas ini dan pemanggilnya, tidak menyebar ke halaman mana pun.
 */
export function kecilkanFoto(berkas, sisiMaks = 900) {
  return new Promise((selesai, gagal) => {
    const pembaca = new FileReader();
    pembaca.onerror = () => gagal(new Error("berkas tidak terbaca"));
    pembaca.onload = () => {
      const img = new Image();
      img.onerror = () => gagal(new Error("berkas bukan gambar"));
      img.onload = () => {
        const skala = Math.min(1, sisiMaks / Math.max(img.width, img.height));
        const kanvas = document.createElement("canvas");
        kanvas.width = Math.max(1, Math.round(img.width * skala));
        kanvas.height = Math.max(1, Math.round(img.height * skala));
        kanvas.getContext("2d").drawImage(img, 0, 0, kanvas.width, kanvas.height);

        let mutu = 0.78;
        let hasil = kanvas.toDataURL("image/jpeg", mutu);
        while (hasil.length > BATAS_FOTO && mutu > 0.3) {
          mutu -= 0.1;
          hasil = kanvas.toDataURL("image/jpeg", mutu);
        }
        if (hasil.length > BATAS_FOTO) {
          gagal(new Error("foto terlalu besar walau sudah dikecilkan"));
        } else {
          selesai(hasil);
        }
      };
      img.src = pembaca.result;
    };
    pembaca.readAsDataURL(berkas);
  });
}

/**
 * Membaca berkas apa pun -- PDF, Word, Excel -- jadi teks yang bisa
 * disimpan di Firestore, sama seperti foto.
 *
 * Berbeda dengan kecilkanFoto(), berkas TIDAK BISA dikecilkan: memampatkan
 * PDF berarti membongkar isinya, dan itu bukan pekerjaan peramban. Jadi
 * yang kelewat besar ditolak apa adanya, dengan pesan yang menyebut ukuran
 * sebenarnya supaya pengurus tahu harus berbuat apa.
 *
 * Ukuran dicek DUA KALI. Yang pertama dari berkas.size, supaya berkas 50 MB
 * ditolak seketika tanpa dibaca -- membaca berkas sebesar itu jadi teks
 * bisa membekukan HP. Yang kedua setelah jadi teks, karena pembengkakan
 * base64 tidak selalu tepat sepertiga.
 */
export function bacaBerkas(berkas) {
  return new Promise((selesai, gagal) => {
    if (!berkas) return gagal(new Error("tidak ada berkas dipilih"));

    const kbAsli = Math.round(berkas.size / 1024);
    if (berkas.size > (BATAS_BERKAS * 3) / 4) {
      return gagal(
        new Error(
          "ukurannya " + kbAsli + " KB, batasnya " + BATAS_BERKAS_KB +
          " KB. Unggah ke Google Drive lalu tempel tautannya."
        )
      );
    }

    const pembaca = new FileReader();
    pembaca.onerror = () => gagal(new Error("berkas tidak terbaca"));
    pembaca.onload = () => {
      const hasil = String(pembaca.result || "");
      if (hasil.length > BATAS_BERKAS) {
        return gagal(
          new Error(
            "ukurannya " + kbAsli + " KB, masih terlalu besar. " +
            "Unggah ke Google Drive lalu tempel tautannya."
          )
        );
      }
      selesai({ data: hasil, kb: kbAsli, nama: berkas.name || "berkas" });
    };
    pembaca.readAsDataURL(berkas);
  });
}

/**
 * Menyimpan teks jadi berkas yang diunduh pengunjung.
 *
 * Diawali BOM UTF-8. Tanpa itu Excel di Windows membaca berkas sebagai
 * ANSI, dan setiap huruf beraksen atau tanda kutip miring berubah jadi
 * cacahan huruf aneh -- persis mojibake yang pernah bikin repot dulu.
 */
export function unduhTeks(namaBerkas, isiTeks, jenis = "text/csv") {
  const gumpal = new Blob(["﻿" + isiTeks], { type: jenis + ";charset=utf-8" });
  const alamat = URL.createObjectURL(gumpal);
  const a = document.createElement("a");
  a.href = alamat;
  a.download = namaBerkas;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(alamat);
}
