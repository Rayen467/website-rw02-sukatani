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
    if (hari === 6) return "Hari Sabtu memiliki beberapa jadwal tetap warga. Cocokkan jam pengajuan dengan jadwal di tab Layanan & Jadwal.";
    if (hari === 4) return "Kamis malam 19.00–23.00 tercantum sebagai jadwal bulu tangkis warga RW 02.";
    return "";
  }

  function namaPengurus(kunci) {
    return nilai(kunci) || "Nama belum tercantum dalam arsip yang diberikan.";
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
        nama: "",
        wa: "",
        setuju: false
      };
    } catch (err) {
      beriTahu(pesanRamah(err));
    }
    mengirim = false;
  }
</script>

<nav class="remah"><a href="#/">Beranda</a><span>›</span><span>GOR Nurani</span></nav>

<div class="kepala-halaman">
  <p class="alis">Fasilitas warga RW 02</p>
  <h1>{nilai("nama")}</h1>
  <p>
    Satu pusat informasi untuk profil, kepengurusan, jadwal layanan, tarif,
    dan pengajuan pemakaian GOR Nurani.
  </p>
</div>

<div class="saring" role="tablist" aria-label="Bagian GOR Nurani" style="margin-bottom:24px">
  {#each TAB as [id, label]}
    <button
      class="tombol"
      class:utama={tab === id}
      type="button"
      aria-pressed={tab === id}
      onclick={() => (tab = id)}
    >{label}</button>
  {/each}
</div>

{#if tab === "profil"}
  <section class="blok">
    <div class="petak petak-2">
      <div class="kartu">
        <p class="alis">Identitas fasilitas</p>
        <h3>{nilai("jenis")}</h3>
        <div class="tabel-bungkus" style="border:0;background:none">
          <table class="data"><tbody>
            <tr><th>Pendirian</th><td>{nilai("tahunPendirian")}</td></tr>
            <tr><th>Mulai operasional</th><td>{nilai("mulaiOperasional")}</td></tr>
            <tr><th>Luas</th><td>{nilai("luas")}</td></tr>
            <tr><th>Lokasi</th><td>{nilai("alamat")}</td></tr>
          </tbody></table>
        </div>
      </div>
      <div class="kartu">
        <p class="alis">Riwayat singkat</p>
        <p>{nilai("riwayat")}</p>
      </div>
    </div>
  </section>

  <section class="blok">
    <div class="petak petak-2">
      <div class="kartu">
        <p class="alis">Visi</p>
        <p style="font-size:16px;color:var(--tinta);line-height:1.65">{nilai("visi")}</p>
      </div>
      <div class="kartu">
        <h3>Misi</h3>
        <ol class="poin">{#each misi as x}<li>{x}</li>{/each}</ol>
      </div>
    </div>
  </section>

  <section class="blok">
    <div class="kepala-bagian"><h2>Landasan dan tujuan</h2></div>
    <div class="petak petak-3">
      <div class="kartu"><p class="alis">Landasan</p><p>{nilai("landasan")}</p></div>
      <div class="kartu"><p class="alis">Sifat</p><p>{nilai("sifat")}</p></div>
      <div class="kartu"><p class="alis">Asas</p><p>{nilai("asas")}</p></div>
    </div>
    <div class="kartu" style="margin-top:16px">
      <h3>Tujuan GOR Nurani</h3>
      <ol class="poin">{#each tujuan as x}<li>{x}</li>{/each}</ol>
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
        <p class="alis">Makna lambang dalam AD</p>
        <p>{nilai("maknaLogo")}</p>
      </div>
    </div>
  </section>

{:else if tab === "pengurus"}
  <section class="blok">
    <div class="kepala-bagian"><h2>Kepengurusan GOR</h2></div>
    <div class="petak petak-3">
      <div class="kartu">
        <p class="alis">Ketua GOR</p>
        <h3>{namaPengurus("ketuaNama")}</h3>
        <ul class="poin">{#each tugasKetua as x}<li>{x}</li>{/each}</ul>
      </div>
      <div class="kartu">
        <p class="alis">Pelaksana Harian</p>
        <h3>{namaPengurus("pelaksanaNama")}</h3>
        <ul class="poin">{#each tugasPelaksana as x}<li>{x}</li>{/each}</ul>
      </div>
      <div class="kartu">
        <p class="alis">Bendahara</p>
        <h3>{namaPengurus("bendaharaNama")}</h3>
        <ul class="poin">{#each tugasBendahara as x}<li>{x}</li>{/each}</ul>
      </div>
    </div>
    <div class="catatan" style="margin-top:16px">
      <b>Ketentuan kepengurusan.</b> {nilai("ketentuanPengurus")}
    </div>
  </section>

  <section class="blok">
    <div class="kepala-bagian"><h2>Pengelolaan keuangan</h2></div>
    <div class="kartu">
      <ol class="poin">{#each alokasi as x}<li>{x}</li>{/each}</ol>
      <p><b>Batas penyaluran:</b> {nilai("batasDistribusiProfit")}</p>
    </div>
  </section>

  <section class="blok">
    <div class="petak petak-2">
      <div class="kartu">
        <h3>Rapat dan keputusan</h3>
        <p>{nilai("rapat")}</p>
        <p>{nilai("keputusan")}</p>
      </div>
      <div class="kartu">
        <h3>Pembangunan dan perubahan aturan</h3>
        <p>{nilai("renovasi")}</p>
        <p>{nilai("perubahanAdart")}</p>
      </div>
    </div>
  </section>

{:else if tab === "layanan"}
  <section class="blok">
    <div class="kepala-bagian"><h2>Layanan dan fungsi GOR</h2></div>
    <div class="petak petak-2">
      <div class="kartu">
        <p class="alis">Olahraga warga</p>
        <h3>Bulu tangkis</h3>
        <p>Lapangan dapat digunakan untuk kegiatan bulu tangkis warga dan latihan anak sesuai jadwal serta ketentuan pengelola.</p>
      </div>
      <div class="kartu">
        <p class="alis">Kegiatan warga</p>
        <h3>Senam dan kegiatan sosial</h3>
        <p>GOR digunakan untuk senam ibu-ibu, kegiatan sosial RW 02, dan kegiatan lain yang disetujui pengelola.</p>
      </div>
      <div class="kartu">
        <p class="alis">Acara keluarga</p>
        <h3>Hajatan</h3>
        <p>Peminjaman untuk hajatan mengikuti kategori penyewa, tarif, waktu persiapan, serta kewajiban mengembalikan kondisi GOR sesuai aturan.</p>
      </div>
      <div class="kartu">
        <p class="alis">Perlengkapan</p>
        <h3>Fasilitas pendukung</h3>
        <ul class="poin">{#each perlengkapan as x}<li>{x}</li>{/each}</ul>
      </div>
    </div>
  </section>

  <section class="blok">
    <div class="kepala-bagian"><h2>Jadwal penggunaan tetap</h2></div>
    <div class="kartu">
      <ul class="poin">{#each jadwalTetap as x}<li>{x}</li>{/each}</ul>
    </div>
  </section>

  <section class="blok">
    <div class="petak petak-2">
      <div class="kartu">
        <h3>Aturan bulu tangkis</h3>
        <ol class="poin">{#each badminton as x}<li>{x}</li>{/each}</ol>
      </div>
      <div class="kartu">
        <h3>Aturan hajatan</h3>
        <ol class="poin">{#each hajatan as x}<li>{x}</li>{/each}</ol>
      </div>
    </div>
  </section>

{:else if tab === "pinjam"}
  <section class="blok">
    <div class="kepala-bagian"><h2>Tarif pemakaian untuk hajatan</h2></div>
    <div class="tabel-bungkus">
      <table class="data">
        <thead><tr><th>Kategori penyewa</th><th>Tarif</th><th>Komposisi</th></tr></thead>
        <tbody>
          <tr><td><b>Warga RT 01/02</b></td><td>{nilai("tarifRt0102")}</td><td>{nilai("komposisiRt0102")}</td></tr>
          <tr><td><b>Warga RW 02 di luar RT 01/02</b></td><td>{nilai("tarifRw02Lain")}</td><td>{nilai("komposisiRw02Lain")}</td></tr>
          <tr><td><b>Penyewa di luar RW 02</b></td><td>{nilai("tarifLuarRw02")}</td><td>{nilai("komposisiLuarRw02")}</td></tr>
        </tbody>
      </table>
    </div>
    <div class="catatan" style="margin-top:14px">
      <b>Catatan.</b> {nilai("tarifCatatan")}
    </div>
  </section>

  <section class="blok">
    <div class="kepala-bagian"><h2>Ketersediaan GOR</h2></div>
    <div class="kalender">
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
              class="kalender-sel"
              class:redup={s.dipakai.length}
              type="button"
              onclick={() => { form.tanggal = s.iso; }}
              title={s.dipakai.length ? "GOR sudah terpakai" : "Pilih tanggal ini"}
            >
              <span class="angka-hari">{s.hari}</span>
              {#if s.dipakai.length}
                <span class="acara agenda">GOR terpakai</span>
              {/if}
            </button>
          {:else}
            <div class="kalender-sel redup"></div>
          {/if}
        {/each}
      </div>
    </div>
    <p class="verifikasi">
      Kalender menampilkan reservasi GOR yang sudah disetujui pengurus. Jadwal rutin mingguan tetap harus diperiksa pada tab Layanan &amp; Jadwal.
    </p>
  </section>

  <section class="blok">
    <div class="kepala-bagian"><h2>Ajukan peminjaman GOR</h2></div>
    <form class="isian-borang" onsubmit={kirimPeminjaman}>
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

      <div class="kartu">
        <p class="alis">Tarif berdasarkan kategori</p>
        <h3>{tarif}</h3>
        <p>{komposisiTarif}</p>
      </div>

      <div class="isian">
        <label for="g-acara">Jenis kegiatan</label>
        <input id="g-acara" bind:value={form.keperluan} placeholder="Hajatan keluarga / kegiatan sosial / lainnya" required />
      </div>

      <div class="isian"><label for="g-nama">Nama peminjam</label><input id="g-nama" bind:value={form.nama} required /></div>
      <div class="isian"><label for="g-wa">Nomor WhatsApp</label><input id="g-wa" bind:value={form.wa} inputmode="tel" required /></div>

      <label class="centang">
        <input type="checkbox" bind:checked={form.setuju} />
        <span>
          <b>Saya sudah membaca jadwal dan ketentuan GOR Nurani.</b>
          <span class="petunjuk">Permohonan belum berarti otomatis disetujui. Petugas tetap meninjau jadwal dan kebutuhan kegiatan.</span>
        </span>
      </label>

      <div class="baris-tombol">
        <button class="tombol utama" type="submit" disabled={mengirim || jadwalGorPada(form.tanggal).length}>
          {mengirim ? "Mengirim..." : "Kirim permohonan GOR"}
        </button>
        <a class="tombol" href="#/akun">Lihat status di Akun Saya</a>
      </div>
    </form>
  </section>
{/if}

<section class="blok">
  <p class="verifikasi">
    Sumber ringkasan: {nilai("sumberDokumen")}. Data nama pengurus yang tidak tercantum pada arsip sengaja tidak diisi dengan perkiraan.
    Perubahan jadwal, tarif, atau pengurus dapat diperbarui oleh pengurus situs lewat halaman Kelola.
  </p>
</section>
