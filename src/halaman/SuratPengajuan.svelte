<script>
  import { isi, muatMilikSaya } from "../keadaan/isi.svelte.js";
  import { sesi, pengurus } from "../keadaan/sesi.svelte.js";
  import { pergi } from "../keadaan/rute.svelte.js";
  import { LOGO_KABUPATEN_TANGERANG, LOGO_RW_SUKATANI } from "../inti/logo-surat.js";
  import Lencana from "../komponen/Lencana.svelte";

  let { kunci } = $props();

  const surat = $derived((isi.surat || []).find((x) => x.id === kunci) || null);
  const sedangMemuat = $derived(isi.surat === null && !!sesi.pengguna);

  const TAHAP = Object.freeze({
    diterima: "Diterima",
    ditugaskan: "Ditugaskan ke petugas",
    verifikasi: "Verifikasi data",
    menunggu_ttd: "Menunggu tanda tangan",
    menunggu_cap: "Menunggu ACC / cap RW",
    siap: "Sudah ACC · siap diserahkan",
    selesai: "Selesai",
    ditolak: "Ditolak"
  });

  $effect(() => {
    if (sesi.siap && sesi.pengguna && !pengurus() && isi.surat === null) {
      muatMilikSaya(sesi.pengguna.uid);
    }
  });

  function labelTahap(v) {
    return TAHAP[v] || "Diterima";
  }

  function isiNilai(k, kosong = "-") {
    return String(surat?.[k] || "").trim() || kosong;
  }

  function statusCetak() {
    const t = surat?.tahap || "diterima";
    if (t === "menunggu_cap") return "SIAP UNTUK ACC / CAP RW";
    if (t === "siap") return "SUDAH ACC · SIAP DISERAHKAN";
    if (t === "selesai") return "ARSIP SELESAI";
    if (t === "ditolak") return "PENGAJUAN DITOLAK";
    return "DRAFT PENGAJUAN";
  }

  function tanggal() {
    if (surat?.tanggalSurat) return surat.tanggalSurat;
    const d = surat?.dibuat?.toDate?.() || null;
    return d
      ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(d)
      : "....................";
  }

  function cetak() {
    window.print();
  }
</script>

