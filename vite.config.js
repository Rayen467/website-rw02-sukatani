import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  // Situs diunggah ke GitHub Pages di bawah nama repositori, jadi seluruh
  // alamat berkas harus relatif. Kalau nanti pindah ke domain sendiri,
  // baris ini tidak perlu diubah -- relatif tetap benar di dua-duanya.
  base: "./",

  /* KETIGA PINTU FIREBASE HARUS DIPAKET BERSAMA
     Vite menyiapkan setiap pustaka menjadi berkas terpisah sebelum server
     pengembangan jalan. Kalau firebase/app, firebase/auth, dan
     firestore/lite disiapkan sendiri-sendiri, masing-masing membawa
     salinan @firebase/app-nya sendiri. Akibatnya Firestore mendaftarkan
     dirinya pada salinan yang berbeda dari yang dipakai initializeApp,
     dan getFirestore melempar "Service firestore/lite is not available".

     Galat itu HANYA muncul di server pengembangan; hasil build sudah benar
     karena penggabungnya melihat seluruh grafik sekaligus. Justru itu
     masalahnya: perbedaan antara yang dilihat saat mengembangkan dan yang
     benar-benar terbit adalah tempat kesalahan bersembunyi. Menyebutkan
     ketiganya di sini membuat Vite menyiapkannya sekali, dengan satu
     salinan @firebase/app bersama. */
  optimizeDeps: {
    include: ["firebase/app", "firebase/auth", "firebase/firestore/lite"]
  },

  build: {
    outDir: "dist",
    emptyOutDir: true
  }
});
