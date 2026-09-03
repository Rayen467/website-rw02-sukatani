/**
 * Mesin tampilan.
 *
 * Seluruh warna situs memakai token CSS, jadi mengubah tampilan cukup
 * menimpa tokennya saat halaman berjalan. Pengurus mengatur ini lewat
 * halaman Kelola, tanpa menyentuh satu baris kode pun.
 *
 * Warna pendamping dihitung dari warna utama, bukan dipilih terpisah.
 * Itu disengaja: mencegah perpaduan yang tidak terbaca.
 */

export const HURUF = {
  bawaan: {
    nama: "Archivo + Plus Jakarta Sans",
    judul: '"Archivo", "Arial Narrow", Arial, sans-serif',
    isi: '"Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif',
    muat: null
  },
  klasik: {
    nama: "Playfair Display + Source Sans 3",
    judul: '"Playfair Display", Georgia, serif',
    isi: '"Source Sans 3", "Segoe UI", system-ui, sans-serif',
    muat: "Playfair+Display:wght@600;700;800&family=Source+Sans+3:wght@400;500;600;700"
  },
  lugas: {
    nama: "Inter saja",
    judul: '"Inter", "Segoe UI", system-ui, sans-serif',
    isi: '"Inter", "Segoe UI", system-ui, sans-serif',
    muat: "Inter:wght@400;500;600;700;800"
  },
  hangat: {
    nama: "Merriweather + Lato",
    judul: '"Merriweather", Georgia, serif',
    isi: '"Lato", "Segoe UI", system-ui, sans-serif',
    muat: "Merriweather:wght@700;900&family=Lato:wght@400;700;900"
  }
};

export const PERPADUAN = [
  ["#0F4D42", "#A5680C", "Hijau tua & kunyit"],
  ["#1F4E79", "#B5651D", "Biru tua & jingga"],
  ["#6B2737", "#9A7B4F", "Merah bata & emas"],
  ["#2F4858", "#C0562F", "Abu biru & terakota"],
  ["#3B5323", "#8C6A1F", "Hijau daun & kuning tanah"],
  ["#4A3B76", "#B07C2A", "Ungu tua & madu"]
];

export const BAWAAN = {
  utama: "#0F4D42",
  aksen: "#A5680C",
  huruf: "bawaan",
  ukuran: "16",
  sudut: "5",
  lebar: "1120",
  tema: "sistem"
};

function keRGB(hex) {
  let h = String(hex || "").replace("#", "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16)
  ];
}

function keHex(r) {
  return (
    "#" +
    r
      .map((n) => {
        const v = Math.max(0, Math.min(255, Math.round(n))).toString(16);
        return v.length < 2 ? "0" + v : v;
      })
      .join("")
  );
}

export function campur(a, b, t) {
  const x = keRGB(a);
  const y = keRGB(b);
  if (!x || !y) return a;
  return keHex([0, 1, 2].map((i) => x[i] + (y[i] - x[i]) * t));
}

/** Menyusun CSS timpaan dari pengaturan pengurus. */
export function bangunGaya(g) {
  const p = { ...BAWAAN, ...(g || {}) };
  const huruf = HURUF[p.huruf] || HURUF.bawaan;

  const terang =
    "--brand:" + p.utama + ";" +
    "--brand-2:" + campur(p.utama, "#ffffff", 0.18) + ";" +
    "--brand-soft:" + campur(p.utama, "#ffffff", 0.86) + ";" +
    "--action:" + p.aksen + ";" +
    "--action-soft:" + campur(p.aksen, "#ffffff", 0.86) + ";";

  const gelap =
    "--brand:" + campur(p.utama, "#ffffff", 0.55) + ";" +
    "--brand-2:" + campur(p.utama, "#ffffff", 0.7) + ";" +
    "--brand-soft:" + campur(p.utama, "#000000", 0.68) + ";" +
    "--brand-ink:" + campur(p.utama, "#000000", 0.78) + ";" +
    "--action:" + campur(p.aksen, "#ffffff", 0.55) + ";" +
    "--action-soft:" + campur(p.aksen, "#000000", 0.72) + ";";

  return [
    ":root{" + terang + "}",
    ':root[data-theme="dark"]{' + gelap + "}",
    '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){' + gelap + "}}",
    "body{font-family:" + huruf.isi + ";font-size:" + p.ukuran + "px}",
    "h1,h2,h3,h4,.merek .nama,.angka .besar,.harga{font-family:" + huruf.judul + "}",
    ".wadah{max-width:" + p.lebar + "px}",
    ".kartu,.tabel-bungkus,.kunci,.catatan,.petabox,.kalender,.galitem," +
      ".harga-kotak,.qrbox,.angka,.tombol,.isian input,.isian select," +
      ".isian textarea{border-radius:" + p.sudut + "px}"
  ].join("\n");
}

/** Memasang gaya ke halaman. Aman dipanggil berulang. */
export function terapkanGaya(g) {
  let el = document.getElementById("gaya-kustom");
  if (!el) {
    el = document.createElement("style");
    el.id = "gaya-kustom";
    document.head.appendChild(el);
  }
  el.textContent = bangunGaya(g);

  /* Huruf tambahan hanya diunduh bila memang dipakai. */
  const huruf = HURUF[(g && g.huruf) || "bawaan"];
  let tautan = document.getElementById("huruf-kustom");
  if (huruf && huruf.muat) {
    if (!tautan) {
      tautan = document.createElement("link");
      tautan.id = "huruf-kustom";
      tautan.rel = "stylesheet";
      document.head.appendChild(tautan);
    }
    const alamat = "https://fonts.googleapis.com/css2?family=" + huruf.muat + "&display=swap";
    if (tautan.href !== alamat) tautan.href = alamat;
  } else if (tautan) {
    tautan.remove();
  }

  /* Tema bawaan situs, hanya berlaku bila pengunjung belum memilih sendiri. */
  try {
    if (g && g.tema && g.tema !== "sistem" && localStorage.getItem("tema") === null) {
      document.documentElement.setAttribute("data-theme", g.tema);
    }
  } catch (e) {}
}

/* ------------------------------------------------------------------ *
 * Tema terang / gelap yang dipilih pengunjung
 * ------------------------------------------------------------------ */

export const URUTAN_TEMA = ["sistem", "light", "dark"];
export const NAMA_TEMA = { sistem: "Sistem", light: "Terang", dark: "Gelap" };
export const KET_TEMA = {
  sistem: "mengikuti setelan perangkat",
  light: "tampilan terang",
  dark: "tampilan gelap"
};

export function temaSekarang() {
  try {
    const t = localStorage.getItem("tema");
    return t === "light" || t === "dark" ? t : "sistem";
  } catch (e) {
    return "sistem";
  }
}

export function pasangTema(t) {
  try {
    if (t === "sistem") {
      document.documentElement.removeAttribute("data-theme");
      localStorage.removeItem("tema");
    } else {
      document.documentElement.setAttribute("data-theme", t);
      localStorage.setItem("tema", t);
    }
  } catch (e) {}
}
