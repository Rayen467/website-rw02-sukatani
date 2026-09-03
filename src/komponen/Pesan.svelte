<script>
  import { pesan } from "../lib/keadaan.svelte.js";
</script>

<div class="pesan" class:tampil={pesan.tampil} role="status" aria-live="polite">
  {pesan.teks}
</div>
