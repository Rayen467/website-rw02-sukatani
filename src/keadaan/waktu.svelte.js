import { bagianWaktu, FASE_WAKTU, labelFase } from "../inti/waktu.js";

const KUNCI_PREVIEW = "rw02-preview-waktu";

export const waktu = $state({
  fase: "pagi",
  faseOtomatis: "pagi",
  label: "Pagi",
  jam: "--:--",
  tanggal: "",
  otomatis: true,
  siap: false
});

export { FASE_WAKTU };

function terapkanDokumen() {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.waktu = waktu.fase;
  document.documentElement.dataset.waktuMode = waktu.otomatis ? "otomatis" : "preview";
}

function bacaPreview() {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const simpan = sessionStorage.getItem(KUNCI_PREVIEW);
    return FASE_WAKTU.some((x) => x.id === simpan) ? simpan : null;
  } catch {
    return null;
  }
}

function simpanPreview(nilai) {
  if (typeof sessionStorage === "undefined") return;
  try {
    if (nilai) sessionStorage.setItem(KUNCI_PREVIEW, nilai);
    else sessionStorage.removeItem(KUNCI_PREVIEW);
  } catch {
    /* Private mode dapat menolak sessionStorage; tampilan tetap berfungsi. */
  }
}

function segarkan() {
  const sekarang = bagianWaktu(new Date());
  waktu.faseOtomatis = sekarang.fase;
  waktu.jam = sekarang.jam;
  waktu.tanggal = sekarang.tanggal;

  if (waktu.otomatis) {
    waktu.fase = sekarang.fase;
    waktu.label = sekarang.label;
  } else {
    waktu.label = labelFase(waktu.fase);
  }

  waktu.siap = true;
  terapkanDokumen();
}

export function pilihWaktu(fase) {
  if (!FASE_WAKTU.some((x) => x.id === fase)) return;
  waktu.otomatis = false;
  waktu.fase = fase;
  waktu.label = labelFase(fase);
  simpanPreview(fase);
  terapkanDokumen();
}

export function kembaliOtomatis() {
  waktu.otomatis = true;
  simpanPreview(null);
  segarkan();
}

export function mulaiWaktu() {
  const preview = bacaPreview();
  if (preview) {
    waktu.otomatis = false;
    waktu.fase = preview;
  }

  segarkan();

  /* Menit dan perpindahan fase cukup diperiksa tiap 30 detik. Ini ringan,
     namun tetap membuat 10:59 -> 11:00 berganti tanpa reload halaman. */
  const timer = setInterval(segarkan, 30000);

  return () => {
    clearInterval(timer);
  };
}
