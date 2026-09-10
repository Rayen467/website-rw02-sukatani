import { mount } from "svelte";
import "./inti/kontak-resmi.js";
import App from "./App.svelte";
import "./gaya/global.css";

export default mount(App, { target: document.getElementById("app") });
