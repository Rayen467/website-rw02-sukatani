/**
 * Penunjuk halaman.
 *
 * Alamat halaman ditulis setelah tanda pagar, misalnya #/surat/domisili.
 * Cara ini dipilih supaya situs bisa diunggah ke hosting statis mana pun
 * tanpa perlu pengaturan pengalihan di sisi server -- termasuk GitHub Pages.
 */

export const rute = $state({
  jalur: "/",   // "/surat/domisili"
  bagian: [],   // ["surat", "domisili"]
  cari: ""      // kata yang sedang dicari
});

function baca() {
  const mentah = location.hash.replace(/^#/, "") || "/";
  rute.jalur = mentah;
  rute.bagian = mentah.split("/").filter(Boolean);
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

/** Alamat pangkal situs, dipakai untuk tautan yang disalin ke grup. */
export function pangkalSitus(alamatSetelan) {
  const bersih = String(alamatSetelan || "").replace(/\/$/, "");
  return bersih || location.href.split("#")[0];
}
