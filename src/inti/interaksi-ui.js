import { KONTAK_KETUA_RW } from "./kontak-resmi.js";

const KUNCI_FAVORIT = "rw02-umkm-favorit";
let sudahAktif = false;

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
  const kartu = tombol.closest(".umkm-card");
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
  requestAnimationFrame(sinkronFavorit);
  window.addEventListener("hashchange", () => requestAnimationFrame(sinkronFavorit));
}
