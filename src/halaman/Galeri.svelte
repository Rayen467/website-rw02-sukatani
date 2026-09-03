<script>
  import { isi } from "../keadaan/isi.svelte.js";
  const daftar = $derived(isi.galeri || []);
  let terbuka = $state(null);
</script>

<nav class="remah"><a href="#/">Beranda</a><span>›</span><span>Galeri</span></nav>
<div class="kepala-halaman">
  <p class="alis">Informasi</p>
  <h1>Galeri foto kegiatan</h1>
  <p>Dokumentasi kegiatan, pembangunan, dan acara warga.</p>
</div>

<div class="kartu" style="margin-bottom:22px">
  <h3>Format penamaan berkas</h3>
  <p class="mono" style="font-size:14px;color:var(--brand)">TAHUN-BULAN-TANGGAL_Nama-Kegiatan</p>
  <p>Tanggal ditulis lebih dulu agar berkas terurut sendiri, dan nama kegiatan memakai tanda hubung supaya tidak rusak saat dipindahkan antarperangkat.</p>
</div>

{#if daftar.length}
  <div class="galeri">
    {#each daftar as g}
      <button class="galitem" type="button" onclick={() => (terbuka = g)}>
        <span class="muka">
          {#if g.foto}<img class="gambar-penuh" src={g.foto} alt="" decoding="async" />{:else}FOTO KEGIATAN{/if}
        </span>
        <span class="kepala">
          <b>{g.judul}</b>
          <span>{g.fn || ""}{g.jml ? " · " + g.jml : ""}</span>
        </span>
      </button>
    {/each}
  </div>
{:else}
  <p class="kosong">Belum ada dokumentasi kegiatan yang dicatat.</p>
{/if}

<svelte:window onkeydown={(e) => e.key === "Escape" && (terbuka = null)} />

{#if terbuka}
  <div class="tirai" role="dialog" aria-modal="true" aria-label={terbuka.judul}>
    <!-- Lapisan gelap di belakang, bisa ditekan untuk menutup.
         Dibuat sebagai tombol supaya bisa dijangkau papan ketik juga. -->
    <button class="tirai-tutup" type="button" aria-label="Tutup" onclick={() => (terbuka = null)}></button>
    <div class="dalam">
      <div class="muka">
        {#if terbuka.foto}<img class="gambar-penuh" src={terbuka.foto} alt="" />{:else}FOTO KEGIATAN{/if}
      </div>
      <div>
        <b style="font-family:Archivo,sans-serif;font-size:17px">{terbuka.judul}</b>
        <p class="mono" style="font-size:12px;color:var(--tinta-3)">{terbuka.fn || ""}{terbuka.jml ? " · " + terbuka.jml : ""}</p>
      </div>
      <div><button class="tombol" type="button" onclick={() => (terbuka = null)}>Tutup</button></div>
    </div>
  </div>
{/if}
