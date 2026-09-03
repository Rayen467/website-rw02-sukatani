<script>
  /** Penanda status berwarna: Diterima, Diproses, Selesai. */
  let { status = "baru" } = $props();

  const peta = {
    baru: ["baru", "Diterima"],
    proses: ["proses", "Diproses"],
    selesai: ["selesai", "Selesai"],
    rencana: ["baru", "Rencana"],
    aktif: ["selesai", "Terverifikasi"],
    ditolak: ["tolak", "Ditolak"]
  };
  const isi = $derived(peta[status] || ["baru", status]);
</script>

<span class="status {isi[0]}">{isi[1]}</span>
