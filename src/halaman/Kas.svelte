<script>
  import { isi } from "../keadaan/isi.svelte.js";
  import { rupiah, angkaDari } from "../inti/format.js";
  import Lencana from "../komponen/Lencana.svelte";

  const kas = $derived(isi.kas || []);
  const ringkas = $derived.by(() => {
    let masuk = 0, keluar = 0;
    kas.forEach((t) => {
      const n = angkaDari(t.nominal);
      if (t.jenis === "masuk") masuk += n; else keluar += n;
    });
    return { masuk, keluar, saldo: masuk - keluar };
  });
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Laporan Kas RW</span></nav>
<div class="kepala-halaman">
  <p class="alis">Transparansi</p>
  <h1>Laporan kas RW</h1>
  <p>Pemasukan, pengeluaran, dan saldo kas RW dipublikasikan terbuka agar warga dapat memeriksanya kapan saja.</p>
</div>

{#if kas.length}
  <section class="blok">
    <div class="deret-angka">
      <div class="angka"><span class="label">Jumlah transaksi</span><span class="besar">{kas.length}</span></div>
      <div class="angka baik"><span class="label">Total pemasukan</span><span class="besar" style="font-size:21px">{rupiah(ringkas.masuk)}</span></div>
      <div class="angka buruk"><span class="label">Total pengeluaran</span><span class="besar" style="font-size:21px">{rupiah(ringkas.keluar)}</span></div>
      <div class="angka"><span class="label">Saldo</span><span class="besar" style="font-size:21px">{rupiah(ringkas.saldo)}</span></div>
    </div>
  </section>

  <section class="blok">
    <div class="kepala-bagian"><h2>Rincian transaksi</h2></div>
    <div class="tabel-bungkus">
      <table class="data">
        <thead><tr><th>Tanggal</th><th>Keterangan</th><th>Jenis</th><th>Nominal</th></tr></thead>
        <tbody>
          {#each kas as t}
            <tr>
              <td>{t.tgl || ""}{t.periode ? " \u00B7 " + t.periode : ""}</td>
              <td>{t.ket}</td>
              <td><Lencana status={t.jenis === "masuk" ? "selesai" : "proses"} /></td>
              <td class="angka-kanan">{rupiah(t.nominal)}</td>
            </tr>
          {/each}
          <tr class="jumlah"><td colspan="3">Saldo</td><td class="angka-kanan">{rupiah(ringkas.saldo)}</td></tr>
        </tbody>
      </table>
    </div>
  </section>
{:else}
  <p class="kosong">Bendahara belum mencatat transaksi kas. Susunan laporannya sudah disiapkan, tinggal diisi lewat halaman Kelola.</p>
{/if}

<section class="blok" style="margin-top:26px">
  <div class="catatan">
    <b>Cara memeriksa.</b> Warga yang ingin melihat bukti pembelanjaan dapat menemui bendahara pada jam layanan.
    Buku kas dan kuitansi fisik tetap disimpan pengurus sebagai bukti utama; yang di sini salinannya supaya bisa diperiksa kapan saja.
  </div>
</section>
