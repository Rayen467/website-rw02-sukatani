const GAYA_CETAK = `
  @page { size: A4 portrait; margin: 12mm; }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
    color: #111;
  }
  body {
    font-family: "Times New Roman", Times, serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .surat-a4 {
    position: relative !important;
    width: 186mm !important;
    min-height: 0 !important;
    margin: 0 auto !important;
    padding: 9mm 11mm !important;
    border: 0 !important;
    box-shadow: none !important;
    background: #fff !important;
    color: #111 !important;
    overflow: visible !important;
  }
  .draft-mark { display: none !important; }
  .surat-a4 header {
    text-align: center;
    border-bottom: 3px double #111;
    padding-bottom: 8px;
  }
  .surat-a4 header b,
  .surat-a4 header span { display: block; }
  .surat-a4 header b { font-size: 17px; }
  .surat-a4 header span { font-size: 10px; line-height: 1.45; }
  .surat-a4 h2 {
    text-align: center;
    margin: 18px 0 2px;
    font-size: 16px;
    text-decoration: underline;
  }
  .surat-a4 .nomor {
    text-align: center;
    margin: 0 0 18px;
    font-size: 11px;
  }
  .surat-a4 p {
    margin: 10px 0;
    font-size: 12px;
    line-height: 1.55;
    text-align: justify;
  }
  .surat-a4 table {
    width: 100%;
    border-collapse: collapse;
    margin: 13px 0;
  }
  .surat-a4 td {
    padding: 3px 2px;
    font-size: 12px;
    line-height: 1.35;
    vertical-align: top;
  }
  .surat-a4 td:first-child { width: 155px; }
  .ttd {
    display: flex !important;
    justify-content: flex-end !important;
    margin-top: 25px !important;
  }
  .ttd.dua {
    justify-content: space-between !important;
    gap: 48px !important;
  }
  .ttd > div {
    width: 210px !important;
    text-align: center !important;
    font-size: 11px !important;
  }
  .ttd span, .ttd b, .ttd small { display: block; }
  .ttd i { display: block; height: 54px !important; }
  .ttd small {
    margin-top: 5px;
    color: #555;
    font-size: 8px !important;
    font-weight: 400;
  }
  .surat-a4 footer {
    margin-top: 22px;
    padding-top: 7px;
    border-top: 1px solid #aaa;
    color: #555;
    font-size: 8px;
    line-height: 1.35;
  }
`;

function buatBingkaiCetak(sumber) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "Pratinjau cetak surat");
  iframe.setAttribute("aria-hidden", "true");
  Object.assign(iframe.style, {
    position: "fixed",
    right: "0",
    bottom: "0",
    width: "1px",
    height: "1px",
    border: "0",
    opacity: "0",
    pointerEvents: "none"
  });

  document.body.appendChild(iframe);
  const dokumen = iframe.contentDocument || iframe.contentWindow?.document;
  if (!dokumen) {
    iframe.remove();
    throw new Error("Bingkai cetak tidak tersedia.");
  }

  const salinan = sumber.cloneNode(true);
  salinan.querySelectorAll(".draft-mark").forEach((el) => el.remove());
  salinan.classList.remove("cetak-aktif");

  dokumen.open();
  dokumen.write(`<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Surat RW 02 Sukatani</title>
<style>${GAYA_CETAK}</style>
</head>
<body>${salinan.outerHTML}</body>
</html>`);
  dokumen.close();

  return iframe;
}

function cetakSurat(sumber) {
  let iframe;
  try {
    iframe = buatBingkaiCetak(sumber);
  } catch (err) {
    console.error("Gagal menyiapkan cetak surat:", err);
    return;
  }

  const jendela = iframe.contentWindow;
  if (!jendela) {
    iframe.remove();
    return;
  }

  let sudahDibersihkan = false;
  const bersihkan = () => {
    if (sudahDibersihkan) return;
    sudahDibersihkan = true;
    iframe.remove();
  };

  jendela.addEventListener("afterprint", bersihkan, { once: true });

  const mulai = () => {
    try {
      jendela.focus();
      jendela.print();
    } catch (err) {
      console.error("Gagal membuka dialog cetak surat:", err);
      bersihkan();
    }
  };

  // Beri waktu singkat agar layout iframe selesai dihitung oleh Chromium.
  window.setTimeout(mulai, 180);
  window.setTimeout(bersihkan, 60000);
}

export function aktifkanCetakSuratPetugas() {
  if (typeof document === "undefined") return () => {};

  const tanganiKlik = (event) => {
    const tombol = event.target instanceof Element
      ? event.target.closest("button")
      : null;
    if (!tombol) return;

    const teks = String(tombol.textContent || "").trim().toLowerCase();
    if (teks !== "preview / cetak a4") return;

    const kartu = tombol.closest(".surat-card");
    const surat = kartu?.querySelector(".surat-a4");
    if (!surat) return;

    // Intersep sebelum handler Svelte lama menjalankan window.print() pada
    // seluruh dashboard. Itu yang sebelumnya menghasilkan 4 halaman putih.
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    cetakSurat(surat);
  };

  document.addEventListener("click", tanganiKlik, true);
  return () => document.removeEventListener("click", tanganiKlik, true);
}
