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

/**
 * Foto kawasan untuk tiap fase.
 *
 * KEEMPAT FASE PUNYA FOTONYA SENDIRI. Sebelumnya cuma ada dua berkas,
 * hero-pagi dan hero-malam, dan siang serta sore ikut memakai yang pagi.
 * Lebih buruk lagi, berkas hero-pagi itu bukan WebP sama sekali -- tidak
 * ada tanda RIFF di awalnya, jadi peramban menolaknya dan sorotan halaman
 * depan kosong dari jam 5 pagi sampai 6 sore. Server tetap menjawab 200,
 * jadi tidak ada galat apa pun yang menandainya.
 *
 * Karena itu daftar ini ditulis lengkap dan di satu tempat: kalau ada
 * fase yang berkasnya hilang lagi, yang salah kelihatan di sini, bukan
 * tersebar di dua berkas komponen.
 */
export const GAMBAR_WAKTU = Object.freeze({
  // Hero final khusus — terpisah total dari aset footer.
  // Empat gambar disiapkan sebagai WebP 3840×1800.
  pagi: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/675bc197-4517-40a4-a648-4b83ea8c23f0.webp",
  siang: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/3456af31-4fbc-4ecf-80a7-7be4c32294fa.webp",
  sore: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/156af0cc-d2dd-4807-a4b9-b468c397bcea.webp",
  malam: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/ebcfc652-2164-4421-844a-88d5f558837b.webp"
});

/** Alamat foto untuk sebuah fase. Fase tak dikenal jatuh ke malam. */
export function gambarWaktu(fase) {
  return GAMBAR_WAKTU[fase] || GAMBAR_WAKTU.malam;
}


/**
 * URL absolut untuk gambar fase waktu.
 *
 * Penting untuk GitHub Pages: nilai url() yang diteruskan lewat CSS custom
 * property bisa ikut ter-resolve relatif terhadap berkas CSS hasil bundling
 * (mis. /assets/...). Dengan mengubahnya menjadi URL absolut dari document.baseURI,
 * hero dan panorama tetap menunjuk ke /website-rw02-sukatani/visual/... .
 */
export function gambarWaktuAbsolut(fase) {
  const sumber = gambarWaktu(fase);
  if (/^https?:\/\//i.test(sumber)) return sumber;
  if (typeof document === "undefined") return sumber;
  return new URL(sumber, document.baseURI).href;
}
