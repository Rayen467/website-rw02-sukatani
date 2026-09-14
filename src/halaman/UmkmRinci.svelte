<script>
  import { KOLEKSI } from "../inti/nama.js";
  import { isi } from "../keadaan/isi.svelte.js";
  import { ambilDokumen } from "../sumber/data.js";
  import { DEMO_TERKAIT, terapkanDemoUmkm } from "../data/umkm-demo.js";
  import TidakAda from "./TidakAda.svelte";

  let { kunci } = $props();

  const uAsli = $derived((isi.usaha || []).find((x) => x.id === kunci));
  const u = $derived(uAsli ? terapkanDemoUmkm(kunci, uAsli) : null);

  let penuh = $state("");
  let mediaAktif = $state(0);
  let disimpan = $state(false);

  $effect(() => {
    const id = kunci;
    penuh = "";
    mediaAktif = 0;
    if (!id || !uAsli) return;
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

  function pindahMedia(arah) {
    if (!galeri.length) return;
    mediaAktif = (mediaAktif + arah + galeri.length) % galeri.length;
  }

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

  function formatRupiah(angka) {
    return `Rp${new Intl.NumberFormat("id-ID").format(angka)}`;
  }

  function teksHarga(nilai) {
    if (!nilai?.length) return "";
    if (nilai.length === 1) return formatRupiah(nilai[0]);
    return `${formatRupiah(Math.min(...nilai))} – ${formatRupiah(Math.max(...nilai))}`;
  }

  const harga = $derived(rentangHarga(u));

  function profilKategori(usaha) {
    const kat = String(usaha?.kat || "").toLowerCase();
    if (kat === "siapsaji") return { penawaran: "Menu & Harga", andalan: "Menu Andalan", benda: "menu" };
    if (kat === "kemasan") return { penawaran: "Produk & Varian", andalan: "Produk Unggulan", benda: "produk" };
    if (kat === "retail") return { penawaran: "Produk & Ketersediaan", andalan: "Produk Pilihan", benda: "produk" };
    if (kat === "jasa") return { penawaran: "Layanan & Harga", andalan: "Layanan Pilihan", benda: "layanan" };
    return { penawaran: "Produk & Layanan", andalan: "Pilihan Utama", benda: "penawaran" };
  }

  const kategori = $derived(profilKategori(u));

  function ringkasanHero(usaha) {
    if (!usaha) return "";
    if (usaha.ringkas) return teksBersih(usaha.ringkas);
    const lokasi = usaha.alamat ? ` di ${teksBersih(usaha.alamat)}` : "";
    const hargaTeks = teksHarga(rentangHarga(usaha));
    const hargaKalimat = hargaTeks ? ` Kisaran harga yang tercantum ${hargaTeks}.` : "";
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
        if (typeof item === "string") return { nama: item, deskripsi: "", harga: "", nomor: i + 1, foto: "", label: "" };
        const hMin = angkaHarga(item.hargaMulai || item.harga || item.hargaMin);
        const hMax = angkaHarga(item.hargaMax || item.hargaMaks);
        const rentang = [hMin, hMax].filter(Boolean);
        return {
          nama: item.nama || item.judul || `${kategori.benda} ${i + 1}`,
          deskripsi: item.deskripsi || item.keterangan || "",
          harga: item.hargaLabel || teksHarga(rentang),
          nomor: i + 1,
          foto: urlGambar(item.foto || item.gambar),
          label: item.label || ""
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
      nomor: i + 1,
      foto: "",
      label: ""
    }));
  }

  const penawaran = $derived(daftarPenawaran(u));

  function keunggulanFaktual(usaha) {
    if (!usaha) return [];
    if (Array.isArray(usaha.keunggulanDemo) && usaha.keunggulanDemo.length) {
      const deskripsi = [
        "Sepatu tampak lebih terawat setelah proses pencucian.",
        "Biaya menyesuaikan kondisi dan kebutuhan perawatan.",
        "Proses dikomunikasikan lebih dulu dengan pemilik.",
        "Mendukung layanan dan ekonomi lingkungan sekitar."
      ];
      return usaha.keunggulanDemo.slice(0, 4).map((teks, i) => ({
        ikon: ["✦", "◷", "✓", "RW"][i] || "✓",
        judul: teks,
        teks: deskripsi[i] || "Informasi tersedia untuk membantu warga memahami layanan."
      }));
    }

    const hasil = [{ ikon: "RW", judul: "Usaha warga RW 02", teks: "Tercantum di Direktori UMKM RW 02 Sukatani." }];
    if (usaha.wa) hasil.push({ ikon: "WA", judul: "Kontak langsung", teks: "Pertanyaan dan pemesanan dapat dikonfirmasi langsung melalui WhatsApp." });
    if (usaha.alamat) hasil.push({ ikon: "⌖", judul: "Lokasi tercantum", teks: "Informasi lokasi usaha tersedia untuk membantu warga menemukan layanan." });
    if (usaha.jam) hasil.push({ ikon: "◷", judul: "Jam layanan tersedia", teks: `Jam operasional yang dicantumkan: ${usaha.jam}.` });
    if (rentangHarga(usaha).length) hasil.push({ ikon: "Rp", judul: "Informasi harga tersedia", teks: `Kisaran harga yang tercantum ${teksHarga(rentangHarga(usaha))}.` });
    return hasil.slice(0, 4);
  }

  const unggulan = $derived(keunggulanFaktual(u));
  const highlight = $derived(Array.isArray(u?.highlightDemo) && u.highlightDemo.length ? u.highlightDemo.slice(0, 6) : unggulan.map((x) => x.judul));
  const testimoni = $derived(u?.testimoni || u?.testimoniDemo || null);
  const sosial = $derived(Array.isArray(u?.sosialMedia) && u.sosialMedia.length ? u.sosialMedia : (Array.isArray(u?.sosialMediaDemo) ? u.sosialMediaDemo : []));
  const wa = $derived(tautanWa(u));
  const peta = $derived(u?.alamat ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(u.alamat)}` : "");

  const terkait = $derived.by(() => {
    if (!u) return [];
    const semua = isi.usaha || [];
    const serupa = semua.filter((x) => x.id !== u.id && (x.kat === u.kat || x.katLabel === u.katLabel));
    const lain = semua.filter((x) => x.id !== u.id && !serupa.includes(x));
    const real = [...serupa, ...lain].slice(0, 4);
    if (real.length >= 4 || !u.__demoAktif) return real;
    const filler = DEMO_TERKAIT.filter((x) => !real.some((r) => r.nama === x.nama)).slice(0, 4 - real.length);
    return [...real, ...filler];
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
      <a href="#/">Beranda</a><span>›</span><a href="#/umkm">UMKM</a><span>›</span><span>{u.katLabel || "UMKM"}</span><span>›</span><strong>{u.nama}</strong>
    </nav>

    <div class="umkm-profile-toolbar">
      <div>{#if u.__demoAktif}<span class="umkm-profile-demo">MODE CONTOH · data kosong diisi dummy</span>{/if}</div>
      <div class="umkm-profile-toolbar-actions">
        <button type="button" onclick={bagikan}>↗ Bagikan</button>
        <button type="button" class:aktif={disimpan} onclick={() => (disimpan = !disimpan)}>{disimpan ? "✓ Disimpan" : "♡ Simpan"}</button>
      </div>
    </div>

    <section class="umkm-profile-hero">
      <div class="umkm-profile-gallery">
        <div class="umkm-profile-cover">
          {#if gambarAktif}
            <img src={gambarAktif} alt={`Foto ${u.nama}`} />
            {#if u.heroQuote}<div class="umkm-profile-cover-copy">{u.heroQuote}</div>{/if}
            {#if galeri.length > 1}
              <button class="media-arrow prev" type="button" onclick={() => pindahMedia(-1)} aria-label="Foto sebelumnya">‹</button>
              <button class="media-arrow next" type="button" onclick={() => pindahMedia(1)} aria-label="Foto berikutnya">›</button>
            {/if}
          {:else}
            <div class="umkm-profile-empty-photo">
              <span>UMKM RW 02</span>
              <strong>Foto usaha belum tersedia</strong>
              <small>Foto akan tampil setelah ditambahkan pengelola.</small>
            </div>
          {/if}
          {#if galeri.length > 1}<span class="umkm-profile-count">◉ {mediaAktif + 1} / {galeri.length}</span>{/if}
        </div>

        {#if galeri.length > 1}
          <div class="umkm-profile-thumbs" aria-label="Galeri foto">
            {#each galeri.slice(0, 5) as foto, i}
              <button type="button" class:aktif={i === mediaAktif} onclick={() => (mediaAktif = i)} aria-label={`Lihat foto ${i + 1}`}>
                <img src={foto} alt="" />
                {#if i === 4 && galeri.length > 5}<span class="thumb-more">+{galeri.length - 5}<small>Foto lainnya</small></span>{/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <div class="umkm-profile-summary">
        <div class="umkm-profile-badges">
          <span class="kategori">{u.katLabel || "Usaha warga"}</span>
          {#if u.terverifikasi === true || u.verifikasi === "aktif"}<span class="verified">✓ Terverifikasi RW 02</span>{/if}
        </div>

        <h1>{u.nama}</h1>
        {#if u.tagline}<h2 class="umkm-profile-headline">{u.tagline}</h2>{/if}
        <p class="umkm-profile-tagline">{ringkasanHero(u)}</p>

        <div class="umkm-profile-proof">
          {#each highlight as item, i}
            <span><b>{["◉", "♬", "◇", "□", "◎", "✦"][i] || "✓"}</b>{item}</span>
          {/each}
        </div>

        {#if u.ratingDemo || u.rating}
          <div class="umkm-profile-rating"><b>★</b><strong>{u.rating || u.ratingDemo}</strong><span>({u.jumlahUlasan || u.jumlahUlasanDemo || 0} ulasan warga)</span></div>
        {/if}

        <div class="umkm-profile-price">
          <small>{harga.length ? "Mulai dari" : "Informasi harga"}</small>
          <strong>{harga.length ? teksHarga(harga) : "Belum dicantumkan"}</strong>
          <span>{harga.length ? "Menyesuaikan jenis, merek, kondisi, atau pilihan layanan." : "Hubungi pemilik untuk informasi harga terbaru."}</span>
        </div>

        <div class="umkm-profile-actions">
          {#if wa}<a class="primary" href={wa} target="_blank" rel="noopener noreferrer">◉ Pesan via WhatsApp</a>{/if}
          <a class="secondary" href="#penawaran">☷ Lihat {kategori.benda === "menu" ? "Menu" : kategori.benda === "layanan" ? "Layanan" : "Pilihan"}</a>
        </div>
      </div>

      <aside class="umkm-profile-utility" aria-label="Informasi usaha">
        <div class="umkm-profile-status">
          <span class="dot"></span><strong>{u.bukaStatus || "Informasi operasional"}</strong>{#if u.tutupInfo}<small>{u.tutupInfo}</small>{/if}
        </div>

        <div class="umkm-profile-facts">
          {#if u.jam}<div><span class="fact-icon">◷</span><div><small>Jam operasional</small><strong>{u.jam}</strong></div></div>{/if}
          {#if u.alamat}<div><span class="fact-icon">⌖</span><div><small>Lokasi</small><strong>{u.alamat}</strong>{#if peta}<a href={peta} target="_blank" rel="noopener noreferrer">Lihat di Google Maps →</a>{/if}</div></div>{/if}
          {#if u.wa}<div><span class="fact-icon">⌕</span><div><small>Kontak</small><strong>{u.wa}</strong></div></div>{/if}
          {#if sosial.length}<div><span class="fact-icon">♧</span><div><small>Media sosial</small><p class="social-row">{#each sosial as item}<span>{item}</span>{/each}</p></div></div>{/if}
          {#if Array.isArray(u.metodePembayaran) && u.metodePembayaran.length}
            <div class="payment-fact"><span class="fact-icon">▣</span><div><small>Metode pembayaran</small><p class="payment-row">{#each u.metodePembayaran as item}<span>{item}</span>{/each}</p></div></div>
          {/if}
        </div>

        <div class="umkm-profile-local-note">
          <span>♧</span>
          <div><p>Dengan menggunakan UMKM lokal, Anda ikut mendukung ekonomi warga RW 02.</p></div>
        </div>
      </aside>
    </section>

    <nav class="umkm-profile-section-nav" aria-label="Navigasi isi profil">
      <a href="#penawaran">{kategori.penawaran}</a>
      <a href="#tentang">Tentang</a>
      {#if galeri.length > 1}<a href="#galeri">Galeri</a>{/if}
      {#if u.promo}<a href="#promo">Promo</a>{/if}
      {#if testimoni}<a href="#ulasan">Ulasan</a>{/if}
      {#if Array.isArray(u.faq) && u.faq.length}<a href="#faq">FAQ</a>{/if}
    </nav>

    <section class="umkm-profile-section offer-shell" id="penawaran">
      <div class="umkm-profile-section-head">
        <div><h2>{kategori.andalan}</h2><p>Pilihan yang paling membantu warga memahami produk atau layanan utama usaha ini.</p></div>
        <a href="#tentang">Lihat semua {kategori.benda} →</a>
      </div>

      <div class="umkm-profile-offer-layout">
        <div>
          {#if penawaran.length}
            <div class="umkm-profile-offers">
              {#each penawaran.slice(0, 4) as item}
                <article>
                  <div class="offer-media">
                    {#if item.foto}<img class="offer-photo" src={item.foto} alt="" />{:else}<span class="number">{String(item.nomor).padStart(2, "0")}</span>{/if}
                    {#if item.label}<span class="offer-label">{item.label}</span>{/if}
                  </div>
                  <div class="offer-body"><h3>{item.nama}</h3><p>{item.deskripsi}</p>{#if item.harga}<strong>{item.harga}</strong>{/if}<button type="button" aria-label={`Pilih ${item.nama}`}>+</button></div>
                </article>
              {/each}
            </div>
          {:else}
            <div class="umkm-profile-empty-section">Rincian produk atau layanan belum ditambahkan oleh pemilik usaha.</div>
          {/if}
        </div>

        {#if u.promo}
          <aside class="umkm-profile-promo-card" id="promo">
            <span>✦ PROMO {u.__demoAktif ? "CONTOH" : "AKTIF"}</span>
            <h3>{u.promo}</h3>
            <p>{u.promoKeterangan || "Konfirmasi syarat dan masa berlaku promo langsung kepada pemilik usaha."}</p>
            {#if wa}<a href={wa} target="_blank" rel="noopener noreferrer">Pesan Sekarang →</a>{/if}
          </aside>
        {/if}
      </div>
    </section>

    <section class="umkm-profile-story-grid" id="tentang">
      <article>
        <h2>Tentang {u.nama}</h2>
        <p>{deskripsiPemilik(u)}</p>
        <a class="story-link" href="#galeri">Baca cerita lengkap</a>
      </article>

      <article>
        <h2>Keunggulan Kami</h2>
        <ul>
          {#each unggulan as item}<li><b>✓</b><div><strong>{item.judul}</strong><small>{item.teks}</small></div></li>{/each}
        </ul>
      </article>

      <article>
        <h2>Cara Pemesanan</h2>
        <ol>
          {#each (Array.isArray(u.caraPesan) ? u.caraPesan : ["Lihat rincian yang tersedia", "Hubungi pemilik", "Konfirmasi harga dan kebutuhan", "Lanjutkan transaksi sesuai kesepakatan"]) as langkah, i}
            <li><b>{i + 1}</b><span>{langkah}</span></li>
          {/each}
        </ol>
      </article>
    </section>

    {#if galeri.length > 1}
      <section class="umkm-profile-section gallery-shell" id="galeri">
        <div class="umkm-profile-section-head"><div><h2>Galeri</h2><p>Lihat produk, proses, hasil, atau suasana usaha.</p></div><a href="#galeri">Lihat semua foto →</a></div>
        <div class="umkm-profile-gallery-layout">
          <div class="umkm-profile-gallery-strip">
            {#each galeri.slice(0, 5) as foto, i}
              <button type="button" onclick={() => { mediaAktif = i; document.querySelector('.umkm-profile-cover')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}><img src={foto} alt={`Foto ${u.nama} ${i + 1}`} /></button>
            {/each}
          </div>
          {#if testimoni}
            <aside class="umkm-profile-testimonial" id="ulasan">
              <span class="quote">“</span>
              <p>{testimoni.isi}</p>
              <strong>— {testimoni.nama}</strong>
              <small>{testimoni.keterangan || "Warga RW 02"}</small>
            </aside>
          {/if}
        </div>
      </section>
    {/if}

    {#if Array.isArray(u.faq) && u.faq.length}
      <section class="umkm-profile-section umkm-profile-faq" id="faq">
        <div class="umkm-profile-section-head"><div><h2>FAQ singkat</h2><p>Pertanyaan yang membantu warga memahami layanan sebelum menghubungi pemilik.</p></div></div>
        <div class="faq-grid">
          {#each u.faq as item}<details><summary>{item.tanya}</summary><p>{item.jawab}</p></details>{/each}
        </div>
      </section>
    {/if}

    {#if terkait.length}
      <section class="umkm-profile-related">
        <div class="umkm-profile-section-head"><div><h2>UMKM Lainnya di Kategori {u.katLabel || "Usaha Warga"}</h2><p>Temukan pilihan usaha warga lainnya di Sukatani.</p></div><a href="#/umkm">Lihat semua →</a></div>
        <div class="umkm-profile-related-grid">
          {#each terkait as item}
            <a href={item.demo ? "#/umkm" : `#/umkm/${item.id}`}>
              {#if fotoUsaha(item)}<img src={fotoUsaha(item)} alt={`Foto ${item.nama}`} />{:else}<span class="placeholder">UMKM</span>{/if}
              <div><strong>{item.nama}</strong><small>{item.katLabel || "Usaha warga"}{item.demo ? " · contoh" : ""}</small></div>
            </a>
          {/each}
        </div>
      </section>
    {/if}

    <p class="umkm-profile-disclaimer">{u.__demoAktif ? "MODE CONTOH aktif: sebagian field kosong diisi data dummy hanya untuk mengecek desain. " : ""}Informasi resmi tetap mengikuti data pemilik atau pengelola usaha dan perlu dikonfirmasi sebelum transaksi.</p>
  </div>
{/if}
