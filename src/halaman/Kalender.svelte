<script>
  import { isi, pakai } from "../lib/keadaan.svelte.js";
  import { RUTIN_BAWAAN } from "../lib/bawaan.js";
  import { NAMA_BULAN } from "../lib/bantu.js";
  import Belum from "../komponen/Belum.svelte";

  const kini = new Date();
  let tahun = $state(kini.getFullYear());
  let bulan = $state(kini.getMonth());

  const rutin = $derived(pakai("rutin", RUTIN_BAWAAN));
  const agenda = $derived((isi.pengumuman || []).filter((o) => o.tipe === "agenda"));

  const sel = $derived.by(() => {
    const jumlahHari = new Date(tahun, bulan + 1, 0).getDate();
    const mulai = (new Date(tahun, bulan, 1).getDay() + 6) % 7;
    const hasil = [];
    for (let i = 0; i < mulai; i++) hasil.push(null);
    for (let d = 1; d <= jumlahHari; d++) {
      const iso = tahun + "-" + String(bulan + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
      hasil.push({ hari: d, iso, acara: agenda.filter((a) => a.tgl === iso) });
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
</script>

<nav class="remah"><a href="#/">Beranda</a><span>›</span><span>Kalender Kegiatan</span></nav>
<div class="kepala-halaman">
  <p class="alis">Informasi</p>
  <h1>Kalender kegiatan</h1>
  <p>Jadwal rutin dan acara mendatang di lingkungan RW.</p>
</div>

<section class="blok">
  <div class="kalender">
    <div class="kalender-kepala">
      <b>{NAMA_BULAN[bulan]} {tahun}</b>
      <span class="baris-tombol">
        <button class="tombol" type="button" onclick={() => geser(-1)}>Sebelumnya</button>
        <button class="tombol" type="button" onclick={() => geser(1)}>Berikutnya</button>
      </span>
    </div>
    <div class="kalender-petak">
      {#each ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"] as h}
        <div class="hari">{h}</div>
      {/each}
      {#each sel as s}
        {#if s}
          <div class="kalender-sel">
            <span class="angka-hari">{s.hari}</span>
            {#each s.acara as a}<span class="acara agenda">{a.judul}</span>{/each}
          </div>
        {:else}
          <div class="kalender-sel redup"></div>
        {/if}
      {/each}
    </div>
  </div>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Kegiatan rutin</h2></div>
  <div class="tabel-bungkus">
    <table class="data">
      <thead><tr><th>Kegiatan</th><th>Waktu</th><th>Tempat</th></tr></thead>
      <tbody>
        {#each rutin as r}
          <tr><td>{r.kegiatan}</td><td><Belum nilai={r.waktu} /></td><td><Belum nilai={r.tempat} /></td></tr>
        {/each}
      </tbody>
    </table>
  </div>
  <p class="verifikasi">Jadwal rutin diisi sekali oleh pengurus, supaya tidak perlu diumumkan berulang tiap bulan.</p>
</section>
