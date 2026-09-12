<script>
  import { STATUS } from "../../inti/nama.js";
  import { isi, galatMuatPengurus } from "../../keadaan/isi.svelte.js";
  import { sesi, namaPeran } from "../../keadaan/sesi.svelte.js";
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

  const nPengaduan = $derived(hitungStatus(pengaduan, STATUS.BARU));
  const nSurat = $derived(hitungStatus(surat, STATUS.BARU));
  const nReservasi = $derived(hitungStatus(reservasi, STATUS.BARU));
  const nUsaha = $derived(hitungStatus(usahaBaru, STATUS.BARU));
  const nWarga = $derived(warga.filter((x) => x.status === STATUS.BARU).length);
  const totalTugas = $derived(nPengaduan + nSurat + nReservasi + nUsaha + nWarga);

  const operasional = $derived([...pengaduan, ...surat, ...reservasi, ...usahaBaru]);
  const baruTotal = $derived(hitungStatus(operasional, STATUS.BARU));
  const prosesTotal = $derived(hitungStatus(operasional, STATUS.PROSES));
  const selesaiTotal = $derived(hitungStatus(operasional, STATUS.SELESAI));
  const ditolakTotal = $derived(hitungStatus(operasional, "ditolak"));
  const totalStatus = $derived(Math.max(1, baruTotal + prosesTotal + selesaiTotal + ditolakTotal));

  const statusRingkas = $derived([
    { label: "Baru", nilai: baruTotal, kelas: "baru" },
    { label: "Diproses", nilai: prosesTotal, kelas: "proses" },
    { label: "Selesai", nilai: selesaiTotal, kelas: "selesai" },
    { label: "Ditolak", nilai: ditolakTotal, kelas: "ditolak" }
  ]);

  const antrean = $derived([
    ...pengaduan.filter((x) => status(x) === STATUS.BARU).map((x) => ({
      jenis: "Aduan", judul: x.kategori || "Pengaduan warga", rincian: x.tiket || x.lokasi || "Laporan baru", status: status(x), tab: "kiriman"
    })),
    ...surat.filter((x) => status(x) === STATUS.BARU).map((x) => ({
      jenis: "Surat", judul: x.jenis || "Pengajuan surat", rincian: (x.nama || "Warga") + (x.antrean ? " · " + x.antrean : ""), status: status(x), tab: "kiriman"
    })),
    ...reservasi.filter((x) => status(x) === STATUS.BARU).map((x) => ({
      jenis: "Fasilitas", judul: x.fasilitas || "Reservasi fasilitas", rincian: (x.tanggal || "-") + (x.nama ? " · " + x.nama : ""), status: status(x), tab: "kiriman"
    })),
    ...usahaBaru.filter((x) => status(x) === STATUS.BARU).map((x) => ({
      jenis: "UMKM", judul: x.nama || "Pendaftaran usaha", rincian: x.jenis || "Usaha warga", status: status(x), tab: "kiriman"
    })),
    ...warga.filter((x) => x.status === STATUS.BARU).map((x) => ({
      jenis: "Warga", judul: x.nama || "Warga baru", rincian: (x.rt || "RT belum diisi") + (x.blok ? " · " + x.blok : ""), status: STATUS.BARU, tab: "orang"
    }))
  ].slice(0, 10));

  /* [label, key koleksi, data, tab tujuan]. */
  const sumberData = $derived([
    ["Pengaduan", "pengaduan", isi.pengaduan, "kiriman"],
    ["Kontak aduan", "pengaduan_kontak", isi.pengaduan_kontak, "kiriman"],
    ["Pengajuan surat", "surat", isi.surat, "kiriman"],
    ["Reservasi", "reservasi", isi.reservasi, "kiriman"],
    ["Pendaftaran UMKM", "usaha_baru", isi.usaha_baru, "kiriman"],
    ["Warga", "warga", isi.warga, "orang"],
    ["Akun pengurus", "pengurus", isi.pengurus, "orang"],
    ["Penerima bansos", "bansos_penerima", isi.bansos_penerima, "angka"],
    ["Berita / agenda", "pengumuman", isi.pengumuman, "terbit"],
    ["Galeri", "galeri", isi.galeri, "terbit"],
    ["Program kerja", "program", isi.program, "angka"],
    ["Kas RW", "kas", isi.kas, "angka"],
    ["Direktori UMKM", "usaha", isi.usaha, "profil"],
    ["Dokumen", "berkas", isi.berkas, "berkas"],
    ["Jenis surat", "jenis_surat", isi.jenis_surat, "layanan"],
    ["Fasilitas", "fasilitas", isi.fasilitas, "layanan"],
    ["Fasilitas umum", "fasum", isi.fasum, "layanan"],
    ["Agenda rutin", "rutin", isi.rutin, "layanan"],
    ["Bansos", "bansos", isi.bansos, "angka"],
    ["Tautan penting", "tautan", isi.tautan, "lain"],
    ["Forum topik", "forum_topik", isi.forum_topik, "lain"],
    ["Komentar forum", "forum_komentar", isi.forum_komentar, "lain"],
    ["Jadwal fasilitas", "jadwal", isi.jadwal, "layanan"],
    ["Struktur publik", "pengurus_tampil", isi.pengurus_tampil, "profil"],
    ["Batas RT", "batas_rt", isi.batas_rt, "profil"]
  ]);

  const modulTermuat = $derived(sumberData.filter(([, , data]) => data !== null).length);
  const modulTotal = $derived(sumberData.length);
  const persenTermuat = $derived(Math.round((modulTermuat / Math.max(1, modulTotal)) * 100));
  const modulKosong = $derived(sumberData.filter(([, , data]) => Array.isArray(data) && data.length === 0).length);
  const galatJumlah = $derived(Object.keys(galatMuatPengurus).length);

  const publikasiTotal = $derived(
    daftar(isi.pengumuman).length + daftar(isi.galeri).length + daftar(isi.berkas).length + daftar(isi.usaha).length
  );
  const wargaAktif = $derived(warga.filter((x) => x.status === STATUS.AKTIF || x.status === "aktif").length);

  const cepat = [
    ["Layanan masuk", "Tindak lanjuti aduan, surat, reservasi dan UMKM.", "kiriman", "01"],
    ["Warga & pengurus", "Verifikasi warga dan kelola hak akses petugas.", "orang", "02"],
    ["Berita & galeri", "Terbitkan informasi dan dokumentasi terbaru.", "terbit", "03"],
    ["Kas & program", "Perbarui transparansi keuangan dan program kerja.", "angka", "04"],
    ["Layanan & fasilitas", "Atur jenis surat, fasilitas dan jadwal rutin.", "layanan", "05"],
    ["Laporan", "Susun rekap operasional untuk rapat atau arsip.", "laporan", "06"]
  ];
