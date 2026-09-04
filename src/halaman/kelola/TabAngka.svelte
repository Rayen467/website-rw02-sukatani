<script>
  import { KOLEKSI, KONTEN } from "../../inti/nama.js";
  import { isi, konten, muatKoleksi, muatKonten } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { tambahIsi, simpanKonten } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";
  import { rupiah, angkaDari } from "../../inti/format.js";
  import BarisKelola from "../../komponen/BarisKelola.svelte";
  import TempelMassal from "../../komponen/TempelMassal.svelte";

  /* Contoh tempelan, memakai TAB sebagai pemisah karena itu yang keluar
     kalau baris disalin dari Excel atau Google Sheets. Disusun di sini,
     bukan langsung di markup, supaya tanda tab dan ganti barisnya jelas
     terbaca dan tidak berubah jadi spasi biasa waktu berkas ini disunting. */
  const CONTOH_KAS = [
    ["September 2026", "1 Sep", "Iuran warga blok A", "masuk", "2500000"].join("\t"),
    ["September 2026", "3 Sep", "Beli lampu jalan", "keluar", "480000"].join("\t")
  ].join("\n");

  /* Nilai awal diangkat jadi tetapan karena dipakai di DUA tempat: di sini
     dan di $effect yang memuat isi dari server. Kalau efek itu memakai
     { ...keadaan, ...k }, ia membaca keadaan yang ia tulis sendiri, dan
     Svelte berputar sampai melempar effect_update_depth_exceeded --
     seluruh tab berhenti tergambar. Bergantung pada tetapan memutus
     lingkarannya. */
  const AWAL_D = { jiwa: "", kk: "", lakilaki: "", perempuan: "" };
  const AWAL_ST = { usia: "", pendidikan: "", pekerjaan: "", agama: "" };
  const AWAL_BS = { periode: "", penerima: "" };

  let c = $state({ periode: "", tgl: "", ket: "", jenis: "masuk", nominal: "" });
  let pr = $state({ nama: "", tahun: "", status: "rencana", anggaran: "", ket: "" });
  let d = $state({ ...AWAL_D });
  let st = $state({ ...AWAL_ST });
  let bs = $state({ ...AWAL_BS });
  let sibuk = $state("");

  $effect(() => { const k = konten(KONTEN.KEPENDUDUKAN); if (k) d = { ...AWAL_D, ...k }; });
  $effect(() => { const k = konten(KONTEN.STATISTIK); if (k) st = { ...AWAL_ST, ...k }; });
  $effect(() => { const k = konten(KONTEN.BANSOS); if (k) bs = { ...AWAL_BS, ...k }; });

  const kas = $derived(isi.kas || []);
  const ringkas = $derived.by(() => {
    let masuk = 0, keluar = 0;
    kas.forEach((t) => { const n = angkaDari(t.nominal); if (t.jenis === "masuk") masuk += n; else keluar += n; });
    return { masuk, keluar, saldo: masuk - keluar };
  });

  async function simpan(jenis, aksi) {
    sibuk = jenis;
    try { await aksi(); beriTahu("Tersimpan."); }
    catch (err) { beriTahu(pesanRamah(err)); }
    sibuk = "";
  }
</script>

