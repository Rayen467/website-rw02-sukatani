<script>
  import { KOLEKSI } from "../inti/nama.js";
  import { isi, pakai } from "../keadaan/isi.svelte.js";
  import { beriTahu } from "../keadaan/pesan.svelte.js";
  import { sesi } from "../keadaan/sesi.svelte.js";
  import { FASILITAS_BAWAAN } from "../inti/bawaan.js";
  import { NAMA_BULAN, tanggalHariIni } from "../inti/format.js";
  import { kirimWarga } from "../sumber/data.js";
  import { pesanRamah } from "../sumber/firebase.js";
  import { pergi } from "../keadaan/rute.svelte.js";
  import { waktu } from "../keadaan/waktu.svelte.js";
  import { gambarWaktuAbsolut } from "../inti/waktu.js";

  const fasilitas = $derived(pakai("fasilitas", FASILITAS_BAWAAN));
  const jadwal = $derived(isi.jadwal || []);
  const hero = $derived(gambarWaktuAbsolut(waktu.fase));

  const kini = new Date();
  let tahun = $state(kini.getFullYear());
  let bulan = $state(kini.getMonth());
  let form = $state({ fasilitas: "", tanggal: tanggalHariIni(), jam: "", acara: "", nama: "", wa: "" });
  let mengirim = $state(false);

  $effect(() => { if (!form.fasilitas && fasilitas.length) form.fasilitas = fasilitas[0].nama; });

  function tanggalJadwal(j) {
    return j.tanggal || String(j.id || "").split("--")[0];
  }

  function fasilitasTerpakai(tanggal, nama) {
    const target = String(nama || "").trim().toLowerCase();
    return jadwal.some((j) =>
      tanggalJadwal(j) === tanggal &&
      String(j.fasilitas || "").trim().toLowerCase() === target
    );
  }

  const bentrok = $derived(fasilitasTerpakai(form.tanggal, form.fasilitas));

  const sel = $derived.by(() => {
    const jumlahHari = new Date(tahun, bulan + 1, 0).getDate();
    const mulai = (new Date(tahun, bulan, 1).getDay() + 6) % 7;
    const hasil = [];
    for (let i = 0; i < mulai; i++) hasil.push(null);
    for (let d = 1; d <= jumlahHari; d++) {
      const iso = tahun + "-" + String(bulan + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
      hasil.push({
        hari: d,
        iso,
        dipakai: jadwal.filter((j) => tanggalJadwal(j) === iso)
      });
    }
    while (hasil.length % 7 !== 0) hasil.push(null);
    return hasil;
  });

  function geser(n) {
    let b = bulan + n, t = tahun;
    if (b < 0) { b = 11; t--; }
    if (b > 11) { b = 0; t++; }
    bulan = b; tahun = t;
  }

  function pilihFasilitas(nama) {
    form.fasilitas = nama;
  }

  async function kirim(e) {
    e.preventDefault();
    if (!sesi.pengguna) { beriTahu("Masuk dulu supaya permohonan bisa Anda lacak sendiri."); pergi("/masuk"); return; }
    if (!sesi.terverifikasi) { beriTahu("Verifikasi email dulu sebelum mengajukan reservasi."); pergi("/akun"); return; }
    if (fasilitasTerpakai(form.tanggal, form.fasilitas)) {
      beriTahu(form.fasilitas + " sudah terpakai pada tanggal tersebut. Pilih tanggal atau fasilitas lain.");
      return;
    }
    mengirim = true;
    try {
      await kirimWarga(KOLEKSI.RESERVASI, form);
      beriTahu("Permohonan terkirim. Pengurus akan menghubungi lewat WhatsApp.");
      form = { ...form, jam: "", acara: "" };
    } catch (err) {
      beriTahu(pesanRamah(err));
    }
    mengirim = false;
  }

  function ikonFasilitas(nama = "") {
    const n = nama.toLowerCase();
    if (n.includes("lapang")) return "⚽";
    if (n.includes("tenda")) return "△";
    if (n.includes("kursi")) return "▣";
    if (n.includes("aula") || n.includes("balai") || n.includes("gor")) return "▥";
    return "◇";
  }
</script>

<div class="reservation-page" style={`--hero:url('${hero}')`}>
  <section class="reservation-hero">
    <div class="hero-overlay"></div>
    <div class="reservation-shell hero-grid">
      <div class="hero-copy">
        <span class="eyebrow">FASILITAS RW 02</span>
        <h1>Ruang Bersama<br />untuk Cerita yang<br />Lebih Bermakna</h1>
        <p>Pesan fasilitas warga dengan mudah dan jadikan setiap kegiatan lebih bermakna bersama warga Permai Sukatani.</p>

        <div class="hero-actions">
          <a href="#form-reservasi" class="button primary">Reservasi Sekarang <span>→</span></a>
          <a href="#jadwal" class="button ghost">Lihat Jadwal</a>
        </div>

        <div class="hero-stats" aria-label="Ringkasan layanan reservasi">
          <div><strong>250+</strong><span>Warga</span></div>
          <i></i>
          <div><strong>12+</strong><span>Program</span></div>
          <i></i>
          <div><strong>100+</strong><span>Kegiatan</span></div>
        </div>

        <blockquote>“Kebersamaan dimulai dari ruang yang kita rawat bersama.”</blockquote>
      </div>

      <form id="form-reservasi" class="booking-card" onsubmit={kirim}>
        <div class="booking-head">
          <div>
            <span>RESERVASI FASILITAS</span>
            <h2>Buat Reservasi</h2>
            <p>Pilih fasilitas dan waktu yang Anda inginkan.</p>
          </div>
          <span class="step">01</span>
        </div>

        <label class="field">
          <span>Fasilitas</span>
          <select bind:value={form.fasilitas}>
            {#each fasilitas as f}<option value={f.nama}>{f.nama}</option>{/each}
          </select>
        </label>

        <div class="field-grid">
          <label class="field">
            <span>Tanggal</span>
            <input type="date" min={tanggalHariIni()} bind:value={form.tanggal} required />
          </label>
          <label class="field">
            <span>Jam</span>
            <input bind:value={form.jam} placeholder="08.00 - 14.00" />
          </label>
        </div>

        <label class="field">
          <span>Keperluan</span>
          <input bind:value={form.acara} placeholder="Rapat warga, arisan, pengajian, acara keluarga" />
        </label>

        <div class="field-grid">
          <label class="field">
            <span>Nama peminjam</span>
            <input bind:value={form.nama} placeholder="Nama lengkap" required />
          </label>
          <label class="field">
            <span>WhatsApp</span>
            <input bind:value={form.wa} inputmode="tel" placeholder="08xxxxxxxxxx" required />
          </label>
        </div>

        {#if bentrok}
          <div class="conflict">{form.fasilitas} sudah terpakai pada tanggal ini. Pilih tanggal atau fasilitas lain.</div>
        {/if}

        <button class="submit" type="submit" disabled={mengirim || bentrok}>
          {mengirim ? "Mengirim..." : "Kirim permohonan"}<span>→</span>
        </button>

        <a class="schedule-link" href="#jadwal">Atau lihat jadwal ketersediaan</a>
      </form>
    </div>
  </section>

  <section class="feature-strip">
    <div class="reservation-shell feature-grid">
      <article><span>✓</span><div><strong>Proses Mudah</strong><small>Cukup beberapa langkah</small></div></article>
      <article><span>◷</span><div><strong>Jadwal Real-time</strong><small>Selalu diperbarui</small></div></article>
      <article><span>▣</span><div><strong>Notifikasi Otomatis</strong><small>Dapatkan konfirmasi</small></div></article>
    </div>
  </section>

  <main class="reservation-shell reservation-main">
    <section class="facility-section">
      <div class="section-head">
        <div><span class="section-kicker">PILIH FASILITAS</span><h2>Fasilitas warga yang tersedia</h2><p>Pilih salah satu fasilitas sebelum menentukan jadwal.</p></div>
        <a href="#jadwal">Lihat ketersediaan →</a>
      </div>

      <div class="facility-grid">
        {#each fasilitas.slice(0, 4) as f}
          <button type="button" class:selected={form.fasilitas === f.nama} class="facility-card" onclick={() => pilihFasilitas(f.nama)}>
            <span class="facility-icon">{ikonFasilitas(f.nama)}</span>
            <span class="facility-copy">
              <strong>{f.nama}</strong>
              <small>{f.ket || (f.kapasitas ? `Kapasitas ${f.kapasitas}` : "Fasilitas kegiatan warga")}</small>
            </span>
            <span class="pick">{form.fasilitas === f.nama ? "Dipilih" : "Pilih"}</span>
          </button>
        {/each}
      </div>
    </section>

    <section class="availability-section" id="jadwal">
      <div class="availability-copy">
        <span class="section-kicker">Ketersediaan</span>
        <h2>Cek ketersediaan sebelum mengajukan</h2>
        <p>Tanggal bertanda hijau tua sudah memiliki jadwal. Kalender diperbarui otomatis ketika pengurus menyetujui permohonan.</p>
        <ul>
          <li>Reservasi diajukan minimal sebelum hari penggunaan.</li>
          <li>Gunakan fasilitas dengan tertib dan jaga kebersihan.</li>
          <li>Pengurus akan menghubungi melalui WhatsApp untuk konfirmasi.</li>
        </ul>
      </div>

      <div class="calendar-card">
        <header>
          <button type="button" onclick={() => geser(-1)} aria-label="Bulan sebelumnya">←</button>
          <strong>{NAMA_BULAN[bulan]} {tahun}</strong>
          <button type="button" onclick={() => geser(1)} aria-label="Bulan berikutnya">→</button>
        </header>

        <div class="calendar-days">
          {#each ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"] as h}<span>{h}</span>{/each}
        </div>
        <div class="calendar-grid">
          {#each sel as s}
            {#if s}
              <button type="button" class:busy={s.dipakai.length > 0} class:chosen={form.tanggal === s.iso} onclick={() => form.tanggal = s.iso} title={s.dipakai.length ? s.dipakai.map((d) => d.fasilitas || "Dipakai").join(", ") : "Tersedia"}>
                <span>{s.hari}</span>
                {#if s.dipakai.length}<i>{s.dipakai.length}</i>{/if}
              </button>
            {:else}
              <i class="empty"></i>
            {/if}
          {/each}
        </div>
        <footer><span><i class="dot free"></i>Tersedia</span><span><i class="dot used"></i>Ada jadwal</span><span><i class="dot selected"></i>Pilihan Anda</span></footer>
      </div>
    </section>

    <section class="help-section">
      <div>
        <span class="section-kicker">BUTUH BANTUAN?</span>
        <h2>Reservasi lebih jelas, tanpa ribet.</h2>
        <p>Kalau ada perubahan jadwal atau kebutuhan khusus, hubungi pengurus RW 02 melalui halaman kontak.</p>
      </div>
      <a href="#/kontak" class="button dark">Hubungi Pengurus <span>→</span></a>
    </section>
  </main>
</div>

<style>
  :global(body){overflow-x:hidden}
  .reservation-page{--green:#0e8b5b;--green-dark:#075a42;--ink:#12241e;--muted:#687a73;--line:#dfe8e3;width:100vw;margin-left:calc(50% - 50vw);margin-top:-32px;margin-bottom:-64px;background:#f7faf8;color:var(--ink)}
  .reservation-shell{width:min(1180px,calc(100% - 40px));margin-inline:auto}
  .reservation-hero{position:relative;min-height:590px;background:#163e34 var(--hero) center/cover no-repeat;color:#fff;overflow:hidden}
  .hero-overlay{position:absolute;inset:0;background:linear-gradient(90deg,rgba(3,26,22,.88) 0%,rgba(4,39,32,.66) 46%,rgba(8,31,27,.28) 70%,rgba(4,18,16,.58) 100%)}
  .hero-grid{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1fr) 390px;gap:62px;align-items:center;padding:74px 0 68px}
  .hero-copy{max-width:690px}.eyebrow,.section-kicker{display:inline-block;font-size:10px;font-weight:900;letter-spacing:.16em;color:#7fe2bd}.hero-copy h1{margin:12px 0 16px;font-size:clamp(44px,5vw,68px);line-height:.98;letter-spacing:-.055em;color:#fff}.hero-copy>p{max-width:560px;margin:0;color:rgba(255,255,255,.86);font-size:15px;line-height:1.65}.hero-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}.button{display:inline-flex;align-items:center;justify-content:center;gap:12px;height:44px;padding:0 20px;border-radius:9px;text-decoration:none;font-size:12px;font-weight:850}.button.primary{background:linear-gradient(180deg,#18b979,#0a8b5c);color:white;box-shadow:0 10px 28px rgba(13,145,95,.28)}.button.ghost{border:1px solid rgba(255,255,255,.5);background:rgba(12,38,32,.32);color:#fff;backdrop-filter:blur(10px)}.button.dark{background:#113d31;color:#fff}.hero-stats{display:flex;align-items:center;gap:24px;margin-top:28px}.hero-stats div{display:grid}.hero-stats strong{font-size:24px;line-height:1}.hero-stats span{margin-top:5px;color:#c9ddd6;font-size:10px}.hero-stats i{width:1px;height:34px;background:rgba(255,255,255,.28)}.hero-copy blockquote{margin:26px 0 0;color:#dcece6;font:italic 16px/1.5 Georgia,serif}
  .booking-card{padding:24px;border:1px solid rgba(255,255,255,.22);border-radius:18px;background:rgba(248,251,249,.94);box-shadow:0 24px 70px rgba(0,0,0,.25);backdrop-filter:blur(18px);color:var(--ink)}.booking-head{display:flex;justify-content:space-between;gap:15px;margin-bottom:19px}.booking-head>div>span{font-size:8px;font-weight:900;letter-spacing:.14em;color:#0b8a5c}.booking-head h2{margin:4px 0 5px;font-size:24px;letter-spacing:-.035em}.booking-head p{margin:0;color:var(--muted);font-size:10px}.step{width:34px;height:34px;display:grid;place-items:center;border-radius:50%;background:#e7f5ee;color:#0b885b;font-size:10px;font-weight:900}.field{display:grid;gap:6px;margin-top:12px}.field>span{font-size:9px;font-weight:850;color:#34483f}.field input,.field select{width:100%;height:40px;padding:0 11px;border:1px solid #d7e2dd;border-radius:8px;background:#fff;color:#1d352d;font:500 11px inherit;outline:none}.field input:focus,.field select:focus{border-color:#49a985;box-shadow:0 0 0 3px rgba(14,139,91,.08)}.field-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.conflict{margin-top:12px;padding:9px 10px;border:1px solid #efc8c8;border-radius:8px;background:#fff2f2;color:#a73c3c;font-size:9px;line-height:1.4}.submit{width:100%;height:42px;margin-top:16px;border:0;border-radius:8px;background:linear-gradient(180deg,#19b978,#0c8d5d);color:#fff;font:850 11px inherit;cursor:pointer}.submit span{margin-left:9px}.submit:disabled{opacity:.55;cursor:not-allowed}.schedule-link{display:block;margin-top:11px;text-align:center;color:#47675c;font-size:9px;font-weight:800;text-decoration:none}
  .feature-strip{position:relative;z-index:2;margin-top:-30px}.feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:12px;border:1px solid rgba(255,255,255,.18);border-radius:16px;background:rgba(14,42,35,.88);box-shadow:0 14px 36px rgba(13,50,39,.18);backdrop-filter:blur(18px)}.feature-grid article{display:flex;align-items:center;gap:10px;min-height:54px;padding:8px 12px;border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff}.feature-grid article>span{width:30px;height:30px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.25);border-radius:50%;font-weight:900}.feature-grid strong,.feature-grid small{display:block}.feature-grid strong{font-size:10px}.feature-grid small{margin-top:2px;color:#b9ccc6;font-size:8px}
  .reservation-main{padding:54px 0 72px}.facility-section,.availability-section{margin-bottom:56px}.section-head{display:flex;align-items:end;justify-content:space-between;gap:18px;margin-bottom:19px}.section-head h2,.availability-copy h2,.help-section h2{margin:5px 0 6px;font-size:28px;line-height:1.05;letter-spacing:-.035em}.section-head p,.availability-copy>p,.help-section p{margin:0;color:var(--muted);font-size:11px;line-height:1.55}.section-head>a{color:#0b8158;text-decoration:none;font-size:10px;font-weight:850}.section-kicker{color:#0a885a}
  .facility-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.facility-card{min-width:0;min-height:132px;display:grid;grid-template-columns:48px minmax(0,1fr);grid-template-rows:auto auto;gap:5px 11px;padding:15px;border:1px solid var(--line);border-radius:13px;background:#fff;text-align:left;cursor:pointer;transition:.2s;box-shadow:0 8px 20px rgba(18,61,48,.045)}.facility-card:hover,.facility-card.selected{transform:translateY(-2px);border-color:#5fb995;box-shadow:0 14px 30px rgba(14,139,91,.12)}.facility-card.selected{background:linear-gradient(180deg,#f7fffb,#eef9f4)}.facility-icon{grid-row:1/3;width:48px;height:48px;display:grid;place-items:center;border-radius:11px;background:#e5f5ee;color:#087c54;font-size:20px}.facility-copy{min-width:0}.facility-copy strong,.facility-copy small{display:block}.facility-copy strong{font-size:12px}.facility-copy small{height:28px;margin-top:4px;color:#73847d;font-size:8px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.pick{grid-column:2;justify-self:start;padding:4px 8px;border-radius:6px;background:#edf4f1;color:#557268;font-size:8px;font-weight:800}.selected .pick{background:#0c8e5e;color:#fff}
  .availability-section{display:grid;grid-template-columns:minmax(0,.8fr) minmax(420px,1.2fr);gap:54px;align-items:center}.availability-copy ul{display:grid;gap:10px;margin:21px 0 0;padding:0;list-style:none}.availability-copy li{position:relative;padding-left:24px;color:#445a52;font-size:10px;line-height:1.4}.availability-copy li:before{content:"✓";position:absolute;left:0;top:-1px;width:16px;height:16px;display:grid;place-items:center;border-radius:50%;background:#e2f4ec;color:#078258;font-size:9px;font-weight:900}.calendar-card{padding:18px;border:1px solid var(--line);border-radius:15px;background:#fff;box-shadow:0 14px 38px rgba(17,62,48,.07)}.calendar-card>header{display:flex;align-items:center;justify-content:space-between;margin-bottom:13px}.calendar-card>header strong{font-size:13px}.calendar-card>header button{width:32px;height:32px;border:1px solid var(--line);border-radius:8px;background:#f7faf8;color:#345248;cursor:pointer}.calendar-days,.calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}.calendar-days span{padding:6px 0;text-align:center;color:#7a8b84;font-size:8px;font-weight:800}.calendar-grid>button,.calendar-grid>.empty{aspect-ratio:1;border:0;border-radius:9px;background:#f7faf8;color:#35534a;font-size:9px;position:relative}.calendar-grid>button{cursor:pointer}.calendar-grid>button.busy{background:#145b48;color:#fff}.calendar-grid>button.chosen{outline:2px solid #19b978;outline-offset:2px}.calendar-grid>button i{position:absolute;right:4px;top:4px;width:13px;height:13px;display:grid;place-items:center;border-radius:50%;background:#f9d978;color:#4c3d00;font-size:6px;font-style:normal;font-weight:900}.calendar-card footer{display:flex;gap:14px;flex-wrap:wrap;margin-top:14px;color:#71847c;font-size:8px}.calendar-card footer span{display:flex;align-items:center;gap:5px}.dot{width:8px;height:8px;border-radius:50%}.dot.free{background:#eef4f1;border:1px solid #cad9d2}.dot.used{background:#145b48}.dot.selected{background:#19b978}
  .help-section{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:27px 30px;border-radius:16px;background:linear-gradient(135deg,#e9f6f0,#f8fcfa);border:1px solid #dcebe4}.help-section>div{max-width:720px}
  @media(max-width:980px){.hero-grid{grid-template-columns:1fr;gap:34px}.booking-card{max-width:680px}.facility-grid{grid-template-columns:repeat(2,1fr)}.availability-section{grid-template-columns:1fr;gap:24px}.reservation-hero{min-height:auto}}
  @media(max-width:680px){.reservation-page{margin-top:-18px}.reservation-shell{width:min(100% - 24px,1180px)}.hero-grid{padding:46px 0 56px}.hero-copy h1{font-size:42px}.hero-copy>p{font-size:12px}.hero-stats{gap:15px}.field-grid{grid-template-columns:1fr}.feature-grid{grid-template-columns:1fr}.feature-strip{margin-top:-20px}.facility-grid{grid-template-columns:1fr}.section-head{align-items:flex-start;flex-direction:column}.calendar-grid{gap:4px}.help-section{align-items:flex-start;flex-direction:column}.availability-copy h2,.section-head h2,.help-section h2{font-size:24px}}
</style>
