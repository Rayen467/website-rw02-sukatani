<script>
  /**
   * Tab Kiriman warga -- meja kerja harian petugas.
   *
   * Ini satu-satunya tab yang isinya datang dari warga, bukan dari
   * pengurus. Karena itu yang dikejar di sini bukan kelengkapan borang,
   * tapi KECEPATAN MENANGANI: yang baru masuk harus langsung terlihat,
   * dan menutup satu kiriman harus cukup beberapa ketukan.
   *
   * Empat hal yang dulu tidak ada dan sekarang ada:
   *
   *   1. Surat bisa diproses. Dulu tabelnya cuma bisa dibaca, jadi status
   *      pengajuan warga tertahan di "Diterima" selamanya walaupun suratnya
   *      sudah jadi. Janji "status bisa dipantau" tidak berlaku untuk surat.
   *   2. Catatan penanganan pengaduan. Kolomnya sudah lama ada, halaman
   *      Pengaduan sudah menampilkannya ke warga, tapi tidak ada satu pun
   *      layar yang bisa mengisinya.
   *   3. Permohonan bisa ditolak. Dulu satu-satunya cara menutup permohonan
   *      yang tidak bisa dipenuhi adalah menandainya "Selesai" -- berbohong
   *      kepada warga yang memantau.
   *   4. Saringan dan pencarian. Setelah beberapa bulan daftarnya ratusan
   *      baris, dan yang baru masuk tenggelam di bawah.
   */
  import { KOLEKSI, STATUS, PILIHAN_STATUS } from "../../inti/nama.js";
  import { keSlug, keCSV, namaUnduhan } from "../../inti/format.js";
  import { unduhTeks } from "../../inti/peramban.js";
  import { isi, muatKoleksi } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { ubahStatus, ubahDokumen, setujuiReservasi, simpanDokumen } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";
  import Lencana from "../../komponen/Lencana.svelte";

  const semuaPengaduan = $derived(isi.pengaduan || []);
  const semuaSurat = $derived(isi.surat || []);
  const semuaReservasi = $derived(isi.reservasi || []);
  const usahaBaru = $derived(isi.usaha_baru || []);

  /* --- Saringan bersama untuk keempat daftar -------------------------- */

  let saring = $state("baru");
  let cari = $state("");

  const SARINGAN = [
    ["baru", "Perlu ditangani"],
    ["semua", "Semua"],
    ...PILIHAN_STATUS.filter((p) => p.nilai !== STATUS.BARU).map((p) => [p.nilai, p.label])
  ];

  /**
   * Menyaring satu daftar berdasarkan status dan kata pencarian.
   * Pencarian menyapu seluruh kolom teks dokumen, bukan kolom tertentu:
   * petugas biasanya ingat sepotong isinya, bukan nama kolomnya.
   */
  function pilih(daftar) {
    const kata = cari.trim().toLowerCase();
    return daftar.filter((d) => {
      if (saring !== "semua" && (d.status || STATUS.BARU) !== saring) return false;
      if (!kata) return true;
      return Object.values(d).some(
        (v) => typeof v === "string" && v.toLowerCase().includes(kata)
      );
    });
  }

  const pengaduan = $derived(pilih(semuaPengaduan));
  const surat = $derived(pilih(semuaSurat));
  const reservasi = $derived(pilih(semuaReservasi));
  const usaha = $derived(pilih(usahaBaru));

  const hitungBaru = (d) => d.filter((x) => (x.status || STATUS.BARU) === STATUS.BARU).length;

  /* --- Tindakan ------------------------------------------------------- */

  let bentuk = $state({});
  let sibuk = $state("");

  /** Nilai isian sebuah baris, dimulai dari nilai yang tersimpan. */
  function isian(d, kolom) {
    const k = d.id + ":" + kolom;
    return bentuk[k] !== undefined ? bentuk[k] : d[kolom] || (kolom === "status" ? STATUS.BARU : "");
  }
  function setIsian(d, kolom, nilai) {
    bentuk[d.id + ":" + kolom] = nilai;
  }

  async function jalan(id, aksi, pesan) {
    sibuk = id;
    try {
      await aksi();
      beriTahu(pesan);
    } catch (err) {
      beriTahu(pesanRamah(err));
    }
    sibuk = "";
  }

  const simpanPengaduan = (p) =>
    jalan(p.id, async () => {
      /* Status dan catatan disimpan sekali jalan. Aturan Firestore memang
         cuma mengizinkan kedua kolom itu -- isi laporan aslinya tidak bisa
         diubah siapa pun, termasuk master admin. */
      await ubahDokumen(KOLEKSI.PENGADUAN, p.id, {
        status: isian(p, "status"),
        catatan: isian(p, "catatan")
      });
      muatKoleksi(KOLEKSI.PENGADUAN);
    }, "Pengaduan diperbarui. Warga melihat catatannya di halaman Pengaduan.");

  const simpanSurat = (x) =>
    jalan(x.id, async () => {
      await ubahStatus(KOLEKSI.SURAT, x.id, isian(x, "status"));
      muatKoleksi(KOLEKSI.SURAT);
    }, "Status surat diperbarui. Pemohon melihatnya di halaman Akun Saya.");

  const setujuiPinjam = (r) =>
    jalan(r.id, async () => {
      await setujuiReservasi(r.id, r.tanggal, r.fasilitas);
      muatKoleksi(KOLEKSI.RESERVASI);
      muatKoleksi(KOLEKSI.JADWAL);
    }, "Disetujui. Tanggal " + r.tanggal + " terkunci di kalender warga.");

  const tolakPinjam = (r) =>
    jalan(r.id, async () => {
      /* Tanggalnya sengaja TIDAK dikunci di kalender. Menolak berarti
         fasilitasnya tetap kosong hari itu dan boleh dipinjam orang lain. */
      await ubahStatus(KOLEKSI.RESERVASI, r.id, STATUS.DITOLAK);
      muatKoleksi(KOLEKSI.RESERVASI);
    }, "Permohonan ditolak. Tanggalnya tetap terbuka untuk warga lain.");

  const tolakUsaha = (u) =>
    jalan(u.id, async () => {
      await ubahStatus(KOLEKSI.USAHA_BARU, u.id, STATUS.DITOLAK);
      muatKoleksi(KOLEKSI.USAHA_BARU);
    }, "Pendaftaran ditolak.");

  const keKatalog = (u) =>
    jalan(u.id, async () => {
      const kat = String(u.jenis || "").toLowerCase();
      await simpanDokumen(KOLEKSI.USAHA, keSlug(u.nama) || "usaha", {
        nama: u.nama,
        kat: kat.includes("siap") ? "siapsaji" : kat.includes("kemasan") ? "kemasan" : kat.includes("jasa") ? "jasa" : "retail",
        katLabel: u.jenis,
        ringkas: String(u.produk || "").slice(0, 140),
        panjang: u.produk || "",
        wa: u.wa || "",
        alamat: u.alamat || ""
      });
      await ubahStatus(KOLEKSI.USAHA_BARU, u.id, STATUS.SELESAI);
      muatKoleksi(KOLEKSI.USAHA);
      muatKoleksi(KOLEKSI.USAHA_BARU);
    }, "Usaha tampil di katalog warga.");

  /* --- Ekspor --------------------------------------------------------- */

  /**
   * Mengunduh daftar sebagai CSV untuk dilaporkan ke desa.
   *
   * Yang diekspor adalah daftar YANG SEDANG TAMPIL, mengikuti saringan dan
   * pencarian. Jadi "pengaduan yang belum ditangani bulan ini" cukup
   * disaring dulu, lalu diunduh -- tidak perlu menyunting berkasnya lagi.
   */
  function ekspor(nama, daftar, kolom) {
    if (!daftar.length) {
      beriTahu("Tidak ada baris untuk diekspor dengan saringan ini.");
      return;
    }
    unduhTeks(namaUnduhan(nama), keCSV(daftar, kolom));
    beriTahu(daftar.length + " baris diunduh.");
  }
