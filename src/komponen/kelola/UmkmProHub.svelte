<script>
  import { KOLEKSI, STATUS } from "../../inti/nama.js";
  import { JENIS_USAHA } from "../../inti/bawaan.js";
  import { keSlug } from "../../inti/format.js";
  import { isi, muatKoleksi } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { simpanDokumen, ubahStatus } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";
  import UmkmEditorPublik from "./UmkmEditorPublik.svelte";
  import UmkmBukti from "./UmkmBukti.svelte";

  const daftar = $derived(Array.isArray(isi.usaha) ? isi.usaha : []);
  const pendaftar = $derived(Array.isArray(isi.usaha_baru) ? isi.usaha_baru : []);
  const pendaftaranOnline = $derived(
    pendaftar.filter((x) => [STATUS.BARU, STATUS.PROSES].includes(x.status || STATUS.BARU))
  );

  let dipilih = $state("");
  let bukaOffline = $state(false);
  let sibuk = $state("");
  let formOffline = $state({
    nama: "",
    pemilik: "",
    kat: JENIS_USAHA[0]?.nilai || "siapsaji",
    produk: "",
    wa: "",
    alamat: ""
  });

  $effect(() => {
    if (dipilih && daftar.some((x) => x.id === dipilih)) return;
    dipilih = daftar[0]?.id || "";
  });

  function labelKategori(nilai) {
    return JENIS_USAHA.find((x) => x.nilai === nilai)?.label || "Lainnya";
  }

  function kategoriDariOnline(jenis) {
    const teks = String(jenis || "").trim().toLowerCase();
    const cocok = JENIS_USAHA.find((x) => String(x.label || "").toLowerCase() === teks);
    if (cocok) return cocok.nilai;
    if (teks.includes("siap")) return "siapsaji";
    if (teks.includes("kemasan")) return "kemasan";
    if (teks.includes("jasa")) return "jasa";
    if (teks.includes("retail") || teks.includes("toko")) return "retail";
    return "retail";
  }

  async function segarkanUmkm() {
    if (sibuk) return;
    sibuk = "refresh";
    try {
      await Promise.all([
        muatKoleksi(KOLEKSI.USAHA),
        muatKoleksi(KOLEKSI.USAHA_BARU),
        muatKoleksi(KOLEKSI.USAHA_ADMIN)
      ]);
      beriTahu("Data UMKM dan pendaftaran online sudah disegarkan.");
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      sibuk = "";
    }
  }

  async function tambahOffline(e) {
    e.preventDefault();
    const nama = formOffline.nama.trim();
    if (!nama) {
      beriTahu("Nama usaha wajib diisi.");
      return;
    }

    const id = keSlug(nama);
    if (!id) {
      beriTahu("Nama usaha belum bisa dijadikan ID katalog.");
      return;
    }
    if (daftar.some((x) => x.id === id)) {
      beriTahu("UMKM dengan nama tersebut sudah ada di katalog. Pilih usaha itu untuk mengeditnya.");
      dipilih = id;
      return;
    }

    sibuk = "offline";
    try {
      const kat = formOffline.kat || "retail";
      await simpanDokumen(KOLEKSI.USAHA, id, {
        nama,
        kat,
        katLabel: labelKategori(kat),
        ringkas: formOffline.produk.trim().slice(0, 420),
        panjang: formOffline.produk.trim(),
        wa: formOffline.wa.trim(),
        alamat: formOffline.alamat.trim(),
        sumber: "offline"
      }, false);

      await simpanDokumen(KOLEKSI.USAHA_ADMIN, id, {
        usahaId: id,
        namaUsaha: nama,
        pemilik: formOffline.pemilik.trim(),
        statusPendampingan: "belum",
        diperbarui: new Date().toISOString()
      }, false);

      await Promise.all([
        muatKoleksi(KOLEKSI.USAHA),
        muatKoleksi(KOLEKSI.USAHA_ADMIN)
      ]);

      dipilih = id;
      formOffline = {
        nama: "",
        pemilik: "",
        kat: JENIS_USAHA[0]?.nilai || "siapsaji",
        produk: "",
        wa: "",
        alamat: ""
      };
      bukaOffline = false;
      beriTahu("UMKM offline berhasil ditambahkan ke katalog. Lengkapi profil publiknya di editor bawah.");
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      sibuk = "";
    }
  }

  async function terimaOnline(u) {
    if (!u?.id || sibuk) return;
    const id = keSlug(u.nama || "") || u.id;
    if (daftar.some((x) => x.id === id)) {
      beriTahu("Nama usaha ini sudah ada di katalog. Periksa profil yang sudah ada sebelum menerima pendaftaran agar datanya tidak tertimpa.");
      dipilih = id;
      return;
    }

    sibuk = "online:" + u.id;
    try {
      const kat = kategoriDariOnline(u.jenis);
      await simpanDokumen(KOLEKSI.USAHA, id, {
        nama: u.nama || "Usaha warga",
        kat,
        katLabel: u.jenis || labelKategori(kat),
        ringkas: String(u.produk || "").slice(0, 420),
        panjang: u.produk || "",
        wa: u.wa || "",
        alamat: u.alamat || "",
        sumber: "online"
      }, false);

      await simpanDokumen(KOLEKSI.USAHA_ADMIN, id, {
        usahaId: id,
        namaUsaha: u.nama || "Usaha warga",
        pemilik: u.pemilik || "",
        statusPendampingan: "belum",
        sumberPendaftaran: "online",
        pendaftaranId: u.id,
        diperbarui: new Date().toISOString()
      }, false);

      await ubahStatus(KOLEKSI.USAHA_BARU, u.id, STATUS.SELESAI);
      await Promise.all([
        muatKoleksi(KOLEKSI.USAHA),
        muatKoleksi(KOLEKSI.USAHA_BARU),
        muatKoleksi(KOLEKSI.USAHA_ADMIN)
      ]);
      dipilih = id;
      beriTahu("Pendaftaran online diterima dan UMKM sudah masuk katalog.");
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      sibuk = "";
    }
  }

  async function tolakOnline(u) {
    if (!u?.id || sibuk) return;
    sibuk = "tolak:" + u.id;
    try {
      await ubahStatus(KOLEKSI.USAHA_BARU, u.id, STATUS.DITOLAK);
      await muatKoleksi(KOLEKSI.USAHA_BARU);
      beriTahu("Pendaftaran online ditolak.");
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      sibuk = "";
    }
  }
