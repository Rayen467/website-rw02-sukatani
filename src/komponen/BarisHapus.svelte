<script>
  /** Satu baris daftar yang bisa dihapus pengurus. */
  import { muatKoleksi } from "../keadaan/isi.svelte.js";
  import { beriTahu } from "../keadaan/pesan.svelte.js";
  import { hapusDokumen } from "../sumber/data.js";
  import { pesanRamah } from "../sumber/firebase.js";

  let { koleksi, id, judul, baris = [] } = $props();
  let sibuk = $state(false);

  async function hapus() {
    if (!confirm("Hapus dari situs? Tindakan ini tidak bisa dibatalkan.")) return;
    sibuk = true;
    try {
      await hapusDokumen(koleksi, id);
      beriTahu("Dihapus.");
      muatKoleksi(koleksi);
    } catch (err) {
      beriTahu(pesanRamah(err));
    }
    sibuk = false;
  }
</script>

<div class="baris-kelola">
  <div class="isi">
    <b>{judul}</b>
    {#each baris as t}{#if t}<p>{t}</p>{/if}{/each}
  </div>
  <div></div>
  <button class="tombol" type="button" onclick={hapus} disabled={sibuk}>{sibuk ? "Menghapus..." : "Hapus"}</button>
</div>
