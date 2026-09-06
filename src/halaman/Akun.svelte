<script>
  import { isi } from "../keadaan/isi.svelte.js";
  import { segarkanProfilWarga } from "../keadaan/mulai.js";
  import { beriTahu } from "../keadaan/pesan.svelte.js";
  import { sesi, pengurus, namaPeran } from "../keadaan/sesi.svelte.js";
  import { RT_BAWAAN } from "../inti/bawaan.js";
  import { kirimUlangVerifikasi, periksaVerifikasi } from "../sumber/akun.js";
  import { daftarWarga } from "../sumber/data.js";
  import { pesanRamah } from "../sumber/firebase.js";
  import { pergi } from "../keadaan/rute.svelte.js";
  import Lencana from "../komponen/Lencana.svelte";

  let f = $state({ nama: "", blok: "", rt: RT_BAWAAN[0], wa: "" });
  let sibuk = $state(false);
  let sibukVerifikasi = $state(false);

  $effect(() => { if (sesi.pengguna && !f.nama) f.nama = sesi.pengguna.nama || ""; });

  const riwayat = $derived([
    ["Pengajuan surat", isi.surat || [], (x) => ({ judul: x.jenis, ket: "Nomor antrean " + (x.antrean || "-"), status: x.status })],
    ["Permohonan pinjam fasilitas", isi.reservasi || [], (x) => ({ judul: x.fasilitas, ket: x.tanggal + (x.acara ? " \u00B7 " + x.acara : ""), status: x.status })],
    ["Pendaftaran usaha", isi.usaha_baru || [], (x) => ({ judul: x.nama, ket: x.jenis, status: x.status })]
  ]);

  async function daftar(e) {
    e.preventDefault();
    sibuk = true;
    try {
      await daftarWarga(f);
      beriTahu("Pendaftaran tersimpan. Menunggu verifikasi pengurus.");
      await segarkanProfilWarga();
    } catch (err) {
      beriTahu(pesanRamah(err));
    }
    sibuk = false;
  }

  async function kirimUlang() {
    if (sibukVerifikasi) return;
    sibukVerifikasi = true;
    try { await kirimUlangVerifikasi(); beriTahu("Tautan pemastian dikirim ulang."); }
    catch (err) { beriTahu(pesanRamah(err)); }
    finally { sibukVerifikasi = false; }
  }

  async function cekVerifikasi() {
    if (sibukVerifikasi) return;
    sibukVerifikasi = true;
    try {
      const sudah = await periksaVerifikasi();
      beriTahu(sudah ? "Email sudah dipastikan." : "Email belum dipastikan. Buka tautan di email, lalu periksa lagi.");
    } catch (err) { beriTahu(pesanRamah(err)); }
    finally { sibukVerifikasi = false; }
  }
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Akun Saya</span></nav>
<div class="kepala-halaman">
  <p class="alis">Akun warga</p>
  <h1>Akun saya</h1>
  <p>Tempat melihat status pengajuan surat, laporan, dan permohonan pinjam yang Anda kirim.</p>
</div>

