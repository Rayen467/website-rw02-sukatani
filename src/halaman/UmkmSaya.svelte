<script>
  import { KOLEKSI, STATUS } from "../inti/nama.js";
  import { JENIS_USAHA } from "../inti/bawaan.js";
  import { isi, muatKoleksi } from "../keadaan/isi.svelte.js";
  import { beriTahu } from "../keadaan/pesan.svelte.js";
  import { sesi, pengurus } from "../keadaan/sesi.svelte.js";
  import { pergi } from "../keadaan/rute.svelte.js";
  import { ubahDokumen } from "../sumber/data.js";
  import { pesanRamah } from "../sumber/firebase.js";

  const kosong = () => ({
    nama: "",
    kat: JENIS_USAHA[0].nilai,
    ringkas: "",
    panjang: "",
    wa: "",
    alamat: "",
    jam: "",
    maps: ""
  });

  let editId = $state("");
  let form = $state(kosong());
  let sibuk = $state(false);

  const hubungan = $derived(Array.isArray(isi.usaha_pemilik) ? isi.usaha_pemilik : []);
  const katalog = $derived(Array.isArray(isi.usaha) ? isi.usaha : []);
  const pendaftaran = $derived(Array.isArray(isi.usaha_baru) ? isi.usaha_baru : []);

  const umkmSaya = $derived.by(() =>
    hubungan
      .map((h) => katalog.find((u) => u.id === (h.usahaId || h.id)))
      .filter(Boolean)
  );

  const menunggu = $derived(
    pendaftaran.filter((x) => !x.status || x.status === STATUS.BARU || x.status === STATUS.PROSES)
  );

  function mulaiEdit(u) {
    editId = u.id;
    form = {
      nama: u.nama || "",
      kat: u.kat || JENIS_USAHA.find((j) => j.label === u.katLabel)?.nilai || JENIS_USAHA[0].nilai,
      ringkas: u.ringkas || "",
      panjang: u.panjang || u.produk || "",
      wa: u.wa || "",
      alamat: u.alamat || "",
      jam: u.jam || "",
      maps: u.maps || ""
    };
    setTimeout(() => document.getElementById("editor-umkm-saya")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function batal() {
    editId = "";
    form = kosong();
  }

  async function simpan(e) {
    e.preventDefault();
    if (!editId || sibuk) return;
    sibuk = true;
    try {
      const jenis = JENIS_USAHA.find((j) => j.nilai === form.kat) || JENIS_USAHA[0];
      await ubahDokumen(KOLEKSI.USAHA, editId, {
        nama: form.nama.trim(),
        kat: jenis.nilai,
        katLabel: jenis.label,
        ringkas: form.ringkas.trim(),
        panjang: form.panjang.trim(),
        wa: form.wa.trim(),
        alamat: form.alamat.trim(),
        jam: form.jam.trim(),
        maps: form.maps.trim()
      });
      await muatKoleksi(KOLEKSI.USAHA);
      beriTahu("Profil UMKM diperbarui dan langsung tampil di direktori warga.");
      batal();
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      sibuk = false;
    }
  }
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><a href="#/akun">Dashboard Warga</a><span>&rsaquo;</span><span>UMKM Saya</span></nav>

{#if !sesi.siap}
  <p class="catatan" role="status">Memeriksa akses UMKM Anda...</p>
{:else if !sesi.pengguna}
  <section class="kunci">
    <h3>Masuk untuk mengelola UMKM</h3>
    <p>Editor UMKM hanya terbuka untuk akun warga yang menjadi pemilik usaha tersebut.</p>
    <button class="tombol utama" type="button" onclick={() => pergi("/masuk")}>Masuk / Daftar</button>
  </section>
{:else if !sesi.terverifikasi}
  <section class="catatan awas">
    <b>Email belum diverifikasi.</b>
    <p>Verifikasi email dulu supaya perubahan profil UMKM dapat disimpan dengan aman.</p>
    <button class="tombol utama" type="button" onclick={() => pergi("/akun")}>Buka Akun Saya</button>
  </section>
{:else if pengurus()}
  <section class="catatan">
    <b>Akun ini adalah akun Petugas.</b> Pengelolaan internal UMKM tetap tersedia di Portal Petugas.
    <div class="baris-tombol" style="margin-top:12px"><button class="tombol utama" type="button" onclick={() => pergi("/kelola/umkm")}>Buka Kelola UMKM</button></div>
  </section>
{:else}
  <section class="umkm-owner-hero">
    <div>
      <p class="alis">Ruang pemilik usaha</p>
      <h1>UMKM Saya</h1>
      <p>Setelah pendaftaran disetujui Petugas, profil usaha menjadi milik akun Anda. Data publik bisa Anda perbarui sendiri tanpa menunggu Petugas mengedit satu per satu.</p>
    </div>
    <a class="tombol" href="#/umkm">Lihat direktori UMKM</a>
  </section>

  {#if umkmSaya.length}
    <section class="blok">
      <div class="kepala-bagian">
        <div><p class="alis">Usaha terhubung</p><h2>Profil yang bisa Anda kelola</h2></div>
        <span class="label">{umkmSaya.length} UMKM</span>
      </div>
      <div class="owner-grid">
        {#each umkmSaya as u}
          <article class="owner-card">
            <div>
              <span>{u.katLabel || "UMKM warga"}</span>
              <h3>{u.nama || "Usaha warga"}</h3>
              <p>{u.ringkas || "Belum ada ringkasan usaha."}</p>
              <small>{u.alamat || "Alamat belum diisi"}{u.jam ? " · " + u.jam : ""}</small>
            </div>
            <div class="baris-tombol">
              <button class="tombol utama" type="button" onclick={() => mulaiEdit(u)}>Edit profil</button>
              <a class="tombol" href={"#/umkm/" + u.id}>Lihat publik</a>
            </div>
          </article>
        {/each}
      </div>
    </section>
  {:else}
    <section class="blok">
      <div class="kepala-bagian"><div><p class="alis">Akses pemilik</p><h2>Belum ada UMKM yang terhubung</h2></div></div>
      {#if menunggu.length}
        <div class="catatan">
          <b>Pendaftaran Anda masih menunggu atau sedang diproses.</b>
          Setelah Petugas menekan Terima &amp; buat profil, akses editor UMKM akan muncul otomatis di halaman ini.
        </div>
      {:else}
        <div class="catatan">
          Belum ada profil usaha milik akun ini. Daftarkan UMKM terlebih dahulu agar Petugas dapat memeriksa dan mengaktifkan profilnya.
        </div>
      {/if}
      <div class="baris-tombol" style="margin-top:14px"><a class="tombol utama" href="#/daftar-usaha">Daftarkan usaha</a></div>
    </section>
  {/if}

  {#if editId}
    <section class="blok owner-editor" id="editor-umkm-saya">
      <div class="kepala-bagian">
        <div>
          <p class="alis">Edit profil publik</p>
          <h2>Perbarui informasi UMKM</h2>
          <p>Perubahan di bagian ini langsung tampil ke warga. Data legalitas, NIB, sertifikat, dan catatan pendampingan tetap berada di area privat Petugas.</p>
        </div>
      </div>

      <form class="isian-borang" onsubmit={simpan}>
        <div class="isian"><label for="own-nama">Nama usaha</label><input id="own-nama" bind:value={form.nama} required maxlength="120" /></div>
        <div class="isian"><label for="own-kat">Kategori</label><select id="own-kat" bind:value={form.kat}>{#each JENIS_USAHA as j}<option value={j.nilai}>{j.label}</option>{/each}</select></div>
        <div class="isian"><label for="own-ringkas">Ringkasan singkat</label><textarea id="own-ringkas" bind:value={form.ringkas} maxlength="400" placeholder="Contoh: katering rumahan untuk harian dan acara warga."></textarea></div>
        <div class="isian"><label for="own-panjang">Produk / layanan dan harga</label><textarea id="own-panjang" bind:value={form.panjang} maxlength="3000" placeholder="Satu produk atau layanan per baris. Harga boleh dicantumkan."></textarea></div>
        <div class="isian"><label for="own-wa">WhatsApp usaha</label><input id="own-wa" bind:value={form.wa} inputmode="tel" maxlength="30" placeholder="08xxxxxxxxxx" /></div>
        <div class="isian"><label for="own-alamat">Alamat usaha</label><input id="own-alamat" bind:value={form.alamat} maxlength="200" placeholder="Blok / nomor rumah / patokan" /></div>
        <div class="isian"><label for="own-jam">Jam operasional</label><input id="own-jam" bind:value={form.jam} maxlength="80" placeholder="Contoh: 08.00 – 20.00" /></div>
        <div class="isian"><label for="own-maps">Tautan Google Maps</label><input id="own-maps" bind:value={form.maps} maxlength="500" placeholder="https://maps.google.com/..." /></div>
        <div class="baris-tombol">
          <button class="tombol utama" type="submit" disabled={sibuk}>{sibuk ? "Menyimpan..." : "Simpan & tayangkan"}</button>
          <button class="tombol" type="button" onclick={batal} disabled={sibuk}>Batal</button>
        </div>
      </form>
    </section>
  {/if}
{/if}

<style>
  .umkm-owner-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:22px;margin-bottom:22px;padding:24px;border:1px solid #dce9e4;border-radius:18px;background:linear-gradient(130deg,#eefaf5,#fff)}
  .umkm-owner-hero h1{margin:4px 0 8px}.umkm-owner-hero p{max-width:780px;margin:0;color:#61736d;line-height:1.65}
  .owner-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.owner-card{display:flex;flex-direction:column;justify-content:space-between;gap:18px;padding:18px;border:1px solid #dfe9e5;border-radius:14px;background:#fbfdfc}.owner-card span{color:#0b765f;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.07em}.owner-card h3{margin:5px 0 6px}.owner-card p{margin:0;color:#687870;line-height:1.55}.owner-card small{display:block;margin-top:9px;color:#7b8984}.owner-editor{scroll-margin-top:90px}
  @media(max-width:760px){.umkm-owner-hero{flex-direction:column}.owner-grid{grid-template-columns:1fr}}
</style>
