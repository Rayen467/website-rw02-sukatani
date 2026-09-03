<script>
  import { beriTahu } from "../keadaan/pesan.svelte.js";
  import { sesi, pengurus, namaPeran, wargaAktif } from "../keadaan/sesi.svelte.js";
  import { keluar } from "../sumber/akun.js";
  import { pergi } from "../keadaan/rute.svelte.js";

  const label = $derived.by(() => {
    if (!sesi.pengguna) return "Masuk / Daftar";
    const nama = sesi.pengguna.nama || sesi.pengguna.email;
    if (!sesi.terverifikasi) return nama + " · Email belum dipastikan";
    if (pengurus()) return nama + " · " + namaPeran();
    return nama + " · " + (wargaAktif() ? "Warga" : "Menunggu verifikasi");
  });

  async function tekan() {
    if (sesi.pengguna) {
      await keluar();
      beriTahu("Anda sudah keluar.");
    } else {
      pergi("/masuk");
    }
  }
</script>

<button
  class="tombol-kecil"
  class:aktif={!!sesi.pengguna}
  type="button"
  onclick={tekan}
  title={sesi.pengguna ? sesi.pengguna.email + ". Tekan untuk keluar." : "Masuk atau daftar akun warga"}
>
  {#if sesi.pengguna}
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  {:else}
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
    </svg>
  {/if}
  <span class="teks">{label}</span>
</button>
