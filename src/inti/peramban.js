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
