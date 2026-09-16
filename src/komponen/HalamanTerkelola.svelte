<script>
  import { konten } from "../keadaan/isi.svelte.js";
  import { KONTEN } from "../inti/nama.js";
  import BlokHalaman from "./BlokHalaman.svelte";

  let { Komponen, kunciRute = null, halaman = "" } = $props();

  function bacaJson(teks, bawaan) {
    try {
      const nilai = JSON.parse(String(teks || ""));
      return nilai ?? bawaan;
    } catch {
      return bawaan;
    }
  }

  const konfigurasi = $derived.by(() => {
    if (!halaman) return null;
    const dok = konten(KONTEN.CMS_HALAMAN) || {};
    const semua = bacaJson(dok.halaman, {});
    return semua[halaman] || null;
  });

  const nonaktif = $derived(Boolean(konfigurasi && String(konfigurasi.aktif) === "false"));
  const modeKustom = $derived(Boolean(konfigurasi && konfigurasi.mode === "custom"));
</script>

{#if nonaktif}
  <section class="cms-nonaktif">
    <p class="alis">Informasi</p>
    <h1>{konfigurasi?.judul || "Halaman sementara tidak ditampilkan"}</h1>
    <p>{konfigurasi?.subjudul || "Pengurus sedang memperbarui informasi pada halaman ini. Silakan kembali lagi nanti."}</p>
    <a class="tombol utama" href="#/">Kembali ke beranda</a>
  </section>
{:else if modeKustom}
  <section class="cms-kustom">
    <div class="cms-kustom__kepala">
      {#if konfigurasi?.alis}<p class="alis">{konfigurasi.alis}</p>{/if}
      <h1>{konfigurasi?.judul || "Informasi RW 02 Sukatani"}</h1>
      {#if konfigurasi?.subjudul}<p>{konfigurasi.subjudul}</p>{/if}
    </div>
    <BlokHalaman {halaman} posisi="semua" />
  </section>
{:else}
  {#if halaman}<BlokHalaman {halaman} posisi="atas" />{/if}
  <Komponen kunci={kunciRute} />
  {#if halaman}<BlokHalaman {halaman} posisi="bawah" />{/if}
{/if}

<style>
  .cms-nonaktif,.cms-kustom__kepala{margin:20px 0;padding:clamp(24px,5vw,48px);border:1px solid var(--garis,#dce7e1);border-radius:20px;background:linear-gradient(135deg,#f8fcfa,#fff)}.cms-nonaktif{display:grid;gap:14px}.cms-nonaktif h1,.cms-kustom__kepala h1{margin:0;font-size:clamp(30px,5vw,54px);line-height:1.05}.cms-nonaktif p,.cms-kustom__kepala p{max-width:760px;margin:0;color:var(--tinta-2,#52645e);line-height:1.65}.cms-nonaktif .tombol{width:max-content}.cms-kustom{padding-bottom:20px}
</style>