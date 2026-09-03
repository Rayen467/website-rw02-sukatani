import { mount } from "svelte";
import App from "./App.svelte";
import "./gaya/global.css";

export default mount(App, { target: document.getElementById("app") });
