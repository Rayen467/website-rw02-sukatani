export const ZONA_WAKTU_RW = "Asia/Jakarta";

export const FASE_WAKTU = [
  { id: "pagi", label: "Pagi", mulai: 5, selesai: 11 },
  { id: "siang", label: "Siang", mulai: 11, selesai: 15 },
  { id: "sore", label: "Sore", mulai: 15, selesai: 18 },
  { id: "malam", label: "Malam", mulai: 18, selesai: 29 }
];

export function faseUntukJam(jam) {
  const h = ((Number(jam) % 24) + 24) % 24;
  if (h >= 5 && h < 11) return "pagi";
  if (h >= 11 && h < 15) return "siang";
  if (h >= 15 && h < 18) return "sore";
  return "malam";
}

export function labelFase(fase) {
  return FASE_WAKTU.find((x) => x.id === fase)?.label || "Pagi";
}

export function bagianWaktu(tanggal = new Date()) {
  const bagian = new Intl.DateTimeFormat("id-ID", {
    timeZone: ZONA_WAKTU_RW,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).formatToParts(tanggal);

  const ambil = (jenis) => bagian.find((x) => x.type === jenis)?.value || "";
  const jamAngka = Number(ambil("hour"));
  const fase = faseUntukJam(jamAngka);

  return {
    fase,
    label: labelFase(fase),
    jam: ambil("hour") + ":" + ambil("minute"),
    tanggal: ambil("weekday") + ", " + ambil("day") + " " + ambil("month") + " " + ambil("year")
  };
}
