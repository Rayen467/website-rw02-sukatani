<script>
  import { salinTeks } from "../lib/bantu.js";
  import { beriTahu, kontenNilai } from "../lib/keadaan.svelte.js";
  import { pangkalSitus } from "../lib/rute.svelte.js";

  let { judul = "", jalur = "/" } = $props();

  async function salin() {
    const teks =
      judul + " — selengkapnya di situs warga: " + pangkalSitus(kontenNilai("identitas", "alamatSitus")) + "#" + jalur;
    const berhasil = await salinTeks(teks);
    beriTahu(
      berhasil
        ? "Teks dan tautan tersalin. Tinggal tempel ke grup WhatsApp warga."
        : "Peramban ini belum mengizinkan salin otomatis. Salin tautannya dari bilah alamat."
    );
  }
</script>

<button class="tombol" type="button" onclick={salin}>
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
    <path d="M12 3v13" />
    <path d="M8 7l4-4 4 4" />
  </svg>
  Salin untuk grup WhatsApp
</button>
