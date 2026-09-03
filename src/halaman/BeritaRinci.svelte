<script>
  import { isi } from "../lib/keadaan.svelte.js";
  import TombolSalin from "../komponen/TombolSalin.svelte";
  import TidakAda from "./TidakAda.svelte";
  let { kunci } = $props();
  const k = $derived((isi.pengumuman || []).find((x) => x.id === kunci));
</script>

{#if !k}
  <TidakAda />
{:else}
  <nav class="remah"><a href="#/">Beranda</a><span>›</span><a href="#/berita">Berita</a><span>›</span><span>{k.judul}</span></nav>
  <div class="kepala-halaman">
    <p class="alis">{k.tipe === "agenda" ? "Agenda" : "Pengumuman"} · {k.tglText || k.tgl || ""}</p>
    <h1>{k.judul}</h1>
  </div>
  <div class="kartu" style="max-width:72ch">
    <p style="font-size:16px;color:var(--tinta);line-height:1.72;white-space:pre-line">{k.isi || ""}</p>
    <div class="baris-tombol" style="margin-top:12px">
      <TombolSalin judul={k.judul} jalur="/berita/{k.id}" />
      <a class="tombol" href="#/berita">Kembali ke daftar</a>
    </div>
  </div>
{/if}