</script>

<section class="intake-grid" aria-label="Penambahan UMKM">
  <article class="intake-card offline">
    <div class="intake-icon">＋</div>
    <div class="intake-copy">
      <span>INPUT PETUGAS · OFFLINE</span>
      <h2>Tambah UMKM offline</h2>
      <p>Untuk usaha yang didata langsung oleh pengurus, datang ke sekretariat, atau belum mengisi formulir website.</p>
    </div>
    <button class="intake-action" type="button" onclick={() => (bukaOffline = !bukaOffline)} aria-expanded={bukaOffline}>
      {bukaOffline ? "Tutup form" : "+ Tambah usaha"}
    </button>
  </article>

  <article class="intake-card online">
    <div class="intake-icon">↗</div>
    <div class="intake-copy">
      <span>PENDAFTARAN WEBSITE · ONLINE</span>
      <h2>{pendaftaranOnline.length} pendaftaran online</h2>
      <p>Kiriman warga dari halaman “Daftarkan Usaha” masuk ke antrean ini sebelum diterbitkan ke katalog.</p>
    </div>
    <button class="intake-action secondary" type="button" onclick={segarkanUmkm} disabled={sibuk === "refresh"}>
      {sibuk === "refresh" ? "Menyegarkan..." : "↻ Segarkan"}
    </button>
  </article>
</section>

