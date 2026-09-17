const BASE = import.meta.env.BASE_URL;

// Aset kop surat disimpan langsung di folder public supaya browser dan
// hasil cetak/PDF memakai file PNG asli, tanpa pembungkus SVG/data-URI.
// BASE_URL penting karena situs dipasang di GitHub Pages pada subpath repo.
export const LOGO_KABUPATEN_TANGERANG =
  `${BASE}ChatGPT%20Image%20Sep%2018%2C%202026%2C%2012_19_52%20AM.png`;

export const LOGO_RW_SUKATANI =
  `${BASE}Logo_RW02_Sukatani_Kop_Surat_4K_Transparan%20%281%29.png`;
