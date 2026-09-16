<script>
  import { isi } from "../keadaan/isi.svelte.js";
  import { rupiah, angkaDari } from "../inti/format.js";

  const kas = $derived(Array.isArray(isi.kas) ? isi.kas : []);
  const program = $derived(Array.isArray(isi.program) ? isi.program : []);

  const periode = $derived.by(() => {
    const peta = new Map();
    for (const t of kas) {
      const nama = String(t.periode || t.tgl || "Catatan berjalan").trim() || "Catatan berjalan";
      if (!peta.has(nama)) peta.set(nama, { nama, masuk: 0, keluar: 0, jumlah: 0 });
      const baris = peta.get(nama);
      const nominal = angkaDari(t.nominal);
      if (t.jenis === "masuk") baris.masuk += nominal;
      if (t.jenis === "keluar") baris.keluar += nominal;
      baris.jumlah += 1;
    }
    return [...peta.values()].slice(0, 6);
  });

  const ringkasanProgram = $derived.by(() => {
    let rencana = 0;
    let proses = 0;
    let selesai = 0;
    let anggaran = 0;
    let denganAnggaran = 0;

    for (const p of program) {
      if (p.status === "selesai") selesai += 1;
      else if (p.status === "proses") proses += 1;
      else rencana += 1;

      const nilai = angkaDari(p.anggaran);
      if (nilai > 0) {
        anggaran += nilai;
        denganAnggaran += 1;
      }
    }

    return { rencana, proses, selesai, anggaran, denganAnggaran };
  });

  const kategoriKas = $derived.by(() => {
    const masuk = new Map();
    const keluar = new Map();

    for (const t of kas) {
      const nama = String(t.kategori || "Lainnya").trim() || "Lainnya";
      const nilai = angkaDari(t.nominal);
      const peta = t.jenis === "masuk" ? masuk : t.jenis === "keluar" ? keluar : null;
      if (peta) peta.set(nama, (peta.get(nama) || 0) + nilai);
    }

    const terbesar = (peta) => [...peta.entries()]
      .map(([nama, nilai]) => ({ nama, nilai }))
      .sort((a, b) => b.nilai - a.nilai)[0] || null;

    return { masuk: terbesar(masuk), keluar: terbesar(keluar) };
  });

  const kualitas = $derived.by(() => {
    const lengkapKas = kas.filter((t) => {
      const jenisBenar = t.jenis === "masuk" || t.jenis === "keluar";
      return Boolean(
        String(t.ket || "").trim() &&
        String(t.kategori || "").trim() &&
        String(t.periode || t.tgl || "").trim() &&
        jenisBenar &&
        angkaDari(t.nominal) > 0
      );
    }).length;

    const lengkapProgram = program.filter((p) => Boolean(
      String(p.nama || "").trim() &&
      String(p.status || "").trim() &&
      String(p.tahun || "").trim()
    )).length;

    return {
      kas: kas.length ? Math.round((lengkapKas / kas.length) * 100) : null,
      program: program.length ? Math.round((lengkapProgram / program.length) * 100) : null
    };
  });

  const transaksiTerakhir = $derived(kas[0] || null);

  function persenBagian(nilai, total) {
    if (!total) return 0;
    return Math.max(0, Math.min(100, Math.round((nilai / total) * 100)));
  }
</script>