{#if bukaOffline}
  <section class="offline-form-card">
    <header>
      <div><span>INPUT MANUAL</span><h3>Data dasar UMKM offline</h3><p>Setelah disimpan, usaha langsung masuk katalog dan bisa dilengkapi melalui editor profil publik.</p></div>
    </header>
    <form onsubmit={tambahOffline}>
      <label><span>Nama usaha *</span><input bind:value={formOffline.nama} required placeholder="Contoh: Warung Ibu Sari" /></label>
      <label><span>Nama pemilik</span><input bind:value={formOffline.pemilik} placeholder="Nama pemilik usaha" /></label>
      <label><span>Kategori</span><select bind:value={formOffline.kat}>{#each JENIS_USAHA as j}<option value={j.nilai}>{j.label}</option>{/each}</select></label>
      <label><span>WhatsApp</span><input bind:value={formOffline.wa} inputmode="tel" placeholder="08..." /></label>
      <label class="wide"><span>Produk / layanan utama</span><textarea bind:value={formOffline.produk} placeholder="Jelaskan produk atau layanan utama yang memang ditawarkan."></textarea></label>
      <label class="wide"><span>Alamat</span><input bind:value={formOffline.alamat} placeholder="Blok / nomor rumah / lokasi usaha" /></label>
      <div class="offline-actions wide"><button type="button" class="tombol" onclick={() => (bukaOffline = false)}>Batal</button><button type="submit" class="tombol utama" disabled={sibuk === "offline"}>{sibuk === "offline" ? "Menyimpan..." : "Simpan UMKM offline"}</button></div>
    </form>
  </section>
{/if}

<section class="online-queue">
  <header class="queue-head">
    <div><span>ANTREAN ONLINE</span><h3>Pendaftaran dari website warga</h3><p>Data di sini berasal dari formulir online dan belum otomatis menjadi profil publik sebelum Petugas menerimanya.</p></div>
    <strong>{pendaftaranOnline.length}</strong>
  </header>

  {#if pendaftaranOnline.length}
    <div class="queue-list">
      {#each pendaftaranOnline as u}
        <article class="queue-item">
          <div class="queue-main">
            <div class="queue-title"><b>{u.nama || "Usaha tanpa nama"}</b><span>{u.status === STATUS.PROSES ? "Diproses" : "Baru"}</span></div>
            <p>{u.produk || "Produk / layanan belum dijelaskan."}</p>
            <small>{[u.jenis, u.pemilik, u.alamat].filter(Boolean).join(" · ") || "Detail belum lengkap"}</small>
          </div>
          <div class="queue-contact">{u.wa || "WA belum diisi"}</div>
          <div class="queue-actions">
            <button type="button" class="tombol utama" onclick={() => terimaOnline(u)} disabled={Boolean(sibuk)}>Terima & publikasikan</button>
            <button type="button" class="tombol danger" onclick={() => tolakOnline(u)} disabled={Boolean(sibuk)}>Tolak</button>
          </div>
        </article>
      {/each}
    </div>
  {:else}
    <div class="queue-empty"><b>Belum ada pendaftaran online yang menunggu.</b><span>Kiriman baru dari halaman Daftarkan Usaha akan muncul di sini setelah data disegarkan.</span></div>
  {/if}
</section>

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
  <section class="pro-empty">Belum ada UMKM di katalog. Tambahkan UMKM offline atau terima pendaftaran online di bagian atas.</section>
{/if}

<style>
  .intake-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:14px}.intake-card{display:grid;grid-template-columns:48px minmax(0,1fr) auto;gap:13px;align-items:center;padding:16px 18px;border:1px solid #dbe7e2;border-radius:16px;background:#fff;box-shadow:0 10px 30px -28px rgba(14,72,55,.6)}.intake-card.offline{background:linear-gradient(125deg,#edf9f4,#fff 66%)}.intake-card.online{background:linear-gradient(125deg,#eef6ff,#fff 66%)}.intake-icon{width:46px;height:46px;display:grid;place-items:center;border-radius:13px;background:#dff4eb;color:#087258;font-size:23px;font-weight:900}.online .intake-icon{background:#e5f0ff;color:#3568a7}.intake-copy{min-width:0}.intake-copy>span,.offline-form-card header span,.queue-head span{display:block;color:#647872;font-size:11px;font-weight:900;letter-spacing:.09em}.intake-copy h2{margin:3px 0 4px;font-size:19px;color:#183028;letter-spacing:-.02em}.intake-copy p{margin:0;color:#6f7d78;line-height:1.45;font-size:13px}.intake-action{min-height:40px;padding:0 13px;border:0;border-radius:10px;background:#0b7058;color:#fff;font:inherit;font-size:13px;font-weight:850;cursor:pointer;white-space:nowrap}.intake-action.secondary{background:#eef4f1;color:#31564b}.intake-action:disabled{opacity:.6;cursor:wait}
  .offline-form-card,.online-queue{margin-bottom:14px;border:1px solid #dce7e3;border-radius:16px;background:#fff;overflow:hidden}.offline-form-card header,.queue-head{padding:16px 18px;border-bottom:1px solid #e5ece9;background:#f8fbfa}.offline-form-card h3,.queue-head h3{margin:3px 0 4px;color:#193029;font-size:19px}.offline-form-card header p,.queue-head p{margin:0;color:#6d7b76;font-size:13px}.offline-form-card form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:18px}.offline-form-card label{display:grid;gap:6px}.offline-form-card label>span{color:#465b53;font-size:13px;font-weight:800}.offline-form-card input,.offline-form-card select,.offline-form-card textarea{width:100%;min-height:42px;padding:9px 11px;border:1px solid #d5e1dc;border-radius:9px;background:#fff;color:#1c2b26;font:inherit;font-size:14px}.offline-form-card textarea{min-height:88px;resize:vertical}.wide{grid-column:1/-1}.offline-actions{display:flex;justify-content:flex-end;gap:8px}
  .queue-head{display:flex;justify-content:space-between;gap:16px;align-items:center}.queue-head strong{min-width:44px;height:44px;display:grid;place-items:center;border-radius:12px;background:#e6f5ef;color:#087159;font-size:20px}.queue-list{display:grid}.queue-item{display:grid;grid-template-columns:minmax(0,1fr) minmax(120px,180px) auto;gap:14px;align-items:center;padding:14px 18px;border-top:1px solid #edf1ef}.queue-item:first-child{border-top:0}.queue-main{min-width:0}.queue-title{display:flex;align-items:center;gap:8px}.queue-title b{font-size:15px;color:#20372f}.queue-title span{padding:3px 7px;border-radius:99px;background:#fff2d9;color:#986313;font-size:11px;font-weight:850}.queue-main p{margin:5px 0;color:#5f6f69;line-height:1.4}.queue-main small{display:block;color:#85908c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.queue-contact{color:#52635d;font-size:13px}.queue-actions{display:flex;gap:7px;justify-content:flex-end}.queue-actions .tombol{white-space:nowrap}.queue-actions .danger{color:#a63b43;border-color:#efcfd3;background:#fff7f8}.queue-empty{display:grid;gap:4px;padding:22px 18px;color:#6e7c77}.queue-empty b{color:#2b4038}
  .pro-hub{display:grid;gap:14px}.pro-selector{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,360px);gap:18px;align-items:end;padding:18px 20px;border:1px solid #dce7e3;border-radius:18px;background:linear-gradient(125deg,#edf9f4,#fff 58%);box-shadow:0 14px 38px -34px rgba(10,72,56,.5)}.pro-selector>div>span{display:block;color:#0a725b;font-size:12px;font-weight:900;letter-spacing:.09em}.pro-selector h2{margin:4px 0 5px;font-size:23px;letter-spacing:-.03em;color:#172720}.pro-selector p{max-width:760px;margin:0;color:#6c7975;line-height:1.5}.pro-selector label{display:grid;gap:6px}.pro-selector label>span{font-size:13px;font-weight:800;color:#445850}.pro-selector select{width:100%;min-height:46px;padding:9px 11px;border:1px solid #cdded7;border-radius:10px;background:#fff;color:#1c2a25;font-weight:700}.pro-admin-more{overflow:hidden;border:1px solid #dce7e3;border-radius:16px;background:#fff}.pro-admin-more summary{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:15px 18px;cursor:pointer;list-style:none;font-weight:850;color:#1b3028}.pro-admin-more summary::-webkit-details-marker{display:none}.pro-admin-more summary small{font-weight:650;color:#71807a}.pro-admin-more[open] summary{border-bottom:1px solid #e4ece9;background:#f8fbfa}.pro-admin-body{padding:0 0 2px}.pro-admin-body :global(.profile-card){display:none!important}.pro-empty{padding:22px;border:1px dashed #cddbd6;border-radius:14px;background:#f8fbfa;color:#6b7974;text-align:center}
  @media(max-width:1000px){.intake-grid{grid-template-columns:1fr}.queue-item{grid-template-columns:1fr}.queue-contact{margin-top:-5px}.queue-actions{justify-content:flex-start}}
  @media(max-width:760px){.pro-selector{grid-template-columns:1fr;padding:14px}.pro-admin-more summary{align-items:flex-start;flex-direction:column}.pro-selector h2{font-size:20px}.intake-card{grid-template-columns:44px 1fr}.intake-action{grid-column:1/-1;width:100%}.offline-form-card form{grid-template-columns:1fr}.wide{grid-column:auto}.queue-head{align-items:flex-start}.queue-actions{display:grid;grid-template-columns:1fr 1fr}.queue-actions .tombol{width:100%}}
</style>