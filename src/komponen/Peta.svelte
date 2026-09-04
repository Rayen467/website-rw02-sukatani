<script>
  import { KONTEN } from "../inti/nama.js";
  import { kontenNilai } from "../keadaan/isi.svelte.js";
  import { KOORDINAT_BAWAAN } from "../inti/bawaan.js";
  import { sematanPeta, sematanSalah } from "../inti/peta.js";

  let { perbesaran = 17 } = $props();

  const titik = $derived(kontenNilai(KONTEN.KONTAK, "koordinat", KOORDINAT_BAWAAN));

  /* Peta batas wilayah dibuat pengurus lewat Google My Maps, lalu tautan
     sematannya ditempel di halaman Kelola. Iframe Google Maps biasa tidak
     bisa menggambar poligon, jadi selama isian ini kosong yang tampil
     hanyalah titik lokasi -- bukan batas wilayahnya. */
  const batasMentah = $derived(kontenNilai(KONTEN.KONTAK, "petaBatas", ""));
  const batas = $derived(sematanPeta(batasMentah));
  const batasSalah = $derived(sematanSalah(batasMentah));

  const sumberTitik = $derived(
    "https://maps.google.com/maps?q=" + encodeURIComponent(titik) + "&z=" + perbesaran + "&hl=id&output=embed"
  );
  const sumber = $derived(batas || sumberTitik);
</script>

<div class="petabox">
  <iframe
    src={sumber}
    loading="lazy"
    referrerpolicy="no-referrer-when-downgrade"
    title={batas ? "Peta batas wilayah RW 02 Perum Permai Sukatani" : "Peta lokasi RW 02 Perum Permai Sukatani"}
  ></iframe>
  <div class="cadangan">
    Peta tidak dapat dimuat di tampilan ini.<br />
    Gunakan tombol di bawah untuk membukanya di aplikasi peta.
  </div>
</div>

{#if batas}
  <p class="keterangan-batas">
    <span class="contoh-garis" aria-hidden="true"></span>
    Garis merah adalah batas wilayah RW 02. Rumah di luar garis termasuk RW lain.
  </p>
{/if}

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
  {#if batas}
    Batas wilayah digambar pengurus RW 02 dan bukan batas resmi terbitan pemerintah.
    Bila ada rumah yang letaknya meragukan, tanyakan kepada Ketua RT setempat.
  {:else if batasSalah}
    Tautan peta batas wilayah yang tersimpan tidak dikenali, jadi yang tampil baru titik lokasi.
    Pengurus dapat memperbaikinya lewat halaman Kelola.
  {:else}
    Titik koordinat <span class="mono">{titik}</span>. Pengurus dapat memperbaiki titiknya lewat halaman Kelola.
  {/if}
</p>

<style>
  .keterangan-batas {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 10px 0 0;
    font-size: 13px;
    color: var(--tinta-2);
  }
  .contoh-garis {
    flex: none;
    width: 26px;
    height: 4px;
    border-radius: 2px;
    background: #e03131;
  }
</style>
