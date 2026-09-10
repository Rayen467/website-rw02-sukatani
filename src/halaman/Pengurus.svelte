<script>
  import { isi } from "../keadaan/isi.svelte.js";
  import { PENGURUS_RW_BAWAAN, KETUA_RT_BAWAAN, KELEMBAGAAN_WARGA_BAWAAN } from "../inti/bawaan.js";
  import Belum from "../komponen/Belum.svelte";
  import Kosong from "../komponen/Kosong.svelte";

  function normal(s) {
    return String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  const FOTO_PENGURUS = Object.freeze({
    sukarno: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/4e0a0b02-b3ab-4976-bfd8-2e510e97297d.png"
  });

  const KONTAK_RT = Object.freeze({
    "rt 01": "+62 878-7708-4596",
    "rt 03": "+62 813-1708-1950",
    "rt 04": "+62 857-7271-1169"
  });

  const PENGURUS_TAMBAHAN_LOKAL = [
    {
      id: "handoko",
      jabatan: "Pengurus RW",
      nama: "Handoko",
      foto: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/fd57c52e-1c82-4ccc-8800-458a0206d3ad.png",
      kontak: "",
      periode: ""
    }
  ];

  const daftar = $derived.by(() => {
    const dariServer = isi.pengurus_tampil || [];
    const resmi = PENGURUS_RW_BAWAAN.map((bawaan) => {
      const cocok = dariServer.find((o) => {
        const a = normal(o.jabatan);
        const b = normal(bawaan.jabatan);
        return a === b || a.includes(b) || b.includes(a);
      });
      const fotoBawaan = FOTO_PENGURUS[normal(bawaan.nama)] || bawaan.foto;

      return cocok
        ? {
            ...cocok,
            ...bawaan,
            foto: fotoBawaan || cocok.foto,
            kontak: cocok.kontak || bawaan.kontak,
            periode: cocok.periode || bawaan.periode
          }
        : {
            ...bawaan,
            foto: fotoBawaan
          };
    });

    const tambahan = dariServer.filter((o) =>
      !PENGURUS_RW_BAWAAN.some((b) => {
        const a = normal(o.jabatan);
        const c = normal(b.jabatan);
        return a === c || a.includes(c) || c.includes(a);
      })
    );

    const semua = [...resmi, ...tambahan];
    const tambahanLokal = PENGURUS_TAMBAHAN_LOKAL.filter(
      (lokal) => !semua.some((o) => normal(o.nama) === normal(lokal.nama))
    );

    return [...semua, ...tambahanLokal];
  });

  /* Empat Ketua RT berikut sudah dikonfirmasi sebagai struktur resmi RW 02.
     Karena itu mereka tetap tampil walaupun koleksi Firestore belum diisi.
     Data server tetap dapat melengkapi data internal dan menambahkan RT lain. */
  const barisRT = $derived.by(() => {
    const dariServer = isi.batas_rt || [];

    const resmi = KETUA_RT_BAWAAN.map((bawaan) => {
      const cocok = dariServer.find((server) => {
        const id = normal(server.id);
        const rt = normal(server.rt);
        const targetId = normal(bawaan.id);
        const targetRt = normal(bawaan.rt);
        return id === targetId || rt === targetRt || rt.startsWith(targetId);
      });
      const kontakBawaan = KONTAK_RT[normal(bawaan.id)] || bawaan.kontak;

      return cocok
        ? {
            ...cocok,
            ...bawaan,
            foto: bawaan.foto || cocok.foto,
            kontak: kontakBawaan || cocok.kontak,
            blok: cocok.blok || bawaan.blok
          }
        : {
            ...bawaan,
            kontak: kontakBawaan
          };
    });

    const tambahan = dariServer.filter((server) =>
      !KETUA_RT_BAWAAN.some((b) => {
        const id = normal(server.id);
        const rt = normal(server.rt);
        const targetId = normal(b.id);
        const targetRt = normal(b.rt);
        return id === targetId || rt === targetRt || rt.startsWith(targetId);
      })
    );

    return [...resmi, ...tambahan];
  });

  const lembaga = KELEMBAGAAN_WARGA_BAWAAN;
</script>

<div class="mobile-page mobile-pengurus">

<nav class="remah"><a href="#/">Beranda</a><span>›</span><span>Struktur Pengurus</span></nav>

<div class="kepala-halaman">
  <p class="alis">Struktur</p>
  <h1>Pengurus RW dan Ketua RT</h1>
  <p>Susunan pengurus RW 02 dan para Ketua RT Perum Sukatani. Detail profil masing-masing pengurus akan ditampilkan pada halaman profilnya.</p>
</div>

<section class="blok">
  <div class="kepala-bagian"><h2>Pengurus RW</h2></div>
  {#if daftar.length}
    <div class="petak petak-3">
      {#each daftar as o}
        <div class="kartu">
          <div class="orang">
            <span class="foto">
              {#if o.foto}<img class="gambar-penuh" src={o.foto} alt="Foto {o.nama || o.jabatan}" decoding="async" />{/if}
            </span>
            <div>
              <span class="jabatan">{o.jabatan || "-"}</span>
              <span class="nama"><Belum nilai={o.nama} /></span>
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
  <div class="petak petak-2">
    {#each barisRT as o}
      <div class="kartu">
        <div class="orang">
          <span class="foto">
            {#if o.foto}<img class="gambar-penuh" src={o.foto} alt="Foto {o.ketua || o.rt}" decoding="async" />{/if}
          </span>
          <div>
            <span class="jabatan">{o.rt || "-"}</span>
            <span class="nama"><Belum nilai={o.ketua} /></span>
            {#if o.kontak}
              <a class="kontak" href={"tel:" + String(o.kontak).replace(/[^\d+]/g, "")}>{o.kontak}</a>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>
  <p class="verifikasi">Foto dan kontak Ketua RT yang sudah diterima ditampilkan pada struktur. Detail profil masing-masing Ketua RT akan dilengkapi pada halaman profil.</p>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Lembaga &amp; Kelompok Warga</h2></div>
  <div class="petak petak-3">
    {#each lembaga as o}
      <div class="kartu">
        <div class="orang">
          <span class="foto">
            {#if o.foto}<img class="gambar-penuh" src={o.foto} alt="" decoding="async" />{/if}
          </span>
          <div>
            <span class="jabatan">{o.nama}</span>
            <span class="nama">{o.ketua}</span>
            <span class="kontak">{o.jabatan}</span>
          </div>
        </div>
      </div>
    {/each}
  </div>
  <p class="verifikasi">Foto akan ditampilkan setelah diterima dari yang bersangkutan dan mendapat izin untuk dipublikasikan di website RW 02.</p>
</section>

</div>