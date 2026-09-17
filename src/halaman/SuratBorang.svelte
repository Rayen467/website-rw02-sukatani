<script>
  import { KOLEKSI } from "../inti/nama.js";
  import { pakai, muatMilikSaya } from "../keadaan/isi.svelte.js";
  import { beriTahu } from "../keadaan/pesan.svelte.js";
  import { sesi } from "../keadaan/sesi.svelte.js";
  import { JENIS_SURAT_BAWAAN, RT_BAWAAN } from "../inti/bawaan.js";
  import { LOGO_KABUPATEN_TANGERANG, LOGO_RW_SUKATANI } from "../inti/logo-surat.js";
  import { keDaftar } from "../inti/format.js";
  import { nomorAntrean } from "../inti/peramban.js";
  import { kirimWarga } from "../sumber/data.js";
  import { pesanRamah } from "../sumber/firebase.js";
  import { pergi } from "../keadaan/rute.svelte.js";
  import TidakAda from "./TidakAda.svelte";

  let { kunci } = $props();

  const surat = $derived(
    pakai("jenis_surat", JENIS_SURAT_BAWAAN)
      .map((s) => ({ ...s, daftarSyarat: Array.isArray(s.syarat) ? s.syarat : keDaftar(s.syarat) }))
      .find((s) => s.id === kunci)
  );

  let form = $state({ nama: "", nik: "", kk: "", ttl: "", alamat: "", rt: RT_BAWAAN[0], keperluan: "", wa: "" });
  let mengirim = $state(false);
  let antrean = $state("");

  const tanggalSurat = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());

  function aman(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function nilai(value, kosong = "................................") {
    return String(value || "").trim() || kosong;
  }

  function cetakPreview() {
    if (!form.nama.trim() || !form.nik.trim() || !form.kk.trim() || !form.alamat.trim() || !form.keperluan.trim()) {
      beriTahu("Lengkapi nama, NIK, No. KK, alamat, dan keperluan sebelum menyimpan PDF.");
      return;
    }

    const judul = aman(surat?.nama || "Surat Pengantar");
    const jendela = window.open("", "_blank", "width=900,height=900");
    if (!jendela) {
      beriTahu("Popup diblokir browser. Izinkan popup untuk menyimpan surat sebagai PDF.");
      return;
    }

    const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${judul}</title><style>
      @page{size:A4;margin:17mm}*{box-sizing:border-box}body{margin:0;color:#111;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.55}.page{max-width:760px;margin:auto}.draft{margin:0 0 16px;padding:8px;border:1px solid #d7a6a6;background:#fff7f7;color:#8d3434;text-align:center;font-weight:800;letter-spacing:.08em}.kop{position:relative;min-height:82px;padding:5px 88px 12px;border-bottom:3px double #111;text-align:center}.kop img{position:absolute;top:50%;transform:translateY(-50%);object-fit:contain}.kop img.kabupaten{left:4px;width:68px;height:72px}.kop img.rw{right:4px;width:72px;height:72px}.kop .kop-teks{display:grid;align-content:center;min-height:64px}.kop h1{margin:0;font-size:14px;line-height:1.25;letter-spacing:.015em}.kop p{margin:3px 0 0;font-size:9px;line-height:1.25}.title{text-align:center;margin:23px 0 20px}.title h2{margin:0;font-size:16px;text-decoration:underline}.title p{margin:3px 0 0}.intro{margin-bottom:13px}.data{border-collapse:collapse;width:100%;margin:10px 0 16px}.data td{padding:3px 5px;vertical-align:top}.data td:first-child{width:180px}.box{margin:14px 0;padding:10px 12px;background:#f4f7f5;border-left:4px solid #0b6b57}.sign{display:grid;grid-template-columns:1fr 1fr;gap:80px;margin-top:40px;text-align:center}.line{height:62px;border-bottom:1px solid #111}.small{font-size:9.5px;color:#555;margin-top:28px}.actions{margin:20px 0;text-align:center}@media print{.actions{display:none}.page{max-width:none}}
    </style></head><body><div class="page"><div class="actions"><button onclick="window.print()">Cetak / Simpan sebagai PDF</button></div><div class="draft">PRATINJAU · BELUM DISAHKAN RT/RW</div><div class="kop"><img class="kabupaten" src="${LOGO_KABUPATEN_TANGERANG}" alt="Logo Kabupaten Tangerang"><div class="kop-teks"><h1>RUKUN WARGA 02<br>PERUM PERMAI SUKATANI</h1><p>DESA SUKATANI · KECAMATAN RAJEG · KABUPATEN TANGERANG · BANTEN</p></div><img class="rw" src="${LOGO_RW_SUKATANI}" alt="Logo RW 02 Sukatani"></div><div class="title"><h2>SURAT PENGANTAR</h2><p>Nomor: ........................................................</p></div><p class="intro">Yang bertanda tangan di bawah ini, pengurus RT/RW 02 Perum Permai Sukatani, menerangkan bahwa:</p><table class="data"><tr><td>Nama</td><td>: <b>${aman(nilai(form.nama))}</b></td></tr><tr><td>NIK</td><td>: ${aman(nilai(form.nik))}</td></tr><tr><td>No. Kartu Keluarga</td><td>: ${aman(nilai(form.kk))}</td></tr><tr><td>Tempat / Tanggal Lahir</td><td>: ${aman(nilai(form.ttl, "-"))}</td></tr><tr><td>Alamat</td><td>: ${aman(nilai(form.alamat))}</td></tr><tr><td>RT / RW</td><td>: ${aman(nilai(form.rt))} / RW 02</td></tr></table><p>Adalah benar warga yang berdomisili di wilayah RW 02 Perum Permai Sukatani.</p><div class="box"><b>Keperluan:</b><br>${aman(nilai(form.keperluan))}</div><p>Demikian surat pengantar ini dibuat untuk dipergunakan sebagaimana mestinya.</p><div class="sign"><div><b>Ketua RT</b><div class="line"></div><span>(................................)</span></div><div><span>Sukatani, ${aman(tanggalSurat)}</span><br><b>Ketua RW 02</b><div class="line"></div><span>(................................)</span></div></div><p class="small">Dokumen ini merupakan pratinjau dari data yang diisi pemohon dan belum sah sebelum diverifikasi, diberi nomor resmi, serta ditandatangani pengurus berwenang.</p></div><script>setTimeout(()=>window.print(),250)<\/script></body></html>`;

    jendela.document.open();
    jendela.document.write(html);
    jendela.document.close();
  }

  async function kirim(e) {
    e.preventDefault();
    if (!sesi.pengguna) {
      beriTahu("Masuk dulu supaya pengajuan bisa Anda lacak sendiri.");
      pergi("/masuk");
      return;
    }
    if (!sesi.terverifikasi) {
      beriTahu("Verifikasi email dulu sebelum mengajukan surat.");
      pergi("/akun");
      return;
    }

    mengirim = true;
    const nomor = nomorAntrean("SP");
    try {
      await kirimWarga(KOLEKSI.SURAT, { jenis: surat.nama, antrean: nomor, ...form });
      antrean = nomor;
      try {
        localStorage.setItem("surat-terakhir", JSON.stringify({ jenis: kunci, antrean: nomor, ...form }));
      } catch (err) {}
      beriTahu("Pengajuan terkirim. Nomor antrean " + nomor + ".");
      if (sesi.pengguna) muatMilikSaya(sesi.pengguna.uid);
    } catch (err) {
      beriTahu(pesanRamah(err));
    }
    mengirim = false;
  }
</script>

{#if !surat}
  <TidakAda />
{:else}
  <div class="sb-page">
    <section class="sb-hero">
      <div class="sb-shell">
        <nav class="sb-breadcrumb" aria-label="Breadcrumb">
          <a href="#/">Beranda</a><span>›</span><a href="#/surat">Pengajuan Surat</a><span>›</span><span>{surat.nama}</span>
        </nav>
        <div class="sb-hero-row">
          <div class="sb-title-icon" aria-hidden="true">▤</div>
          <div>
            <span class="sb-kicker">LAYANAN SURAT ONLINE</span>
            <h1>{surat.nama}</h1>
            <p>Isi data dengan benar, cek hasil surat di sebelah kanan, simpan sebagai PDF bila perlu, lalu ajukan ke RW.</p>
          </div>
          <a class="sb-back" href="#/surat">← Kembali ke daftar surat</a>
        </div>
      </div>
    </section>

    <div class="sb-shell sb-stepper" aria-label="Tahapan pengajuan">
      <div class="sb-step aktif"><b>1</b><span><strong>Isi data</strong><small>Lengkapi formulir</small></span></div>
      <i>→</i>
      <div class="sb-step"><b>2</b><span><strong>Cek preview surat</strong><small>Pastikan sudah benar</small></span></div>
      <i>→</i>
      <div class="sb-step"><b>3</b><span><strong>Simpan PDF</strong><small>Simpan salinan</small></span></div>
      <i>→</i>
      <div class="sb-step"><b>4</b><span><strong>Ajukan ke RW</strong><small>Kirim ke pengurus</small></span></div>
    </div>

    {#if antrean}
      <main class="sb-shell sb-success-wrap">
        <section class="sb-success">
          <div class="sb-success-icon">✓</div>
          <div>
            <span>Pengajuan berhasil dikirim</span>
            <h2>Nomor antrean Anda <b>{antrean}</b></h2>
            <p>Data sudah masuk ke Petugas RW. Simpan nomor antrean ini untuk memudahkan pelacakan.</p>
            <div class="sb-success-actions">
              <a class="sb-btn utama" href="#/surat/{surat.id}/cetak">Lihat berkas & simpan PDF</a>
              <a class="sb-btn" href="#/akun">Lacak di Akun Saya</a>
            </div>
          </div>
        </section>
      </main>
    {:else}
      <main class="sb-shell sb-main">
        <form class="sb-form-card" onsubmit={kirim}>
          <header class="sb-card-head">
            <div class="sb-head-icon">▤</div>
            <div><span>LANGKAH 1</span><h2>Isi data pengajuan</h2><p>Lengkapi sesuai KTP / KK Anda.</p></div>
          </header>

          <div class="sb-grid">
            <div class="sb-field">
              <label for="s-nama">Nama lengkap <em>*</em></label>
              <input id="s-nama" bind:value={form.nama} autocomplete="name" placeholder="Contoh: Budi Santoso" required />
            </div>
            <div class="sb-field">
              <label for="s-nik">NIK <em>*</em></label>
              <input id="s-nik" bind:value={form.nik} inputmode="numeric" maxlength="16" pattern="[0-9]{16}" placeholder="16 digit sesuai KTP" required />
              <small>Data hanya dipakai untuk pengajuan ini.</small>
            </div>
            <div class="sb-field sb-span-2">
              <label for="s-kk">No. Kartu Keluarga <em>*</em></label>
              <input id="s-kk" bind:value={form.kk} inputmode="numeric" maxlength="16" pattern="[0-9]{16}" placeholder="16 digit sesuai Kartu Keluarga" required />
              <small>Masukkan nomor KK 16 digit sesuai dokumen keluarga.</small>
            </div>
            <div class="sb-field sb-span-2">
              <label for="s-ttl">Tempat dan tanggal lahir</label>
              <input id="s-ttl" bind:value={form.ttl} placeholder="Contoh: Tangerang, 12 April 1998" />
            </div>
            <div class="sb-field sb-span-2">
              <label for="s-alamat">Alamat lengkap <em>*</em></label>
              <input id="s-alamat" bind:value={form.alamat} placeholder="Blok, nomor rumah, dan keterangan alamat" required />
            </div>
            <div class="sb-field">
              <label for="s-rt">RT <em>*</em></label>
              <select id="s-rt" bind:value={form.rt}>{#each RT_BAWAAN as r}<option>{r}</option>{/each}</select>
            </div>
            <div class="sb-field">
              <label for="s-wa">Nomor WhatsApp</label>
              <input id="s-wa" bind:value={form.wa} inputmode="tel" autocomplete="tel" placeholder="08xxxxxxxxxx" />
            </div>
            <div class="sb-field sb-span-2">
              <label for="s-keperluan">Keperluan surat <em>*</em></label>
              <textarea id="s-keperluan" bind:value={form.keperluan} maxlength="300" placeholder="Contoh: pembuatan KTP baru, perubahan data KK, dan sebagainya." required></textarea>
              <small>{form.keperluan.length}/300 karakter</small>
            </div>
          </div>

          {#if surat.daftarSyarat.length}
            <section class="sb-syarat">
              <div class="sb-syarat-title"><span>✓</span><div><b>Syarat yang perlu disiapkan</b><small>Bawa dokumen ini saat proses pengesahan.</small></div></div>
              <ul>{#each surat.daftarSyarat as sy}<li>{sy}</li>{/each}</ul>
            </section>
          {/if}

          <div class="sb-info">
            <span>i</span>
            <p><b>Periksa preview di sebelah kanan.</b> Surat yang tampil masih berupa pratinjau dan belum sah sebelum diverifikasi serta ditandatangani RT/RW.</p>
          </div>

          {#if !sesi.pengguna}
            <p class="sb-login-note">Anda belum masuk. Saat menekan Ajukan ke RW, Anda akan diarahkan untuk masuk terlebih dahulu agar pengajuan bisa dilacak.</p>
          {/if}
        </form>

        <aside class="sb-preview-card">
          <header class="sb-card-head preview-head">
            <div class="sb-head-icon">▤</div>
            <div><span>LANGKAH 2</span><h2>Preview surat otomatis</h2><p>Isi surat berubah langsung mengikuti formulir.</p></div>
            <div class="sb-live"><i></i> Live preview</div>
          </header>

          <div class="sb-paper-wrap">
            <article class="sb-paper" aria-label="Pratinjau surat">
              <div class="sb-draft">PRATINJAU · BELUM DISAHKAN</div>
              <header class="sb-kop">
                <img class="sb-kop-logo kabupaten" src={LOGO_KABUPATEN_TANGERANG} alt="Logo Kabupaten Tangerang" />
                <div>
                  <strong>RUKUN WARGA 02</strong>
                  <b>PERUM PERMAI SUKATANI</b>
                  <small>DESA SUKATANI · KECAMATAN RAJEG · KABUPATEN TANGERANG</small>
                </div>
                <img class="sb-kop-logo rw" src={LOGO_RW_SUKATANI} alt="Logo RW 02 Sukatani" />
              </header>
              <div class="sb-letter-title"><b>SURAT PENGANTAR</b><span>Nomor: ................................................</span></div>
              <p>Yang bertanda tangan di bawah ini, pengurus RT/RW 02 Perum Permai Sukatani, menerangkan bahwa:</p>
              <dl class="sb-letter-data">
                <dt>Nama</dt><dd>: <b>{nilai(form.nama)}</b></dd>
                <dt>NIK</dt><dd>: {nilai(form.nik)}</dd>
                <dt>No. Kartu Keluarga</dt><dd>: {nilai(form.kk)}</dd>
                <dt>Tempat / Tanggal Lahir</dt><dd>: {nilai(form.ttl, "-")}</dd>
                <dt>Alamat</dt><dd>: {nilai(form.alamat)}</dd>
                <dt>RT / RW</dt><dd>: {nilai(form.rt)} / RW 02</dd>
              </dl>
              <p>Adalah benar warga yang berdomisili di wilayah RW 02 Perum Permai Sukatani.</p>
              <div class="sb-purpose"><b>Keperluan:</b><span>{nilai(form.keperluan)}</span></div>
              <p>Demikian surat pengantar ini dibuat untuk dipergunakan sebagaimana mestinya.</p>
              <div class="sb-signatures">
                <div><b>Ketua RT</b><i></i><small>(................................)</small></div>
                <div><span>Sukatani, {tanggalSurat}</span><b>Ketua RW 02</b><i></i><small>(................................)</small></div>
              </div>
            </article>
          </div>

          <div class="sb-preview-note"><span>✓</span><p><b>Cek kembali sebelum melanjutkan.</b> Pastikan nama, NIK, No. KK, alamat, RT, dan keperluan sudah benar.</p></div>

          <div class="sb-actions">
            <button class="sb-btn pdf" type="button" onclick={cetakPreview}>↓ Simpan PDF</button>
            <button class="sb-btn utama" type="button" disabled={mengirim} onclick={() => document.querySelector('.sb-form-card')?.requestSubmit()}>{mengirim ? "Mengirim..." : "➤ Ajukan ke RW"}</button>
          </div>
          <small class="sb-pdf-help">Tombol Simpan PDF membuka dialog cetak browser. Pilih <b>Simpan sebagai PDF</b>.</small>
        </aside>
      </main>
    {/if}
  </div>
{/if}

<style>
  .sb-page{--g:#08715a;--g2:#0f8c6e;--ink:#122821;--muted:#667a72;--line:#dce7e2;--soft:#f1f8f5;width:100vw;margin-left:calc(50% - 50vw);margin-top:-32px;margin-bottom:-64px;background:#f7faf8;color:var(--ink);font-family:"Plus Jakarta Sans",system-ui,sans-serif;min-height:100vh}
  .sb-shell{width:min(1240px,calc(100% - 40px));margin-inline:auto}
  .sb-hero{padding:24px 0 28px;background:radial-gradient(circle at 75% 20%,rgba(171,226,202,.38),transparent 28%),linear-gradient(110deg,#f8fcfa,#eef9f4);border-bottom:1px solid #dce9e3}.sb-breadcrumb{display:flex;gap:8px;align-items:center;margin-bottom:22px;color:#758981;font-size:13px}.sb-breadcrumb a{color:inherit;text-decoration:none}.sb-breadcrumb a:hover{color:var(--g)}
  .sb-hero-row{display:grid;grid-template-columns:62px minmax(0,1fr) auto;gap:18px;align-items:center}.sb-title-icon,.sb-head-icon{display:grid;place-items:center;border-radius:16px;background:linear-gradient(145deg,#0d8d6b,#08715a);color:white;box-shadow:0 14px 28px -18px rgba(7,113,90,.65)}.sb-title-icon{width:62px;height:62px;font-size:28px}.sb-kicker{color:var(--g);font-size:12px;font-weight:900;letter-spacing:.1em}.sb-hero h1{margin:4px 0 6px;font-size:clamp(30px,3.2vw,45px);line-height:1.04;letter-spacing:-.04em}.sb-hero p{margin:0;color:#647970;font-size:15px}.sb-back{min-height:42px;display:flex;align-items:center;padding:0 14px;border:1px solid #bcd8cd;border-radius:12px;background:#fff;color:#0a684f;font-size:13px;font-weight:800;text-decoration:none}
  .sb-stepper{display:grid;grid-template-columns:1fr 26px 1fr 26px 1fr 26px 1fr;align-items:center;padding:20px 0}.sb-step{display:flex;gap:10px;align-items:center;min-width:0}.sb-step>b{width:36px;height:36px;display:grid;place-items:center;flex:0 0 36px;border-radius:50%;background:#e3ece8;color:#60746c;font-size:14px}.sb-step.aktif>b{background:var(--g);color:#fff;box-shadow:0 7px 18px -10px rgba(8,113,90,.8)}.sb-step span{display:grid;min-width:0}.sb-step strong{font-size:13px}.sb-step small{margin-top:2px;color:#819089;font-size:11px}.sb-stepper>i{color:#a9bab3;font-style:normal;text-align:center}
  .sb-main{display:grid;grid-template-columns:minmax(0,.95fr) minmax(440px,1.05fr);gap:18px;padding-bottom:72px;align-items:start}.sb-form-card,.sb-preview-card,.sb-success{border:1px solid var(--line);border-radius:18px;background:#fff;box-shadow:0 18px 46px -40px rgba(20,69,53,.55)}.sb-form-card,.sb-preview-card{padding:22px}.sb-preview-card{position:sticky;top:86px}.sb-card-head{display:grid;grid-template-columns:48px 1fr;gap:12px;align-items:center;padding-bottom:17px;border-bottom:1px solid #e8efec}.sb-head-icon{width:48px;height:48px;border-radius:13px;font-size:21px}.sb-card-head span{color:var(--g);font-size:10px;font-weight:900;letter-spacing:.1em}.sb-card-head h2{margin:2px 0;font-size:23px;letter-spacing:-.03em}.sb-card-head p{margin:0;color:#788981;font-size:12.5px}.preview-head{grid-template-columns:48px 1fr auto}.sb-live{display:flex;gap:6px;align-items:center;padding:7px 10px;border-radius:999px;background:#e9f8f1;color:#08715a;font-size:11px;font-weight:800}.sb-live i{width:7px;height:7px;border-radius:50%;background:#14a979;box-shadow:0 0 0 4px rgba(20,169,121,.12)}
  .sb-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px 14px;margin-top:20px}.sb-field{display:grid;gap:7px;min-width:0}.sb-span-2{grid-column:1/-1}.sb-field label{font-size:13px;font-weight:800}.sb-field label em{color:#d94f4f;font-style:normal}.sb-field input,.sb-field select,.sb-field textarea{width:100%;min-height:44px;border:1px solid #cadbd4;border-radius:10px;background:#fff;padding:10px 12px;color:#20332c;font:inherit;font-size:13.5px;outline:none;transition:.18s}.sb-field textarea{min-height:96px;resize:vertical}.sb-field input:focus,.sb-field select:focus,.sb-field textarea:focus{border-color:#6bb59d;box-shadow:0 0 0 3px rgba(8,113,90,.08)}.sb-field small{color:#84938d;font-size:10.5px}.sb-field textarea+small{text-align:right}
  .sb-syarat{margin-top:18px;padding:15px;border:1px solid #cfe6dc;border-radius:13px;background:linear-gradient(135deg,#effaf5,#f8fcfa)}.sb-syarat-title{display:flex;gap:10px;align-items:center}.sb-syarat-title>span{width:30px;height:30px;display:grid;place-items:center;border-radius:50%;background:#d8f3e6;color:#08715a;font-weight:900}.sb-syarat-title div{display:grid}.sb-syarat-title b{font-size:13px}.sb-syarat-title small{color:#70837b;font-size:10.5px}.sb-syarat ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px 16px;margin:13px 0 0;padding-left:19px;color:#60736b;font-size:12px}.sb-info{display:grid;grid-template-columns:31px 1fr;gap:10px;align-items:start;margin-top:17px;padding:13px;border:1px solid #cfe4ef;border-radius:11px;background:#f0f8fc}.sb-info>span{width:27px;height:27px;display:grid;place-items:center;border-radius:50%;background:#2890c2;color:white;font-family:Georgia,serif;font-weight:900}.sb-info p{margin:0;color:#496875;font-size:11.5px;line-height:1.5}.sb-login-note{margin:12px 0 0;color:#796633;font-size:11px;line-height:1.5}
  .sb-paper-wrap{padding:16px 0 12px}.sb-paper{position:relative;max-width:620px;min-height:650px;margin:auto;padding:34px 38px 32px;border:1px solid #cfd8d4;background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif;font-size:10.7px;line-height:1.55;box-shadow:0 18px 42px -30px rgba(0,0,0,.34)}.sb-draft{margin:-18px 0 16px;padding:6px;border:1px solid #e2bebe;background:#fff8f8;color:#984343;text-align:center;font-size:8.5px;font-weight:900;letter-spacing:.08em}.sb-kop{position:relative!important;display:block!important;min-height:70px;padding:3px 70px 11px;border-bottom:3px double #111;text-align:center}.sb-kop>div{display:grid;align-content:center;min-height:56px;text-align:center}.sb-kop-logo{position:absolute!important;top:50%!important;transform:translateY(-50%)!important;object-fit:contain}.sb-kop-logo.kabupaten{left:0!important;width:54px;height:58px}.sb-kop-logo.rw{right:0!important;width:56px;height:56px}.sb-kop strong{font-size:11px;line-height:1.15}.sb-kop b{font-size:12px;line-height:1.15}.sb-kop small{margin-top:3px;font-size:6.7px;line-height:1.2;white-space:nowrap}.sb-letter-title{display:grid;justify-items:center;margin:18px 0 15px}.sb-letter-title b{font-size:13.5px;text-decoration:underline}.sb-letter-title span{font-size:9px}.sb-paper p{margin:10px 0}.sb-letter-data{display:grid;grid-template-columns:145px 1fr;margin:12px 0}.sb-letter-data dt,.sb-letter-data dd{margin:0;padding:2px 0}.sb-purpose{display:grid;gap:4px;margin:13px 0;padding:9px 11px;background:#f3f6f5;border-left:3px solid #0b6b57}.sb-signatures{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:34px;text-align:center}.sb-signatures>div{display:grid}.sb-signatures span{font-size:8.5px}.sb-signatures b{margin-top:2px}.sb-signatures i{height:52px;border-bottom:1px solid #111}.sb-signatures small{font-size:8px}
  .sb-preview-note{display:grid;grid-template-columns:28px 1fr;gap:9px;align-items:start;padding:12px;border-radius:11px;background:#eaf8f2;color:#315d4e}.sb-preview-note>span{width:25px;height:25px;display:grid;place-items:center;border-radius:50%;background:#1c9d76;color:white;font-weight:900}.sb-preview-note p{margin:0;font-size:11.5px;line-height:1.45}.sb-actions{display:grid;grid-template-columns:1fr 1.25fr;gap:10px;margin-top:12px}.sb-btn{min-height:46px;display:flex;align-items:center;justify-content:center;padding:0 16px;border:1px solid #9fcdbc;border-radius:11px;background:#fff;color:#09664f;font:inherit;font-size:13px;font-weight:850;text-decoration:none;cursor:pointer}.sb-btn.utama{border-color:var(--g);background:linear-gradient(135deg,var(--g2),var(--g));color:white}.sb-btn:disabled{opacity:.6;cursor:not-allowed}.sb-pdf-help{display:block;margin-top:8px;color:#82918b;font-size:10px;text-align:center}
  .sb-success-wrap{padding:28px 0 80px}.sb-success{max-width:820px;margin:auto;padding:28px;display:grid;grid-template-columns:62px 1fr;gap:18px}.sb-success-icon{width:62px;height:62px;display:grid;place-items:center;border-radius:50%;background:#daf3e7;color:#08715a;font-size:28px;font-weight:900}.sb-success span{color:#08715a;font-size:11px;font-weight:900;letter-spacing:.08em}.sb-success h2{margin:5px 0 8px;font-size:25px}.sb-success h2 b{color:#08715a}.sb-success p{margin:0;color:#667a72}.sb-success-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
  @media(max-width:1000px){.sb-main{grid-template-columns:1fr}.sb-preview-card{position:static}.sb-hero-row{grid-template-columns:54px 1fr}.sb-title-icon{width:54px;height:54px}.sb-back{grid-column:1/-1;width:max-content}.sb-stepper{overflow-x:auto}.sb-paper{max-width:680px}}
  @media(max-width:700px){.sb-page{margin-top:-24px}.sb-shell{width:calc(100% - 22px)}.sb-hero{padding-top:20px}.sb-breadcrumb{font-size:11px;overflow-x:auto;white-space:nowrap}.sb-hero-row{grid-template-columns:44px 1fr;gap:12px}.sb-title-icon{width:44px;height:44px;border-radius:12px;font-size:21px}.sb-hero h1{font-size:29px}.sb-hero p{font-size:13px}.sb-stepper{grid-template-columns:repeat(4,minmax(132px,1fr));gap:10px;padding:14px 0}.sb-stepper>i{display:none}.sb-step small{display:none}.sb-form-card,.sb-preview-card{padding:15px}.sb-card-head{grid-template-columns:42px 1fr}.preview-head{grid-template-columns:42px 1fr}.sb-live{display:none}.sb-head-icon{width:42px;height:42px}.sb-card-head h2{font-size:19px}.sb-grid{grid-template-columns:1fr}.sb-span-2{grid-column:auto}.sb-syarat ul{grid-template-columns:1fr}.sb-paper-wrap{overflow-x:auto}.sb-paper{width:620px;transform-origin:top left}.sb-actions{grid-template-columns:1fr}.sb-success{grid-template-columns:1fr}.sb-success-icon{width:52px;height:52px}.sb-success-actions{display:grid}.sb-btn{width:100%}}
</style>