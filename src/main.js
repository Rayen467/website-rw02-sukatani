import { mount } from "svelte";
import "./inti/kontak-resmi.js";
import { aktifkanInteraksiUi } from "./inti/interaksi-ui.js";
import App from "./App.svelte";
import "./gaya/global.css";
import "./gaya/perbaikan-pengurus.css";

const aplikasi = mount(App, { target: document.getElementById("app") });
aktifkanInteraksiUi();

export default aplikasi;
