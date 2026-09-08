<script>
  import { STATUS } from "../../inti/nama.js";
  import { isi } from "../../keadaan/isi.svelte.js";
  import { sesi, namaPeran } from "../../keadaan/sesi.svelte.js";
  import Lencana from "../../komponen/Lencana.svelte";

  const pengaduan = $derived(isi.pengaduan || []);
  const surat = $derived(isi.surat || []);
  const reservasi = $derived(isi.reservasi || []);
  const usaha = $derived(isi.usaha_baru || []);
  const warga = $derived(isi.warga || []);

  const baru = (daftar) => daftar.filter((x) => (x.status || STATUS.BARU) === STATUS.BARU);
  const diproses = (daftar) => daftar.filter((x) => x.status === STATUS.PROSES);

  const nPengaduan = $derived(baru(pengaduan).length);
  const nSurat = $derived(baru(surat).length);
  const nReservasi = $derived(baru(reservasi).length);
  const nUsaha = $derived(baru(usaha).length);
  const nWarga = $derived(warga.filter((x) => x.status === STATUS.BARU).length);
  const totalTugas = $derived(nPengaduan + nSurat + nReservasi + nUsaha + nWarga);

  const antrean = $derived([
    ...baru(pengaduan).slice(0, 3).map((x) => ({
      jenis: "Pengaduan",
      judul: x.kategori || "Pengaduan warga",
      rincian: x.tiket || x.lokasi || "Laporan baru",
      status: x.status || STATUS.BARU,
      href: "#/kelola/kiriman"
    })),
    ...baru(surat).slice(0, 3).map((x) => ({
      jenis: "Surat",
      judul: x.jenis || "Pengajuan surat",
      rincian: (x.nama || "Warga") + (x.antrean ? " · " + x.antrean : ""),
      status: x.status || STATUS.BARU,
      href: "#/kelola/kiriman"
    })),
    ...baru(reservasi).slice(0, 3).map((x) => ({
      jenis: "Reservasi",
      judul: x.fasilitas || "Peminjaman fasilitas",
      rincian: (x.tanggal || "-") + (x.nama ? " · " + x.nama : ""),
      status: x.status || STATUS.BARU,
      href: "#/kelola/kiriman"
    })),
    ...baru(usaha).slice(0, 3).map((x) => ({
      jenis: "UMKM",
      judul: x.nama || "Pendaftaran usaha",
      rincian: x.jenis || "Usaha warga",
      status: x.status || STATUS.BARU,
      href: "#/kelola/kiriman"
    })),
    ...warga.filter((x) => x.status === STATUS.BARU).slice(0, 3).map((x) => ({
      jenis: "Warga",
      judul: x.nama || "Warga baru",
      rincian: (x.rt || "-") + (x.blok ? " · " + x.blok : ""),
      status: STATUS.BARU,
      href: "#/kelola/orang"
    }))
  ].slice(0, 8));

  const sedangDiproses = $derived(
    diproses(pengaduan).length +
    diproses(surat).length +
    diproses(reservasi).length +
    diproses(usaha).length
  );
</script>

<section class="petugas-hero">
  <div>
    <p class="alis">Pusat kerja pengurus</p>
    <h1>Dashboard Petugas</h1>
    <p>
      Semua tugas warga yang perlu ditangani dikumpulkan di sini.
      Petugas tidak perlu membuka Firebase untuk pekerjaan harian.
    </p>
  </div>
  <div class="petugas-identitas">
    <span class="label-kecil">{namaPeran()}</span>
    <strong>{sesi.pengguna?.email || "-"}</strong>
    <span>{totalTugas} tugas menunggu · {sedangDiproses} sedang diproses</span>
  </div>
</section>

