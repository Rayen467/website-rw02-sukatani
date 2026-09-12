<script>
  import { STATUS } from "../../inti/nama.js";
  import { isi, galatMuatPengurus } from "../../keadaan/isi.svelte.js";
  import { namaPeran } from "../../keadaan/sesi.svelte.js";
  import { rute } from "../../keadaan/rute.svelte.js";
  import Lencana from "../../komponen/Lencana.svelte";

  const daftar = (nilai) => Array.isArray(nilai) ? nilai : [];
  const status = (x) => x?.status || STATUS.BARU;
  const hitungStatus = (data, nilai) => daftar(data).filter((x) => status(x) === nilai).length;
  const pangkal = $derived(rute.bagian[0] === "petugas" ? "petugas" : "kelola");
  const link = (tab) => "#/" + pangkal + "/" + tab;

  const pengaduan = $derived(daftar(isi.pengaduan));
  const surat = $derived(daftar(isi.surat));
  const reservasi = $derived(daftar(isi.reservasi));
  const usahaBaru = $derived(daftar(isi.usaha_baru));
  const warga = $derived(daftar(isi.warga));
  const fasilitas = $derived(daftar(isi.fasilitas));
  const jadwal = $derived(daftar(isi.jadwal));
  const rutin = $derived(daftar(isi.rutin));

  const nPengaduan = $derived(hitungStatus(pengaduan, STATUS.BARU));
  const nSurat = $derived(hitungStatus(surat, STATUS.BARU));
  const nReservasi = $derived(hitungStatus(reservasi, STATUS.BARU));
  const nUsaha = $derived(hitungStatus(usahaBaru, STATUS.BARU));
  const nWarga = $derived(warga.filter((x) => x.status === STATUS.BARU).length);
  const totalTugas = $derived(nPengaduan + nSurat + nReservasi + nUsaha + nWarga);

  const operasional = $derived([...pengaduan, ...surat, ...reservasi, ...usahaBaru]);
  const prosesTotal = $derived(hitungStatus(operasional, STATUS.PROSES));
  const selesaiTotal = $derived(hitungStatus(operasional, STATUS.SELESAI));
  const wargaAktif = $derived(warga.filter((x) => x.status === STATUS.AKTIF || x.status === "aktif").length);
  const publikasiTotal = $derived(
    daftar(isi.pengumuman).length + daftar(isi.galeri).length + daftar(isi.berkas).length + daftar(isi.usaha).length
  );

  const sumberData = $derived([
    ["Pengaduan", "pengaduan", isi.pengaduan],
    ["Kontak aduan", "pengaduan_kontak", isi.pengaduan_kontak],
    ["Pengajuan surat", "surat", isi.surat],
    ["Reservasi", "reservasi", isi.reservasi],
    ["Pendaftaran UMKM", "usaha_baru", isi.usaha_baru],
    ["Warga", "warga", isi.warga],
    ["Akun pengurus", "pengurus", isi.pengurus],
    ["Penerima bansos", "bansos_penerima", isi.bansos_penerima],
    ["Berita / agenda", "pengumuman", isi.pengumuman],
    ["Galeri", "galeri", isi.galeri],
    ["Program kerja", "program", isi.program],
    ["Kas RW", "kas", isi.kas],
    ["Direktori UMKM", "usaha", isi.usaha],
    ["Dokumen", "berkas", isi.berkas],
    ["Jenis surat", "jenis_surat", isi.jenis_surat],
    ["Fasilitas", "fasilitas", isi.fasilitas],
    ["Fasilitas umum", "fasum", isi.fasum],
    ["Agenda rutin", "rutin", isi.rutin],
    ["Bansos", "bansos", isi.bansos],
    ["Tautan penting", "tautan", isi.tautan],
    ["Forum topik", "forum_topik", isi.forum_topik],
    ["Komentar forum", "forum_komentar", isi.forum_komentar],
    ["Jadwal fasilitas", "jadwal", isi.jadwal],
    ["Struktur publik", "pengurus_tampil", isi.pengurus_tampil],
    ["Batas RT", "batas_rt", isi.batas_rt]
  ]);

  const modulTermuat = $derived(sumberData.filter(([, , data]) => data !== null).length);
  const modulTotal = $derived(sumberData.length);
  const persenTermuat = $derived(Math.round((modulTermuat / Math.max(1, modulTotal)) * 100));
  const modulKosong = $derived(sumberData.filter(([, , data]) => Array.isArray(data) && data.length === 0).length);
  const galatJumlah = $derived(Object.keys(galatMuatPengurus).length);

  function tanggalDari(nilai) {
    if (!nilai) return null;
    if (typeof nilai?.toDate === "function") return nilai.toDate();
    if (typeof nilai?.seconds === "number") return new Date(nilai.seconds * 1000);
    if (typeof nilai === "number") return new Date(nilai);
    const hasil = new Date(nilai);
    return Number.isNaN(hasil.getTime()) ? null : hasil;
  }

  function waktuItem(x) {
    const kandidat = [
      x?.dibuat, x?.dibuat_pada, x?.createdAt, x?.created_at, x?.waktu,
      x?.tanggal_dibuat, x?.tanggal, x?.updatedAt, x?.diperbarui
    ];
    for (const nilai of kandidat) {
      const hasil = tanggalDari(nilai);
      if (hasil) return hasil;
    }
    return null;
  }

  function kunciTanggal(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function fmtTanggal(date) {
    if (!date) return "-";
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(date);
  }

  function fmtWaktu(date) {
    if (!date) return "baru saja";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
    }).format(date);
  }

  function judulItem(x, jenis) {
    if (jenis === "Surat") return x.jenis || "Permohonan surat";
    if (jenis === "Pengaduan") return x.kategori || x.judul || "Pengaduan warga";
    if (jenis === "Reservasi") return x.fasilitas || x.acara || "Reservasi fasilitas";
    if (jenis === "UMKM") return x.nama || "Pendaftaran UMKM";
    if (jenis === "Warga") return x.nama || "Pendaftaran warga";
    return "Aktivitas layanan";
  }

  function rincianItem(x, jenis) {
    const nama = x.nama || x.email || x.pemohon || "Warga";
    const d = waktuItem(x);
    if (jenis === "Warga") return `${x.rt || "RT -"}${x.blok ? " · " + x.blok : ""}`;
    return `${nama} · ${fmtWaktu(d)}`;
  }

  const semuaAktivitas = $derived.by(() => {
    const gabung = [
      ...surat.map((x) => ({ ...x, _jenis: "Surat" })),
      ...pengaduan.map((x) => ({ ...x, _jenis: "Pengaduan" })),
      ...reservasi.map((x) => ({ ...x, _jenis: "Reservasi" })),
      ...usahaBaru.map((x) => ({ ...x, _jenis: "UMKM" })),
      ...warga.map((x) => ({ ...x, _jenis: "Warga" }))
    ];
    return gabung.sort((a, b) => (waktuItem(b)?.getTime() || 0) - (waktuItem(a)?.getTime() || 0));
  });

  const antrean = $derived(
    semuaAktivitas
      .filter((x) => status(x) === STATUS.BARU || status(x) === STATUS.PROSES)
      .slice(0, 5)
  );

  const aktivitasTerbaru = $derived(semuaAktivitas.slice(0, 4));

  const rentangTrend = $derived.by(() => {
    const hasil = [];
    const kini = new Date();
    kini.setHours(0, 0, 0, 0);
    for (let i = 29; i >= 0; i -= 1) {
      const d = new Date(kini);
      d.setDate(kini.getDate() - i);
      hasil.push({ date: d, key: kunciTanggal(d), surat: 0, pengaduan: 0, reservasi: 0 });
    }
    const indeks = new Map(hasil.map((x, i) => [x.key, i]));
    const isiSeri = (data, nama) => {
      for (const x of data) {
        const d = waktuItem(x);
        if (!d) continue;
        const i = indeks.get(kunciTanggal(d));
        if (i !== undefined) hasil[i][nama] += 1;
      }
    };
    isiSeri(surat, "surat");
    isiSeri(pengaduan, "pengaduan");
    isiSeri(reservasi, "reservasi");
    return hasil;
  });

  const maxTrend = $derived(Math.max(1, ...rentangTrend.flatMap((x) => [x.surat, x.pengaduan, x.reservasi])));

  function titikTrend(nama) {
    const width = 1000;
    const height = 220;
    const bawah = 210;
    return rentangTrend.map((x, i) => {
      const px = (i / Math.max(1, rentangTrend.length - 1)) * width;
      const py = bawah - (x[nama] / maxTrend) * (height - 32);
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    }).join(" ");
  }

  function areaTrend(nama) {
    const titik = titikTrend(nama);
    const daftarTitik = titik.split(" ");
    if (!daftarTitik.length) return "";
    return `M 0 210 L ${daftarTitik.join(" L ")} L 1000 210 Z`;
  }

  const labelTrend = $derived([0, 7, 14, 21, 29].map((i) => ({ i, label: fmtTanggal(rentangTrend[i]?.date) })));

  const jadwalHariIni = $derived.by(() => {
    const hariIni = kunciTanggal(new Date());
    const sumber = [...jadwal, ...rutin];
    const cocok = sumber.filter((x) => {
      const d = waktuItem(x);
      return d ? kunciTanggal(d) === hariIni : false;
    });
    return (cocok.length ? cocok : sumber).slice(0, 4);
  });

  const fasilitasRingkas = $derived.by(() => {
    const hariIni = kunciTanggal(new Date());
    return fasilitas.slice(0, 4).map((f) => {
      const nama = f.nama || f.judul || f.fasilitas || "Fasilitas RW";
      const dipakai = reservasi.some((r) => {
        const tgl = tanggalDari(r.tanggal);
        const samaNama = (r.fasilitas || "").toLowerCase() === String(nama).toLowerCase();
        const aktif = status(r) !== "ditolak" && status(r) !== "batal";
        return samaNama && tgl && kunciTanggal(tgl) === hariIni && aktif;
      });
      return { ...f, _nama: nama, _tersedia: !dipakai };
    });
  });
