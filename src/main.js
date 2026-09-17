import { mount } from "svelte";
import "./inti/kontak-resmi.js";
import { aktifkanInteraksiUi } from "./inti/interaksi-ui.js";
import { aktifkanPeningkatanPortal } from "./inti/peningkatan-portal.js";
import { aktifkanValidasiDokumen } from "./inti/validasi-dokumen.js";
import { aktifkanHapusMassalKas } from "./inti/hapus-massal-kas.js";
import { aktifkanInteraksiKonten } from "./keadaan/interaksi-konten.js";
import App from "./App.svelte";
import "./gaya/global.css";
import "./gaya/perbaikan-pengurus.css";
import "./gaya/surat-bersih.css";
/* Lapisan terakhir: rules tipografi wajib seluruh situs. */
import "./gaya/tipografi-wajib.css";

const aplikasi = mount(App, { target: document.getElementById("app") });
aktifkanInteraksiUi();
aktifkanInteraksiKonten();
aktifkanPeningkatanPortal();
aktifkanValidasiDokumen();
aktifkanHapusMassalKas();

export default aplikasi;
