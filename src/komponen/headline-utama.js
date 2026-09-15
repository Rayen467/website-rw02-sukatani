import { isi } from "../keadaan/isi.svelte.js";

let sudahAktif = false;
let raf = 0;
let pengamat = null;

function aktif(nilai) {
  return nilai === true || String(nilai || "").toLowerCase() === "true";
}

function pengumumanUtama() {
  return (isi.pengumuman || []).find((o) => aktif(o.utama)) || null;
}

function samaBerita(tautan, id) {
  return Boolean(id && tautan === "#/berita/" + id);
}

function pasangFotoBeranda(utama) {
  const kartu = document.querySelector(".home-latest-main");
  if (!kartu) return;

  const href = kartu.querySelector("h4 a")?.getAttribute("href") || "";
  if (!samaBerita(href, utama.id)) return;

  /* Bingkai normal dibuat oleh interaksi-ui.js. Bila belum sempat dibuat,
     jangan membuat duplikat: MutationObserver akan mencoba lagi sesudah
     bingkai itu masuk ke DOM. */
  const gambar = kartu.querySelector(".home-latest-photo img");
  if (!gambar) return;

  if (gambar.getAttribute("src") !== utama.fotoUtama) {
    gambar.setAttribute("src", utama.fotoUtama);
  }
  gambar.setAttribute("alt", "Headline " + (utama.judul || "pengumuman utama RW 02"));
}

function pasangFotoBerita(utama) {
  const kartu = document.querySelector(".berita-unggulan");
  if (!kartu) return;

  const href = kartu.querySelector(".berita-btn.utama")?.getAttribute("href") || "";
  if (!samaBerita(href, utama.id)) return;

  const gambar = kartu.querySelector(":scope > img");
  if (!gambar) return;

  if (gambar.getAttribute("src") !== utama.fotoUtama) {
    gambar.setAttribute("src", utama.fotoUtama);
  }
  gambar.setAttribute("alt", "Headline " + (utama.judul || "pengumuman utama RW 02"));
}

function sinkronHeadlineUtama() {
  const utama = pengumumanUtama();
  if (!utama?.fotoUtama) return;
  pasangFotoBeranda(utama);
  pasangFotoBerita(utama);
}

function jadwalkan() {
  if (raf || typeof requestAnimationFrame === "undefined") return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    sinkronHeadlineUtama();
  });
}

export function aktifkanHeadlineUtama() {
  if (sudahAktif || typeof document === "undefined") return;
  sudahAktif = true;

  jadwalkan();
  window.addEventListener("hashchange", jadwalkan);

  if (typeof MutationObserver !== "undefined" && document.body) {
    pengamat = new MutationObserver(jadwalkan);
    pengamat.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }
}