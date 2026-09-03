<script>
  import { KONTEN } from "../inti/nama.js";
  import { konten } from "../keadaan/isi.svelte.js";
  import { pengurus, sesi } from "../keadaan/sesi.svelte.js";
  import { uraiBaris, angkaDari } from "../inti/format.js";
  import { pergi } from "../keadaan/rute.svelte.js";

  const angka = $derived(konten(KONTEN.KEPENDUDUKAN) || {});
  const st = $derived(konten(KONTEN.STATISTIK) || {});
  const ringkas = $derived([
    ["Jumlah jiwa", angka.jiwa],
    ["Kepala keluarga", angka.kk],
    ["Laki-laki", angka.lakilaki],
    ["Perempuan", angka.perempuan]
  ]);
  const bagian = $derived([
    ["Sebaran usia", uraiBaris(st.usia), false],
    ["Pendidikan terakhir", uraiBaris(st.pendidikan), true],
    ["Pekerjaan", uraiBaris(st.pekerjaan), false]
  ]);
  const agama = $derived(uraiBaris(st.agama));
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Data Kependudukan</span></nav>
<div class="kepala-halaman">
  <p class="alis">Data warga</p>
  <h1>Data kependudukan</h1>
  <p>Rekapitulasi jumlah dan komposisi warga. Halaman ini hanya memuat angka gabungan; data perorangan tidak pernah ditampilkan di situs.</p>
</div>

{#if !pengurus()}
  <div class="kunci">
    <h3>Halaman ini hanya untuk pengurus</h3>
    <p>
      Rekapitulasi kependudukan memuat data warga, jadi tidak dibuka untuk umum.
      Pengurus RW dan Ketua RT dapat membukanya setelah masuk dengan akun yang sudah didaftarkan.
    </p>
    {#if sesi.pengguna}
      <p>Anda masuk sebagai <b>{sesi.pengguna.email}</b>, tetapi akun itu belum terdaftar sebagai pengurus. Hubungi Ketua RW untuk didaftarkan.</p>
    {:else}
      <div class="baris-tombol"><button class="tombol utama" type="button" onclick={() => pergi("/masuk")}>Masuk</button></div>
    {/if}
    <p class="verifikasi">Yang dikunci hanya halaman ini. Berita, kalender, laporan kas, dan direktori usaha tetap terbuka untuk semua warga.</p>
  </div>
{:else}
  <section class="blok">
    <div class="deret-angka">
      {#each ringkas as r}
        <div class="angka">
          <span class="label">{r[0]}</span>
          <span class="besar">{#if r[1]}{r[1]}{:else}<span class="belum">\u2026\u2026</span>{/if}</span>
        </div>
      {/each}
    </div>
  </section>

  {#each bagian as b}
    {#if b[1].length}
      <section class="blok">
        <div class="kepala-bagian"><h2>{b[0]}</h2></div>
        <div class="kartu">
          <div class="batang-deret">
            {#each b[1] as r}
              <div class="batang">
                <span>{r[0]}</span>
                <span class="jalur"><span class="isi {b[2] ? 'lain' : ''}" style="width:{angkaDari(r[1])}%"></span></span>
                <span class="nilai">{angkaDari(r[1])}%</span>
              </div>
            {/each}
          </div>
        </div>
      </section>
    {/if}
  {/each}

  {#if agama.length}
    <section class="blok">
      <div class="kepala-bagian"><h2>Pemeluk agama</h2></div>
      <div class="tabel-bungkus">
        <table class="data">
          <thead><tr><th>Agama</th><th>Jumlah jiwa</th></tr></thead>
          <tbody>{#each agama as a}<tr><td>{a[0]}</td><td class="angka-kanan">{a[1]}</td></tr>{/each}</tbody>
        </table>
      </div>
    </section>
  {/if}

  {#if !bagian.some((b) => b[1].length) && !agama.length}
    <p class="kosong">Sebaran warga belum diisi. Pengurus dapat mengisinya lewat halaman Kelola.</p>
  {/if}
{/if}