</script>

<section class="admin-command-grid" aria-labelledby="dash-title">
  <div class="admin-command-card">
    <div class="admin-command-glow" aria-hidden="true"></div>
    <div class="admin-command-content">
      <span class="admin-command-kicker">Pusat kendali operasional · RW 02</span>
      <h2 id="dash-title">Selamat bertugas, {namaPeran()}.</h2>
      <p>Prioritas hari ini, layanan warga, dan kesehatan data dirangkum dalam satu workspace supaya pekerjaan lebih cepat dibaca dan ditindaklanjuti.</p>
      <div class="admin-welcome-actions">
        <a class="tombol admin-command-primary" href={link("kiriman")}>Tangani {totalTugas} tugas <span aria-hidden="true">→</span></a>
        <a class="tombol admin-command-secondary" href={link("laporan")}>Susun laporan</a>
      </div>
      <div class="admin-command-meta" aria-label="Ringkasan cepat">
        <span><b>{totalTugas}</b><small>butuh tindakan</small></span>
        <span><b>{prosesTotal}</b><small>sedang diproses</small></span>
        <span><b>{selesaiTotal}</b><small>sudah selesai</small></span>
      </div>
    </div>
  </div>

  <aside class="admin-health-card" aria-label="Kesehatan data dashboard">
    <div class="admin-health-ring" style={`--admin-health:${persenTermuat}%`}>
      <div><strong>{persenTermuat}%</strong><span>siap</span></div>
    </div>
    <div class="admin-health-copy">
      <span class="admin-health-label">Kesiapan data</span>
      <h3>{galatJumlah ? "Perlu perhatian" : "Dashboard tersinkron"}</h3>
      <p>{modulTermuat} dari {modulTotal} modul berhasil dimuat. {modulKosong} modul belum memiliki data.{#if galatJumlah} {galatJumlah} modul mengalami galat baca.{/if}</p>
      <small>{sesi.pengguna?.email || "-"}</small>
    </div>
  </aside>
</section>

<section class="admin-kpi-grid" aria-label="Indikator utama">
  <a class="admin-kpi" data-tone="warning" href={link("kiriman")}>
    <div class="admin-kpi-top"><span class="admin-kpi-icon" aria-hidden="true">↗</span><span class="admin-kpi-trend">Prioritas</span></div>
    <span class="admin-kpi-value">{totalTugas}</span>
    <span class="admin-kpi-label">Tugas baru</span>
    <small>Kiriman yang belum disentuh</small>
  </a>
  <a class="admin-kpi" data-tone="process" href={link("kiriman")}>
    <div class="admin-kpi-top"><span class="admin-kpi-icon" aria-hidden="true">◴</span><span class="admin-kpi-trend">Berjalan</span></div>
    <span class="admin-kpi-value">{prosesTotal}</span>
    <span class="admin-kpi-label">Sedang diproses</span>
    <small>Layanan aktif saat ini</small>
  </a>
  <a class="admin-kpi" data-tone="people" href={link("orang")}>
    <div class="admin-kpi-top"><span class="admin-kpi-icon" aria-hidden="true">◎</span><span class="admin-kpi-trend">Warga</span></div>
    <span class="admin-kpi-value">{wargaAktif}</span>
    <span class="admin-kpi-label">Warga aktif</span>
    <small>{nWarga} menunggu verifikasi</small>
  </a>
  <a class="admin-kpi" data-tone="content" href={link("terbit")}>
    <div class="admin-kpi-top"><span class="admin-kpi-icon" aria-hidden="true">▦</span><span class="admin-kpi-trend">Publik</span></div>
    <span class="admin-kpi-value">{publikasiTotal}</span>
    <span class="admin-kpi-label">Konten publik</span>
    <small>Berita, galeri, dokumen & UMKM</small>
  </a>
  <a class="admin-kpi" data-tone="done" href={link("laporan")}>
    <div class="admin-kpi-top"><span class="admin-kpi-icon" aria-hidden="true">✓</span><span class="admin-kpi-trend">Tuntas</span></div>
    <span class="admin-kpi-value">{selesaiTotal}</span>
    <span class="admin-kpi-label">Selesai ditangani</span>
    <small>Riwayat layanan berstatus selesai</small>
  </a>
</section>

<section class="admin-dashboard-grid">
  <div class="admin-panel admin-priority-panel">
    <div class="admin-panel-head">
      <div><span class="admin-panel-kicker">Perlu tindakan</span><h2>Prioritas terbaru</h2><p>Maksimal 10 item baru dari seluruh kanal layanan.</p></div>
      <a href={link("kiriman")}>Lihat semua <span aria-hidden="true">→</span></a>
    </div>
    {#if antrean.length}
      <div class="admin-task-list">
        {#each antrean as x}
          <a class="admin-task" href={link(x.tab)}>
            <span class="admin-task-type">{x.jenis}</span>
            <div><h3>{x.judul}</h3><p>{x.rincian}</p></div>
            <Lencana status={x.status} />
          </a>
        {/each}
      </div>
    {:else}
      <div class="admin-empty admin-empty-success"><span aria-hidden="true">✓</span><div><b>Tidak ada tugas baru.</b><p>Semua kiriman sudah diproses atau belum ada kiriman masuk.</p></div></div>
    {/if}
  </div>

  <div class="admin-panel admin-status-panel">
    <div class="admin-panel-head"><div><span class="admin-panel-kicker">Ringkasan layanan</span><h2>Status operasional</h2><p>Pengaduan, surat, reservasi dan UMKM.</p></div></div>
    <div class="admin-status-total"><strong>{baruTotal + prosesTotal + selesaiTotal + ditolakTotal}</strong><span>total layanan tercatat</span></div>
    <div class="admin-status-list">
      {#each statusRingkas as s}
        <div class="admin-status-row {s.kelas}">
          <div class="admin-status-label"><span></span><label>{s.label}</label></div>
          <strong>{s.nilai}</strong>
          <div class="admin-status-track" aria-hidden="true"><span style={`width:${Math.round((s.nilai / totalStatus) * 100)}%`}></span></div>
        </div>
      {/each}
    </div>
  </div>
</section>

<section class="admin-panel admin-coverage-panel">
  <div class="admin-panel-head">
    <div><span class="admin-panel-kicker">Kesehatan sistem</span><h2>Cakupan data situs</h2><p>Status seluruh sumber data dalam satu tampilan ringkas.</p></div>
    <a href={link("laporan")}>Buka laporan <span aria-hidden="true">→</span></a>
  </div>
  <div class="admin-data-legend" aria-label="Legenda status data">
    <span><i class="ok"></i> Tersedia</span>
    <span><i class="kosong"></i> Kosong</span>
    <span><i class="belum"></i> Belum dimuat</span>
    <span><i class="gagal"></i> Gagal</span>
  </div>
  <div class="admin-data-grid">
    {#each sumberData as d}
      <a class="admin-data-card" href={link(d[3])}>
        <div class="admin-data-card-head">
          <strong>{d[0]}</strong>
          {#if galatMuatPengurus[d[1]]}<span class="admin-data-state gagal" title="Gagal dimuat"></span>
          {:else if d[2] === null}<span class="admin-data-state belum" title="Belum dimuat"></span>
          {:else if Array.isArray(d[2]) && d[2].length === 0}<span class="admin-data-state kosong" title="Sudah dimuat, belum ada data"></span>
          {:else}<span class="admin-data-state" title="Data tersedia"></span>{/if}
        </div>
        <span class="count">{d[2] === null ? "—" : daftar(d[2]).length}</span>
        <small>{galatMuatPengurus[d[1]] ? "Gagal dimuat" : d[2] === null ? "Belum dimuat" : daftar(d[2]).length ? "Data tersedia" : "Belum ada data"}</small>
      </a>
    {/each}
  </div>
</section>

<section class="admin-panel admin-quick-panel">
  <div class="admin-panel-head"><div><span class="admin-panel-kicker">Jalan pintas</span><h2>Akses cepat pekerjaan rutin</h2><p>Pilih pekerjaan yang ingin dilakukan tanpa mencari menu satu per satu.</p></div></div>
  <div class="admin-quick-grid">
    {#each cepat as x}
      <a class="admin-quick" href={link(x[2])}>
        <span class="admin-quick-index">{x[3]}</span>
        <div><strong>{x[0]}</strong><span>{x[1]}</span></div>
        <b aria-hidden="true">↗</b>
      </a>
    {/each}
  </div>
</section>
