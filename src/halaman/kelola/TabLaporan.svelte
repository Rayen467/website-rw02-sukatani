<script>
  /**
   * Tab Laporan.
   *
   * Menyusun laporan siap cetak DARI DATA YANG SUDAH ADA DI SITUS. Tidak
   * ada satu pun angka yang diketik ulang di sini -- kalau angkanya salah,
   * yang dibetulkan datanya, bukan laporannya. Itu yang membedakannya dari
   * mengetik laporan di Word: laporan dan situs tidak bisa berbeda isi.
   *
   * Pengurus mencentang bagian yang mau dimuat, memilih periode, lalu
   * menekan Susun. Hasilnya bisa dicetak atau disimpan jadi PDF lewat
   * jendela cetak peramban -- tidak perlu pustaka PDF, dan hasilnya bisa
   * dipakai di rapat warga apa adanya.
   *
   * GRAFIKNYA DIGAMBAR SENDIRI, TANPA PUSTAKA
   * Batang kas cuma butuh persegi panjang dan tulisan. Menarik pustaka
   * grafik berukuran ratusan kilobyte untuk itu akan memperlambat situs
   * bagi setiap warga yang membukanya, padahal yang memakai cuma pengurus.
   */
  import { KONTEN } from "../../inti/nama.js";
  import { rupiah, angkaDari, nilai, keDaftar, tanggalHariIni, NAMA_BULAN } from "../../inti/format.js";
  import { IDENTITAS_BAWAAN } from "../../inti/bawaan.js";
  import { isi, kontenNilai } from "../../keadaan/isi.svelte.js";

  const BAGIAN = [
    ["kas", "Laporan kas", "Pemasukan, pengeluaran, saldo, dan grafik per periode"],
    ["program", "Program kerja", "Rencana dan realisasi beserta anggarannya"],
    ["pengaduan", "Pengaduan warga", "Rekap per kategori dan status penanganan"],
    ["surat", "Pelayanan surat", "Jumlah pengajuan per jenis surat"],
    ["warga", "Kependudukan", "Jumlah jiwa, kepala keluarga, sebaran"],
    ["kegiatan", "Kegiatan dan dokumentasi", "Pengumuman terbit dan arsip kegiatan"]
  ];

  let pilih = $state({ kas: true, program: true, pengaduan: true, surat: false, warga: true, kegiatan: false });
  let judul = $state("");
  let periode = $state("");
  let penyusun = $state("");
  let tampil = $state(false);

  const namaRW = $derived(kontenNilai(KONTEN.IDENTITAS, "namaRW", IDENTITAS_BAWAAN.namaRW));
  const wilayah = $derived(kontenNilai(KONTEN.IDENTITAS, "wilayah", IDENTITAS_BAWAAN.wilayah));

  const bulanIni = $derived(NAMA_BULAN[new Date().getMonth()] + " " + new Date().getFullYear());

  /* --- Kas ------------------------------------------------------------ */

  const kas = $derived(isi.kas || []);

  const kasRingkas = $derived.by(() => {
    let masuk = 0, keluar = 0;
    for (const t of kas) {
      const n = angkaDari(t.nominal);
      if (t.jenis === "masuk") masuk += n;
      else keluar += n;
    }
    return { masuk, keluar, saldo: masuk - keluar };
  });

  /**
   * Kas dikelompokkan per periode, urut dari yang paling lama.
   * Periode diambil apa adanya dari isian pengurus, bukan diurai jadi
   * tanggal: pengurus menulis "September 2026", dan menebak-nebak
   * formatnya cuma menghasilkan urutan yang salah tanpa ketahuan.
   */
  const kasPerPeriode = $derived.by(() => {
    const peta = new Map();
    for (const t of kas) {
      const p = t.periode || "Tanpa periode";
      if (!peta.has(p)) peta.set(p, { periode: p, masuk: 0, keluar: 0 });
      const b = peta.get(p);
      const n = angkaDari(t.nominal);
      if (t.jenis === "masuk") b.masuk += n;
      else b.keluar += n;
    }
    return [...peta.values()].reverse();
  });

  const kasTertinggi = $derived(
    Math.max(1, ...kasPerPeriode.flatMap((b) => [b.masuk, b.keluar]))
  );

  /* --- Pengaduan ------------------------------------------------------ */

  const pengaduan = $derived(isi.pengaduan || []);

  const pengaduanKategori = $derived.by(() => {
    const peta = new Map();
    for (const p of pengaduan) {
      const k = p.kategori || "Lainnya";
      peta.set(k, (peta.get(k) || 0) + 1);
    }
    return [...peta.entries()].sort((a, b) => b[1] - a[1]);
  });

  const hitungStatus = (daftar, s) =>
    daftar.filter((x) => (x.status || "baru") === s).length;

  /* --- Surat ---------------------------------------------------------- */

  const surat = $derived(isi.surat || []);

  const suratJenis = $derived.by(() => {
    const peta = new Map();
    for (const x of surat) {
      const j = x.jenis || "Lainnya";
      peta.set(j, (peta.get(j) || 0) + 1);
    }
    return [...peta.entries()].sort((a, b) => b[1] - a[1]);
  });

  /* --- Program -------------------------------------------------------- */

  const program = $derived(isi.program || []);
  const programAnggaran = $derived(
    program.reduce((jml, p) => jml + angkaDari(p.anggaran), 0)
  );

  function susun() {
    tampil = true;
    /* Menunggu satu putaran supaya bagian laporannya sudah tergambar
       sebelum layar digulung ke sana. */
    setTimeout(() => {
      const el = document.getElementById("hasil-laporan");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  const adaYangDipilih = $derived(Object.values(pilih).some(Boolean));
</script>

<section class="blok tanpa-cetak">
  <div class="kepala-bagian"><h2>Susun laporan</h2></div>

  <div class="catatan" style="margin-bottom:18px">
    <b>Angkanya diambil dari data yang sudah ada di situs.</b>
    Tidak ada yang perlu diketik ulang, dan laporan tidak mungkin berbeda isi
    dengan yang dilihat warga. Kalau ada angka yang keliru, betulkan datanya
    di tab yang bersangkutan, lalu susun ulang laporan ini.
  </div>

  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); susun(); }}>
    <div class="isian">
      <label for="lp-judul">Judul laporan</label>
      <input id="lp-judul" bind:value={judul} placeholder="Laporan Pertanggungjawaban Pengurus RW" />
    </div>
    <div class="isian">
      <label for="lp-periode">Periode</label>
      <input id="lp-periode" bind:value={periode} placeholder={bulanIni} />
    </div>
    <div class="isian">
      <label for="lp-penyusun">Disusun oleh</label>
      <input id="lp-penyusun" bind:value={penyusun} placeholder="Sekretaris RW" />
    </div>

    <div class="isian">
      <span class="label-blok">Bagian yang dimuat</span>
      <div class="centang-daftar">
        {#each BAGIAN as [kunci, nama, ket]}
          <label class="centang">
            <input type="checkbox" bind:checked={pilih[kunci]} />
            <span>
              <b>{nama}</b>
              <span class="petunjuk">{ket}</span>
            </span>
          </label>
        {/each}
      </div>
    </div>

    <div class="baris-tombol">
      <button class="tombol utama" type="submit" disabled={!adaYangDipilih}>Susun laporan</button>
      {#if tampil}
        <button class="tombol" type="button" onclick={() => window.print()}>Cetak atau simpan PDF</button>
        <button class="tombol" type="button" onclick={() => (tampil = false)}>Tutup</button>
      {/if}
    </div>
    {#if !adaYangDipilih}
      <p class="catatan-borang">Centang minimal satu bagian.</p>
    {/if}
  </form>
</section>

{#if tampil}
  <section class="blok" id="hasil-laporan">
    <div class="surat laporan">
      <div class="kop">
        <b>{judul || "Laporan Pengurus " + namaRW}</b>
        <span>{namaRW} &middot; {wilayah}</span>
        <span>Periode {nilai(periode || bulanIni)}</span>
      </div>

      {#if pilih.kas}
        <h3>Laporan kas</h3>
        {#if kas.length}
          <div class="deret-angka">
            <div class="angka"><span class="label">Pemasukan</span><span class="besar">{rupiah(kasRingkas.masuk)}</span></div>
            <div class="angka"><span class="label">Pengeluaran</span><span class="besar">{rupiah(kasRingkas.keluar)}</span></div>
            <div class="angka"><span class="label">Saldo</span><span class="besar">{rupiah(kasRingkas.saldo)}</span></div>
          </div>

          {#if kasPerPeriode.length > 1}
            <p class="alis" style="margin-top:18px">Pemasukan dan pengeluaran per periode</p>
            <div class="grafik">
              {#each kasPerPeriode as b}
                <div class="grafik-baris">
                  <span class="grafik-nama">{b.periode}</span>
                  <span class="grafik-batang">
                    <span class="isi-masuk" style="width:{(b.masuk / kasTertinggi) * 100}%"></span>
                    <span class="isi-keluar" style="width:{(b.keluar / kasTertinggi) * 100}%"></span>
                  </span>
                  <span class="grafik-nilai">
                    <span class="naik">{rupiah(b.masuk)}</span>
                    <span class="turun">{rupiah(b.keluar)}</span>
                  </span>
                </div>
              {/each}
            </div>
            <p class="keterangan">Batang atas pemasukan, batang bawah pengeluaran. Panjangnya sebanding dengan nilai terbesar.</p>
          {/if}

          <div class="tabel-bungkus" style="margin-top:16px">
            <table class="data">
              <thead><tr><th>Periode</th><th>Tanggal</th><th>Keterangan</th><th>Masuk</th><th>Keluar</th></tr></thead>
              <tbody>
                {#each kas as t}
                  <tr>
                    <td>{t.periode || "-"}</td>
                    <td>{t.tgl || "-"}</td>
                    <td>{t.ket}</td>
                    <td>{t.jenis === "masuk" ? rupiah(t.nominal) : ""}</td>
                    <td>{t.jenis === "masuk" ? "" : rupiah(t.nominal)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <p class="kosong">Belum ada catatan kas.</p>
        {/if}
      {/if}

      {#if pilih.program}
        <h3>Program kerja</h3>
        {#if program.length}
          <p>Total anggaran tercatat: <b>{rupiah(programAnggaran)}</b> untuk {program.length} program.</p>
          <div class="tabel-bungkus">
            <table class="data">
              <thead><tr><th>Program</th><th>Tahun</th><th>Status</th><th>Anggaran</th></tr></thead>
              <tbody>
                {#each program as p}
                  <tr>
                    <td>{p.nama}<br /><span class="keterangan">{p.ket || ""}</span></td>
                    <td>{p.tahun || "-"}</td>
                    <td>{p.status || "-"}</td>
                    <td>{rupiah(p.anggaran)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <p class="kosong">Belum ada program tercatat.</p>
        {/if}
      {/if}

      {#if pilih.pengaduan}
        <h3>Pengaduan warga</h3>
        {#if pengaduan.length}
          <p>
            Masuk <b>{pengaduan.length}</b> laporan.
            Selesai {hitungStatus(pengaduan, "selesai")},
            sedang diproses {hitungStatus(pengaduan, "proses")},
            belum ditangani {hitungStatus(pengaduan, "baru")}.
          </p>
          <div class="tabel-bungkus">
            <table class="data">
              <thead><tr><th>Kategori</th><th>Jumlah</th></tr></thead>
              <tbody>
                {#each pengaduanKategori as [kat, jml]}
                  <tr><td>{kat}</td><td>{jml}</td></tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <p class="kosong">Belum ada pengaduan masuk.</p>
        {/if}
      {/if}

      {#if pilih.surat}
        <h3>Pelayanan surat</h3>
        {#if surat.length}
          <p>
            Diajukan <b>{surat.length}</b> permohonan.
            Selesai {hitungStatus(surat, "selesai")},
            diproses {hitungStatus(surat, "proses")},
            menunggu {hitungStatus(surat, "baru")}.
          </p>
          <div class="tabel-bungkus">
            <table class="data">
              <thead><tr><th>Jenis surat</th><th>Jumlah</th></tr></thead>
              <tbody>
                {#each suratJenis as [jenis, jml]}
                  <tr><td>{jenis}</td><td>{jml}</td></tr>
                {/each}
              </tbody>
            </table>
          </div>
          <p class="keterangan">Nomor induk kependudukan pemohon tidak dimuat di laporan ini.</p>
        {:else}
          <p class="kosong">Belum ada pengajuan surat.</p>
        {/if}
      {/if}

      {#if pilih.warga}
        <h3>Kependudukan</h3>
        <div class="deret-angka">
          <div class="angka"><span class="label">Jumlah jiwa</span><span class="besar">{nilai(kontenNilai(KONTEN.KEPENDUDUKAN, "jiwa"))}</span></div>
          <div class="angka"><span class="label">Kepala keluarga</span><span class="besar">{nilai(kontenNilai(KONTEN.KEPENDUDUKAN, "kk"))}</span></div>
          <div class="angka"><span class="label">Laki-laki</span><span class="besar">{nilai(kontenNilai(KONTEN.KEPENDUDUKAN, "lakilaki"))}</span></div>
          <div class="angka"><span class="label">Perempuan</span><span class="besar">{nilai(kontenNilai(KONTEN.KEPENDUDUKAN, "perempuan"))}</span></div>
        </div>
        {#if (isi.batas_rt || []).length}
          <div class="tabel-bungkus" style="margin-top:16px">
            <table class="data">
              <thead><tr><th>RT</th><th>Cakupan</th><th>Ketua</th></tr></thead>
              <tbody>
                {#each isi.batas_rt as r}
                  <tr><td>{r.rt}</td><td>{r.blok || "-"}</td><td>{r.ketua || "-"}</td></tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      {/if}

      {#if pilih.kegiatan}
        <h3>Kegiatan dan dokumentasi</h3>
        {#if (isi.pengumuman || []).length || (isi.galeri || []).length}
          <p>
            Terbit <b>{(isi.pengumuman || []).length}</b> pengumuman dan agenda,
            terarsip <b>{(isi.galeri || []).length}</b> kegiatan.
          </p>
          {#if (isi.galeri || []).length}
            <div class="tabel-bungkus">
              <table class="data">
                <thead><tr><th>Kegiatan</th><th>Jumlah foto</th><th>Keterangan</th></tr></thead>
                <tbody>
                  {#each isi.galeri as g}
                    <tr><td>{g.judul}</td><td>{g.jumlahFoto || "0"}</td><td>{g.jml || g.fn || "-"}</td></tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        {:else}
          <p class="kosong">Belum ada kegiatan tercatat.</p>
        {/if}
      {/if}

      <div class="tanda-tangan-laporan">
        <p>Disusun {tanggalHariIni()}</p>
        {#if penyusun}<p><b>{penyusun}</b></p>{/if}
        <p class="keterangan">
          Angka pada laporan ini diambil langsung dari data situs pada saat disusun.
          Buku kas dan berkas fisik tetap menjadi bukti utama.
        </p>
      </div>
    </div>
  </section>
{/if}
