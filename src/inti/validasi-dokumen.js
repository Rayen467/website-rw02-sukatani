/*
 * Validasi NIK / No. KK pada formulir surat.
 *
 * Browser tertentu sempat menolak nilai 16 digit yang sebenarnya benar
 * karena validasi pattern HTML. Di sini input dirapikan sebelum Svelte
 * membaca nilainya: hanya angka, maksimal 16 digit, lalu pesan validasi
 * dibuat dalam Bahasa Indonesia.
 */

const DOKUMEN = Object.freeze({
  "s-nik": "NIK",
  "s-kk": "No. Kartu Keluarga"
});

function labelUntuk(el) {
  return DOKUMEN[el?.id] || "Nomor dokumen";
}

function rapikanNilai(el) {
  const bersih = String(el.value || "").replace(/\D/g, "").slice(0, 16);
  if (el.value !== bersih) el.value = bersih;
  return bersih;
}

function perbaruiValiditas(el) {
  const nilai = rapikanNilai(el);
  const label = labelUntuk(el);

  if (!nilai) {
    el.setCustomValidity("");
    return;
  }

  if (nilai.length !== 16) {
    el.setCustomValidity(`${label} harus tepat 16 digit angka.`);
    return;
  }

  el.setCustomValidity("");
}

function siapkan(el) {
  if (!el || !DOKUMEN[el.id]) return;

  /* Pattern bawaan dilepas karena pada sebagian browser menghasilkan
     false-negative. Panjang tetap dikunci dan divalidasi sendiri. */
  el.removeAttribute("pattern");
  el.setAttribute("inputmode", "numeric");
  el.setAttribute("maxlength", "16");
  el.setAttribute("minlength", "16");
  el.setAttribute("autocomplete", "off");
  perbaruiValiditas(el);
}

function siapkanSemua() {
  document.querySelectorAll("#s-nik, #s-kk").forEach(siapkan);
}

export function aktifkanValidasiDokumen() {
  if (typeof document === "undefined") return;

  siapkanSemua();

  /* Capture=true penting: nilai dibersihkan sebelum bind:value Svelte
     membaca event input yang sama. */
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (!el || !DOKUMEN[el.id]) return;
    siapkan(el);
  }, true);

  document.addEventListener("focusin", (e) => {
    const el = e.target;
    if (el && DOKUMEN[el.id]) siapkan(el);
  }, true);

  document.addEventListener("invalid", (e) => {
    const el = e.target;
    if (!el || !DOKUMEN[el.id]) return;

    const label = labelUntuk(el);
    const nilai = rapikanNilai(el);
    if (!nilai) el.setCustomValidity(`${label} wajib diisi.`);
    else if (nilai.length !== 16) el.setCustomValidity(`${label} harus tepat 16 digit angka.`);
    else el.setCustomValidity("");
  }, true);

  /* Form surat dirender setelah navigasi hash. Observer memastikan pattern
     sudah dilepas walau pengguna langsung menekan tombol Ajukan. */
  const pengamat = new MutationObserver(siapkanSemua);
  pengamat.observe(document.body, { childList: true, subtree: true });
}
