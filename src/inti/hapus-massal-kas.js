import { KOLEKSI } from "./nama.js";
import { isi, muatKoleksi } from "../keadaan/isi.svelte.js";
import { hapusDokumen } from "../sumber/data.js";
import { beriTahu } from "../keadaan/pesan.svelte.js";
import { pesanRamah } from "../sumber/firebase.js";

const ID = "hapus-massal-kas";
let menghapus = false;

function diHalamanTransparansiPetugas() {
  return location.hash.startsWith("#/kelola/angka") || location.hash.startsWith("#/petugas/angka");
}

function cariBlokKas() {
  const blok = [...document.querySelectorAll("section.blok")];
  return blok.find((bagian) => {
    const judul = bagian.querySelector("h2");
    return judul && /catat transaksi kas/i.test(judul.textContent || "");
  }) || null;
}

function buatPanel() {
  const panel = document.createElement("div");
  panel.id = ID;
  panel.style.cssText = [
    "display:flex",
    "align-items:center",
    "justify-content:space-between",
    "gap:16px",
    "flex-wrap:wrap",
    "margin:22px 0 14px",
    "padding:14px 16px",
    "border:1px solid #f1c6c6",
    "border-radius:12px",
    "background:#fff8f8"
  ].join(";");

  const keterangan = document.createElement("div");
  keterangan.innerHTML = '<b style="display:block;color:#7d1d1d;margin-bottom:3px">Bersihkan data transaksi</b><span data-jumlah style="font-size:13px;color:#6f6666">Memuat jumlah transaksi...</span>';

  const tombol = document.createElement("button");
  tombol.type = "button";
  tombol.dataset.aksi = "hapus-semua";
  tombol.textContent = "Hapus semua transaksi";
  tombol.style.cssText = [
    "border:1px solid #d43a3a",
    "background:#fff",
    "color:#b42323",
    "font-weight:700",
    "border-radius:9px",
    "padding:9px 13px",
    "cursor:pointer"
  ].join(";");

  tombol.addEventListener("click", async () => {
    if (menghapus) return;
    const daftar = Array.isArray(isi.kas) ? [...isi.kas] : [];
    if (!daftar.length) {
      beriTahu("Tidak ada transaksi kas untuk dihapus.");
      return;
    }

    const setuju = confirm(
      `Hapus SEMUA ${daftar.length} transaksi kas dari transparansi?\n\n` +
      "Gunakan ini untuk membersihkan data dummy/tidak terpakai sebelum mengunggah data Excel yang benar.\n\n" +
      "Tindakan ini tidak bisa dibatalkan."
    );
    if (!setuju) return;

    menghapus = true;
    tombol.disabled = true;
    tombol.style.opacity = "0.65";

    try {
      for (let i = 0; i < daftar.length; i += 1) {
        tombol.textContent = `Menghapus ${i + 1}/${daftar.length}...`;
        await hapusDokumen(KOLEKSI.KAS, daftar[i].id);
      }
      await muatKoleksi(KOLEKSI.KAS);
      beriTahu(`${daftar.length} transaksi kas berhasil dihapus.`);
    } catch (err) {
      beriTahu(pesanRamah(err));
      await muatKoleksi(KOLEKSI.KAS);
    } finally {
      menghapus = false;
      tombol.disabled = false;
      tombol.style.opacity = "1";
      tombol.textContent = "Hapus semua transaksi";
      sinkronkanPanel();
    }
  });

  panel.append(keterangan, tombol);
  return panel;
}

function sinkronkanPanel() {
  if (!diHalamanTransparansiPetugas()) {
    document.getElementById(ID)?.remove();
    return;
  }

  const blok = cariBlokKas();
  if (!blok) return;

  let panel = document.getElementById(ID);
  if (!panel) {
    panel = buatPanel();
    const daftarPertama = blok.querySelector(".baris-kelola");
    if (daftarPertama) daftarPertama.before(panel);
    else blok.append(panel);
  }

  const jumlah = Array.isArray(isi.kas) ? isi.kas.length : 0;
  const teks = panel.querySelector("[data-jumlah]");
  if (teks) {
    teks.textContent = jumlah
      ? `${jumlah} transaksi tersimpan. Bisa dibersihkan sekaligus jika masih data dummy/tidak terpakai.`
      : "Belum ada transaksi kas tersimpan.";
  }

  const tombol = panel.querySelector("[data-aksi='hapus-semua']");
  if (tombol && !menghapus) tombol.disabled = jumlah === 0;
}

export function aktifkanHapusMassalKas() {
  const jadwalkan = () => setTimeout(sinkronkanPanel, 80);
  window.addEventListener("hashchange", jadwalkan);

  const pengamat = new MutationObserver(() => {
    if (diHalamanTransparansiPetugas()) jadwalkan();
  });
  pengamat.observe(document.body, { childList: true, subtree: true });

  jadwalkan();
}
