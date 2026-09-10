import { PENGURUS_RW_BAWAAN } from "./bawaan.js";

/**
 * Kontak publik yang sudah mendapat izin untuk ditampilkan.
 * Format tampilan dipertahankan agar mudah dibaca warga; tautan WhatsApp
 * memakai nomor numerik melalui helper di halaman masing-masing.
 */
export const KONTAK_KETUA_RW = "+62 812-8400-1094";

const ketuaRw = PENGURUS_RW_BAWAAN.find((orang) => orang.id === "ketua-rw");
if (ketuaRw) ketuaRw.kontak = KONTAK_KETUA_RW;
