<script>
  import { KOLEKSI } from "../inti/nama.js";
  import { isi } from "../keadaan/isi.svelte.js";
  import { ambilDokumen } from "../sumber/data.js";
  import TidakAda from "./TidakAda.svelte";

  let { kunci } = $props();
  const u = $derived((isi.usaha || []).find((x) => x.id === kunci));

  let penuh = $state("");
  let mediaAktif = $state(0);

  $effect(() => {
    const id = kunci;
    penuh = "";
    mediaAktif = 0;
    if (!id || !u) return;
    let batal = false;
    ambilDokumen(KOLEKSI.USAHA_FOTO, id)
      .then((d) => {
        if (!batal && d && d.foto) penuh = d.foto;
      })
      .catch(() => {});
    return () => (batal = true);
  });

  const teksBersih = (nilai) => String(nilai || "").replace(/\s+/g, " ").trim();

  function urlGambar(item) {
    if (!item) return "";
    if (typeof item === "string") return item;
    return item.url || item.foto || item.src || "";
  }

  const galeri = $derived.by(() => {
    if (!u) return [];
    const tambahan = Array.isArray(u.galeri) ? u.galeri.map(urlGambar) : [];
    const kandidat = [penuh, u.sampul, u.foto, ...tambahan]
      .map(urlGambar)
      .filter(Boolean);
    return [...new Set(kandidat)];
  });

  const gambarAktif = $derived(galeri[mediaAktif] || galeri[0] || "");

  function nomorWa(nomor) {
    return String(nomor || "").replace(/[^0-9]/g, "").replace(/^0/, "62");
  }

  function tautanWa(usaha) {
    const n = nomorWa(usaha?.wa);
    if (!n) return "";
    const pesan = `Halo, saya melihat ${usaha.nama} di Direktori UMKM RW 02 Sukatani. Saya ingin bertanya tentang produk atau layanan yang tersedia.`;
    return `https://wa.me/${n}?text=${encodeURIComponent(pesan)}`;
  }

  function angkaHarga(nilai) {
    if (nilai === null || nilai === undefined || nilai === "") return 0;
    if (typeof nilai === "number") return nilai;
    const mentah = String(nilai).toLowerCase().trim();
    const angka = Number(mentah.replace(/[^0-9]/g, ""));
    if (!angka) return 0;
    if (/ribu|\brb\b|\bk\b/.test(mentah) && angka < 10000) return angka * 1000;
    return angka;
  }

  function hargaDariTeks(teks) {
    const sumber = String(teks || "");
    const hasil = [];
    const pola = /(?:rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})+|\d+)\s*(ribu|rb|k)?/gi;
    for (const cocok of sumber.matchAll(pola)) {
      const punyaPenanda = /rp/i.test(cocok[0]) || Boolean(cocok[2]);
      if (!punyaPenanda) continue;
      let angka = Number(String(cocok[1]).replace(/[.,]/g, ""));
      if (cocok[2] && angka < 10000) angka *= 1000;
      if (angka >= 1000 && !hasil.includes(angka)) hasil.push(angka);
    }
    return hasil.slice(0, 2);
  }

  function rentangHarga(usaha) {
    if (!usaha) return [];
    const langsung = [
      angkaHarga(usaha.hargaMulai || usaha.hargaMin),
      angkaHarga(usaha.hargaMaks || usaha.hargaMax)
    ].filter(Boolean);
    if (langsung.length) return [...new Set(langsung)].slice(0, 2);
    return hargaDariTeks(`${usaha.ringkas || ""} ${usaha.panjang || ""}`);
  }

  const harga = $derived(rentangHarga(u));

  function formatRupiah(angka) {
    return `Rp${new Intl.NumberFormat("id-ID").format(angka)}`;
  }

  function teksHarga(nilai) {
    if (!nilai?.length) return "";
    if (nilai.length === 1) return formatRupiah(nilai[0]);
    return `${formatRupiah(Math.min(...nilai))} – ${formatRupiah(Math.max(...nilai))}`;
  }

  function profilKategori(usaha) {
    const kat = String(usaha?.kat || "").toLowerCase();
    if (kat === "siapsaji") return { penawaran: "Menu & Harga", benda: "menu", kata: "kuliner" };
    if (kat === "kemasan") return { penawaran: "Produk & Varian", benda: "produk", kata: "produk rumahan" };
    if (kat === "retail") return { penawaran: "Produk & Ketersediaan", benda: "produk", kata: "retail" };
    if (kat === "jasa") return { penawaran: "Layanan & Harga", benda: "layanan", kata: "jasa" };
    return { penawaran: "Produk & Layanan", benda: "penawaran", kata: "usaha lokal" };
  }

  const kategori = $derived(profilKategori(u));

  function ringkasanHero(usaha) {
    if (!usaha) return "";
    const lokasi = usaha.alamat ? ` di ${teksBersih(usaha.alamat)}` : "";
    const hargaTeks = teksHarga(rentangHarga(usaha));
    const hargaKalimat = hargaTeks ? ` Kisaran harga yang tercantum ${hargaTeks}, dengan detail akhir dikonfirmasi langsung kepada pemilik.` : "";
    if (String(usaha.kat || "").toLowerCase() === "jasa") {
      return `${usaha.nama} merupakan layanan usaha warga RW 02 Sukatani${lokasi}.${hargaKalimat}`;
    }
    return `${usaha.nama} merupakan ${usaha.katLabel ? usaha.katLabel.toLowerCase() : "usaha lokal"} warga RW 02 Sukatani${lokasi}.${hargaKalimat}`;
  }

  function deskripsiPemilik(usaha) {
    const raw = teksBersih(usaha?.panjang || usaha?.ringkas);
    if (!raw) return "Informasi lengkap usaha belum ditambahkan oleh pemilik. Hubungi pemilik untuk memperoleh detail produk atau layanan terbaru.";
    return raw.charAt(0).toUpperCase() + raw.slice(1).replace(/\s+([,.])/g, "$1");
  }

  function daftarPenawaran(usaha) {
    if (!usaha) return [];
    const sumberTerstruktur = Array.isArray(usaha.layanan)
      ? usaha.layanan
      : Array.isArray(usaha.produk)
        ? usaha.produk
        : [];

    if (sumberTerstruktur.length) {
      return sumberTerstruktur.slice(0, 8).map((item, i) => {
        if (typeof item === "string") return { nama: item, deskripsi: "", harga: "", nomor: i + 1 };
        const hMin = angkaHarga(item.hargaMulai || item.harga || item.hargaMin);
        const hMax = angkaHarga(item.hargaMax || item.hargaMaks);
        const rentang = [hMin, hMax].filter(Boolean);
        return {
          nama: item.nama || item.judul || `${kategori.benda} ${i + 1}`,
          deskripsi: item.deskripsi || item.keterangan || "",
          harga: teksHarga(rentang),
          nomor: i + 1
        };
      });
    }

    const sumber = String(usaha.panjang || usaha.ringkas || "").trim();
    if (!sumber) return [];
    const pecah = sumber
      .split(/\n|;|•/)
      .map((x) => x.replace(/^[-–—]\s*/, "").trim())
      .filter(Boolean);
    const item = pecah.length > 1 ? pecah : [sumber];
    return item.slice(0, 6).map((teks, i) => ({
      nama: item.length === 1 ? (usaha.katLabel || "Penawaran utama") : `${usaha.katLabel || "Penawaran"} ${i + 1}`,
      deskripsi: teks,
      harga: i === 0 ? teksHarga(rentangHarga(usaha)) : "",
      nomor: i + 1
    }));
  }

  const penawaran = $derived(daftarPenawaran(u));

  function keunggulanFaktual(usaha) {
    if (!usaha) return [];
    const hasil = [
      { ikon: "RW", judul: "Usaha warga RW 02", teks: "Tercantum di Direktori UMKM RW 02 Sukatani." }
    ];
    if (usaha.wa) hasil.push({ ikon: "WA", judul: "Kontak langsung", teks: "Pertanyaan dan pemesanan dapat dikonfirmasi langsung melalui WhatsApp." });
    if (usaha.alamat) hasil.push({ ikon: "⌖", judul: "Lokasi tercantum", teks: "Informasi lokasi usaha tersedia untuk membantu warga menemukan layanan." });
    if (usaha.jam) hasil.push({ ikon: "◷", judul: "Jam layanan tersedia", teks: `Jam operasional yang dicantumkan: ${usaha.jam}.` });
    if (rentangHarga(usaha).length) hasil.push({ ikon: "Rp", judul: "Informasi harga tersedia", teks: `Kisaran harga yang tercantum ${teksHarga(rentangHarga(usaha))}.` });
    return hasil.slice(0, 4);
  }

  const unggulan = $derived(keunggulanFaktual(u));
  const wa = $derived(tautanWa(u));
  const peta = $derived(u?.alamat ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(u.alamat)}` : "");

  const terkait = $derived.by(() => {
    if (!u) return [];
    const semua = isi.usaha || [];
    const serupa = semua.filter((x) => x.id !== u.id && (x.kat === u.kat || x.katLabel === u.katLabel));
    const lain = semua.filter((x) => x.id !== u.id && !serupa.includes(x));
    return [...serupa, ...lain].slice(0, 4);
  });

  function fotoUsaha(usaha) {
    return usaha?.sampul || usaha?.foto || "";
  }

  async function bagikan() {
    if (typeof window === "undefined") return;
    const data = { title: u?.nama || "UMKM RW 02", text: `Lihat profil ${u?.nama || "UMKM"} di Direktori UMKM RW 02 Sukatani.`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(window.location.href);
        window.alert("Tautan profil UMKM disalin.");
      }
    } catch (_) {}
  }
</script>

{#if !u}
  <TidakAda />
{:else}
  <div class="umkm-profile">
    <nav class="remah umkm-profile-breadcrumb" aria-label="Breadcrumb">
      <a href="#/">Beranda</a><span>›</span><a href="#/umkm">Direktori UMKM</a><span>›</span><span>{u.katLabel || "UMKM"}</span><span>›</span><strong>{u.nama}</strong>
    </nav>

    <div class="umkm-profile-toolbar">
      <div></div>
      <button type="button" onclick={bagikan}>↗ Bagikan</button>
    </div>

    <section class="umkm-profile-hero">
      <div class="umkm-profile-gallery">
        <div class="umkm-profile-cover">
          {#if gambarAktif}
            <img src={gambarAktif} alt={`Foto ${u.nama}`} />
          {:else}
            <div class="umkm-profile-empty-photo">
              <span>UMKM RW 02</span>
              <strong>Foto usaha belum tersedia</strong>
              <small>Foto akan tampil setelah ditambahkan pengelola.</small>
            </div>
          {/if}
          {#if galeri.length > 1}
            <span class="umkm-profile-count">{mediaAktif + 1} / {galeri.length}</span>
          {/if}
        </div>

        {#if galeri.length > 1}
          <div class="umkm-profile-thumbs" aria-label="Galeri foto">
            {#each galeri.slice(0, 6) as foto, i}
              <button type="button" class:aktif={i === mediaAktif} onclick={() => (mediaAktif = i)} aria-label={`Lihat foto ${i + 1}`}>
                <img src={foto} alt="" />
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <div class="umkm-profile-summary">
        <div class="umkm-profile-badges">
          <span class="kategori">{u.katLabel || "Usaha warga"}</span>
          <span>UMKM RW 02</span>
          {#if u.terverifikasi === true || u.verifikasi === "aktif"}<span class="verified">✓ Terverifikasi</span>{/if}
        </div>

        <h1>{u.nama}</h1>
        <p class="umkm-profile-tagline">{ringkasanHero(u)}</p>

        <div class="umkm-profile-proof">
          {#each unggulan.slice(0, 4) as item}
            <span><b>{item.ikon}</b>{item.judul}</span>
          {/each}
        </div>

        <div class="umkm-profile-price">
          <small>{harga.length ? "Kisaran harga" : "Informasi harga"}</small>
          <strong>{harga.length ? teksHarga(harga) : "Belum dicantumkan"}</strong>
          <span>{harga.length ? "Konfirmasi harga akhir langsung kepada pemilik usaha." : "Hubungi pemilik untuk informasi harga terbaru."}</span>
        </div>

        <div class="umkm-profile-actions">
          {#if wa}
            <a class="primary" href={wa} target="_blank" rel="noopener noreferrer">WhatsApp pemilik <span>→</span></a>
          {/if}
          <a class="secondary" href="#penawaran">Lihat {kategori.penawaran.toLowerCase()}</a>
        </div>
      </div>

      <aside class="umkm-profile-utility" aria-label="Informasi usaha">
        <div class="umkm-profile-local-note">
          <span>✦</span>
          <div><strong>Dukung UMKM lokal</strong><p>Setiap transaksi membantu perputaran ekonomi warga RW 02.</p></div>
        </div>

        <div class="umkm-profile-facts">
          {#if u.jam}
            <div><span class="fact-icon">◷</span><div><small>Jam operasional</small><strong>{u.jam}</strong></div></div>
          {/if}
          {#if u.alamat}
            <div><span class="fact-icon">⌖</span><div><small>Lokasi</small><strong>{u.alamat}</strong>{#if peta}<a href={peta} target="_blank" rel="noopener noreferrer">Lihat di Google Maps ↗</a>{/if}</div></div>
          {/if}
          {#if u.wa}
            <div><span class="fact-icon">✆</span><div><small>WhatsApp</small><strong>{u.wa}</strong></div></div>
          {/if}
          <div><span class="fact-icon">◎</span><div><small>Jenis usaha</small><strong>{u.katLabel || "Usaha warga"}</strong></div></div>
        </div>
      </aside>
    </section>

    <nav class="umkm-profile-section-nav" aria-label="Navigasi isi profil">
      <a href="#penawaran">{kategori.penawaran}</a>
      <a href="#tentang">Tentang usaha</a>
      {#if galeri.length > 1}<a href="#galeri">Galeri</a>{/if}
      {#if u.promo}<a href="#promo">Promo</a>{/if}
      <a href="#informasi">Informasi</a>
    </nav>

    <section class="umkm-profile-section" id="penawaran">
      <div class="umkm-profile-section-head">
        <div><span>PENAWARAN</span><h2>{kategori.penawaran}</h2><p>Informasi yang tersedia dari pemilik usaha, disusun agar mudah dibandingkan dan dipahami.</p></div>
      </div>

      {#if penawaran.length}
        <div class="umkm-profile-offers">
          {#each penawaran as item}
            <article>
              <span class="number">{String(item.nomor).padStart(2, "0")}</span>
              <div><h3>{item.nama}</h3><p>{item.deskripsi}</p>{#if item.harga}<strong>{item.harga}</strong>{/if}</div>
            </article>
          {/each}
        </div>
      {:else}
        <div class="umkm-profile-empty-section">Rincian produk atau layanan belum ditambahkan oleh pemilik usaha.</div>
      {/if}
    </section>

    <div class="umkm-profile-content-grid">
      <main>
        <section class="umkm-profile-section" id="tentang">
          <div class="umkm-profile-section-head"><div><span>TENTANG USAHA</span><h2>Kenali {u.nama}</h2></div></div>
          <p class="umkm-profile-about">{deskripsiPemilik(u)}</p>
        </section>

        <section class="umkm-profile-section">
          <div class="umkm-profile-section-head"><div><span>INFORMASI FAKTUAL</span><h2>Kenapa profil ini mudah dipercaya?</h2><p>Kami hanya menampilkan keunggulan yang dapat diturunkan dari data usaha yang benar-benar tersedia.</p></div></div>
          <div class="umkm-profile-benefits">
            {#each unggulan as item}
              <article><span>{item.ikon}</span><div><h3>{item.judul}</h3><p>{item.teks}</p></div></article>
            {/each}
          </div>
        </section>

        {#if galeri.length > 1}
          <section class="umkm-profile-section" id="galeri">
            <div class="umkm-profile-section-head"><div><span>GALERI</span><h2>Lihat usaha lebih dekat</h2><p>Foto yang tersedia membantu warga memahami produk, hasil, proses, atau lokasi usaha.</p></div></div>
            <div class="umkm-profile-gallery-grid">
              {#each galeri.slice(0, 6) as foto, i}<button type="button" onclick={() => { mediaAktif = i; document.querySelector('.umkm-profile-cover')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}><img src={foto} alt={`Foto ${u.nama} ${i + 1}`} /></button>{/each}
            </div>
          </section>
        {/if}

        {#if u.promo}
          <section class="umkm-profile-promo" id="promo">
            <span>PROMO AKTIF</span><div><h2>{u.promo}</h2><p>Konfirmasi syarat, ketersediaan, dan masa berlaku promo langsung kepada pemilik usaha sebelum memesan.</p></div>{#if wa}<a href={wa} target="_blank" rel="noopener noreferrer">Tanya promo →</a>{/if}
          </section>
        {/if}
      </main>

      <aside class="umkm-profile-side" id="informasi">
        <section>
          <span class="eyebrow">INFORMASI USAHA</span>
          <h2>Ringkas dan transparan</h2>
          <dl>
            <div><dt>Kategori</dt><dd>{u.katLabel || "Usaha warga"}</dd></div>
            {#if harga.length}<div><dt>Kisaran harga</dt><dd>{teksHarga(harga)}</dd></div>{/if}
            {#if u.jam}<div><dt>Jam operasional</dt><dd>{u.jam}</dd></div>{/if}
            {#if u.alamat}<div><dt>Lokasi</dt><dd>{u.alamat}</dd></div>{/if}
            {#if u.wa}<div><dt>WhatsApp</dt><dd>{u.wa}</dd></div>{/if}
          </dl>
        </section>

        <section class="umkm-profile-how">
          <span class="eyebrow">CARA MENGHUBUNGI</span>
          <h2>Dari lihat sampai konfirmasi</h2>
          <ol>
            <li><b>1</b><span>Lihat rincian {kategori.benda} yang tersedia.</span></li>
            <li><b>2</b><span>Hubungi pemilik untuk menanyakan kebutuhan, harga, dan ketersediaan.</span></li>
            <li><b>3</b><span>Konfirmasi detail transaksi langsung dengan pemilik sebelum melanjutkan.</span></li>
          </ol>
          {#if wa}<a class="side-wa" href={wa} target="_blank" rel="noopener noreferrer">Buka WhatsApp →</a>{/if}
        </section>
      </aside>
    </div>

    {#if terkait.length}
      <section class="umkm-profile-related">
        <div class="umkm-profile-section-head"><div><span>DIREKTORI WARGA</span><h2>UMKM lainnya</h2><p>Temukan usaha warga lain di RW 02 Sukatani.</p></div><a href="#/umkm">Lihat semua →</a></div>
        <div class="umkm-profile-related-grid">
          {#each terkait as item}
            <a href={`#/umkm/${item.id}`}>
              {#if fotoUsaha(item)}<img src={fotoUsaha(item)} alt={`Foto ${item.nama}`} />{:else}<span class="placeholder">UMKM</span>{/if}
              <div><strong>{item.nama}</strong><small>{item.katLabel || "Usaha warga"}</small></div>
            </a>
          {/each}
        </div>
      </section>
    {/if}

    <p class="umkm-profile-disclaimer">Informasi produk, layanan, harga, promo, jam operasional, lokasi, dan kontak mengikuti data yang diberikan pemilik atau pengelola usaha. Konfirmasi detail terbaru langsung kepada pemilik sebelum bertransaksi.</p>
  </div>
{/if}
