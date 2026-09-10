<script>
  import { pakai } from "../keadaan/isi.svelte.js";
  import { TAUTAN_BAWAAN } from "../inti/bawaan.js";
  const daftar = $derived(pakai("tautan", TAUTAN_BAWAAN));
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Link Penting</span></nav>
<div class="kepala-halaman">
  <p class="alis">Layanan Warga</p>
  <h1>Link Penting</h1>
  <p>Akses cepat ke laman resmi Kelurahan Sukatani, Kecamatan Rajeg, Dukcapil, informasi KTP-el, dan layanan pemerintah lain yang sering dibutuhkan warga.</p>
</div>

<div class="petak petak-2">
  {#each daftar as t}
    {#if t.url}
      <a class="kartu" href={t.url} target="_blank" rel="noopener noreferrer">
        <h3>{t.nama}</h3>
        <p>{t.ket || ""}</p>
        <p class="keterangan">Buka laman resmi ↗</p>
      </a>
    {:else}
      <div class="kartu">
        <h3>{t.nama}</h3>
        <p>{t.ket || ""}</p>
        <p class="keterangan">Alamat laman resmi belum dicantumkan.</p>
      </div>
    {/if}
  {/each}
</div>

<p class="verifikasi">
  Tautan pada halaman ini diarahkan ke sumber resmi. Jika alamat layanan belum dapat dipastikan, tautan tidak ditampilkan agar warga tidak diarahkan ke laman yang keliru.
</p>
