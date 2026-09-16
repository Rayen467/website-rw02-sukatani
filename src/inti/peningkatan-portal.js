const GAYA = `
  .portal-publikasi-cepat{display:flex;align-items:center;justify-content:space-between;gap:18px;margin:0 0 22px;padding:18px 20px;border:1px solid #dce8e4;border-radius:16px;background:linear-gradient(135deg,#f8fcfa,#eef8f4);box-shadow:0 8px 24px rgba(24,72,57,.05)}
  .portal-publikasi-cepat__copy{display:grid;gap:3px}.portal-publikasi-cepat__copy span{font-size:9px;font-weight:900;letter-spacing:.14em;color:#16826a}.portal-publikasi-cepat__copy strong{font-size:15px;color:#173b35}.portal-publikasi-cepat__copy small{font-size:10px;color:#73847f}
  .portal-publikasi-cepat__aksi{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.portal-publikasi-cepat__aksi a{display:inline-flex;align-items:center;gap:7px;padding:9px 12px;border:1px solid #d4e4de;border-radius:9px;background:#fff;color:#31574d;text-decoration:none;font-size:10px;font-weight:800}.portal-publikasi-cepat__aksi a.video{background:#0b745a;border-color:#0b745a;color:#fff}.portal-publikasi-cepat__aksi a:hover{transform:translateY(-1px)}
  .verifikasi-email-tips{margin-top:13px;padding:12px 13px;border:1px solid #eadcb8;border-radius:10px;background:#fffaf0;color:#69572e;font-size:11px;line-height:1.55}.verifikasi-email-tips strong{display:block;margin-bottom:3px;color:#4d3c16}.verifikasi-email-tips ol{margin:7px 0 0;padding-left:18px}.verifikasi-email-tips li+li{margin-top:3px}
  .verifikasi-sukses-overlay{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:18px;background:rgba(5,31,26,.58);backdrop-filter:blur(8px)}.verifikasi-sukses-card{width:min(430px,100%);padding:31px 28px 25px;border-radius:24px;background:#fff;box-shadow:0 28px 70px rgba(0,0,0,.23);text-align:center;color:#17382f}.verifikasi-sukses-ikon{width:78px;height:78px;margin:0 auto 16px;display:grid;place-items:center;border-radius:50%;background:radial-gradient(circle,#dff7ed 54%,#effbf6 55%);border:1px solid #c9ecdf}.verifikasi-sukses-ikon svg{width:43px;height:43px;fill:none;stroke:#0c8062;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}.verifikasi-sukses-card span{display:block;color:#0d8164;font-size:9px;font-weight:900;letter-spacing:.15em}.verifikasi-sukses-card h2{margin:6px 0 8px;font:700 28px/1.1 Georgia,serif}.verifikasi-sukses-card p{margin:0 auto;color:#6d7c77;font-size:12px;line-height:1.65;max-width:340px}.verifikasi-sukses-card button{margin-top:19px;border:0;border-radius:10px;background:#0b755a;color:#fff;padding:10px 17px;font:800 11px inherit;cursor:pointer}
  @media(max-width:720px){.portal-publikasi-cepat{align-items:flex-start;flex-direction:column}.portal-publikasi-cepat__aksi{justify-content:flex-start}}
`;

let pengamat = null;
let terjadwal = false;

function pastikanGaya() {
  if (document.getElementById("peningkatan-portal-style")) return;
  const style = document.createElement("style");
  style.id = "peningkatan-portal-style";
  style.textContent = GAYA;
  document.head.appendChild(style);
}

function pathDashboard() {
  const hash = String(location.hash || "#/kelola");
  return /^#\/(kelola|petugas)(?:\/dashboard)?(?:$|[?#])/.test(hash);
}

