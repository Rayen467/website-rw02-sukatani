<script>
  import { isi, pakai } from "../keadaan/isi.svelte.js";
  import { FASUM_BAWAAN } from "../inti/bawaan.js";
  import Peta from "../komponen/Peta.svelte";
  import Belum from "../komponen/Belum.svelte";
  import Kosong from "../komponen/Kosong.svelte";

  const batas = $derived(isi.batas_rt || []);
  const fasum = $derived(pakai("fasum", FASUM_BAWAAN));
  const luasWilayah = "3,51";
</script>

<nav class="remah"><a href="#/">Beranda</a><span>›</span><span>Peta Wilayah</span></nav>

<div class="kepala-halaman">
  <p class="alis">Peta wilayah</p>
  <h1>Peta dan fasilitas umum</h1>
  <p>Titik lokasi kawasan pada peta, beserta daftar fasilitas umum di dalamnya. Tekan tombol petunjuk arah untuk menuju ke sini dari mana pun.</p>
</div>

<section class="blok ringkasan-wilayah" aria-label="Ringkasan wilayah RW 02">
  <div class="kartu luas-wilayah">
    <span class="luas-ikon" aria-hidden="true">▱</span>
    <div>
      <span class="luas-label">Luas Wilayah RW 02</span>
      <strong>{luasWilayah} <small>ha</small></strong>
      <p>Berdasarkan pengukuran area pada peta wilayah yang diterima.</p>
    </div>
  </div>
</section>

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
    <Kosong
    judul="Batas tiap RT belum diisi"
    ket="Cakupan blok dan nama Ketua RT untuk masing-masing RT akan tampil di sini."
    tab="profil"
    aksi="Isi batas RT"
  />
  {/if}
  <p class="verifikasi">
    Batas RT tetap ditampilkan sebagai keterangan. Jika pengurus mengisi titik koordinat batas RT lewat Kelola, garis batasnya juga digambar langsung pada peta di atas.
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

<style>
  .ringkasan-wilayah {
    margin-bottom: 18px;
  }

  .luas-wilayah {
    max-width: 420px;
    display: grid;
    grid-template-columns: 46px minmax(0, 1fr);
    align-items: center;
    gap: 14px;
    border-left: 3px solid var(--brand);
  }

  .luas-ikon {
    width: 46px;
    height: 46px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    background: var(--brand-soft);
    color: var(--brand);
    font-size: 22px;
    font-weight: 800;
  }

  .luas-label {
    display: block;
    color: var(--tinta-3);
    font-family: "IBM Plex Mono", ui-monospace, monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .luas-wilayah strong {
    display: block;
    margin-top: 2px;
    color: var(--tinta);
    font-family: "Archivo", sans-serif;
    font-size: 30px;
    line-height: 1.05;
    letter-spacing: -.03em;
  }

  .luas-wilayah strong small {
    font-size: 14px;
    font-weight: 650;
    color: var(--tinta-2);
  }

  .luas-wilayah p {
    margin-top: 5px;
    color: var(--tinta-3);
    font-size: 11px;
    line-height: 1.45;
  }

  @media (max-width: 680px) {
    .luas-wilayah {
      max-width: none;
      grid-template-columns: 42px minmax(0, 1fr);
      padding: 14px 15px;
    }

    .luas-ikon {
      width: 42px;
      height: 42px;
    }

    .luas-wilayah strong {
      font-size: 26px;
    }
  }
</style>
