<script>
  import { isi } from "../keadaan/isi.svelte.js";
  import { JENIS_USAHA } from "../inti/bawaan.js";

  let saring = $state("all");
  const semua = $derived(isi.usaha || []);
  const daftar = $derived(saring === "all" ? semua : semua.filter((u) => u.kat === saring));
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Direktori UMKM</span></nav>
<div class="kepala-halaman">
  <p class="alis">Warga</p>
  <h1>Direktori usaha warga</h1>
  <p>Daftar usaha yang dijalankan warga di dalam kawasan. Setiap usaha punya halamannya sendiri, dan tautan halaman itulah yang dicetak menjadi kode QR pada papan usaha masing-masing.</p>
</div>

<div class="pilihan-baris">
  <button class="pilihan" type="button" aria-pressed={saring === "all"} onclick={() => (saring = "all")}>Semua</button>
  {#each JENIS_USAHA as j}
    <button class="pilihan" type="button" aria-pressed={saring === j.nilai} onclick={() => (saring = j.nilai)}>{j.label}</button>
  {/each}
  <span class="jumlah-kecil">{daftar.length} dari {semua.length} usaha</span>
</div>

{#if daftar.length}
  <div class="petak petak-3">
    {#each daftar as u}
      <a class="kartu usaha-kartu" href="#/umkm/{u.id}">
        <span class="muka">
          {#if u.foto}<img class="gambar-penuh" src={u.foto} alt="" decoding="async" />{:else}FOTO PRODUK{/if}
        </span>
        <span class="badan">
          <span class="jenis">{u.katLabel || ""}</span>
          <h3>{u.nama}</h3>
          <span style="font-size:13.5px;color:var(--tinta-2);line-height:1.5">{u.ringkas || ""}</span>
        </span>
      </a>
    {/each}
  </div>
{:else}
  <p class="kosong">{semua.length ? "Belum ada usaha pada kategori ini." : "Direktori usaha belum diisi pengurus."}</p>
{/if}

<div class="kartu" style="margin-top:26px">
  <h3>Punya usaha di kawasan ini?</h3>
  <p>Daftarkan agar masuk direktori. Pendaftaran gratis dan keterangannya diperiksa pengurus sebelum ditampilkan.</p>
  <div class="baris-tombol"><a class="tombol utama" href="#/daftar-usaha">Daftarkan usaha</a></div>
</div>
