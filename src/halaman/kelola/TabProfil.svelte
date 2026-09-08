<script>
  import { KOLEKSI, KONTEN } from "../../inti/nama.js";
  import { isi, konten, muatKoleksi, muatKonten } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { tambahIsi, simpanKonten, simpanDokumen } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";
  import { keSlug } from "../../inti/format.js";
  import { kecilkanFoto } from "../../inti/peramban.js";
  import { JENIS_USAHA, MAJELIS_TAKLIM_BAWAAN, GOR_NURANI_BAWAAN } from "../../inti/bawaan.js";
  import BarisKelola from "../../komponen/BarisKelola.svelte";

  /* Nilai awal diangkat jadi tetapan karena dipakai di DUA tempat: di sini
     dan di $effect yang memuat isi dari server. Kalau efek itu memakai
     { ...keadaan, ...k }, ia membaca keadaan yang ia tulis sendiri, dan
     Svelte berputar sampai melempar effect_update_depth_exceeded --
     seluruh tab berhenti tergambar. Bergantung pada tetapan memutus
     lingkarannya. */
  const AWAL_SB = { nama: "", teks: "", foto: "" };
  const AWAL_PF = { sejarah: "", visi: "", misi: "", luas: "", jumlahRT: "", batasUtara: "", batasTimur: "", batasSelatan: "", batasBarat: "" };
  const AWAL_KN = { posKeamanan: "", ketuaRW: "", ambulans: "", sekretaris: "", bendahara: "", kebersihan: "", alamat: "", koordinat: "", namaTitik: "", petaBatas: "", gambarPeta: "", jamSeninJumat: "", jamSabtu: "", iuranNominal: "", iuranJatuhTempo: "", iuranSetor: "" };
  const AWAL_MT = { ...MAJELIS_TAKLIM_BAWAAN };
  const AWAL_GOR = { ...GOR_NURANI_BAWAAN };

  let sb = $state({ ...AWAL_SB });
  let st = $state({ jabatan: "", nama: "", kontak: "" });
  let rt = $state({ rt: "", blok: "", batas: "", ketua: "", kontak: "", foto: "", poligon: "" });
  let pf = $state({ ...AWAL_PF });
  let kn = $state({ ...AWAL_KN });
  let mt = $state({ ...AWAL_MT });
  let gor = $state({ ...AWAL_GOR });
  let uk = $state({ nama: "", kat: "siapsaji", ringkas: "", panjang: "", jam: "", wa: "" });

  let fotoSambutan = $state(null);
  let fotoStruktur = $state(null);
  let fotoRT = $state(null);
  let fotoUsaha = $state(null);
  let gambarPeta = $state(null);
  let sibuk = $state("");

  $effect(() => { const k = konten(KONTEN.SAMBUTAN); if (k) sb = { ...AWAL_SB, ...k }; });
  $effect(() => { const k = konten(KONTEN.PROFIL); if (k) pf = { ...AWAL_PF, ...k }; });
  $effect(() => { const k = konten(KONTEN.KONTAK); if (k) kn = { ...AWAL_KN, ...k }; });
  $effect(() => { const k = konten(KONTEN.MAJELIS_TAKLIM); if (k) mt = { ...AWAL_MT, ...k }; });
  $effect(() => { const k = konten(KONTEN.GOR_NURANI); if (k) gor = { ...AWAL_GOR, ...k }; });

  async function bacaFoto(berkas, sisi) {
    if (!berkas) return "";
    try { return await kecilkanFoto(berkas, sisi); }
    catch (err) { beriTahu("Foto tidak dipakai: " + err.message); return ""; }
  }

  async function jalan(tanda, aksi) {
    sibuk = tanda;
    try { await aksi(); beriTahu("Tersimpan."); }
    catch (err) { beriTahu(pesanRamah(err)); }
    sibuk = "";
  }
</script>

