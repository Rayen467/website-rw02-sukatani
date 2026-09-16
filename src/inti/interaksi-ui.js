import { KONTAK_KETUA_RW } from "./kontak-resmi.js";

const KUNCI_FAVORIT = "rw02-umkm-favorit";
const MEDIA_HP = "(max-width: 680px)";
const BATAS_TEKS_WEB = 14;
const BATAS_TEKS_HP = 12;
const TAG_FORM_TEKS = new Set(["INPUT", "TEXTAREA", "SELECT", "OPTION", "BUTTON"]);
const FRAGMENT_KONTAK = new Map([
  ["#form-kontak", "form-kontak"],
  ["#lokasi-kontak", "lokasi-kontak"]
]);
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

function gulirKeKontak(id) {
  const tujuan = document.getElementById(id);
  if (!tujuan) return false;
  tujuan.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

/*
 * Situs memakai hash (#/...) sebagai router. Karena itu href="#form-kontak"
 * atau href="#lokasi-kontak" tidak boleh dibiarkan mengganti hash: router
 * akan menganggapnya sebagai alamat halaman baru. Delegasi ini menjaga hash
 * tetap #/kontak dan hanya menggulir ke bagian yang dituju.
 */
function tanganiFragmentKontak(event, tautan) {
  const href = tautan?.getAttribute("href") || "";
  const id = FRAGMENT_KONTAK.get(href);
  if (!id) return false;

  event.preventDefault();

  if (
    href === "#form-kontak" &&
    tautan.closest(".kontak-final__shortcuts") &&
    tautan.textContent?.includes("Chat WhatsApp") &&
    bukaWaKetuaRw()
  ) {
    return true;
  }

  gulirKeKontak(id);
  return true;
}

function sinkronShortcutKontak() {
  const jalan = () => {
    const shortcut = [...document.querySelectorAll(".kontak-final__shortcuts a")];
    if (!shortcut.length) return;

    const email = shortcut.find((a) => a.textContent?.includes("Kirim Email"));
    if (email?.getAttribute("href") === "#form-kontak") {
      const kecil = email.querySelector("small");
      if (kecil && kecil.textContent !== "Email resmi belum dicantumkan") {
        kecil.textContent = "Email resmi belum dicantumkan";
      }
      email.setAttribute("title", "Email resmi RW belum dicantumkan. Gunakan formulir online.");
    }

    const sosial = shortcut.find((a) => a.textContent?.includes("Ikuti Media Sosial"));
    if (sosial?.getAttribute("href") === "#/galeri") {
      const judul = sosial.querySelector("strong");
      const kecil = sosial.querySelector("small");
      if (judul && judul.textContent !== "Galeri Kegiatan") judul.textContent = "Galeri Kegiatan";
      if (kecil && kecil.textContent !== "Foto & video warga") kecil.textContent = "Foto & video warga";
      sosial.setAttribute("title", "Buka dokumentasi foto dan video kegiatan warga");
    }
  };

  if (typeof requestAnimationFrame === "undefined") jalan();
  else requestAnimationFrame(jalan);
}

function tanganiKlik(event) {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const tautan = target.closest("a");
  if (tautan && tanganiFragmentKontak(event, tautan)) return;

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
  }
}

export function aktifkanInteraksiUi() {
  if (sudahAktif || typeof document === "undefined") return;
  sudahAktif = true;
  document.addEventListener("click", tanganiKlik);
  requestAnimationFrame(() => {
    sinkronFavorit();
    sinkronShortcutKontak();
  });
  aktifkanBatasTipografi();
  window.addEventListener("hashchange", () => requestAnimationFrame(() => {
    sinkronFavorit();
    sinkronShortcutKontak();
  }));
}