</script>

<section class="rw-dashboard-hero" aria-labelledby="dash-title">
  <div class="rw-dashboard-hero-copy">
    <span class="rw-dashboard-kicker">☀ Pusat kendali operasional RW 02 Sukatani</span>
    <h2 id="dash-title">Selamat bertugas, {namaPeran()}.</h2>
    <p>Dashboard ini merangkum pekerjaan yang membutuhkan tindakan, kesehatan data, publikasi, dan akses cepat ke seluruh modul pengelolaan RW 02.</p>
    <div class="rw-dashboard-actions">
      <a class="rw-btn rw-btn-primary" href={link("kiriman")}>⌁ <span>Tangani {totalTugas} tugas</span></a>
      <a class="rw-btn rw-btn-secondary" href={link("laporan")}>▤ <span>Susun laporan</span></a>
    </div>
  </div>
  <div class="rw-dashboard-gate" aria-hidden="true">
    <div class="rw-dashboard-cloud cloud-a"></div>
    <div class="rw-dashboard-cloud cloud-b"></div>
    <div class="rw-dashboard-tree tree-a"></div>
    <div class="rw-dashboard-tree tree-b"></div>
    <div class="rw-dashboard-monument"><span>RW 02</span><b>SUKATANI</b></div>
    <div class="rw-dashboard-fence"></div>
  </div>
