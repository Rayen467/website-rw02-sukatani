<script>
  import { KOLEKSI } from "../inti/nama.js";
  import { isi } from "../keadaan/isi.svelte.js";
  import { ambilDokumen } from "../sumber/data.js";
  import TidakAda from "./TidakAda.svelte";
  import Belum from "../komponen/Belum.svelte";

  let { kunci } = $props();
  const u = $derived((isi.usaha || []).find((x) => x.id === kunci));

  /* Foto ukuran penuh hanya diambil ketika halaman rincian dibuka agar katalog
     tetap ringan. Selama menunggu, sampul kecil tetap dipakai sebagai fallback. */
  let penuh = $state("");

  $effect(() => {
    const id = kunci;
    penuh = "";
    if (!id || !u) return;
    let batal = false;
    ambilDokumen(KOLEKSI.USAHA_FOTO, id)
      .then((d) => {
        if (!batal && d && d.foto) penuh = d.foto;
      })
      .catch(() => {});
    return () => (batal = true);
  });

  const gambar = $derived(penuh || (u && (u.sampul || u.foto)) || "");

  function nomorWa(nomor) {
    const n = String(nomor || "").replace(/[^0-9]/g, "").replace(/^0/, "62");
    return n;
  }

  function tautanWa(usaha) {
    const n = nomorWa(usaha?.wa);
    if (!n) return "";
    const pesan = `Halo, saya melihat ${usaha.nama} di Direktori UMKM RW 02 Sukatani. Saya ingin bertanya tentang produk atau layanan yang tersedia.`;
    return `https://wa.me/${n}?text=${encodeURIComponent(pesan)}`;
  }

  function profilKategori(usaha) {
    const kat = String(usaha?.kat || "").toLowerCase();
    if (kat === "siapsaji") {
      return {
        sorotan: "Pilihan kuliner lokal yang lebih dekat untuk kebutuhan warga.",
        cocok: ["Kebutuhan makan harian", "Pesanan keluarga", "Kegiatan lingkungan"]
      };
    }
    if (kat === "kemasan") {
      return {
        sorotan: "Produk rumahan yang praktis untuk dinikmati, disimpan, atau dibagikan.",
        cocok: ["Camilan dan kebutuhan rumahan", "Oleh-oleh sederhana", "Belanja produk lokal"]
      };
    }
    if (kat === "jasa") {
      return {
        sorotan: "Layanan warga yang membantu kebutuhan sehari-hari secara lebih praktis.",
        cocok: ["Kebutuhan rumah tangga", "Layanan praktis warga", "Pekerjaan yang butuh bantuan langsung"]
      };
    }
    if (kat === "retail") {
      return {
        sorotan: "Pilihan belanja dekat rumah untuk kebutuhan warga sehari-hari.",
        cocok: ["Belanja kebutuhan harian", "Kebutuhan mendadak", "Pembelian dekat rumah"]
      };
    }
    return {
      sorotan: "Usaha lokal RW 02 yang hadir untuk melayani kebutuhan warga sekitar.",
      cocok: ["Warga sekitar", "Kebutuhan sehari-hari", "Dukungan usaha lokal"]
    };
  }

  function daftarProduk(usaha) {
    const sumber = String(usaha?.panjang || usaha?.ringkas || "").trim();
    if (!sumber) return [];
    const pecah = sumber
      .split(/\n|;|•/)
      .map((x) => x.replace(/^[-–—]\s*/, "").trim())
      .filter(Boolean);
    return (pecah.length > 1 ? pecah : [sumber]).slice(0, 6);
  }

  function keunggulan(usaha) {
    const hasil = [
      {
        ikon: "⌂",
        judul: "Usaha lokal RW 02",
        teks: "Lebih dekat dijangkau warga Permai Sukatani dan ikut menggerakkan ekonomi lingkungan."
      }
    ];

    if (usaha?.wa) {
      hasil.push({
        ikon: "✆",
        judul: "Komunikasi langsung",
        teks: "Warga dapat bertanya atau memesan langsung kepada pemilik melalui WhatsApp."
      });
    }
    if (usaha?.jam) {
      hasil.push({
        ikon: "◷",
        judul: "Jam layanan jelas",
        teks: `Informasi operasional tercantum: ${usaha.jam}.`
      });
    }
    if (usaha?.alamat) {
      hasil.push({
        ikon: "⌖",
        judul: "Lokasi tercantum",
        teks: `Lokasi usaha dicantumkan di kawasan: ${usaha.alamat}.`
      });
    }

    if (hasil.length < 3) {
      hasil.push({
        ikon: "♡",
        judul: "Dukung tetangga sendiri",
        teks: "Memilih usaha warga membantu perputaran ekonomi tetap tumbuh di lingkungan RW 02."
      });
    }
    return hasil.slice(0, 4);
  }

  function deskripsiPromosi(usaha) {
    if (usaha?.ringkas) return usaha.ringkas;
    const kategori = usaha?.katLabel || "usaha warga";
    return `${usaha?.nama || "Usaha ini"} merupakan ${kategori.toLowerCase()} di RW 02 Sukatani yang dapat menjadi pilihan untuk kebutuhan warga sekitar.`;
  }

  const promosi = $derived(u ? profilKategori(u) : null);
  const produk = $derived(u ? daftarProduk(u) : []);
  const poinUnggul = $derived(u ? keunggulan(u) : []);
  const wa = $derived(u ? tautanWa(u) : "");
