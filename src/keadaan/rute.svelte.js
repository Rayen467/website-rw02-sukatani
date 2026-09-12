/**
 * ===========================================================================
 *  RUTE -- halaman mana yang sedang terbuka
 * ===========================================================================
 *
 *  LAPIS 3 (keadaan). Boleh mengimpor: inti/
 *
 *  Alamat halaman ditulis SETELAH TANDA PAGAR, misalnya #/surat/domisili.
 *
 *  Kenapa pakai tanda pagar, bukan alamat biasa seperti /surat? Karena
 *  alamat biasa membuat server harus diberi tahu supaya semua alamat
 *  diarahkan ke satu berkas. GitHub Pages tidak bisa diatur begitu. Dengan
 *  tanda pagar, situs ini bisa diunggah ke hosting statis mana pun --
 *  GitHub Pages, Netlify, Cloudflare, bahkan flashdisk -- tanpa pengaturan
 *  apa pun. Kalau nanti pindah ke hosting yang bisa diatur, ini boleh
 *  diganti; sampai saat itu, jangan.
 */

export const rute = $state({
  jalur: "/",
  bagian: [],
  cari: ""
});

function terapkanTemaWaktuHalaman() {
  if (typeof document === "undefined") return;

  const halaman = rute.bagian[0] || "beranda";
  const halamanUmkm = halaman === "umkm" || halaman === "daftar-usaha";
  const halamanPetugas = halaman === "petugas" || halaman === "kelola";

  /* Pertahankan kontrak lama: UMKM selalu nonaktif. */
  document.documentElement.dataset.waktuSitus = halamanUmkm ? "nonaktif" : "aktif";

  /* Portal Petugas juga harus stabil sepanjang hari, tetapi dipisahkan dari
     logika UMKM supaya aturan lama tetap mudah diuji dan dibaca. */
  if (halamanPetugas) document.documentElement.dataset.waktuSitus = "nonaktif";

  document.documentElement.dataset.halaman = halaman;
}

function baca() {
  const mentah = location.hash.replace(/^#/, "") || "/";
  rute.jalur = mentah;
  rute.bagian = mentah.split("/").filter(Boolean);
  terapkanTemaWaktuHalaman();
}

export function mulaiRute() {
  baca();
  window.addEventListener("hashchange", () => {
    baca();
    window.scrollTo(0, 0);
  });
}

export function pergi(jalur) {
  location.hash = "#" + jalur;
}

export function pangkalSitus(alamatSetelan) {
  const bersih = String(alamatSetelan || "").replace(/\/$/, "");
  return bersih || location.href.split("#")[0];
}