{#if !sesi.siap}
  <p class="catatan" role="status">Memeriksa sesi akun...</p>
{:else if !sesi.pengguna}
  <div class="kunci">
    <h3>Masuk dulu</h3>
    <p>Dengan akun, Anda bisa melacak sendiri sampai mana pengajuan surat, laporan, dan permohonan pinjam fasilitas yang Anda kirim, tanpa perlu bertanya ke pengurus.</p>
    <div class="baris-tombol"><button class="tombol utama" type="button" onclick={() => pergi("/masuk")}>Masuk atau daftar</button></div>
    <p class="verifikasi">Melaporkan gangguan lewat halaman Pengaduan tetap bisa dilakukan tanpa akun.</p>
  </div>
{:else}
  {#if !sesi.terverifikasi}
    <div class="catatan awas" style="margin-bottom:22px">
      <b>Email belum dipastikan.</b> Gunakan tautan pemastian untuk <b>{sesi.pengguna.email}</b>.
      Buka email itu dan tekan tautannya, lalu pilih Saya sudah verifikasi. Pengajuan surat, pinjaman, dan pendaftaran warga memerlukan email yang sudah dipastikan.
      <div class="baris-tombol" style="margin-top:12px">
        <button class="tombol utama" type="button" onclick={cekVerifikasi} disabled={sibukVerifikasi}>{sibukVerifikasi ? "Memproses..." : "Saya sudah verifikasi"}</button>
        <button class="tombol" type="button" onclick={kirimUlang} disabled={sibukVerifikasi}>Kirim ulang tautan</button>
      </div>
    </div>
  {/if}

  {#if pengurus()}
    <div class="catatan">
      <b>{namaPeran()}</b> — {sesi.pengguna.email}
      <p>Akun Anda terdaftar sebagai pengurus.</p>
      <a class="tombol utama" href="#/kelola">Buka Kelola</a>
    </div>
  {:else if !sesi.terverifikasi}
    <p class="verifikasi">Lengkapi pendaftaran warga setelah email dipastikan.</p>
  {:else if !sesi.profilWarga}
    <div class="catatan" style="margin-bottom:22px">
      <b>Satu langkah lagi.</b> Lengkapi keterangan di bawah supaya pengurus dapat mencocokkan akun Anda dengan daftar warga. Cukup sekali, tidak diminta lagi.
    </div>
    <form class="isian-borang" onsubmit={daftar}>
      <div class="isian"><label for="w-nama">Nama lengkap</label><input id="w-nama" bind:value={f.nama} required /></div>
      <div class="isian"><label for="w-blok">Blok dan nomor rumah</label><input id="w-blok" bind:value={f.blok} placeholder="C 12" /></div>
      <div class="isian"><label for="w-rt">RT</label><select id="w-rt" bind:value={f.rt}>{#each RT_BAWAAN as r}<option>{r}</option>{/each}</select></div>
      <div class="isian">
        <label for="w-wa">Nomor WhatsApp</label>
        <input id="w-wa" bind:value={f.wa} inputmode="tel" />
        <span class="petunjuk">Dipakai pengurus untuk mengabari hasil pengajuan. Tidak ditampilkan di halaman mana pun.</span>
      </div>
      <div><button class="tombol utama" type="submit" disabled={sibuk}>{sibuk ? "Menyimpan..." : "Daftar sebagai warga"}</button></div>
      <p class="catatan-borang">Akun: <b>{sesi.pengguna.email}</b></p>
    </form>
  {:else}
    <section class="blok">
      <div class="kartu">
        <div style="display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;align-items:baseline">
          <h3>{sesi.profilWarga.nama}</h3>
          <Lencana status={sesi.profilWarga.status} />
        </div>
        <div class="tabel-bungkus" style="border:0;background:none">
          <table class="data"><tbody>
            <tr><th>Akun</th><td>{sesi.pengguna.email}</td></tr>
            <tr><th>Blok</th><td>{sesi.profilWarga.blok || "-"}</td></tr>
            <tr><th>RT</th><td>{sesi.profilWarga.rt || "-"}</td></tr>
            <tr><th>WhatsApp</th><td>{sesi.profilWarga.wa || "-"}</td></tr>
          </tbody></table>
        </div>
        {#if sesi.profilWarga.status === "baru"}
          <p class="verifikasi">Pengurus belum mencocokkan akun ini dengan daftar warga. Anda tetap bisa mengirim pengajuan; verifikasi hanya mempercepat penanganannya.</p>
        {/if}
      </div>
    </section>

    {#each riwayat as bagian}
      <section class="blok">
        <div class="kepala-bagian"><h2>{bagian[0]}</h2></div>
        {#if bagian[1].length}
          <div class="tabel-bungkus">
            <table class="data">
              <thead><tr><th>Keterangan</th><th>Rincian</th><th>Status</th></tr></thead>
              <tbody>
                {#each bagian[1] as x}
                  {@const b = bagian[2](x)}
                  <tr><td><b>{b.judul}</b></td><td>{b.ket}</td><td><Lencana status={b.status} /></td></tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <p class="kosong">Belum ada.</p>
        {/if}
      </section>
    {/each}

    <p class="verifikasi">
      Daftar di atas hanya memuat kiriman dari akun ini. Warga lain tidak dapat melihatnya, dan Anda tidak dapat melihat milik warga lain.
    </p>
  {/if}
{/if}
