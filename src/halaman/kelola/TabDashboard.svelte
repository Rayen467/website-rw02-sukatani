<script>
  import { STATUS } from "../../inti/nama.js";
  import { isi, galatMuatPengurus } from "../../keadaan/isi.svelte.js";
  import { sesi, namaPeran } from "../../keadaan/sesi.svelte.js";
  import Lencana from "../../komponen/Lencana.svelte";

  const daftar = (nilai) => Array.isArray(nilai) ? nilai : [];
  const status = (x) => x?.status || STATUS.BARU;
  const hitungStatus = (data, nilai) => daftar(data).filter((x) => status(x) === nilai).length;

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
      jenis: "Aduan", judul: x.kategori || "Pengaduan warga", rincian: x.tiket || x.lokasi || "Laporan baru", status: status(x), href: "#/kelola/kiriman"
    })),
    ...surat.filter((x) => status(x) === STATUS.BARU).map((x) => ({
      jenis: "Surat", judul: x.jenis || "Pengajuan surat", rincian: (x.nama || "Warga") + (x.antrean ? " · " + x.antrean : ""), status: status(x), href: "#/kelola/kiriman"
    })),
    ...reservasi.filter((x) => status(x) === STATUS.BARU).map((x) => ({
      jenis: "Fasilitas", judul: x.fasilitas || "Reservasi fasilitas", rincian: (x.tanggal || "-") + (x.nama ? " · " + x.nama : ""), status: status(x), href: "#/kelola/kiriman"
    })),
    ...usahaBaru.filter((x) => status(x) === STATUS.BARU).map((x) => ({
      jenis: "UMKM", judul: x.nama || "Pendaftaran usaha", rincian: x.jenis || "Usaha warga", status: status(x), href: "#/kelola/kiriman"
    })),
    ...warga.filter((x) => x.status === STATUS.BARU).map((x) => ({
      jenis: "Warga", judul: x.nama || "Warga baru", rincian: (x.rt || "RT belum diisi") + (x.blok ? " · " + x.blok : ""), status: STATUS.BARU, href: "#/kelola/orang"
    }))
  ].slice(0, 10));

  const sumberData = $derived([
    ["Pengaduan", isi.pengaduan, "#/kelola/kiriman"],
    ["Kontak aduan", isi.pengaduan_kontak, "#/kelola/kiriman"],
    ["Pengajuan surat", isi.surat, "#/kelola/kiriman"],
    ["Reservasi", isi.reservasi, "#/kelola/kiriman"],
    ["Pendaftaran UMKM", isi.usaha_baru, "#/kelola/kiriman"],
    ["Warga", isi.warga, "#/kelola/orang"],
    ["Akun pengurus", isi.pengurus, "#/kelola/orang"],
    ["Penerima bansos", isi.bansos_penerima, "#/kelola/angka"],
    ["Berita / agenda", isi.pengumuman, "#/kelola/terbit"],
    ["Galeri", isi.galeri, "#/kelola/terbit"],
    ["Program kerja", isi.program, "#/kelola/angka"],
    ["Kas RW", isi.kas, "#/kelola/angka"],
    ["Direktori UMKM", isi.usaha, "#/kelola/profil"],
    ["Dokumen", isi.berkas, "#/kelola/berkas"],
    ["Jenis surat", isi.jenis_surat, "#/kelola/layanan"],
    ["Fasilitas", isi.fasilitas, "#/kelola/layanan"],
    ["Fasilitas umum", isi.fasum, "#/kelola/layanan"],
    ["Agenda rutin", isi.rutin, "#/kelola/layanan"],
    ["Bansos", isi.bansos, "#/kelola/angka"],
    ["Tautan penting", isi.tautan, "#/kelola/lain"],
    ["Forum topik", isi.forum_topik, "#/kelola/lain"],
    ["Komentar forum", isi.forum_komentar, "#/kelola/lain"],
    ["Jadwal fasilitas", isi.jadwal, "#/kelola/layanan"],
    ["Struktur publik", isi.pengurus_tampil, "#/kelola/profil"],
    ["Batas RT", isi.batas_rt, "#/kelola/profil"]
  ]);

  const modulTermuat = $derived(sumberData.filter(([, data]) => data !== null).length);
  const modulTotal = $derived(sumberData.length);
  const persenTermuat = $derived(Math.round((modulTermuat / Math.max(1, modulTotal)) * 100));
  const modulKosong = $derived(sumberData.filter(([, data]) => Array.isArray(data) && data.length === 0).length);
  const galatJumlah = $derived(Object.keys(galatMuatPengurus).length);

  const publikasiTotal = $derived(
    daftar(isi.pengumuman).length + daftar(isi.galeri).length + daftar(isi.berkas).length + daftar(isi.usaha).length
  );

  const wargaAktif = $derived(warga.filter((x) => x.status === STATUS.AKTIF || x.status === "aktif").length);

  const cepat = [
    ["Layanan masuk", "Tindak lanjuti aduan, surat, reservasi dan UMKM.", "#/kelola/kiriman"],
    ["Warga & pengurus", "Verifikasi warga dan kelola hak akses petugas.", "#/kelola/orang"],
    ["Berita & galeri", "Terbitkan informasi dan dokumentasi terbaru.", "#/kelola/terbit"],
    ["Kas & program", "Perbarui transparansi keuangan dan program kerja.", "#/kelola/angka"],
    ["Layanan & fasilitas", "Atur jenis surat, fasilitas dan jadwal rutin.", "#/kelola/layanan"],
    ["Laporan", "Susun rekap operasional untuk rapat atau arsip.", "#/kelola/laporan"]
  ];
