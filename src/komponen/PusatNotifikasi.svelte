<script>
  import { isi, muatKoleksi, muatMilikSaya } from "../keadaan/isi.svelte.js";
  import { sesi, pengurus, namaPeran } from "../keadaan/sesi.svelte.js";
  import { KOLEKSI, STATUS } from "../inti/nama.js";
  import { pergi } from "../keadaan/rute.svelte.js";

  let terbuka = $state(false);
  let dibaca = $state(new Set());
  let menyegarkan = $state(false);

  const identitasKunci = $derived(sesi.pengguna?.uid || "publik");

  function kunciSimpan() {
    return `rw02-notifikasi-dibaca:${identitasKunci}`;
  }

  function muatDibaca() {
    if (typeof window === "undefined") return;
    try {
      const nilai = JSON.parse(localStorage.getItem(kunciSimpan()) || "[]");
      dibaca = new Set(Array.isArray(nilai) ? nilai : []);
    } catch (_) {
      dibaca = new Set();
    }
  }

  function simpanDibaca(nilai = dibaca) {
    if (typeof window === "undefined") return;
    try {
      const daftar = Array.from(nilai).slice(-250);
      localStorage.setItem(kunciSimpan(), JSON.stringify(daftar));
    } catch (_) {}
  }

  $effect(() => {
    identitasKunci;
    muatDibaca();
  });

  function waktuMillis(data) {
    const nilai = data?.dibuat || data?.diubah || data?.tanggal || null;
    if (!nilai) return 0;
    if (typeof nilai?.toDate === "function") return nilai.toDate().getTime();
    if (typeof nilai?.seconds === "number") return nilai.seconds * 1000;
    if (nilai instanceof Date) return nilai.getTime();
    const hasil = new Date(nilai).getTime();
    return Number.isFinite(hasil) ? hasil : 0;
  }

  function waktuTeks(ms) {
    if (!ms) return "";
    const beda = Math.max(0, Date.now() - ms);
    const menit = Math.floor(beda / 60000);
    if (menit < 1) return "Baru saja";
    if (menit < 60) return `${menit} menit lalu`;
    const jam = Math.floor(menit / 60);
    if (jam < 24) return `${jam} jam lalu`;
    const hari = Math.floor(jam / 24);
    if (hari < 7) return `${hari} hari lalu`;
    try {
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }).format(new Date(ms));
    } catch (_) {
      return "";
    }
  }

  function potong(teks, maksimum = 105) {
    const nilai = String(teks || "").replace(/\s+/g, " ").trim();
    if (!nilai) return "";
    return nilai.length > maksimum ? `${nilai.slice(0, maksimum - 1)}…` : nilai;
  }

  function namaStatus(status) {
    if (status === STATUS.PROSES) return "sedang diproses";
    if (status === STATUS.SELESAI) return "sudah selesai";
    if (status === STATUS.DITOLAK) return "ditolak";
    if (status === STATUS.BARU) return "sudah diterima";
    return String(status || "diperbarui").replace(/_/g, " ");
  }

  function tambah(hasil, data) {
    hasil.push({
      ...data,
      waktu: data.waktu || 0,
      isi: potong(data.isi)
    });
  }

  const daftarNotifikasi = $derived.by(() => {
    const hasil = [];

    /* Pengumuman RW berlaku untuk semua pengunjung, termasuk yang belum masuk. */
    for (const item of (isi.pengumuman || []).slice(0, 8)) {
      tambah(hasil, {
        id: `pengumuman:${item.id}`,
        jenis: "pengumuman",
        label: "Pengumuman RW",
        judul: item.judul || item.nama || "Informasi terbaru RW 02",
        isi: item.ringkasan || item.deskripsi || item.isi || item.keterangan || "Ada informasi terbaru dari RW 02 Sukatani.",
        alamat: item.id ? `/berita/${encodeURIComponent(item.id)}` : "/berita",
        waktu: waktuMillis(item)
      });
    }

    if (pengurus()) {
      /* Portal pengurus: yang perlu tindakan diprioritaskan sebagai notifikasi. */
      for (const item of isi.surat || []) {
        if (item.status !== STATUS.BARU) continue;
        tambah(hasil, {
          id: `petugas:surat:${item.id}`,
          jenis: "surat",
          label: "Layanan Surat",
          judul: "Pengajuan surat baru",
          isi: item.keperluan || item.jenis || item.jenisSurat || item.nama || "Ada pengajuan surat yang menunggu pemeriksaan.",
          alamat: "/kelola",
          waktu: waktuMillis(item)
        });
      }

      for (const item of isi.reservasi || []) {
        if (item.status !== STATUS.BARU) continue;
        tambah(hasil, {
          id: `petugas:reservasi:${item.id}`,
          jenis: "reservasi",
          label: "Reservasi",
          judul: "Reservasi fasilitas baru",
          isi: item.fasilitas || item.keperluan || item.nama || "Ada permintaan reservasi yang menunggu pemeriksaan.",
          alamat: "/kelola",
          waktu: waktuMillis(item)
        });
      }

      for (const item of isi.usaha_baru || []) {
        if (item.status !== STATUS.BARU) continue;
        tambah(hasil, {
          id: `petugas:usaha:${item.id}`,
          jenis: "umkm",
          label: "UMKM Warga",
          judul: "Pendaftaran UMKM baru",
          isi: item.namaUsaha || item.nama || item.jenisUsaha || "Ada UMKM warga yang menunggu pemeriksaan.",
          alamat: "/kelola",
          waktu: waktuMillis(item)
        });
      }

      for (const item of isi.pengaduan || []) {
        if (item.status && item.status !== STATUS.BARU) continue;
        tambah(hasil, {
          id: `petugas:pengaduan:${item.id}`,
          jenis: "pengaduan",
          label: "Pengaduan Warga",
          judul: "Pengaduan baru masuk",
          isi: item.judul || item.kategori || item.isi || item.keterangan || "Ada laporan warga yang perlu diperiksa.",
          alamat: "/kelola",
          waktu: waktuMillis(item)
        });
      }

      for (const item of isi.warga || []) {
        if (item.status !== STATUS.BARU) continue;
        tambah(hasil, {
          id: `petugas:warga:${item.id}`,
          jenis: "warga",
          label: "Data Warga",
          judul: "Pendaftaran warga baru",
          isi: item.nama || item.email || item.alamat || "Ada akun warga yang menunggu verifikasi.",
          alamat: "/kelola",
          waktu: waktuMillis(item)
        });
      }
    } else if (sesi.pengguna) {
      /* Warga hanya melihat perubahan pada kiriman miliknya sendiri. Data ini
         memang sudah difilter menurut uid oleh muatMilikSaya(). */
      for (const item of isi.surat || []) {
        tambah(hasil, {
          id: `warga:surat:${item.id}:${item.status || "baru"}`,
          jenis: "surat",
          label: "Pengajuan Surat",
          judul: `Pengajuan surat ${namaStatus(item.status)}`,
          isi: item.keperluan || item.jenis || item.jenisSurat || "Lihat perkembangan pengajuan surat Anda.",
          alamat: "/akun",
          waktu: waktuMillis(item)
        });
      }

      for (const item of isi.reservasi || []) {
        tambah(hasil, {
          id: `warga:reservasi:${item.id}:${item.status || "baru"}`,
          jenis: "reservasi",
          label: "Reservasi",
          judul: `Reservasi ${namaStatus(item.status)}`,
          isi: item.fasilitas || item.keperluan || "Lihat perkembangan reservasi fasilitas Anda.",
          alamat: "/akun",
          waktu: waktuMillis(item)
        });
      }

      for (const item of isi.usaha_baru || []) {
        tambah(hasil, {
          id: `warga:usaha:${item.id}:${item.status || "baru"}`,
          jenis: "umkm",
          label: "Pendaftaran UMKM",
          judul: `Pendaftaran UMKM ${namaStatus(item.status)}`,
          isi: item.namaUsaha || item.nama || "Lihat perkembangan pendaftaran UMKM Anda.",
          alamat: "/akun",
          waktu: waktuMillis(item)
        });
      }

      if (sesi.profilWarga?.status === STATUS.AKTIF) {
        tambah(hasil, {
          id: `warga:profil:${sesi.pengguna.uid}:aktif`,
          jenis: "warga",
          label: "Akun Warga",
          judul: "Data warga sudah diverifikasi",
          isi: "Akun Anda sudah terhubung sebagai warga aktif RW 02 Sukatani.",
          alamat: "/akun",
          waktu: waktuMillis(sesi.profilWarga)
        });
      }
    }

    return hasil
      .sort((a, b) => (b.waktu || 0) - (a.waktu || 0))
      .slice(0, 24);
  });

  const jumlahBelum = $derived(daftarNotifikasi.filter((item) => !dibaca.has(item.id)).length);

  function tandaiSatu(id) {
    if (dibaca.has(id)) return;
    const baru = new Set(dibaca);
    baru.add(id);
    dibaca = baru;
    simpanDibaca(baru);
  }

  function tandaiSemua() {
    const baru = new Set(dibaca);
    for (const item of daftarNotifikasi) baru.add(item.id);
    dibaca = baru;
    simpanDibaca(baru);
  }

  function bukaNotifikasi(item) {
    tandaiSatu(item.id);
    terbuka = false;
    if (item.alamat) pergi(item.alamat);
  }

  async function segarkan() {
    if (menyegarkan) return;
    menyegarkan = true;
    try {
      if (pengurus()) {
        await Promise.all([
          muatKoleksi(KOLEKSI.PENGUMUMAN),
          muatKoleksi(KOLEKSI.SURAT),
          muatKoleksi(KOLEKSI.RESERVASI),
          muatKoleksi(KOLEKSI.USAHA_BARU),
          muatKoleksi(KOLEKSI.PENGADUAN),
          muatKoleksi(KOLEKSI.WARGA)
        ]);
      } else if (sesi.pengguna?.uid) {
        await Promise.all([
          muatKoleksi(KOLEKSI.PENGUMUMAN),
          muatMilikSaya(sesi.pengguna.uid)
        ]);
      } else {
        await muatKoleksi(KOLEKSI.PENGUMUMAN);
      }
    } finally {
      menyegarkan = false;
    }
  }

  function tombolKlik(e) {
    e.stopPropagation();
    terbuka = !terbuka;
    if (terbuka) segarkan();
  }
