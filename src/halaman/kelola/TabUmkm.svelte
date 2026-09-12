<script>
  import { KOLEKSI, STATUS } from "../../inti/nama.js";
  import { keSlug } from "../../inti/format.js";
  import { isi, muatKoleksi } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { simpanDokumen, ubahStatus } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";

  const daftar = (nilai) => Array.isArray(nilai) ? nilai : [];
  const usaha = $derived(daftar(isi.usaha));
  const usahaAdmin = $derived(daftar(isi.usaha_admin));
  const pendaftar = $derived(daftar(isi.usaha_baru));
  const pendaftarBaru = $derived(pendaftar.filter((x) => (x.status || STATUS.BARU) === STATUS.BARU));

  const PILIHAN_STATUS = [
    ["belum", "Belum ada"],
    ["proses", "Sedang diurus"],
    ["aktif", "Ada / terverifikasi"],
    ["perbarui", "Perlu diperbarui"],
    ["tidak_perlu", "Tidak berlaku untuk usaha ini"]
  ];

  const LEGAL_DASAR = [
    { status: "nibStatus", nomor: "nibNomor", label: "NIB", singkat: "Identitas resmi usaha melalui OSS." },
    { status: "kbliStatus", nomor: "kbliKode", label: "KBLI", singkat: "Klasifikasi kegiatan usaha yang sesuai dengan aktivitas sebenarnya." },
    { status: "izinRbaStatus", nomor: "izinRbaNomor", label: "Sertifikat Standar / Izin RBA", singkat: "Perizinan lanjutan sesuai tingkat risiko kegiatan usaha." },
    { status: "npwpStatus", nomor: "npwpNomor", label: "NPWP usaha", singkat: "Administrasi perpajakan usaha. Nomor disimpan hanya di area Petugas." },
    { status: "pkpStatus", nomor: "pkpNomor", label: "Status PKP", singkat: "Diisi bila usaha memang memenuhi atau memilih ketentuan PKP." },
    { status: "pbUmkuStatus", nomor: "pbUmkuNomor", label: "PB-UMKU / izin sektoral", singkat: "Perizinan penunjang yang diwajibkan sektor usaha tertentu." }
  ];

  const SERTIFIKAT_PRODUK = [
    { status: "halalStatus", nomor: "halalNomor", label: "Sertifikat Halal", singkat: "Untuk kategori produk yang wajib halal; jalurnya dapat reguler atau self declare bila memenuhi syarat." },
    { status: "sppirtStatus", nomor: "sppirtNomor", label: "SPP-IRT", singkat: "Untuk pangan olahan industri rumah tangga yang masuk ruang lingkup SPP-IRT." },
    { status: "bpomStatus", nomor: "bpomNomor", label: "BPOM MD/ML", singkat: "Registrasi pangan olahan yang memerlukan izin edar BPOM dan tidak memakai jalur SPP-IRT." },
    { status: "sniStatus", nomor: "sniNomor", label: "SNI", singkat: "Wajib hanya bila produk berada pada kategori SNI wajib; selain itu dapat bersifat sukarela." },
    { status: "slhsStatus", nomor: "slhsNomor", label: "Higiene sanitasi / SLHS", singkat: "Untuk usaha pangan/jasa boga tertentu sesuai ketentuan kesehatan daerah dan jenis usahanya." },
    { status: "nkvStatus", nomor: "nkvNomor", label: "NKV / produk hewan", singkat: "Untuk unit usaha produk hewan yang memang berada dalam ruang lingkup persyaratan NKV." }
  ];

  const OPERASIONAL = [
    { status: "lingkunganStatus", nomor: "lingkunganNomor", label: "Persetujuan lingkungan", singkat: "SPPL, UKL-UPL, AMDAL atau bentuk lain sesuai skala dan risiko kegiatan." },
    { status: "pbgStatus", nomor: "pbgNomor", label: "PBG / SLF tempat usaha", singkat: "Dicatat bila bangunan/tempat usaha membutuhkan dokumen bangunan terkait." },
    { status: "merekStatus", nomor: "merekNomor", label: "Merek DJKI", singkat: "Perlindungan nama/logo merek; bukan izin berusaha, tetapi penting untuk aset usaha." },
    { status: "bpjsTkStatus", nomor: "bpjsTkNomor", label: "BPJS Ketenagakerjaan", singkat: "Dicatat bila usaha memiliki pekerja dan kewajiban kepesertaan berlaku." },
    { status: "bpjsKesStatus", nomor: "bpjsKesNomor", label: "BPJS Kesehatan pemberi kerja", singkat: "Dicatat bila usaha memiliki pekerja dan ketentuan pemberi kerja berlaku." }
  ];

  const SEMUA_DOKUMEN = [...LEGAL_DASAR, ...SERTIFIKAT_PRODUK, ...OPERASIONAL];

  const AWAL = Object.freeze({
    pemilik: "", email: "", rt: "", bentukUsaha: "", risikoUsaha: "", catatanIdentitas: "",
    nibStatus: "belum", nibNomor: "", kbliStatus: "belum", kbliKode: "", izinRbaStatus: "belum", izinRbaNomor: "",
    npwpStatus: "belum", npwpNomor: "", pkpStatus: "tidak_perlu", pkpNomor: "", pbUmkuStatus: "belum", pbUmkuNomor: "",
    halalStatus: "belum", halalNomor: "", halalJalur: "", sppirtStatus: "belum", sppirtNomor: "", bpomStatus: "belum", bpomNomor: "",
    sniStatus: "belum", sniNomor: "", slhsStatus: "belum", slhsNomor: "", nkvStatus: "belum", nkvNomor: "",
    lingkunganStatus: "belum", lingkunganNomor: "", pbgStatus: "belum", pbgNomor: "", merekStatus: "belum", merekNomor: "",
    bpjsTkStatus: "belum", bpjsTkNomor: "", bpjsKesStatus: "belum", bpjsKesNomor: "",
    rekeningStatus: "belum", qrisStatus: "belum", pembukuanStatus: "belum", digitalStatus: "belum",
    statusPendampingan: "belum", aksiBerikutnya: "", catatanPendampingan: "", dokumenLain: "", diperbarui: ""
  });

  let terpilih = $state("");
  let form = $state({ ...AWAL });
  let cari = $state("");
  let saring = $state("semua");
  let sibuk = $state("");

  function adminUntuk(id) {
    return usahaAdmin.find((x) => x.id === id || x.usahaId === id) || null;
  }

  function nilaiStatus(a, kunci) {
    return String(a?.[kunci] || "belum");
  }

  function skorAdministrasi(id) {
    const a = adminUntuk(id);
    if (!a) return 0;
    const berlaku = SEMUA_DOKUMEN.filter((d) => nilaiStatus(a, d.status) !== "tidak_perlu");
    if (!berlaku.length) return 0;
    const siap = berlaku.filter((d) => nilaiStatus(a, d.status) === "aktif").length;
    return Math.round((siap / berlaku.length) * 100);
  }

  function skorForm() {
    const berlaku = SEMUA_DOKUMEN.filter((d) => String(form[d.status] || "belum") !== "tidak_perlu");
    if (!berlaku.length) return 0;
    return Math.round((berlaku.filter((d) => form[d.status] === "aktif").length / berlaku.length) * 100);
  }

  function labelStatus(nilai) {
    return PILIHAN_STATUS.find(([v]) => v === nilai)?.[1] || "Belum ada";
  }

  const legalSiap = $derived(usaha.filter((u) => skorAdministrasi(u.id) >= 80).length);
  const perluTindakan = $derived(Math.max(0, usaha.length - legalSiap));

  const terlihat = $derived.by(() => {
    const q = cari.trim().toLowerCase();
    return usaha.filter((u) => {
      const a = adminUntuk(u.id);
      const skor = skorAdministrasi(u.id);
      if (saring === "siap" && skor < 80) return false;
      if (saring === "perlu" && skor >= 80) return false;
      if (!q) return true;
      return [u.nama, u.katLabel, u.kat, u.ringkas, u.alamat, u.wa, a?.pemilik, a?.nibNomor, a?.kbliKode]
        .filter(Boolean).join(" ").toLowerCase().includes(q);
    });
  });

  function calonPendaftaran(id) {
    const u = usaha.find((x) => x.id === id);
    const slug = keSlug(u?.nama || "");
    return pendaftar.find((x) => (keSlug(x.nama || "") || x.id) === slug) || null;
  }

  function pilihUsaha(u) {
    terpilih = u.id;
    const a = adminUntuk(u.id);
    const calon = calonPendaftaran(u.id);
    form = {
      ...AWAL,
      pemilik: calon?.pemilik || "",
      ...a
    };
    delete form.id;
    setTimeout(() => document.getElementById("umkm-editor")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function rekomendasiDari(data) {
    if (data.nibStatus !== "aktif") return "Prioritas: verifikasi atau bantu pengurusan NIB melalui OSS.";
    if (data.kbliStatus !== "aktif") return "Cocokkan KBLI dengan kegiatan usaha yang benar-benar dijalankan.";
    if (!["aktif", "tidak_perlu"].includes(data.izinRbaStatus)) return "Cek tingkat risiko usaha dan kebutuhan Sertifikat Standar atau Izin melalui OSS.";
    if (!["aktif", "tidak_perlu"].includes(data.halalStatus)) return "Tinjau kewajiban sertifikat halal sesuai jenis produk dan jalur yang memenuhi syarat.";
    if (!["aktif", "tidak_perlu"].includes(data.sppirtStatus) && !["aktif", "tidak_perlu"].includes(data.bpomStatus)) return "Untuk produk pangan, tentukan apakah jalurnya SPP-IRT, BPOM, atau memang tidak memerlukan keduanya.";
    if (skorForm() < 80) return "Lengkapi dokumen yang masih relevan, tandai dokumen yang tidak berlaku, lalu verifikasi nomor referensinya.";
    return "Administrasi utama sudah cukup rapi. Pantau perubahan data usaha, izin sektoral, dan dokumen yang perlu diperbarui.";
  }

  function isiSaran() {
    form.aksiBerikutnya = rekomendasiDari(form);
  }

  async function simpanProfil() {
    const u = usaha.find((x) => x.id === terpilih);
    if (!u) return;
    sibuk = "simpan";
    try {
      await simpanDokumen(KOLEKSI.USAHA_ADMIN, terpilih, {
        ...form,
        usahaId: terpilih,
        namaUsaha: u.nama || terpilih,
        diperbarui: new Date().toISOString()
      }, false);
      await muatKoleksi(KOLEKSI.USAHA_ADMIN);
      beriTahu("Data internal UMKM dan status legalitas tersimpan.");
    } catch (err) {
      beriTahu(pesanRamah(err));
    }
    sibuk = "";
  }

  async function publikasikan(u) {
    sibuk = "daftar:" + u.id;
    try {
      const idUsaha = keSlug(u.nama) || u.id;
      const jenis = String(u.jenis || "").toLowerCase();
      await simpanDokumen(KOLEKSI.USAHA, idUsaha, {
        nama: u.nama || "Usaha warga",
        kat: jenis.includes("siap") ? "siapsaji" : jenis.includes("kemasan") ? "kemasan" : jenis.includes("jasa") ? "jasa" : "retail",
        katLabel: u.jenis || "Lainnya",
        ringkas: String(u.produk || "").slice(0, 140),
        panjang: u.produk || "",
        wa: u.wa || "",
        alamat: u.alamat || ""
      }, false);
      await simpanDokumen(KOLEKSI.USAHA_ADMIN, idUsaha, {
        ...AWAL,
        usahaId: idUsaha,
        namaUsaha: u.nama || "Usaha warga",
        pemilik: u.pemilik || "",
        statusPendampingan: "belum",
        aksiBerikutnya: "Verifikasi NIB, KBLI, dan perizinan dasar usaha.",
        diperbarui: new Date().toISOString()
      }, false);
      await ubahStatus(KOLEKSI.USAHA_BARU, u.id, STATUS.SELESAI);
      await Promise.all([
        muatKoleksi(KOLEKSI.USAHA),
        muatKoleksi(KOLEKSI.USAHA_ADMIN),
        muatKoleksi(KOLEKSI.USAHA_BARU)
      ]);
      terpilih = idUsaha;
      form = { ...AWAL, ...(adminUntuk(idUsaha) || {}), pemilik: u.pemilik || "" };
      beriTahu("UMKM dipublikasikan dan profil legalitas internal dibuat.");
    } catch (err) {
      beriTahu(pesanRamah(err));
    }
    sibuk = "";
  }

  async function tolak(u) {
    sibuk = "daftar:" + u.id;
    try {
      await ubahStatus(KOLEKSI.USAHA_BARU, u.id, STATUS.DITOLAK);
      await muatKoleksi(KOLEKSI.USAHA_BARU);
      beriTahu("Pendaftaran UMKM ditolak.");
    } catch (err) {
      beriTahu(pesanRamah(err));
    }
    sibuk = "";
  }
</script>

<section class="umkm-head">
  <div>
    <span class="umkm-kicker">Pusat UMKM · internal Petugas</span>
    <h2>UMKM & legalitas usaha warga</h2>
    <p>Kelola pendaftaran, katalog, legalitas, sertifikat, kesiapan usaha, dan tindak lanjut pendampingan dari satu tempat.</p>
  </div>
  <div class="umkm-head-links">
    <a href="https://oss.go.id/" target="_blank" rel="noreferrer">OSS ↗</a>
    <a href="https://bpjph.halal.go.id/" target="_blank" rel="noreferrer">BPJPH ↗</a>
    <a href="https://sppirt.pom.go.id/" target="_blank" rel="noreferrer">SPP-IRT ↗</a>
    <a href="https://dgip.go.id/" target="_blank" rel="noreferrer">DJKI ↗</a>
  </div>
</section>

<section class="umkm-kpi" aria-label="Ringkasan UMKM">
  <article><span>UMKM katalog</span><strong>{usaha.length}</strong><small>Usaha yang tampil ke warga</small></article>
  <article><span>Pendaftar baru</span><strong>{pendaftarBaru.length}</strong><small>Menunggu tinjauan Petugas</small></article>
  <article><span>Administrasi ≥80%</span><strong>{legalSiap}</strong><small>Berdasarkan dokumen yang ditandai relevan</small></article>
  <article><span>Perlu tindakan</span><strong>{perluTindakan}</strong><small>Perlu pemeriksaan atau pendampingan</small></article>
</section>

<section class="umkm-reg-note">
  <div class="umkm-reg-icon">i</div>
  <div>
    <b>Gunakan halaman ini sebagai checklist pendampingan, bukan penetapan hukum otomatis.</b>
    <p>NIB adalah identitas resmi usaha di OSS dan izin lanjutan mengikuti tingkat risiko. Untuk kategori produk yang terkena kewajiban halal, perhatikan implementasi Wajib Halal 18 Oktober 2026. SPP-IRT hanya berlaku untuk jenis pangan industri rumah tangga yang memenuhi ruang lingkupnya.</p>
  </div>
</section>

{#if pendaftarBaru.length}
  <section class="umkm-panel">
    <div class="umkm-panel-head"><div><span class="umkm-kicker">Masuk dari warga</span><h3>Pendaftaran UMKM baru</h3></div><span>{pendaftarBaru.length} menunggu</span></div>
    <div class="umkm-pending-grid">
      {#each pendaftarBaru as u}
        <article class="umkm-pending-card">
          <div class="umkm-pending-top"><span>Baru</span><small>{u.jenis || "Jenis belum diisi"}</small></div>
          <h4>{u.nama || "Usaha warga"}</h4>
          <p>{u.produk || "Belum ada deskripsi produk."}</p>
          <dl><div><dt>Pemilik</dt><dd>{u.pemilik || "-"}</dd></div><div><dt>Kontak</dt><dd>{u.wa || "-"}</dd></div><div><dt>Alamat</dt><dd>{u.alamat || "-"}</dd></div></dl>
          <div class="umkm-actions">
            <button type="button" class="tombol utama" onclick={() => publikasikan(u)} disabled={sibuk === "daftar:" + u.id}>Terima & buat profil</button>
            <button type="button" class="tombol" onclick={() => tolak(u)} disabled={sibuk === "daftar:" + u.id}>Tolak</button>
          </div>
        </article>
      {/each}
    </div>
  </section>
{/if}

<section class="umkm-panel">
  <div class="umkm-panel-head">
    <div><span class="umkm-kicker">Direktori internal</span><h3>Daftar UMKM RW 02</h3></div>
    <a href="#/umkm" target="_blank" rel="noreferrer">Lihat katalog warga ↗</a>
  </div>
  <div class="umkm-toolbar">
    <label><span>Cari UMKM</span><input type="search" bind:value={cari} placeholder="Nama, pemilik, NIB, KBLI, kategori..." /></label>
    <label><span>Status administrasi</span><select bind:value={saring}><option value="semua">Semua UMKM</option><option value="perlu">Perlu tindakan</option><option value="siap">Administrasi ≥80%</option></select></label>
  </div>
  {#if terlihat.length}
    <div class="umkm-list">
      {#each terlihat as u}
        {@const a = adminUntuk(u.id)}
        {@const skor = skorAdministrasi(u.id)}
        <article class:active={terpilih === u.id} class="umkm-row">
          <div class="umkm-avatar">{String(u.nama || "U").slice(0, 1).toUpperCase()}</div>
          <div class="umkm-main"><h4>{u.nama || u.id}</h4><p>{a?.pemilik || u.ringkas || "Pemilik belum dicatat"}</p><small>{u.katLabel || u.kat || "Kategori belum diisi"}{u.alamat ? " · " + u.alamat : ""}</small></div>
          <div class="umkm-legal-mini"><span class={`status-${a?.nibStatus || "belum"}`}>NIB: {labelStatus(a?.nibStatus || "belum")}</span><span>KBLI: {a?.kbliKode || "-"}</span></div>
          <div class="umkm-score"><div style={`--score:${skor}%`}><b>{skor}%</b></div><small>Kelengkapan</small></div>
          <button type="button" class="tombol" onclick={() => pilihUsaha(u)}>Kelola legalitas</button>
        </article>
      {/each}
    </div>
  {:else}
    <div class="umkm-empty">Tidak ada UMKM yang cocok dengan pencarian atau saringan.</div>
  {/if}
</section>

{#if terpilih}
  {@const dipilih = usaha.find((x) => x.id === terpilih)}
  <section class="umkm-editor" id="umkm-editor">
    <div class="umkm-editor-head">
      <div><span class="umkm-kicker">Editor internal</span><h3>{dipilih?.nama || terpilih}</h3><p>Data di bawah tidak ditampilkan di katalog warga. Jangan simpan kata sandi OSS, OTP, PIN, NIK warga, atau scan KTP.</p></div>
      <div class="umkm-score big"><div style={`--score:${skorForm()}%`}><b>{skorForm()}%</b></div><small>Kelengkapan administrasi</small></div>
    </div>

    <form onsubmit={(e) => { e.preventDefault(); simpanProfil(); }}>
      <div class="umkm-section">
        <div class="umkm-section-head"><span>01</span><div><h4>Identitas & klasifikasi usaha</h4><p>Data internal yang membantu Petugas mencocokkan dokumen dengan usaha yang benar.</p></div></div>
        <div class="umkm-form-grid">
          <label><span>Nama pemilik / penanggung jawab</span><input bind:value={form.pemilik} placeholder="Nama lengkap" /></label>
          <label><span>Email usaha</span><input type="email" bind:value={form.email} placeholder="nama@contoh.com" /></label>
          <label><span>RT</span><input bind:value={form.rt} placeholder="RT 01" /></label>
          <label><span>Bentuk usaha</span><select bind:value={form.bentukUsaha}><option value="">Belum dipilih</option><option>Perseorangan</option><option>PT Perorangan</option><option>PT</option><option>CV</option><option>Koperasi</option><option>Yayasan</option><option>Lainnya</option></select></label>
          <label><span>Tingkat risiko OSS</span><select bind:value={form.risikoUsaha}><option value="">Belum ditentukan</option><option>Rendah</option><option>Menengah Rendah</option><option>Menengah Tinggi</option><option>Tinggi</option></select></label>
          <label class="wide"><span>Catatan identitas</span><textarea bind:value={form.catatanIdentitas} placeholder="Contoh: nama dagang berbeda dengan nama di NIB, pindah alamat, perubahan penanggung jawab..."></textarea></label>
        </div>
      </div>

      <div class="umkm-section">
        <div class="umkm-section-head"><span>02</span><div><h4>Legalitas dasar & OSS</h4><p>NIB, KBLI, izin berbasis risiko, perpajakan, dan izin sektoral. Tandai “Tidak berlaku” hanya setelah ditinjau.</p></div></div>
        <div class="umkm-doc-grid">
          {#each LEGAL_DASAR as d}
            <article class="umkm-doc-card">
              <div><h5>{d.label}</h5><p>{d.singkat}</p></div>
              <label><span>Status</span><select value={form[d.status]} onchange={(e) => (form[d.status] = e.currentTarget.value)}>{#each PILIHAN_STATUS as s}<option value={s[0]}>{s[1]}</option>{/each}</select></label>
              <label><span>Nomor / kode referensi</span><input value={form[d.nomor]} oninput={(e) => (form[d.nomor] = e.currentTarget.value)} placeholder="Isi jika tersedia" autocomplete="off" /></label>
            </article>
          {/each}
        </div>
      </div>

      <div class="umkm-section">
        <div class="umkm-section-head"><span>03</span><div><h4>Sertifikat produk & keamanan</h4><p>Dokumen ini bersifat kondisional. Jenis produk, cara produksi, umur simpan, klaim, dan sektor usaha menentukan kebutuhan sebenarnya.</p></div></div>
        <div class="umkm-doc-grid">
          {#each SERTIFIKAT_PRODUK as d}
            <article class="umkm-doc-card">
              <div><h5>{d.label}</h5><p>{d.singkat}</p></div>
              <label><span>Status</span><select value={form[d.status]} onchange={(e) => (form[d.status] = e.currentTarget.value)}>{#each PILIHAN_STATUS as s}<option value={s[0]}>{s[1]}</option>{/each}</select></label>
              <label><span>Nomor sertifikat / izin</span><input value={form[d.nomor]} oninput={(e) => (form[d.nomor] = e.currentTarget.value)} placeholder="Isi jika tersedia" autocomplete="off" /></label>
              {#if d.status === "halalStatus"}<label><span>Jalur halal</span><select bind:value={form.halalJalur}><option value="">Belum ditentukan</option><option>Self declare</option><option>Reguler</option><option>Tidak diketahui</option></select></label>{/if}
            </article>
          {/each}
        </div>
      </div>

      <div class="umkm-section">
        <div class="umkm-section-head"><span>04</span><div><h4>Operasional, merek & tenaga kerja</h4><p>Pelengkap yang perlu ditinjau sesuai bangunan, dampak lingkungan, jumlah pekerja, dan bidang usaha.</p></div></div>
        <div class="umkm-doc-grid">
          {#each OPERASIONAL as d}
            <article class="umkm-doc-card">
              <div><h5>{d.label}</h5><p>{d.singkat}</p></div>
              <label><span>Status</span><select value={form[d.status]} onchange={(e) => (form[d.status] = e.currentTarget.value)}>{#each PILIHAN_STATUS as s}<option value={s[0]}>{s[1]}</option>{/each}</select></label>
              <label><span>Nomor / referensi</span><input value={form[d.nomor]} oninput={(e) => (form[d.nomor] = e.currentTarget.value)} placeholder="Isi jika tersedia" autocomplete="off" /></label>
            </article>
          {/each}
        </div>
      </div>

      <div class="umkm-section">
        <div class="umkm-section-head"><span>05</span><div><h4>Kesiapan usaha & digital</h4><p>Bukan legalitas wajib, tetapi berguna untuk melihat kesiapan UMKM menerima pembayaran, mencatat transaksi, dan masuk kanal digital.</p></div></div>
        <div class="umkm-readiness-grid">
          <label><span>Rekening usaha</span><select bind:value={form.rekeningStatus}><option value="belum">Belum ada</option><option value="proses">Sedang dibuat</option><option value="aktif">Sudah ada</option></select></label>
          <label><span>QRIS / pembayaran digital</span><select bind:value={form.qrisStatus}><option value="belum">Belum ada</option><option value="proses">Sedang diurus</option><option value="aktif">Sudah aktif</option></select></label>
          <label><span>Pembukuan sederhana</span><select bind:value={form.pembukuanStatus}><option value="belum">Belum rutin</option><option value="proses">Mulai diterapkan</option><option value="aktif">Sudah rutin</option></select></label>
          <label><span>Kanal digital</span><select bind:value={form.digitalStatus}><option value="belum">Belum ada</option><option value="proses">Sedang disiapkan</option><option value="aktif">Marketplace / medsos aktif</option></select></label>
        </div>
      </div>

      <div class="umkm-section">
        <div class="umkm-section-head"><span>06</span><div><h4>Pendampingan & action berikutnya</h4><p>Bagian ini menjawab pertanyaan Petugas: setelah data dicek, apa yang harus dilakukan berikutnya?</p></div></div>
        <div class="umkm-form-grid">
          <label><span>Status pendampingan</span><select bind:value={form.statusPendampingan}><option value="belum">Belum ditinjau</option><option value="butuh">Butuh pendampingan</option><option value="proses">Sedang diurus</option><option value="siap">Siap / selesai</option></select></label>
          <label class="wide"><span>Action berikutnya</span><textarea bind:value={form.aksiBerikutnya} placeholder="Contoh: bantu buat NIB, cocokkan KBLI, lanjut sertifikat halal..."></textarea></label>
          <label class="wide"><span>Catatan pendampingan</span><textarea bind:value={form.catatanPendampingan} placeholder="Riwayat komunikasi, kendala, dokumen yang masih ditunggu, jadwal tindak lanjut..."></textarea></label>
          <label class="wide"><span>Dokumen / sertifikat lain</span><textarea bind:value={form.dokumenLain} placeholder="Satu baris per dokumen. Gunakan untuk izin sektoral yang tidak ada di checklist di atas."></textarea></label>
        </div>
        <div class="umkm-editor-actions">
          <button type="button" class="tombol" onclick={isiSaran}>Isi saran action otomatis</button>
          <button type="submit" class="tombol utama" disabled={sibuk === "simpan"}>{sibuk === "simpan" ? "Menyimpan..." : "Simpan profil UMKM"}</button>
        </div>
      </div>
    </form>
  </section>
{/if}

<style>
  .umkm-head,.umkm-panel,.umkm-editor,.umkm-reg-note,.umkm-kpi article{background:#fff;border:1px solid #dfe8e4;border-radius:14px;box-shadow:0 5px 18px rgba(24,66,52,.035)}
  .umkm-head{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;padding:22px 24px;background:linear-gradient(120deg,#f0faf6 0%,#fff 58%,#ecf8f3 100%)}
  .umkm-kicker{display:block;margin-bottom:6px;color:#0b6d59;font-weight:750;font-size:14px;letter-spacing:.025em}
  .umkm-head h2,.umkm-panel h3,.umkm-editor h3{margin:0;color:#14241e;letter-spacing:-.025em}.umkm-head h2{font-size:28px}.umkm-head p{max-width:760px;margin:7px 0 0;color:#65736e;font-size:15px;line-height:1.55}
  .umkm-head-links{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px}.umkm-head-links a,.umkm-panel-head>a{color:#0a6d58;text-decoration:none;font-weight:700;font-size:14px}.umkm-head-links a{padding:9px 11px;border:1px solid #cfe1da;border-radius:8px;background:#fff}
  .umkm-kpi{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:14px}.umkm-kpi article{padding:16px 18px}.umkm-kpi span,.umkm-kpi small{display:block;color:#66736f;font-size:14px}.umkm-kpi strong{display:block;margin:4px 0;font-size:30px;line-height:1;color:#11251e;letter-spacing:-.04em}
  .umkm-reg-note{display:grid;grid-template-columns:42px 1fr;gap:12px;margin-top:14px;padding:14px 16px;background:#f7fbf9}.umkm-reg-icon{width:38px;height:38px;display:grid;place-items:center;border-radius:10px;background:#dff5ec;color:#08735c;font-weight:800}.umkm-reg-note b{font-size:15px}.umkm-reg-note p{margin:4px 0 0;color:#66736f;font-size:14px;line-height:1.55}
  .umkm-panel{margin-top:14px;padding:18px}.umkm-panel-head{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:14px}.umkm-panel-head h3{font-size:20px}.umkm-panel-head>span{padding:5px 9px;border-radius:99px;background:#eff7f4;color:#557069;font-size:14px;font-weight:700}
  .umkm-pending-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.umkm-pending-card{padding:15px;border:1px solid #e3ebe8;border-radius:12px;background:#fbfdfc}.umkm-pending-top{display:flex;justify-content:space-between;gap:8px}.umkm-pending-top>span{padding:4px 8px;border-radius:99px;background:#fff2d8;color:#966412;font-size:14px;font-weight:750}.umkm-pending-top small{color:#71807b}.umkm-pending-card h4{margin:10px 0 5px;font-size:17px}.umkm-pending-card>p{min-height:42px;margin:0;color:#66736f;line-height:1.48}.umkm-pending-card dl{margin:12px 0;display:grid;gap:6px}.umkm-pending-card dl div{display:grid;grid-template-columns:76px 1fr;gap:8px}.umkm-pending-card dt{color:#87918e}.umkm-pending-card dd{margin:0;color:#30423c}.umkm-actions{display:flex;flex-wrap:wrap;gap:8px}
  .umkm-toolbar{display:grid;grid-template-columns:minmax(0,1fr) 240px;gap:12px;margin-bottom:12px}.umkm-toolbar label,.umkm-form-grid label,.umkm-doc-card label,.umkm-readiness-grid label{display:grid;gap:6px}.umkm-toolbar label>span,.umkm-form-grid label>span,.umkm-doc-card label>span,.umkm-readiness-grid label>span{color:#485b54;font-weight:700;font-size:14px}.umkm-toolbar input,.umkm-toolbar select,.umkm-form-grid input,.umkm-form-grid select,.umkm-form-grid textarea,.umkm-doc-card input,.umkm-doc-card select,.umkm-readiness-grid select{width:100%;min-height:42px;padding:9px 11px;border:1px solid #d6e1dd;border-radius:8px;background:#fff;color:#1c2a25;font-size:14px}.umkm-form-grid textarea{min-height:94px;resize:vertical}
  .umkm-list{display:grid}.umkm-row{display:grid;grid-template-columns:44px minmax(180px,1.3fr) minmax(220px,.9fr) 92px auto;align-items:center;gap:12px;padding:12px 6px;border-top:1px solid #edf1ef}.umkm-row:first-child{border-top:0}.umkm-row.active{background:#f1faf6}.umkm-avatar{width:42px;height:42px;display:grid;place-items:center;border-radius:10px;background:#e6f5ef;color:#08755c;font-size:17px;font-weight:800}.umkm-main{min-width:0}.umkm-main h4{margin:0 0 2px;font-size:16px}.umkm-main p,.umkm-main small{display:block;margin:0;color:#68756f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:14px}.umkm-legal-mini{display:grid;gap:4px}.umkm-legal-mini span{font-size:14px;color:#63716c}.umkm-legal-mini .status-aktif{color:#08775d;font-weight:700}.umkm-legal-mini .status-proses{color:#9a6815}.umkm-legal-mini .status-perbarui{color:#ad3948}.umkm-score{display:grid;justify-items:center;gap:3px}.umkm-score>div{--score:0%;width:58px;height:58px;display:grid;place-items:center;border-radius:50%;background:conic-gradient(#0b765f var(--score),#e9efed 0);position:relative}.umkm-score>div:after{content:"";position:absolute;inset:6px;border-radius:50%;background:#fff}.umkm-score b{position:relative;z-index:1;font-size:14px}.umkm-score small{font-size:14px;color:#77837f}.umkm-score.big>div{width:82px;height:82px}.umkm-score.big>div:after{inset:8px}.umkm-score.big b{font-size:18px}.umkm-empty{padding:26px;text-align:center;color:#73807c;background:#f8fbfa;border-radius:10px}
  .umkm-editor{margin-top:14px;overflow:hidden}.umkm-editor-head{display:flex;justify-content:space-between;gap:24px;align-items:center;padding:20px 22px;background:#f1faf6;border-bottom:1px solid #dcebe5}.umkm-editor-head h3{font-size:22px}.umkm-editor-head p{max-width:760px;margin:5px 0 0;color:#67756f;line-height:1.5}.umkm-editor form{padding:0 22px 22px}.umkm-section{padding:20px 0;border-top:1px solid #edf1ef}.umkm-section:first-child{border-top:0}.umkm-section-head{display:grid;grid-template-columns:38px 1fr;gap:12px;margin-bottom:14px}.umkm-section-head>span{width:34px;height:34px;display:grid;place-items:center;border-radius:9px;background:#e4f5ee;color:#08745c;font-weight:800}.umkm-section-head h4{margin:0;font-size:18px;color:#192a24}.umkm-section-head p{margin:3px 0 0;color:#71807a;line-height:1.45}.umkm-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.umkm-form-grid .wide{grid-column:1/-1}.umkm-doc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.umkm-doc-card{display:grid;grid-template-columns:minmax(0,1fr) 190px 220px;gap:12px;align-items:end;padding:14px;border:1px solid #e1e9e6;border-radius:11px;background:#fbfdfc}.umkm-doc-card h5{margin:0;font-size:16px}.umkm-doc-card p{margin:4px 0 0;color:#73807c;font-size:14px;line-height:1.42}.umkm-doc-card label:last-child:nth-child(4){grid-column:2/-1}.umkm-readiness-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.umkm-editor-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:14px}
  @media(max-width:1280px){.umkm-kpi{grid-template-columns:repeat(2,minmax(0,1fr))}.umkm-pending-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.umkm-doc-grid{grid-template-columns:1fr}.umkm-readiness-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.umkm-row{grid-template-columns:44px minmax(180px,1fr) minmax(180px,.8fr) 82px}.umkm-row>button{grid-column:2/-1;justify-self:start}}
  @media(max-width:760px){.umkm-head,.umkm-editor-head{flex-direction:column}.umkm-head-links{justify-content:flex-start}.umkm-kpi,.umkm-pending-grid,.umkm-form-grid,.umkm-readiness-grid,.umkm-toolbar{grid-template-columns:1fr}.umkm-doc-card{grid-template-columns:1fr}.umkm-row{grid-template-columns:42px 1fr}.umkm-legal-mini,.umkm-score,.umkm-row>button{grid-column:2}.umkm-form-grid .wide{grid-column:auto}.umkm-editor form{padding-inline:14px}.umkm-panel{padding:14px}}
</style>
