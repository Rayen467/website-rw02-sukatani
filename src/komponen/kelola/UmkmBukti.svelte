<script>
  import { isi, muatKoleksi } from "../../keadaan/isi.svelte.js";
  import { sesi } from "../../keadaan/sesi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { KOLEKSI } from "../../inti/nama.js";
  import { ubahDokumen } from "../../sumber/data.js";
  import {
    ambilBuktiUmkm,
    simpanBuktiUmkm,
    ubahBuktiUmkm,
    hapusBuktiUmkm
  } from "../../sumber/umkm-bukti.js";

  let { usahaId = "" } = $props();

  const MAX_FILE = 560 * 1024;
  const JENIS = [
    "NIB", "KBLI", "Sertifikat Standar / Izin RBA", "NPWP usaha",
    "PB-UMKU / izin sektoral", "Sertifikat Halal", "SPP-IRT", "BPOM MD/ML",
    "SNI", "Higiene sanitasi / SLHS", "NKV / produk hewan",
    "Persetujuan lingkungan", "PBG / SLF", "Merek DJKI",
    "BPJS Ketenagakerjaan", "BPJS Kesehatan", "QRIS / QR pembayaran", "Dokumen lain"
  ];

  let bukti = $state([]);
  let memuat = $state(false);
  let menyimpan = $state(false);
  let generasi = 0;
  let fileDipilih = $state(null);
  let editId = $state("");
  let qrMode = $state("profil");
  let publik = $state({ nama: "", katLabel: "", ringkas: "", panjang: "", wa: "", alamat: "", jam: "", instagram: "", marketplace: "", maps: "" });
  let f = $state({ jenis: "NIB", judul: "", nomor: "", penerbit: "", berlakuSampai: "", verifikasiUrl: "", catatan: "" });

  const usaha = $derived((isi.usaha || []).find((x) => x.id === usahaId) || null);
  const jatuhTempo = $derived(bukti.filter((x) => statusMasa(x).kode === "segera").length);
  const kedaluwarsa = $derived(bukti.filter((x) => statusMasa(x).kode === "lewat").length);
  const buktiTerverifikasi = $derived(bukti.filter((x) => x.verifikasiUrl || x.nomor).length);
  const verifikasiPertama = $derived(bukti.find((x) => x.verifikasiUrl)?.verifikasiUrl || "");
  const tautanProfil = $derived(typeof window === "undefined" || !usahaId ? "" : `${window.location.href.split("#")[0]}#/umkm/${usahaId}`);
  const tautanWa = $derived(waLink(usaha?.wa));
  const tautanQr = $derived(qrMode === "wa" ? tautanWa : qrMode === "verifikasi" ? verifikasiPertama : tautanProfil);
  const gambarQr = $derived(tautanQr ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=${encodeURIComponent(tautanQr)}` : "");

  $effect(() => {
    const id = usahaId;
    if (!id) {
      bukti = [];
      return;
    }
    const u = (isi.usaha || []).find((x) => x.id === id);
    if (u) {
      publik = {
        nama: u.nama || "",
        katLabel: u.katLabel || "",
        ringkas: u.ringkas || "",
        panjang: u.panjang || "",
        wa: u.wa || "",
        alamat: u.alamat || "",
        jam: u.jam || "",
        instagram: u.instagram || "",
        marketplace: u.marketplace || "",
        maps: u.maps || ""
      };
    }
    const token = ++generasi;
    memuat = true;
    ambilBuktiUmkm(id)
      .then((hasil) => { if (token === generasi) bukti = hasil; })
      .catch(() => { if (token === generasi) beriTahu("Bukti dokumen UMKM belum berhasil dimuat."); })
      .finally(() => { if (token === generasi) memuat = false; });
  });

  function waLink(nomor) {
    const n = String(nomor || "").replace(/[^0-9]/g, "").replace(/^0/, "62");
    return n ? `https://wa.me/${n}` : "";
  }

  function formatUkuran(n) {
    const angka = Number(n || 0);
    if (angka < 1024) return `${angka} B`;
    return `${Math.round(angka / 1024)} KB`;
  }

  function statusMasa(item) {
    if (!item?.berlakuSampai) return { kode: "aman", label: "Tidak ada jatuh tempo" };
    const target = new Date(`${item.berlakuSampai}T23:59:59`);
    const hari = Math.ceil((target.getTime() - Date.now()) / 86400000);
    if (!Number.isFinite(hari)) return { kode: "aman", label: "Tanggal tidak valid" };
    if (hari < 0) return { kode: "lewat", label: `Kedaluwarsa ${Math.abs(hari)} hari` };
    if (hari <= 30) return { kode: "segera", label: `${hari} hari lagi` };
    return { kode: "aman", label: `${hari} hari lagi` };
  }

  function resetForm() {
    editId = "";
    fileDipilih = null;
    f = { jenis: "NIB", judul: "", nomor: "", penerbit: "", berlakuSampai: "", verifikasiUrl: "", catatan: "" };
    const input = document.getElementById("umkm-bukti-file");
    if (input) input.value = "";
  }

  function editBukti(item) {
    editId = item.id;
    fileDipilih = null;
    f = {
      jenis: item.jenis || "Dokumen lain",
      judul: item.judul || "",
      nomor: item.nomor || "",
      penerbit: item.penerbit || "",
      berlakuSampai: item.berlakuSampai || "",
      verifikasiUrl: item.verifikasiUrl || "",
      catatan: item.catatan || ""
    };
    document.getElementById("umkm-bukti-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function blobDataUrl(blob) {
    return await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result || ""));
      r.onerror = () => reject(new Error("Gagal membaca file."));
      r.readAsDataURL(blob);
    });
  }

  async function hashBlob(blob) {
    if (!crypto?.subtle) return "";
    const digest = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function kompresGambar(file) {
    const dataUrl = await blobDataUrl(file);
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = dataUrl;
    });

    let skala = Math.min(1, 1800 / Math.max(img.width, img.height));
    let kualitas = 0.88;
    let hasil = null;

    for (let langkah = 0; langkah < 8; langkah += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * skala));
      canvas.height = Math.max(1, Math.round(img.height * skala));
      const ctx = canvas.getContext("2d", { alpha: false });
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      hasil = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", kualitas));
      if (hasil && hasil.size <= MAX_FILE) return hasil;
      kualitas = Math.max(0.52, kualitas - 0.08);
      skala *= 0.86;
    }
    if (!hasil || hasil.size > MAX_FILE) throw new Error("Gambar masih terlalu besar setelah dikompresi.");
    return hasil;
  }

  async function siapkanFile(file) {
    if (!file) return null;
    const tipe = String(file.type || "").toLowerCase();
    if (tipe === "application/pdf") {
      if (file.size > MAX_FILE) throw new Error("PDF maksimal sekitar 560 KB. Kompres PDF lalu unggah kembali.");
      return file;
    }
    if (tipe.startsWith("image/")) return kompresGambar(file);
    throw new Error("Bukti hanya menerima PDF atau gambar (JPG/PNG/WebP)." );
  }

  async function simpanBukti() {
    if (!usahaId) return;
    if (!editId && !fileDipilih) {
      beriTahu("Pilih file bukti lebih dulu.");
      return;
    }
    menyimpan = true;
    try {
      const blob = fileDipilih ? await siapkanFile(fileDipilih) : null;
      const data = {
        usahaId,
        jenis: f.jenis,
        judul: f.judul || f.jenis,
        nomor: f.nomor,
        penerbit: f.penerbit,
        berlakuSampai: f.berlakuSampai,
        verifikasiUrl: f.verifikasiUrl.trim(),
        catatan: f.catatan,
        diunggahOleh: sesi.pengguna?.email || ""
      };

      if (blob) {
        data.namaFile = fileDipilih.name;
        data.mime = blob.type || fileDipilih.type || "application/octet-stream";
        data.ukuran = String(blob.size);
        data.sha256 = await hashBlob(blob);
        data.dataUrl = await blobDataUrl(blob);
      }

      if (editId) {
        await ubahBuktiUmkm(editId, data);
        beriTahu("Metadata bukti UMKM diperbarui.");
      } else {
        const id = `${usahaId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
        await simpanBuktiUmkm(id, data);
        beriTahu("Bukti sertifikat/dokumen berhasil disimpan.");
      }
      bukti = await ambilBuktiUmkm(usahaId);
      resetForm();
    } catch (err) {
      beriTahu(err?.message || "Bukti belum berhasil disimpan.");
    } finally {
      menyimpan = false;
    }
  }

  async function hapusBukti(item) {
    if (!confirm(`Hapus bukti “${item.judul || item.jenis || item.namaFile}”?`)) return;
    try {
      await hapusBuktiUmkm(item.id);
      bukti = bukti.filter((x) => x.id !== item.id);
      beriTahu("Bukti UMKM dihapus.");
      if (editId === item.id) resetForm();
    } catch {
      beriTahu("Bukti belum berhasil dihapus.");
    }
  }

  async function simpanProfilPublik() {
    if (!usahaId || !usaha) return;
    menyimpan = true;
    try {
      await ubahDokumen(KOLEKSI.USAHA, usahaId, publik);
      await muatKoleksi(KOLEKSI.USAHA);
      beriTahu("Profil publik UMKM diperbarui.");
    } catch {
      beriTahu("Profil publik UMKM belum berhasil disimpan.");
    } finally {
      menyimpan = false;
    }
  }

  async function salin(nilai, label = "Tautan") {
    if (!nilai) return;
    try {
      await navigator.clipboard.writeText(nilai);
      beriTahu(`${label} disalin.`);
    } catch {
      beriTahu("Peramban belum mengizinkan menyalin otomatis.");
    }
  }
</script>

{#if usahaId && usaha}
  <section class="umkm-x" aria-label="Fitur lanjutan UMKM">
    <div class="umkm-x-head">
      <div>
        <span>07 · Dokumen digital & pertumbuhan</span>
        <h4>Brankas bukti, QR & kanal penjualan</h4>
        <p>Bukti legalitas tersimpan privat untuk Petugas. File baru dibaca ketika UMKM ini dibuka, bukan saat warga membuka website.</p>
      </div>
      <div class="umkm-x-health">
        <article><b>{bukti.length}</b><small>Bukti tersimpan</small></article>
        <article class:warning={jatuhTempo > 0}><b>{jatuhTempo}</b><small>Jatuh tempo ≤30 hari</small></article>
        <article class:danger={kedaluwarsa > 0}><b>{kedaluwarsa}</b><small>Kedaluwarsa</small></article>
        <article><b>{buktiTerverifikasi}</b><small>Punya nomor/tautan verifikasi</small></article>
      </div>
    </div>

    <div class="umkm-x-grid">
      <article class="umkm-x-card" id="umkm-bukti-form">
        <div class="umkm-x-title">
          <span class="umkm-x-icon">▣</span>
          <div><h5>{editId ? "Edit bukti dokumen" : "Upload bukti dokumen"}</h5><p>Gambar otomatis dikompresi. PDF maksimal ±560 KB agar aman di Firestore Spark.</p></div>
        </div>

        <div class="umkm-x-form">
          <label><span>Jenis dokumen</span><select bind:value={f.jenis}>{#each JENIS as j}<option>{j}</option>{/each}</select></label>
          <label><span>Judul bukti</span><input bind:value={f.judul} placeholder="Contoh: Sertifikat Halal 2026" /></label>
          <label><span>Nomor / kode</span><input bind:value={f.nomor} placeholder="Nomor sertifikat atau referensi" /></label>
          <label><span>Penerbit</span><input bind:value={f.penerbit} placeholder="OSS, BPJPH, BPOM, DJKI..." /></label>
          <label><span>Berlaku sampai</span><input type="date" bind:value={f.berlakuSampai} /></label>
          <label><span>Tautan verifikasi</span><input type="url" bind:value={f.verifikasiUrl} placeholder="https://..." /></label>
          <label class="wide"><span>Catatan</span><textarea bind:value={f.catatan} placeholder="Catatan verifikasi, revisi, atau tindak lanjut..."></textarea></label>
          <label class="wide file-box" for="umkm-bukti-file">
            <span>{editId ? "Ganti file (opsional)" : "File bukti"}</span>
            <input id="umkm-bukti-file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onchange={(e) => (fileDipilih = e.currentTarget.files?.[0] || null)} />
            <small>{fileDipilih ? `${fileDipilih.name} · ${formatUkuran(fileDipilih.size)}` : "PDF/JPG/PNG/WebP. Gambar besar akan dikompresi otomatis."}</small>
          </label>
        </div>
        <div class="umkm-x-actions">
          {#if editId}<button type="button" class="tombol" onclick={resetForm}>Batal edit</button>{/if}
          <button type="button" class="tombol utama" onclick={simpanBukti} disabled={menyimpan}>{menyimpan ? "Menyimpan..." : editId ? "Simpan perubahan" : "Simpan bukti"}</button>
        </div>
      </article>

      <article class="umkm-x-card qr-card">
        <div class="umkm-x-title"><span class="umkm-x-icon">⌁</span><div><h5>QR Center</h5><p>QR publik tidak pernah memuat file sertifikat privat.</p></div></div>
        <div class="qr-tabs">
          <button type="button" class:aktif={qrMode === "profil"} onclick={() => (qrMode = "profil")}>Profil UMKM</button>
          <button type="button" class:aktif={qrMode === "wa"} disabled={!tautanWa} onclick={() => (qrMode = "wa")}>WhatsApp</button>
          <button type="button" class:aktif={qrMode === "verifikasi"} disabled={!verifikasiPertama} onclick={() => (qrMode = "verifikasi")}>Verifikasi</button>
        </div>
        {#if gambarQr}
          <div class="qr-view"><img src={gambarQr} alt="QR UMKM" /><div><b>{qrMode === "profil" ? "Profil publik UMKM" : qrMode === "wa" ? "Kontak WhatsApp" : "Tautan verifikasi dokumen"}</b><p>{tautanQr}</p></div></div>
          <div class="umkm-x-actions"><button type="button" class="tombol" onclick={() => salin(tautanQr, "Tautan QR")}>Salin tautan</button><a class="tombol" href={gambarQr} target="_blank" rel="noreferrer">Buka QR</a></div>
        {:else}
          <div class="empty-mini">Isi nomor WhatsApp atau tautan verifikasi untuk mengaktifkan QR terkait.</div>
        {/if}
      </article>
    </div>

    <article class="umkm-x-card profile-card">
      <div class="umkm-x-title"><span class="umkm-x-icon">↗</span><div><h5>Edit profil publik & kanal penjualan</h5><p>Data ini tampil atau dipakai pada direktori warga. Tambahkan kanal yang memang aktif.</p></div></div>
      <div class="umkm-x-form public-grid">
        <label><span>Nama usaha</span><input bind:value={publik.nama} /></label>
        <label><span>Kategori</span><input bind:value={publik.katLabel} placeholder="Kuliner, jasa, retail..." /></label>
        <label class="wide"><span>Ringkasan</span><textarea bind:value={publik.ringkas} placeholder="Deskripsi singkat untuk katalog warga"></textarea></label>
        <label class="wide"><span>Produk / layanan</span><textarea bind:value={publik.panjang} placeholder="Satu produk/layanan per baris agar mudah dibaca"></textarea></label>
        <label><span>WhatsApp</span><input bind:value={publik.wa} placeholder="08xxxxxxxxxx" /></label>
        <label><span>Jam layanan</span><input bind:value={publik.jam} placeholder="08.00–20.00 WIB" /></label>
        <label><span>Instagram</span><input bind:value={publik.instagram} placeholder="https://instagram.com/..." /></label>
        <label><span>Marketplace</span><input bind:value={publik.marketplace} placeholder="Shopee / Tokopedia / GoFood / GrabFood URL" /></label>
        <label class="wide"><span>Alamat / titik layanan</span><input bind:value={publik.alamat} placeholder="Blok, RT, atau lokasi usaha" /></label>
        <label class="wide"><span>Google Maps</span><input bind:value={publik.maps} placeholder="https://maps.app.goo.gl/..." /></label>
      </div>
      <div class="umkm-x-actions"><a class="tombol" href={`#/umkm/${usahaId}`} target="_blank" rel="noreferrer">Preview profil</a><button type="button" class="tombol utama" onclick={simpanProfilPublik} disabled={menyimpan}>Simpan profil publik</button></div>
    </article>

    <article class="umkm-x-card vault-card">
      <div class="umkm-x-title"><span class="umkm-x-icon">✓</span><div><h5>Brankas bukti</h5><p>Nomor, penerbit, masa berlaku, hash SHA-256, dan file tersimpan per dokumen.</p></div></div>
      {#if memuat}
        <div class="empty-mini">Memuat bukti...</div>
      {:else if bukti.length}
        <div class="vault-list">
          {#each bukti as item}
            {@const masa = statusMasa(item)}
            <article class="vault-item">
              <div class="vault-preview">
                {#if String(item.mime || "").startsWith("image/") && item.dataUrl}<img src={item.dataUrl} alt="" />{:else}<span>PDF</span>{/if}
              </div>
              <div class="vault-main">
                <div class="vault-top"><span>{item.jenis || "Dokumen"}</span><em class={masa.kode}>{masa.label}</em></div>
                <h6>{item.judul || item.namaFile || "Bukti UMKM"}</h6>
                <p>{item.nomor ? `No. ${item.nomor}` : "Nomor belum dicatat"}{item.penerbit ? ` · ${item.penerbit}` : ""}</p>
                <small>{item.namaFile || "-"} · {formatUkuran(item.ukuran)}{item.sha256 ? ` · SHA ${item.sha256.slice(0, 10)}…` : ""}</small>
              </div>
              <div class="vault-actions">
                {#if item.dataUrl}<a class="tombol" href={item.dataUrl} download={item.namaFile || "bukti-umkm"}>Unduh</a>{/if}
                {#if item.verifikasiUrl}<a class="tombol" href={item.verifikasiUrl} target="_blank" rel="noreferrer">Verifikasi ↗</a>{/if}
                <button type="button" class="tombol" onclick={() => editBukti(item)}>Edit</button>
                <button type="button" class="tombol danger" onclick={() => hapusBukti(item)}>Hapus</button>
              </div>
            </article>
          {/each}
        </div>
      {:else}
        <div class="empty-mini">Belum ada bukti file. Upload NIB, sertifikat halal, SPP-IRT, QRIS, merek, atau dokumen lain dari panel di atas.</div>
      {/if}
    </article>
  </section>
{/if}

<style>
  .umkm-x{margin-top:14px;padding:18px;border:1px solid #dce8e3;border-radius:18px;background:linear-gradient(180deg,#f6fbf9,#fff 38%);box-shadow:0 14px 38px -34px rgba(10,72,56,.5)}
  .umkm-x-head{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:end;margin-bottom:14px}.umkm-x-head>div:first-child>span{display:block;color:#0a765e;font-size:13px;font-weight:850;letter-spacing:.06em;text-transform:uppercase}.umkm-x-head h4{margin:5px 0 4px;font-size:21px;color:#14251f}.umkm-x-head p{margin:0;max-width:720px;color:#6b7974;line-height:1.5}.umkm-x-health{display:grid;grid-template-columns:repeat(4,minmax(96px,1fr));gap:8px}.umkm-x-health article{padding:10px 12px;border:1px solid #dce8e3;border-radius:12px;background:#fff}.umkm-x-health b{display:block;font-size:20px}.umkm-x-health small{display:block;color:#6d7c76;font-size:12px}.umkm-x-health .warning{background:#fff8e8}.umkm-x-health .danger{background:#fff0f0}
  .umkm-x-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(300px,.65fr);gap:12px}.umkm-x-card{padding:16px;border:1px solid #e0e9e5;border-radius:14px;background:#fff}.umkm-x-title{display:flex;gap:10px;align-items:flex-start;margin-bottom:13px}.umkm-x-icon{width:36px;height:36px;display:grid;place-items:center;flex:0 0 auto;border-radius:10px;background:#e5f6ef;color:#08735c;font-weight:900}.umkm-x-title h5{margin:0;font-size:17px;color:#172721}.umkm-x-title p{margin:3px 0 0;color:#70807a;line-height:1.45}.umkm-x-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.umkm-x-form label{display:grid;gap:5px}.umkm-x-form label>span{font-weight:750;color:#435850;font-size:13px}.umkm-x-form input,.umkm-x-form select,.umkm-x-form textarea{width:100%;min-height:42px;padding:9px 10px;border:1px solid #d4e0dc;border-radius:9px;background:#fff;color:#1d2b26}.umkm-x-form textarea{min-height:76px;resize:vertical}.umkm-x-form .wide{grid-column:1/-1}.file-box{padding:11px;border:1px dashed #bcd5cb;border-radius:10px;background:#f7fbf9}.file-box input{padding:0;border:0;min-height:auto}.file-box small{color:#71807a}.umkm-x-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;margin-top:12px}.umkm-x-actions .danger,.vault-actions .danger{color:#a52e3c;border-color:#efcbd0;background:#fff6f7}
  .qr-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;padding:4px;border:1px solid #dbe6e2;border-radius:10px;background:#f4f8f6}.qr-tabs button{min-height:38px;border:0;border-radius:7px;background:transparent;font:inherit;font-weight:750;color:#64736d;cursor:pointer}.qr-tabs button.aktif{background:#0b6b56;color:#fff}.qr-tabs button:disabled{opacity:.38;cursor:not-allowed}.qr-view{display:grid;justify-items:center;gap:10px;padding:14px 0 2px}.qr-view img{width:min(210px,100%);aspect-ratio:1;border:1px solid #dfe8e4;border-radius:13px;background:#fff}.qr-view div{min-width:0;text-align:center}.qr-view b{display:block}.qr-view p{margin:4px auto 0;max-width:290px;color:#73817c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.empty-mini{padding:18px;border:1px dashed #ccdcd5;border-radius:11px;color:#71807a;text-align:center;background:#f9fbfa}
  .profile-card,.vault-card{margin-top:12px}.public-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.vault-list{display:grid;gap:8px}.vault-item{display:grid;grid-template-columns:54px minmax(0,1fr) auto;gap:12px;align-items:center;padding:10px;border:1px solid #e5ece9;border-radius:11px;background:#fbfdfc}.vault-preview{width:54px;height:54px;display:grid;place-items:center;overflow:hidden;border-radius:9px;background:#eaf4f0;color:#0a725b;font-weight:900}.vault-preview img{width:100%;height:100%;object-fit:cover}.vault-main{min-width:0}.vault-top{display:flex;flex-wrap:wrap;gap:7px;align-items:center}.vault-top>span{padding:3px 7px;border-radius:99px;background:#e9f6f1;color:#0a715a;font-size:12px;font-weight:800}.vault-top em{font-style:normal;font-size:12px;color:#6c7a75}.vault-top em.segera{color:#9a6a10}.vault-top em.lewat{color:#ad3948;font-weight:800}.vault-main h6{margin:4px 0 2px;font-size:15px}.vault-main p,.vault-main small{display:block;margin:0;color:#6d7a76;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.vault-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:6px}.vault-actions .tombol{min-height:36px;padding:7px 10px}
  @media(max-width:1180px){.umkm-x-head{grid-template-columns:1fr}.umkm-x-health{grid-template-columns:repeat(2,minmax(0,1fr))}.umkm-x-grid{grid-template-columns:1fr}.qr-card{display:grid;grid-template-columns:minmax(220px,.7fr) minmax(260px,1fr);column-gap:16px}.qr-card .umkm-x-title,.qr-card .qr-tabs{grid-column:1}.qr-card .qr-view{grid-column:2;grid-row:1/4}.qr-card .umkm-x-actions{grid-column:1}}
  @media(max-width:760px){.umkm-x{padding:12px;border-radius:14px}.umkm-x-health,.umkm-x-form,.public-grid{grid-template-columns:1fr}.umkm-x-form .wide{grid-column:auto}.qr-card{display:block}.vault-item{grid-template-columns:48px 1fr}.vault-actions{grid-column:1/-1;justify-content:flex-start}.umkm-x-actions{justify-content:flex-start}.umkm-x-head h4{font-size:19px}}
</style>