</section>

<aside class="rw-health-card" aria-label="Kesiapan data dashboard">
  <div class="rw-health-title"><h3>Kesiapan data dashboard</h3><span title="Persentase modul yang sudah berhasil dimuat">ⓘ</span></div>
  <div class="rw-health-main">
    <div class="rw-health-ring" style={`--rw-health:${persenTermuat}%`}><strong>{persenTermuat}%</strong></div>
    <p>{modulTermuat} dari {modulTotal} modul data sudah berhasil dimuat. {modulKosong} modul termuat tetapi belum memiliki data.{#if galatJumlah} {galatJumlah} modul privat mengalami galat baca.{/if}</p>
  </div>
  <div class:warning={galatJumlah > 0} class="rw-health-state">
    <span>{galatJumlah ? "!" : "✓"}</span>
    <div><b>{galatJumlah ? "Perlu perhatian." : "Sistem berjalan dengan baik."}</b><small>{galatJumlah ? "Periksa modul yang gagal dimuat." : "Data operasional sudah tersinkron."}</small></div>
  </div>
</aside>

<section class="rw-kpi-row" aria-label="Ringkasan indikator utama">
  <a class="rw-kpi-card blue" href={link("kiriman")}>
    <span class="rw-kpi-icon">✉</span><div><small>Surat masuk</small><strong>{nSurat}</strong><span>Pengajuan baru</span></div>
  </a>
  <a class="rw-kpi-card red" href={link("kiriman")}>
    <span class="rw-kpi-icon">⌁</span><div><small>Pengaduan baru</small><strong>{nPengaduan}</strong><span>Perlu tindak lanjut</span></div>
  </a>
  <a class="rw-kpi-card green" href={link("kiriman")}>
    <span class="rw-kpi-icon">▣</span><div><small>Reservasi</small><strong>{nReservasi}</strong><span>Permohonan baru</span></div>
  </a>
  <a class="rw-kpi-card green" href={link("orang")}>
    <span class="rw-kpi-icon">♙</span><div><small>Warga aktif</small><strong>{wargaAktif}</strong><span>{nWarga} menunggu verifikasi</span></div>
  </a>
  <a class="rw-kpi-card blue" href={link("terbit")}>
    <span class="rw-kpi-icon">▧</span><div><small>Konten publik</small><strong>{publikasiTotal}</strong><span>Berita, galeri & arsip</span></div>
  </a>
  <a class="rw-kpi-card green" href={link("laporan")}>
    <span class="rw-kpi-icon">✓</span><div><small>Selesai ditangani</small><strong>{selesaiTotal}</strong><span>Riwayat layanan tuntas</span></div>
  </a>
</section>

<section class="rw-dashboard-main-grid">
  <div class="rw-panel rw-trend-panel">
    <div class="rw-panel-head">
      <div><h3>Tren volume layanan</h3><p>Perbandingan jumlah layanan masuk dalam 30 hari terakhir</p></div>
      <div class="rw-panel-filter"><span>Semua layanan⌄</span><span>▣ 30 hari terakhir⌄</span></div>
    </div>
    <div class="rw-chart-wrap">
      <div class="rw-chart-y"><span>{maxTrend}</span><span>{Math.round(maxTrend * .66)}</span><span>{Math.round(maxTrend * .33)}</span><span>0</span></div>
      <svg class="rw-chart" viewBox="0 0 1000 230" preserveAspectRatio="none" role="img" aria-label="Grafik tren surat, pengaduan, dan reservasi 30 hari terakhir">
        <defs>
          <linearGradient id="rw-area-green" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#17a567" stop-opacity=".23"/><stop offset="100%" stop-color="#17a567" stop-opacity="0"/></linearGradient>
        </defs>
        <g class="rw-chart-grid"><line x1="0" y1="28" x2="1000" y2="28"/><line x1="0" y1="88" x2="1000" y2="88"/><line x1="0" y1="148" x2="1000" y2="148"/><line x1="0" y1="210" x2="1000" y2="210"/></g>
        <path class="rw-chart-area" d={areaTrend("surat")} />
        <polyline class="rw-line surat" points={titikTrend("surat")} />
        <polyline class="rw-line pengaduan" points={titikTrend("pengaduan")} />
        <polyline class="rw-line reservasi" points={titikTrend("reservasi")} />
      </svg>
      <div class="rw-chart-x">{#each labelTrend as x}<span style={`left:${(x.i / 29) * 100}%`}>{x.label}</span>{/each}</div>
    </div>
    <div class="rw-chart-legend"><span><i class="surat"></i>Surat masuk</span><span><i class="pengaduan"></i>Pengaduan</span><span><i class="reservasi"></i>Reservasi</span></div>
  </div>

  <div class="rw-panel rw-queue-panel">
    <div class="rw-panel-head compact"><h3>Antrian layanan masuk</h3><a href={link("kiriman")}>Lihat semua →</a></div>
    <div class="rw-queue-tabs"><b>Semua ({totalTugas + prosesTotal})</b><span>Surat ({nSurat})</span><span>Pengaduan ({nPengaduan})</span><span>Reservasi ({nReservasi})</span></div>
    <div class="rw-queue-list">
      {#if antrean.length}
        {#each antrean as x}
          <a class="rw-queue-item" href={link(x._jenis === "Warga" ? "orang" : "kiriman")}>
            <span class="rw-queue-kind" data-kind={x._jenis}>{x._jenis === "Surat" ? "▤" : x._jenis === "Pengaduan" ? "⌁" : x._jenis === "Reservasi" ? "▣" : x._jenis === "Warga" ? "♙" : "◇"}</span>
            <div><b>{judulItem(x, x._jenis)}</b><small>{rincianItem(x, x._jenis)}</small></div>
            <Lencana status={status(x)} />
            <span class="rw-queue-arrow">›</span>
          </a>
        {/each}
      {:else}
        <div class="rw-queue-empty"><span>✓</span><div><b>Tidak ada antrian aktif.</b><small>Semua layanan sudah ditangani.</small></div></div>
      {/if}
    </div>
  </div>
</section>

<section class="rw-bottom-grid">
  <div class="rw-panel rw-mini-panel">
    <div class="rw-panel-head compact"><h3>Aktivitas terbaru</h3><a href={link("laporan")}>Lihat semua →</a></div>
    <div class="rw-mini-list">
      {#each aktivitasTerbaru as x}
        <div class="rw-mini-item"><span class="rw-mini-icon">{x._jenis === "Surat" ? "▤" : x._jenis === "Pengaduan" ? "⌁" : x._jenis === "Reservasi" ? "▣" : x._jenis === "Warga" ? "♙" : "◇"}</span><div><b>{judulItem(x, x._jenis)}</b><small>{rincianItem(x, x._jenis)}</small></div><time>{fmtTanggal(waktuItem(x))}</time></div>
      {/each}
      {#if !aktivitasTerbaru.length}<div class="rw-mini-empty">Belum ada aktivitas terbaru.</div>{/if}
    </div>
  </div>

  <div class="rw-panel rw-mini-panel">
    <div class="rw-panel-head compact"><h3>Jadwal layanan hari ini</h3><a href={link("layanan")}>Lihat semua →</a></div>
    <div class="rw-mini-list">
      {#each jadwalHariIni as x}
        <div class="rw-mini-item"><span class="rw-mini-icon green">▣</span><div><b>{x.judul || x.nama || x.kegiatan || x.fasilitas || "Jadwal layanan"}</b><small>{x.waktu || x.jam || x.keterangan || x.hari || "Jadwal operasional"}</small></div><span class="rw-pill">Terjadwal</span></div>
      {/each}
      {#if !jadwalHariIni.length}<div class="rw-mini-empty">Belum ada jadwal yang dicatat.</div>{/if}
    </div>
  </div>

  <div class="rw-panel rw-mini-panel">
    <div class="rw-panel-head compact"><h3>Fasilitas & ruang</h3><a href={link("layanan")}>Lihat semua →</a></div>
    <div class="rw-mini-list">
      {#each fasilitasRingkas as x}
        <div class="rw-mini-item"><span class="rw-mini-icon green">⌂</span><div><b>{x._nama}</b><small>{x.kapasitas ? `Kapasitas ${x.kapasitas}` : x.keterangan || "Fasilitas RW 02"}</small></div><span class:busy={!x._tersedia} class="rw-pill">{x._tersedia ? "Tersedia" : "Terpakai"}</span></div>
      {/each}
      {#if !fasilitasRingkas.length}<div class="rw-mini-empty">Belum ada fasilitas terdaftar.</div>{/if}
    </div>
  </div>
</section>