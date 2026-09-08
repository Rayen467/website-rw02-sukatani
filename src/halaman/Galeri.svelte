<script>
  /**
   * Galeri foto kegiatan.
   *
   * Satu kegiatan = satu album berisi banyak foto. Yang dimuat bersama
   * situs cuma sampul kecil tiap album; foto ukuran penuhnya baru diambil
   * setelah albumnya dibuka. Tanpa pemisahan itu, album kerja bakti berisi
   * dua puluh foto akan terunduh oleh setiap pengunjung, termasuk yang cuma
   * mau membaca pengumuman.
   */
  import { KOLEKSI } from "../inti/nama.js";
  import { isi } from "../keadaan/isi.svelte.js";
  import { beriTahu } from "../keadaan/pesan.svelte.js";
  import { ambilCocok } from "../sumber/data.js";
  import Kosong from "../komponen/Kosong.svelte";

  const daftar = $derived(isi.galeri || []);
  const video = $derived((isi.berkas || []).filter((d) => d.kategori === "video"));

  let album = $state(null);
  let foto = $state([]);
  let memuat = $state(false);
  let ke = $state(0);

  async function buka(g) {
    album = g;
    foto = [];
    ke = 0;
    memuat = true;
    try {
      const hasil = await ambilCocok(KOLEKSI.GALERI_FOTO, "album", g.id);
      /* Diurutkan di sini, bukan di server, supaya Firestore tidak menuntut
         indeks gabungan yang harus dibuat manual di konsol. */
      hasil.sort((a, b) => Number(a.urut || 0) - Number(b.urut || 0));
      foto = hasil;
    } catch (err) {
      beriTahu("Foto album ini gagal diambil.");
    }
    memuat = false;
  }

  function tutup() {
    album = null;
    foto = [];
    ke = 0;
  }

  function geser(arah) {
    if (!foto.length) return;
    ke = (ke + arah + foto.length) % foto.length;
  }

  const sekarang = $derived(foto[ke] || null);
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Galeri</span></nav>
<div class="kepala-halaman">
  <p class="alis">Informasi</p>
  <h1>Galeri foto &amp; video</h1>
  <p>Dokumentasi kegiatan, pembangunan, dan acara warga dalam bentuk album foto maupun video.</p>
</div>

{#if daftar.length}
  <div class="galeri">
    {#each daftar as g}
      <button class="galitem" type="button" onclick={() => buka(g)}>
        <span class="muka">
          {#if g.sampul || g.foto}
            <img class="gambar-penuh" src={g.sampul || g.foto} alt="" decoding="async" />
          {/if}
        </span>
        <span class="kepala">
          <b>{g.judul}</b>
          <span>
            {#if Number(g.jumlahFoto || 0) > 0}
              {g.jumlahFoto} foto{g.jml ? " · " + g.jml : ""}
            {:else}
              {g.fn || ""}{g.jml ? " · " + g.jml : ""}
            {/if}
          </span>
        </span>
      </button>
    {/each}
  </div>
{:else}
  <Kosong
    judul="Belum ada dokumentasi kegiatan"
    ket="Foto kerja bakti, posyandu, rapat warga, dan acara lain akan dikumpulkan di sini per kegiatan."
    tab="terbit"
    aksi="Unggah foto kegiatan"
  />
{/if}

<section class="blok" style="margin-top:30px">
  <div class="kepala-bagian">
    <h2>Video kegiatan</h2>
    <a href="#/berkas">Dokumen &amp; video →</a>
  </div>
  {#if video.length}
    <div class="petak petak-2">
      {#each video as v}
        <div class="kartu">
          <p class="alis">Video{v.tgl ? " · " + v.tgl : ""}</p>
          <h3>{v.judul}</h3>
          {#if v.ket}<p>{v.ket}</p>{/if}
          {#if v.cara === "tautan" && v.tautan}
            <a class="tombol utama" href={v.tautan} target="_blank" rel="noopener noreferrer">Tonton video ↗</a>
          {:else}
            <a class="tombol" href="#/berkas">Buka di Dokumen &amp; Video</a>
          {/if}
        </div>
      {/each}
    </div>
  {:else}
    <div class="catatan">
      <b>Belum ada video kegiatan.</b> Pengurus dapat menambahkan tautan YouTube atau video lain lewat Kelola → Dokumen &amp; Video dengan kategori Video kegiatan.
    </div>
  {/if}
</section>

<svelte:window
  onkeydown={(e) => {
    if (!album) return;
    if (e.key === "Escape") tutup();
    if (e.key === "ArrowRight") geser(1);
    if (e.key === "ArrowLeft") geser(-1);
  }}
/>

{#if album}
  <div class="tirai" role="dialog" aria-modal="true" aria-label={album.judul}>
    <!-- Lapisan gelap di belakang, bisa ditekan untuk menutup.
         Dibuat sebagai tombol supaya bisa dijangkau papan ketik juga. -->
    <button class="tirai-tutup" type="button" aria-label="Tutup" onclick={tutup}></button>
    <div class="dalam">
      <div class="muka">
        {#if memuat}
          <span class="mono" style="font-size:13px">Mengambil foto...</span>
        {:else if sekarang}
          <img class="gambar-penuh" src={sekarang.foto} alt="" />
        {:else if album.foto}
          <!-- Album lama, dari sebelum satu album bisa berisi banyak foto. -->
          <img class="gambar-penuh" src={album.foto} alt="" />
        {/if}
      </div>

      <div>
        <b style="font-family:Archivo,sans-serif;font-size:17px">{album.judul}</b>
        <p class="mono" style="font-size:12px;color:var(--tinta-3)">
          {#if foto.length}
            Foto {ke + 1} dari {foto.length}{album.jml ? " · " + album.jml : ""}
          {:else}
            {album.fn || ""}{album.jml ? " · " + album.jml : ""}
          {/if}
        </p>
      </div>

      {#if foto.length > 1}
        <div class="jempol">
          {#each foto as f, i}
            <button
              class="jempol-satu"
              class:terpilih={i === ke}
              type="button"
              aria-label="Foto {i + 1}"
              onclick={() => (ke = i)}
            >
              <img src={f.foto} alt="" decoding="async" />
            </button>
          {/each}
        </div>
      {/if}

      <div class="baris-tombol">
        {#if foto.length > 1}
          <button class="tombol" type="button" onclick={() => geser(-1)}>&larr; Sebelumnya</button>
          <button class="tombol" type="button" onclick={() => geser(1)}>Berikutnya &rarr;</button>
        {/if}
        <button class="tombol" type="button" onclick={tutup}>Tutup</button>
      </div>
    </div>
  </div>
{/if}