<section class="blok">
  <div class="deret-angka">
    <div class="angka baik"><span class="label">Total pemasukan</span><span class="besar" style="font-size:21px">{kas.length ? rupiah(ringkas.masuk) : "\u2026\u2026"}</span></div>
    <div class="angka buruk"><span class="label">Total pengeluaran</span><span class="besar" style="font-size:21px">{kas.length ? rupiah(ringkas.keluar) : "\u2026\u2026"}</span></div>
    <div class="angka"><span class="label">Saldo</span><span class="besar" style="font-size:21px">{kas.length ? rupiah(ringkas.saldo) : "\u2026\u2026"}</span></div>
    <div class="angka"><span class="label">Jumlah transaksi</span><span class="besar">{kas.length}</span></div>
  </div>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Catat transaksi kas</h2></div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); simpan("kas", async () => { await tambahIsi(KOLEKSI.KAS, c); c = { periode: c.periode, tgl: "", ket: "", jenis: "masuk", nominal: "" }; muatKoleksi(KOLEKSI.KAS); }); }}>
    <div class="isian"><label for="c-periode">Periode</label><input id="c-periode" bind:value={c.periode} required placeholder="September 2026" /></div>
    <div class="isian"><label for="c-tgl">Tanggal</label><input id="c-tgl" bind:value={c.tgl} required placeholder="14 Sep" /></div>
    <div class="isian"><label for="c-ket">Keterangan</label><input id="c-ket" bind:value={c.ket} required placeholder="Iuran warga bulan September" /></div>
    <div class="isian"><label for="c-jenis">Jenis</label><select id="c-jenis" bind:value={c.jenis}><option value="masuk">Pemasukan</option><option value="keluar">Pengeluaran</option></select></div>
    <div class="isian"><label for="c-nominal">Nominal</label><input id="c-nominal" bind:value={c.nominal} inputmode="numeric" required placeholder="250000" /><span class="petunjuk">Angka saja, tanpa titik atau Rp.</span></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "kas"}>{sibuk === "kas" ? "Menyimpan..." : "Catat"}</button></div>
    <p class="catatan-borang">Buku kas dan kuitansi fisik tetap jadi bukti utama. Yang di sini salinannya supaya warga bisa memeriksa.</p>
  </form>
  <div class="kepala-bagian" style="margin-top:26px">
    <h3>Atau tempel banyak baris sekaligus</h3>
  </div>
  <div class="catatan" style="margin-bottom:16px">
    <b>Buat memasukkan buku kas yang sudah ada.</b> Salin barisnya dari Excel atau
    catatan, tempel di bawah, periksa pratinjaunya, lalu simpan sekaligus.
    Mengetik enam puluh baris satu per satu lewat borang di atas tidak masuk akal.
  </div>
  <TempelMassal
    kolom={[
      { nama: "periode", label: "Periode", wajib: true },
      { nama: "tgl", label: "Tanggal", wajib: true },
      { nama: "ket", label: "Keterangan", wajib: true },
      { nama: "jenis", label: "Jenis", wajib: true },
      { nama: "nominal", label: "Nominal", jenis: "angka", wajib: true }
    ]}
    contoh={CONTOH_KAS}
    petunjuk="Kolom Jenis diisi masuk atau keluar."
    saatSimpan={async (baris) => {
      await tambahIsi(KOLEKSI.KAS, {
        ...baris,
        jenis: String(baris.jenis).toLowerCase().startsWith("k") ? "keluar" : "masuk"
      });
      muatKoleksi(KOLEKSI.KAS);
    }}
  />

  {#each kas as o}
    <BarisKelola
      koleksi={KOLEKSI.KAS}
      id={o.id}
      judul={o.ket} baris={[(o.periode || "") + " \u00B7 " + (o.tgl || "") + " \u00B7 " + (o.jenis === "masuk" ? "Masuk" : "Keluar") + " " + rupiah(o.nominal)]}
      nilai={o}
      kolom={[
        { nama: "ket", label: "Keterangan" },
        { nama: "periode", label: "Periode" },
        { nama: "tgl", label: "Tanggal", jenis: "tanggal" },
        { nama: "jenis", label: "Jenis", jenis: "pilih", pilihan: [{ nilai: "masuk", label: "Pemasukan" }, { nilai: "keluar", label: "Pengeluaran" }] },
        { nama: "nominal", label: "Nominal", jenis: "angka" }
      ]}
    />
  {/each}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Rencana dan realisasi program</h2></div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); simpan("program", async () => { await tambahIsi(KOLEKSI.PROGRAM, pr); pr = { nama: "", tahun: "", status: "rencana", anggaran: "", ket: "" }; muatKoleksi(KOLEKSI.PROGRAM); }); }}>
    <div class="isian"><label for="pr-nama">Nama program</label><input id="pr-nama" bind:value={pr.nama} required /></div>
    <div class="isian"><label for="pr-tahun">Tahun</label><input id="pr-tahun" bind:value={pr.tahun} required placeholder="2026" /></div>
    <div class="isian"><label for="pr-status">Status</label><select id="pr-status" bind:value={pr.status}><option value="rencana">Rencana</option><option value="proses">Sedang berjalan</option><option value="selesai">Selesai</option></select></div>
    <div class="isian"><label for="pr-anggaran">Anggaran</label><input id="pr-anggaran" bind:value={pr.anggaran} inputmode="numeric" placeholder="1500000" /></div>
    <div class="isian"><label for="pr-ket">Keterangan</label><input id="pr-ket" bind:value={pr.ket} /></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "program"}>Tambahkan</button></div>
  </form>
  {#each isi.program || [] as o}
    <BarisKelola
      koleksi={KOLEKSI.PROGRAM}
      id={o.id}
      judul={o.nama} baris={[(o.tahun || "") + " \u00B7 " + o.status + " \u00B7 " + rupiah(o.anggaran), o.ket || ""]}
      nilai={o}
      kolom={[
        { nama: "nama", label: "Nama program" },
        { nama: "tahun", label: "Tahun" },
        { nama: "status", label: "Status", jenis: "pilih", pilihan: [{ nilai: "rencana", label: "Rencana" }, { nilai: "proses", label: "Sedang berjalan" }, { nilai: "selesai", label: "Selesai" }] },
        { nama: "anggaran", label: "Anggaran", jenis: "angka" },
        { nama: "ket", label: "Keterangan", jenis: "panjang" }
      ]}
    />
  {/each}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Rekapitulasi kependudukan</h2></div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); simpan("penduduk", async () => { await simpanKonten(KONTEN.KEPENDUDUKAN, d); muatKonten(KONTEN.KEPENDUDUKAN); }); }}>
    <div class="isian"><label for="d-jiwa">Jumlah jiwa</label><input id="d-jiwa" bind:value={d.jiwa} inputmode="numeric" /></div>
    <div class="isian"><label for="d-kk">Kepala keluarga</label><input id="d-kk" bind:value={d.kk} inputmode="numeric" /></div>
    <div class="isian"><label for="d-lk">Laki-laki</label><input id="d-lk" bind:value={d.lakilaki} inputmode="numeric" /></div>
    <div class="isian"><label for="d-pr">Perempuan</label><input id="d-pr" bind:value={d.perempuan} inputmode="numeric" /></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "penduduk"}>Simpan</button></div>
    <p class="catatan-borang">Isi dari hasil pendataan, bukan dari perkiraan. Selama kosong, halaman publik menampilkan tanda titik-titik.</p>
  </form>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Sebaran warga</h2></div>
  <div class="catatan" style="margin-bottom:18px">
    <b>Cara mengisi:</b> satu baris satu butir, bentuknya <span class="mono">nama : angka persen</span>.
    Contoh: <span class="mono">18-40 tahun : 34</span>
  </div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); simpan("statistik", async () => { await simpanKonten(KONTEN.STATISTIK, st); muatKonten(KONTEN.STATISTIK); }); }}>
    <div class="isian"><label for="sx-usia">Sebaran usia</label><textarea id="sx-usia" bind:value={st.usia}></textarea></div>
    <div class="isian"><label for="sx-pendidikan">Pendidikan terakhir</label><textarea id="sx-pendidikan" bind:value={st.pendidikan}></textarea></div>
    <div class="isian"><label for="sx-pekerjaan">Pekerjaan</label><textarea id="sx-pekerjaan" bind:value={st.pekerjaan}></textarea></div>
    <div class="isian"><label for="sx-agama">Pemeluk agama</label><textarea id="sx-agama" bind:value={st.agama}></textarea><span class="petunjuk">Untuk agama, isi jumlah jiwa, bukan persen.</span></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "statistik"}>Simpan sebaran</button></div>
  </form>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Penerima bantuan sosial</h2></div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); simpan("bansos", async () => { await simpanKonten(KONTEN.BANSOS, bs); muatKonten(KONTEN.BANSOS); }); }}>
    <div class="isian"><label for="bs-periode">Periode</label><input id="bs-periode" bind:value={bs.periode} placeholder="Tahap 2 tahun 2026" /></div>
    <div class="isian">
      <label for="bs-penerima">Jumlah penerima per RT</label>
      <textarea id="bs-penerima" bind:value={bs.penerima} placeholder="RT 01 : 12&#10;RT 02 : 8"></textarea>
      <span class="petunjuk">Hanya jumlah. Nama dan alamat penerima tidak pernah ditayangkan di situs.</span>
    </div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "bansos"}>Simpan</button></div>
  </form>
</section>
