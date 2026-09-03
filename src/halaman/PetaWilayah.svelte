<script>
  import { isi, pakai } from "../lib/keadaan.svelte.js";
  import { FASUM_BAWAAN } from "../lib/bawaan.js";
  import Peta from "../komponen/Peta.svelte";
  import Belum from "../komponen/Belum.svelte";

  const batas = $derived(isi.batas_rt || []);
  const fasum = $derived(pakai("fasum", FASUM_BAWAAN));
</script>

<nav class="remah"><a href="#/">Beranda</a><span>›</span><span>Peta Wilayah</span></nav>

<div class="kepala-halaman">
  <p class="alis">Peta wilayah</p>
  <h1>Peta dan fasilitas umum</h1>
  <p>Titik lokasi kawasan pada peta, beserta daftar fasilitas umum di dalamnya. Tekan tombol petunjuk arah untuk menuju ke sini dari mana pun.</p>
</div>

<section class="blok"><Peta perbesaran={17} /></section>

<section class="blok">
  <div class="kepala-bagian"><h2>Batas tiap RT</h2></div>
  {#if batas.length}
    <div class="tabel-bungkus">
      <table class="data">
        <thead><tr><th>RT</th><th>Cakupan blok</th><th>Batas wilayah</th></tr></thead>
        <tbody>
          {#each batas as o}
            <tr><td><b>{o.rt || "-"}</b></td><td><Belum nilai={o.blok} /></td><td><Belum nilai={o.batas} /></td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <p class="kosong">Batas tiap RT belum diisi pengurus.</p>
  {/if}
  <p class="verifikasi">
    Batas RT ditulis sebagai keterangan karena peta umum tidak menggambar batas RT.
  </p>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Fasilitas umum</h2></div>
  <div class="tabel-bungkus">
    <table class="data">
      <thead><tr><th>Fasilitas</th><th>Jenis</th><th>Lokasi</th></tr></thead>
      <tbody>
        {#each fasum as f}
          <tr><td><b>{f.nama}</b></td><td>{f.jenis || "-"}</td><td>{f.rt || "-"}</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
