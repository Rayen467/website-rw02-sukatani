import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  // Situs diunggah ke GitHub Pages di bawah nama repositori, jadi seluruh
  // alamat berkas harus relatif. Kalau nanti pindah ke domain sendiri,
  // baris ini tidak perlu diubah -- relatif tetap benar di dua-duanya.
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
});
