<script>
  import { isi } from "../keadaan/isi.svelte.js";
  import { RT_BAWAAN } from "../inti/bawaan.js";
  import Belum from "../komponen/Belum.svelte";
  import Kosong from "../komponen/Kosong.svelte";

  const daftar = $derived(isi.pengurus_tampil || []);

  /* Bawaan RT hanya dipakai SELAMA permintaan pertama belum selesai.
     Setelah Firestore menjawab [] berarti pengurus memang menghapus semua
     baris RT; jangan hidupkan lagi RT 01-04 dari data bawaan. */
  const barisRT = $derived(
    isi.batas_rt === null
      ? RT_BAWAAN.map((r) => ({ id: r, rt: r }))
      : (isi.batas_rt || [])
  );
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
    <Kosong
    judul="Susunan pengurus belum diisi"
    ket="Nama dan jabatan pengurus RW beserta para Ketua RT akan tampil di sini."
    tab="profil"
    aksi="Isi susunan pengurus"
  />
  {/if}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Ketua RT</h2></div>
  {#if barisRT.length}
    <div class="petak petak-2">
      {#each barisRT as o}
        <div class="kartu">
          <div class="orang">
            <span class="foto">
              {#if o.foto}<img class="gambar-penuh" src={o.foto} alt="" decoding="async" />{/if}
            </span>
            <div>
              <span class="jabatan">{o.rt || "-"}</span>
              <span class="nama"><Belum nilai={o.ketua} /></span>
              <span class="kontak">Kontak <Belum nilai={o.kontak} /></span>
              <span class="kontak">Cakupan <Belum nilai={o.blok} /></span>
            </div>
          </div>
        </div>
      {/each}
    </div>
    <p class="verifikasi">Foto dan kontak hanya ditampilkan setelah diisi pengurus dan mendapat izin yang bersangkutan.</p>
  {:else}
    <Kosong
      judul="Data Ketua RT belum diisi"
      ket="Nomor RT, nama Ketua RT, cakupan blok, kontak, dan foto dapat ditambahkan pengurus dari halaman Kelola."
      tab="profil"
      aksi="Isi data Ketua RT"
    />
  {/if}
</section>
