<script>
  import { isi } from "../keadaan/isi.svelte.js";
  import { PENGURUS_RW_BAWAAN, KETUA_RT_BAWAAN, KELEMBAGAAN_WARGA_BAWAAN } from "../inti/bawaan.js";
  import { KONTAK_KETUA_RW } from "../inti/kontak-resmi.js";
  import Belum from "../komponen/Belum.svelte";
  import Kosong from "../komponen/Kosong.svelte";

  function normal(s) {
    return String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  function tanpaSapaan(nama) {
    return String(nama || "")
      .trim()
      .replace(/^(bapak|ibu|pak|bu)\s+/i, "");
  }

  function nomorWa(n) {
    if (!n) return "";
    return String(n).replace(/[^0-9]/g, "").replace(/^0/, "62");
  }

  function hrefKontak(nomor) {
    return "https://wa.me/" + nomorWa(nomor || KONTAK_KETUA_RW);
  }

  const FOTO_HANDOKO = "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/fd57c52e-1c82-4ccc-8800-458a0206d3ad.png";

  const FOTO_PENGURUS = Object.freeze({
    sukarno: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/4e0a0b02-b3ab-4976-bfd8-2e510e97297d.png"
  });

  function fotoPengurus(o) {
    const nama = normal(o?.nama);
    return FOTO_PENGURUS[nama] || o?.foto || "";
  }

  function fotoLembaga(o) {
    const ketua = normal(o?.ketua);
    if (ketua.includes("handoko")) return FOTO_HANDOKO;
    return o?.foto || "";
  }

  const KONTAK_RT = Object.freeze({
    "rt 01": "+62 878-7708-4596",
    "rt 03": "+62 813-1708-1950",
    "rt 04": "+62 857-7271-1169"
  });

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
            kontak: bawaan.kontak || cocok.kontak,
            periode: cocok.periode || bawaan.periode
          }
        : {
            ...bawaan,
            foto: fotoBawaan
          };
    });

    const tambahan = dariServer.filter((o) => {
      if (normal(o.nama).includes("handoko")) return false;

      return !PENGURUS_RW_BAWAAN.some((b) => {
        const a = normal(o.jabatan);
        const c = normal(b.jabatan);
        return a === c || a.includes(c) || c.includes(a);
      });
    });

    return [...resmi, ...tambahan];
  });

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
  <p>Susunan pengurus RW 02 dan para Ketua RT Perum Sukatani. Setiap kartu mempunyai jalur kontak. Jika nomor pribadi belum dipublikasikan, tombol diarahkan melalui Ketua RW agar warga tetap bisa menghubungi pengurus tanpa menampilkan nomor yang belum mendapat izin.</p>
</div>

<section class="blok">
  <div class="kepala-bagian"><h2>Pengurus RW</h2></div>
  {#if daftar.length}
    <div class="petak petak-3">
      {#each daftar as o}
        <div class="kartu">
          <div class="orang">
            <span class="foto">
              {#if fotoPengurus(o)}
                <img class="gambar-penuh" src={fotoPengurus(o)} alt="Foto {tanpaSapaan(o.nama) || o.jabatan}" decoding="async" />
              {/if}
            </span>
            <div>
              <span class="jabatan">{o.jabatan || "-"}</span>
              <span class="nama"><Belum nilai={tanpaSapaan(o.nama)} /></span>
              <a
                class="kontak"
                href={hrefKontak(o.kontak)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={o.kontak ? "Hubungi " + (tanpaSapaan(o.nama) || o.jabatan) + " melalui WhatsApp" : "Hubungi " + (tanpaSapaan(o.nama) || o.jabatan) + " melalui Ketua RW"}
              >
                {o.kontak ? "WhatsApp " + o.kontak : "Hubungi via Ketua RW"}
              </a>
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
            {#if o.foto}<img class="gambar-penuh" src={o.foto} alt="Foto {tanpaSapaan(o.ketua) || o.rt}" decoding="async" />{/if}
          </span>
          <div>
            <span class="jabatan">{o.rt || "-"}</span>
            <span class="nama"><Belum nilai={tanpaSapaan(o.ketua)} /></span>
            <a
              class="kontak"
              href={hrefKontak(o.kontak)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={o.kontak ? "Hubungi " + (tanpaSapaan(o.ketua) || o.rt) + " melalui WhatsApp" : "Hubungi " + (tanpaSapaan(o.ketua) || o.rt) + " melalui Ketua RW"}
            >
              {o.kontak ? "WhatsApp " + o.kontak : "Hubungi via Ketua RW"}
            </a>
          </div>
        </div>
      </div>
    {/each}
  </div>
  <p class="verifikasi">Nomor pribadi hanya ditampilkan bila sudah tersedia untuk publik. Ketua RT yang belum mempunyai nomor publik tetap dapat dihubungi melalui Ketua RW, sehingga tidak ada tombol kontak yang buntu.</p>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Lembaga &amp; Kelompok Warga</h2></div>
  <div class="petak petak-3">
    {#each lembaga as o}
      <div class="kartu">
        <div class="orang">
          <span class="foto">
            {#if fotoLembaga(o)}<img class="gambar-penuh" src={fotoLembaga(o)} alt="Foto {tanpaSapaan(o.ketua) || o.nama}" decoding="async" />{/if}
          </span>
          <div>
            <span class="jabatan">{o.nama}</span>
            <span class="nama">{tanpaSapaan(o.ketua)}</span>
            <span class="kontak">{o.jabatan}</span>
          </div>
        </div>
      </div>
    {/each}
  </div>
  <p class="verifikasi">Foto akan ditampilkan setelah diterima dari yang bersangkutan dan mendapat izin untuk dipublikasikan di website RW 02.</p>
</section>

</div>
