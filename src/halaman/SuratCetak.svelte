<script>
  import { pakai } from "../keadaan/isi.svelte.js";
  import { JENIS_SURAT_BAWAAN } from "../inti/bawaan.js";
  import { LOGO_KABUPATEN_TANGERANG, LOGO_RW_SUKATANI } from "../inti/logo-surat.js";
  import TidakAda from "./TidakAda.svelte";

  let { kunci } = $props();
  const surat = $derived(pakai("jenis_surat", JENIS_SURAT_BAWAAN).find((s) => s.id === kunci));

  let isian = $state(null);
  $effect(() => {
    try {
      const mentah = localStorage.getItem("surat-terakhir");
      const d = mentah ? JSON.parse(mentah) : null;
      isian = d && d.jenis === kunci ? d : null;
    } catch (e) {
      isian = null;
    }
  });

  const tanggalSurat = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());

  function isi(key, kosong = "-") {
    return String(isian?.[key] || "").trim() || kosong;
  }
</script>

{#if !surat}
  <TidakAda />
{:else}
  <div class="sc-page">
    <div class="sc-shell tanpa-cetak">
      <nav class="sc-breadcrumb"><a href="#/">Beranda</a><span>›</span><a href="#/surat">Pengajuan Surat</a><span>›</span><span>Berkas Pengajuan</span></nav>
      <section class="sc-head">
        <div>
          <span>BERKAS PENGAJUAN</span>
          <h1>{surat.nama}</h1>
          {#if isian}
            <p>Pengajuan sudah tercatat dengan nomor antrean <b>{isian.antrean}</b>. Simpan PDF ini lalu bawa sesuai arahan pengurus.</p>
          {:else}
            <p>Belum ada data pengajuan tersimpan di perangkat ini. Kembali ke formulir untuk mengisi surat.</p>
          {/if}
        </div>
        <div class="sc-actions">
          <button class="sc-btn utama" onclick={() => window.print()}>↓ Cetak / Simpan PDF</button>
          <a class="sc-btn" href="#/akun">Lacak pengajuan</a>
          <a class="sc-btn" href="#/surat/{surat.id}">Kembali ke formulir</a>
        </div>
      </section>
      <div class="sc-note"><b>Penting.</b> Dokumen ini adalah hasil generate dari data pemohon. Surat baru sah setelah diverifikasi, diberi nomor resmi, dan ditandatangani pengurus RT/RW.</div>
    </div>

    <main class="sc-paper-wrap">
      <article class="sc-paper">
        <div class="sc-draft">PRATINJAU PENGAJUAN · BELUM DISAHKAN RT/RW</div>
        <header class="sc-kop">
          <img class="sc-kop-logo kabupaten" src={LOGO_KABUPATEN_TANGERANG} alt="Logo Kabupaten Tangerang" />
          <div>
            <strong>RUKUN WARGA 02</strong>
            <b>PERUM PERMAI SUKATANI</b>
            <small>DESA SUKATANI · KECAMATAN RAJEG · KABUPATEN TANGERANG · BANTEN</small>
          </div>
          <img class="sc-kop-logo rw" src={LOGO_RW_SUKATANI} alt="Logo RW 02 Sukatani" />
        </header>

        <div class="sc-title">
          <h2>SURAT PENGANTAR</h2>
          <p>Nomor: {isian?.antrean ? isian.antrean : "................................................"}</p>
        </div>

        <p>Yang bertanda tangan di bawah ini, pengurus RT/RW 02 Perum Permai Sukatani, menerangkan bahwa:</p>

        <dl class="sc-data">
          <dt>Nama</dt><dd>: <b>{isi("nama")}</b></dd>
          <dt>NIK</dt><dd>: {isi("nik")}</dd>
          <dt>No. Kartu Keluarga</dt><dd>: {isi("kk")}</dd>
          <dt>Tempat / Tanggal Lahir</dt><dd>: {isi("ttl")}</dd>
          <dt>Alamat</dt><dd>: {isi("alamat")}</dd>
          <dt>RT / RW</dt><dd>: {isi("rt")} / RW 02</dd>
          <dt>Nomor WhatsApp</dt><dd>: {isi("wa")}</dd>
        </dl>

        <p>Adalah benar warga yang berdomisili di wilayah RW 02 Perum Permai Sukatani.</p>

        <div class="sc-purpose">
          <b>Keperluan:</b>
          <span>{isi("keperluan")}</span>
        </div>

        <p>Demikian surat pengantar ini dibuat untuk dipergunakan sebagaimana mestinya.</p>

        <div class="sc-sign">
          <div><b>Ketua RT</b><i></i><small>(................................)</small></div>
          <div><span>Sukatani, {tanggalSurat}</span><b>Ketua RW 02</b><i></i><small>(................................)</small></div>
        </div>

        <div class="sc-footer-note">
          Nomor antrean pengajuan: <b>{isian?.antrean || "-"}</b>. Dokumen ini belum merupakan surat resmi sebelum proses verifikasi dan pengesahan selesai.
        </div>
      </article>
    </main>
  </div>
{/if}

<style>
  .sc-page{width:100vw;margin-left:calc(50% - 50vw);margin-top:-32px;margin-bottom:-64px;min-height:100vh;padding:28px 0 74px;background:#f4f8f6;color:#14261f;font-family:"Plus Jakarta Sans",system-ui,sans-serif}.sc-shell{width:min(1060px,calc(100% - 36px));margin:auto}.sc-breadcrumb{display:flex;gap:8px;align-items:center;margin-bottom:18px;color:#74877f;font-size:12.5px}.sc-breadcrumb a{color:inherit;text-decoration:none}.sc-head{display:flex;justify-content:space-between;gap:24px;align-items:flex-end;margin-bottom:18px}.sc-head span{color:#08715a;font-size:11px;font-weight:900;letter-spacing:.1em}.sc-head h1{margin:4px 0 6px;font-size:34px;letter-spacing:-.035em}.sc-head p{max-width:650px;margin:0;color:#667a72;font-size:14px;line-height:1.55}.sc-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.sc-btn{min-height:42px;display:flex;align-items:center;justify-content:center;padding:0 13px;border:1px solid #b7d2c7;border-radius:10px;background:#fff;color:#08664f;font:inherit;font-size:12.5px;font-weight:800;text-decoration:none;cursor:pointer}.sc-btn.utama{border-color:#08715a;background:#08715a;color:#fff}.sc-note{margin-bottom:22px;padding:13px 15px;border:1px solid #e4d6a9;border-radius:11px;background:#fff9e9;color:#6c5a22;font-size:12.5px;line-height:1.5}
  .sc-paper-wrap{width:min(820px,calc(100% - 36px));margin:auto}.sc-paper{position:relative;min-height:1080px;padding:58px 68px;background:white;border:1px solid #d6dfdb;box-shadow:0 26px 60px -42px rgba(0,0,0,.42);color:#111;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6}.sc-draft{margin:-28px 0 24px;padding:8px;border:1px solid #dfbcbc;background:#fff8f8;color:#934646;text-align:center;font-size:9.5px;font-weight:900;letter-spacing:.09em}.sc-kop{position:relative;min-height:90px;padding:7px 98px 13px;border-bottom:3px double #111;text-align:center;overflow:hidden}.sc-kop>div{display:grid;align-content:center;min-height:68px;text-align:center}.sc-kop strong{font-size:14px;line-height:1.13}.sc-kop b{font-size:15px;line-height:1.13}.sc-kop small{margin-top:3px;font-size:7.4px;line-height:1.18;white-space:nowrap}.sc-kop-logo{position:absolute;top:50%;transform:translateY(-50%);object-fit:contain}.sc-kop-logo.kabupaten{left:6px;width:74px;height:78px}.sc-kop-logo.rw{right:6px;width:78px;height:78px}.sc-title{text-align:center;margin:27px 0 24px}.sc-title h2{margin:0;font-size:17px;text-decoration:underline}.sc-title p{margin:2px 0 0;font-size:11px}.sc-paper>p{margin:13px 0}.sc-data{display:grid;grid-template-columns:190px 1fr;margin:15px 0}.sc-data dt,.sc-data dd{margin:0;padding:3px 0}.sc-purpose{display:grid;gap:5px;margin:16px 0;padding:11px 13px;background:#f3f6f5;border-left:4px solid #08715a}.sc-sign{display:grid;grid-template-columns:1fr 1fr;gap:90px;margin-top:48px;text-align:center}.sc-sign>div{display:grid}.sc-sign span{font-size:10.5px}.sc-sign i{height:70px;border-bottom:1px solid #111}.sc-sign small{font-size:9.5px}.sc-footer-note{margin-top:46px;padding-top:12px;border-top:1px solid #ddd;color:#555;font-size:9.5px;text-align:center}
  @media(max-width:760px){.sc-page{margin-top:-24px}.sc-head{align-items:flex-start;flex-direction:column}.sc-actions{justify-content:flex-start}.sc-paper-wrap{overflow-x:auto}.sc-paper{width:760px;min-height:1030px}.sc-btn{width:100%}.sc-actions{display:grid;width:100%}}
  @media print{.tanpa-cetak,:global(.situs-atas),:global(.kaki-waktu),:global(.pesan){display:none!important}.sc-page{margin:0!important;padding:0!important;background:white!important}.sc-paper-wrap{width:auto!important}.sc-paper{width:auto!important;min-height:auto!important;padding:0!important;border:0!important;box-shadow:none!important}.sc-kop{position:relative!important;min-height:90px!important;padding:7px 98px 13px!important;overflow:hidden!important}.sc-kop-logo{position:absolute!important;top:50%!important;transform:translateY(-50%)!important}.sc-kop-logo.kabupaten{left:6px!important}.sc-kop-logo.rw{right:6px!important}.sc-draft{display:block!important}}
</style>