<script>
  import { URUTAN_TEMA, NAMA_TEMA, KET_TEMA, temaSekarang, pasangTema } from "../keadaan/tampilan.js";

  let tema = $state(temaSekarang());

  function putar() {
    const i = URUTAN_TEMA.indexOf(tema);
    tema = URUTAN_TEMA[(i + 1) % URUTAN_TEMA.length];
    pasangTema(tema);
  }
</script>

<button
  class="tombol-kecil"
  type="button"
  onclick={putar}
  title="Tampilan: {KET_TEMA[tema]}. Tekan untuk mengubah."
  aria-label="Tampilan {NAMA_TEMA[tema]}, tekan untuk mengubah"
>
  {#if tema === "sistem"}
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none" />
    </svg>
  {:else if tema === "light"}
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.2v2.1M12 19.7v2.1M4.6 4.6l1.5 1.5M17.9 17.9l1.5 1.5M2.2 12h2.1M19.7 12h2.1M4.6 19.4l1.5-1.5M17.9 6.1l1.5-1.5" />
    </svg>
  {:else}
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z" />
    </svg>
  {/if}
  <span class="teks">{NAMA_TEMA[tema]}</span>
</button>