</script>

{#if !u}
  <TidakAda />
{:else}
  <div class="umkm-rinci-modern">
    <nav class="remah umkm-rinci-remah">
      <a href="#/">Beranda</a><span>&rsaquo;</span><a href="#/umkm">Direktori UMKM</a><span>&rsaquo;</span><span>{u.nama}</span>
    </nav>

    <section class="umkm-rinci-hero">
      <div class="umkm-rinci-media">
        {#if gambar}
          <img src={gambar} alt={`Foto ${u.nama}`} />
        {:else}
          <div class="umkm-rinci-foto-kosong" aria-hidden="true">UMKM</div>
        {/if}
        <span class="umkm-rinci-kategori">{u.katLabel || "Usaha warga"}</span>
      </div>

      <div class="umkm-rinci-copy">
        <p class="umkm-rinci-kicker">UMKM WARGA · RW 02 SUKATANI</p>
        <h1>{u.nama}</h1>
        <p class="umkm-rinci-lead">{deskripsiPromosi(u)}</p>
        <p class="umkm-rinci-sorotan">{promosi.sorotan}</p>

        <div class="umkm-rinci-meta">
          {#if u.alamat}<span>⌖ {u.alamat}</span>{/if}
          {#if u.jam}<span>◷ {u.jam}</span>{/if}
          <span>✓ Usaha warga RW 02</span>
        </div>

        <div class="umkm-rinci-aksi">
          {#if wa}
            <a class="umkm-rinci-btn utama" href={wa} target="_blank" rel="noopener noreferrer">Hubungi &amp; Pesan via WhatsApp</a>
          {:else}
            <span class="umkm-rinci-btn nonaktif">Kontak pemesanan belum ditampilkan</span>
          {/if}
          <a class="umkm-rinci-btn sekunder" href="#/umkm">Lihat UMKM lainnya</a>
        </div>
      </div>
    </section>

    <section class="umkm-rinci-promo">
      <div>
        <span class="umkm-rinci-label">KENAPA MENARIK?</span>
        <h2>Kenali usaha sebelum memesan</h2>
      </div>
      <p>Halaman ini merangkum apa yang ditawarkan, keunggulan praktis, lokasi, jam layanan, dan cara menghubungi pemilik agar warga tidak perlu menebak-nebak.</p>
    </section>

    <div class="umkm-rinci-layout">
      <main class="umkm-rinci-utama">
        <section class="umkm-rinci-panel">
          <span class="umkm-rinci-label">TENTANG USAHA</span>
          <h2>{u.nama} itu apa?</h2>
          <p class="umkm-rinci-paragraf">
            {u.panjang || deskripsiPromosi(u)}
          </p>
        </section>

        {#if produk.length}
          <section class="umkm-rinci-panel">
            <span class="umkm-rinci-label">PRODUK &amp; LAYANAN</span>
            <h2>Apa yang ditawarkan?</h2>
            <div class="umkm-rinci-produk">
              {#each produk as item, i}
                <div><span>{String(i + 1).padStart(2, "0")}</span><p>{item}</p></div>
              {/each}
            </div>
          </section>
        {/if}

        <section class="umkm-rinci-panel">
          <span class="umkm-rinci-label">KEUNGGULAN</span>
          <h2>Kenapa layak dipertimbangkan warga?</h2>
          <div class="umkm-rinci-unggul-grid">
            {#each poinUnggul as item}
              <article>
                <span class="ikon">{item.ikon}</span>
                <div><h3>{item.judul}</h3><p>{item.teks}</p></div>
              </article>
            {/each}
          </div>
        </section>

        <section class="umkm-rinci-panel">
          <span class="umkm-rinci-label">COCOK UNTUK</span>
          <h2>Pilihan yang relevan untuk kebutuhan berikut</h2>
          <div class="umkm-rinci-cocok">
            {#each promosi.cocok as item}<span>✓ {item}</span>{/each}
          </div>
        </section>

        <section class="umkm-rinci-panel umkm-rinci-promosi-usaha">
          <div>
            <span class="umkm-rinci-label">PROMOSI USAHA</span>
            <h2>Dukung UMKM warga, belanja lebih dekat</h2>
            <p>{deskripsiPromosi(u)} {promosi.sorotan}</p>
          </div>
          {#if u.promo}
            <div class="umkm-rinci-promo-badge"><small>PENAWARAN</small><strong>{u.promo}</strong></div>
          {:else}
            <div class="umkm-rinci-promo-badge tenang"><small>INFO PROMO</small><strong>Tanyakan penawaran terbaru langsung ke pemilik.</strong></div>
          {/if}
        </section>
      </main>

      <aside class="umkm-rinci-sisi">
        <section class="umkm-rinci-panel umkm-rinci-info">
          <span class="umkm-rinci-label">INFORMASI USAHA</span>
          <h2>Ringkas &amp; jelas</h2>
          <dl>
            <div><dt>Jenis usaha</dt><dd>{u.katLabel || "Usaha warga"}</dd></div>
            <div><dt>Jam buka</dt><dd><Belum nilai={u.jam} /></dd></div>
            <div><dt>Lokasi</dt><dd><Belum nilai={u.alamat} /></dd></div>
            <div><dt>WhatsApp</dt><dd><Belum nilai={u.wa} /></dd></div>
          </dl>
        </section>

        <section class="umkm-rinci-panel umkm-rinci-cta">
          <span class="umkm-rinci-label">PESAN / TANYA</span>
          <h2>Butuh informasi lebih lanjut?</h2>
          <p>Tanyakan stok, harga, pilihan produk, waktu pengerjaan, atau detail pesanan langsung kepada pemilik usaha.</p>
          {#if wa}
            <a class="umkm-rinci-btn utama penuh" href={wa} target="_blank" rel="noopener noreferrer">Buka WhatsApp</a>
          {:else}
            <p class="umkm-rinci-catatan">Nomor pemesanan belum ditampilkan oleh pemilik usaha.</p>
          {/if}
        </section>

        <section class="umkm-rinci-panel umkm-rinci-dukungan">
          <span class="umkm-rinci-label">BELANJA LOKAL</span>
          <h2>Satu transaksi, satu dukungan nyata.</h2>
          <p>Memilih UMKM warga membantu usaha lokal lebih dikenal dan menjaga perputaran ekonomi tetap dekat dengan lingkungan sendiri.</p>
        </section>
      </aside>
    </div>

    <p class="umkm-rinci-disclaimer">Informasi produk, layanan, promo, jam operasional, dan kontak mengikuti data yang diberikan pemilik/pengelola usaha. Konfirmasi detail terbaru langsung kepada pemilik sebelum memesan.</p>
  </div>
{/if}
