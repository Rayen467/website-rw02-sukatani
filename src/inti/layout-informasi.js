const TARGET_KEPADATAN = [
  [".menu-cepat strong", 20, 32],
  [".berita-utama-copy h3", 72, 108],
  [".mini-copy strong", 48, 72],
  [".agenda-card-copy h3", 28, 44],
  [".galeri-item strong", 30, 48],
  [".panel-putih > h3", 58, 88],
  [".poll-label", 34, 52],
  [".buat-diskusi strong", 42, 64],
  [".topik-list > a strong", 44, 68]
];

let pengamat = null;
let frame = 0;

function teksBersih(elemen) {
  return String(elemen?.textContent || "").replace(/\s+/g, " ").trim();
}

function terapkanKepadatan(elemen, batasPadat, batasSangatPadat) {
  const teks = teksBersih(elemen);
  const panjang = teks.length;
  const sangatPadat = panjang > batasSangatPadat;
  const padat = !sangatPadat && panjang > batasPadat;

  elemen.classList.toggle("teks-padat", padat);
  elemen.classList.toggle("teks-sangat-padat", sangatPadat);

  if (panjang > batasPadat) {
    if (!elemen.dataset.layoutJudulAsli) elemen.dataset.layoutJudulAsli = elemen.getAttribute("title") || "";
    elemen.setAttribute("title", teks);
  } else if ("layoutJudulAsli" in elemen.dataset) {
    const asli = elemen.dataset.layoutJudulAsli;
    if (asli) elemen.setAttribute("title", asli);
    else elemen.removeAttribute("title");
    delete elemen.dataset.layoutJudulAsli;
  }
}

function rapikan() {
  frame = 0;
  const hash = String(location.hash || "");
  if (!/^#\/(berita|informasi)(?:\/|$|[?#])/.test(hash)) return;

  for (const [pemilih, batasPadat, batasSangatPadat] of TARGET_KEPADATAN) {
    document.querySelectorAll(`.kabar-page ${pemilih}`).forEach((elemen) => {
      terapkanKepadatan(elemen, batasPadat, batasSangatPadat);
    });
  }
}

function jadwalkan() {
  if (frame) return;
  frame = requestAnimationFrame(rapikan);
}

export function aktifkanLayoutInformasi() {
  if (typeof document === "undefined") return () => {};

  jadwalkan();
  window.addEventListener("hashchange", jadwalkan);
  window.addEventListener("resize", jadwalkan, { passive: true });

  pengamat = new MutationObserver(jadwalkan);
  pengamat.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  return () => {
    window.removeEventListener("hashchange", jadwalkan);
    window.removeEventListener("resize", jadwalkan);
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    pengamat?.disconnect();
    pengamat = null;
  };
}