<section class="blok">
  <div class="kepala-bagian"><h2>Sambutan Ketua RW</h2></div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); jalan("sambutan", async () => {
    const foto = (await bacaFoto(fotoSambutan, 600)) || sb.foto || "";
    await simpanKonten(KONTEN.SAMBUTAN, { nama: sb.nama, teks: sb.teks, foto });
    muatKonten(KONTEN.SAMBUTAN);
  }); }}>
    <div class="isian"><label for="sb-nama">Nama Ketua RW</label><input id="sb-nama" bind:value={sb.nama} /></div>
    <div class="isian"><label for="sb-teks">Isi sambutan</label><textarea id="sb-teks" bind:value={sb.teks} style="min-height:150px"></textarea></div>
    <div class="isian">
      <label for="sb-foto">Foto Ketua RW</label>
      <input id="sb-foto" type="file" accept="image/*" onchange={(e) => (fotoSambutan = e.target.files[0] || null)} />
      <span class="petunjuk">Minta izin dulu sebelum menayangkan foto seseorang.</span>
    </div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "sambutan"}>Simpan sambutan</button></div>
  </form>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Struktur pengurus yang ditampilkan</h2></div>
  <div class="catatan" style="margin-bottom:18px">
    <b>Ini daftar yang tampil di halaman Struktur Pengurus.</b> Berbeda dengan daftar hak akses di tab
    Warga &amp; pengurus &mdash; menambah nama di sini tidak memberi hak apa pun, jadi aman untuk pengurus yang tidak punya akun.
  </div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); jalan("struktur", async () => {
    const foto = await bacaFoto(fotoStruktur, 600);
    await tambahIsi(KOLEKSI.PENGURUS_TAMPIL, { ...st, foto });
    st = { jabatan: "", nama: "", kontak: "" };
    fotoStruktur = null;
    muatKoleksi(KOLEKSI.PENGURUS_TAMPIL);
  }); }}>
    <div class="isian"><label for="st-jabatan">Jabatan</label><input id="st-jabatan" bind:value={st.jabatan} required placeholder="Ketua RW" /></div>
    <div class="isian"><label for="st-nama">Nama</label><input id="st-nama" bind:value={st.nama} required /></div>
    <div class="isian">
      <label for="st-kontak">Nomor kontak</label>
      <input id="st-kontak" bind:value={st.kontak} inputmode="tel" />
      <span class="petunjuk">Kosongkan bila yang bersangkutan tidak bersedia nomornya ditayangkan.</span>
    </div>
    <div class="isian"><label for="st-foto">Foto</label><input id="st-foto" type="file" accept="image/*" onchange={(e) => (fotoStruktur = e.target.files[0] || null)} /></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "struktur"}>Tambahkan</button></div>
  </form>
  {#each isi.pengurus_tampil || [] as o}
    <BarisKelola
      koleksi={KOLEKSI.PENGURUS_TAMPIL}
      id={o.id}
      judul={o.jabatan || "-"} baris={[(o.nama || "-") + (o.kontak ? " \u00B7 " + o.kontak : "")]}
      nilai={o}
      kolom={[
        { nama: "jabatan", label: "Jabatan" },
        { nama: "nama", label: "Nama" },
        { nama: "kontak", label: "Nomor kontak" }
      ]}
    />
  {/each}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Batas dan cakupan tiap RT</h2></div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); jalan("rt", async () => {
    const foto = (await bacaFoto(fotoRT, 500)) || rt.foto || "";
    await simpanDokumen(KOLEKSI.BATAS_RT, keSlug(rt.rt) || "rt", { ...rt, foto }, false);
    rt = { rt: "", blok: "", batas: "", ketua: "", kontak: "", foto: "", poligon: "" };
    fotoRT = null;
    muatKoleksi(KOLEKSI.BATAS_RT);
  }); }}>
    <div class="isian"><label for="rt-nama">RT</label><input id="rt-nama" bind:value={rt.rt} required placeholder="RT 03" /></div>
    <div class="isian"><label for="rt-blok">Cakupan blok</label><input id="rt-blok" bind:value={rt.blok} placeholder="Blok C dan D" /></div>
    <div class="isian"><label for="rt-batas">Batas wilayah</label><input id="rt-batas" bind:value={rt.batas} placeholder="Dari gerbang sampai lapangan" /></div>
    <div class="isian"><label for="rt-ketua">Nama Ketua RT</label><input id="rt-ketua" bind:value={rt.ketua} /></div>
    <div class="isian"><label for="rt-kontak">Nomor Ketua RT</label><input id="rt-kontak" bind:value={rt.kontak} inputmode="tel" /></div>
    <div class="isian">
      <label for="rt-poligon">Koordinat batas RT di peta</label>
      <textarea id="rt-poligon" bind:value={rt.poligon} placeholder="-6.129100,106.497100&#10;-6.129200,106.497400&#10;-6.129500,106.497300"></textarea>
      <span class="petunjuk">Opsional. Satu titik lintang,bujur per baris, minimal 3 titik. Jangan isi perkiraan; ambil titik sebenarnya dari peta lapangan/My Maps.</span>
    </div>
    <div class="isian">
      <label for="rt-foto">Foto Ketua RT</label>
      <input id="rt-foto" type="file" accept="image/*" onchange={(e) => (fotoRT = e.target.files[0] || null)} />
      <span class="petunjuk">Ditampilkan di Struktur Pengurus. Pastikan ada izin dari yang bersangkutan.</span>
    </div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "rt"}>Simpan RT</button></div>
    <p class="catatan-borang">Dipakai di dua tempat: tabel Ketua RT pada halaman Struktur Pengurus, dan keterangan batas pada halaman Peta Wilayah.</p>
  </form>
  {#each isi.batas_rt || [] as o}
    <BarisKelola
      koleksi={KOLEKSI.BATAS_RT}
      id={o.id}
      judul={o.rt || "-"} baris={[(o.blok || "-") + " \u00B7 " + (o.batas || "-"), (o.ketua || "-") + (o.kontak ? " \u00B7 " + o.kontak : "")]}
      nilai={o}
      kolom={[
        { nama: "rt", label: "RT" },
        { nama: "blok", label: "Blok" },
        { nama: "batas", label: "Batas wilayah", jenis: "panjang" },
        { nama: "ketua", label: "Ketua RT" },
        { nama: "kontak", label: "Nomor kontak" },
        { nama: "poligon", label: "Koordinat batas RT", jenis: "panjang" }
      ]}
    />
  {/each}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Profil RW</h2></div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); jalan("profil", async () => { await simpanKonten(KONTEN.PROFIL, pf); muatKonten(KONTEN.PROFIL); }); }}>
    <div class="isian"><label for="f-sejarah">Sejarah singkat</label><textarea id="f-sejarah" bind:value={pf.sejarah}></textarea></div>
    <div class="isian"><label for="f-visi">Visi</label><textarea id="f-visi" bind:value={pf.visi}></textarea></div>
    <div class="isian"><label for="f-misi">Misi</label><textarea id="f-misi" bind:value={pf.misi} placeholder="Satu misi per baris"></textarea><span class="petunjuk">Tulis satu misi per baris. Nanti tampil sebagai daftar bernomor.</span></div>
    <div class="isian"><label for="f-luas">Luas wilayah</label><input id="f-luas" bind:value={pf.luas} placeholder="12 hektare" /></div>
    <div class="isian"><label for="f-rt">Jumlah RT</label><input id="f-rt" bind:value={pf.jumlahRT} placeholder="5" /></div>
    <div class="isian"><label for="f-utara">Batas utara</label><input id="f-utara" bind:value={pf.batasUtara} /></div>
    <div class="isian"><label for="f-timur">Batas timur</label><input id="f-timur" bind:value={pf.batasTimur} /></div>
    <div class="isian"><label for="f-selatan">Batas selatan</label><input id="f-selatan" bind:value={pf.batasSelatan} /></div>
    <div class="isian"><label for="f-barat">Batas barat</label><input id="f-barat" bind:value={pf.batasBarat} /></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "profil"}>Simpan profil</button></div>
  </form>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Majelis Taklim Al-Ikhlas</h2></div>
  <div class="catatan" style="margin-bottom:18px">
    Data awal diisi dari SKT dan AD/ART yang diberikan. Perubahan di sini langsung dipakai halaman publik Majelis Taklim.
  </div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); jalan("majelis", async () => { await simpanKonten(KONTEN.MAJELIS_TAKLIM, mt); muatKonten(KONTEN.MAJELIS_TAKLIM); }); }}>
    <div class="isian"><label for="mt-nama">Nama organisasi</label><input id="mt-nama" bind:value={mt.nama} /></div>
    <div class="isian"><label for="mt-skt">Nomor SKT</label><input id="mt-skt" bind:value={mt.noSkt} /></div>
    <div class="isian"><label for="mt-dasar">Dasar SKT</label><textarea id="mt-dasar" bind:value={mt.dasarSkt}></textarea></div>
    <div class="isian"><label for="mt-tglskt">Tanggal SKT</label><input id="mt-tglskt" bind:value={mt.tanggalSkt} /></div>
    <div class="isian"><label for="mt-masa">Masa berlaku</label><input id="mt-masa" bind:value={mt.masaBerlaku} /></div>
    <div class="isian"><label for="mt-ketua">Ketua</label><input id="mt-ketua" bind:value={mt.ketua} /></div>
    <div class="isian"><label for="mt-sekretaris">Sekretaris</label><input id="mt-sekretaris" bind:value={mt.sekretaris} /></div>
    <div class="isian"><label for="mt-berdiri">Tanggal berdiri</label><input id="mt-berdiri" bind:value={mt.tanggalBerdiri} /></div>
    <div class="isian"><label for="mt-periode">Periode</label><input id="mt-periode" bind:value={mt.periode} /></div>
    <div class="isian"><label for="mt-anggota-jumlah">Jumlah anggota</label><input id="mt-anggota-jumlah" bind:value={mt.jumlahAnggota} /></div>
    <div class="isian"><label for="mt-alamat">Alamat</label><textarea id="mt-alamat" bind:value={mt.alamat}></textarea></div>
    <div class="catatan"><b>Dokumen pendaftaran KUA.</b> Data berikut berasal dari Surat Permohonan Pendaftaran Majelis Taklim yang ada di arsip.</div>
    <div class="isian"><label for="mt-permohonan">Nomor permohonan</label><input id="mt-permohonan" bind:value={mt.nomorPermohonan} /></div>
    <div class="isian"><label for="mt-tgl-permohonan">Tanggal permohonan</label><input id="mt-tgl-permohonan" bind:value={mt.tanggalPermohonan} /></div>
    <div class="isian"><label for="mt-tujuan-daftar">Tujuan pendaftaran</label><textarea id="mt-tujuan-daftar" bind:value={mt.tujuanPendaftaran}></textarea></div>
    <div class="isian"><label for="mt-lampiran">Lampiran pendaftaran</label><textarea id="mt-lampiran" bind:value={mt.lampiranPendaftaran}></textarea><span class="petunjuk">Satu lampiran per baris.</span></div>
    <div class="isian"><label for="mt-landasan">Landasan</label><textarea id="mt-landasan" bind:value={mt.landasan}></textarea></div>
    <div class="isian"><label for="mt-visi">Visi</label><textarea id="mt-visi" bind:value={mt.visi}></textarea></div>
    <div class="isian"><label for="mt-misi">Misi</label><textarea id="mt-misi" bind:value={mt.misi}></textarea><span class="petunjuk">Satu poin per baris.</span></div>
    <div class="isian"><label for="mt-tujuan">Tujuan</label><textarea id="mt-tujuan" bind:value={mt.tujuan}></textarea><span class="petunjuk">Satu poin per baris.</span></div>
    <div class="isian"><label for="mt-kegiatan">Kegiatan</label><textarea id="mt-kegiatan" bind:value={mt.kegiatan}></textarea><span class="petunjuk">Satu kegiatan per baris.</span></div>
    <div class="isian"><label for="mt-anggota">Keanggotaan</label><textarea id="mt-anggota" bind:value={mt.keanggotaan}></textarea></div>
    <div class="isian"><label for="mt-pengurus">Susunan kepengurusan</label><textarea id="mt-pengurus" bind:value={mt.kepengurusan}></textarea><span class="petunjuk">Satu jabatan per baris.</span></div>
    <div class="isian"><label for="mt-bakti">Masa bakti</label><input id="mt-bakti" bind:value={mt.masaBakti} /></div>
    <div class="isian"><label for="mt-musyawarah">Musyawarah</label><textarea id="mt-musyawarah" bind:value={mt.musyawarah}></textarea></div>
    <div class="isian"><label for="mt-keuangan">Sumber keuangan</label><textarea id="mt-keuangan" bind:value={mt.keuangan}></textarea><span class="petunjuk">Satu sumber per baris.</span></div>
    <div class="isian"><label for="mt-perubahan">Perubahan AD/ART</label><textarea id="mt-perubahan" bind:value={mt.perubahan}></textarea></div>
    <div class="isian"><label for="mt-rapat">Rapat</label><textarea id="mt-rapat" bind:value={mt.rapat}></textarea></div>
    <div class="catatan"><b>Arsip RW terkait.</b> Jangan dipakai menimpa periode Al-Ikhlas bila judul/periodenya berbeda.</div>
    <div class="isian"><label for="mt-rw-nomor">Nomor SK RW</label><input id="mt-rw-nomor" bind:value={mt.dokumenRwNomor} /></div>
    <div class="isian"><label for="mt-rw-judul">Judul SK RW</label><textarea id="mt-rw-judul" bind:value={mt.dokumenRwJudul}></textarea></div>
    <div class="isian"><label for="mt-rw-dasar">Dasar SK RW</label><textarea id="mt-rw-dasar" bind:value={mt.dokumenRwDasar}></textarea></div>
    <div class="isian"><label for="mt-rw-catatan">Catatan pemisahan arsip</label><textarea id="mt-rw-catatan" bind:value={mt.dokumenRwCatatan}></textarea></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "majelis"}>Simpan Majelis Taklim</button></div>
  </form>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>GOR Nurani RW 02</h2></div>
  <div class="catatan" style="margin-bottom:18px">
    Data awal diisi dari AD/ART Pengelolaan GOR Nurani. Arsip terbaru juga memuat jadwal tetap, tarif hajatan, pembagian hasil, struktur pengelola, dan aturan pemakaian.
  </div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); jalan("gor", async () => { await simpanKonten(KONTEN.GOR_NURANI, gor); muatKonten(KONTEN.GOR_NURANI); }); }}>
    <div class="isian"><label for="gor-nama">Nama fasilitas</label><input id="gor-nama" bind:value={gor.nama} /></div>
    <div class="isian"><label for="gor-jenis">Jenis</label><input id="gor-jenis" bind:value={gor.jenis} /></div>
    <div class="isian"><label for="gor-tahun">Pendirian</label><input id="gor-tahun" bind:value={gor.tahunPendirian} /></div>
    <div class="isian"><label for="gor-operasional">Mulai operasional</label><input id="gor-operasional" bind:value={gor.mulaiOperasional} /></div>
    <div class="isian"><label for="gor-alamat">Lokasi</label><textarea id="gor-alamat" bind:value={gor.alamat}></textarea></div>
    <div class="isian"><label for="gor-luas">Luas</label><input id="gor-luas" bind:value={gor.luas} /></div>
    <div class="isian"><label for="gor-riwayat">Riwayat singkat</label><textarea id="gor-riwayat" bind:value={gor.riwayat}></textarea></div>
    <div class="isian"><label for="gor-visi">Visi</label><textarea id="gor-visi" bind:value={gor.visi}></textarea></div>
    <div class="isian"><label for="gor-misi">Misi</label><textarea id="gor-misi" bind:value={gor.misi}></textarea><span class="petunjuk">Satu poin per baris.</span></div>
    <div class="isian"><label for="gor-landasan">Landasan</label><input id="gor-landasan" bind:value={gor.landasan} /></div>
    <div class="isian"><label for="gor-sifat">Sifat</label><input id="gor-sifat" bind:value={gor.sifat} /></div>
    <div class="isian"><label for="gor-asas">Asas</label><input id="gor-asas" bind:value={gor.asas} /></div>
    <div class="isian"><label for="gor-tujuan">Tujuan</label><textarea id="gor-tujuan" bind:value={gor.tujuan}></textarea><span class="petunjuk">Satu poin per baris.</span></div>
    <div class="isian"><label for="gor-pemanfaatan">Pemanfaatan</label><textarea id="gor-pemanfaatan" bind:value={gor.pemanfaatan}></textarea></div>

    <div class="catatan"><b>Struktur dan tugas pengelola.</b></div>
    <div class="isian"><label for="gor-struktur">Struktur pengurus</label><textarea id="gor-struktur" bind:value={gor.strukturPengurus}></textarea><span class="petunjuk">Satu jabatan per baris.</span></div>
    <div class="isian"><label for="gor-ketentuan-pengurus">Ketentuan pengurus</label><textarea id="gor-ketentuan-pengurus" bind:value={gor.ketentuanPengurus}></textarea></div>
    <div class="isian"><label for="gor-tugas-ketua">Tugas Ketua GOR</label><textarea id="gor-tugas-ketua" bind:value={gor.tugasKetua}></textarea></div>
    <div class="isian"><label for="gor-tugas-pelaksana">Tugas Pelaksana Harian</label><textarea id="gor-tugas-pelaksana" bind:value={gor.tugasPelaksana}></textarea></div>
    <div class="isian"><label for="gor-tugas-bendahara">Tugas Bendahara</label><textarea id="gor-tugas-bendahara" bind:value={gor.tugasBendahara}></textarea></div>

    <div class="catatan"><b>Jadwal, pemakaian, dan tarif.</b></div>
    <div class="isian"><label for="gor-jadwal">Jadwal penggunaan tetap</label><textarea id="gor-jadwal" bind:value={gor.jadwalTetap}></textarea><span class="petunjuk">Satu jadwal per baris.</span></div>
    <div class="isian"><label for="gor-badminton">Aturan bulu tangkis</label><textarea id="gor-badminton" bind:value={gor.aturanBadminton}></textarea></div>
    <div class="isian"><label for="gor-hajatan">Aturan hajatan</label><textarea id="gor-hajatan" bind:value={gor.aturanHajatan}></textarea></div>
    <div class="isian"><label for="gor-tarif-rt">Tarif warga RT 01/02</label><input id="gor-tarif-rt" bind:value={gor.tarifRt0102} /></div>
    <div class="isian"><label for="gor-komp-rt">Komposisi tarif RT 01/02</label><textarea id="gor-komp-rt" bind:value={gor.komposisiRt0102}></textarea></div>
    <div class="isian"><label for="gor-tarif-rw">Tarif warga RW 02 di luar RT 01/02</label><input id="gor-tarif-rw" bind:value={gor.tarifRw02Lain} /></div>
    <div class="isian"><label for="gor-komp-rw">Komposisi tarif warga RW 02 lain</label><textarea id="gor-komp-rw" bind:value={gor.komposisiRw02Lain}></textarea></div>
    <div class="isian"><label for="gor-tarif-luar">Tarif penyewa di luar RW 02</label><input id="gor-tarif-luar" bind:value={gor.tarifLuarRw02} /></div>
    <div class="isian"><label for="gor-komp-luar">Komposisi tarif luar RW 02</label><textarea id="gor-komp-luar" bind:value={gor.komposisiLuarRw02}></textarea></div>
    <div class="isian"><label for="gor-tarif-catatan">Catatan perubahan tarif</label><textarea id="gor-tarif-catatan" bind:value={gor.tarifCatatan}></textarea></div>

    <div class="catatan"><b>Keuangan dan tata kelola.</b></div>
    <div class="isian"><label for="gor-profit">Alokasi profit</label><textarea id="gor-profit" bind:value={gor.alokasiProfit}></textarea><span class="petunjuk">Satu alokasi per baris.</span></div>
    <div class="isian"><label for="gor-profit-tgl">Batas distribusi</label><input id="gor-profit-tgl" bind:value={gor.batasDistribusiProfit} /></div>
    <div class="isian"><label for="gor-rapat">Tata cara rapat</label><textarea id="gor-rapat" bind:value={gor.rapat}></textarea></div>
    <div class="isian"><label for="gor-keputusan">Pengambilan keputusan</label><textarea id="gor-keputusan" bind:value={gor.keputusan}></textarea></div>
    <div class="isian"><label for="gor-renovasi">Pembangunan / renovasi</label><textarea id="gor-renovasi" bind:value={gor.renovasi}></textarea></div>
    <div class="isian"><label for="gor-adart">Perubahan AD/ART</label><textarea id="gor-adart" bind:value={gor.perubahanAdart}></textarea></div>
    <div class="isian"><label for="gor-perlengkapan">Perlengkapan</label><textarea id="gor-perlengkapan" bind:value={gor.perlengkapan}></textarea><span class="petunjuk">Satu item per baris.</span></div>
    <div class="isian"><label for="gor-logo">Makna lambang</label><textarea id="gor-logo" bind:value={gor.maknaLogo}></textarea></div>
    <div class="isian"><label for="gor-sumber">Sumber dokumen</label><textarea id="gor-sumber" bind:value={gor.sumberDokumen}></textarea></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "gor"}>Simpan GOR Nurani</button></div>
  </form>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Kontak, jam layanan, dan iuran</h2></div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); jalan("kontak", async () => { const g = (await bacaFoto(gambarPeta, 1400)) || kn.gambarPeta || ""; await simpanKonten(KONTEN.KONTAK, { ...kn, gambarPeta: g }); gambarPeta = null; muatKonten(KONTEN.KONTAK); }); }}>
    <div class="isian"><label for="n-pos">Nomor pos keamanan</label><input id="n-pos" bind:value={kn.posKeamanan} /></div>
    <div class="isian"><label for="n-rw">Nomor Ketua RW</label><input id="n-rw" bind:value={kn.ketuaRW} /></div>
    <div class="isian"><label for="n-sek">Nomor Sekretaris</label><input id="n-sek" bind:value={kn.sekretaris} /></div>
    <div class="isian"><label for="n-ben">Nomor Bendahara</label><input id="n-ben" bind:value={kn.bendahara} /></div>
    <div class="isian"><label for="n-ker">Nomor Seksi Kebersihan</label><input id="n-ker" bind:value={kn.kebersihan} /></div>
    <div class="isian"><label for="n-amb">Nomor transportasi warga</label><input id="n-amb" bind:value={kn.ambulans} /></div>
    <div class="isian"><label for="n-alamat">Alamat sekretariat</label><input id="n-alamat" bind:value={kn.alamat} /></div>
    <div class="isian">
      <label for="n-koordinat">Titik penanda di peta</label>
      <input id="n-koordinat" bind:value={kn.koordinat} placeholder="-6.129217,106.497767" />
      <span class="petunjuk">
        Buka Google Maps, tekan lama tepat di bangunannya, lalu salin angka yang muncul.
        Tulis lintang dan bujur dipisah koma, tanpa spasi. Titik ini jadi bulatan biru
        di peta, dan jadi tujuan tombol Petunjuk arah.
      </span>
    </div>
    <div class="isian">
      <label for="n-gambarpeta">Gambar peta (cara paling gampang)</label>
      <input id="n-gambarpeta" type="file" accept="image/*" onchange={(e) => (gambarPeta = e.target.files[0] || null)} />
      <span class="petunjuk">
        Buka peta batas wilayah di Google My Maps, atur tampilannya sampai pas,
        lalu <b>tangkap layar</b> dan unggah gambarnya di sini. Yang tampil di situs
        persis seperti yang Anda lihat di Google &mdash; tidak bisa digeser atau
        diperbesar, tapi gambarnya tajam dan tidak butuh pengaturan apa pun.
        Kosongkan bila ingin memakai peta yang bisa digeser.
      </span>
    </div>
    <div class="isian">
      <label for="n-namatitik">Nama titik penanda</label>
      <input id="n-namatitik" bind:value={kn.namaTitik} placeholder="PAUD Anggrek" />
      <span class="petunjuk">
        Tampil kalau bulatan birunya disentuh. Pakai patokan yang paling dikenal warga,
        misalnya PAUD, balai warga, atau pos keamanan.
      </span>
    </div>
    <div class="isian">
      <label for="n-batas">Peta batas wilayah RW 02</label>
      <input id="n-batas" bind:value={kn.petaBatas} placeholder="https://www.google.com/maps/d/embed?mid=..." />
      <span class="petunjuk">
        Peta biasa tidak bisa menggambar garis batas. Buka google.com/mymaps, gambar batas RW 02 di atas
        citra Google, lalu tempel tautan sematannya di sini. Boleh menempel seluruh kode iframe, bagian
        yang dibutuhkan diambil sendiri. Dikosongkan berarti yang tampil hanya titik lokasi.
      </span>
    </div>
    <div class="isian"><label for="n-jam1">Jam layanan Senin sampai Jumat</label><input id="n-jam1" bind:value={kn.jamSeninJumat} /></div>
    <div class="isian"><label for="n-jam2">Jam layanan Sabtu</label><input id="n-jam2" bind:value={kn.jamSabtu} /></div>
    <div class="isian"><label for="n-iuran">Nominal iuran per bulan</label><input id="n-iuran" bind:value={kn.iuranNominal} /></div>
    <div class="isian"><label for="n-tempo">Jatuh tempo iuran</label><input id="n-tempo" bind:value={kn.iuranJatuhTempo} /></div>
    <div class="isian"><label for="n-setor">Iuran disetor kepada</label><input id="n-setor" bind:value={kn.iuranSetor} /></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "kontak"}>Simpan kontak</button></div>
    <p class="catatan-borang">Nomor yang diisi di sini tampil di halaman publik. Pastikan pemiliknya sudah mengizinkan.</p>
  </form>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Katalog usaha warga</h2></div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); jalan("usaha", async () => {
    const label = (JENIS_USAHA.find((j) => j.nilai === uk.kat) || {}).label || "Lainnya";
    /* Foto lama dipertahankan kalau tidak ada berkas baru dipilih, supaya
       membetulkan jam buka saja tidak ikut menghapus fotonya. */
    const lamaFoto = (isi.usaha || []).find((x) => x.id === (keSlug(uk.nama) || "usaha"));
    const foto = (await bacaFoto(fotoUsaha, 1000)) || (lamaFoto && lamaFoto.foto) || "";
    await simpanDokumen(KOLEKSI.USAHA, keSlug(uk.nama) || "usaha", { ...uk, katLabel: label, foto });
    uk = { nama: "", kat: "siapsaji", ringkas: "", panjang: "", jam: "", wa: "" };
    fotoUsaha = null;
    muatKoleksi(KOLEKSI.USAHA);
  }); }}>
    <div class="isian"><label for="uk-nama">Nama usaha</label><input id="uk-nama" bind:value={uk.nama} required /></div>
    <div class="isian"><label for="uk-jenis">Jenis</label><select id="uk-jenis" bind:value={uk.kat}>{#each JENIS_USAHA as j}<option value={j.nilai}>{j.label}</option>{/each}</select></div>
    <div class="isian"><label for="uk-ringkas">Keterangan singkat</label><input id="uk-ringkas" bind:value={uk.ringkas} required /></div>
    <div class="isian"><label for="uk-panjang">Keterangan lengkap</label><textarea id="uk-panjang" bind:value={uk.panjang}></textarea></div>
    <div class="isian"><label for="uk-jam">Jam buka</label><input id="uk-jam" bind:value={uk.jam} /></div>
    <div class="isian"><label for="uk-wa">Nomor pemesanan</label><input id="uk-wa" bind:value={uk.wa} inputmode="tel" /></div>
    <div class="isian">
      <label for="uk-foto">Foto produk</label>
      <input id="uk-foto" type="file" accept="image/*" onchange={(e) => (fotoUsaha = e.target.files[0] || null)} />
      <span class="petunjuk">Tampil di beranda dan halaman katalog. Kalau dikosongkan, foto yang lama tetap dipakai.</span>
    </div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "usaha"}>Tampilkan di katalog</button></div>
  </form>
  {#each isi.usaha || [] as o}
    <BarisKelola
      koleksi={KOLEKSI.USAHA}
      id={o.id}
      judul={o.nama} baris={[(o.katLabel || "") + " \u00B7 " + (o.jam || ""), o.ringkas || ""]}
      nilai={o}
      kolom={[
        { nama: "nama", label: "Nama usaha" },
        { nama: "ringkas", label: "Keterangan singkat" },
        { nama: "panjang", label: "Keterangan lengkap", jenis: "panjang" },
        { nama: "jam", label: "Jam buka" },
        { nama: "wa", label: "Nomor pemesanan" }
      ]}
    />
  {/each}
</section>
