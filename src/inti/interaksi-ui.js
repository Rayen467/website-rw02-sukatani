import { KONTAK_KETUA_RW } from "./kontak-resmi.js";
import { KONTEN } from "./nama.js";
import { isi, konten } from "../keadaan/isi.svelte.js";

const KUNCI_FAVORIT = "rw02-umkm-favorit";
const MEDIA_HP = "(max-width: 680px)";
const BATAS_TEKS_WEB = 14;
const BATAS_TEKS_HP = 12;
const TAG_FORM_TEKS = new Set(["INPUT", "TEXTAREA", "SELECT", "OPTION", "BUTTON"]);
let sudahAktif = false;
let rafTipografi = 0;
let pengamatTipografi = null;

function nomorWa(nomor) {
  return String(nomor || "").replace(/[^0-9]/g, "").replace(/^0/, "62");
}

function ambilFavorit() {
  try {
    const data = JSON.parse(localStorage.getItem(KUNCI_FAVORIT) || "[]");
    return new Set(Array.isArray(data) ? data : []);
  } catch {
    return new Set();
  }
}

function simpanFavorit(data) {
  try {
    localStorage.setItem(KUNCI_FAVORIT, JSON.stringify([...data]));
  } catch {
    // Situs tetap berfungsi bila penyimpanan lokal diblokir peramban.
  }
}

function idUsaha(tombol) {
  const kartu = tombol.closest(".umkm-card, .market-card");
  if (!kartu) return "";
  const tautan = kartu.querySelector("h3 a")?.getAttribute("href") || "";
  const nama = kartu.querySelector("h3")?.textContent?.trim() || "";
  return tautan && tautan !== "#/daftar-usaha" ? tautan : nama;
}

function sinkronFavorit() {
  const favorit = ambilFavorit();
  document.querySelectorAll('.umkm-card-foto button[aria-label="Simpan usaha"]').forEach((tombol) => {
    const id = idUsaha(tombol);
    const aktif = Boolean(id && favorit.has(id));
    tombol.textContent = aktif ? "♥" : "♡";
    tombol.setAttribute("aria-pressed", aktif ? "true" : "false");
    tombol.setAttribute("title", aktif ? "Hapus dari usaha tersimpan" : "Simpan usaha");
  });
}

/**
 * Foto "Informasi terbaru" harus berasal dari data berita yang memang
 * diunggah pengurus. Sebelumnya judul berita dicocokkan dengan kata kunci
 * lalu situs memasang foto kegiatan lain secara otomatis. Itu membuat
 * dokumentasi terlihat seperti foto asli berita padahal bukan.
 *
 * Sekarang: ada foto di dokumen pengumuman -> tampil. Tidak ada -> blok foto
 * dihapus dan kartu tetap rapi sebagai artikel teks.
 */
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

/** Tulisan utama halaman Kontak ikut dokumen konten/kontak agar Petugas
 * dapat mengubah copy publik tanpa menyentuh source code. Data operasional
 * seperti alamat dan jam sudah dibaca langsung oleh komponen Svelte. */
function sinkronKontakPublik() {
  const akar = document.querySelector(".kontak-final");
  if (!akar) return;
  const data = konten(KONTEN.KONTAK) || {};
  const pasang = (selector, nilai) => {
    if (!nilai) return;
    const elemen = akar.querySelector(selector);
    if (elemen && elemen.textContent !== nilai) elemen.textContent = nilai;
  };
  pasang(".kontak-final__hero-copy h1", data.heroJudul);
  pasang(".kontak-final__hero-copy h2", data.heroSubjudul);
  pasang(".kontak-final__hero-copy > p", data.heroTeks);
  pasang(".kontak-final__hero-quote strong", data.heroKutipan);
}

function punyaTeksLangsung(elemen) {
  if (TAG_FORM_TEKS.has(elemen.tagName)) return true;
  return [...elemen.childNodes].some((node) =>
    node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim())
  );
}

