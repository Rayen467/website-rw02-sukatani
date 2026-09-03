<script>
  import { pakai, kontenNilai } from "../lib/keadaan.svelte.js";
  import { JENIS_SURAT_BAWAAN, IDENTITAS_BAWAAN } from "../lib/bawaan.js";
  import TidakAda from "./TidakAda.svelte";

  let { kunci } = $props();
  const surat = $derived(pakai("jenis_surat", JENIS_SURAT_BAWAAN).find((s) => s.id === kunci));

  let isian = $state(null);
  $effect(() => {
    try {
      const mentah = localStorage.getItem("surat-terakhir");
      const d = mentah ? JSON.parse(mentah) : null;
      isian = d && d.jenis === kunci ? d : null;
    } catch (e) { isian = null; }
  });

  const titik = "\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026";
  const namaRW = $derived(kontenNilai("identitas", "namaRW", IDENTITAS_BAWAAN.namaRW));
</script>

{#if !surat}
  <TidakAda />
{:else}
  <nav class="remah tanpa-cetak"><a href="#/">Beranda</a><span>&rsaquo;</span><a href="#/surat">Pengajuan Surat</a><span>&rsaquo;</span><span>Berkas</span></nav>

  <div class="tanpa-cetak">
    <div class="kepala-halaman">
      <p class="alis">Berkas surat</p>
      <h1>Berkas {surat.nama}</h1>
      <p>
        {#if isian}
          Nomor antrean <b class="mono">{isian.antrean}</b>. Cetak berkas ini, lalu bawa beserta syaratnya kepada Ketua RT.
        {:else}
          Belum ada pengajuan tersimpan di perangkat ini, jadi berkas di bawah masih kosong. Isi formulirnya lebih dulu agar keterangannya terisi otomatis.
        {/if}
      </p>
    </div>

    <div class="baris-tombol" style="margin-bottom:20px">
      <button class="tombol utama" type="button" onclick={() => window.print()}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9V3h12v6" /><path d="M6 18H4a1 1 0 0 1-1-1v-6h18v6a1 1 0 0 1-1 1h-2" /><path d="M6 14h12v7H6z" /></svg>
        Cetak atau simpan PDF
      </button>
      <a class="tombol" href="#/surat/{surat.id}">Kembali ke formulir</a>
    </div>

    <div class="catatan" style="margin-bottom:20px">
      <b>Cara menyimpan PDF.</b> Tekan tombol di atas, lalu pada jendela cetak pilih tujuan <b>Simpan sebagai PDF</b>.
    </div>
  </div>

  <div class="surat">
    <div class="kop">
      <b>RUKUN WARGA {namaRW.replace(/^RW\s*/i, "")}</b>
      <span>PERUM PERMAI SUKATANI &mdash; DESA SUKATANI, KECAMATAN RAJEG</span>
      <span>KABUPATEN TANGERANG, PROVINSI BANTEN 15540</span>
    </div>

    <h2>{surat.nama.toUpperCase()}</h2>
    <div class="nomor">Nomor: {isian ? isian.antrean : titik}</div>

    <p>Yang bertanda tangan di bawah ini, Ketua Rukun Warga Perum Permai Sukatani, Desa Sukatani, Kecamatan Rajeg, Kabupaten Tangerang, menerangkan bahwa:</p>

    <table><tbody>
      <tr><td>Nama</td><td>: {isian ? isian.nama : titik}</td></tr>
      <tr><td>Nomor induk kependudukan</td><td>: {isian ? isian.nik : titik}</td></tr>
      <tr><td>Tempat, tanggal lahir</td><td>: {isian && isian.ttl ? isian.ttl : titik}</td></tr>
      <tr><td>Alamat</td><td>: {isian ? isian.alamat + ", " + isian.rt : titik}</td></tr>
    </tbody></table>

    <p>Adalah benar warga yang berdomisili di lingkungan kami. Surat keterangan ini dibuat untuk keperluan {isian && isian.keperluan ? isian.keperluan : titik}.</p>
    <p>Demikian surat keterangan ini dibuat dengan sebenarnya, untuk dipergunakan sebagaimana mestinya.</p>

    <div class="ttd">
      <div>
        <div>Sukatani, {titik}</div>
        <div>Ketua {namaRW}</div>
        <div class="ruang"></div>
        <div>( {titik} )</div>
      </div>
    </div>

    <p class="kaki">Penomoran dan stempel mengikuti ketentuan yang berlaku di RW dan kantor desa.</p>
  </div>
{/if}
