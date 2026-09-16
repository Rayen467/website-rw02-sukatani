<script>
  import { pakai } from "../keadaan/isi.svelte.js";
  import { JENIS_SURAT_BAWAAN } from "../inti/bawaan.js";
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
</script>

{#if !surat}
  <TidakAda />
{:else}
  <nav class="remah tanpa-cetak"><a href="#/">Beranda</a><span>&rsaquo;</span><a href="#/surat">Pengajuan Surat</a><span>&rsaquo;</span><span>Bukti Pengajuan</span></nav>

  <div class="tanpa-cetak">
    <div class="kepala-halaman">
      <p class="alis">Bukti pengajuan layanan</p>
      <h1>{surat.nama}</h1>
      <p>
        {#if isian}
          Pengajuan Anda sudah tercatat dengan nomor antrean <b class="mono">{isian.antrean}</b>.
          Dokumen di bawah adalah bukti pengajuan, bukan surat resmi yang sudah disahkan.
        {:else}
          Belum ada pengajuan tersimpan di perangkat ini. Isi formulir lebih dulu agar bukti pengajuan terisi otomatis.
        {/if}
      </p>
    </div>

    <div class="baris-tombol" style="margin-bottom:20px">
      <button class="tombol utama" type="button" onclick={() => window.print()}>Cetak / simpan PDF</button>
      <a class="tombol" href="#/akun">Lacak di Akun Saya</a>
      <a class="tombol" href="#/surat/{surat.id}">Kembali ke formulir</a>
    </div>

    <div class="catatan" style="margin-bottom:20px">
      <b>Penting.</b> Surat resmi baru disiapkan Petugas setelah data diverifikasi, nomor surat ditetapkan, dan proses tanda tangan/stempel selesai.
    </div>
  </div>

  <div class="surat bukti-pengajuan">
    <div class="draft-cap">BUKTI PENGAJUAN · BELUM MERUPAKAN SURAT RESMI</div>

    <div class="kop">
      <b>PORTAL LAYANAN WARGA RW 02</b>
      <span>PERUM PERMAI SUKATANI — KECAMATAN RAJEG</span>
      <span>KABUPATEN TANGERANG, BANTEN</span>
    </div>

    <h2>BUKTI PENGAJUAN LAYANAN</h2>
    <div class="nomor">Nomor antrean: {isian ? isian.antrean : "...................."}</div>

    <p>Bukti ini menerangkan bahwa sistem layanan RW 02 telah menerima pengajuan dengan rincian berikut:</p>

    <table><tbody>
      <tr><td>Jenis layanan</td><td>: {surat.nama}</td></tr>
      <tr><td>Nama pemohon</td><td>: {isian ? isian.nama : "-"}</td></tr>
      <tr><td>NIK</td><td>: {isian ? isian.nik : "-"}</td></tr>
      <tr><td>Tempat, tanggal lahir</td><td>: {isian && isian.ttl ? isian.ttl : "-"}</td></tr>
      <tr><td>Alamat</td><td>: {isian ? `${isian.alamat}, ${isian.rt}` : "-"}</td></tr>
      <tr><td>Keperluan</td><td>: {isian && isian.keperluan ? isian.keperluan : "-"}</td></tr>
      <tr><td>WhatsApp</td><td>: {isian && isian.wa ? isian.wa : "-"}</td></tr>
    </tbody></table>

    <div class="alur-box">
      <b>Alur berikutnya</b>
      <ol>
        <li>Petugas menerima dan memeriksa pengajuan.</li>
        <li>Data diverifikasi dan Petugas menetapkan penanggung jawab.</li>
        <li>Nomor surat resmi disiapkan bila pengajuan memenuhi persyaratan.</li>
        <li>Surat ditandatangani/stempel sesuai prosedur RW.</li>
        <li>Status akhir dapat dipantau melalui Dashboard Warga.</li>
      </ol>
    </div>

    <p class="kaki">Simpan nomor antrean ini. NIK dan data pribadi pada bukti ini hanya untuk keperluan pemohon dan Petugas yang berwenang.</p>
  </div>
{/if}

<style>
  .bukti-pengajuan{position:relative}.draft-cap{margin:-4px 0 18px;padding:8px 10px;border:1px solid #d9b8b8;background:#fff7f7;color:#914343;text-align:center;font:800 10px/1.2 system-ui,sans-serif;letter-spacing:.06em}.alur-box{margin:24px 0;padding:16px 18px;border:1px solid #dbe5df;border-radius:10px;background:#f7faf8;font-family:system-ui,sans-serif}.alur-box b{font-size:12px}.alur-box ol{margin:8px 0 0;padding-left:18px}.alur-box li{margin:5px 0;font-size:11px;line-height:1.45}
  @media print{.draft-cap{display:block!important}}
</style>
