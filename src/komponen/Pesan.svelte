<script>
  import { pesan } from "../keadaan/pesan.svelte.js";
</script>

<div class="pesan" class:tampil={pesan.tampil} role="status" aria-live="polite">
  {pesan.teks}
</div>
