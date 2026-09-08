<script>
  import { isi } from "../keadaan/isi.svelte.js";
  import { segarkanProfilWarga } from "../keadaan/mulai.js";
  import { beriTahu } from "../keadaan/pesan.svelte.js";
  import { sesi, pengurus } from "../keadaan/sesi.svelte.js";
  import { RT_BAWAAN } from "../inti/bawaan.js";
  import { STATUS } from "../inti/nama.js";
  import { kirimUlangVerifikasi, periksaVerifikasi, siapkanAkun, keluar } from "../sumber/akun.js";
  import { daftarWarga } from "../sumber/data.js";
  import { pesanRamah } from "../sumber/firebase.js";
  import { pergi } from "../keadaan/rute.svelte.js";
  import Lencana from "../komponen/Lencana.svelte";
  import Kosong from "../komponen/Kosong.svelte";

  siapkanAkun();

  let f = $state({ nama: "", blok: "", rt: RT_BAWAAN[0], wa: "" });
  let sibuk = $state(false);
  let sibukVerifikasi = $state(false);

  $effect(() => {
    if (sesi.pengguna && !f.nama) f.nama = sesi.pengguna.nama || "";
  });

  /* Pengurus punya ruang kerja sendiri. Kalau alamat /akun dibuka dari
     bookmark lama, jangan tampilkan dashboard warga kepadanya. */
  $effect(() => {
    if (sesi.siap && pengurus()) pergi("/kelola");
  });

  const surat = $derived(isi.surat || []);
  const reservasi = $derived(isi.reservasi || []);
  const usaha = $derived(isi.usaha_baru || []);

  const total = $derived(surat.length + reservasi.length + usaha.length);
  const menunggu = $derived(
    [...surat, ...reservasi, ...usaha].filter((x) =>
      !x.status || x.status === STATUS.BARU || x.status === STATUS.PROSES
    ).length
  );
  const selesai = $derived(
    [...surat, ...reservasi, ...usaha].filter((x) => x.status === STATUS.SELESAI).length
  );

  const riwayat = $derived([
    ["Pengajuan surat", surat, (x) => ({
      judul: x.jenis,
      ket: "Nomor antrean " + (x.antrean || "-"),
      status: x.status,
      href: "#/surat"
    })],
    ["Permohonan fasilitas", reservasi, (x) => ({
      judul: x.fasilitas,
      ket: (x.tanggal || "-") + (x.acara ? " · " + x.acara : ""),
      status: x.status,
      href: x.fasilitas === "GOR Nurani" ? "#/gor-nurani" : "#/reservasi"
    })],
    ["Pendaftaran UMKM", usaha, (x) => ({
      judul: x.nama,
      ket: x.jenis,
      status: x.status,
      href: "#/daftar-usaha"
    })]
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
    try {
      await kirimUlangVerifikasi();
      beriTahu("Tautan pemastian dikirim ulang.");
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      sibukVerifikasi = false;
    }
  }

  async function cekVerifikasi() {
    if (sibukVerifikasi) return;
    sibukVerifikasi = true;
    try {
      const sudah = await periksaVerifikasi();
      beriTahu(
        sudah
          ? "Email sudah dipastikan."
          : "Email belum dipastikan. Buka tautan di email, lalu periksa lagi."
      );
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      sibukVerifikasi = false;
    }
  }

  async function keluarWarga() {
    await keluar();
    beriTahu("Anda sudah keluar.");
    pergi("/");
  }
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Dashboard Warga</span></nav>

{#if !sesi.siap}
  <p class="catatan" role="status">Memeriksa sesi akun...</p>

{:else if !sesi.pengguna}
  <div class="kepala-halaman">
    <p class="alis">Akses warga</p>
    <h1>Dashboard Warga</h1>
    <p>Masuk untuk melihat status layanan dan riwayat pengajuan milik Anda sendiri.</p>
  </div>

  <div class="kunci">
    <h3>Belum masuk</h3>
    <p>
      Pengunjung tetap dapat membaca informasi publik. Dashboard Warga hanya
      tersedia setelah masuk agar riwayat pribadi tidak terlihat orang lain.
    </p>
    <div class="baris-tombol">
      <button class="tombol utama" type="button" onclick={() => pergi("/masuk")}>Masuk / Daftar</button>
      <a class="tombol" href="#/layanan">Lihat layanan publik</a>
    </div>
  </div>

{:else if pengurus()}
  <div class="catatan">
    <b>Akun ini adalah akun pengurus.</b> Mengarahkan ke Dashboard Petugas...
  </div>

{:else}
  <section class="warga-hero">
    <div>
      <p class="alis">Akses warga</p>
      <h1>Dashboard Warga</h1>
      <p>
        Halo, <b>{sesi.profilWarga?.nama || sesi.pengguna.nama || "Warga"}</b>.
        Dari sini Anda bisa mengajukan layanan dan memantau statusnya sendiri.
      </p>
      <div class="baris-tombol warga-hero-aksi">
        <a class="tombol utama" href="#/layanan">Ajukan layanan</a>
        <button class="tombol" type="button" onclick={keluarWarga}>Keluar</button>
      </div>
    </div>

    <div class="warga-identitas">
      <span class="label-kecil">Warga</span>
      <strong>{sesi.pengguna.email}</strong>
      <span>
        {#if sesi.profilWarga}
          {sesi.profilWarga.rt || "RT belum diisi"} · {sesi.profilWarga.blok || "blok belum diisi"}
        {:else}
          Profil warga belum dilengkapi
        {/if}
      </span>
    </div>
  </section>

  {#if !sesi.terverifikasi}
    <div class="catatan awas" style="margin-bottom:22px">
      <b>Email belum dipastikan.</b> Gunakan tautan pemastian untuk <b>{sesi.pengguna.email}</b>.
      Pengajuan surat, reservasi, polling, dan pendaftaran warga memerlukan email yang sudah dipastikan.
      <div class="baris-tombol" style="margin-top:12px">
        <button class="tombol utama" type="button" onclick={cekVerifikasi} disabled={sibukVerifikasi}>
          {sibukVerifikasi ? "Memproses..." : "Saya sudah verifikasi"}
        </button>
        <button class="tombol" type="button" onclick={kirimUlang} disabled={sibukVerifikasi}>
          Kirim ulang tautan
        </button>
      </div>
    </div>
  {/if}

  {#if sesi.terverifikasi && !sesi.profilWarga}
    <section class="blok">
      <div class="kepala-bagian">
        <div>
          <p class="alis">Langkah awal</p>
          <h2>Lengkapi profil warga</h2>
        </div>
      </div>
      <div class="catatan" style="margin-bottom:18px">
        <b>Cukup sekali.</b> Profil ini dipakai untuk mencocokkan akun dengan warga RW 02
        dan membantu mengisi layanan berikutnya.
      </div>
      <form class="isian-borang" onsubmit={daftar}>
        <div class="isian">
          <label for="w-nama">Nama lengkap</label>
          <input id="w-nama" bind:value={f.nama} required />
        </div>
        <div class="isian">
          <label for="w-blok">Blok dan nomor rumah</label>
          <input id="w-blok" bind:value={f.blok} placeholder="C 12" />
        </div>
        <div class="isian">
          <label for="w-rt">RT</label>
          <select id="w-rt" bind:value={f.rt}>
            {#each RT_BAWAAN as r}<option>{r}</option>{/each}
          </select>
        </div>
        <div class="isian">
          <label for="w-wa">Nomor WhatsApp</label>
          <input id="w-wa" bind:value={f.wa} inputmode="tel" />
          <span class="petunjuk">
            Dipakai pengurus untuk mengabari hasil pengajuan. Tidak ditampilkan ke publik.
          </span>
        </div>
        <div>
          <button class="tombol utama" type="submit" disabled={sibuk}>
            {sibuk ? "Menyimpan..." : "Simpan profil warga"}
          </button>
        </div>
      </form>
    </section>

  {:else if sesi.profilWarga}
    <section class="blok">
      <div class="deret-angka warga-ringkasan">
        <div class="angka">
          <span class="label">Semua pengajuan</span>
          <span class="besar">{total}</span>
          <span class="bawah">tercatat di akun ini</span>
        </div>
        <div class="angka">
          <span class="label">Menunggu / diproses</span>
          <span class="besar">{menunggu}</span>
          <span class="bawah">masih berjalan</span>
        </div>
        <div class="angka">
          <span class="label">Selesai</span>
          <span class="besar">{selesai}</span>
          <span class="bawah">sudah dituntaskan</span>
        </div>
        <div class="angka">
          <span class="label">Status warga</span>
          <span class="besar warga-status-besar">{sesi.profilWarga.status === STATUS.AKTIF ? "Aktif" : "Menunggu"}</span>
          <span class="bawah">verifikasi pengurus</span>
        </div>
      </div>
    </section>

    <section class="blok">
      <div class="kepala-bagian">
        <div>
          <p class="alis">Akses cepat</p>
          <h2>Layanan untuk warga</h2>
        </div>
      </div>

      <div class="petak petak-3 warga-menu">
        <a class="kartu tindakan" href="#/surat">
          <p class="alis">Administrasi</p>
          <h3>Pengajuan Surat</h3>
          <p>KTP/KK, domisili, SKCK, tidak mampu, penghasilan, dan surat lainnya.</p>
          <span class="tombol utama">Ajukan surat</span>
        </a>

        <a class="kartu tindakan" href="#/pengaduan">
          <p class="alis">Lingkungan</p>
          <h3>Pengaduan & Aspirasi</h3>
          <p>Sampaikan masalah kebersihan, keamanan, fasilitas umum, atau usulan warga.</p>
          <span class="tombol">Buat laporan</span>
        </a>

        <a class="kartu tindakan" href="#/gor-nurani">
          <p class="alis">Fasilitas</p>
          <h3>Peminjaman GOR</h3>
          <p>Cek jadwal, tarif, dan ajukan pemakaian GOR Nurani secara online.</p>
          <span class="tombol">Buka GOR</span>
        </a>

        <a class="kartu tindakan" href="#/reservasi">
          <p class="alis">Fasilitas RW</p>
          <h3>Reservasi Fasilitas</h3>
          <p>Ajukan balai warga, kursi, tenda, pengeras suara, dan fasilitas lainnya.</p>
          <span class="tombol">Cek fasilitas</span>
        </a>

        <a class="kartu tindakan" href="#/daftar-usaha">
          <p class="alis">UMKM warga</p>
          <h3>Daftarkan Usaha</h3>
          <p>Ajukan usaha untuk ditinjau pengurus dan masuk ke direktori UMKM RW.</p>
          <span class="tombol">Daftar UMKM</span>
        </a>

        <a class="kartu tindakan" href="#/forum">
          <p class="alis">Partisipasi</p>
          <h3>Polling Warga</h3>
          <p>Ikut survei atau musyawarah online yang sedang dibuka pengurus.</p>
          <span class="tombol">Buka polling</span>
        </a>
      </div>
    </section>

    <section class="blok">
      <div class="kepala-bagian">
        <div>
          <p class="alis">Profil saya</p>
          <h2>Identitas warga</h2>
        </div>
        <Lencana status={sesi.profilWarga.status} />
      </div>

      <div class="kartu warga-profil">
        <div><span>Nama</span><b>{sesi.profilWarga.nama || "-"}</b></div>
        <div><span>Email</span><b>{sesi.pengguna.email}</b></div>
        <div><span>RT</span><b>{sesi.profilWarga.rt || "-"}</b></div>
        <div><span>Blok / rumah</span><b>{sesi.profilWarga.blok || "-"}</b></div>
        <div><span>WhatsApp</span><b>{sesi.profilWarga.wa || "-"}</b></div>
      </div>

      {#if sesi.profilWarga.status === STATUS.BARU}
        <p class="verifikasi">
          Profil ini masih menunggu pencocokan oleh pengurus. Anda tetap dapat menggunakan layanan warga.
        </p>
      {/if}
    </section>

    {#each riwayat as bagian}
      <section class="blok">
        <div class="kepala-bagian">
          <h2>{bagian[0]}</h2>
          <a class="tombol" href={bagian[0] === "Pengajuan surat" ? "#/surat" : bagian[0] === "Permohonan fasilitas" ? "#/reservasi" : "#/daftar-usaha"}>
            Buka layanan
          </a>
        </div>

        {#if bagian[1].length}
          <div class="warga-riwayat">
            {#each bagian[1] as x}
              {@const b = bagian[2](x)}
              <a class="warga-riwayat-item" href={b.href}>
                <div>
                  <h3>{b.judul || "-"}</h3>
                  <p>{b.ket}</p>
                </div>
                <Lencana status={b.status} />
              </a>
            {/each}
          </div>
        {:else}
          <Kosong
            judul="Belum ada"
            ket="Pengajuan yang Anda kirim akan tercatat di sini beserta statusnya."
          />
        {/if}
      </section>
    {/each}

    <p class="verifikasi">
      Dashboard ini hanya memuat data milik akun Anda. Warga tidak dapat melihat dashboard warga lain,
      dan menu Dashboard Petugas hanya tersedia untuk akun pengurus.
    </p>
  {/if}
{/if}
