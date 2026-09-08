<script>
  import { KOLEKSI } from "../inti/nama.js";
  import { isi } from "../keadaan/isi.svelte.js";
  import { ambilDokumen } from "../sumber/data.js";
  import TidakAda from "./TidakAda.svelte";
  import Belum from "../komponen/Belum.svelte";

  let { kunci } = $props();
  const u = $derived((isi.usaha || []).find((x) => x.id === kunci));

  /* Foto ukuran penuh sengaja TIDAK ikut dimuat bersama katalog usaha --
     alasannya di catatan USAHA_FOTO, src/inti/nama.js. Diambil di sini,
     waktu halaman rinciannya benar-benar dibuka.

     Selama menunggu, yang dipasang adalah sampul kecil yang memang sudah
     ada di layar. Sampul lebih kecil daripada kotaknya, jadi sesaat
     terlihat lebih lembut lalu tergantikan yang tajam. Itu lebih baik
     daripada bidang kosong yang tiba-tiba berisi.

     Kalau pengambilannya gagal, sampul itu tetap yang tampil. Tidak ada
     pesan galat: warga tetap melihat fotonya, cuma tidak setajam
     mestinya, dan itu bukan sesuatu yang bisa mereka perbaiki. */
  let penuh = $state("");

  $effect(() => {
    const id = kunci;
    penuh = "";
    /* Menunggu sampai usahanya benar-benar ada di katalog. Tanpa ini,
       alamat yang salah ketik tetap memicu satu permintaan ke server untuk
       id yang tidak pernah ada. Karena efek ini ikut membaca u, ia jalan
       lagi sendiri begitu katalognya selesai dimuat. */
    if (!id || !u) return;
    let batal = false;
    ambilDokumen(KOLEKSI.USAHA_FOTO, id)
      .then((d) => {
        if (!batal && d && d.foto) penuh = d.foto;
      })
      .catch(() => {});
    return () => (batal = true);
  });

  /* Kolom "foto" ikut dibaca untuk usaha yang tersimpan sebelum pemisahan. */
  const gambar = $derived(penuh || (u && (u.sampul || u.foto)) || "");
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
      <!-- Dulu ada tiga kotak berisi tulisan FOTO 2, FOTO 3, FOTO 4. Satu
           usaha cuma punya satu foto, jadi ketiganya tidak akan pernah
           terisi -- yang dibaca warga sebagai situs yang belum jadi.
           Alasan lengkapnya ada di catatan .usaha-kartu .muka:empty,
           src/gaya/bagian.css. -->
      <div class="foto-deret">
        <div>{#if gambar}<img class="gambar-penuh" src={gambar} alt="" />{/if}</div>
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
