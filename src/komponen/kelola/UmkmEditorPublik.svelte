<script>
  import { KOLEKSI } from "../../inti/nama.js";
  import { isi, muatKoleksi } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { ambilDokumen, ubahDokumen, simpanDokumen } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";

  let { usahaId = "" } = $props();

  const MAX_GALERI = 5;
  const KATEGORI = [
    ["jasa", "Jasa"],
    ["siapsaji", "Kuliner / makanan siap saji"],
    ["kemasan", "Produk rumahan / kemasan"],
    ["retail", "Retail / toko"],
    ["lainnya", "Lainnya"]
  ];

  const kosong = () => ({
    nama: "", kat: "jasa", katLabel: "Jasa", heroQuote: "", tagline: "",
    ringkas: "", panjang: "", hargaMulai: "", hargaMaks: "", jam: "",
    bukaStatus: "", tutupInfo: "", wa: "", alamat: "", maps: "",
    instagram: "", tiktok: "", marketplace: "", terverifikasi: false,
    promo: "", promoKeterangan: "", rating: "", jumlahUlasan: "",
    sampul: "", demoAktif: true,
    layanan: [], highlight: [], keunggulan: [], caraPesan: [],
    metodePembayaran: [], faq: [], testimoni: { isi: "", nama: "", keterangan: "" }
  });

  let form = $state(kosong());
  let media = $state({ cover: "", galeri: [] });
  let thumbBaru = $state("");
  let memuat = $state(false);
  let menyimpan = $state(false);
  let prosesFoto = $state(false);
  let generasi = 0;

  const usaha = $derived((isi.usaha || []).find((x) => x.id === usahaId) || null);

  function json(nilai, fallback) {
    if (Array.isArray(nilai) || (nilai && typeof nilai === "object")) return nilai;
    if (!nilai) return fallback;
    try { return JSON.parse(String(nilai)); } catch { return fallback; }
  }

  function daftarTeks(nilai) {
    if (Array.isArray(nilai)) return nilai.map((x) => String(x || "").trim()).filter(Boolean);
    return String(nilai || "").split(/\n|;/).map((x) => x.trim()).filter(Boolean);
  }

  function muatForm(u) {
    const sosial = json(u.sosialMediaJson, []);
    const cariSosial = (nama) => sosial.find((x) => typeof x === "object" && String(x.nama || "").toLowerCase() === nama)?.url || "";
    form = {
      ...kosong(),
      nama: u.nama || "",
      kat: u.kat || "jasa",
      katLabel: u.katLabel || "Jasa",
      heroQuote: u.heroQuote || "",
      tagline: u.tagline || "",
      ringkas: u.ringkas || "",
      panjang: u.panjang || "",
      hargaMulai: u.hargaMulai || u.hargaMin || "",
      hargaMaks: u.hargaMaks || u.hargaMax || "",
      jam: u.jam || "",
      bukaStatus: u.bukaStatus || "",
      tutupInfo: u.tutupInfo || "",
      wa: u.wa || "",
      alamat: u.alamat || "",
      maps: u.maps || "",
      instagram: u.instagram || cariSosial("instagram"),
      tiktok: u.tiktok || cariSosial("tiktok"),
      marketplace: u.marketplace || "",
      terverifikasi: u.terverifikasi === true || u.terverifikasi === "true" || u.verifikasi === "aktif",
      promo: u.promo || "",
      promoKeterangan: u.promoKeterangan || "",
      rating: u.rating || "",
      jumlahUlasan: u.jumlahUlasan || "",
      sampul: u.sampul || "",
      demoAktif: u.demoMatikan !== "true",
      layanan: json(u.layananJson, Array.isArray(u.layanan) ? u.layanan : []),
      highlight: json(u.highlightJson, Array.isArray(u.highlight) ? u.highlight : []),
      keunggulan: json(u.keunggulanJson, Array.isArray(u.keunggulan) ? u.keunggulan : []),
      caraPesan: json(u.caraPesanJson, Array.isArray(u.caraPesan) ? u.caraPesan : []),
      metodePembayaran: json(u.metodePembayaranJson, Array.isArray(u.metodePembayaran) ? u.metodePembayaran : []),
      faq: json(u.faqJson, Array.isArray(u.faq) ? u.faq : []),
      testimoni: json(u.testimoniJson, u.testimoni || { isi: "", nama: "", keterangan: "" })
    };
    form.layanan = Array.isArray(form.layanan) ? form.layanan : [];
    form.highlight = daftarTeks(form.highlight);
    form.caraPesan = daftarTeks(form.caraPesan);
    form.metodePembayaran = daftarTeks(form.metodePembayaran);
    form.keunggulan = Array.isArray(form.keunggulan) ? form.keunggulan : [];
    form.faq = Array.isArray(form.faq) ? form.faq : [];
    if (!form.testimoni || typeof form.testimoni !== "object") form.testimoni = { isi: "", nama: "", keterangan: "" };
  }

  $effect(() => {
    const id = usahaId;
    const u = usaha;
    if (!id || !u) {
      form = kosong();
      media = { cover: "", galeri: [] };
      return;
    }
    const token = ++generasi;
    memuat = true;
    muatForm(u);
    thumbBaru = "";
    ambilDokumen(KOLEKSI.USAHA_FOTO, id)
      .then((d) => {
        if (token !== generasi) return;
        media = {
          cover: d?.foto || "",
          galeri: json(d?.galeriJson, []).filter(Boolean).slice(0, MAX_GALERI)
        };
      })
      .catch(() => {
        if (token === generasi) media = { cover: "", galeri: [] };
      })
      .finally(() => { if (token === generasi) memuat = false; });
  });

  function tambahLayanan() {
    form.layanan.push({ nama: "", deskripsi: "", harga: "", hargaMulai: "", hargaMax: "", label: "", fotoIndex: "" });
  }

  function hapusLayanan(i) { form.layanan.splice(i, 1); }
  function tambahFaq() { form.faq.push({ tanya: "", jawab: "" }); }
  function hapusFaq(i) { form.faq.splice(i, 1); }
  function tambahKeunggulan() { form.keunggulan.push({ judul: "", teks: "", ikon: "✓" }); }
  function hapusKeunggulan(i) { form.keunggulan.splice(i, 1); }

  function ubahDaftar(kunci, nilai) {
    form[kunci] = daftarTeks(nilai);
  }

  async function bacaDataUrl(blob) {
    return await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result || ""));
      r.onerror = () => reject(new Error("Gagal membaca gambar."));
      r.readAsDataURL(blob);
    });
  }

  async function kompres(file, maksDimensi, maksByte, kualitasAwal = 0.84) {
    if (!String(file?.type || "").startsWith("image/")) throw new Error("File harus berupa JPG, PNG, atau WebP.");
    const src = await bacaDataUrl(file);
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Gambar tidak dapat dibaca."));
      i.src = src;
    });
    let skala = Math.min(1, maksDimensi / Math.max(img.width, img.height));
    let kualitas = kualitasAwal;
    let hasil = null;
    for (let langkah = 0; langkah < 10; langkah += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * skala));
      canvas.height = Math.max(1, Math.round(img.height * skala));
      const ctx = canvas.getContext("2d", { alpha: false });
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      hasil = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", kualitas));
      if (hasil && hasil.size <= maksByte) return hasil;
      kualitas = Math.max(.48, kualitas - .07);
      skala *= .88;
    }
    if (!hasil) throw new Error("Gambar gagal dikompresi.");
    return hasil;
  }

  async function pilihCover(file) {
    if (!file) return;
    prosesFoto = true;
    try {
      const [besar, kecil] = await Promise.all([
        kompres(file, 1500, 145 * 1024, .86),
        kompres(file, 520, 30 * 1024, .78)
      ]);
      media.cover = await bacaDataUrl(besar);
      thumbBaru = await bacaDataUrl(kecil);
      beriTahu("Foto utama siap. Tekan Simpan perubahan untuk menerbitkannya.");
    } catch (err) { beriTahu(err?.message || "Foto belum berhasil diproses."); }
    prosesFoto = false;
  }

  async function tambahGaleri(files) {
    const sisa = MAX_GALERI - media.galeri.length;
    const daftar = Array.from(files || []).slice(0, Math.max(0, sisa));
    if (!daftar.length) {
      beriTahu(`Galeri maksimal ${MAX_GALERI} foto tambahan.`);
      return;
    }
    prosesFoto = true;
    let berhasil = 0;
    try {
      for (const file of daftar) {
        const blob = await kompres(file, 1100, 88 * 1024, .82);
        media.galeri.push(await bacaDataUrl(blob));
        berhasil += 1;
      }
      beriTahu(`${berhasil} foto galeri siap. Simpan perubahan untuk menerbitkan.`);
    } catch (err) { beriTahu(err?.message || "Sebagian foto belum berhasil diproses."); }
    prosesFoto = false;
  }

  function hapusFotoGaleri(i) { media.galeri.splice(i, 1); }
  function jadikanCover(i) {
    const foto = media.galeri[i];
    if (!foto) return;
    media.cover = foto;
    beriTahu("Foto galeri dipakai sebagai foto utama. Simpan perubahan untuk menerbitkan.");
  }

  function pilihKategori(e) {
    form.kat = e.currentTarget.value;
    form.katLabel = KATEGORI.find(([nilai]) => nilai === form.kat)?.[1] || "Lainnya";
  }

  function bersihkanObjek(item) {
    const hasil = {};
    for (const [k, v] of Object.entries(item || {})) {
      if (v !== "" && v !== null && v !== undefined) hasil[k] = v;
    }
    return hasil;
  }

  async function simpanSemua() {
    if (!usahaId || !usaha) return;
    if (!form.nama.trim()) { beriTahu("Nama usaha wajib diisi."); return; }
    menyimpan = true;
    try {
      const sosial = [
        form.instagram.trim() ? { nama: "Instagram", url: form.instagram.trim() } : null,
        form.tiktok.trim() ? { nama: "TikTok", url: form.tiktok.trim() } : null,
        form.marketplace.trim() ? { nama: "Marketplace", url: form.marketplace.trim() } : null
      ].filter(Boolean);
      const publik = {
        nama: form.nama.trim(),
        kat: form.kat,
        katLabel: form.katLabel.trim() || "UMKM",
        heroQuote: form.heroQuote.trim(),
        tagline: form.tagline.trim(),
        ringkas: form.ringkas.trim(),
        panjang: form.panjang.trim(),
        hargaMulai: String(form.hargaMulai || "").replace(/[^0-9]/g, ""),
        hargaMaks: String(form.hargaMaks || "").replace(/[^0-9]/g, ""),
        jam: form.jam.trim(),
        bukaStatus: form.bukaStatus.trim(),
        tutupInfo: form.tutupInfo.trim(),
        wa: form.wa.trim(),
        alamat: form.alamat.trim(),
        maps: form.maps.trim(),
        instagram: form.instagram.trim(),
        tiktok: form.tiktok.trim(),
        marketplace: form.marketplace.trim(),
        verifikasi: form.terverifikasi ? "aktif" : "",
        promo: form.promo.trim(),
        promoKeterangan: form.promoKeterangan.trim(),
        rating: String(form.rating || "").trim(),
        jumlahUlasan: String(form.jumlahUlasan || "").replace(/[^0-9]/g, ""),
        sampul: thumbBaru || form.sampul || "",
        demoMatikan: form.demoAktif ? "false" : "true",
        layananJson: JSON.stringify(form.layanan.map(bersihkanObjek).filter((x) => x.nama)),
        highlightJson: JSON.stringify(form.highlight.filter(Boolean).slice(0, 6)),
        keunggulanJson: JSON.stringify(form.keunggulan.map(bersihkanObjek).filter((x) => x.judul).slice(0, 6)),
        caraPesanJson: JSON.stringify(form.caraPesan.filter(Boolean).slice(0, 8)),
        metodePembayaranJson: JSON.stringify(form.metodePembayaran.filter(Boolean).slice(0, 8)),
        sosialMediaJson: JSON.stringify(sosial),
        faqJson: JSON.stringify(form.faq.map(bersihkanObjek).filter((x) => x.tanya && x.jawab).slice(0, 10)),
        testimoniJson: JSON.stringify(bersihkanObjek(form.testimoni))
      };

      await ubahDokumen(KOLEKSI.USAHA, usahaId, publik);
      await simpanDokumen(KOLEKSI.USAHA_FOTO, usahaId, {
        foto: media.cover || "",
        galeriJson: JSON.stringify(media.galeri.slice(0, MAX_GALERI))
      }, false);
      await muatKoleksi(KOLEKSI.USAHA);
      form.sampul = publik.sampul;
      thumbBaru = "";
      beriTahu("Profil publik UMKM, layanan, promo, dan galeri berhasil diperbarui.");
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      menyimpan = false;
    }
  }