<section class="blok">
  <div class="deret-angka petugas-ringkasan">
    <a class="angka" href="#/kelola/kiriman">
      <span class="label">Pengaduan</span>
      <span class="besar">{nPengaduan}</span>
      <span class="bawah">perlu ditangani</span>
    </a>
    <a class="angka" href="#/kelola/kiriman">
      <span class="label">Pengajuan surat</span>
      <span class="besar">{nSurat}</span>
      <span class="bawah">menunggu proses</span>
    </a>
    <a class="angka" href="#/kelola/kiriman">
      <span class="label">Reservasi</span>
      <span class="besar">{nReservasi}</span>
      <span class="bawah">menunggu keputusan</span>
    </a>
    <a class="angka" href="#/kelola/kiriman">
      <span class="label">Pendaftaran UMKM</span>
      <span class="besar">{nUsaha}</span>
      <span class="bawah">belum ditinjau</span>
    </a>
    <a class="angka" href="#/kelola/orang">
      <span class="label">Warga baru</span>
      <span class="besar">{nWarga}</span>
      <span class="bawah">menunggu verifikasi</span>
    </a>
  </div>
</section>

<section class="blok">
  <div class="kepala-bagian">
    <div>
      <p class="alis">Prioritas</p>
      <h2>Yang perlu dikerjakan sekarang</h2>
    </div>
    <a class="tombol utama" href="#/kelola/kiriman">Buka semua kiriman</a>
  </div>

  {#if antrean.length}
    <div class="petugas-antrean">
      {#each antrean as x}
        <a class="petugas-tugas" href={x.href}>
          <div>
            <span class="label-kecil">{x.jenis}</span>
            <h3>{x.judul}</h3>
            <p>{x.rincian}</p>
          </div>
          <Lencana status={x.status} />
        </a>
      {/each}
    </div>
  {:else}
    <div class="catatan">
      <b>Tidak ada tugas baru.</b> Semua kiriman warga yang masuk sudah ditangani atau sedang diproses.
    </div>
  {/if}
</section>

<section class="blok">
  <div class="kepala-bagian">
    <div>
      <p class="alis">Akses cepat</p>
      <h2>Menu kerja petugas</h2>
    </div>
  </div>

  <div class="petak petak-3 petugas-menu">
    <a class="kartu tindakan" href="#/kelola/kiriman">
      <p class="alis">Operasional</p>
      <h3>Kiriman warga</h3>
      <p>Pengaduan, surat, reservasi fasilitas, dan pendaftaran UMKM.</p>
      <span class="tombol utama">Buka kiriman</span>
    </a>

    <a class="kartu tindakan" href="#/kelola/orang">
      <p class="alis">Data warga</p>
      <h3>Warga & pengurus</h3>
      <p>Verifikasi warga baru dan atur akun petugas atau admin.</p>
      <span class="tombol">Kelola akun</span>
    </a>

    <a class="kartu tindakan" href="#/kelola/layanan">
      <p class="alis">Fasilitas</p>
      <h3>Layanan & fasilitas</h3>
      <p>Jenis surat, GOR, fasilitas umum, dan jadwal rutin.</p>
      <span class="tombol">Kelola layanan</span>
    </a>

    <a class="kartu tindakan" href="#/kelola/terbit">
      <p class="alis">Informasi</p>
      <h3>Berita & galeri</h3>
      <p>Publikasikan pengumuman, agenda, dokumentasi, dan informasi penting.</p>
      <span class="tombol">Kelola informasi</span>
    </a>

    <a class="kartu tindakan" href="#/kelola/angka">
      <p class="alis">Transparansi</p>
      <h3>Kas & program</h3>
      <p>Catat kas RW, program kerja, realisasi, dan data bantuan sosial.</p>
      <span class="tombol">Kelola laporan</span>
    </a>

    <a class="kartu tindakan" href="#/kelola/profil">
      <p class="alis">Identitas situs</p>
      <h3>Profil & kelembagaan</h3>
      <p>Profil RW, struktur, Majelis Taklim, GOR Nurani, dan data wilayah.</p>
      <span class="tombol">Kelola profil</span>
    </a>
  </div>
</section>

<section class="blok">
  <div class="catatan">
    <b>Catatan akses:</b> Petugas dan Master Admin memiliki hak pengelolaan yang sama di sistem ini.
    Perbedaannya hanya label jabatan yang tampil di layar.
  </div>
</section>