{#if !sesi.siap}
  <p class="catatan" role="status">Memeriksa akses surat...</p>
{:else if !sesi.pengguna}
  <section class="sp-kunci">
    <p class="sp-alis">ARSIP SURAT</p>
    <h1>Masuk untuk membuka surat</h1>
    <p>Berkas pengajuan hanya bisa dibuka oleh pemilik pengajuan atau akun pengurus.</p>
    <button class="sp-btn utama" type="button" onclick={() => pergi("/masuk")}>Masuk</button>
  </section>
{:else if sedangMemuat}
  <p class="catatan" role="status">Memuat surat pengajuan...</p>
{:else if !surat}
  <section class="sp-kunci">
    <p class="sp-alis">ARSIP SURAT</p>
    <h1>Surat tidak ditemukan</h1>
    <p>Pengajuan ini tidak tersedia untuk akun yang sedang masuk, atau datanya belum selesai dimuat.</p>
    <a class="sp-btn" href={pengurus() ? "#/kelola/kiriman" : "#/akun"}>Kembali</a>
  </section>
{:else}
  <div class="sp-page">
    <section class="sp-top tanpa-cetak">
      <div>
        <p class="sp-alis">BERKAS PENGAJUAN · {surat.antrean || surat.id}</p>
        <h1>{surat.jenis || "Surat Pengantar"}</h1>
        <p>
          Ini adalah berkas yang sama untuk warga dan pengurus. Bisa dibuka online,
          dicetak, atau disimpan sebagai PDF untuk dibawa secara offline ke RT/RW.
        </p>
      </div>
      <div class="sp-actions">
        <button class="sp-btn utama" type="button" onclick={cetak}>Cetak / Simpan PDF</button>
        <a class="sp-btn" href={pengurus() ? "#/kelola/kiriman" : "#/akun"}>{pengurus() ? "Kembali ke Petugas" : "Kembali ke Dashboard Warga"}</a>
      </div>
    </section>

    <section class="sp-status tanpa-cetak">
      <div>
        <small>Status layanan</small>
        <Lencana status={surat.status} />
      </div>
      <div>
        <small>Tahap sekarang</small>
        <b>{labelTahap(surat.tahap)}</b>
      </div>
      <div>
        <small>Penanggung jawab</small>
        <b>{surat.petugasNama || "Belum ditugaskan"}</b>
      </div>
      <div>
        <small>Nomor surat resmi</small>
        <b>{surat.nomorSurat || "Belum ditetapkan"}</b>
      </div>
    </section>

    <div class="sp-note tanpa-cetak">
      <b>Mode online + offline.</b>
      Saat tahap sudah <b>Menunggu ACC / cap RW</b>, berkas ini bisa dicetak oleh warga atau petugas
      lalu dibawa ke RW untuk stempel fisik. Setelah ACC, pengurus mengubah tahap menjadi
      <b>Sudah ACC · siap diserahkan</b>.
    </div>

    <main class="sp-paper-wrap">
      <article class="sp-paper">
        <div class="sp-watermark">{statusCetak()}</div>

        <header class="sp-kop">
          <img src={LOGO_KABUPATEN_TANGERANG} alt="Logo Kabupaten Tangerang" />
          <div>
            <strong>RUKUN WARGA 02</strong>
            <b>PERUM PERMAI SUKATANI</b>
            <small>DESA SUKATANI · KECAMATAN RAJEG · KABUPATEN TANGERANG · BANTEN</small>
          </div>
          <img src={LOGO_RW_SUKATANI} alt="Logo RW 02 Sukatani" />
        </header>

        <section class="sp-title">
          <h2>SURAT PENGANTAR</h2>
          <p>Nomor: {surat.nomorSurat || "................................................"}</p>
          <small>Nomor antrean: {surat.antrean || surat.id}</small>
        </section>

        <p>Yang bertanda tangan di bawah ini, pengurus RT/RW 02 Perum Permai Sukatani, menerangkan bahwa:</p>

        <dl class="sp-data">
          <dt>Nama</dt><dd>: <b>{isiNilai("nama")}</b></dd>
          <dt>NIK</dt><dd>: {isiNilai("nik")}</dd>
          <dt>No. Kartu Keluarga</dt><dd>: {isiNilai("kk")}</dd>
          <dt>Tempat / Tanggal Lahir</dt><dd>: {isiNilai("ttl")}</dd>
          <dt>Alamat</dt><dd>: {isiNilai("alamat")}</dd>
          <dt>RT / RW</dt><dd>: {isiNilai("rt")} / RW 02</dd>
        </dl>

        <p>Adalah benar warga yang berdomisili di wilayah RW 02 Perum Permai Sukatani.</p>

        <div class="sp-purpose">
          <b>Keperluan:</b>
          <span>{isiNilai("keperluan")}</span>
        </div>

        <p>Demikian surat pengantar ini dibuat untuk dipergunakan sebagaimana mestinya.</p>

        <section class="sp-sign">
          <div>
            <b>Ketua RT</b>
            <i></i>
            <small>( ................................ )</small>
          </div>
          <div>
            <span>Sukatani, {tanggal()}</span>
            <b>Ketua RW 02</b>
            <i class="cap-space"></i>
            <small>( ................................ )</small>
            <em>Ruang tanda tangan &amp; cap/stempel RW 02</em>
          </div>
        </section>

        <footer>
          Berkas pengajuan {surat.antrean || surat.id} · Tahap: {labelTahap(surat.tahap)}.
          Surat dinyatakan sah setelah verifikasi, nomor resmi, tanda tangan, dan pengesahan/stempel yang diperlukan selesai.
        </footer>
      </article>
    </main>
  </div>
{/if}

<style>
  .sp-page{--g:#08715a;--ink:#13271f;--muted:#667972;min-height:100vh;color:var(--ink);font-family:"Poppins",system-ui,sans-serif}
  .sp-top{display:flex;justify-content:space-between;gap:24px;align-items:flex-end;margin:10px 0 18px}.sp-top h1,.sp-kunci h1{margin:4px 0 8px;font-family:"Sora",system-ui,sans-serif;font-size:clamp(28px,4vw,42px);letter-spacing:-.035em}.sp-top p,.sp-kunci p{max-width:760px;margin:0;color:var(--muted);line-height:1.6}.sp-alis{margin:0!important;color:var(--g)!important;font-size:11px!important;font-weight:900;letter-spacing:.11em}
  .sp-actions{display:flex;gap:8px;flex-wrap:wrap}.sp-btn{min-height:42px;display:inline-flex;align-items:center;justify-content:center;padding:0 14px;border:1px solid #b7d4c8;border-radius:10px;background:#fff;color:#08634f;font:inherit;font-size:12px;font-weight:800;text-decoration:none;cursor:pointer}.sp-btn.utama{border-color:var(--g);background:var(--g);color:#fff}
  .sp-status{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:12px}.sp-status>div{padding:13px 14px;border:1px solid #dce7e2;border-radius:12px;background:#fff}.sp-status small,.sp-status b{display:block}.sp-status small{margin-bottom:5px;color:#75847f;font-size:10px}.sp-status b{font-size:12px}
  .sp-note{margin-bottom:18px;padding:13px 15px;border:1px solid #cfe5da;border-radius:12px;background:#eff9f4;color:#315e50;font-size:12px;line-height:1.6}
  .sp-kunci{padding:34px;border:1px solid #dfe8e4;border-radius:18px;background:#fff}
  .sp-paper-wrap{width:min(820px,100%);margin:0 auto}.sp-paper{position:relative;min-height:1080px;padding:58px 68px;border:1px solid #d7dfdb;background:#fff;color:#111;box-shadow:0 26px 60px -44px rgba(0,0,0,.48);font-family:Arial,Helvetica,sans-serif}.sp-watermark{position:absolute;right:22px;top:19px;padding:5px 8px;border:1px solid #d3a7a7;color:#934343;font-size:8px;font-weight:800;letter-spacing:.08em;transform:rotate(2deg)}
  .sp-kop{display:grid;grid-template-columns:74px minmax(0,1fr) 74px;gap:12px;align-items:center;padding:4px 0 12px;border-bottom:3px double #111;text-align:center}.sp-kop img{width:66px;height:70px;object-fit:contain}.sp-kop img:last-child{justify-self:end}.sp-kop strong,.sp-kop b,.sp-kop small{display:block}.sp-kop strong,.sp-kop b{font-size:14px;line-height:1.25}.sp-kop small{margin-top:4px;font-size:8px;white-space:nowrap}
  .sp-title{text-align:center;margin:23px 0 22px}.sp-title h2{margin:0;font-size:16px;text-decoration:underline}.sp-title p{margin:4px 0 1px;font-size:12px}.sp-title small{font-size:9px;color:#555}.sp-paper>p{font-size:12.5px;line-height:1.7;text-align:justify}.sp-data{display:grid;grid-template-columns:180px 1fr;gap:5px 10px;margin:16px 0;font-size:12.5px}.sp-data dt,.sp-data dd{margin:0}.sp-purpose{margin:16px 0;padding:11px 13px;border-left:4px solid var(--g);background:#f3f6f4;font-size:12.5px}.sp-purpose b,.sp-purpose span{display:block}.sp-purpose span{margin-top:7px}
  .sp-sign{display:grid;grid-template-columns:1fr 1fr;gap:90px;margin-top:45px;text-align:center}.sp-sign>div{font-size:11px}.sp-sign span,.sp-sign b,.sp-sign small,.sp-sign em{display:block}.sp-sign i{display:block;height:70px}.sp-sign i.cap-space{height:84px}.sp-sign em{margin-top:8px;color:#777;font-size:8px;font-style:normal}.sp-paper footer{margin-top:34px;padding-top:9px;border-top:1px solid #bbb;color:#555;font-size:8.5px;line-height:1.5}
  @media(max-width:760px){.sp-top{display:grid}.sp-status{grid-template-columns:1fr 1fr}.sp-paper{padding:38px 28px;min-height:940px}.sp-kop{grid-template-columns:54px minmax(0,1fr) 54px}.sp-kop img{width:50px;height:56px}.sp-kop strong,.sp-kop b{font-size:10px}.sp-kop small{font-size:5.8px}.sp-data{grid-template-columns:130px 1fr}.sp-sign{gap:28px}}
  @media print{ :global(body *){visibility:hidden!important}.sp-paper,.sp-paper *{visibility:visible!important}.sp-paper{position:absolute;left:0;top:0;width:100%;min-height:0;margin:0;border:0;box-shadow:none;padding:17mm}.tanpa-cetak{display:none!important}@page{size:A4;margin:0} }
</style>
