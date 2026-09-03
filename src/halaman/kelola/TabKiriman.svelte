<script>
  import { isi, beriTahu, muatKoleksi } from "../../lib/keadaan.svelte.js";
  import { ubahStatus, setujuiReservasi, simpanDokumen, pesanRamah } from "../../lib/firebase.js";
  import { keSlug } from "../../lib/bantu.js";
  import Lencana from "../../komponen/Lencana.svelte";

  const pengaduan = $derived(isi.pengaduan || []);
  const surat = $derived(isi.surat || []);
  const reservasi = $derived(isi.reservasi || []);
  const usahaBaru = $derived(isi.usaha_baru || []);

  let status = $state({});
  let sibuk = $state("");

  async function simpanStatus(id) {
    sibuk = id;
    try {
      await ubahStatus("pengaduan", id, status[id] || "baru");
      beriTahu("Status diperbarui.");
      muatKoleksi("pengaduan");
    } catch (err) { beriTahu(pesanRamah(err)); }
    sibuk = "";
  }

  async function setujui(r) {
    sibuk = r.id;
    try {
      await setujuiReservasi(r.id, r.tanggal, r.fasilitas);
      beriTahu("Disetujui. Tanggal " + r.tanggal + " terkunci di kalender warga.");
      muatKoleksi("reservasi");
      muatKoleksi("jadwal");
    } catch (err) { beriTahu(pesanRamah(err)); }
    sibuk = "";
  }

  async function keKatalog(u) {
    sibuk = u.id;
    try {
      const kat = String(u.jenis || "").toLowerCase();
      await simpanDokumen("usaha", keSlug(u.nama) || "usaha", {
        nama: u.nama,
        kat: kat.includes("siap") ? "siapsaji" : kat.includes("kemasan") ? "kemasan" : kat.includes("jasa") ? "jasa" : "retail",
        katLabel: u.jenis,
        ringkas: String(u.produk || "").slice(0, 140),
        panjang: u.produk || "",
        wa: u.wa || "",
        alamat: u.alamat || ""
      });
      await ubahStatus("usaha_baru", u.id, "selesai");
      beriTahu("Usaha tampil di katalog warga.");
      muatKoleksi("usaha");
      muatKoleksi("usaha_baru");
    } catch (err) { beriTahu(pesanRamah(err)); }
    sibuk = "";
  }
</script>

<section class="blok">
  <div class="deret-angka">
    <div class="angka"><span class="label">Pengaduan</span><span class="besar">{pengaduan.length}</span><span class="bawah">{pengaduan.filter((x) => x.status === "baru").length} belum ditangani</span></div>
    <div class="angka"><span class="label">Pengajuan surat</span><span class="besar">{surat.length}</span><span class="bawah">{surat.filter((x) => x.status === "baru").length} menunggu</span></div>
    <div class="angka"><span class="label">Permohonan pinjam</span><span class="besar">{reservasi.length}</span><span class="bawah">{reservasi.filter((x) => x.status === "baru").length} menunggu</span></div>
    <div class="angka"><span class="label">Usaha mendaftar</span><span class="besar">{usahaBaru.length}</span><span class="bawah">belum ditinjau</span></div>
  </div>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Pengaduan warga</h2></div>
  {#if pengaduan.length}
    {#each pengaduan as p}
      <div class="baris-kelola">
        <div class="isi">
          <b>{p.kategori} &middot; {p.tiket || p.id}</b>
          <p>{p.isi}</p>
          {#if p.lokasi}<p class="mono" style="font-size:12px;color:var(--tinta-3)">{p.lokasi}</p>{/if}
        </div>
        <select bind:value={() => status[p.id] ?? p.status, (v) => (status[p.id] = v)}>
          <option value="baru">Diterima</option>
          <option value="proses">Diproses</option>
          <option value="selesai">Selesai</option>
        </select>
        <button class="tombol" type="button" onclick={() => simpanStatus(p.id)} disabled={sibuk === p.id}>
          {sibuk === p.id ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    {/each}
  {:else}
    <p class="kosong">Belum ada laporan masuk.</p>
  {/if}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Pengajuan surat</h2></div>
  {#if surat.length}
    <div class="tabel-bungkus">
      <table class="data">
        <thead><tr><th>Antrean</th><th>Jenis</th><th>Pemohon</th><th>Alamat</th><th>Status</th></tr></thead>
        <tbody>
          {#each surat as x}
            <tr>
              <td><b class="mono" style="font-size:12.5px">{x.antrean || "-"}</b></td>
              <td>{x.jenis}</td>
              <td>{x.nama}</td>
              <td>{x.alamat} {x.rt || ""}</td>
              <td><Lencana status={x.status} /></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <p class="verifikasi">
      Nomor induk kependudukan tidak ditampilkan di daftar ini, walau Anda berhak membukanya.
      Isinya hanya dibuka di konsol basis data saat surat benar-benar dibuat, supaya tidak terpampang di layar yang bisa terlihat orang lain.
    </p>
  {:else}
    <p class="kosong">Belum ada pengajuan.</p>
  {/if}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Permohonan pinjam fasilitas</h2></div>
  {#if reservasi.length}
    {#each reservasi as r}
      <div class="baris-kelola">
        <div class="isi">
          <b>{r.fasilitas}</b>
          <p>{r.tanggal} &middot; {r.jam || "-"} &middot; {r.acara || "-"}</p>
          <p>{r.nama}{r.wa ? " \u00B7 " + r.wa : ""} <Lencana status={r.status} /></p>
        </div>
        <div></div>
        {#if r.status === "baru"}
          <button class="tombol utama" type="button" onclick={() => setujui(r)} disabled={sibuk === r.id}>
            {sibuk === r.id ? "Menyimpan..." : "Setujui & kunci tanggal"}
          </button>
        {:else}
          <span class="mono" style="font-size:11px;color:var(--tinta-3)">sudah diproses</span>
        {/if}
      </div>
    {/each}
    <p class="verifikasi">Menyetujui permohonan langsung mengunci tanggalnya di kalender ketersediaan yang dilihat warga.</p>
  {:else}
    <p class="kosong">Belum ada permohonan.</p>
  {/if}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Usaha mendaftar</h2></div>
  {#if usahaBaru.length}
    {#each usahaBaru as u}
      <div class="baris-kelola">
        <div class="isi">
          <b>{u.nama}</b>
          <p>{u.pemilik} &middot; {u.jenis}</p>
          <p>{u.produk || ""}</p>
        </div>
        <div></div>
        <button class="tombol" type="button" onclick={() => keKatalog(u)} disabled={sibuk === u.id}>
          {sibuk === u.id ? "Menyalin..." : "Tampilkan di katalog"}
        </button>
      </div>
    {/each}
    <p class="verifikasi">Menekan tombol itu menyalin keterangannya ke katalog usaha yang terbuka untuk warga.</p>
  {:else}
    <p class="kosong">Belum ada pendaftaran.</p>
  {/if}
</section>
