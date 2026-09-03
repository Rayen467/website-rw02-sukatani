<script>
  import { pakai } from "../lib/keadaan.svelte.js";
  import { TAUTAN_BAWAAN } from "../lib/bawaan.js";
  const daftar = $derived(pakai("tautan", TAUTAN_BAWAAN));
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Tautan Penting</span></nav>
<div class="kepala-halaman">
  <p class="alis">Warga</p>
  <h1>Tautan penting</h1>
  <p>Laman resmi yang sering diperlukan warga untuk mengurus administrasi kependudukan.</p>
</div>

<div class="petak petak-2">
  {#each daftar as t}
    {#if t.url}
      <a class="kartu" href={t.url} target="_blank" rel="noopener noreferrer">
        <h3>{t.nama}</h3>
        <p>{t.ket || ""}</p>
        <p class="keterangan">{t.url}</p>
      </a>
    {:else}
      <div class="kartu">
        <h3>{t.nama}</h3>
        <p>{t.ket || ""}</p>
        <p class="keterangan">Alamat laman <span class="belum">\u2026\u2026</span></p>
      </div>
    {/if}
  {/each}
</div>

<p class="verifikasi">
  Tautan yang belum terisi sengaja dikosongkan. Alamat resmi dipastikan lebih dulu kepada kantor desa
  agar warga tidak diarahkan ke laman yang keliru.
</p>
