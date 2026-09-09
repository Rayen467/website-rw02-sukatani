<script>
  import { isi } from "../keadaan/isi.svelte.js";
  import { waktu } from "../keadaan/waktu.svelte.js";
  import { rupiah, angkaDari } from "../inti/format.js";
  import { gambarWaktuAbsolut } from "../inti/waktu.js";

  const kas = $derived(isi.kas || []);
  const program = $derived(isi.program || []);
  const gambarHero = $derived(gambarWaktuAbsolut(waktu.fase));

  const ringkas = $derived.by(() => {
    let masuk = 0;
    let keluar = 0;

    for (const t of kas) {
      const nilai = angkaDari(t.nominal);
      if (t.jenis === "masuk") masuk += nilai;
      else if (t.jenis === "keluar") keluar += nilai;
    }

    return {
      masuk,
      keluar,
      saldo: masuk - keluar,
      transaksi: kas.length
    };
  });

  const skala = $derived(Math.max(ringkas.masuk, ringkas.keluar, 1));
  const tinggiMasuk = $derived(Math.max(8, Math.round((ringkas.masuk / skala) * 100)));
  const tinggiKeluar = $derived(Math.max(8, Math.round((ringkas.keluar / skala) * 100)));

  const pemasukan = $derived.by(() => {
    const peta = new Map();
    for (const t of kas.filter((x) => x.jenis === "masuk")) {
      const k = t.kategori || "Lainnya";
      peta.set(k, (peta.get(k) || 0) + angkaDari(t.nominal));
    }
    return [...peta.entries()]
      .map(([nama, nilai]) => ({ nama, nilai }))
      .sort((a, b) => b.nilai - a.nilai)
      .slice(0, 4);
  });

  const pengeluaran = $derived.by(() => {
    const peta = new Map();
    for (const t of kas.filter((x) => x.jenis === "keluar")) {
      const k = t.kategori || "Lainnya";
      peta.set(k, (peta.get(k) || 0) + angkaDari(t.nominal));
    }
    return [...peta.entries()]
      .map(([nama, nilai]) => ({ nama, nilai }))
      .sort((a, b) => b.nilai - a.nilai)
      .slice(0, 4);
  });

  const programRingkas = $derived(program.slice(0, 3));
  const transaksiTerbaru = $derived(kas.slice(0, 5));

  const periodeRingkas = $derived.by(() => {
    const peta = new Map();

    for (const t of kas) {
      const periode = t.periode || (t.tgl ? String(t.tgl).slice(0, 7) : "") || "Catatan berjalan";
      if (!peta.has(periode)) peta.set(periode, { periode, masuk: 0, keluar: 0, jumlah: 0 });
      const baris = peta.get(periode);
      const nilai = angkaDari(t.nominal);
      if (t.jenis === "masuk") baris.masuk += nilai;
      else if (t.jenis === "keluar") baris.keluar += nilai;
      baris.jumlah += 1;
    }

    return [...peta.values()].slice(0, 3);
  });

  function labelStatus(status) {
    if (status === "selesai") return "Selesai";
    if (status === "proses") return "Sedang Dikerjakan";
    if (status === "rencana") return "Direncanakan";
    return status || "Belum diisi";
  }

  function kelasStatus(status) {
    if (status === "selesai") return "selesai";
    if (status === "proses") return "proses";
    return "rencana";
  }

  function persenKategori(nilai, total) {
    if (!total) return 0;
    return Math.round((nilai / total) * 100);
  }

  function sumberProgram(i) {
    const foto = [
      "./foto/kegiatan-pengecatan.jpg",
      "./foto/kegiatan-saluran-air.jpg",
      "./foto/kegiatan-kerja-bakti.jpg"
    ];
    return foto[i % foto.length];
  }
</script>

