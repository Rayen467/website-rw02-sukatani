<script>
  import { isi, konten, beriTahu, muatKoleksi, muatKonten } from "../../lib/keadaan.svelte.js";
  import { tambahIsi, simpanKonten, pesanRamah } from "../../lib/firebase.js";
  import { rupiah, angkaDari } from "../../lib/bantu.js";
  import BarisHapus from "../../komponen/BarisHapus.svelte";

  let c = $state({ periode: "", tgl: "", ket: "", jenis: "masuk", nominal: "" });
  let pr = $state({ nama: "", tahun: "", status: "rencana", anggaran: "", ket: "" });
  let d = $state({ jiwa: "", kk: "", lakilaki: "", perempuan: "" });
  let st = $state({ usia: "", pendidikan: "", pekerjaan: "", agama: "" });
  let bs = $state({ periode: "", penerima: "" });
  let sibuk = $state("");

  $effect(() => { const k = konten("kependudukan"); if (k) d = { ...d, ...k }; });
  $effect(() => { const k = konten("statistik"); if (k) st = { ...st, ...k }; });
  $effect(() => { const k = konten("bansos"); if (k) bs = { ...bs, ...k }; });

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
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); simpan("kas", async () => { await tambahIsi("kas", c); c = { periode: c.periode, tgl: "", ket: "", jenis: "masuk", nominal: "" }; muatKoleksi("kas"); }); }}>
    <div class="isian"><label for="c-periode">Periode</label><input id="c-periode" bind:value={c.periode} required placeholder="September 2026" /></div>
    <div class="isian"><label for="c-tgl">Tanggal</label><input id="c-tgl" bind:value={c.tgl} required placeholder="14 Sep" /></div>
    <div class="isian"><label for="c-ket">Keterangan</label><input id="c-ket" bind:value={c.ket} required placeholder="Iuran warga bulan September" /></div>
    <div class="isian"><label for="c-jenis">Jenis</label><select id="c-jenis" bind:value={c.jenis}><option value="masuk">Pemasukan</option><option value="keluar">Pengeluaran</option></select></div>
    <div class="isian"><label for="c-nominal">Nominal</label><input id="c-nominal" bind:value={c.nominal} inputmode="numeric" required placeholder="250000" /><span class="petunjuk">Angka saja, tanpa titik atau Rp.</span></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "kas"}>{sibuk === "kas" ? "Menyimpan..." : "Catat"}</button></div>
    <p class="catatan-borang">Buku kas dan kuitansi fisik tetap jadi bukti utama. Yang di sini salinannya supaya warga bisa memeriksa.</p>
  </form>
  {#each kas as o}
    <BarisHapus koleksi="kas" id={o.id} judul={o.ket} baris={[(o.periode || "") + " \u00B7 " + (o.tgl || "") + " \u00B7 " + (o.jenis === "masuk" ? "Masuk" : "Keluar") + " " + rupiah(o.nominal)]} />
  {/each}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Rencana dan realisasi program</h2></div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); simpan("program", async () => { await tambahIsi("program", pr); pr = { nama: "", tahun: "", status: "rencana", anggaran: "", ket: "" }; muatKoleksi("program"); }); }}>
    <div class="isian"><label for="pr-nama">Nama program</label><input id="pr-nama" bind:value={pr.nama} required /></div>
    <div class="isian"><label for="pr-tahun">Tahun</label><input id="pr-tahun" bind:value={pr.tahun} required placeholder="2026" /></div>
    <div class="isian"><label for="pr-status">Status</label><select id="pr-status" bind:value={pr.status}><option value="rencana">Rencana</option><option value="proses">Sedang berjalan</option><option value="selesai">Selesai</option></select></div>
    <div class="isian"><label for="pr-anggaran">Anggaran</label><input id="pr-anggaran" bind:value={pr.anggaran} inputmode="numeric" placeholder="1500000" /></div>
    <div class="isian"><label for="pr-ket">Keterangan</label><input id="pr-ket" bind:value={pr.ket} /></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "program"}>Tambahkan</button></div>
  </form>
  {#each isi.program || [] as o}
    <BarisHapus koleksi="program" id={o.id} judul={o.nama} baris={[(o.tahun || "") + " \u00B7 " + o.status + " \u00B7 " + rupiah(o.anggaran), o.ket || ""]} />
  {/each}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Rekapitulasi kependudukan</h2></div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); simpan("penduduk", async () => { await simpanKonten("kependudukan", d); muatKonten("kependudukan"); }); }}>
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
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); simpan("statistik", async () => { await simpanKonten("statistik", st); muatKonten("statistik"); }); }}>
    <div class="isian"><label for="sx-usia">Sebaran usia</label><textarea id="sx-usia" bind:value={st.usia}></textarea></div>
    <div class="isian"><label for="sx-pendidikan">Pendidikan terakhir</label><textarea id="sx-pendidikan" bind:value={st.pendidikan}></textarea></div>
    <div class="isian"><label for="sx-pekerjaan">Pekerjaan</label><textarea id="sx-pekerjaan" bind:value={st.pekerjaan}></textarea></div>
    <div class="isian"><label for="sx-agama">Pemeluk agama</label><textarea id="sx-agama" bind:value={st.agama}></textarea><span class="petunjuk">Untuk agama, isi jumlah jiwa, bukan persen.</span></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "statistik"}>Simpan sebaran</button></div>
  </form>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Penerima bantuan sosial</h2></div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); simpan("bansos", async () => { await simpanKonten("bansos", bs); muatKonten("bansos"); }); }}>
    <div class="isian"><label for="bs-periode">Periode</label><input id="bs-periode" bind:value={bs.periode} placeholder="Tahap 2 tahun 2026" /></div>
    <div class="isian">
      <label for="bs-penerima">Jumlah penerima per RT</label>
      <textarea id="bs-penerima" bind:value={bs.penerima} placeholder="RT 01 : 12&#10;RT 02 : 8"></textarea>
      <span class="petunjuk">Hanya jumlah. Nama dan alamat penerima tidak pernah ditayangkan di situs.</span>
    </div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "bansos"}>Simpan</button></div>
  </form>
</section>
