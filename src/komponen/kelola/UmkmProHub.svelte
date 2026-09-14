<script>
  import { isi } from "../../keadaan/isi.svelte.js";
  import UmkmEditorPublik from "./UmkmEditorPublik.svelte";
  import UmkmBukti from "./UmkmBukti.svelte";

  const daftar = $derived(Array.isArray(isi.usaha) ? isi.usaha : []);
  let dipilih = $state("");

  $effect(() => {
    if (dipilih && daftar.some((x) => x.id === dipilih)) return;
    dipilih = daftar[0]?.id || "";
  });
</script>

{#if daftar.length}
  <section class="pro-hub">
    <header class="pro-selector">
      <div>
        <span>PUSAT KONTEN UMKM</span>
        <h2>Kelola apa yang benar-benar dilihat warga</h2>
        <p>Pilih satu UMKM. Editor di bawah mengikuti struktur halaman publik: deskripsi, foto, produk/layanan, harga, keunggulan, promo, informasi usaha, cara pesan, FAQ, dan ulasan.</p>
      </div>
      <label>
        <span>UMKM yang dikelola</span>
        <select bind:value={dipilih}>
          {#each daftar as u}<option value={u.id}>{u.nama || u.id}</option>{/each}
        </select>
      </label>
    </header>

    <UmkmEditorPublik usahaId={dipilih} />

    <details class="pro-admin-more">
      <summary><span>Dokumen, QR & bukti legalitas</span><small>Buka fitur internal lanjutan</small></summary>
      <div class="pro-admin-body"><UmkmBukti usahaId={dipilih} /></div>
    </details>
  </section>
{:else}
  <section class="pro-empty">Belum ada UMKM di katalog. Terima pendaftaran UMKM lebih dulu, lalu seluruh profil publik dapat dikelola dari halaman ini.</section>
{/if}

<style>
  .pro-hub{display:grid;gap:14px}.pro-selector{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,360px);gap:18px;align-items:end;padding:18px 20px;border:1px solid #dce7e3;border-radius:18px;background:linear-gradient(125deg,#edf9f4,#fff 58%);box-shadow:0 14px 38px -34px rgba(10,72,56,.5)}.pro-selector>div>span{display:block;color:#0a725b;font-size:12px;font-weight:900;letter-spacing:.09em}.pro-selector h2{margin:4px 0 5px;font-size:23px;letter-spacing:-.03em;color:#172720}.pro-selector p{max-width:760px;margin:0;color:#6c7975;line-height:1.5}.pro-selector label{display:grid;gap:6px}.pro-selector label>span{font-size:13px;font-weight:800;color:#445850}.pro-selector select{width:100%;min-height:46px;padding:9px 11px;border:1px solid #cdded7;border-radius:10px;background:#fff;color:#1c2a25;font-weight:700}.pro-admin-more{overflow:hidden;border:1px solid #dce7e3;border-radius:16px;background:#fff}.pro-admin-more summary{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:15px 18px;cursor:pointer;list-style:none;font-weight:850;color:#1b3028}.pro-admin-more summary::-webkit-details-marker{display:none}.pro-admin-more summary small{font-weight:650;color:#71807a}.pro-admin-more[open] summary{border-bottom:1px solid #e4ece9;background:#f8fbfa}.pro-admin-body{padding:0 0 2px}.pro-admin-body :global(.profile-card){display:none!important}.pro-empty{padding:22px;border:1px dashed #cddbd6;border-radius:14px;background:#f8fbfa;color:#6b7974;text-align:center}
  @media(max-width:760px){.pro-selector{grid-template-columns:1fr;padding:14px}.pro-admin-more summary{align-items:flex-start;flex-direction:column}.pro-selector h2{font-size:20px}}
</style>