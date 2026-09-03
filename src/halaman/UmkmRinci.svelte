<script>
  import { isi, beriTahu } from "../lib/keadaan.svelte.js";
  import TidakAda from "./TidakAda.svelte";
  import Belum from "../komponen/Belum.svelte";

  let { kunci } = $props();
  const u = $derived((isi.usaha || []).find((x) => x.id === kunci));
</script>

{#if !u}
  <TidakAda />
{:else}
  <nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><a href="#/umkm">Direktori UMKM</a><span>&rsaquo;</span><span>{u.nama}</span></nav>
  <div class="kepala-halaman">
    <p class="alis">{u.katLabel || "Usaha warga"}</p>
    <h1>{u.nama}</h1>
    {#if u.panjang}<p>{u.panjang}</p>{/if}
  </div>

  <div class="usaha-rinci">
    <div>
      <div class="foto-deret">
        <div>{#if u.foto}<img class="gambar-penuh" src={u.foto} alt="" />{:else}FOTO UTAMA{/if}</div>
        <div>FOTO 2</div>
        <div>FOTO 3</div>
        <div>FOTO 4</div>
      </div>

      <div class="tabel-bungkus">
        <table class="data"><tbody>
          <tr><th>Jenis usaha</th><td>{u.katLabel || "-"}</td></tr>
          <tr><th>Jam buka</th><td><Belum nilai={u.jam} /></td></tr>
          <tr><th>Alamat di kawasan</th><td><Belum nilai={u.alamat} /></td></tr>
          <tr><th>Nomor pemesanan</th><td><Belum nilai={u.wa} /></td></tr>
        </tbody></table>
      </div>
      <p class="verifikasi">Nomor pemilik usaha ditampilkan setelah yang bersangkutan memberi izin.</p>
    </div>

    <aside class="sisi">
      {#if u.wa}
        <div class="baris-tombol">
          <a class="tombol wa" href="https://wa.me/{String(u.wa).replace(/[^0-9]/g, '').replace(/^0/, '62')}" target="_blank" rel="noopener noreferrer">Pesan via WhatsApp</a>
        </div>
      {:else}
        <div class="kartu"><p>Nomor pemesanan belum ditampilkan pemilik usaha.</p></div>
      {/if}

      <div class="qrbox kartu">
        <p style="font-size:13.5px;line-height:1.5">
          Kode QR pada papan usaha ini menuju <b>halaman ini</b>, bukan halaman depan situs.
        </p>
        <p class="mono" style="font-size:11.5px;color:var(--tinta-3)">&hellip;/#/umkm/{u.id}</p>
      </div>
    </aside>
  </div>
{/if}
