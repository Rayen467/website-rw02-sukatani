<script>
  import { isi, pakai } from "../keadaan/isi.svelte.js";
  import { RT_BAWAAN } from "../inti/bawaan.js";
  import Belum from "../komponen/Belum.svelte";

  const daftar = $derived(isi.pengurus_tampil || []);
  const barisRT = $derived(pakai("batas_rt", RT_BAWAAN.map((r) => ({ id: r, rt: r }))));
</script>

<nav class="remah"><a href="#/">Beranda</a><span>›</span><span>Struktur Pengurus</span></nav>

<div class="kepala-halaman">
  <p class="alis">Struktur</p>
  <h1>Pengurus RW dan Ketua RT</h1>
  <p>Susunan pengurus beserta kontak yang bisa dihubungi warga. Nomor hanya ditampilkan setelah pemiliknya memberi izin.</p>
</div>

<section class="blok">
  <div class="kepala-bagian"><h2>Pengurus RW</h2></div>
  {#if daftar.length}
    <div class="petak petak-3">
      {#each daftar as o}
        <div class="kartu">
          <div class="orang">
            <span class="foto">
              {#if o.foto}<img class="gambar-penuh" src={o.foto} alt="" decoding="async" />{/if}
            </span>
            <div>
              <span class="jabatan">{o.jabatan || "-"}</span>
              <span class="nama"><Belum nilai={o.nama} /></span>
              <span class="kontak">Kontak <Belum nilai={o.kontak} /></span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <p class="kosong">Susunan pengurus belum diisi. Pengurus dapat menambahkannya lewat halaman Kelola.</p>
  {/if}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Ketua RT</h2></div>
  <div class="tabel-bungkus">
    <table class="data">
      <thead><tr><th>RT</th><th>Nama Ketua RT</th><th>Kontak</th><th>Cakupan blok</th></tr></thead>
      <tbody>
        {#each barisRT as o}
          <tr>
            <td><b>{o.rt || "-"}</b></td>
            <td><Belum nilai={o.ketua} /></td>
            <td><Belum nilai={o.kontak} /></td>
            <td><Belum nilai={o.blok} /></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <p class="verifikasi">Diisi pengurus lewat halaman Kelola.</p>
</section>