<section class="trans-extra-shell" aria-labelledby="trans-extra-title">
  <div class="trans-extra-wrap">
    <header class="trans-extra-head">
      <div>
        <span>RINGKASAN DATA</span>
        <h2 id="trans-extra-title">Transparansi yang lebih mudah diperiksa</h2>
        <p>Bagian ini tidak membuat angka baru. Semua ringkasan dihitung langsung dari catatan kas dan program yang memang sudah dipublikasikan pengurus.</p>
      </div>
      <a href="#/kas">Buka buku kas lengkap →</a>
    </header>

    <section class="audit-grid" aria-label="Kualitas dan cakupan data transparansi">
      <article>
        <small>Cakupan periode</small>
        <strong>{periode.length}</strong>
        <p>{periode.length ? "periode kas memiliki catatan publik" : "Belum ada periode kas yang tercatat"}</p>
      </article>
      <article>
        <small>Kelengkapan transaksi</small>
        <strong>{kualitas.kas === null ? "—" : `${kualitas.kas}%`}</strong>
        <p>Keterangan, kategori, periode/tanggal, jenis, dan nominal terisi.</p>
      </article>
      <article>
        <small>Program tercatat</small>
        <strong>{program.length}</strong>
        <p>{ringkasanProgram.denganAnggaran} program sudah memiliki nilai anggaran.</p>
      </article>
      <article>
        <small>Catatan terakhir</small>
        <strong class="textual">{transaksiTerakhir?.tgl || transaksiTerakhir?.periode || "Belum ada"}</strong>
        <p>{transaksiTerakhir?.ket || "Belum ada transaksi yang dapat ditampilkan."}</p>
      </article>
    </section>

    <div class="trans-extra-grid">
      <section class="extra-card">
        <header>
          <div><span class="icon">▦</span><div><h3>Status program RW</h3><p>Jumlah program berdasarkan status yang benar-benar tersimpan.</p></div></div>
          <a href="#/program">Semua program →</a>
        </header>

        {#if program.length}
          <div class="program-summary">
            <div class="program-total">
              <span>Total anggaran tercatat</span>
              <strong>{ringkasanProgram.anggaran ? rupiah(ringkasanProgram.anggaran) : "Belum diisi"}</strong>
              <small>{ringkasanProgram.denganAnggaran} dari {program.length} program memiliki anggaran.</small>
            </div>
            <div class="status-list">
              <div><span>Direncanakan</span><b>{ringkasanProgram.rencana}</b><i style={`width:${persenBagian(ringkasanProgram.rencana, program.length)}%`}></i></div>
              <div><span>Sedang berjalan</span><b>{ringkasanProgram.proses}</b><i style={`width:${persenBagian(ringkasanProgram.proses, program.length)}%`}></i></div>
              <div><span>Selesai</span><b>{ringkasanProgram.selesai}</b><i style={`width:${persenBagian(ringkasanProgram.selesai, program.length)}%`}></i></div>
            </div>
          </div>
        {:else}
          <div class="empty"><b>Belum ada program yang dipublikasikan.</b><span>Ringkasan status akan muncul otomatis setelah data program diisi.</span></div>
        {/if}
      </section>

      <section class="extra-card">
        <header>
          <div><span class="icon">◎</span><div><h3>Komposisi kas utama</h3><p>Kategori dengan nilai terbesar dari data yang tersedia.</p></div></div>
        </header>

        {#if kas.length}
          <div class="category-grid">
            <article class="income">
              <small>Pemasukan terbesar</small>
              <strong>{kategoriKas.masuk?.nama || "Belum ada"}</strong>
              <b>{kategoriKas.masuk ? rupiah(kategoriKas.masuk.nilai) : "—"}</b>
            </article>
            <article class="expense">
              <small>Pengeluaran terbesar</small>
              <strong>{kategoriKas.keluar?.nama || "Belum ada"}</strong>
              <b>{kategoriKas.keluar ? rupiah(kategoriKas.keluar.nilai) : "—"}</b>
            </article>
          </div>
          <p class="method-note">Nilai di atas adalah agregasi berdasarkan kolom kategori pada buku kas, bukan perkiraan otomatis.</p>
        {:else}
          <div class="empty"><b>Belum ada catatan kas.</b><span>Komposisi pemasukan dan pengeluaran akan muncul setelah transaksi dipublikasikan.</span></div>
        {/if}
      </section>
    </div>

    <section class="extra-card period-card">
      <header>
        <div><span class="icon">◷</span><div><h3>Perbandingan per periode</h3><p>Masuk, keluar, dan saldo dihitung dari transaksi yang menggunakan periode yang sama.</p></div></div>
      </header>

      {#if periode.length}
        <div class="period-list">
          {#each periode as r}
            <article>
              <div class="period-name"><strong>{r.nama}</strong><small>{r.jumlah} transaksi</small></div>
              <div><small>Masuk</small><b class="green">{rupiah(r.masuk)}</b></div>
              <div><small>Keluar</small><b class="red">{rupiah(r.keluar)}</b></div>
              <div><small>Saldo periode</small><b>{rupiah(r.masuk - r.keluar)}</b></div>
            </article>
          {/each}
        </div>
      {:else}
        <div class="empty"><b>Belum ada periode untuk dibandingkan.</b></div>
      {/if}
    </section>

    <aside class="trans-method">
      <div class="method-icon">i</div>
      <div>
        <strong>Cara membaca halaman transparansi</strong>
        <p>Saldo = seluruh pemasukan tercatat dikurangi seluruh pengeluaran tercatat. Anggaran program berasal dari data program, sedangkan transaksi kas berasal dari buku kas. Keduanya tidak dianggap sebagai realisasi program yang sama kecuali memang dicatat dan dipublikasikan pengurus.</p>
      </div>
      <span>Kelengkapan program: {kualitas.program === null ? "—" : `${kualitas.program}%`}</span>
    </aside>
  </div>
</section>

<style>
  .trans-extra-shell,.trans-extra-shell *{box-sizing:border-box}.trans-extra-shell{width:100vw;margin-left:calc(50% - 50vw);padding:80px 0 72px;color:#17352f;background:linear-gradient(180deg,#eef4f0,#f7faf8 42%,#f2f6f3);font-family:"Plus Jakarta Sans",system-ui,sans-serif}.trans-extra-wrap{width:min(1180px,calc(100% - 44px));margin:auto}.trans-extra-head{display:flex;justify-content:space-between;gap:28px;align-items:end;margin-bottom:18px}.trans-extra-head>div{max-width:760px}.trans-extra-head span{font-size:11px;font-weight:900;letter-spacing:.1em;color:#0b765d}.trans-extra-head h2{margin:5px 0 6px;font-size:clamp(25px,3vw,36px);letter-spacing:-.04em;color:#14342d}.trans-extra-head p{margin:0;color:#687a74;line-height:1.6}.trans-extra-head>a,.extra-card header>a{color:#0a7058;text-decoration:none;font-weight:800;white-space:nowrap}
  .audit-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:12px}.audit-grid article,.extra-card,.trans-method{border:1px solid #dbe5e0;background:#fff;box-shadow:0 16px 38px -34px rgba(14,70,54,.48)}.audit-grid article{padding:17px 18px;border-radius:14px}.audit-grid small{display:block;color:#687974;font-size:12px}.audit-grid strong{display:block;margin:4px 0;font-size:29px;letter-spacing:-.04em;color:#17372f}.audit-grid strong.textual{font-size:17px;line-height:1.25;letter-spacing:-.02em}.audit-grid p{margin:4px 0 0;color:#7a8884;font-size:12px;line-height:1.45}
  .trans-extra-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:12px}.extra-card{padding:19px;border-radius:16px}.extra-card>header{display:flex;justify-content:space-between;align-items:center;gap:16px;padding-bottom:14px;border-bottom:1px solid #edf1ef}.extra-card>header>div{display:flex;align-items:center;gap:11px}.icon{width:38px;height:38px;display:grid;place-items:center;border-radius:10px;background:#e5f4ee;color:#087459;font-weight:900}.extra-card h3{margin:0;color:#19372f;font-size:18px;letter-spacing:-.025em}.extra-card header p{margin:3px 0 0;color:#75837f;font-size:12px;line-height:1.4}.program-summary{display:grid;grid-template-columns:minmax(210px,.8fr) minmax(0,1.2fr);gap:22px;padding-top:18px}.program-total{padding:16px;border-radius:12px;background:#f2f8f5}.program-total span,.program-total small{display:block;color:#6e7e79;font-size:12px}.program-total strong{display:block;margin:6px 0;color:#14362d;font-size:24px;letter-spacing:-.035em}.status-list{display:grid;gap:12px}.status-list>div{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:5px;align-items:center}.status-list span{font-size:13px;color:#50655e}.status-list b{font-size:13px;color:#1d3b33}.status-list i{grid-column:1/-1;height:6px;min-width:3px;border-radius:99px;background:#168766}.category-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;padding-top:18px}.category-grid article{padding:16px;border:1px solid #e4ebe8;border-radius:12px;background:#fafcfa}.category-grid small,.category-grid strong,.category-grid b{display:block}.category-grid small{color:#71807c;font-size:11px}.category-grid strong{margin:6px 0 8px;color:#243d36;font-size:15px}.category-grid b{font-size:18px}.category-grid .income b{color:#087659}.category-grid .expense b{color:#b74444}.method-note{margin:14px 2px 0;color:#7a8783;font-size:11.5px;line-height:1.5}
  .period-card{margin-top:12px}.period-list{display:grid;gap:0;margin-top:6px}.period-list article{display:grid;grid-template-columns:minmax(190px,1.25fr) repeat(3,minmax(125px,.75fr));gap:14px;align-items:center;padding:14px 4px;border-bottom:1px solid #edf1ef}.period-list article:last-child{border-bottom:0}.period-list small{display:block;color:#7a8984;font-size:11px}.period-list b{display:block;margin-top:3px;color:#29443c;font-size:13px}.period-list .green{color:#08775a}.period-list .red{color:#b94343}.period-name strong{display:block;color:#193a31;font-size:14px}.period-name small{margin-top:3px}.empty{display:grid;gap:3px;padding:22px 3px;color:#6f7f79}.empty b{color:#344d45}.empty span{font-size:12px}.trans-method{display:grid;grid-template-columns:40px minmax(0,1fr) auto;gap:12px;align-items:center;margin-top:12px;padding:15px 17px;border-radius:14px;background:#f9fbfa}.method-icon{width:38px;height:38px;display:grid;place-items:center;border-radius:10px;background:#e3f3ec;color:#087459;font-weight:900}.trans-method strong{display:block;color:#203d35;font-size:14px}.trans-method p{margin:3px 0 0;color:#71807b;font-size:12px;line-height:1.5}.trans-method>span{padding:6px 9px;border-radius:99px;background:#edf5f1;color:#567068;font-size:11px;font-weight:800;white-space:nowrap}
  @media(max-width:900px){.audit-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.trans-extra-grid{grid-template-columns:1fr}.period-list article{grid-template-columns:1fr 1fr}.period-name{grid-column:1/-1}.trans-method{grid-template-columns:40px 1fr}.trans-method>span{grid-column:2;justify-self:start}}
  @media(max-width:620px){.trans-extra-shell{padding:72px 0 56px}.trans-extra-wrap{width:min(100% - 28px,1180px)}.trans-extra-head{align-items:flex-start;flex-direction:column;gap:10px}.audit-grid{grid-template-columns:1fr 1fr}.audit-grid article{padding:14px}.audit-grid strong{font-size:24px}.program-summary{grid-template-columns:1fr}.category-grid{grid-template-columns:1fr}.period-list article{grid-template-columns:1fr 1fr;gap:10px}.extra-card{padding:15px}.extra-card>header{align-items:flex-start}.trans-method{grid-template-columns:36px 1fr;padding:13px}.trans-method>span{grid-column:1/-1}.trans-extra-head>a{font-size:13px}}
</style>
