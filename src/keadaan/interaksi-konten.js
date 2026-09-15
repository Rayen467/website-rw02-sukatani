import { KONTEN } from "../inti/nama.js";
import { isi, konten } from "./isi.svelte.js";

let sudahAktif = false;
let raf = 0;
let pengamat = null;

function sinkronFotoBeranda() {
  const kartu = document.querySelector(".home-latest-main");
  if (!kartu) return;

  const sumber = String(isi.pengumuman?.[0]?.foto || "").trim();
  let bingkai = kartu.querySelector(".home-latest-photo");

  if (!sumber) {
    if (bingkai) bingkai.remove();
    return;
  }

  if (!bingkai) {
    bingkai = document.createElement("figure");
    bingkai.className = "home-latest-photo";
    const gambar = document.createElement("img");
    gambar.loading = "lazy";
    gambar.decoding = "async";
    bingkai.appendChild(gambar);

    const baca = kartu.querySelector(".home-read");
    if (baca) kartu.insertBefore(bingkai, baca);
    else kartu.appendChild(bingkai);
  }

  const gambar = bingkai.querySelector("img");
  if (!gambar) return;
  if (gambar.getAttribute("src") !== sumber) gambar.setAttribute("src", sumber);
  const judul = kartu.querySelector("h4")?.textContent?.trim() || "Pengumuman RW 02";
  gambar.setAttribute("alt", `Foto ${judul}`);
}

function sinkronKontakPublik() {
  const akar = document.querySelector(".kontak-final");
  if (!akar) return;
  const data = konten(KONTEN.KONTAK) || {};

  const pasang = (selector, nilai) => {
    const teks = String(nilai || "").trim();
    if (!teks) return;
    const elemen = akar.querySelector(selector);
    if (elemen && elemen.textContent !== teks) elemen.textContent = teks;
  };

  pasang(".kontak-final__hero-copy h1", data.heroJudul);
  pasang(".kontak-final__hero-copy h2", data.heroSubjudul);
  pasang(".kontak-final__hero-copy > p", data.heroTeks);
  pasang(".kontak-final__hero-quote strong", data.heroKutipan);
}

function sinkron() {
  raf = 0;
  sinkronFotoBeranda();
  sinkronKontakPublik();
}

function jadwalkan() {
  if (raf || typeof requestAnimationFrame === "undefined") return;
  raf = requestAnimationFrame(sinkron);
}

export function aktifkanInteraksiKonten() {
  if (sudahAktif || typeof document === "undefined") return;
  sudahAktif = true;

  jadwalkan();
  window.addEventListener("hashchange", jadwalkan);

  /* Koleksi Firestore dimuat setelah App sudah tampil. MutationObserver
     membuat sinkronisasi berjalan lagi ketika Svelte menggambar data baru,
     tanpa membuat lapis inti bergantung pada state aplikasi. */
  if (typeof MutationObserver !== "undefined" && document.body) {
    pengamat = new MutationObserver(jadwalkan);
    pengamat.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
}