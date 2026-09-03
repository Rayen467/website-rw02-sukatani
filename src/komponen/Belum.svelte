<script>
  /** Menampilkan nilai, atau penanda kuning bila pengurus belum mengisinya. */
  let { nilai = "", panjang = false } = $props();
</script>

{#if nilai}
  {nilai}
{:else}
  <span class="belum">{panjang ? "…… belum diisi pengurus" : "……"}</span>
{/if}
