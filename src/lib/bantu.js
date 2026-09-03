/**
 * Fungsi pembantu kecil yang dipakai di banyak tempat.
 * Tidak ada yang menyentuh Firebase atau tampilan di sini.
 */

/** Penanda untuk keterangan yang belum diisi pengurus. */
export const KOSONG = "……";

/** Menampilkan nilai, atau tanda titik-titik bila belum diisi. */
export function nilai(v) {
  return v === null || v === undefined || v === "" ? KOSONG : String(v);
}

/** Mengubah angka menjadi tulisan rupiah. */
export function rupiah(n) {
  const x = parseInt(String(n).replace(/[^0-9-]/g, ""), 10);
  if (isNaN(x)) return KOSONG;
  return "Rp" + x.toLocaleString("id-ID");
}

/** Membaca angka dari isian yang mungkin bercampur huruf. */
export function angkaDari(v) {
  const n = parseInt(String(v).replace(/[^0-9-]/g, ""), 10);
  return isNaN(n) ? 0 : n;
}

/**
 * Mengubah teks bertingkat "label : nilai" per baris menjadi daftar pasangan.
 * Dipakai supaya pengurus cukup mengetik di satu kotak, tanpa formulir
 * bercabang yang menyusahkan di layar HP.
 */
export function uraiBaris(teks) {
  if (!teks) return [];
  return String(teks)
    .split("\n")
    .map((baris) => {
      const potong = baris.split(":");
      if (potong.length < 2) return null;
      return [potong[0].trim(), potong.slice(1).join(":").trim()];
    })
    .filter((x) => x && x[0]);
}

/** Memecah teks menjadi daftar baris, membuang baris kosong. */
export function keDaftar(teks) {
  if (!teks) return [];
  return String(teks)
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

/** Membuat nama pendek yang aman dipakai sebagai alamat halaman. */
export function keSlug(teks) {
  return String(teks || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

/** Menyusun nomor antrean berurutan, disimpan di peramban pemohon. */
export function nomorAntrean(awalan) {
  let n = 40;
  try {
    n = parseInt(localStorage.getItem("antrean-" + awalan) || "40", 10) + 1;
    localStorage.setItem("antrean-" + awalan, String(n));
  } catch (e) {
    n = Math.floor(Math.random() * 900) + 100;
  }
  return awalan + "-" + new Date().getFullYear() + "-" + String(n).padStart(4, "0");
}

/** Membaca dan menulis penyimpanan peramban tanpa pernah melempar galat. */
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
 * Menyalin teks ke papan klip. Mencoba cara baru dulu, lalu cara lama,
 * karena sebagian peramban di HP menolak cara baru tanpa sentuhan langsung.
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
 * Mengecilkan foto di perangkat sebelum dikirim.
 * Firestore membatasi satu dokumen 1 MB, jadi hasilnya dijaga di bawah
 * 700 KB dengan menurunkan mutu bertahap. Tidak memakai penyimpanan
 * terpisah supaya tetap di paket tanpa biaya.
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
        while (hasil.length > 700000 && mutu > 0.3) {
          mutu -= 0.1;
          hasil = kanvas.toDataURL("image/jpeg", mutu);
        }
        if (hasil.length > 700000) {
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

/** Tanggal hari ini dalam bentuk 2026-09-14. */
export function tanggalHariIni() {
  return new Date().toISOString().slice(0, 10);
}

/** Nama bulan dalam bahasa Indonesia. */
export const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];
