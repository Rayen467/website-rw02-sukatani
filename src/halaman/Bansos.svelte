<script>
  import { pakai, konten } from "../lib/keadaan.svelte.js";
  import { BANSOS_BAWAAN, RT_BAWAAN } from "../lib/bawaan.js";
  import { keDaftar, uraiBaris } from "../lib/bantu.js";

  const program = $derived(
    pakai("bansos", BANSOS_BAWAAN).map((b) => ({
      ...b,
      daftarSyarat: Array.isArray(b.syarat) ? b.syarat : keDaftar(b.syarat)
    }))
  );
  const info = $derived(konten("bansos") || {});
  const penerima = $derived(uraiBaris(info.penerima));
  const barisRT = $derived(penerima.length ? penerima : RT_BAWAAN.map((r) => [r, ""]));
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Bantuan Sosial</span></nav>
<div class="kepala-halaman">
  <p class="alis">Warga</p>
  <h1>Informasi bantuan sosial</h1>
  <p>Syarat, jalur pengajuan, dan keterbukaan jumlah penerima.</p>
</div>

<div class="catatan">
  <b>Jumlahnya terbuka, datanya tidak.</b> Yang dipublikasikan hanya jumlah penerima per RT.
  Nama dan alamat penerima tidak ditampilkan di situs, dan hanya dapat diperiksa langsung kepada pengurus.
</div>

<section class="blok" style="margin-top:24px">
  <div class="kepala-bagian"><h2>Program yang berjalan</h2></div>
  {#each program as b}
    <div class="kartu" style="margin-bottom:14px">
      <h3>{b.nama}</h3>
      {#if b.daftarSyarat.length}
        <p><b>Syarat umum</b></p>
        <ul class="poin">{#each b.daftarSyarat as sy}<li>{sy}</li>{/each}</ul>
      {/if}
      <p><b>Jalur pengajuan</b> &mdash; {b.jalur || "\u2026\u2026"}</p>
    </div>
  {/each}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Jumlah penerima per RT</h2></div>
  <div class="tabel-bungkus">
    <table class="data">
      <thead><tr><th>RT</th><th>Jumlah penerima</th><th>Periode</th></tr></thead>
      <tbody>
        {#each barisRT as p}
          <tr>
            <td><b>{p[0]}</b></td>
            <td>{#if p[1]}{p[1]}{:else}<span class="belum">\u2026\u2026</span>{/if}</td>
            <td>{info.periode || ""}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
