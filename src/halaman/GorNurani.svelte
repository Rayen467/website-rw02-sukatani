<script>
  import { KOLEKSI, KONTEN } from "../inti/nama.js";
  import { isi, kontenNilai, muatKoleksi } from "../keadaan/isi.svelte.js";
  import { beriTahu } from "../keadaan/pesan.svelte.js";
  import { sesi } from "../keadaan/sesi.svelte.js";
  import { pergi } from "../keadaan/rute.svelte.js";
  import { keDaftar, NAMA_BULAN, tanggalHariIni } from "../inti/format.js";
  import { kirimWarga } from "../sumber/data.js";
  import { pesanRamah } from "../sumber/firebase.js";
  import { GOR_NURANI_BAWAAN } from "../inti/bawaan.js";

  const nilai = (k) => kontenNilai(KONTEN.GOR_NURANI, k, GOR_NURANI_BAWAAN[k] || "");
  const misi = $derived(keDaftar(nilai("misi")));
  const tujuan = $derived(keDaftar(nilai("tujuan")));
  const tugasKetua = $derived(keDaftar(nilai("tugasKetua")));
  const tugasPelaksana = $derived(keDaftar(nilai("tugasPelaksana")));
  const tugasBendahara = $derived(keDaftar(nilai("tugasBendahara")));
  const alokasi = $derived(keDaftar(nilai("alokasiProfit")));
  const jadwalTetap = $derived(keDaftar(nilai("jadwalTetap")));
  const badminton = $derived(keDaftar(nilai("aturanBadminton")));
  const hajatan = $derived(keDaftar(nilai("aturanHajatan")));
  const perlengkapan = $derived(keDaftar(nilai("perlengkapan")));

  const TAB = [
    ["profil", "Profil"],
    ["pengurus", "Kepengurusan"],
    ["layanan", "Layanan & Jadwal"],
    ["pinjam", "Peminjaman"]
  ];
  let tab = $state("profil");

  const jadwalServer = $derived(isi.jadwal || []);
  const kini = new Date();
  let tahun = $state(kini.getFullYear());
  let bulan = $state(kini.getMonth());

  let form = $state({
    tanggal: tanggalHariIni(),
    jam: "",
    keperluan: "",
    nama: "",
    wa: "",
    rt: "",
    kategori: "rt0102",
    setuju: false
  });
  let mengirim = $state(false);

  /* Data warga yang sudah pernah diisi di Akun Saya dipakai lagi supaya
     peminjaman GOR tidak meminta nama, RT, dan WhatsApp dari awal. */
  $effect(() => {
    const p = sesi.profilWarga;
    if (!p) return;
    if (!form.nama) form.nama = p.nama || "";
    if (!form.wa) form.wa = p.wa || "";
    if (!form.rt) form.rt = p.rt || "";
    if (p.rt && !["RT 01", "RT 02"].includes(String(p.rt).toUpperCase())) {
      if (form.kategori === "rt0102") form.kategori = "rw02";
    }
  });

  const kategoriLabel = $derived(
    form.kategori === "rt0102"
      ? "Warga RT 01/02"
      : form.kategori === "rw02"
        ? "Warga RW 02 di luar RT 01/02"
        : "Penyewa di luar RW 02"
  );

  const tarif = $derived(
    form.kategori === "rt0102"
      ? nilai("tarifRt0102")
      : form.kategori === "rw02"
        ? nilai("tarifRw02Lain")
        : nilai("tarifLuarRw02")
  );

  const komposisiTarif = $derived(
    form.kategori === "rt0102"
      ? nilai("komposisiRt0102")
      : form.kategori === "rw02"
        ? nilai("komposisiRw02Lain")
        : nilai("komposisiLuarRw02")
  );

  function tanggalJadwal(j) {
    return j.tanggal || String(j.id || "").split("--")[0];
  }

  function jadwalGorPada(tanggal) {
    return jadwalServer.filter((j) => {
      const fasilitas = String(j.fasilitas || "").toLowerCase();
      return tanggalJadwal(j) === tanggal && fasilitas.includes("gor nurani");
    });
  }

  const kalender = $derived.by(() => {
    const jumlahHari = new Date(tahun, bulan + 1, 0).getDate();
    const mulai = (new Date(tahun, bulan, 1).getDay() + 6) % 7;
    const hasil = [];
    for (let i = 0; i < mulai; i++) hasil.push(null);
    for (let d = 1; d <= jumlahHari; d++) {
      const iso = tahun + "-" + String(bulan + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
      hasil.push({ hari: d, iso, dipakai: jadwalGorPada(iso) });
    }
    while (hasil.length % 7 !== 0) hasil.push(null);
    return hasil;
  });

  function geser(n) {
    let b = bulan + n;
    let t = tahun;
    if (b < 0) { b = 11; t--; }
    if (b > 11) { b = 0; t++; }
    bulan = b;
    tahun = t;
  }

  function peringatanJadwalTetap(tanggal) {
    if (!tanggal) return "";
    const hari = new Date(tanggal + "T12:00:00").getDay();
    if (hari === 6) return "Hari Sabtu punya beberapa jadwal tetap warga. Cocokkan jam pengajuan dengan tab Layanan & Jadwal.";
    if (hari === 4) return "Kamis malam 19.00–23.00 tercantum sebagai jadwal bulu tangkis warga RW 02.";
    return "";
  }

  function namaPengurus(kunci) {
    return nilai(kunci) || "Belum diisi pengurus";
  }

  function pilihTanggal(iso, dipakai) {
    if (dipakai.length) return;
    form.tanggal = iso;
  }

  async function kirimPeminjaman(e) {
    e.preventDefault();

    if (!sesi.pengguna) {
      beriTahu("Masuk dulu supaya permohonan GOR bisa Anda lacak.");
      pergi("/masuk");
      return;
    }
    if (!sesi.terverifikasi) {
      beriTahu("Verifikasi email dulu sebelum mengajukan peminjaman GOR.");
      pergi("/akun");
      return;
    }
    if (jadwalGorPada(form.tanggal).length) {
      beriTahu("GOR sudah terkunci pada tanggal tersebut. Pilih tanggal lain atau hubungi pengurus.");
      return;
    }
    if (!form.setuju) {
      beriTahu("Centang persetujuan aturan GOR sebelum mengirim.");
      return;
    }

    mengirim = true;
    try {
      const rt = String(form.rt || "").trim().slice(0, 16);
      const tujuan = String(form.keperluan || "").trim().slice(0, 70);
      const ringkasan = [
        tujuan || "Pemakaian GOR",
        kategoriLabel,
        rt ? "RT: " + rt : "",
        "Tarif acuan: " + tarif,
        "Setuju aturan GOR"
      ].filter(Boolean).join(" | ").slice(0, 200);

      await kirimWarga(KOLEKSI.RESERVASI, {
        fasilitas: "GOR Nurani",
        tanggal: form.tanggal,
        jam: form.jam,
        acara: ringkasan,
        nama: form.nama,
        wa: form.wa
      });

      muatKoleksi(KOLEKSI.RESERVASI);
      beriTahu("Permohonan GOR terkirim. Statusnya bisa dipantau di Akun Saya.");
      form = {
        ...form,
        jam: "",
        keperluan: "",
        setuju: false
      };
    } catch (err) {
      beriTahu(pesanRamah(err));
    }
    mengirim = false;
  }
</script>

<nav class="remah"><a href="#/">Beranda</a><span>›</span><span>GOR Nurani</span></nav>

<section class="gor-hero">
  <div class="gor-hero-isi">
    <p class="alis">Fasilitas warga RW 02</p>
    <h1>{nilai("nama")}</h1>
    <p class="gor-hero-ringkas">
      Pusat informasi GOR untuk melihat profil, pengelola, jadwal kegiatan,
      tarif, ketersediaan, dan mengajukan pemakaian secara online.
    </p>
    <div class="baris-tombol gor-hero-aksi">
      <button class="tombol utama" type="button" onclick={() => (tab = "pinjam")}>Ajukan peminjaman</button>
      <button class="tombol" type="button" onclick={() => (tab = "layanan")}>Lihat jadwal GOR</button>
    </div>
  </div>

  <div class="gor-ringkas">
    <div class="gor-fakta">
      <span class="gor-fakta-label">Luas</span>
      <strong>{nilai("luas")}</strong>
    </div>
    <div class="gor-fakta">
      <span class="gor-fakta-label">Operasional</span>
      <strong>{nilai("mulaiOperasional")}</strong>
    </div>
    <div class="gor-fakta">
      <span class="gor-fakta-label">Fungsi</span>
      <strong>Olahraga &amp; sosial</strong>
    </div>
    <div class="gor-fakta">
      <span class="gor-fakta-label">Reservasi</span>
      <strong>Online</strong>
    </div>
  </div>
</section>

<div class="gor-nav" role="tablist" aria-label="Bagian GOR Nurani">
  {#each TAB as [id, label], i}
    <button
      class:aktif={tab === id}
      type="button"
      role="tab"
      aria-selected={tab === id}
      onclick={() => (tab = id)}
    >
      <span class="gor-nav-nomor">{String(i + 1).padStart(2, "0")}</span>
      <span>{label}</span>
    </button>
  {/each}
</div>

{#if tab === "profil"}
  <section class="blok gor-intro">
    <div class="gor-section-head">
      <div>
        <p class="alis">Tentang fasilitas</p>
        <h2>GOR milik warga, dikelola untuk warga</h2>
      </div>
      <p>{nilai("jenis")}</p>
    </div>

    <div class="gor-profil-grid">
      <div class="kartu gor-profil-utama">
        <p class="alis">Riwayat singkat</p>
        <p>{nilai("riwayat")}</p>
      </div>
      <div class="kartu gor-data-kunci">
        <div><span>Pendirian</span><b>{nilai("tahunPendirian")}</b></div>
        <div><span>Mulai operasional</span><b>{nilai("mulaiOperasional")}</b></div>
        <div><span>Luas</span><b>{nilai("luas")}</b></div>
        <div><span>Lokasi</span><b>{nilai("alamat")}</b></div>
      </div>
    </div>
  </section>

  <section class="blok">
    <div class="petak petak-2">
      <div class="kartu gor-highlight">
        <p class="alis">Visi</p>
        <p class="gor-kutip">{nilai("visi")}</p>
      </div>
      <div class="kartu">
        <p class="alis">Misi</p>
        <ol class="poin gor-lista">{#each misi as x}<li>{x}</li>{/each}</ol>
      </div>
    </div>
  </section>

  <section class="blok">
    <div class="gor-section-head">
      <div><p class="alis">Arah pengelolaan</p><h2>Landasan dan tujuan</h2></div>
    </div>
    <div class="petak petak-3">
      <div class="kartu gor-mini"><span>Landasan</span><b>{nilai("landasan")}</b></div>
      <div class="kartu gor-mini"><span>Sifat</span><b>{nilai("sifat")}</b></div>
      <div class="kartu gor-mini"><span>Asas</span><b>{nilai("asas")}</b></div>
    </div>
    <div class="kartu" style="margin-top:16px">
      <h3>Tujuan GOR Nurani</h3>
      <ol class="poin gor-lista">{#each tujuan as x}<li>{x}</li>{/each}</ol>
    </div>
  </section>

  <section class="blok">
    <div class="petak petak-2">
      <div class="kartu">
        <p class="alis">Pemanfaatan</p>
        <h3>Olahraga, sosial, dan kesejahteraan warga</h3>
        <p>{nilai("pemanfaatan")}</p>
      </div>
      <div class="kartu">
        <p class="alis">Identitas visual</p>
        <h3>Makna lambang dalam AD</h3>
        <p>{nilai("maknaLogo")}</p>
      </div>
    </div>
  </section>

{:else if tab === "pengurus"}
  <section class="blok">
    <div class="gor-section-head">
      <div>
        <p class="alis">Pengelola fasilitas</p>
        <h2>Kepengurusan GOR</h2>
      </div>
      <p>Struktur pengelola dipisahkan dari jabatan Ketua RW sesuai AD/ART.</p>
    </div>

    <div class="petak petak-3">
      <article class="kartu gor-pengurus">
        <span class="gor-role-no">01</span>
        <p class="alis">Ketua GOR</p>
        <h3>{namaPengurus("ketuaNama")}</h3>
        <div class="gor-role-garis"></div>
        <ul class="poin">{#each tugasKetua as x}<li>{x}</li>{/each}</ul>
      </article>

      <article class="kartu gor-pengurus">
        <span class="gor-role-no">02</span>
        <p class="alis">Pelaksana Harian</p>
        <h3>{namaPengurus("pelaksanaNama")}</h3>
        <div class="gor-role-garis"></div>
        <ul class="poin">{#each tugasPelaksana as x}<li>{x}</li>{/each}</ul>
      </article>

      <article class="kartu gor-pengurus">
        <span class="gor-role-no">03</span>
        <p class="alis">Bendahara</p>
        <h3>{namaPengurus("bendaharaNama")}</h3>
        <div class="gor-role-garis"></div>
        <ul class="poin">{#each tugasBendahara as x}<li>{x}</li>{/each}</ul>
      </article>
    </div>

    <div class="catatan" style="margin-top:16px">
      <b>Ketentuan kepengurusan.</b> {nilai("ketentuanPengurus")}
    </div>
  </section>

  <section class="blok">
    <div class="gor-section-head">
      <div><p class="alis">Transparansi</p><h2>Alokasi hasil pengelolaan</h2></div>
      <span class="label-kecil">Sesuai AD/ART</span>
    </div>
    <div class="kartu">
      <ol class="poin gor-lista">{#each alokasi as x}<li>{x}</li>{/each}</ol>
      <p class="gor-batas"><b>Batas penyaluran:</b> {nilai("batasDistribusiProfit")}</p>
    </div>
  </section>

  <section class="blok">
    <div class="petak petak-2">
      <div class="kartu">
        <p class="alis">Tata kelola</p>
        <h3>Rapat dan keputusan</h3>
        <p>{nilai("rapat")}</p>
        <p style="margin-top:10px">{nilai("keputusan")}</p>
      </div>
      <div class="kartu">
        <p class="alis">Keberlanjutan fasilitas</p>
        <h3>Pembangunan dan perubahan aturan</h3>
        <p>{nilai("renovasi")}</p>
        <p style="margin-top:10px">{nilai("perubahanAdart")}</p>
      </div>
    </div>
  </section>

{:else if tab === "layanan"}
  <section class="blok">
    <div class="gor-section-head">
      <div>
        <p class="alis">Yang bisa dilakukan di GOR</p>
        <h2>Layanan dan fungsi GOR</h2>
      </div>
      <button class="tombol utama" type="button" onclick={() => (tab = "pinjam")}>Cek ketersediaan</button>
    </div>

    <div class="gor-layanan-grid">
      <article class="kartu gor-layanan">
        <span class="label-kecil">Olahraga</span>
        <h3>Bulu tangkis</h3>
        <p>Lapangan untuk kegiatan bulu tangkis warga dan latihan anak sesuai jadwal serta ketentuan pengelola.</p>
      </article>

      <article class="kartu gor-layanan">
        <span class="label-kecil">Kegiatan rutin</span>
        <h3>Senam warga</h3>
        <p>Jadwal senam ibu-ibu menggunakan GOR sebagai ruang kegiatan bersama yang teratur.</p>
      </article>

      <article class="kartu gor-layanan">
        <span class="label-kecil">Kemasyarakatan</span>
        <h3>Kegiatan sosial</h3>
        <p>GOR dapat dipakai untuk kegiatan sosial RW 02 dan kegiatan warga lain yang disetujui pengelola.</p>
      </article>

      <article class="kartu gor-layanan">
        <span class="label-kecil">Reservasi</span>
        <h3>Hajatan keluarga</h3>
        <p>Peminjaman hajatan mengikuti kategori peminjam, tarif, waktu persiapan, dan kewajiban kebersihan.</p>
      </article>
    </div>
  </section>

  <section class="blok">
    <div class="gor-section-head">
      <div><p class="alis">Agenda reguler</p><h2>Jadwal penggunaan tetap</h2></div>
      <p>Jadwal ini menjadi acuan sebelum warga mengajukan tanggal pemakaian.</p>
    </div>
    <div class="gor-jadwal-list">
      {#each jadwalTetap as x, i}
        <div class="gor-jadwal-item">
          <span>{String(i + 1).padStart(2, "0")}</span>
          <p>{x}</p>
        </div>
      {/each}
    </div>
  </section>

  <section class="blok">
    <div class="petak petak-2">
      <div class="kartu">
        <p class="alis">Olahraga</p>
        <h3>Aturan bulu tangkis</h3>
        <ol class="poin gor-lista">{#each badminton as x}<li>{x}</li>{/each}</ol>
      </div>
      <div class="kartu">
        <p class="alis">Acara keluarga</p>
        <h3>Aturan hajatan</h3>
        <ol class="poin gor-lista">{#each hajatan as x}<li>{x}</li>{/each}</ol>
      </div>
    </div>
  </section>

  <section class="blok">
    <div class="kartu">
      <div class="gor-section-head">
        <div><p class="alis">Inventaris dasar</p><h3>Perlengkapan yang disebut dalam AD/ART</h3></div>
      </div>
      <div class="gor-chip-list">
        {#each perlengkapan as x}<span>{x}</span>{/each}
      </div>
    </div>
  </section>

{:else if tab === "pinjam"}
  <section class="blok">
    <div class="gor-steps" aria-label="Alur peminjaman">
      <div><span>1</span><b>Pilih tanggal</b><small>Cek kalender GOR</small></div>
      <div><span>2</span><b>Isi data</b><small>Pilih kategori &amp; kegiatan</small></div>
      <div><span>3</span><b>Petugas meninjau</b><small>Status tampil di Akun Saya</small></div>
    </div>
  </section>

  <section class="blok">
    <div class="gor-section-head">
      <div>
        <p class="alis">Biaya pemakaian</p>
        <h2>Pilih kategori peminjam</h2>
      </div>
      <p>Tarif di bawah mengikuti data AD/ART yang tersimpan di situs.</p>
    </div>

    <div class="gor-tarif-grid">
      <button
        type="button"
        class="gor-tarif"
        class:terpilih={form.kategori === "rt0102"}
        onclick={() => (form.kategori = "rt0102")}
      >
        <span>Warga RT 01/02</span>
        <strong>{nilai("tarifRt0102")}</strong>
        <small>{nilai("komposisiRt0102")}</small>
      </button>

      <button
        type="button"
        class="gor-tarif"
        class:terpilih={form.kategori === "rw02"}
        onclick={() => (form.kategori = "rw02")}
      >
        <span>Warga RW 02 lainnya</span>
        <strong>{nilai("tarifRw02Lain")}</strong>
        <small>{nilai("komposisiRw02Lain")}</small>
      </button>

      <button
        type="button"
        class="gor-tarif"
        class:terpilih={form.kategori === "luar"}
        onclick={() => (form.kategori = "luar")}
      >
        <span>Luar RW 02</span>
        <strong>{nilai("tarifLuarRw02")}</strong>
        <small>{nilai("komposisiLuarRw02")}</small>
      </button>
    </div>

    <div class="catatan" style="margin-top:14px">
      <b>Catatan tarif.</b> {nilai("tarifCatatan")}
    </div>
  </section>

  <section class="blok">
    <div class="gor-section-head">
      <div>
        <p class="alis">Ketersediaan</p>
        <h2>Pilih tanggal GOR</h2>
      </div>
      <div class="gor-legenda">
        <span><i class="kosong"></i>Tersedia</span>
        <span><i class="dipilih"></i>Dipilih</span>
        <span><i class="penuh"></i>Terpakai</span>
      </div>
    </div>

    <div class="kalender gor-kalender">
      <div class="kalender-kepala">
        <b>{NAMA_BULAN[bulan]} {tahun}</b>
        <span class="baris-tombol">
          <button class="tombol" type="button" onclick={() => geser(-1)}>Sebelumnya</button>
          <button class="tombol" type="button" onclick={() => geser(1)}>Berikutnya</button>
        </span>
      </div>
      <div class="kalender-petak">
        {#each ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"] as h}<div class="hari">{h}</div>{/each}
        {#each kalender as s}
          {#if s}
            <button
              class="kalender-sel gor-hari"
              class:terpilih={s.iso === form.tanggal}
              class:terpakai={s.dipakai.length > 0}
              type="button"
              disabled={s.dipakai.length > 0}
              onclick={() => pilihTanggal(s.iso, s.dipakai)}
              title={s.dipakai.length ? "GOR sudah terpakai" : "Pilih tanggal ini"}
            >
              <span class="angka-hari">{s.hari}</span>
              {#if s.dipakai.length}
                <span class="acara agenda">Terpakai</span>
              {:else if s.iso === form.tanggal}
                <span class="acara">Dipilih</span>
              {/if}
            </button>
          {:else}
            <div class="kalender-sel redup"></div>
          {/if}
        {/each}
      </div>
    </div>

    <p class="verifikasi">
      Kalender hanya mengunci reservasi GOR yang sudah disetujui. Jadwal rutin mingguan tetap perlu dicocokkan di tab Layanan &amp; Jadwal.
    </p>
  </section>

  <section class="blok">
    <div class="gor-booking-layout">
      <form class="isian-borang gor-form" onsubmit={kirimPeminjaman}>
        <div class="gor-section-head">
          <div>
            <p class="alis">Form peminjaman</p>
            <h2>Lengkapi pengajuan</h2>
          </div>
        </div>

        <div class="gor-form-grid">
          <div class="isian">
            <label for="g-tanggal">Tanggal pemakaian</label>
            <input id="g-tanggal" type="date" min={tanggalHariIni()} bind:value={form.tanggal} required />
            {#if peringatanJadwalTetap(form.tanggal)}
              <span class="petunjuk">{peringatanJadwalTetap(form.tanggal)}</span>
            {/if}
            {#if jadwalGorPada(form.tanggal).length}
              <span class="petunjuk"><b>GOR sudah terpakai pada tanggal ini.</b></span>
            {/if}
          </div>

          <div class="isian">
            <label for="g-jam">Jam pemakaian</label>
            <input id="g-jam" bind:value={form.jam} placeholder="08.00–14.00" required />
          </div>

          <div class="isian">
            <label for="g-kategori">Kategori peminjam</label>
            <select id="g-kategori" bind:value={form.kategori}>
              <option value="rt0102">Warga RT 01/02</option>
              <option value="rw02">Warga RW 02 di luar RT 01/02</option>
              <option value="luar">Penyewa di luar RW 02</option>
            </select>
          </div>

          <div class="isian">
            <label for="g-rt">RT / asal peminjam</label>
            <input id="g-rt" bind:value={form.rt} placeholder="RT 01 / RT 03 / luar RW 02" required />
          </div>

          <div class="isian gor-span-2">
            <label for="g-acara">Jenis kegiatan</label>
            <input id="g-acara" bind:value={form.keperluan} placeholder="Hajatan keluarga / kegiatan sosial / lainnya" required />
          </div>

          <div class="isian">
            <label for="g-nama">Nama peminjam</label>
            <input id="g-nama" bind:value={form.nama} required />
          </div>

          <div class="isian">
            <label for="g-wa">Nomor WhatsApp</label>
            <input id="g-wa" bind:value={form.wa} inputmode="tel" required />
          </div>
        </div>

        <label class="centang">
          <input type="checkbox" bind:checked={form.setuju} />
          <span>
            <b>Saya sudah membaca jadwal dan ketentuan GOR Nurani.</b>
            <span class="petunjuk">Permohonan belum otomatis disetujui. Petugas tetap meninjau jadwal dan kebutuhan kegiatan.</span>
          </span>
        </label>

        <div class="baris-tombol">
          <button class="tombol utama" type="submit" disabled={mengirim || jadwalGorPada(form.tanggal).length}>
            {mengirim ? "Mengirim..." : "Kirim permohonan GOR"}
          </button>
          <a class="tombol" href="#/akun">Lihat status di Akun Saya</a>
        </div>
      </form>

      <aside class="gor-ringkasan-pinjam">
        <p class="alis">Ringkasan pengajuan</p>
        <h3>{kategoriLabel}</h3>
        <div class="gor-summary-row"><span>Tanggal</span><b>{form.tanggal || "Belum dipilih"}</b></div>
        <div class="gor-summary-row"><span>Jam</span><b>{form.jam || "Belum diisi"}</b></div>
        <div class="gor-summary-row"><span>Tarif acuan</span><b>{tarif}</b></div>
        <div class="gor-summary-row"><span>Asal</span><b>{form.rt || "Belum diisi"}</b></div>
        <p class="gor-summary-note">{komposisiTarif}</p>
        {#if peringatanJadwalTetap(form.tanggal)}
          <div class="catatan awas"><b>Periksa jadwal rutin.</b> {peringatanJadwalTetap(form.tanggal)}</div>
        {/if}
      </aside>
    </div>
  </section>
{/if}

<section class="blok">
  <p class="verifikasi">
    Sumber ringkasan: {nilai("sumberDokumen")}. Nama pengurus yang belum tercantum pada arsip tidak diisi dengan perkiraan.
    Perubahan jadwal, tarif, atau pengurus dapat diperbarui lewat halaman Kelola.
  </p>
</section>
