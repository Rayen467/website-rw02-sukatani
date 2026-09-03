<script>
  import { kontenNilai } from "../lib/keadaan.svelte.js";
  import { KOORDINAT_BAWAAN } from "../lib/bawaan.js";

  let { perbesaran = 17 } = $props();

  const titik = $derived(kontenNilai("kontak", "koordinat", KOORDINAT_BAWAAN));
  const sumber = $derived(
    "https://maps.google.com/maps?q=" + encodeURIComponent(titik) + "&z=" + perbesaran + "&hl=id&output=embed"
  );
</script>

<div class="petabox">
  <iframe
    src={sumber}
    loading="lazy"
    referrerpolicy="no-referrer-when-downgrade"
    title="Peta lokasi RW 02 Perum Permai Sukatani"
  ></iframe>
  <div class="cadangan">
    Peta tidak dapat dimuat di tampilan ini.<br />
    Gunakan tombol di bawah untuk membukanya di aplikasi peta.
  </div>
</div>

<div class="baris-tombol" style="margin-top:12px">
  <a
    class="tombol utama"
    href="https://www.google.com/maps/search/?api=1&query={encodeURIComponent(titik)}"
    target="_blank"
    rel="noopener noreferrer">Buka di Google Maps</a
  >
  <a
    class="tombol"
    href="https://www.google.com/maps/dir/?api=1&destination={encodeURIComponent(titik)}"
    target="_blank"
    rel="noopener noreferrer">Petunjuk arah ke sini</a
  >
</div>

<p class="verifikasi">
  Titik koordinat <span class="mono">{titik}</span>. Pengurus dapat memperbaiki titiknya lewat halaman Kelola.
</p>
