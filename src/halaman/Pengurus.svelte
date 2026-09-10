<script>
  import { isi } from "../keadaan/isi.svelte.js";
  import { PENGURUS_RW_BAWAAN, KETUA_RT_BAWAAN, KELEMBAGAAN_WARGA_BAWAAN } from "../inti/bawaan.js";
  import Belum from "../komponen/Belum.svelte";
  import Kosong from "../komponen/Kosong.svelte";

  function normal(s) {
    return String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  const daftar = $derived.by(() => {
    const dariServer = isi.pengurus_tampil || [];
    const resmi = PENGURUS_RW_BAWAAN.map((bawaan) => {
      const cocok = dariServer.find((o) => {
        const a = normal(o.jabatan);
        const b = normal(bawaan.jabatan);
        return a === b || a.includes(b) || b.includes(a);
      });
      return cocok
        ? {
            ...cocok,
            ...bawaan,
            foto: bawaan.foto || cocok.foto,
            kontak: cocok.kontak || bawaan.kontak,
            periode: cocok.periode || bawaan.periode
          }
        : bawaan;
    });

    const tambahan = dariServer.filter((o) =>
      !PENGURUS_RW_BAWAAN.some((b) => {
        const a = normal(o.jabatan);
        const c = normal(b.jabatan);
        return a === c || a.includes(c) || c.includes(a);
      })
    );

    return [...resmi, ...tambahan];
  });

  /* Selama data RT belum selesai dimuat, tampilkan bawaan resmi.
     Kalau pengurus memang mengosongkan koleksi RT, hormati data server. */
  const barisRTServer = $derived(
    isi.batas_rt === null
      ? KETUA_RT_BAWAAN
      : (isi.batas_rt || [])
  );

  const barisRT = $derived.by(() => {
    const dariServer = barisRTServer;
    if (!dariServer.length) return [];

    return dariServer.map((server) => {
      const bawaan = KETUA_RT_BAWAAN.find((b) => {
        const id = normal(server.id);
        const rt = normal(server.rt);
        const targetId = normal(b.id);
        const targetRt = normal(b.rt);
        return id === targetId || rt === targetRt || rt.startsWith(targetId);
      });

      if (!bawaan) return server;
      return {
        ...server,
        ...bawaan,
        foto: bawaan.foto || server.foto,
        kontak: server.kontak || bawaan.kontak,
        blok: server.blok || bawaan.blok
      };
    });
  });

  const lembaga = KELEMBAGAAN_WARGA_BAWAAN;
</script>

<div class="mobile-page mobile-pengurus">

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
              {#if o.foto}<img class="gambar-penuh" src={o.foto} alt="Foto {o.ketua || o.rt}" decoding="async" />{/if}
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
    <p class="verifikasi">Foto Ketua RT yang sudah diterima ditampilkan pada struktur. Kontak dan cakupan wilayah dapat dilengkapi pengurus setelah mendapat izin yang bersangkutan.</p>
  {:else}
    <Kosong
      judul="Data Ketua RT belum diisi"
      ket="Nomor RT, nama Ketua RT, cakupan blok, kontak, dan foto dapat ditambahkan pengurus dari halaman Kelola."
      tab="profil"
      aksi="Isi data Ketua RT"
    />
  {/if}
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