function pasangPintasanDashboard() {
  const lama = document.getElementById("portal-publikasi-cepat");
  if (!pathDashboard()) {
    lama?.remove();
    return;
  }
  if (lama) return;
  const konten = document.querySelector(".admin-content");
  if (!konten) return;

  const pangkal = location.hash.startsWith("#/petugas") ? "petugas" : "kelola";
  const blok = document.createElement("section");
  blok.id = "portal-publikasi-cepat";
  blok.className = "portal-publikasi-cepat";
  blok.setAttribute("aria-label", "Publikasi cepat");
  blok.innerHTML = `
    <div class="portal-publikasi-cepat__copy">
      <span>PUBLIKASI CEPAT</span>
      <strong>Berita, foto, dan video sekarang lebih mudah ditemukan</strong>
      <small>Upload video dibuka langsung ke formulir paling atas di menu Video & Dokumen.</small>
    </div>
    <div class="portal-publikasi-cepat__aksi">
      <a href="#/${pangkal}/terbit">▤ Berita & galeri foto</a>
      <a class="video" href="#/${pangkal}/berkas">▶ Upload video</a>
      <a href="#/informasi" target="_blank" rel="noopener noreferrer">↗ Lihat halaman publik</a>
    </div>`;
  konten.prepend(blok);
}

function isiTipsVerifikasi(elemen) {
  if (!elemen || elemen.querySelector(".verifikasi-email-tips")) return;
  const tips = document.createElement("div");
  tips.className = "verifikasi-email-tips";
  tips.innerHTML = `<strong>Email belum kelihatan di Kotak Masuk?</strong><ol><li>Cek folder <b>Spam</b> atau <b>Promosi</b>.</li><li>Kalau ketemu di Spam, pilih <b>Bukan spam / Not spam</b> agar email berikutnya lebih mudah masuk.</li><li>Pastikan alamat email akun benar sebelum meminta kirim ulang.</li></ol>`;
  elemen.appendChild(tips);
}

function pasangTipsVerifikasi() {
  document.querySelectorAll(".catatan.awas,.login-state-card").forEach((el) => {
    const teks = String(el.textContent || "").toLowerCase();
    if (teks.includes("email belum") || teks.includes("verifikasi diperlukan") || teks.includes("periksa email")) isiTipsVerifikasi(el);
  });
}

function tampilkanSukses() {
  if (document.getElementById("verifikasi-sukses-overlay")) return;
  const overlay = document.createElement("div");
  overlay.id = "verifikasi-sukses-overlay";
  overlay.className = "verifikasi-sukses-overlay";
  overlay.innerHTML = `<div class="verifikasi-sukses-card" role="dialog" aria-modal="true" aria-labelledby="verifikasi-sukses-judul"><div class="verifikasi-sukses-ikon"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="18"></circle><path d="m15.5 24.5 5.5 5.5 11.5-12"></path></svg></div><span>VERIFIKASI SELESAI</span><h2 id="verifikasi-sukses-judul">Email berhasil diverifikasi</h2><p>Akun Anda sudah memiliki alamat email yang terkonfirmasi. Silakan lanjutkan menggunakan layanan warga.</p><button type="button">Lanjut ke Dashboard Warga</button></div>`;
  const tutup = () => overlay.remove();
  overlay.addEventListener("click", (e) => { if (e.target === overlay) tutup(); });
  overlay.querySelector("button")?.addEventListener("click", () => { tutup(); location.hash = "#/akun"; });
  document.body.appendChild(overlay);
}

function cekPesanVerifikasiSukses() {
  const nodes = document.querySelectorAll("[role='status'],.pesan,.toast,.notifikasi");
  for (const node of nodes) {
    if (String(node.textContent || "").toLowerCase().includes("email sudah dipastikan")) {
      tampilkanSukses();
      break;
    }
  }
}

function sinkron() {
  terjadwal = false;
  pasangPintasanDashboard();
  pasangTipsVerifikasi();
  cekPesanVerifikasiSukses();
}

function jadwalkan() {
  if (terjadwal) return;
  terjadwal = true;
  requestAnimationFrame(sinkron);
}

export function aktifkanPeningkatanPortal() {
  if (typeof document === "undefined") return () => {};
  pastikanGaya();
  jadwalkan();
  window.addEventListener("hashchange", jadwalkan);
  pengamat = new MutationObserver(jadwalkan);
  pengamat.observe(document.body, { childList: true, subtree: true, characterData: true });
  return () => {
    window.removeEventListener("hashchange", jadwalkan);
    pengamat?.disconnect();
    pengamat = null;
  };
}
