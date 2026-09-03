<script>
  import { isi, pakai, sesi, beriTahu } from "../lib/keadaan.svelte.js";
  import { FASILITAS_BAWAAN } from "../lib/bawaan.js";
  import { NAMA_BULAN, tanggalHariIni } from "../lib/bantu.js";
  import { kirimWarga, pesanRamah } from "../lib/firebase.js";
  import { pergi } from "../lib/rute.svelte.js";

  const fasilitas = $derived(pakai("fasilitas", FASILITAS_BAWAAN));
  const jadwal = $derived(isi.jadwal || []);

  const kini = new Date();
  let tahun = $state(kini.getFullYear());
  let bulan = $state(kini.getMonth());

  let form = $state({ fasilitas: "", tanggal: tanggalHariIni(), jam: "", acara: "", nama: "", wa: "" });
  let mengirim = $state(false);

  $effect(() => { if (!form.fasilitas && fasilitas.length) form.fasilitas = fasilitas[0].nama; });

  const sel = $derived.by(() => {
    const jumlahHari = new Date(tahun, bulan + 1, 0).getDate();
    const mulai = (new Date(tahun, bulan, 1).getDay() + 6) % 7;
    const hasil = [];
    for (let i = 0; i < mulai; i++) hasil.push(null);
    for (let d = 1; d <= jumlahHari; d++) {
      const iso = tahun + "-" + String(bulan + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
      hasil.push({ hari: d, iso, dipakai: jadwal.filter((j) => j.id === iso) });
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

  async function kirim(e) {
    e.preventDefault();
    if (!sesi.pengguna) { beriTahu("Masuk dulu supaya permohonan bisa Anda lacak sendiri."); pergi("/masuk"); return; }
    mengirim = true;
    try {
      await kirimWarga("reservasi", form);
      beriTahu("Permohonan terkirim. Pengurus akan menghubungi lewat WhatsApp.");
      form = { ...form, jam: "", acara: "" };
    } catch (err) {
      beriTahu(pesanRamah(err));
    }
    mengirim = false;
  }
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Reservasi Fasilitas</span></nav>
<div class="kepala-halaman">
  <p class="alis">Layanan warga</p>
  <h1>Reservasi fasilitas</h1>
  <p>Lihat tanggal yang masih kosong, lalu ajukan peminjaman. Jadwal terkunci sendiri begitu pengurus menyetujui permohonan.</p>
</div>

<section class="blok">
  <div class="kepala-bagian"><h2>Fasilitas yang bisa dipinjam</h2></div>
  <div class="petak petak-2">
    {#each fasilitas as f}
      <div class="kartu">
        <h3>{f.nama}</h3>
        <p class="keterangan">Kapasitas {f.kapasitas || "\u2026\u2026"}</p>
        <p>{f.ket || ""}</p>
      </div>
    {/each}
  </div>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Ketersediaan</h2></div>
  <div class="kalender">
    <div class="kalender-kepala">
      <b>{NAMA_BULAN[bulan]} {tahun}</b>
      <span class="baris-tombol">
        <button class="tombol" type="button" onclick={() => geser(-1)}>Sebelumnya</button>
        <button class="tombol" type="button" onclick={() => geser(1)}>Berikutnya</button>
      </span>
    </div>
    <div class="kalender-petak">
      {#each ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"] as h}<div class="hari">{h}</div>{/each}
      {#each sel as s}
        {#if s}
          <div class="kalender-sel">
            <span class="angka-hari">{s.hari}</span>
            {#each s.dipakai as d}<span class="acara agenda">{d.fasilitas || "Dipakai"}</span>{/each}
          </div>
        {:else}
          <div class="kalender-sel redup"></div>
        {/if}
      {/each}
    </div>
  </div>
  <p class="verifikasi">Tanggal bertanda kuning sudah dipakai. Jadwal diperbarui otomatis saat pengurus menyetujui permohonan.</p>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Ajukan peminjaman</h2></div>
  <form class="isian-borang" onsubmit={kirim}>
    <div class="isian"><label for="r-fas">Fasilitas</label><select id="r-fas" bind:value={form.fasilitas}>{#each fasilitas as f}<option>{f.nama}</option>{/each}</select></div>
    <div class="isian"><label for="r-tgl">Tanggal pemakaian</label><input id="r-tgl" type="date" bind:value={form.tanggal} required /></div>
    <div class="isian"><label for="r-jam">Perkiraan waktu</label><input id="r-jam" bind:value={form.jam} placeholder="08.00 sampai 14.00" /></div>
    <div class="isian"><label for="r-acara">Keperluan</label><input id="r-acara" bind:value={form.acara} placeholder="Pengajian, rapat blok, acara keluarga" /></div>
    <div class="isian"><label for="r-nama">Nama peminjam</label><input id="r-nama" bind:value={form.nama} required /></div>
    <div class="isian"><label for="r-wa">Nomor WhatsApp</label><input id="r-wa" bind:value={form.wa} inputmode="tel" required /></div>
    <div><button class="tombol utama" type="submit" disabled={mengirim}>{mengirim ? "Mengirim..." : "Kirim permohonan"}</button></div>
  </form>
</section>
