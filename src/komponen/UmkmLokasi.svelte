<script>
  import { isi } from "../keadaan/isi.svelte.js";

  let { usahaId = "" } = $props();

  const usaha = $derived((isi.usaha || []).find((x) => x.id === usahaId) || null);

  const bersih = (nilai) => String(nilai || "").trim();

  function koordinatDariLink(url) {
    const teks = bersih(url);
    if (!teks) return "";

    const pola = [
      /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
      /[?&](?:q|query|ll)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
      /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/
    ];

    for (const re of pola) {
      const cocok = teks.match(re);
      if (cocok) return `${cocok[1]},${cocok[2]}`;
    }
    return "";
  }

  const alamat = $derived(bersih(usaha?.alamat));
  const mapsAsli = $derived(bersih(usaha?.maps));
  const koordinat = $derived(bersih(usaha?.koordinat) || koordinatDariLink(mapsAsli));
  const queryPeta = $derived(koordinat || alamat);
  const embed = $derived(queryPeta ? `https://www.google.com/maps?q=${encodeURIComponent(queryPeta)}&output=embed` : "");
  const bukaMaps = $derived(
    mapsAsli || (queryPeta ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryPeta)}` : "")
  );
</script>

{#if usaha && (alamat || mapsAsli || koordinat)}
  <section class="umkm-lokasi" aria-labelledby="umkm-lokasi-title">
    <div class="umkm-lokasi-head">
      <div>
        <span>LOKASI USAHA</span>
        <h2 id="umkm-lokasi-title">Temukan {usaha.nama}</h2>
        <p>Alamat dan titik peta membantu warga memastikan lokasi usaha sebelum datang atau memesan.</p>
      </div>
      {#if bukaMaps}
        <a href={bukaMaps} target="_blank" rel="noopener noreferrer">Buka Google Maps ↗</a>
      {/if}
    </div>

    <div class="umkm-lokasi-grid">
      <article class="umkm-lokasi-info">
        <div class="umkm-lokasi-pin" aria-hidden="true">⌖</div>
        <div>
          <small>Alamat / area layanan</small>
          <strong>{alamat || "Pin lokasi sudah tersedia"}</strong>
          {#if koordinat}<code>{koordinat}</code>{/if}
          <p>Lokasi mengikuti data yang dimasukkan pengelola UMKM. Konfirmasi lewat WhatsApp bila membutuhkan patokan yang lebih rinci.</p>
        </div>
      </article>

      <div class="umkm-lokasi-map">
        {#if embed}
          <iframe
            src={embed}
            title={`Peta lokasi ${usaha.nama}`}
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
          ></iframe>
        {:else}
          <div class="umkm-lokasi-empty">
            <span>⌖</span>
            <strong>Pin Google Maps tersedia</strong>
            <small>Buka tautan Maps untuk melihat titik lokasi secara langsung.</small>
          </div>
        {/if}
      </div>
    </div>
  </section>
{/if}

<style>
  .umkm-lokasi{margin:24px 0 34px;padding:22px;border:1px solid #dce7e3;border-radius:20px;background:#fff;box-shadow:0 18px 44px -38px rgba(8,70,55,.55)}
  .umkm-lokasi-head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:16px}
  .umkm-lokasi-head>div{min-width:0}.umkm-lokasi-head span{display:block;color:#0a735b;font-size:11px;font-weight:900;letter-spacing:.11em}.umkm-lokasi-head h2{margin:5px 0 5px;color:#17352c;font-size:clamp(22px,3vw,30px);letter-spacing:-.035em}.umkm-lokasi-head p{max-width:720px;margin:0;color:#6a7a74;line-height:1.55}
  .umkm-lokasi-head>a{min-height:42px;display:inline-flex;align-items:center;justify-content:center;padding:9px 13px;border:1px solid #cfe0d9;border-radius:10px;color:#086b55;background:#f7fbf9;font-weight:800;text-decoration:none;white-space:nowrap}
  .umkm-lokasi-grid{display:grid;grid-template-columns:minmax(240px,.72fr) minmax(0,1.28fr);gap:14px}
  .umkm-lokasi-info{display:grid;grid-template-columns:42px minmax(0,1fr);gap:12px;align-content:start;padding:17px;border:1px solid #e2ebe7;border-radius:15px;background:linear-gradient(145deg,#f6fbf8,#fff)}
  .umkm-lokasi-pin{width:40px;height:40px;display:grid;place-items:center;border-radius:11px;background:#e3f5ed;color:#087158;font-size:20px;font-weight:900}.umkm-lokasi-info small{display:block;color:#78857f;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em}.umkm-lokasi-info strong{display:block;margin-top:5px;color:#213b33;font-size:16px;line-height:1.45}.umkm-lokasi-info code{display:inline-block;margin-top:8px;padding:5px 7px;border-radius:7px;background:#edf4f1;color:#446159;font-size:11px}.umkm-lokasi-info p{margin:10px 0 0;color:#70807a;font-size:13px;line-height:1.55}
  .umkm-lokasi-map{min-height:300px;overflow:hidden;border:1px solid #dce7e3;border-radius:15px;background:#eef5f2}.umkm-lokasi-map iframe{width:100%;height:100%;min-height:300px;border:0;display:block}.umkm-lokasi-empty{min-height:300px;display:grid;place-content:center;justify-items:center;gap:6px;padding:20px;text-align:center;color:#647870}.umkm-lokasi-empty>span{font-size:30px;color:#0a725a}.umkm-lokasi-empty strong{color:#29443a}
  @media(max-width:760px){.umkm-lokasi{padding:16px;border-radius:16px}.umkm-lokasi-head{align-items:flex-start;flex-direction:column}.umkm-lokasi-head>a{width:100%}.umkm-lokasi-grid{grid-template-columns:1fr}.umkm-lokasi-map,.umkm-lokasi-map iframe,.umkm-lokasi-empty{min-height:260px}}
</style>