</script>

<svelte:window
  onclick={(e) => {
    if (terbuka && !e.target.closest(".pusat-notifikasi")) terbuka = false;
  }}
  onkeydown={(e) => {
    if (e.key === "Escape") terbuka = false;
  }}
/>

<div class="pusat-notifikasi" onclick={(e) => e.stopPropagation()}>
  <button
    type="button"
    class="tombol-kecil tombol-notifikasi"
    class:aktif={terbuka}
    aria-label={jumlahBelum ? `Notifikasi, ${jumlahBelum} belum dibaca` : "Notifikasi"}
    aria-expanded={terbuka}
    title="Notifikasi"
    onclick={tombolKlik}
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
    <span class="teks teks-label">Notifikasi</span>
    {#if jumlahBelum > 0}
      <span class="badge-notifikasi" aria-hidden="true">{jumlahBelum > 99 ? "99+" : jumlahBelum}</span>
    {/if}
  </button>

  {#if terbuka}
    <section class="panel-notifikasi" aria-label="Pusat notifikasi">
      <div class="kepala-notifikasi">
        <div>
          <strong>Notifikasi</strong>
          <span>
            {#if pengurus()}
              {namaPeran(sesi.peran)} · aktivitas layanan warga
            {:else if sesi.pengguna}
              Akun warga · status layanan & informasi RW
            {:else}
              Informasi terbaru RW 02 Sukatani
            {/if}
          </span>
        </div>
        <button
          class="segar-notifikasi"
          type="button"
          aria-label="Segarkan notifikasi"
          title="Segarkan"
          disabled={menyegarkan}
          onclick={(e) => {
            e.stopPropagation();
            segarkan();
          }}
        >
          <svg class:berputar={menyegarkan} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 6v5h-5" />
            <path d="M4 18v-5h5" />
            <path d="M6.1 9a7 7 0 0 1 11.7-2.6L20 11M4 13l2.2 4.6A7 7 0 0 0 17.9 15" />
          </svg>
        </button>
      </div>

      {#if daftarNotifikasi.length}
        <div class="daftar-notifikasi">
          {#each daftarNotifikasi as item (item.id)}
            <button
              type="button"
              class="baris-notifikasi"
              class:belum={!dibaca.has(item.id)}
              onclick={() => bukaNotifikasi(item)}
            >
              <span class="ikon-notifikasi" data-jenis={item.jenis} aria-hidden="true">
                {#if item.jenis === "surat"}
                  <svg viewBox="0 0 24 24"><path d="M6 3h9l3 3v15H6z" /><path d="M15 3v4h4M9 12h6M9 16h6" /></svg>
                {:else if item.jenis === "reservasi"}
                  <svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></svg>
                {:else if item.jenis === "umkm"}
                  <svg viewBox="0 0 24 24"><path d="M4 10h16l-2-5H6zM6 10v10h12V10M9 20v-6h6v6" /></svg>
                {:else if item.jenis === "pengaduan"}
                  <svg viewBox="0 0 24 24"><path d="M5 5h14v11H9l-4 4z" /><path d="M9 9h6M9 12h4" /></svg>
                {:else if item.jenis === "warga"}
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></svg>
                {:else}
                  <svg viewBox="0 0 24 24"><path d="M4 13h4l9 5V6l-9 5H4zM8 13v6" /></svg>
                {/if}
              </span>

              <span class="isi-notifikasi">
                <span class="meta-notifikasi">
                  <b>{item.label}</b>
                  {#if item.waktu}<small>{waktuTeks(item.waktu)}</small>{/if}
                </span>
                <strong>{item.judul}</strong>
                {#if item.isi}<span>{item.isi}</span>{/if}
              </span>

              {#if !dibaca.has(item.id)}
                <span class="titik-belum" aria-label="Belum dibaca"></span>
              {/if}
            </button>
          {/each}
        </div>

        <div class="kaki-notifikasi">
          <span>{jumlahBelum ? `${jumlahBelum} belum dibaca` : "Semua sudah dibaca"}</span>
          {#if jumlahBelum}
            <button type="button" onclick={tandaiSemua}>Tandai semua dibaca</button>
          {/if}
        </div>
      {:else}
        <div class="kosong-notifikasi">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>
          <strong>Belum ada notifikasi</strong>
          <span>Informasi baru dan perubahan status layanan akan muncul di sini.</span>
        </div>
      {/if}
    </section>
  {/if}
</div>

<style>
  .pusat-notifikasi {
    position: relative;
    flex: none;
  }

  .tombol-notifikasi {
    position: relative;
    padding-right: 10px;
  }

  .badge-notifikasi {
    position: absolute;
    top: -7px;
    right: -7px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border: 2px solid var(--permukaan);
    border-radius: 99px;
    background: #d92d20;
    color: #fff;
    display: grid;
    place-items: center;
    font-size: 9px;
    font-weight: 800;
    line-height: 1;
    box-sizing: border-box;
    box-shadow: 0 2px 7px rgba(0, 0, 0, .18);
  }

  .panel-notifikasi {
    position: absolute;
    top: calc(100% + 11px);
    right: 0;
    width: min(390px, calc(100vw - 24px));
    max-height: min(620px, calc(100vh - 92px));
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: var(--permukaan);
    color: var(--tinta);
    border: 1px solid var(--garis);
    border-radius: 16px;
    box-shadow: 0 18px 55px rgba(10, 36, 28, .22);
    z-index: 90;
  }

  .kepala-notifikasi {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 16px 13px;
    border-bottom: 1px solid var(--garis);
  }

  .kepala-notifikasi > div {
    min-width: 0;
    display: grid;
    gap: 3px;
  }

  .kepala-notifikasi strong {
    font-family: "Sora", sans-serif;
    font-size: 15px;
    font-weight: 750;
    letter-spacing: -.02em;
  }

  .kepala-notifikasi span {
    color: var(--tinta-3);
    font-size: 11px;
    line-height: 1.35;
  }

  .segar-notifikasi {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    flex: none;
    border: 1px solid var(--garis);
    border-radius: 10px;
    background: var(--permukaan-3);
    color: var(--tinta-2);
    cursor: pointer;
  }

  .segar-notifikasi:hover:not(:disabled) {
    border-color: var(--brand);
    color: var(--brand);
  }

  .segar-notifikasi:disabled { opacity: .65; cursor: default; }
  .segar-notifikasi svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  .segar-notifikasi svg.berputar { animation: putar-notifikasi .8s linear infinite; }

  .daftar-notifikasi {
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .baris-notifikasi {
    width: 100%;
    display: grid;
    grid-template-columns: 38px minmax(0, 1fr) 8px;
    gap: 11px;
    align-items: start;
    padding: 13px 15px;
    border: 0;
    border-bottom: 1px solid var(--garis);
    background: var(--permukaan);
    color: inherit;
    text-align: left;
    font-family: "Poppins", sans-serif;
    cursor: pointer;
  }

  .baris-notifikasi:hover { background: var(--permukaan-3); }
  .baris-notifikasi.belum { background: color-mix(in srgb, var(--brand-soft) 62%, var(--permukaan)); }
  .baris-notifikasi.belum:hover { background: color-mix(in srgb, var(--brand-soft) 82%, var(--permukaan)); }

  .ikon-notifikasi {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border-radius: 11px;
    background: var(--brand-soft);
    color: var(--brand);
  }

  .ikon-notifikasi[data-jenis="pengaduan"] { color: #b54708; background: rgba(245, 158, 11, .12); }
  .ikon-notifikasi[data-jenis="surat"] { color: #175cd3; background: rgba(47, 128, 237, .11); }
  .ikon-notifikasi[data-jenis="reservasi"] { color: #7a5af8; background: rgba(122, 90, 248, .11); }
  .ikon-notifikasi[data-jenis="umkm"] { color: #067647; background: rgba(18, 183, 106, .11); }
  .ikon-notifikasi[data-jenis="warga"] { color: #0e7090; background: rgba(6, 148, 162, .11); }
  .ikon-notifikasi svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }

  .isi-notifikasi {
    min-width: 0;
    display: grid;
    gap: 3px;
  }

  .meta-notifikasi {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .meta-notifikasi b {
    color: var(--brand);
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
  }

  .meta-notifikasi small {
    flex: none;
    color: var(--tinta-3);
    font-size: 9.5px;
  }

  .isi-notifikasi > strong {
    font-family: "Sora", sans-serif;
    font-size: 12.5px;
    line-height: 1.35;
    font-weight: 700;
    color: var(--tinta);
  }

  .isi-notifikasi > span:last-child {
    color: var(--tinta-3);
    font-size: 10.5px;
    line-height: 1.45;
  }

  .titik-belum {
    align-self: center;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--brand);
    box-shadow: 0 0 0 3px var(--brand-soft);
  }

  .kaki-notifikasi {
    min-height: 45px;
    padding: 10px 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    border-top: 1px solid var(--garis);
    background: var(--permukaan-3);
  }

  .kaki-notifikasi span { color: var(--tinta-3); font-size: 10.5px; }
  .kaki-notifikasi button {
    border: 0;
    background: none;
    color: var(--brand);
    padding: 4px 0;
    font: inherit;
    font-size: 10.5px;
    font-weight: 700;
    cursor: pointer;
  }
  .kaki-notifikasi button:hover { text-decoration: underline; }

  .kosong-notifikasi {
    min-height: 210px;
    padding: 32px 24px;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 8px;
    text-align: center;
  }

  .kosong-notifikasi svg {
    width: 30px;
    height: 30px;
    margin-bottom: 3px;
    fill: none;
    stroke: var(--brand);
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .kosong-notifikasi strong { font-family: "Sora", sans-serif; font-size: 13px; }
  .kosong-notifikasi span { max-width: 260px; color: var(--tinta-3); font-size: 10.5px; line-height: 1.5; }

  @keyframes putar-notifikasi { to { transform: rotate(360deg); } }

  @media (max-width: 760px) {
    .tombol-notifikasi { width: 36px; height: 36px; justify-content: center; padding: 0; }
    .tombol-notifikasi .teks-label { display: none; }
    .panel-notifikasi {
      position: fixed;
      top: 70px;
      left: 10px;
      right: 10px;
      width: auto;
      max-height: calc(100dvh - 84px);
      border-radius: 15px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .segar-notifikasi svg.berputar { animation: none; }
  }
</style>