</script>

{#if usahaId && usaha}
  <section class="public-editor" aria-label="Editor profil publik UMKM">
    <header class="pe-head">
      <div>
        <span class="pe-kicker">PROFIL PUBLIK · EDITOR UNIVERSAL</span>
        <h3>Isi dashboard = isi halaman UMKM</h3>
        <p>Semua bagian penting yang dilihat warga dikelola dari sini. Tidak perlu mengubah kode: perbarui informasi, layanan, foto, promo, FAQ, lalu simpan dan preview.</p>
      </div>
      <div class="pe-actions top">
        <a class="tombol" href={`#/umkm/${usahaId}`} target="_blank" rel="noreferrer">Preview profil ↗</a>
        <button class="tombol utama" type="button" onclick={simpanSemua} disabled={menyimpan || prosesFoto}>{menyimpan ? "Menyimpan..." : "Simpan perubahan"}</button>
      </div>
    </header>

    {#if memuat}<div class="pe-loading">Memuat media dan profil UMKM...</div>{/if}

    <div class="pe-layout">
      <nav class="pe-index" aria-label="Bagian editor UMKM">
        <a href="#pe-identitas"><b>01</b><span>Identitas & deskripsi</span></a>
        <a href="#pe-media"><b>02</b><span>Foto & galeri</span></a>
        <a href="#pe-penawaran"><b>03</b><span>Produk / layanan</span></a>
        <a href="#pe-keunggulan"><b>04</b><span>Keunggulan</span></a>
        <a href="#pe-promo"><b>05</b><span>Promo</span></a>
        <a href="#pe-operasional"><b>06</b><span>Operasional & kontak</span></a>
        <a href="#pe-pesan"><b>07</b><span>Cara pesan</span></a>
        <a href="#pe-faq"><b>08</b><span>FAQ & ulasan</span></a>
      </nav>

      <div class="pe-main">
        <section class="pe-card" id="pe-identitas">
          <div class="pe-title"><b>01</b><div><h4>Identitas & deskripsi publik</h4><p>Bagian ini mengisi hero, judul, ringkasan, dan penjelasan “Tentang Usaha”.</p></div></div>
          <div class="pe-grid">
            <label><span>Nama usaha *</span><input bind:value={form.nama} /></label>
            <label><span>Kategori sistem</span><select value={form.kat} onchange={pilihKategori}>{#each KATEGORI as k}<option value={k[0]}>{k[1]}</option>{/each}</select></label>
            <label><span>Label kategori</span><input bind:value={form.katLabel} placeholder="Jasa, Kuliner, Retail..." /></label>
            <label><span>Headline di atas foto</span><input bind:value={form.heroQuote} placeholder="Contoh: Langkah lebih bersih, setiap hari" /></label>
            <label class="wide"><span>Tagline</span><input bind:value={form.tagline} placeholder="Satu kalimat nilai utama usaha" /></label>
            <label class="wide"><span>Ringkasan hero</span><textarea bind:value={form.ringkas} maxlength="420" placeholder="Apa yang ditawarkan, untuk siapa, dan kisaran nilai/harga bila relevan."></textarea><small>{form.ringkas.length}/420</small></label>
            <label class="wide"><span>Tentang usaha</span><textarea class="tall" bind:value={form.panjang} maxlength="2400" placeholder="Jelaskan usaha, produk/jasa, proses, target pelanggan, atau cerita singkat yang memang benar."></textarea><small>{form.panjang.length}/2400</small></label>
            <label><span>Harga mulai</span><input inputmode="numeric" bind:value={form.hargaMulai} placeholder="35000" /></label>
            <label><span>Harga maksimum</span><input inputmode="numeric" bind:value={form.hargaMaks} placeholder="50000" /></label>
            <label class="check"><input type="checkbox" bind:checked={form.terverifikasi} /><span>Tandai “Terverifikasi RW 02”</span></label>
            <label class="check"><input type="checkbox" bind:checked={form.demoAktif} /><span>Isi field kosong dengan data contoh sementara</span></label>
          </div>
        </section>

        <section class="pe-card" id="pe-media">
          <div class="pe-title"><b>02</b><div><h4>Foto utama & galeri</h4><p>Foto disimpan terpisah dari katalog agar halaman utama tetap ringan. Maksimal 1 cover + {MAX_GALERI} foto galeri.</p></div></div>
          <div class="media-editor">
            <article class="cover-editor">
              <div class="media-preview cover">
                {#if media.cover}<img src={media.cover} alt="Preview foto utama" />{:else}<span>Belum ada foto utama</span>{/if}
              </div>
              <div class="media-buttons">
                <label class="upload-btn"><input type="file" accept="image/jpeg,image/png,image/webp" onchange={(e) => pilihCover(e.currentTarget.files?.[0])} />Unggah / ganti foto utama</label>
                {#if media.cover}<button type="button" class="tombol" onclick={() => { media.cover = ""; form.sampul = ""; thumbBaru = ""; }}>Hapus foto utama</button>{/if}
              </div>
            </article>
            <article>
              <div class="gallery-head"><strong>Galeri ({media.galeri.length}/{MAX_GALERI})</strong><label class="upload-btn kecil"><input type="file" multiple accept="image/jpeg,image/png,image/webp" onchange={(e) => tambahGaleri(e.currentTarget.files)} />+ Tambah foto</label></div>
              <div class="gallery-editor">
                {#each media.galeri as foto, i}
                  <figure><img src={foto} alt={`Foto galeri ${i + 1}`} /><figcaption><button type="button" onclick={() => jadikanCover(i)}>Jadikan cover</button><button type="button" class="danger" onclick={() => hapusFotoGaleri(i)}>Hapus</button></figcaption></figure>
                {/each}
                {#if !media.galeri.length}<div class="empty">Belum ada foto galeri.</div>{/if}
              </div>
            </article>
          </div>
          {#if prosesFoto}<p class="pe-processing">Memproses dan mengompresi gambar...</p>{/if}
        </section>

        <section class="pe-card" id="pe-penawaran">
          <div class="pe-title row"><div class="pe-title-copy"><b>03</b><div><h4>Produk / layanan & harga</h4><p>Kartu yang muncul pada bagian Menu Andalan, Layanan Pilihan, atau Produk Unggulan.</p></div></div><button type="button" class="tombol" onclick={tambahLayanan}>+ Tambah item</button></div>
          <div class="repeat-list">
            {#each form.layanan as item, i}
              <article class="repeat-card">
                <div class="repeat-no">{String(i + 1).padStart(2, "0")}</div>
                <div class="pe-grid compact">
                  <label><span>Nama</span><input bind:value={item.nama} placeholder="Cuci Reguler" /></label>
                  <label><span>Label</span><input bind:value={item.label} placeholder="Populer / Terlaris (opsional)" /></label>
                  <label class="wide"><span>Deskripsi</span><textarea bind:value={item.deskripsi} placeholder="Jelaskan fungsi/manfaat produk atau layanan."></textarea></label>
                  <label><span>Harga</span><input inputmode="numeric" bind:value={item.harga} placeholder="35000" /></label>
                  <label><span>Harga mulai</span><input inputmode="numeric" bind:value={item.hargaMulai} placeholder="opsional" /></label>
                  <label><span>Harga maksimum</span><input inputmode="numeric" bind:value={item.hargaMax} placeholder="opsional" /></label>
                  <label><span>Foto dari galeri</span><select bind:value={item.fotoIndex}><option value="">Tanpa foto khusus</option>{#each media.galeri as _, gi}<option value={String(gi)}>Foto galeri {gi + 1}</option>{/each}</select></label>
                </div>
                <button type="button" class="icon-delete" onclick={() => hapusLayanan(i)} aria-label={`Hapus item ${i + 1}`}>×</button>
              </article>
            {/each}
            {#if !form.layanan.length}<div class="empty">Belum ada produk/layanan terstruktur. Tambahkan agar halaman detail tidak hanya mengandalkan paragraf.</div>{/if}
          </div>
        </section>

        <section class="pe-card" id="pe-keunggulan">
          <div class="pe-title row"><div class="pe-title-copy"><b>04</b><div><h4>Keunggulan & highlight</h4><p>Gunakan fakta nyata, bukan klaim “terbaik” tanpa bukti.</p></div></div><button type="button" class="tombol" onclick={tambahKeunggulan}>+ Keunggulan</button></div>
          <label class="wide"><span>Highlight singkat — satu per baris, maksimal 6</span><textarea value={form.highlight.join("\n")} oninput={(e) => ubahDaftar("highlight", e.currentTarget.value)} placeholder="Harga terjangkau\nProses rapi\nBerbagai jenis sepatu"></textarea></label>
          <div class="repeat-list mini">
            {#each form.keunggulan as item, i}
              <article class="repeat-card">
                <div class="pe-grid compact">
                  <label><span>Judul</span><input bind:value={item.judul} placeholder="Proses rapi" /></label>
                  <label><span>Ikon pendek</span><input bind:value={item.ikon} maxlength="4" placeholder="✓" /></label>
                  <label class="wide"><span>Penjelasan</span><input bind:value={item.teks} placeholder="Jelaskan keunggulan secara faktual." /></label>
                </div>
                <button type="button" class="icon-delete" onclick={() => hapusKeunggulan(i)} aria-label={`Hapus keunggulan ${i + 1}`}>×</button>
              </article>
            {/each}
          </div>
        </section>

        <section class="pe-card" id="pe-promo">
          <div class="pe-title"><b>05</b><div><h4>Promo</h4><p>Kosongkan judul promo jika tidak ada promo aktif; blok promo otomatis tidak tampil.</p></div></div>
          <div class="pe-grid">
            <label><span>Judul promo</span><input bind:value={form.promo} placeholder="Potongan Rp10.000 untuk Deep Cleaning" /></label>
            <label class="wide"><span>Syarat / keterangan promo</span><textarea bind:value={form.promoKeterangan} placeholder="Periode, syarat, minimum transaksi, atau batas penggunaan."></textarea></label>
          </div>
        </section>

        <section class="pe-card" id="pe-operasional">
          <div class="pe-title"><b>06</b><div><h4>Operasional, kontak & kanal digital</h4><p>Data ini mengisi panel informasi usaha di sisi kanan halaman desktop dan bagian Info di mobile.</p></div></div>
          <div class="pe-grid">
            <label><span>Status buka</span><input bind:value={form.bukaStatus} placeholder="Buka sekarang / Tutup sementara" /></label>
            <label><span>Info tutup</span><input bind:value={form.tutupInfo} placeholder="Tutup pukul 20.00" /></label>
            <label><span>Jam operasional</span><input bind:value={form.jam} placeholder="08.00–20.00 · setiap hari" /></label>
            <label><span>WhatsApp</span><input bind:value={form.wa} placeholder="08xxxxxxxxxx" /></label>
            <label class="wide"><span>Alamat / area layanan</span><input bind:value={form.alamat} placeholder="Blok, RT, atau area pelayanan" /></label>
            <label class="wide"><span>Google Maps</span><input bind:value={form.maps} placeholder="https://maps.app.goo.gl/..." /></label>
            <label><span>Instagram</span><input bind:value={form.instagram} placeholder="https://instagram.com/..." /></label>
            <label><span>TikTok</span><input bind:value={form.tiktok} placeholder="https://tiktok.com/@..." /></label>
            <label class="wide"><span>Marketplace / layanan pesan antar</span><input bind:value={form.marketplace} placeholder="Shopee / Tokopedia / GoFood / GrabFood URL" /></label>
            <label class="wide"><span>Metode pembayaran — satu per baris</span><textarea value={form.metodePembayaran.join("\n")} oninput={(e) => ubahDaftar("metodePembayaran", e.currentTarget.value)} placeholder="Tunai\nQRIS\nTransfer Bank"></textarea></label>
          </div>
        </section>

        <section class="pe-card" id="pe-pesan">
          <div class="pe-title"><b>07</b><div><h4>Cara pemesanan</h4><p>Urutan singkat dari warga melihat profil sampai transaksi selesai.</p></div></div>
          <label class="wide"><span>Satu langkah per baris</span><textarea class="tall" value={form.caraPesan.join("\n")} oninput={(e) => ubahDaftar("caraPesan", e.currentTarget.value)} placeholder="Hubungi via WhatsApp\nPilih layanan\nKonfirmasi harga\nLakukan pembayaran\nPesanan selesai"></textarea></label>
        </section>

        <section class="pe-card" id="pe-faq">
          <div class="pe-title row"><div class="pe-title-copy"><b>08</b><div><h4>FAQ & ulasan</h4><p>FAQ membantu warga sebelum menghubungi pemilik. Ulasan hanya isi jika benar-benar ada sumbernya.</p></div></div><button type="button" class="tombol" onclick={tambahFaq}>+ FAQ</button></div>
          <div class="repeat-list mini">
            {#each form.faq as item, i}
              <article class="repeat-card"><div class="pe-grid compact"><label class="wide"><span>Pertanyaan</span><input bind:value={item.tanya} /></label><label class="wide"><span>Jawaban</span><textarea bind:value={item.jawab}></textarea></label></div><button type="button" class="icon-delete" onclick={() => hapusFaq(i)} aria-label={`Hapus FAQ ${i + 1}`}>×</button></article>
            {/each}
          </div>
          <div class="subsection"><h5>Testimoni / ulasan terpilih</h5><div class="pe-grid"><label class="wide"><span>Isi ulasan</span><textarea bind:value={form.testimoni.isi} placeholder="Kosongkan jika belum ada ulasan nyata."></textarea></label><label><span>Nama / sumber</span><input bind:value={form.testimoni.nama} /></label><label><span>Keterangan</span><input bind:value={form.testimoni.keterangan} placeholder="Warga RW 02" /></label><label><span>Rating</span><input bind:value={form.rating} inputmode="decimal" placeholder="4.8" /></label><label><span>Jumlah ulasan</span><input bind:value={form.jumlahUlasan} inputmode="numeric" placeholder="12" /></label></div></div>
        </section>

        <footer class="pe-savebar">
          <div><strong>{form.nama || usaha.nama}</strong><span>Perubahan belum tampil ke warga sampai tombol Simpan ditekan.</span></div>
          <div class="pe-actions"><a class="tombol" href={`#/umkm/${usahaId}`} target="_blank" rel="noreferrer">Preview ↗</a><button class="tombol utama" type="button" onclick={simpanSemua} disabled={menyimpan || prosesFoto}>{menyimpan ? "Menyimpan..." : "Simpan & terbitkan"}</button></div>
        </footer>
      </div>
    </div>
  </section>
{/if}

<style>
  .public-editor{margin:0 0 16px;padding:20px;border:1px solid #d9e6e1;border-radius:20px;background:linear-gradient(180deg,#f6fbf9 0,#fff 180px);box-shadow:0 18px 50px -44px rgba(9,73,57,.55)}
  .pe-head{display:flex;justify-content:space-between;gap:22px;align-items:flex-start;padding-bottom:18px;border-bottom:1px solid #e2ebe7}.pe-kicker{display:block;color:#08735c;font-size:12px;font-weight:900;letter-spacing:.1em}.pe-head h3{margin:5px 0 6px;color:#14251f;font-size:26px;letter-spacing:-.035em}.pe-head p{max-width:760px;margin:0;color:#66766f;line-height:1.55}.pe-actions{display:flex;flex-wrap:wrap;gap:8px}.pe-actions.top{justify-content:flex-end}.pe-loading,.pe-processing{padding:11px 13px;border-radius:10px;background:#eef8f4;color:#37675b;font-weight:700}
  .pe-layout{display:grid;grid-template-columns:205px minmax(0,1fr);gap:18px;margin-top:18px}.pe-index{position:sticky;top:86px;align-self:start;display:grid;gap:4px;padding:9px;border:1px solid #e0e9e5;border-radius:14px;background:#fbfdfc}.pe-index a{display:grid;grid-template-columns:28px 1fr;gap:8px;align-items:center;min-height:42px;padding:7px 8px;border-radius:9px;color:#526860;text-decoration:none;font-size:12px;font-weight:750}.pe-index a:hover{background:#eaf7f2;color:#096850}.pe-index b{color:#0a765e;font:800 11px ui-monospace,monospace}.pe-main{min-width:0;display:grid;gap:12px}.pe-card{scroll-margin-top:86px;padding:18px;border:1px solid #e0e9e5;border-radius:15px;background:#fff}.pe-title,.pe-title-copy{display:flex;gap:11px;align-items:flex-start}.pe-title.row{justify-content:space-between}.pe-title>b,.pe-title-copy>b{width:34px;height:34px;display:grid;place-items:center;flex:0 0 auto;border-radius:9px;background:#e5f6ef;color:#08735c;font-size:11px}.pe-title h4{margin:0;color:#172720;font-size:18px}.pe-title p{margin:3px 0 0;color:#71807a;line-height:1.45}.pe-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px;margin-top:15px}.pe-grid.compact{margin-top:0}.pe-grid label,.pe-card>label{display:grid;gap:5px}.pe-grid label>span,.pe-card>label>span{font-size:12px;font-weight:800;color:#465c54}.pe-grid input,.pe-grid select,.pe-grid textarea,.pe-card>label textarea{width:100%;min-height:43px;padding:9px 10px;border:1px solid #d3e0db;border-radius:9px;background:#fff;color:#182923;font:inherit}.pe-grid textarea,.pe-card>label textarea{min-height:82px;resize:vertical;line-height:1.5}.pe-grid textarea.tall,.pe-card>label textarea.tall{min-height:120px}.pe-grid .wide,.pe-card>.wide{grid-column:1/-1}.pe-grid small{justify-self:end;color:#85908c}.check{display:flex!important;grid-column:auto!important;grid-template-columns:20px 1fr!important;align-items:center;padding:10px;border:1px solid #e1e9e6;border-radius:9px;background:#f9fbfa}.check input{width:18px!important;min-height:18px!important;margin:0}.check span{font-size:13px!important}
  .media-editor{display:grid;grid-template-columns:minmax(260px,.75fr) minmax(0,1.25fr);gap:14px;margin-top:15px}.cover-editor{display:grid;gap:9px}.media-preview.cover{aspect-ratio:1.42/1;overflow:hidden;display:grid;place-items:center;border-radius:12px;background:#edf4f1;color:#73837d}.media-preview img,.gallery-editor img{width:100%;height:100%;object-fit:cover}.media-buttons,.gallery-head{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap}.upload-btn{position:relative;display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:0 12px;border-radius:9px;background:#0a765e;color:#fff;font-weight:800;font-size:12px;cursor:pointer}.upload-btn input{position:absolute;inset:0;opacity:0;cursor:pointer}.upload-btn.kecil{min-height:34px}.gallery-editor{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:9px}.gallery-editor figure{position:relative;margin:0;overflow:hidden;aspect-ratio:1.2/1;border-radius:10px;background:#edf4f1}.gallery-editor figcaption{position:absolute;inset:auto 5px 5px;display:flex;gap:4px}.gallery-editor figcaption button{flex:1;min-height:28px;padding:0 5px;border:0;border-radius:6px;background:rgba(7,54,44,.86);color:#fff;font-size:9px;font-weight:800;cursor:pointer}.gallery-editor figcaption button.danger{background:rgba(128,30,44,.9)}
  .repeat-list{display:grid;gap:9px;margin-top:14px}.repeat-card{position:relative;display:grid;grid-template-columns:42px minmax(0,1fr);gap:11px;padding:13px 46px 13px 13px;border:1px solid #e1e9e6;border-radius:12px;background:#fbfdfc}.repeat-no{width:38px;height:38px;display:grid;place-items:center;border-radius:9px;background:#e8f5f0;color:#08735c;font:850 11px ui-monospace,monospace}.repeat-list.mini .repeat-card{grid-template-columns:1fr}.icon-delete{position:absolute;top:12px;right:12px;width:30px;height:30px;border:1px solid #efd0d4;border-radius:8px;background:#fff7f8;color:#a33243;font-size:20px;cursor:pointer}.empty{grid-column:1/-1;padding:18px;border:1px dashed #cadbd4;border-radius:10px;background:#f9fbfa;color:#74837d;text-align:center}.subsection{margin-top:18px;padding-top:16px;border-top:1px solid #e2ebe7}.subsection h5{margin:0;font-size:15px}.pe-savebar{position:sticky;bottom:12px;z-index:7;display:flex;justify-content:space-between;align-items:center;gap:14px;padding:12px 14px;border:1px solid #cfdfd9;border-radius:13px;background:rgba(255,255,255,.95);box-shadow:0 14px 35px -25px rgba(5,57,44,.7);backdrop-filter:blur(14px)}.pe-savebar strong,.pe-savebar span{display:block}.pe-savebar span{margin-top:2px;color:#71807a;font-size:11px}
  @media(max-width:980px){.pe-layout{grid-template-columns:1fr}.pe-index{position:static;display:flex;overflow-x:auto}.pe-index a{min-width:max-content}.media-editor{grid-template-columns:1fr}}
  @media(max-width:720px){.public-editor{padding:13px;border-radius:15px}.pe-head{display:grid}.pe-head h3{font-size:22px}.pe-actions.top{justify-content:stretch}.pe-actions.top>*{flex:1}.pe-grid{grid-template-columns:1fr}.pe-grid .wide,.pe-card>.wide{grid-column:auto}.gallery-editor{grid-template-columns:repeat(2,minmax(0,1fr))}.repeat-card{grid-template-columns:1fr;padding-right:44px}.repeat-no{display:none}.pe-savebar{bottom:72px;display:grid}.pe-savebar .pe-actions>*{flex:1}.pe-title.row{align-items:flex-start;gap:8px}.pe-title.row>.tombol{flex:0 0 auto}}
</style>