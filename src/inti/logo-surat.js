const BASE = import.meta.env.BASE_URL;

/*
 * Kedua aset logo surat saat ini berupa SVG pembungkus yang menyimpan
 * gambar WebP di dalam <image href="data:image/webp;base64,...">.
 * Pada beberapa browser, SVG seperti itu dapat tampil sebagai ikon gambar
 * rusak ketika SVG tersebut dipakai lagi lewat <img>. Untuk surat, ambil
 * WebP yang tertanam dan gunakan data-URI-nya secara langsung.
 */
async function muatLogoSurat(namaBerkas) {
  const alamatSvg = `${BASE}visual/brand/${namaBerkas}.svg`;

  try {
    const respons = await fetch(alamatSvg, { cache: "force-cache" });
    if (!respons.ok) return alamatSvg;

    const svg = await respons.text();
    const cocok = svg.match(/(?:href|xlink:href)=["'](data:image\/webp;base64,[^"']+)["']/i);
    return cocok?.[1] || alamatSvg;
  } catch (err) {
    console.warn(`Logo surat gagal dimuat: ${namaBerkas}`, err);
    return alamatSvg;
  }
}

const [logoKabupaten, logoRw] = await Promise.all([
  muatLogoSurat("logo-kabupaten-tangerang"),
  muatLogoSurat("logo-rw02-sukatani")
]);

export const LOGO_KABUPATEN_TANGERANG = logoKabupaten;
export const LOGO_RW_SUKATANI = logoRw;