</script>

<section class="admin-overview-head" aria-labelledby="dash-title">
  <div class="admin-welcome">
    <p class="alis">Pusat kendali operasional</p>
    <h2 id="dash-title">Selamat bertugas, {namaPeran()}.</h2>
    <p>
      Dashboard ini merangkum pekerjaan yang membutuhkan tindakan, kesehatan data,
      publikasi, dan akses cepat ke seluruh modul pengelolaan RW 02.
    </p>
    <div class="admin-welcome-actions">
      <a class="tombol utama" href="#/kelola/kiriman">Tangani {totalTugas} tugas</a>
      <a class="tombol" href="#/kelola/laporan">Susun laporan</a>
    </div>
  </div>

  <div class="admin-health-card" aria-label="Kesehatan data">
    <div class="admin-health-top">
      <strong>Kesiapan data dashboard</strong>
      <span class="admin-health-value">{persenTermuat}%</span>
    </div>
    <div class="admin-progress" aria-hidden="true"><span style={`width:${persenTermuat}%`}></span></div>
    <p>
      {modulTermuat} dari {modulTotal} modul data sudah berhasil dimuat.
      {modulKosong} modul termuat tetapi belum memiliki data.
      {#if galatJumlah} {galatJumlah} modul privat mengalami galat baca.{/if}
    </p>
    <small>{sesi.pengguna?.email || "-"}</small>
  </div>
</section>

<section class="admin-kpi-grid" aria-label="Indikator utama">
  <a class="admin-kpi warning" href="#/kelola/kiriman">
    <div class="admin-kpi-top"><span class="admin-kpi-label">Tugas baru</span><span class="admin-kpi-dot"></span></div>
    <span class="admin-kpi-value">{totalTugas}</span>
    <small>Semua kiriman yang belum disentuh</small>
  </a>
  <a class="admin-kpi" href="#/kelola/kiriman">
    <div class="admin-kpi-top"><span class="admin-kpi-label">Sedang diproses</span><span class="admin-kpi-dot"></span></div>
    <span class="admin-kpi-value">{prosesTotal}</span>
    <small>Layanan yang sedang berjalan</small>
  </a>
  <a class="admin-kpi" href="#/kelola/orang">
    <div class="admin-kpi-top"><span class="admin-kpi-label">Warga aktif</span><span class="admin-kpi-dot"></span></div>
    <span class="admin-kpi-value">{wargaAktif}</span>
    <small>{nWarga} warga menunggu verifikasi</small>
  </a>
  <a class="admin-kpi" href="#/kelola/terbit">
    <div class="admin-kpi-top"><span class="admin-kpi-label">Konten publik</span><span class="admin-kpi-dot"></span></div>
    <span class="admin-kpi-value">{publikasiTotal}</span>
    <small>Berita, galeri, dokumen dan UMKM</small>
  </a>
  <a class="admin-kpi" href="#/kelola/laporan">
    <div class="admin-kpi-top"><span class="admin-kpi-label">Selesai ditangani</span><span class="admin-kpi-dot"></span></div>
    <span class="admin-kpi-value">{selesaiTotal}</span>
    <small>Riwayat layanan berstatus selesai</small>
  </a>
</section>

<section class="admin-dashboard-grid">
  <div class="admin-panel">
    <div class="admin-panel-head">
      <div>
        <h2>Prioritas yang perlu dikerjakan</h2>
        <p>Menampilkan maksimal 10 item baru dari seluruh kanal layanan.</p>
      </div>
      <a href="#/kelola/kiriman">Lihat semua</a>
    </div>

    {#if antrean.length}
      <div class="admin-task-list">
        {#each antrean as x}
          <a class="admin-task" href={x.href}>
            <span class="admin-task-type">{x.jenis}</span>
            <div>
              <h3>{x.judul}</h3>
              <p>{x.rincian}</p>
            </div>
            <Lencana status={x.status} />
          </a>
        {/each}
      </div>
    {:else}
      <div class="admin-empty"><b>Tidak ada tugas baru.</b> Semua kiriman sudah diproses atau belum ada kiriman masuk.</div>
    {/if}
  </div>

  <div class="admin-panel">
    <div class="admin-panel-head">
      <div>
        <h2>Status layanan</h2>
        <p>Gabungan pengaduan, surat, reservasi dan pendaftaran UMKM.</p>
      </div>
    </div>
    <div class="admin-status-list">
      {#each statusRingkas as s}
        <div class="admin-status-row {s.kelas}">
          <label>{s.label}</label>
          <div class="admin-status-track" aria-hidden="true"><span style={`width:${Math.round((s.nilai / totalStatus) * 100)}%`}></span></div>
          <strong>{s.nilai}</strong>
        </div>
      {/each}
    </div>
  </div>
</section>

<section class="admin-panel" style="margin-bottom:18px">
  <div class="admin-panel-head">
    <div>
      <h2>Cakupan data situs</h2>
      <p>Supaya tidak ada modul yang terasa “tidak kedata”, status setiap sumber data terlihat di sini.</p>
    </div>
    <a href="#/kelola/laporan">Buka laporan</a>
  </div>

  <div class="admin-data-grid">
    {#each sumberData as d}
      <a class="admin-data-card" href={d[2]} style="color:inherit;text-decoration:none">
        <div class="admin-data-card-head">
          <strong>{d[0]}</strong>
          {#if galatMuatPengurus[d[0]]}
            <span class="admin-data-state gagal" title="Gagal dimuat"></span>
          {:else if d[1] === null}
            <span class="admin-data-state belum" title="Belum dimuat"></span>
          {:else if Array.isArray(d[1]) && d[1].length === 0}
            <span class="admin-data-state kosong" title="Sudah dimuat, belum ada data"></span>
          {:else}
            <span class="admin-data-state" title="Data tersedia"></span>
          {/if}
        </div>
        <span class="count">{d[1] === null ? "—" : daftar(d[1]).length}</span>
        <small>{d[1] === null ? "Belum dimuat" : daftar(d[1]).length ? "Data tersedia" : "Belum ada data"}</small>
      </a>
    {/each}
  </div>
</section>

<section class="admin-panel">
  <div class="admin-panel-head">
    <div>
      <h2>Akses cepat pekerjaan rutin</h2>
      <p>Menu disusun berdasarkan tugas, bukan berdasarkan nama teknis database.</p>
    </div>
  </div>
  <div class="admin-quick-grid">
    {#each cepat as x}
      <a class="admin-quick" href={x[2]}>
        <strong>{x[0]}</strong>
        <span>{x[1]}</span>
        <b>Buka modul →</b>
      </a>
    {/each}
  </div>
</section>
