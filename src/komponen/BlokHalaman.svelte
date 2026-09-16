<script>
  import { konten } from "../keadaan/isi.svelte.js";

  const CMS_KEY = "cms_halaman";
  let { halaman = "", posisi = "semua" } = $props();

  function bacaJson(teks, bawaan) {
    try {
      const nilai = JSON.parse(String(teks || ""));
      return nilai ?? bawaan;
    } catch {
      return bawaan;
    }
  }

  const blok = $derived.by(() => {
    const dok = konten(CMS_KEY) || {};
    const semua = bacaJson(dok.blok, []);
    return semua
      .filter((b) => b && b.halaman === halaman && String(b.tampil) !== "false")
      .filter((b) => posisi === "semua" || (b.posisi || "bawah") === posisi)
      .sort((a, b) => Number(a.urutan || 0) - Number(b.urutan || 0));
  });
</script>

{#if blok.length}
  <div class="cms-blok-list" data-cms-halaman={halaman}>
    {#each blok as b}
      <section class:cms-sorot={b.jenis === "sorot"} class:cms-dua={b.jenis === "dua-kolom"} class="cms-blok">
        {#if b.gambar}
          <div class="cms-media"><img src={b.gambar} alt={b.alt || b.judul || ""} loading="lazy" /></div>
        {/if}
        <div class="cms-isi">
          {#if b.alis}<p class="cms-alis">{b.alis}</p>{/if}
          {#if b.judul}<h2>{b.judul}</h2>{/if}
          {#if b.isi}<div class="cms-teks">{b.isi}</div>{/if}
          {#if b.tombol && b.url}
            <a class="tombol utama" href={b.url}>{b.tombol}</a>
          {/if}
        </div>
      </section>
    {/each}
  </div>
{/if}

<style>
  .cms-blok-list{display:grid;gap:20px;margin:22px 0}.cms-blok{display:grid;gap:18px;padding:24px;border:1px solid var(--garis,#dce7e1);border-radius:18px;background:var(--kertas,#fff)}.cms-blok.cms-sorot{background:linear-gradient(135deg,#f2fbf7,#fff)}.cms-blok.cms-dua{grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);align-items:center}.cms-media{overflow:hidden;border-radius:14px;min-height:180px;background:#eef4f1}.cms-media img{display:block;width:100%;height:100%;max-height:420px;object-fit:cover}.cms-isi{display:grid;gap:10px;align-content:center}.cms-isi h2{margin:0;font-size:clamp(22px,3vw,34px);line-height:1.12}.cms-alis{margin:0;color:#0b765d;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}.cms-teks{white-space:pre-line;color:var(--tinta-2,#52645e);line-height:1.65}.cms-isi .tombol{width:max-content;margin-top:4px}@media(max-width:760px){.cms-blok,.cms-blok.cms-dua{grid-template-columns:1fr;padding:18px}.cms-media{min-height:150px}}
</style>