function pulihkanBatasTipografi() {
  document.querySelectorAll("[data-rw-tipografi-min]").forEach((elemen) => {
    const ukuranAsli = elemen.getAttribute("data-rw-tipografi-asli") || "";
    if (ukuranAsli) elemen.style.fontSize = ukuranAsli;
    else elemen.style.removeProperty("font-size");
    elemen.removeAttribute("data-rw-tipografi-min");
    elemen.removeAttribute("data-rw-tipografi-asli");
  });
}

function terapkanBatasTipografi() {
  if (typeof window === "undefined" || !document.body) return;

  pulihkanBatasTipografi();
  const batas = window.matchMedia(MEDIA_HP).matches ? BATAS_TEKS_HP : BATAS_TEKS_WEB;

  document.querySelectorAll("body *").forEach((elemen) => {
    /* Identitas navbar dan footer sengaja memakai tipografi mikro agar brand
       tidak mendominasi header/kaki halaman. Jangan paksa ke minimum 14/12px. */
    if (elemen.closest(".merek-teks, .kaki-logo-teks")) return;
    if (!punyaTeksLangsung(elemen)) return;
    const ukuran = Number.parseFloat(window.getComputedStyle(elemen).fontSize);
    if (!Number.isFinite(ukuran) || ukuran >= batas) return;

    elemen.setAttribute("data-rw-tipografi-asli", elemen.style.fontSize || "");
    elemen.setAttribute("data-rw-tipografi-min", String(batas));
    elemen.style.setProperty("font-size", `${batas}px`, "important");
  });
}

function jadwalkanBatasTipografi() {
  if (rafTipografi || typeof requestAnimationFrame === "undefined") return;
  rafTipografi = requestAnimationFrame(() => {
    rafTipografi = 0;
    sinkronFotoBeranda();
    sinkronKontakPublik();
    terapkanBatasTipografi();
  });
}

function aktifkanBatasTipografi() {
  jadwalkanBatasTipografi();
  window.addEventListener("resize", jadwalkanBatasTipografi, { passive: true });
  window.addEventListener("hashchange", jadwalkanBatasTipografi);

  if (typeof MutationObserver !== "undefined" && document.body) {
    pengamatTipografi = new MutationObserver(jadwalkanBatasTipografi);
    pengamatTipografi.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }
}

function bukaWaKetuaRw() {
  const nomor = nomorWa(KONTAK_KETUA_RW);
  if (!nomor) return false;
  const jendela = window.open(`https://wa.me/${nomor}`, "_blank", "noopener,noreferrer");
  if (jendela) jendela.opener = null;
  return true;
}

function tanganiKlik(event) {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const cari = target.closest(".umkm-cari button");
  if (cari) {
    event.preventDefault();
    document.querySelector(".umkm-pilihan")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const simpan = target.closest('.umkm-card-foto button[aria-label="Simpan usaha"]');
  if (simpan) {
    event.preventDefault();
    event.stopPropagation();

    const id = idUsaha(simpan);
    if (!id) return;
    const favorit = ambilFavorit();
    if (favorit.has(id)) favorit.delete(id);
    else favorit.add(id);
    simpanFavorit(favorit);
    sinkronFavorit();
    return;
  }

  const waCepat = target.closest(".kontak-final__shortcuts a");
  if (
    waCepat &&
    waCepat.textContent?.includes("Chat WhatsApp") &&
    waCepat.getAttribute("href") === "#form-kontak"
  ) {
    event.preventDefault();
    bukaWaKetuaRw();
  }
}

export function aktifkanInteraksiUi() {
  if (sudahAktif || typeof document === "undefined") return;
  sudahAktif = true;
  document.addEventListener("click", tanganiKlik);
  requestAnimationFrame(() => {
    sinkronFavorit();
    sinkronFotoBeranda();
    sinkronKontakPublik();
  });
  aktifkanBatasTipografi();
  window.addEventListener("hashchange", () => requestAnimationFrame(() => {
    sinkronFavorit();
    sinkronFotoBeranda();
    sinkronKontakPublik();
  }));
}