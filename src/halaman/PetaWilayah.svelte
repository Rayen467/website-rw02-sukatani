<script>
  import { isi, pakai } from "../keadaan/isi.svelte.js";
  import { FASUM_BAWAAN, KETUA_RT_BAWAAN } from "../inti/bawaan.js";
  import Peta from "../komponen/Peta.svelte";

  function normal(s) {
    return String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  const batasServer = $derived(isi.batas_rt || []);
  const batas = $derived.by(() => {
    const resmi = KETUA_RT_BAWAAN.map((rt) => {
      const cocok = batasServer.find((x) => {
        const id = normal(x.id);
        const namaRt = normal(x.rt);
        return id === normal(rt.id) || namaRt === normal(rt.rt) || namaRt.startsWith(normal(rt.id));
      });
      return cocok ? { ...rt, ...cocok, rt: cocok.rt || rt.rt, ketua: cocok.ketua || rt.ketua } : { ...rt };
    });

    const tambahan = batasServer.filter((x) => !KETUA_RT_BAWAAN.some((rt) => {
      const id = normal(x.id);
      const namaRt = normal(x.rt);
      return id === normal(rt.id) || namaRt === normal(rt.rt) || namaRt.startsWith(normal(rt.id));
    }));

    return [...resmi, ...tambahan];
  });

  const fasum = $derived(pakai("fasum", FASUM_BAWAAN));
  const luasWilayah = "3,51";
  const balai = $derived(fasum.find((f) => normal(f.nama).includes("balai")) || null);
  const batasLengkap = $derived(batas.filter((r) => r.blok && r.batas).length);
</script>

<nav class="remah"><a href="#/">Beranda</a><span>›</span><span>Peta Wilayah</span></nav>

<div class="kepala-halaman">
  <p class="alis">Peta wilayah</p>
  <h1>Peta dan fasilitas umum</h1>
  <p>Batas RW, daftar RT, lokasi fasilitas umum, dan jalur menuju kawasan ditampilkan dalam satu halaman. Data batas RT yang belum dikonfirmasi tidak pernah diisi dengan perkiraan.</p>
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

  <div class="kartu luas-wilayah">
    <span class="luas-ikon" aria-hidden="true">⌂</span>
    <div>
      <span class="luas-label">Balai Warga</span>
      <strong class="ringkas-teks">{balai?.rt || "Lokasi belum dikonfirmasi"}</strong>
      <p>{balai ? `${balai.nama} · ${balai.jenis || "Fasilitas pertemuan"}` : "Data lokasi dapat diperbarui pengurus melalui Kelola."}</p>
    </div>
  </div>

  <div class="kartu luas-wilayah">
    <span class="luas-ikon" aria-hidden="true">✓</span>
    <div>
      <span class="luas-label">Verifikasi Batas RT</span>
      <strong>{batasLengkap}<small> / {KETUA_RT_BAWAAN.length} RT</small></strong>
      <p>Baris dianggap lengkap setelah cakupan blok dan keterangan batas diisi pengurus.</p>
    </div>
  </div>
</section>

<section class="blok"><Peta perbesaran={17} /></section>

<section class="blok">
  <div class="kepala-bagian"><h2>Batas tiap RT</h2><span class="label-kecil">RT 01–RT 04 selalu tercantum</span></div>
  <div class="tabel-bungkus">
    <table class="data">
      <thead><tr><th>RT</th><th>Ketua RT</th><th>Cakupan blok</th><th>Batas wilayah</th><th>Status data</th></tr></thead>
      <tbody>
        {#each batas as o}
          <tr>
            <td><b>{o.rt || o.id || "-"}</b></td>
            <td>{o.ketua || "Belum diisi"}</td>
            <td>{o.blok || "Menunggu data pengurus"}</td>
            <td>{o.batas || "Menunggu verifikasi batas RT"}</td>
            <td>
              {#if o.blok && o.batas}
                <span class="status-batas siap">Terverifikasi di situs</span>
              {:else}
                <span class="status-batas tunggu">Belum lengkap</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <p class="verifikasi">
    Batas RT ditampilkan sebagai keterangan dan, bila pengurus memasukkan minimal tiga titik koordinat nyata lewat Kelola, garis kuning batas RT juga digambar langsung pada peta di atas. Koordinat yang belum tersedia sengaja tidak ditebak agar warga tidak menerima informasi wilayah yang salah.
  </p>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Fasilitas umum</h2><span class="label-kecil">{fasum.length} fasilitas</span></div>
  <div class="tabel-bungkus">
    <table class="data">
      <thead><tr><th>Fasilitas</th><th>Jenis</th><th>Lokasi</th><th>Status lokasi</th></tr></thead>
      <tbody>
        {#each fasum as f}
          <tr>
            <td><b>{f.nama}</b></td>
            <td>{f.jenis || "-"}</td>
            <td>{f.rt || "Belum dikonfirmasi"}</td>
            <td><span class="status-batas" class:siap={Boolean(f.rt)} class:tunggu={!f.rt}>{f.rt ? "Tercatat" : "Perlu dilengkapi"}</span></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

<style>
  .ringkasan-wilayah {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 18px;
  }

  .luas-wilayah {
    min-width: 0;
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

  .luas-wilayah strong.ringkas-teks {
    font-size: 18px;
    line-height: 1.2;
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

  .status-batas {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 700;
    white-space: nowrap;
  }

  .status-batas.siap {
    color: #0b6b4e;
    background: #e1f5ec;
  }

  .status-batas.tunggu {
    color: #8a5a00;
    background: #fff3cd;
  }

  @media (max-width: 900px) {
    .ringkasan-wilayah { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 680px) {
    .ringkasan-wilayah { grid-template-columns: 1fr; }

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
