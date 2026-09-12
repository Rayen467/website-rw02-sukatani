<script>
  import { isi } from "../../keadaan/isi.svelte.js";
  import UmkmSimulasi from "./UmkmSimulasi.svelte";
  import UmkmBukti from "./UmkmBukti.svelte";

  const daftar = $derived(Array.isArray(isi.usaha) ? isi.usaha : []);
  let dipilih = $state("");

  $effect(() => {
    if (dipilih && daftar.some((x) => x.id === dipilih)) return;
    dipilih = daftar[0]?.id || "";
  });
</script>

<UmkmSimulasi />

{#if daftar.length}
  <section class="pro-selector">
    <div>
      <span>UMKM PRO TOOLKIT</span>
      <h3>Dokumen, QR, edit profil & monitoring</h3>
      <p>Pilih usaha untuk membuka fitur lanjutan. Data bukti tidak dimuat sampai usaha dipilih.</p>
    </div>
    <label>
      <span>Pilih UMKM</span>
      <select bind:value={dipilih}>
        {#each daftar as u}<option value={u.id}>{u.nama || u.id}</option>{/each}
      </select>
    </label>
  </section>
  <UmkmBukti usahaId={dipilih} />
{:else}
  <section class="pro-empty">Belum ada UMKM di katalog. Terima pendaftaran warga atau gunakan Lab Simulasi untuk mencoba fitur.</section>
{/if}

<style>
  .pro-selector{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,360px);gap:18px;align-items:end;margin-top:14px;padding:16px 18px;border:1px solid #dce7e3;border-radius:15px;background:#fff}.pro-selector>div>span{display:block;color:#0a725b;font-size:12px;font-weight:900;letter-spacing:.09em}.pro-selector h3{margin:4px 0;font-size:18px;color:#172720}.pro-selector p{margin:0;color:#6c7975}.pro-selector label{display:grid;gap:6px}.pro-selector label>span{font-size:13px;font-weight:800;color:#445850}.pro-selector select{width:100%;min-height:44px;padding:9px 11px;border:1px solid #d2dfda;border-radius:10px;background:#fff;color:#1c2a25}.pro-empty{margin-top:14px;padding:20px;border:1px dashed #cddbd6;border-radius:14px;background:#f8fbfa;color:#6b7974;text-align:center}
  @media(max-width:760px){.pro-selector{grid-template-columns:1fr;padding:14px}}
</style>
