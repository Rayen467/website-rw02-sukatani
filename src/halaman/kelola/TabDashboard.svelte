<script>
  import { STATUS } from "../../inti/nama.js";
  import { isi, galatMuatPengurus } from "../../keadaan/isi.svelte.js";
  import { namaPeran } from "../../keadaan/sesi.svelte.js";
  import { rute } from "../../keadaan/rute.svelte.js";
  import Lencana from "../../komponen/Lencana.svelte";

  const daftar = (nilai) => Array.isArray(nilai) ? nilai : [];
  const status = (x) => x?.status || STATUS.BARU;
  const pangkal = $derived(rute.bagian[0] === "petugas" ? "petugas" : "kelola");
  const link = (tab) => "#/" + pangkal + "/" + tab;

  const pengaduan = $derived(daftar(isi.pengaduan));
  const surat = $derived(daftar(isi.surat));
  const reservasi = $derived(daftar(isi.reservasi));
  const usahaBaru = $derived(daftar(isi.usaha_baru));
  const warga = $derived(daftar(isi.warga));
  const fasilitas = $derived(daftar(isi.fasilitas));
  const jadwal = $derived(daftar(isi.jadwal));
  const pengumuman = $derived(daftar(isi.pengumuman));
  const galeri = $derived(daftar(isi.galeri));
  const berkas = $derived(daftar(isi.berkas));
  const usaha = $derived(daftar(isi.usaha));

  let filterAntrean = $state("semua");

  function tanggalDari(nilai) {
    if (!nilai) return null;
    if (typeof nilai?.toDate === "function") return nilai.toDate();
    if (typeof nilai?.seconds === "number") return new Date(nilai.seconds * 1000);
    if (typeof nilai === "number") return new Date(nilai);
    if (typeof nilai === "string" && /^\d{4}-\d{2}-\d{2}$/.test(nilai)) {
      const hasil = new Date(nilai + "T00:00:00+07:00");
      return Number.isNaN(hasil.getTime()) ? null : hasil;
    }
    const hasil = new Date(nilai);
    return Number.isNaN(hasil.getTime()) ? null : hasil;
  }

  function waktuDibuat(x) {
    const kandidat = [
      x?.dibuat, x?.dibuat_pada, x?.createdAt, x?.created_at,
      x?.tanggal_dibuat, x?.updatedAt, x?.diperbarui
    ];
    for (const nilai of kandidat) {
      const hasil = tanggalDari(nilai);
      if (hasil) return hasil;
    }
    return null;
  }

  function tanggalLayanan(x) {
    return tanggalDari(x?.tanggal || x?.tgl || x?.date);
  }

  function keyWib(date) {
    if (!date) return "";
    const bagian = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(date);
    const nilai = Object.fromEntries(bagian.map((x) => [x.type, x.value]));
    return `${nilai.year}-${nilai.month}-${nilai.day}`;
  }

  function formatTanggal(date, lengkap = false) {
    if (!date) return "Tanggal belum tersedia";
    return new Intl.DateTimeFormat("id-ID", lengkap
      ? { timeZone: "Asia/Jakarta", weekday: "long", day: "numeric", month: "long", year: "numeric" }
      : { timeZone: "Asia/Jakarta", day: "numeric", month: "short", year: "numeric" }
    ).format(date);
  }

  function formatWaktu(date) {
    if (!date) return "Waktu belum tersedia";
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
    }).format(date);
  }

  function usiaJam(x) {
    const dibuat = waktuDibuat(x);
    if (!dibuat) return null;
    return Math.max(0, (Date.now() - dibuat.getTime()) / 3600000);
  }

  function usiaLabel(x) {
    const jam = usiaJam(x);
    if (jam === null) return "Usia belum diketahui";
    if (jam < 1) return "Kurang dari 1 jam";
    if (jam < 24) return `${Math.floor(jam)} jam`;
    const hari = Math.floor(jam / 24);
    return `${hari} hari`;
  }

  function judulItem(x) {
    if (x._jenis === "Surat") return x.jenis || "Pengajuan surat";
    if (x._jenis === "Pengaduan") return x.kategori || x.judul || "Pengaduan warga";
    if (x._jenis === "Reservasi") return x.fasilitas || x.acara || "Reservasi fasilitas";
    if (x._jenis === "UMKM") return x.nama || "Pendaftaran UMKM";
    if (x._jenis === "Warga") return x.nama || x.email || "Pendaftaran warga";
    return x.judul || x.nama || "Aktivitas";
  }

  function subjudulItem(x) {
    if (x._jenis === "Warga") {
      return [x.rt, x.blok, x.email].filter(Boolean).join(" · ") || "Profil warga";
    }
    const nama = x.nama || x.pemohon || x.email || "Warga";
    return `${nama} · ${formatWaktu(waktuDibuat(x))}`;
  }

  function ikonJenis(jenis) {
    if (jenis === "Surat") return "▤";
    if (jenis === "Pengaduan") return "!";
    if (jenis === "Reservasi") return "▣";
    if (jenis === "UMKM") return "◇";
    if (jenis === "Warga") return "♙";
    return "•";
  }

  function nadaUsia(x) {
    const jam = usiaJam(x);
    if (jam === null) return "netral";
    if (jam >= 72) return "merah";
    if (jam >= 24) return "kuning";
    return "hijau";
  }

  const semuaAktivitas = $derived.by(() => {
    const gabung = [
      ...surat.map((x) => ({ ...x, _jenis: "Surat", _tab: "kiriman" })),
      ...pengaduan.map((x) => ({ ...x, _jenis: "Pengaduan", _tab: "kiriman" })),
      ...reservasi.map((x) => ({ ...x, _jenis: "Reservasi", _tab: "kiriman" })),
      ...usahaBaru.map((x) => ({ ...x, _jenis: "UMKM", _tab: "umkm" })),
      ...warga.map((x) => ({ ...x, _jenis: "Warga", _tab: "orang" }))
    ];
    return gabung.sort((a, b) => (waktuDibuat(b)?.getTime() || 0) - (waktuDibuat(a)?.getTime() || 0));
  });

  const antreanAktif = $derived.by(() => {
    return semuaAktivitas
      .filter((x) => status(x) === STATUS.BARU || status(x) === STATUS.PROSES)
      .sort((a, b) => {
        const sa = status(a) === STATUS.BARU ? 0 : 1;
        const sb = status(b) === STATUS.BARU ? 0 : 1;
        if (sa !== sb) return sa - sb;
        const ta = waktuDibuat(a)?.getTime() || Number.MAX_SAFE_INTEGER;
        const tb = waktuDibuat(b)?.getTime() || Number.MAX_SAFE_INTEGER;
        return ta - tb;
      });
  });

  const antreanTampil = $derived(
    antreanAktif
      .filter((x) => filterAntrean === "semua" || status(x) === filterAntrean)
      .slice(0, 7)
  );

  const baruTotal = $derived(antreanAktif.filter((x) => status(x) === STATUS.BARU).length);
  const prosesTotal = $derived(antreanAktif.filter((x) => status(x) === STATUS.PROSES).length);
  const lebih72Jam = $derived(antreanAktif.filter((x) => (usiaJam(x) ?? -1) >= 72).length);
  const selesaiTotal = $derived(semuaAktivitas.filter((x) => status(x) === STATUS.SELESAI).length);
  const operasionalTotal = $derived(surat.length + pengaduan.length + reservasi.length + usahaBaru.length);
  const rasioSelesai = $derived(Math.round((selesaiTotal / Math.max(1, operasionalTotal)) * 100));
  const wargaAktif = $derived(warga.filter((x) => status(x) === STATUS.AKTIF || status(x) === "aktif").length);
  const wargaMenunggu = $derived(warga.filter((x) => status(x) === STATUS.BARU).length);
  const profilWargaKurang = $derived(warga.filter((x) => !x?.rt || !x?.wa).length);
  const publikasiTotal = $derived(pengumuman.length + galeri.length + berkas.length + usaha.length);

  const sumberData = $derived([
    ["Pengaduan", isi.pengaduan], ["Kontak aduan", isi.pengaduan_kontak],
    ["Pengajuan surat", isi.surat], ["Reservasi", isi.reservasi],
    ["Pendaftaran UMKM", isi.usaha_baru], ["Warga", isi.warga],
    ["Akun pengurus", isi.pengurus], ["Penerima bansos", isi.bansos_penerima],
    ["Berita / agenda", isi.pengumuman], ["Galeri", isi.galeri],
    ["Program kerja", isi.program], ["Kas RW", isi.kas],
    ["Direktori UMKM", isi.usaha], ["Dokumen", isi.berkas],
    ["Jenis surat", isi.jenis_surat], ["Fasilitas", isi.fasilitas],
    ["Fasilitas umum", isi.fasum], ["Agenda rutin", isi.rutin],
    ["Bansos", isi.bansos], ["Tautan penting", isi.tautan],
    ["Forum topik", isi.forum_topik], ["Komentar forum", isi.forum_komentar],
    ["Jadwal fasilitas", isi.jadwal], ["Struktur publik", isi.pengurus_tampil],
    ["Batas RT", isi.batas_rt]
  ]);

  const modulTermuat = $derived(sumberData.filter(([, data]) => data !== null).length);
  const modulTotal = $derived(sumberData.length);
  const persenTermuat = $derived(Math.round((modulTermuat / Math.max(1, modulTotal)) * 100));
  const modulKosong = $derived(sumberData.filter(([, data]) => Array.isArray(data) && data.length === 0).length);
  const galatData = $derived(Object.entries(galatMuatPengurus));

  const hariIni = $derived(new Date());
  const hariIniKey = $derived(keyWib(hariIni));

  const jadwalHariIni = $derived.by(() => {
    const dariJadwal = jadwal
      .filter((x) => keyWib(tanggalLayanan(x)) === hariIniKey)
      .map((x) => ({ ...x, _jenis: "Jadwal", _nama: x.fasilitas || x.nama || x.judul || "Jadwal fasilitas" }));
    const dariReservasi = reservasi
      .filter((x) => status(x) !== STATUS.DITOLAK && keyWib(tanggalLayanan(x)) === hariIniKey)
      .map((x) => ({ ...x, _jenis: "Reservasi", _nama: x.fasilitas || x.acara || "Reservasi fasilitas" }));
    return [...dariJadwal, ...dariReservasi].slice(0, 5);
  });

  const reservasiMendatang = $derived.by(() => {
    const awal = new Date();
    awal.setHours(0, 0, 0, 0);
    const akhir = new Date(awal);
    akhir.setDate(akhir.getDate() + 7);
    return reservasi
      .map((x) => ({ ...x, _tanggal: tanggalLayanan(x) }))
      .filter((x) => x._tanggal && x._tanggal >= awal && x._tanggal <= akhir && status(x) !== STATUS.DITOLAK && status(x) !== STATUS.SELESAI)
      .sort((a, b) => a._tanggal - b._tanggal)
      .slice(0, 5);
  });

  const publikasiTerakhir = $derived.by(() => {
    const semua = [...pengumuman, ...galeri, ...berkas]
      .map((x) => waktuDibuat(x))
      .filter(Boolean)
      .sort((a, b) => b - a);
    return semua[0] || null;
  });

  const tren7Hari = $derived.by(() => {
    const hasil = [];
    const sekarang = new Date();
    sekarang.setHours(12, 0, 0, 0);
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(sekarang);
      d.setDate(d.getDate() - i);
      hasil.push({ key: keyWib(d), label: new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", weekday: "short" }).format(d), nilai: 0 });
    }
    const map = new Map(hasil.map((x) => [x.key, x]));
    for (const x of semuaAktivitas) {
      const d = waktuDibuat(x);
      if (!d) continue;
      const slot = map.get(keyWib(d));
      if (slot) slot.nilai += 1;
    }
    return hasil;
  });

  const maxTren7 = $derived(Math.max(1, ...tren7Hari.map((x) => x.nilai)));
  const volume7 = $derived(tren7Hari.reduce((jumlah, x) => jumlah + x.nilai, 0));

  const volume7Sebelumnya = $derived.by(() => {
    const sekarang = Date.now();
    const mulai = sekarang - (14 * 86400000);
    const akhir = sekarang - (7 * 86400000);
    return semuaAktivitas.filter((x) => {
      const t = waktuDibuat(x)?.getTime();
      return t && t >= mulai && t < akhir;
    }).length;
  });

  const perubahan7 = $derived.by(() => {
    if (!volume7Sebelumnya) return null;
    return Math.round(((volume7 - volume7Sebelumnya) / volume7Sebelumnya) * 100);
  });

  const campuranLayanan = $derived([
    { label: "Surat", nilai: surat.length },
    { label: "Pengaduan", nilai: pengaduan.length },
    { label: "Reservasi", nilai: reservasi.length },
    { label: "UMKM", nilai: usahaBaru.length }
  ]);
  const totalCampuran = $derived(campuranLayanan.reduce((a, b) => a + b.nilai, 0));

  const ringkasanRisiko = $derived([
    {
      label: "Antrean lebih dari 3 hari",
      nilai: lebih72Jam,
      keterangan: lebih72Jam ? "Periksa item tertua terlebih dahulu." : "Tidak ada antrean lama yang terdeteksi.",
      nada: lebih72Jam ? "merah" : "hijau",
      tab: "kiriman"
    },
    {
      label: "Sumber data bermasalah",
      nilai: galatData.length,
      keterangan: galatData.length ? galatData.map(([nama]) => nama).slice(0, 2).join(", ") : "Seluruh sumber yang dimuat merespons normal.",
      nada: galatData.length ? "merah" : "hijau",
      tab: "dashboard"
    },
    {
      label: "Profil warga perlu dilengkapi",
      nilai: profilWargaKurang,
      keterangan: profilWargaKurang ? "RT atau nomor WhatsApp belum lengkap." : "Data dasar warga terisi lengkap.",
      nada: profilWargaKurang ? "kuning" : "hijau",
      tab: "orang"
    }
  ]);

  const tindakanCepat = [
    ["kiriman", "▤", "Layanan masuk", "Tangani surat, aduan, dan reservasi"],
    ["orang", "♙", "Warga & akses", "Verifikasi warga dan kelola pengurus"],
    ["crud", "⌘", "Pusat data", "Kelola seluruh data dan arsip"],
    ["terbit", "▧", "Publikasi", "Berita, agenda, dan galeri"],
    ["berkas", "□", "Dokumen", "Arsip publik dan video"],
    ["angka", "◇", "Kas & program", "Keuangan dan program kerja"]
  ];
</script>

<div class="ops-dashboard">
  <section class="ops-hero" aria-labelledby="ops-title">
    <div class="ops-hero-main">
      <div class="ops-eyebrow">
        <span class:alert={galatData.length > 0} class="ops-live-dot"></span>
        <span>{galatData.length ? "Perlu pemeriksaan data" : "Operasional normal"}</span>
        <span class="ops-divider">•</span>
        <span>{formatTanggal(hariIni, true)}</span>
      </div>
      <h2 id="ops-title">Command Center RW 02 Sukatani</h2>
      <p>Ringkasan kerja untuk {namaPeran()}: prioritaskan layanan yang menunggu, pantau kualitas data, dan lanjutkan pekerjaan harian dari satu tempat.</p>
      <div class="ops-hero-actions">
        <a class="ops-button primary" href={link("kiriman")}><span>▤</span> Buka {baruTotal + prosesTotal} antrean</a>
        <a class="ops-button" href={link("crud")}><span>⌘</span> Pusat data</a>
        <a class="ops-button subtle" href="#/"><span>↗</span> Situs warga</a>
      </div>
    </div>

    <div class="ops-shift" aria-label="Ringkasan tugas hari ini">
      <div class="ops-shift-head"><span>Ringkasan kerja</span><b>{baruTotal + prosesTotal} aktif</b></div>
      <div class="ops-shift-grid">
        <div><strong>{baruTotal}</strong><span>Baru</span></div>
        <div><strong>{prosesTotal}</strong><span>Diproses</span></div>
        <div><strong>{lebih72Jam}</strong><span>&gt; 3 hari</span></div>
        <div><strong>{jadwalHariIni.length}</strong><span>Jadwal hari ini</span></div>
      </div>
      <p>{lebih72Jam ? "Ada antrean lama. Mulai dari item paling atas di daftar prioritas." : "Tidak ada antrean berusia lebih dari tiga hari yang terdeteksi."}</p>
    </div>
  </section>

  <section class="ops-kpis" aria-label="Indikator utama">
    <a class="ops-kpi" href={link("kiriman")}>
      <span class="ops-kpi-icon">▤</span>
      <div><small>Antrean aktif</small><strong>{baruTotal + prosesTotal}</strong><span>{baruTotal} baru · {prosesTotal} diproses</span></div>
    </a>
    <a class="ops-kpi" href={link("laporan")}>
      <span class="ops-kpi-icon">✓</span>
      <div><small>Rasio selesai</small><strong>{rasioSelesai}%</strong><span>{selesaiTotal} layanan berstatus selesai</span></div>
    </a>
    <a class="ops-kpi" href={link("orang")}>
      <span class="ops-kpi-icon">♙</span>
      <div><small>Warga aktif</small><strong>{wargaAktif}</strong><span>{wargaMenunggu} menunggu verifikasi</span></div>
    </a>
    <a class="ops-kpi" href={link("terbit")}>
      <span class="ops-kpi-icon">▧</span>
      <div><small>Konten publik</small><strong>{publikasiTotal}</strong><span>{publikasiTerakhir ? `Terakhir ${formatTanggal(publikasiTerakhir)}` : "Belum ada tanggal publikasi"}</span></div>
    </a>
  </section>

  <section class="ops-main-grid">
    <article class="ops-card ops-priority">
      <header class="ops-card-head">
        <div><span class="ops-section-kicker">PRIORITAS OPERASIONAL</span><h3>Antrean yang perlu ditangani</h3><p>Item baru ditampilkan lebih dahulu, lalu diurutkan dari yang paling lama.</p></div>
        <a href={link("kiriman")}>Buka semua →</a>
      </header>

      <div class="ops-tabs" role="group" aria-label="Filter antrean">
        <button class:active={filterAntrean === "semua"} type="button" onclick={() => (filterAntrean = "semua")}>Semua <b>{antreanAktif.length}</b></button>
        <button class:active={filterAntrean === STATUS.BARU} type="button" onclick={() => (filterAntrean = STATUS.BARU)}>Baru <b>{baruTotal}</b></button>
        <button class:active={filterAntrean === STATUS.PROSES} type="button" onclick={() => (filterAntrean = STATUS.PROSES)}>Diproses <b>{prosesTotal}</b></button>
      </div>

      <div class="ops-priority-list">
        {#if antreanTampil.length}
          {#each antreanTampil as x}
            <a class="ops-priority-row" href={link(x._tab)}>
              <span class="ops-kind" data-kind={x._jenis}>{ikonJenis(x._jenis)}</span>
              <div class="ops-row-copy">
                <div class="ops-row-title"><b>{judulItem(x)}</b><Lencana status={status(x)} /></div>
                <span>{subjudulItem(x)}</span>
              </div>
              <div class="ops-age" data-tone={nadaUsia(x)}><small>Usia antrean</small><b>{usiaLabel(x)}</b></div>
              <span class="ops-arrow">›</span>
            </a>
          {/each}
        {:else}
          <div class="ops-empty"><span>✓</span><div><b>Tidak ada antrean pada filter ini.</b><p>Daftar akan terisi otomatis saat ada kiriman yang perlu ditangani.</p></div></div>
        {/if}
      </div>
    </article>

    <aside class="ops-card ops-watch">
      <header class="ops-card-head compact"><div><span class="ops-section-kicker">WATCHLIST</span><h3>Hal yang perlu diperhatikan</h3></div></header>
      <div class="ops-watch-list">
        {#each ringkasanRisiko as x}
          <a href={link(x.tab)} class="ops-watch-row" data-tone={x.nada}>
            <span class="ops-watch-mark">{x.nada === "hijau" ? "✓" : x.nada === "merah" ? "!" : "•"}</span>
            <div><b>{x.label}</b><p>{x.keterangan}</p></div>
            <strong>{x.nilai}</strong>
          </a>
        {/each}
      </div>
      <div class="ops-data-health">
        <div class="ops-progress-head"><span>Kesiapan sumber data</span><b>{persenTermuat}%</b></div>
        <div class="ops-progress"><i style={`width:${persenTermuat}%`}></i></div>
        <p>{modulTermuat}/{modulTotal} modul berhasil dimuat · {modulKosong} modul masih kosong.</p>
      </div>
    </aside>
  </section>

  <section class="ops-secondary-grid">
    <article class="ops-card ops-volume">
      <header class="ops-card-head compact">
        <div><span class="ops-section-kicker">7 HARI TERAKHIR</span><h3>Volume aktivitas</h3></div>
        <div class="ops-trend-stat"><strong>{volume7}</strong><span>{perubahan7 === null ? "Belum cukup data pembanding" : `${perubahan7 >= 0 ? "+" : ""}${perubahan7}% vs 7 hari sebelumnya`}</span></div>
      </header>
      <div class="ops-bars" aria-label="Grafik aktivitas tujuh hari terakhir">
        {#each tren7Hari as x}
          <div class="ops-bar-col" title={`${x.label}: ${x.nilai} aktivitas`}>
            <div class="ops-bar-track"><i style={`height:${Math.max(6, (x.nilai / maxTren7) * 100)}%`}></i></div>
            <b>{x.nilai}</b><span>{x.label}</span>
          </div>
        {/each}
      </div>
      <div class="ops-mix">
        {#each campuranLayanan as x}
          <div class="ops-mix-row">
            <span>{x.label}</span>
            <div><i style={`width:${Math.round((x.nilai / Math.max(1, totalCampuran)) * 100)}%`}></i></div>
            <b>{x.nilai}</b>
          </div>
        {/each}
      </div>
    </article>

    <article class="ops-card ops-schedule">
      <header class="ops-card-head compact"><div><span class="ops-section-kicker">JADWAL</span><h3>Hari ini & 7 hari ke depan</h3></div><a href={link("layanan")}>Kelola →</a></header>
      <div class="ops-today">
        <div class="ops-today-date"><strong>{new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "2-digit" }).format(hariIni)}</strong><span>{new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", month: "short" }).format(hariIni)}</span></div>
        <div><b>{jadwalHariIni.length ? `${jadwalHariIni.length} jadwal hari ini` : "Tidak ada jadwal hari ini"}</b><p>{jadwalHariIni.length ? jadwalHariIni.map((x) => x._nama).slice(0, 2).join(" · ") : "Kalender operasional saat ini kosong untuk hari ini."}</p></div>
      </div>
      <div class="ops-upcoming">
        {#if reservasiMendatang.length}
          {#each reservasiMendatang as x}
            <a href={link("kiriman")} class="ops-upcoming-row">
              <time><b>{new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "2-digit" }).format(x._tanggal)}</b><span>{new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", month: "short" }).format(x._tanggal)}</span></time>
              <div><b>{x.fasilitas || "Fasilitas RW"}</b><span>{x.acara || x.nama || "Reservasi warga"}</span></div>
              <Lencana status={status(x)} />
            </a>
          {/each}
        {:else}
          <div class="ops-small-empty">Belum ada reservasi aktif dalam tujuh hari ke depan.</div>
        {/if}
      </div>
    </article>

    <article class="ops-card ops-quick">
      <header class="ops-card-head compact"><div><span class="ops-section-kicker">AKSES CEPAT</span><h3>Pekerjaan utama</h3></div></header>
      <div class="ops-quick-grid">
        {#each tindakanCepat as x}
          <a href={link(x[0])}>
            <span>{x[1]}</span>
            <div><b>{x[2]}</b><small>{x[3]}</small></div>
            <i>›</i>
          </a>
        {/each}
      </div>
    </article>
  </section>

  <section class="ops-footer-grid">
    <article class="ops-card ops-recent">
      <header class="ops-card-head compact"><div><span class="ops-section-kicker">AUDIT TRAIL RINGKAS</span><h3>Aktivitas terbaru</h3></div><a href={link("laporan")}>Laporan →</a></header>
      <div class="ops-recent-list">
        {#if semuaAktivitas.length}
          {#each semuaAktivitas.slice(0, 6) as x}
            <a href={link(x._tab)}>
              <span class="ops-kind small" data-kind={x._jenis}>{ikonJenis(x._jenis)}</span>
              <div><b>{judulItem(x)}</b><span>{subjudulItem(x)}</span></div>
              <time>{waktuDibuat(x) ? formatTanggal(waktuDibuat(x)) : "-"}</time>
            </a>
          {/each}
        {:else}
          <div class="ops-small-empty">Belum ada aktivitas yang dapat dirangkum.</div>
        {/if}
      </div>
    </article>

    <aside class="ops-card ops-governance">
      <header class="ops-card-head compact"><div><span class="ops-section-kicker">TATA KELOLA DATA</span><h3>Kualitas & kelengkapan</h3></div></header>
      <dl>
        <div><dt>Modul termuat</dt><dd>{modulTermuat}/{modulTotal}</dd></div>
        <div><dt>Modul kosong</dt><dd>{modulKosong}</dd></div>
        <div><dt>Profil warga belum lengkap</dt><dd>{profilWargaKurang}</dd></div>
        <div><dt>Fasilitas terdaftar</dt><dd>{fasilitas.length}</dd></div>
        <div><dt>Publikasi terakhir</dt><dd>{publikasiTerakhir ? formatTanggal(publikasiTerakhir) : "Belum ada"}</dd></div>
      </dl>
      <a class="ops-governance-link" href={link("crud")}>Buka Pusat Data <span>→</span></a>
    </aside>
  </section>
</div>

<style>
  .ops-dashboard{display:grid;gap:18px;color:#17231f;font-size:14px;--ops-green:#0b5c4c;--ops-green-2:#0a7b61;--ops-mint:#eaf7f2;--ops-bg:#f5f8f7;--ops-line:#dce6e2;--ops-muted:#697671;--ops-red:#b83a3a;--ops-amber:#a56d06;--ops-shadow:0 10px 30px rgba(32,70,58,.055)}
  .ops-dashboard *{box-sizing:border-box}
  .ops-dashboard a{text-decoration:none}
  .ops-hero{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(300px,.65fr);gap:18px;padding:28px;border:1px solid #d4e7df;border-radius:18px;background:linear-gradient(135deg,#edf8f4 0%,#f9fcfb 54%,#e8f4ef 100%);box-shadow:var(--ops-shadow);overflow:hidden;position:relative}
  .ops-hero::after{content:"";position:absolute;width:320px;height:320px;border-radius:50%;right:-110px;top:-170px;background:radial-gradient(circle,rgba(31,154,116,.14),rgba(31,154,116,0) 70%);pointer-events:none}
  .ops-hero-main{position:relative;z-index:1;align-self:center}
  .ops-eyebrow{display:flex;align-items:center;flex-wrap:wrap;gap:8px;color:#50615b;font-weight:650;margin-bottom:10px}
  .ops-live-dot{width:9px;height:9px;border-radius:50%;background:#18a36f;box-shadow:0 0 0 4px rgba(24,163,111,.11)}
  .ops-live-dot.alert{background:#d34e4e;box-shadow:0 0 0 4px rgba(211,78,78,.11)}
  .ops-divider{color:#aab5b1}
  .ops-hero h2{margin:0;font-size:34px;line-height:1.1;letter-spacing:-.035em;color:#10211c;font-weight:790}
  .ops-hero-main>p{max-width:760px;margin:11px 0 20px;color:#5d6c67;font-size:15px;line-height:1.6}
  .ops-hero-actions{display:flex;flex-wrap:wrap;gap:9px}
  .ops-button{min-height:44px;display:inline-flex;align-items:center;gap:8px;padding:10px 15px;border:1px solid #cdded7;border-radius:9px;background:#fff;color:#21493d;font-weight:750;transition:.18s ease}
  .ops-button:hover{transform:translateY(-1px);box-shadow:0 8px 18px rgba(34,74,61,.09)}
  .ops-button.primary{background:var(--ops-green);border-color:var(--ops-green);color:#fff}
  .ops-button.subtle{background:rgba(255,255,255,.55);color:#61716b}
  .ops-shift{position:relative;z-index:1;padding:18px;border:1px solid rgba(197,221,212,.9);border-radius:14px;background:rgba(255,255,255,.82);backdrop-filter:blur(8px);align-self:stretch}
  .ops-shift-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
  .ops-shift-head span{font-weight:780;color:#263c35}.ops-shift-head b{padding:5px 8px;border-radius:999px;background:#e4f4ed;color:#0d7258;font-size:13px}
  .ops-shift-grid{display:grid;grid-template-columns:1fr 1fr;border:1px solid #e1e9e6;border-radius:11px;overflow:hidden}
  .ops-shift-grid div{padding:12px;border-right:1px solid #e6ecea;border-bottom:1px solid #e6ecea;background:#fff}.ops-shift-grid div:nth-child(2n){border-right:0}.ops-shift-grid div:nth-last-child(-n+2){border-bottom:0}
  .ops-shift-grid strong{display:block;font-size:22px;line-height:1.1;color:#16342b}.ops-shift-grid span{display:block;margin-top:3px;color:#75827e}
  .ops-shift>p{margin:12px 0 0;color:#66736f;line-height:1.5}

  .ops-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
  .ops-kpi{display:grid;grid-template-columns:46px 1fr;align-items:center;gap:12px;padding:17px;background:#fff;border:1px solid var(--ops-line);border-radius:14px;color:inherit;box-shadow:0 5px 18px rgba(30,63,52,.035);transition:.18s ease}
  .ops-kpi:hover{transform:translateY(-2px);border-color:#bfd9cf;box-shadow:0 10px 25px rgba(30,63,52,.075)}
  .ops-kpi-icon{width:46px;height:46px;display:grid;place-items:center;border-radius:12px;background:#edf7f3;color:var(--ops-green);font-size:20px;font-weight:850}
  .ops-kpi small,.ops-kpi span{display:block;color:#6d7975}.ops-kpi small{font-weight:700}.ops-kpi strong{display:block;margin:2px 0;font-size:27px;line-height:1.05;letter-spacing:-.03em;color:#142720}.ops-kpi span{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

  .ops-main-grid{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(320px,.7fr);gap:18px;align-items:start}
  .ops-secondary-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(330px,.85fr) minmax(300px,.7fr);gap:18px;align-items:stretch}
  .ops-footer-grid{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(320px,.65fr);gap:18px;align-items:start}
  .ops-card{background:#fff;border:1px solid var(--ops-line);border-radius:16px;box-shadow:var(--ops-shadow);overflow:hidden}
  .ops-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:19px 20px;border-bottom:1px solid #e7edeb}.ops-card-head.compact{align-items:center}
  .ops-card-head h3{margin:2px 0 0;font-size:19px;line-height:1.2;letter-spacing:-.02em;color:#172b24}.ops-card-head p{margin:5px 0 0;color:#71807b;line-height:1.45}.ops-card-head>a{color:#0a745a;font-weight:750;white-space:nowrap}.ops-section-kicker{font-size:12px;font-weight:800;letter-spacing:.08em;color:#78908a}

  .ops-tabs{display:flex;gap:6px;padding:12px 20px;border-bottom:1px solid #edf1ef;background:#fbfcfc;overflow:auto}
  .ops-tabs button{min-height:36px;padding:7px 11px;border:1px solid transparent;border-radius:8px;background:transparent;color:#65726e;font:inherit;font-weight:700;cursor:pointer;white-space:nowrap}.ops-tabs button b{margin-left:5px}.ops-tabs button.active{background:#eaf6f1;border-color:#cbe2d9;color:#0b674f}
  .ops-priority-list{display:grid}.ops-priority-row{display:grid;grid-template-columns:42px minmax(0,1fr) 104px 18px;align-items:center;gap:12px;padding:14px 20px;color:inherit;border-bottom:1px solid #edf1ef;transition:.15s ease}.ops-priority-row:last-child{border-bottom:0}.ops-priority-row:hover{background:#f8fbfa}
  .ops-kind{width:40px;height:40px;display:grid;place-items:center;border-radius:10px;background:#eef5f2;color:#3d6558;font-size:17px;font-weight:850}.ops-kind[data-kind="Pengaduan"]{background:#fff0ee;color:#b4473d}.ops-kind[data-kind="Surat"]{background:#eef4ff;color:#4269a6}.ops-kind[data-kind="Reservasi"]{background:#edf8f2;color:#277c5d}.ops-kind[data-kind="UMKM"]{background:#fff7e8;color:#9a6b12}.ops-kind[data-kind="Warga"]{background:#f0f2ff;color:#5d62a2}.ops-kind.small{width:36px;height:36px}
  .ops-row-copy{min-width:0}.ops-row-title{display:flex;align-items:center;gap:8px;min-width:0}.ops-row-title>b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#22352f}.ops-row-copy>span{display:block;margin-top:4px;color:#74817d;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .ops-age{text-align:right}.ops-age small{display:block;color:#88938f;font-size:12px}.ops-age b{display:block;margin-top:2px;color:#52615c;font-size:13px}.ops-age[data-tone="merah"] b{color:var(--ops-red)}.ops-age[data-tone="kuning"] b{color:var(--ops-amber)}.ops-age[data-tone="hijau"] b{color:#177458}.ops-arrow{color:#a2aca8;font-size:22px}
  .ops-empty{display:flex;gap:12px;align-items:center;padding:28px 20px;color:#61716b}.ops-empty>span{width:42px;height:42px;display:grid;place-items:center;border-radius:50%;background:#e7f7ef;color:#16825e;font-weight:900}.ops-empty b{display:block;color:#294039}.ops-empty p{margin:3px 0 0}

  .ops-watch-list{display:grid}.ops-watch-row{display:grid;grid-template-columns:34px minmax(0,1fr) auto;gap:10px;align-items:center;padding:15px 18px;border-bottom:1px solid #edf1ef;color:inherit}.ops-watch-mark{width:30px;height:30px;display:grid;place-items:center;border-radius:9px;background:#e7f5ef;color:#147659;font-weight:900}.ops-watch-row[data-tone="merah"] .ops-watch-mark{background:#fff0ef;color:#bb443d}.ops-watch-row[data-tone="kuning"] .ops-watch-mark{background:#fff6df;color:#9b6b0b}.ops-watch-row b{display:block;color:#263a34}.ops-watch-row p{margin:3px 0 0;color:#77847f;line-height:1.4}.ops-watch-row>strong{font-size:23px;color:#263b34}
  .ops-data-health{padding:17px 18px;background:#fbfcfc}.ops-progress-head{display:flex;justify-content:space-between;gap:12px;font-weight:750}.ops-progress{height:8px;margin:9px 0;border-radius:999px;background:#e7eeeb;overflow:hidden}.ops-progress i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#0c765c,#28a77d)}.ops-data-health p{margin:0;color:#71807b}

  .ops-trend-stat{text-align:right}.ops-trend-stat strong{display:block;font-size:24px;color:#16342b}.ops-trend-stat span{display:block;color:#74817d;font-size:12px;margin-top:2px}
  .ops-bars{height:180px;display:grid;grid-template-columns:repeat(7,1fr);gap:9px;align-items:end;padding:22px 20px 12px;border-bottom:1px solid #edf1ef}.ops-bar-col{height:100%;display:grid;grid-template-rows:1fr auto auto;gap:5px;text-align:center;min-width:0}.ops-bar-track{height:100%;display:flex;align-items:flex-end;justify-content:center;border-radius:8px;background:linear-gradient(180deg,#fbfcfc,#f0f5f3);overflow:hidden}.ops-bar-track i{width:58%;min-height:6px;border-radius:7px 7px 3px 3px;background:linear-gradient(180deg,#22a47b,#0c6e56)}.ops-bar-col>b{font-size:12px;color:#40524c}.ops-bar-col>span{font-size:12px;color:#7a8782}
  .ops-mix{display:grid;gap:10px;padding:16px 20px}.ops-mix-row{display:grid;grid-template-columns:84px 1fr 34px;gap:10px;align-items:center}.ops-mix-row>span{color:#5f6f69}.ops-mix-row>div{height:7px;background:#edf2f0;border-radius:999px;overflow:hidden}.ops-mix-row i{display:block;height:100%;border-radius:inherit;background:#6bb79e}.ops-mix-row>b{text-align:right;color:#334840}

  .ops-today{display:grid;grid-template-columns:56px 1fr;gap:12px;align-items:center;padding:16px 18px;border-bottom:1px solid #edf1ef;background:#f9fbfa}.ops-today-date{width:54px;height:58px;display:grid;place-content:center;text-align:center;border-radius:10px;background:#0b624f;color:#fff}.ops-today-date strong{font-size:20px;line-height:1}.ops-today-date span{margin-top:3px;text-transform:uppercase;font-size:11px;font-weight:800;letter-spacing:.06em}.ops-today b{color:#263a34}.ops-today p{margin:3px 0 0;color:#77847f;line-height:1.4}
  .ops-upcoming{display:grid}.ops-upcoming-row{display:grid;grid-template-columns:45px minmax(0,1fr) auto;gap:10px;align-items:center;padding:12px 17px;border-bottom:1px solid #edf1ef;color:inherit}.ops-upcoming-row:last-child{border-bottom:0}.ops-upcoming-row:hover{background:#fafcfb}.ops-upcoming-row time{text-align:center;color:#52645e}.ops-upcoming-row time b{display:block;font-size:17px}.ops-upcoming-row time span{font-size:11px;text-transform:uppercase}.ops-upcoming-row>div{min-width:0}.ops-upcoming-row>div b,.ops-upcoming-row>div span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ops-upcoming-row>div span{margin-top:2px;color:#788580}

  .ops-quick-grid{display:grid;padding:8px}.ops-quick-grid>a{display:grid;grid-template-columns:40px minmax(0,1fr) 16px;gap:10px;align-items:center;padding:11px;border-radius:10px;color:inherit;transition:.15s ease}.ops-quick-grid>a:hover{background:#f2f8f5}.ops-quick-grid>a>span{width:38px;height:38px;display:grid;place-items:center;border-radius:10px;background:#edf7f3;color:#0b6c54;font-size:17px;font-weight:800}.ops-quick-grid b{display:block;color:#263a34}.ops-quick-grid small{display:block;margin-top:2px;color:#77847f;line-height:1.25}.ops-quick-grid i{font-style:normal;color:#9ba6a2;font-size:20px}

  .ops-recent-list{display:grid}.ops-recent-list>a{display:grid;grid-template-columns:38px minmax(0,1fr) 105px;gap:11px;align-items:center;padding:12px 18px;border-bottom:1px solid #edf1ef;color:inherit}.ops-recent-list>a:last-child{border-bottom:0}.ops-recent-list>a:hover{background:#fafcfb}.ops-recent-list div{min-width:0}.ops-recent-list b,.ops-recent-list span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ops-recent-list span{margin-top:3px;color:#77847f}.ops-recent-list time{text-align:right;color:#7e8b86;font-size:12px}
  .ops-governance dl{margin:0;padding:8px 18px}.ops-governance dl>div{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:10px 0;border-bottom:1px solid #edf1ef}.ops-governance dl>div:last-child{border-bottom:0}.ops-governance dt{color:#66736f}.ops-governance dd{margin:0;text-align:right;color:#243a33;font-weight:780}.ops-governance-link{display:flex;align-items:center;justify-content:space-between;margin:7px 18px 17px;padding:11px 12px;border-radius:9px;background:#edf7f3;color:#0b674f;font-weight:800}
  .ops-small-empty{padding:24px 18px;text-align:center;color:#788580}

  @media(max-width:1320px){.ops-secondary-grid{grid-template-columns:1fr 1fr}.ops-quick{grid-column:1/-1}.ops-quick-grid{grid-template-columns:repeat(3,1fr)}}
  @media(max-width:1080px){.ops-hero{grid-template-columns:1fr}.ops-kpis{grid-template-columns:1fr 1fr}.ops-main-grid,.ops-footer-grid{grid-template-columns:1fr}.ops-secondary-grid{grid-template-columns:1fr 1fr}.ops-quick{grid-column:1/-1}}
  @media(max-width:760px){.ops-dashboard{gap:13px}.ops-hero{padding:20px;border-radius:14px}.ops-hero h2{font-size:28px}.ops-hero-actions{display:grid;grid-template-columns:1fr 1fr}.ops-button{justify-content:center}.ops-button.subtle{grid-column:1/-1}.ops-kpis{grid-template-columns:1fr}.ops-main-grid,.ops-secondary-grid,.ops-footer-grid{grid-template-columns:1fr;gap:13px}.ops-quick{grid-column:auto}.ops-quick-grid{grid-template-columns:1fr 1fr}.ops-card{border-radius:14px}.ops-card-head{padding:16px}.ops-priority-row{grid-template-columns:38px minmax(0,1fr) 18px;padding:13px 15px}.ops-age{display:none}.ops-card-head>p{display:none}.ops-bars{padding-inline:14px}.ops-recent-list>a{grid-template-columns:36px minmax(0,1fr)}.ops-recent-list time{display:none}}
  @media(max-width:520px){.ops-eyebrow .ops-divider,.ops-eyebrow span:last-child{display:none}.ops-hero-actions{grid-template-columns:1fr}.ops-button.subtle{grid-column:auto}.ops-shift-grid{grid-template-columns:1fr 1fr}.ops-quick-grid{grid-template-columns:1fr}.ops-card-head{align-items:flex-start}.ops-card-head>a{font-size:13px}.ops-trend-stat{display:none}.ops-tabs{padding-inline:14px}.ops-bars{gap:5px;height:160px}.ops-bar-track i{width:70%}.ops-mix-row{grid-template-columns:72px 1fr 28px}.ops-upcoming-row{grid-template-columns:40px minmax(0,1fr)}.ops-upcoming-row>:last-child{grid-column:2}.ops-watch-row{grid-template-columns:32px minmax(0,1fr) auto}.ops-kpi span{white-space:normal}}
</style>
