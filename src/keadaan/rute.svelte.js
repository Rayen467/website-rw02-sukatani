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
 *
 *  Daftar alamat yang dipakai ada di JALUR, di inti/nama.js.
 */

export const rute = $state({
  /** Alamat penuh, misalnya "/surat/domisili". */
  jalur: "/",

  /** Alamat yang sudah dipecah, misalnya ["surat", "domisili"]. */
  bagian: [],

  /** Kata yang sedang dicari di kotak pencarian. */
  cari: ""
});

function baca() {
  const mentah = location.hash.replace(/^#/, "") || "/";
  rute.jalur = mentah;
  rute.bagian = mentah.split("/").filter(Boolean);
}

/** Dipanggil sekali dari App.svelte. */
export function mulaiRute() {
  baca();
  window.addEventListener("hashchange", () => {
    baca();
    /* Pindah halaman selalu kembali ke atas. Tanpa ini, membuka berita
       dari tengah daftar akan mendarat di tengah halaman berikutnya. */
    window.scrollTo(0, 0);
  });
}

/** Pindah halaman dari dalam kode. Di markup cukup tulis href="#/surat". */
export function pergi(jalur) {
  location.hash = "#" + jalur;
}

/**
 * Alamat pangkal situs, dipakai untuk tautan yang disalin ke grup WhatsApp.
 *
 * Kalau pengurus sudah mengisi alamat situs di halaman Kelola, itu yang
 * dipakai. Kalau belum, alamat yang sedang dibuka. Bedanya terasa waktu
 * nanti pindah ke domain sendiri: tautan yang disalin ikut berubah tanpa
 * ada kode yang perlu disentuh.
 */
export function pangkalSitus(alamatSetelan) {
  const bersih = String(alamatSetelan || "").replace(/\/$/, "");
  return bersih || location.href.split("#")[0];
}
