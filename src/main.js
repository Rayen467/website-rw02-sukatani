import { mount } from "svelte";
import "./inti/kontak-resmi.js";
import { aktifkanInteraksiUi } from "./inti/interaksi-ui.js";
import { aktifkanPeningkatanPortal } from "./inti/peningkatan-portal.js";
import { aktifkanLayoutInformasi } from "./inti/layout-informasi.js";
import { aktifkanInteraksiKonten } from "./keadaan/interaksi-konten.js";
import App from "./App.svelte";
import "./gaya/global.css";
import "./gaya/perbaikan-pengurus.css";
import "./gaya/surat-bersih.css";
import "./gaya/informasi-layout-tetap.css";

const aplikasi = mount(App, { target: document.getElementById("app") });
aktifkanInteraksiUi();
aktifkanInteraksiKonten();
aktifkanPeningkatanPortal();
aktifkanLayoutInformasi();

export default aplikasi;