<div class="transparansi-modern">
  <section class="trans-hero" style={"--trans-hero:url('" + gambarHero + "')"}>
    <div class="trans-hero-lapis"></div>
    <div class="trans-wadah trans-hero-grid">
      <div class="trans-hero-copy">
        <p class="trans-remah"><a href="#/">Beranda</a><span>›</span><span>Transparansi &amp; Keuangan</span></p>
        <p class="trans-kicker">Transparansi RW 02</p>
        <h1>Transparansi &amp; Keuangan RW 02</h1>
        <h2>Terbuka, Akuntabel, untuk Warga.</h2>
        <p>Catatan kas dan perkembangan program ditampilkan dalam satu halaman agar warga lebih mudah mengikuti penggunaan dana dan progres kegiatan RW 02.</p>
        <div class="trans-hero-aksi">
          <a class="trans-btn utama" href="#laporan-keuangan">Lihat Laporan <span>→</span></a>
          <a class="trans-btn" href="#program-realisasi">Program RW</a>
        </div>
      </div>

      <blockquote class="trans-hero-quote">
        <span>“</span>
        <p>Keterbukaan hari ini membantu menjaga kepercayaan lingkungan untuk masa depan.</p>
        <small>— RW 02 Sukatani</small>
      </blockquote>
    </div>
  </section>

  <main class="trans-wadah trans-isi">
    <section class="trans-stat-grid" aria-label="Ringkasan transparansi">
      <article class="trans-stat hijau">
        <span class="trans-stat-ikon">▣</span>
        <div><small>Saldo Kas Saat Ini</small><strong>{rupiah(ringkas.saldo)}</strong><p>{ringkas.transaksi} transaksi tercatat</p></div>
      </article>
      <article class="trans-stat hijau">
        <span class="trans-stat-ikon">↥</span>
        <div><small>Total Pemasukan</small><strong>{rupiah(ringkas.masuk)}</strong><p>Dari catatan kas yang dipublikasikan</p></div>
      </article>
      <article class="trans-stat merah">
        <span class="trans-stat-ikon">↧</span>
        <div><small>Total Pengeluaran</small><strong>{rupiah(ringkas.keluar)}</strong><p>Dari catatan kas yang dipublikasikan</p></div>
      </article>
      <article class="trans-stat biru">
        <span class="trans-stat-ikon">▦</span>
        <div><small>Status Data</small><strong>{kas.length || program.length ? "Terpublikasi" : "Belum Diisi"}</strong><p>{waktu.tanggal || "Mengikuti data pengurus"}</p></div>
      </article>
    </section>

    <section class="trans-ringkasan-grid" id="laporan-keuangan">
      <article class="trans-card trans-uang">
        <header class="trans-section-head">
          <div>
            <span class="trans-head-icon">◉</span>
            <div><h2>Uang RW Digunakan untuk Apa?</h2><p>Ringkasan pemasukan dan pengeluaran dari catatan kas publik.</p></div>
          </div>
          <a href="#/kas">Rincian Kas →</a>
        </header>

        {#if kas.length}
          <div class="trans-uang-grid">
            <div class="trans-chart">
              <div class="trans-chart-area">
                <div class="trans-bar-wrap">
                  <strong>{rupiah(ringkas.masuk)}</strong>
                  <div class="trans-bar masuk" style={"height:" + tinggiMasuk + "%"}></div>
                  <small>Pemasukan</small>
                </div>
                <div class="trans-bar-wrap">
                  <strong>{rupiah(ringkas.keluar)}</strong>
                  <div class="trans-bar keluar" style={"height:" + tinggiKeluar + "%"}></div>
                  <small>Pengeluaran</small>
                </div>
              </div>
            </div>

            <div class="trans-rincian">
              <h3>Sumber Pemasukan <span>{rupiah(ringkas.masuk)}</span></h3>
              {#if pemasukan.length}
                {#each pemasukan as item}
                  <div class="trans-rincian-row">
                    <span>{item.nama}</span>
                    <b>{rupiah(item.nilai)}</b>
                    <small>{persenKategori(item.nilai, ringkas.masuk)}%</small>
                  </div>
                {/each}
              {:else}
                <p class="trans-belum">Belum ada rincian pemasukan.</p>
              {/if}
            </div>

            <div class="trans-rincian trans-rincian-keluar">
              <h3>Rincian Pengeluaran <span>{rupiah(ringkas.keluar)}</span></h3>
              {#if pengeluaran.length}
                {#each pengeluaran as item}
                  <div class="trans-rincian-row">
                    <span>{item.nama}</span>
                    <b>{rupiah(item.nilai)}</b>
                    <small>{persenKategori(item.nilai, ringkas.keluar)}%</small>
                  </div>
                {/each}
              {:else}
                <p class="trans-belum">Belum ada rincian pengeluaran.</p>
              {/if}
            </div>
          </div>

          <div class="trans-surplus" class:minus={ringkas.saldo < 0}>
            <span>↗</span>
            <div><small>Posisi kas saat ini</small><strong>{rupiah(ringkas.saldo)}</strong></div>
            <p>{ringkas.saldo >= 0 ? "Saldo dihitung dari seluruh pemasukan dikurangi pengeluaran yang tercatat." : "Pengeluaran tercatat lebih besar daripada pemasukan."}</p>
            <a href="#/kas">Lihat Rincian Transaksi →</a>
          </div>
        {:else}
          <div class="trans-empty">
            <strong>Belum ada catatan kas yang dipublikasikan.</strong>
            <p>Begitu bendahara mengisi pemasukan dan pengeluaran, ringkasan keuangan akan muncul otomatis di sini.</p>
          </div>
        {/if}
      </article>

      <aside class="trans-quote-card">
        <img src="./foto/kegiatan-pengecatan.jpg" alt="" decoding="async" />
        <span></span>
        <blockquote>“Setiap kontribusi warga membawa perubahan nyata untuk lingkungan kita.”</blockquote>
        <small>— Pengurus RW 02</small>
      </aside>
    </section>

    <section class="trans-program" id="program-realisasi">
      <header class="trans-section-head">
        <div>
          <span class="trans-head-icon">⌁</span>
          <div><h2>Program &amp; Realisasi</h2><p>Transparansi penggunaan dana untuk pembangunan dan kegiatan RW.</p></div>
        </div>
        <a href="#/program">Lihat Semua Program →</a>
      </header>

      {#if programRingkas.length}
        <div class="trans-program-grid">
          {#each programRingkas as p, i}
            <article class="trans-program-card">
              <img src={p.foto || p.sampul || sumberProgram(i)} alt="" decoding="async" />
              <div class="trans-program-copy">
                <div class="trans-program-top">
                  <h3>{p.nama || "Program RW"}</h3>
                  <span class={"status " + kelasStatus(p.status)}>{labelStatus(p.status)}</span>
                </div>
                <p>{p.ket || "Keterangan program akan diperbarui pengurus."}</p>
                <div class="trans-program-info">
                  <span><small>Anggaran</small><b>{p.anggaran ? rupiah(p.anggaran) : "Belum diisi"}</b></span>
                  <span><small>Tahun</small><b>{p.tahun || "—"}</b></span>
                </div>
              </div>
            </article>
          {/each}
        </div>
      {:else}
        <div class="trans-empty">
          <strong>Belum ada program yang dipublikasikan.</strong>
          <p>Rencana kerja dan realisasi program akan tampil di bagian ini setelah diisi pengurus.</p>
        </div>
      {/if}
    </section>

    <section class="trans-bawah-grid">
      <article class="trans-card">
        <header class="trans-section-head">
          <div>
            <span class="trans-head-icon">▤</span>
            <div><h2>Laporan Keuangan</h2><p>Ringkasan catatan berdasarkan periode yang tersedia.</p></div>
          </div>
          <a href="#/kas">Lihat Semua Laporan →</a>
        </header>

        {#if periodeRingkas.length}
          <div class="trans-periode-grid">
            {#each periodeRingkas as r}
              <article>
                <h3>{r.periode}</h3>
                <p>Saldo periode: <strong>{rupiah(r.masuk - r.keluar)}</strong></p>
                <small>{r.jumlah} transaksi · Masuk {rupiah(r.masuk)} · Keluar {rupiah(r.keluar)}</small>
                <a href="#/kas">Buka rincian <span>›</span></a>
              </article>
            {/each}
          </div>
        {:else}
          <div class="trans-empty kecil"><strong>Belum ada laporan periode.</strong></div>
        {/if}
      </article>

      <article class="trans-card">
        <header class="trans-section-head">
          <div>
            <span class="trans-head-icon">◷</span>
            <div><h2>Transaksi Terbaru</h2><p>Catatan publik paling baru yang tersedia.</p></div>
          </div>
          <a href="#/kas">Lihat Semua →</a>
        </header>

        {#if transaksiTerbaru.length}
          <div class="trans-table-wrap">
            <table>
              <thead><tr><th>Tanggal</th><th>Keterangan</th><th>Masuk</th><th>Keluar</th></tr></thead>
              <tbody>
                {#each transaksiTerbaru as t}
                  <tr>
                    <td>{t.tgl || t.periode || "—"}</td>
                    <td>{t.ket || "Tanpa keterangan"}</td>
                    <td class="masuk">{t.jenis === "masuk" ? rupiah(t.nominal) : "—"}</td>
                    <td class="keluar">{t.jenis === "keluar" ? rupiah(t.nominal) : "—"}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <div class="trans-empty kecil"><strong>Belum ada transaksi terbaru.</strong></div>
        {/if}
      </article>
    </section>
  </main>
</div>

<style>
  .transparansi-modern,
  .transparansi-modern * { box-sizing: border-box; }

  .transparansi-modern {
    --tr-bg: #f6f9f5;
    --tr-card: #fff;
    --tr-ink: #123448;
    --tr-text: #5b6e75;
    --tr-line: #dce7e0;
    --tr-green: #0d8b64;
    --tr-green-dark: #08634d;
    width: 100vw;
    margin-left: calc(50% - 50vw);
    margin-top: -32px;
    margin-bottom: -64px;
    overflow: hidden;
    color: var(--tr-ink);
    background:
      radial-gradient(circle at 1% 27%, rgba(86,153,92,.09), transparent 18%),
      radial-gradient(circle at 99% 64%, rgba(86,153,92,.08), transparent 18%),
      var(--tr-bg);
    font-family: "Plus Jakarta Sans", system-ui, sans-serif;
  }

  .trans-wadah {
    width: min(1180px, calc(100% - 44px));
    margin-inline: auto;
  }

  .trans-hero {
    position: relative;
    min-height: 330px;
    color: #fff;
    background: #153b33 var(--trans-hero) center 54% / cover no-repeat;
  }

  .trans-hero-lapis {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, rgba(3,42,36,.93), rgba(5,61,49,.62) 48%, rgba(4,42,36,.18) 78%, rgba(3,35,31,.35)),
      linear-gradient(180deg, rgba(0,0,0,.03), rgba(3,31,27,.34));
  }

  .trans-hero-grid {
    position: relative;
    z-index: 1;
    min-height: 330px;
    display: grid;
    grid-template-columns: minmax(0,1fr) 220px;
    gap: 40px;
    align-items: center;
    padding: 42px 0 38px;
  }

  .trans-hero-copy { max-width: 690px; }
  .trans-remah { display:flex; gap:5px; margin:0 0 12px; color:rgba(255,255,255,.8); font-size:8px; }
  .trans-remah a { color:inherit; text-decoration:none; }
  .trans-kicker { margin:0 0 7px; color:#a7f0d6; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.07em; }

  .trans-hero h1 {
    max-width: 17ch;
    margin: 0;
    color: #b7f5df;
    font-size: clamp(37px,4.5vw,58px);
    line-height: .98;
    letter-spacing: -.045em;
  }

  .trans-hero h2 {
    margin: 6px 0 0;
    color: #fff;
    font-size: clamp(21px,2.4vw,29px);
    letter-spacing: -.03em;
  }

  .trans-hero-copy > p:last-of-type {
    max-width: 60ch;
    margin: 10px 0 0;
    color: rgba(255,255,255,.91);
    font-size: 11.5px;
    line-height: 1.55;
  }

  .trans-hero-aksi { display:flex; gap:8px; flex-wrap:wrap; margin-top:16px; }
  .trans-btn {
    min-height: 38px;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    gap:9px;
    padding:8px 15px;
    border:1px solid rgba(255,255,255,.48);
    border-radius:999px;
    color:#fff;
    background:rgba(4,40,35,.3);
    font-size:9px;
    font-weight:750;
    text-decoration:none;
  }
  .trans-btn.utama { border-color:#52deb0; background:linear-gradient(180deg,#15966d,#087457); }

  .trans-hero-quote {
    margin:0;
    padding:16px;
    border:1px solid rgba(255,255,255,.28);
    border-radius:13px;
    background:rgba(6,50,45,.56);
    backdrop-filter:blur(9px);
  }
  .trans-hero-quote > span { color:#fff; font-family:Georgia,serif; font-size:30px; line-height:.7; }
  .trans-hero-quote p { margin:6px 0 9px; color:#fff; font-family:Georgia,serif; font-size:12px; line-height:1.42; }
  .trans-hero-quote small { color:rgba(255,255,255,.72); font-size:7px; }

  .trans-isi { position:relative; z-index:2; padding-bottom:48px; }

  .trans-stat-grid {
    display:grid;
    grid-template-columns:repeat(4,minmax(0,1fr));
    gap:9px;
    margin-top:-18px;
    padding:9px;
    border:1px solid var(--tr-line);
    border-radius:14px;
    background:rgba(255,255,255,.96);
    box-shadow:0 16px 38px -32px rgba(23,66,48,.45);
  }

  .trans-stat {
    min-width:0;
    min-height:82px;
    display:grid;
    grid-template-columns:48px minmax(0,1fr);
    gap:10px;
    align-items:center;
    padding:10px;
    border:1px solid #edf2ee;
    border-radius:10px;
    background:#fff;
  }

  .trans-stat-ikon {
    width:48px;
    height:48px;
    display:grid;
    place-items:center;
    border-radius:11px;
    font-size:18px;
    font-weight:800;
  }
  .trans-stat.hijau .trans-stat-ikon { color:#087a55; background:#dcf4e7; }
  .trans-stat.merah .trans-stat-ikon { color:#d62e39; background:#ffe3e5; }
  .trans-stat.biru .trans-stat-ikon { color:#1675cc; background:#e1efff; }

  .trans-stat small,.trans-stat strong,.trans-stat p { display:block; }
  .trans-stat small { color:#42606c; font-size:7px; font-weight:700; }
  .trans-stat strong { margin-top:2px; color:#0e3447; font-size:17px; line-height:1.05; }
  .trans-stat p { margin:4px 0 0; color:#71817e; font-size:6px; line-height:1.3; }

  .trans-card {
    min-width:0;
    padding:12px;
    border:1px solid var(--tr-line);
    border-radius:11px;
    background:var(--tr-card);
    box-shadow:0 12px 28px -25px rgba(24,65,51,.32);
  }

  .trans-section-head {
    min-height:38px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
  }

  .trans-section-head > div {
    min-width:0;
    display:flex;
    align-items:center;
    gap:8px;
  }

  .trans-head-icon {
    width:30px;
    height:30px;
    display:grid;
    place-items:center;
    flex:0 0 30px;
    border-radius:8px;
    color:#087b5b;
    background:#ddf3ea;
    font-size:13px;
  }

  .trans-section-head h2 { margin:0; color:var(--tr-ink); font-size:15px; line-height:1.1; }
  .trans-section-head p { margin:2px 0 0; color:var(--tr-text); font-size:6.6px; }
  .trans-section-head > a { flex:none; color:#087457; font-size:6.5px; font-weight:750; text-decoration:none; }

  .trans-ringkasan-grid {
    display:grid;
    grid-template-columns:minmax(0,1fr) 250px;
    gap:12px;
    margin-top:13px;
  }

  .trans-uang-grid {
    display:grid;
    grid-template-columns:240px minmax(0,1fr) minmax(0,1fr);
    gap:10px;
    margin-top:9px;
  }

  .trans-chart {
    min-height:205px;
    display:grid;
    align-items:end;
    padding:10px 12px 5px;
    border:1px solid #edf2ee;
    border-radius:9px;
    background:linear-gradient(180deg,#fff,#fafcfb);
  }

  .trans-chart-area {
    height:175px;
    display:flex;
    justify-content:center;
    align-items:flex-end;
    gap:27px;
    border-bottom:1px solid #dfe7e2;
    background:repeating-linear-gradient(to top,transparent 0 43px,#edf2ef 44px);
  }

  .trans-bar-wrap {
    width:76px;
    height:100%;
    display:flex;
    flex-direction:column;
    justify-content:flex-end;
    align-items:center;
  }

  .trans-bar-wrap strong { margin-bottom:5px; color:#163e45; font-size:8px; white-space:nowrap; }
  .trans-bar { width:56px; min-height:8px; border-radius:4px 4px 0 0; }
  .trans-bar.masuk { background:linear-gradient(180deg,#32b88a,#15966f); }
  .trans-bar.keluar { background:linear-gradient(180deg,#ff5d68,#e33843); }
  .trans-bar-wrap small { margin:5px 0 -18px; color:#667975; font-size:6px; }

  .trans-rincian {
    min-width:0;
    padding:9px;
    border:1px solid #e3ebe6;
    border-radius:9px;
    background:#fbfdfc;
  }

  .trans-rincian h3 {
    display:flex;
    justify-content:space-between;
    gap:8px;
    margin:0 0 5px;
    color:#176149;
    font-size:8px;
  }

  .trans-rincian-keluar h3 { color:#c8343f; }

  .trans-rincian-row {
    display:grid;
    grid-template-columns:minmax(0,1fr) auto 30px;
    gap:6px;
    align-items:center;
    min-height:30px;
    border-bottom:1px solid #edf2ef;
    color:#52666a;
    font-size:6.2px;
  }

  .trans-rincian-row:last-child { border-bottom:0; }
  .trans-rincian-row b { color:#42575a; font-size:6.2px; }
  .trans-rincian-row small { color:#82908c; text-align:right; font-size:5.8px; }

  .trans-surplus {
    display:grid;
    grid-template-columns:34px 120px minmax(0,1fr) auto;
    gap:9px;
    align-items:center;
    margin-top:9px;
    padding:8px 10px;
    border-radius:8px;
    background:#e4f6ed;
  }

  .trans-surplus > span {
    width:32px;height:32px;display:grid;place-items:center;border-radius:50%;color:#087653;background:#c9eadb;font-size:15px;
  }
  .trans-surplus small,.trans-surplus strong { display:block; }
  .trans-surplus small { color:#527368; font-size:5.8px; }
  .trans-surplus strong { margin-top:2px; color:#087653; font-size:14px; }
  .trans-surplus p { margin:0; color:#59716a; font-size:5.8px; line-height:1.4; }
  .trans-surplus a { padding:7px 10px; border-radius:6px; color:#fff; background:#0a7b5e; font-size:6px; font-weight:750; text-decoration:none; }
  .trans-surplus.minus { background:#fff0f1; }
  .trans-surplus.minus > span { color:#b52c36;background:#ffdce0; }
  .trans-surplus.minus strong { color:#b52c36; }

  .trans-quote-card {
    position:relative;
    min-height:315px;
    overflow:hidden;
    border-radius:11px;
  }
  .trans-quote-card img,.trans-quote-card > span { position:absolute;inset:0;width:100%;height:100%; }
  .trans-quote-card img { object-fit:cover; }
  .trans-quote-card > span { background:linear-gradient(180deg,transparent 28%,rgba(3,37,31,.72)); }
  .trans-quote-card blockquote {
    position:absolute;z-index:1;left:15px;right:15px;bottom:38px;margin:0;color:#fff;
    font-family:Georgia,serif;font-size:15px;font-style:italic;line-height:1.25;text-shadow:0 2px 10px rgba(0,0,0,.5);
  }
  .trans-quote-card small { position:absolute;z-index:1;right:15px;bottom:17px;color:rgba(255,255,255,.82);font-size:6px; }

  .trans-program {
    margin-top:13px;
    padding:12px;
    border:1px solid var(--tr-line);
    border-radius:11px;
    background:#fff;
  }

  .trans-program-grid {
    display:grid;
    grid-template-columns:repeat(3,minmax(0,1fr));
    gap:9px;
    margin-top:9px;
  }

  .trans-program-card {
    min-width:0;
    display:grid;
    grid-template-columns:125px minmax(0,1fr);
    overflow:hidden;
    border:1px solid #e3ebe6;
    border-radius:9px;
    background:#fff;
  }

  .trans-program-card > img { width:125px;height:145px;object-fit:cover; }
  .trans-program-copy { min-width:0;padding:9px; }
  .trans-program-top { display:flex;align-items:flex-start;justify-content:space-between;gap:6px; }
  .trans-program-top h3 { margin:0;color:#143849;font-size:9px;line-height:1.25; }
  .status { flex:none;padding:3px 6px;border-radius:999px;font-size:5.4px;font-weight:750; }
  .status.selesai { color:#0c754d;background:#d9f4e5; }
  .status.proses { color:#9a6510;background:#fff0cb; }
  .status.rencana { color:#2872a6;background:#e4f1fb; }
  .trans-program-copy > p { min-height:44px;margin:7px 0;color:#607177;font-size:6.2px;line-height:1.42; }

  .trans-program-info { display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:6px; }
  .trans-program-info span { padding:5px;border-radius:6px;background:#f5f8f6; }
  .trans-program-info small,.trans-program-info b { display:block; }
  .trans-program-info small { color:#81908c;font-size:5.3px; }
  .trans-program-info b { margin-top:2px;color:#20454a;font-size:6.3px; }

  .trans-bawah-grid {
    display:grid;
    grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);
    gap:12px;
    margin-top:13px;
  }

  .trans-periode-grid {
    display:grid;
    grid-template-columns:repeat(3,minmax(0,1fr));
    gap:8px;
    margin-top:9px;
  }

  .trans-periode-grid article {
    min-width:0;
    padding:9px;
    border:1px solid #e3ebe6;
    border-radius:8px;
    background:#fbfdfc;
  }
  .trans-periode-grid h3 { margin:0 0 5px;color:#173b46;font-size:9px; }
  .trans-periode-grid p { margin:0;color:#53686b;font-size:6.2px; }
  .trans-periode-grid p strong { color:#0b805b; }
  .trans-periode-grid small { display:block;margin-top:5px;color:#71817e;font-size:5.3px;line-height:1.4; }
  .trans-periode-grid a { display:flex;justify-content:space-between;margin-top:8px;color:#0a7457;font-size:5.8px;font-weight:700;text-decoration:none; }

  .trans-table-wrap { overflow:auto;margin-top:8px;border:1px solid #e3ebe6;border-radius:8px; }
  .trans-table-wrap table { width:100%;border-collapse:collapse;font-size:5.8px; }
  .trans-table-wrap th { padding:6px;color:#455d62;background:#f0f5f2;text-align:left;font-size:5.5px; }
  .trans-table-wrap td { padding:6px;border-top:1px solid #edf2ef;color:#5f7175; }
  .trans-table-wrap td.masuk { color:#0b8b62;font-weight:700; }
  .trans-table-wrap td.keluar { color:#d23a44;font-weight:700; }

  .trans-empty {
    margin-top:10px;
    padding:18px;
    border:1px dashed #cddbd3;
    border-radius:9px;
    color:#647772;
    background:#f7faf8;
    text-align:center;
  }
  .trans-empty strong { display:block;color:#254b45;font-size:9px; }
  .trans-empty p { max-width:60ch;margin:5px auto 0;font-size:6.5px;line-height:1.45; }
  .trans-empty.kecil { padding:12px; }
  .trans-belum { margin:7px 0;color:#72817e;font-size:6px; }

  :global(:root[data-waktu="malam"]) .transparansi-modern {
    --tr-bg:#071820;
    --tr-card:#0b222a;
    --tr-ink:#eef8f5;
    --tr-text:#afc1bc;
    --tr-line:rgba(196,225,216,.12);
  }
  :global(:root[data-waktu="malam"]) .trans-stat-grid,
  :global(:root[data-waktu="malam"]) .trans-stat,
  :global(:root[data-waktu="malam"]) .trans-card,
  :global(:root[data-waktu="malam"]) .trans-program,
  :global(:root[data-waktu="malam"]) .trans-program-card {
    background:#0b222a;
    border-color:rgba(196,225,216,.12);
  }
  :global(:root[data-waktu="malam"]) .trans-section-head h2,
  :global(:root[data-waktu="malam"]) .trans-program-top h3,
  :global(:root[data-waktu="malam"]) .trans-stat strong {
    color:#eef8f5;
  }
  :global(:root[data-waktu="malam"]) .trans-rincian,
  :global(:root[data-waktu="malam"]) .trans-chart,
  :global(:root[data-waktu="malam"]) .trans-periode-grid article,
  :global(:root[data-waktu="malam"]) .trans-program-info span {
    background:#102b32;
    border-color:rgba(196,225,216,.12);
  }

  @media (max-width:980px) {
    .trans-stat-grid { grid-template-columns:1fr 1fr; }
    .trans-ringkasan-grid,
    .trans-bawah-grid { grid-template-columns:1fr; }
    .trans-uang-grid { grid-template-columns:1fr 1fr; }
    .trans-chart { grid-column:1 / -1; }
    .trans-program-grid { grid-template-columns:1fr; }
    .trans-program-card { grid-template-columns:180px minmax(0,1fr); }
    .trans-program-card > img { width:180px;height:145px; }
    .trans-quote-card { min-height:220px; }
  }

  @media (max-width:680px) {
    .transparansi-modern { margin-top:-18px;margin-bottom:-44px; }
    .trans-wadah { width:100%;max-width:100%;padding-inline:14px; }
    .trans-hero { min-height:420px;background-position:62% center; }
    .trans-hero-grid { min-height:420px;grid-template-columns:1fr;gap:13px;padding:32px 0 25px; }
    .trans-hero h1 { max-width:15ch;font-size:40px; }
    .trans-hero h2 { font-size:21px; }
    .trans-hero-quote { width:min(210px,70%);justify-self:end; }
    .trans-stat-grid { grid-template-columns:1fr 1fr;gap:5px;margin-top:-12px;padding:6px; }
    .trans-stat { min-height:72px;grid-template-columns:38px minmax(0,1fr);gap:7px;padding:7px; }
    .trans-stat-ikon { width:38px;height:38px; }
    .trans-stat strong { font-size:12px; }
    .trans-uang-grid { grid-template-columns:1fr; }
    .trans-chart { grid-column:auto; }
    .trans-surplus { grid-template-columns:32px minmax(0,1fr); }
    .trans-surplus p,.trans-surplus a { grid-column:1 / -1; }
    .trans-program-card { grid-template-columns:110px minmax(0,1fr); }
    .trans-program-card > img { width:110px;height:145px; }
    .trans-periode-grid { grid-template-columns:1fr; }
  }

  @media (max-width:430px) {
    .trans-stat-grid { grid-template-columns:1fr; }
    .trans-program-card { grid-template-columns:1fr; }
    .trans-program-card > img { width:100%;height:150px; }
  }
</style>
