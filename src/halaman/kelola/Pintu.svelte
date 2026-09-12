<script>
  /**
   * Pintu masuk halaman Kelola.
   *
   * Dashboard Petugas tetap dipisahkan sebagai chunk terpisah supaya warga
   * biasa tidak ikut mengunduh seluruh back-office. Karena GitHub Pages bisa
   * berganti versi saat tab lama masih terbuka, chunk lama kadang sudah tidak
   * tersedia setelah deploy baru. Di bawah ini ada pemulihan satu kali:
   * reload otomatis mengambil index + nama chunk terbaru tanpa meminta user
   * melakukan refresh manual berulang kali.
   */
  import { sesi, pengurus } from "../../keadaan/sesi.svelte.js";
  import { siapkanAkun } from "../../sumber/akun.js";
  import { ambilPeran, simpanDokumen } from "../../sumber/data.js";
  import { KOLEKSI } from "../../inti/nama.js";
  import { PETUGAS_SIAP_PAKAI } from "../../inti/akses.js";

  siapkanAkun();

  const KUNCI_PULIH_CHUNK = "rw02-pulih-chunk-kelola";

  let Kelola = $state(null);
  let gagal = $state(false);
  let sedangMuat = $state(false);
  let akunPetugasDisiapkan = false;

  function hapusPenandaPulih() {
    if (typeof sessionStorage === "undefined") return;
    try { sessionStorage.removeItem(KUNCI_PULIH_CHUNK); } catch {}
  }

  function pulihkanSekali() {
    if (typeof window === "undefined" || typeof sessionStorage === "undefined") return false;
    try {
      if (sessionStorage.getItem(KUNCI_PULIH_CHUNK) === "1") return false;
      sessionStorage.setItem(KUNCI_PULIH_CHUNK, "1");
      window.location.reload();
      return true;
    } catch {
      return false;
    }
  }

  function muatUlangHalaman() {
    hapusPenandaPulih();
    window.location.reload();
  }

  $effect(() => {
    if (!pengurus() || akunPetugasDisiapkan) return;
    akunPetugasDisiapkan = true;

    (async () => {
      try {
        const ada = await ambilPeran(PETUGAS_SIAP_PAKAI.email);
        if (ada) return;

        await simpanDokumen(
          KOLEKSI.PENGURUS,
          PETUGAS_SIAP_PAKAI.email,
          {
            nama: PETUGAS_SIAP_PAKAI.nama,
            jabatan: PETUGAS_SIAP_PAKAI.jabatan,
            peran: PETUGAS_SIAP_PAKAI.peran
          },
          false
        );
      } catch {
        /* Dashboard tetap dibuka walau penyiapan akun tambahan gagal. */
      }
    })();
  });

  $effect(() => {
    /* Jangan membaca `sedangMuat` di syarat effect ini. Pada Svelte 5,
       state yang dibaca menjadi dependency effect. Versi sebelumnya membaca
       sedangMuat lalu langsung mengubahnya menjadi true; effect dijadwalkan
       ulang, cleanup menandai import sebagai batal, dan hasil import akhirnya
       selalu diabaikan. Gejalanya persis spinner "Membuka Dashboard Petugas"
       yang berputar tanpa selesai. */
    if (!pengurus() || Kelola) return;

    let batal = false;
    gagal = false;
    sedangMuat = true;

    import("./Kelola.svelte")
      .then((m) => {
        if (batal) return;
        Kelola = m.default;
        sedangMuat = false;
        hapusPenandaPulih();
      })
      .catch(() => {
        if (batal) return;
        sedangMuat = false;

        /* Kasus paling umum setelah deploy: tab lama masih memegang nama
           chunk versi sebelumnya. Satu reload mengambil build terbaru. */
        if (pulihkanSekali()) return;
        gagal = true;
      });

    return () => { batal = true; };
  });
</script>

{#if !sesi.siap}
  <section class="kelola-loading" role="status" aria-busy="true">
    <span class="kelola-spinner" aria-hidden="true"></span>
    <strong>Memeriksa akun Petugas</strong>
    <small>Menyiapkan sesi yang aman...</small>
  </section>
{:else if !pengurus()}
  <nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Kelola</span></nav>
  <div class="kepala-halaman">
    <p class="alis">Pengurus</p>
    <h1>Kelola situs warga</h1>
  </div>
  <div class="kunci">
    <h3>Tidak tersedia</h3>
    <p>
      Halaman ini hanya untuk pengurus yang sudah masuk dengan akun terdaftar.
      {#if sesi.pengguna}
        Anda masuk sebagai {sesi.pengguna.email}, dan alamat itu belum terdaftar sebagai pengurus.
      {:else}
        Silakan masuk lebih dulu.
      {/if}
    </p>
    <div class="baris-tombol" style="margin-top:14px">
      <a class="tombol utama" href="#/">Kembali ke beranda</a>
      {#if !sesi.pengguna}<a class="tombol" href="#/masuk">Masuk</a>{/if}
    </div>
  </div>
{:else if gagal}
  <section class="kelola-loading kelola-gagal" role="alert">
    <span class="kelola-ikon">!</span>
    <strong>Dashboard belum berhasil dimuat</strong>
    <small>Koneksi atau berkas versi terbaru belum terbaca.</small>
    <button type="button" onclick={muatUlangHalaman}>Coba lagi</button>
  </section>
{:else if Kelola}
  <Kelola />
{:else}
  <section class="kelola-loading" role="status" aria-busy="true">
    <span class="kelola-spinner" aria-hidden="true"></span>
    <strong>Membuka Dashboard Petugas</strong>
    <small>Memuat modul operasional RW 02...</small>
  </section>
{/if}

<style>
  .kelola-loading {
    min-height: 100dvh;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: 10px;
    padding: 28px;
    color: #174c40;
    text-align: center;
    background:
      radial-gradient(circle at 50% 42%, rgba(57,181,139,.10), transparent 28%),
      #f6faf8;
  }

  .kelola-loading strong {
    margin-top: 4px;
    font-size: 20px;
    letter-spacing: -.02em;
  }

  .kelola-loading small {
    color: #6b7d76;
    font-size: 13px;
  }

  .kelola-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #d8ebe4;
    border-top-color: #0a735c;
    border-radius: 50%;
    animation: putar .8s linear infinite;
  }

  .kelola-ikon {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: #8d421f;
    background: #fff1e9;
    font-weight: 900;
    font-size: 22px;
  }

  .kelola-gagal button {
    min-height: 42px;
    margin-top: 8px;
    padding: 0 18px;
    border: 0;
    border-radius: 11px;
    color: #fff;
    background: #0b6b57;
    font: inherit;
    font-weight: 800;
    cursor: pointer;
  }

  @keyframes putar { to { transform: rotate(360deg); } }

  @media (prefers-reduced-motion: reduce) {
    .kelola-spinner { animation: none; }
  }
</style>