</script>

<section class="blok">
  <div class="deret-angka">
    <div class="angka"><span class="label">Pengaduan</span><span class="besar">{semuaPengaduan.length}</span><span class="bawah">{hitungBaru(semuaPengaduan)} belum ditangani</span></div>
    <div class="angka"><span class="label">Pengajuan surat</span><span class="besar">{semuaSurat.length}</span><span class="bawah">{hitungBaru(semuaSurat)} menunggu</span></div>
    <div class="angka"><span class="label">Permohonan pinjam</span><span class="besar">{semuaReservasi.length}</span><span class="bawah">{hitungBaru(semuaReservasi)} menunggu</span></div>
    <div class="angka"><span class="label">Usaha mendaftar</span><span class="besar">{usahaBaru.length}</span><span class="bawah">{hitungBaru(usahaBaru)} belum ditinjau</span></div>
  </div>
</section>

<section class="blok">
  <div class="saring">
    {#each SARINGAN as [nilai, label]}
      <button class="tombol" class:utama={saring === nilai} type="button" onclick={() => (saring = nilai)}>{label}</button>
    {/each}
  </div>
  <div class="isian">
    <label for="kr-cari">Cari di semua kiriman</label>
    <input id="kr-cari" type="search" bind:value={cari} placeholder="Nama pemohon, isi laporan, lokasi, nomor antrean" />
    <span class="petunjuk">Menyapu seluruh keterangan kiriman, bukan cuma judulnya.</span>
  </div>
</section>

<section class="blok">
  <div class="kepala-bagian">
    <h2>Pengaduan warga</h2>
    <button class="tombol" type="button" onclick={() => ekspor("pengaduan", pengaduan, [["Tiket","tiket"],["Kategori","kategori"],["Lokasi","lokasi"],["Isi","isi"],["Status","status"],["Catatan","catatan"]])}>Unduh CSV</button>
  </div>
  {#if pengaduan.length}
    {#each pengaduan as p}
      <div class="baris-kelola tegak">
        <div class="isi">
          <b>{p.kategori} &middot; {p.tiket || p.id}</b>
          <p>{p.isi}</p>
          {#if p.lokasi}<p class="keterangan">{p.lokasi}</p>{/if}
        </div>
        <div class="tindakan">
          <div class="isian">
            <label for="pg-st-{p.id}">Status</label>
            <select id="pg-st-{p.id}" value={isian(p, "status")} onchange={(e) => setIsian(p, "status", e.currentTarget.value)}>
              {#each PILIHAN_STATUS as s}<option value={s.nilai}>{s.label}</option>{/each}
            </select>
          </div>
          <div class="isian">
            <label for="pg-ct-{p.id}">Catatan penanganan</label>
            <textarea
              id="pg-ct-{p.id}"
              value={isian(p, "catatan")}
              oninput={(e) => setIsian(p, "catatan", e.currentTarget.value)}
              placeholder="Sudah diteruskan ke kantor desa, menunggu jadwal perbaikan"
            ></textarea>
            <span class="petunjuk">Terbaca warga di halaman Pengaduan. Tulis apa yang sudah dikerjakan, bukan janji.</span>
          </div>
          <button class="tombol utama" type="button" onclick={() => simpanPengaduan(p)} disabled={sibuk === p.id}>
            {sibuk === p.id ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    {/each}
  {:else}
    <p class="kosong">Tidak ada pengaduan yang cocok dengan saringan ini.</p>
  {/if}
</section>

<section class="blok">
  <div class="kepala-bagian">
    <h2>Pengajuan surat</h2>
    <button class="tombol" type="button" onclick={() => ekspor("pengajuan-surat", surat, [["Antrean","antrean"],["Jenis","jenis"],["Nama","nama"],["RT","rt"],["Alamat","alamat"],["Keperluan","keperluan"],["Kontak","wa"],["Status","status"]])}>Unduh CSV</button>
  </div>
  {#if surat.length}
    {#each surat as x}
      <div class="baris-kelola tegak">
        <div class="isi">
          <b>{x.jenis} &middot; <span class="mono">{x.antrean || x.id}</span></b>
          <p>{x.nama} &middot; {x.alamat || "-"} {x.rt || ""}</p>
          {#if x.keperluan}<p class="keterangan">Keperluan: {x.keperluan}</p>{/if}
          <p><Lencana status={x.status} /></p>
        </div>
        <div class="tindakan">
          <div class="isian">
            <label for="sr-st-{x.id}">Status</label>
            <select id="sr-st-{x.id}" value={isian(x, "status")} onchange={(e) => setIsian(x, "status", e.currentTarget.value)}>
              {#each PILIHAN_STATUS as s}<option value={s.nilai}>{s.label}</option>{/each}
            </select>
          </div>
          <button class="tombol utama" type="button" onclick={() => simpanSurat(x)} disabled={sibuk === x.id}>
            {sibuk === x.id ? "Menyimpan..." : "Simpan status"}
          </button>
        </div>
      </div>
    {/each}
    <p class="verifikasi">
      Nomor induk kependudukan tidak ditampilkan di daftar ini dan tidak ikut terunduh,
      walau Anda berhak membukanya. Isinya hanya dibuka di konsol basis data saat surat
      benar-benar dibuat, supaya tidak terpampang di layar yang bisa terlihat orang lain.
    </p>
  {:else}
    <p class="kosong">Tidak ada pengajuan yang cocok dengan saringan ini.</p>
  {/if}
</section>

<section class="blok">
  <div class="kepala-bagian">
    <h2>Permohonan pinjam fasilitas</h2>
    <button class="tombol" type="button" onclick={() => ekspor("pinjam-fasilitas", reservasi, [["Fasilitas","fasilitas"],["Tanggal","tanggal"],["Jam","jam"],["Acara","acara"],["Nama","nama"],["Kontak","wa"],["Status","status"]])}>Unduh CSV</button>
  </div>
  {#if reservasi.length}
    {#each reservasi as r}
      <div class="baris-kelola">
        <div class="isi">
          <b>{r.fasilitas}</b>
          <p>{r.tanggal} &middot; {r.jam || "-"} &middot; {r.acara || "-"}</p>
          <p>{r.nama}{r.wa ? " · " + r.wa : ""} <Lencana status={r.status} /></p>
        </div>
        <div></div>
        <div class="baris-tombol">
          {#if (r.status || STATUS.BARU) === STATUS.BARU}
            <button class="tombol utama" type="button" onclick={() => setujuiPinjam(r)} disabled={sibuk === r.id}>Setujui &amp; kunci tanggal</button>
            <button class="tombol" type="button" onclick={() => tolakPinjam(r)} disabled={sibuk === r.id}>Tolak</button>
          {:else}
            <span class="keterangan">sudah diputuskan</span>
          {/if}
        </div>
      </div>
    {/each}
    <p class="verifikasi">
      Menyetujui permohonan langsung mengunci tanggalnya di kalender ketersediaan yang dilihat warga.
      Menolak tidak mengunci apa pun, jadi tanggal itu tetap terbuka untuk warga lain.
    </p>
  {:else}
    <p class="kosong">Tidak ada permohonan yang cocok dengan saringan ini.</p>
  {/if}
</section>

<section class="blok">
  <div class="kepala-bagian">
    <h2>Usaha mendaftar</h2>
    <button class="tombol" type="button" onclick={() => ekspor("usaha-mendaftar", usaha, [["Nama usaha","nama"],["Pemilik","pemilik"],["Jenis","jenis"],["Produk","produk"],["Alamat","alamat"],["Kontak","wa"],["Status","status"]])}>Unduh CSV</button>
  </div>
  {#if usaha.length}
    {#each usaha as u}
      <div class="baris-kelola">
        <div class="isi">
          <b>{u.nama}</b>
          <p>{u.pemilik} &middot; {u.jenis}</p>
          <p>{u.produk || ""} <Lencana status={u.status} /></p>
        </div>
        <div></div>
        <div class="baris-tombol">
          {#if (u.status || STATUS.BARU) === STATUS.BARU}
            <button class="tombol utama" type="button" onclick={() => keKatalog(u)} disabled={sibuk === u.id}>Tampilkan di katalog</button>
            <button class="tombol" type="button" onclick={() => tolakUsaha(u)} disabled={sibuk === u.id}>Tolak</button>
          {:else}
            <span class="keterangan">sudah diputuskan</span>
          {/if}
        </div>
      </div>
    {/each}
    <p class="verifikasi">Menekan tombol itu menyalin keterangannya ke katalog usaha yang terbuka untuk warga.</p>
  {:else}
    <p class="kosong">Tidak ada pendaftaran yang cocok dengan saringan ini.</p>
  {/if}
</section>
