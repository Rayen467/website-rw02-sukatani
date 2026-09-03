<script>
  import { KONTEN } from "../inti/nama.js";
  import { konten } from "../keadaan/isi.svelte.js";
  import { keDaftar } from "../inti/format.js";
  import Belum from "../komponen/Belum.svelte";

  const p = $derived(konten(KONTEN.PROFIL) || {});
  const misi = $derived(keDaftar(p.misi));
  const batas = $derived([
    ["Utara", p.batasUtara],
    ["Timur", p.batasTimur],
    ["Selatan", p.batasSelatan],
    ["Barat", p.batasBarat]
  ]);
</script>

<nav class="remah"><a href="#/">Beranda</a><span>›</span><span>Profil RW</span></nav>

<div class="kepala-halaman">
  <p class="alis">Profil</p>
  <h1>Profil RW Permai Sukatani</h1>
  <p>Keterangan wilayah, sejarah singkat, serta visi dan misi kepengurusan.</p>
</div>

<section class="blok">
  <div class="kartu">
    <h3>Sejarah singkat</h3>
    {#if p.sejarah}
      <p style="font-size:15px">{p.sejarah}</p>
    {:else}
      <p class="kosong">Sejarah RW belum ditulis pengurus.</p>
    {/if}
  </div>
</section>

<section class="blok">
  <div class="petak petak-2">
    <div class="kartu">
      <p class="alis">Visi</p>
      {#if p.visi}
        <p style="font-size:16px;color:var(--tinta);line-height:1.65">{p.visi}</p>
      {:else}
        <p class="kosong">Belum diisi.</p>
      {/if}
    </div>
    <div class="kartu">
      <p class="alis">Misi</p>
      {#if misi.length}
        <ol class="poin">{#each misi as m}<li>{m}</li>{/each}</ol>
      {:else}
        <p class="kosong">Belum diisi.</p>
      {/if}
    </div>
  </div>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Keterangan wilayah</h2></div>
  <div class="tabel-bungkus">
    <table class="data"><tbody>
      <tr><th>Luas wilayah</th><td><Belum nilai={p.luas} /></td></tr>
      <tr><th>Jumlah RT</th><td><Belum nilai={p.jumlahRT} /></td></tr>
      <tr><th>Desa</th><td>Sukatani</td></tr>
      <tr><th>Kecamatan</th><td>Rajeg</td></tr>
      <tr><th>Kabupaten</th><td>Tangerang, Provinsi Banten</td></tr>
      <tr><th>Kode pos</th><td>15540</td></tr>
    </tbody></table>
  </div>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Batas wilayah</h2></div>
  <div class="tabel-bungkus">
    <table class="data"><tbody>
      {#each batas as b}
        <tr><th>Sebelah {b[0]}</th><td><Belum nilai={b[1]} /></td></tr>
      {/each}
    </tbody></table>
  </div>
  <p class="verifikasi">
    Batas wilayah diisi menurut keterangan pengurus RW dan dicocokkan dengan data kantor desa.
  </p>
</section>
