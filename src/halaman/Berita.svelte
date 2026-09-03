<script>
  import { isi } from "../keadaan/isi.svelte.js";
  import TombolSalin from "../komponen/TombolSalin.svelte";
  const daftar = $derived(isi.pengumuman || []);
</script>

<nav class="remah"><a href="#/">Beranda</a><span>›</span><span>Berita dan Pengumuman</span></nav>
<div class="kepala-halaman">
  <p class="alis">Informasi</p>
  <h1>Berita dan pengumuman</h1>
  <p>Kabar dari pengurus RW: kegiatan, jadwal rapat, posyandu, gotong royong, dan informasi bantuan sosial. Grup WhatsApp tetap dipakai memberi tahu; halaman ini yang menyimpannya.</p>
</div>

{#if daftar.length}
  <div class="daftar-kabar">
    {#each daftar as k}
      <article class="kabar">
        <div class="tanggal">{k.tglText || k.tgl || ""}</div>
        <div>
          <h3><a href="#/berita/{k.id}">{k.judul}</a></h3>
          <p>{k.ringkas || ""}</p>
          <div class="baris">
            <span class="label-kecil {k.tipe === 'agenda' ? 'agenda' : ''}">{k.tipe === "agenda" ? "Agenda" : "Pengumuman"}</span>
            <TombolSalin judul={k.judul} jalur="/berita/{k.id}" />
          </div>
        </div>
      </article>
    {/each}
  </div>
{:else}
  <p class="kosong">Belum ada pengumuman yang diterbitkan.</p>
{/if}
