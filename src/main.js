import { mount } from "svelte";
import "./inti/kontak-resmi.js";
import { aktifkanInteraksiUi } from "./inti/interaksi-ui.js";
import { aktifkanPeningkatanPortal } from "./inti/peningkatan-portal.js";
import { aktifkanValidasiDokumen } from "./inti/validasi-dokumen.js";
import { aktifkanCetakSuratPetugas } from "./inti/cetak-surat-petugas.js";
import { aktifkanHapusMassalKas } from "./keadaan/hapus-massal-kas.js";
import { aktifkanInteraksiKonten } from "./keadaan/interaksi-konten.js";
import App from "./App.svelte";
import "./gaya/global.css";
import "./gaya/perbaikan-pengurus.css";
import "./gaya/surat-bersih.css";
/* Lapisan terakhir: rules tipografi wajib seluruh situs. */
import "./gaya/tipografi-wajib.css";

/* Versi lama menyimpan salinan formulir surat lengkap (termasuk NIK/KK)
   di localStorage untuk halaman cetak. Alur baru membaca dokumen langsung
   dari Firestore milik akun yang berhak. Bersihkan sisa lama sekali saat
   aplikasi dibuka agar data sensitif tidak tertinggal di perangkat bersama. */
try { localStorage.removeItem("surat-terakhir"); } catch (_) {}

const aplikasi = mount(App, { target: document.getElementById("app") });
aktifkanInteraksiUi();
aktifkanInteraksiKonten();
aktifkanPeningkatanPortal();
aktifkanValidasiDokumen();
aktifkanCetakSuratPetugas();
aktifkanHapusMassalKas();

export default aplikasi;
