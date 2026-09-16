<script>
  /** Rangka situs publik, akun, dan Portal Petugas. */
  import { onMount } from "svelte";
  import { mulaiRute, rute } from "./keadaan/rute.svelte.js";
  import { mulaiPantauan } from "./keadaan/mulai.js";
  import { sesi } from "./keadaan/sesi.svelte.js";
  import { terapkanGaya } from "./keadaan/tampilan.js";
  import { mulaiWaktu } from "./keadaan/waktu.svelte.js";

  import Kepala from "./komponen/Kepala.svelte";
  import Kaki from "./komponen/Kaki.svelte";
  import PesanSingkat from "./komponen/Pesan.svelte";
  import PengalihanAkun from "./komponen/PengalihanAkun.svelte";
  import UmkmLokasi from "./komponen/UmkmLokasi.svelte";
  import HalamanTerkelola from "./komponen/HalamanTerkelola.svelte";

  import Beranda from "./halaman/Beranda.svelte";
  import Profil from "./halaman/Profil.svelte";
  import Pengurus from "./halaman/Pengurus.svelte";
  import PetaWilayah from "./halaman/PetaWilayah.svelte";
  import Surat from "./halaman/Surat.svelte";
  import LayananWarga from "./halaman/LayananWarga.svelte";
  import SuratBorang from "./halaman/SuratBorang.svelte";
  import SuratCetak from "./halaman/SuratCetak.svelte";
  import Pengaduan from "./halaman/Pengaduan.svelte";
  import Reservasi from "./halaman/Reservasi.svelte";
  import Kependudukan from "./halaman/Kependudukan.svelte";
  import Berita from "./halaman/Berita.svelte";
  import BeritaRinci from "./halaman/BeritaRinci.svelte";
  import Kalender from "./halaman/Kalender.svelte";
  import Galeri from "./halaman/Galeri.svelte";
  import GaleriBerita from "./halaman/GaleriBerita.svelte";
  import Transparansi from "./halaman/TransparansiLengkap.svelte";
  import Forum from "./halaman/Forum.svelte";
  import Kas from "./halaman/Kas.svelte";
  import Program from "./halaman/Program.svelte";
  import Umkm from "./halaman/Umkm.svelte";
  import UmkmRinci from "./halaman/UmkmRinci.svelte";
  import DaftarUsaha from "./halaman/DaftarUsaha.svelte";
  import Bansos from "./halaman/Bansos.svelte";
  import Tautan from "./halaman/Tautan.svelte";
  import MajelisTaklim from "./halaman/MajelisTaklim.svelte";
  import GorNurani from "./halaman/GorNurani.svelte";
  import Berkas from "./halaman/Berkas.svelte";
  import Kontak from "./halaman/Kontak.svelte";
  import Masuk from "./halaman/Masuk.svelte";
  import Akun from "./halaman/Akun.svelte";
  import KeamananAkun from "./halaman/KeamananAkun.svelte";
  import Cari from "./halaman/Cari.svelte";
  import TidakAda from "./halaman/TidakAda.svelte";
  import PintuKelola from "./halaman/kelola/Pintu.svelte";

  onMount(() => {
    terapkanGaya(null);
    mulaiRute();
    const berhentiWaktu = mulaiWaktu();
    const berhentiPantauan = mulaiPantauan();
    return () => {
      berhentiWaktu?.();
      berhentiPantauan?.();
    };
  });

  /*
   * Satu rute satu baris sengaja dipertahankan. Selain lebih mudah diaudit
   * manusia, alat audit UI juga membaca registry ini untuk memastikan tautan
   * internal tidak mengarah ke halaman yang tidak ada.
   */
  const halaman = {
    "": Beranda,
    profil: Profil,
    pengurus: Pengurus,
    peta: PetaWilayah,
    layanan: LayananWarga,
    surat: Surat,
    pengaduan: Pengaduan,
    reservasi: Reservasi,
    kependudukan: Kependudukan,
    berita: Berita,
    kalender: Kalender,
    galeri: Galeri,
    "galeri-berita": GaleriBerita,
    transparansi: Transparansi,
    forum: Forum,
    kas: Kas,
    program: Program,
    umkm: Umkm,
    "daftar-usaha": DaftarUsaha,
    bansos: Bansos,
    tautan: Tautan,
    "majelis-taklim": MajelisTaklim,
    "gor-nurani": GorNurani,
    berkas: Berkas,
    kontak: Kontak,
    masuk: Masuk,
    akun: Akun,
    "keamanan-akun": KeamananAkun,
    cari: Cari,
    petugas: PintuKelola,
    kelola: PintuKelola,

    /* Alias lama supaya bookmark/chat lama tidak berubah menjadi 404. */
    "profil-rw": Profil,
    "struktur-pengurus": Pengurus,
    "peta-wilayah": PetaWilayah,
    "layanan-warga": LayananWarga,
    "pengajuan-surat": Surat,
    "pengaduan-warga": Pengaduan,
    "aspirasi-warga": Pengaduan,
    "peminjaman-fasilitas": Reservasi,
    "reservasi-fasilitas": Reservasi,
    "data-warga": Kependudukan,
    "data-kependudukan": Kependudukan,
    "berita-pengumuman": Berita,
    "kalender-kegiatan": Kalender,
    "galeri-foto": Galeri,
    "transparansi-keuangan": Transparansi,
    "kas-rw": Kas,
    "program-rw": Program,
    "umkm-warga": Umkm,
    "pendaftaran-umkm": DaftarUsaha,
    "bantuan-sosial": Bansos,
    "link-penting": Tautan,
    "kontak-lokasi": Kontak,
    "dashboard-warga": Akun
  };

  const CMS_RUTE = Object.freeze({
    "": "beranda",
    profil: "profil",
    layanan: "layanan",
    berita: "berita",
    transparansi: "transparansi",
    umkm: "umkm",
    kontak: "kontak",
    kalender: "kalender",
    galeri: "galeri",
    program: "program",
    kas: "kas",
    bansos: "bansos",
    tautan: "tautan"
  });

  const modePetugas = $derived(rute.bagian[0] === "petugas" || rute.bagian[0] === "kelola");
  const modeMasuk = $derived(rute.bagian[0] === "masuk");

  const pilihan = $derived.by(() => {
    const [satu, dua, tiga] = rute.bagian;
    if (satu === "surat" && tiga === "cetak") return { komponen: SuratCetak, kunci: dua };
    if (satu === "surat" && dua) return { komponen: SuratBorang, kunci: dua };
    if (satu === "berita" && dua) return { komponen: BeritaRinci, kunci: dua };
    if (satu === "umkm" && dua) return { komponen: UmkmRinci, kunci: dua };
    const K = halaman[satu || ""];
    return K ? { komponen: K, kunci: null } : { komponen: TidakAda, kunci: null };
  });

  const cmsHalaman = $derived(pilihan.kunci ? "" : (CMS_RUTE[rute.bagian[0] || ""] || ""));
</script>

<a class="lompat" href="#utama">Lompat ke isi</a>

{#if modePetugas}
  <main id="utama" class="petugas-app-root">
    {#key rute.jalur + ':' + (sesi.pengguna?.uid || '') + ':' + (sesi.peran || '')}
      <pilihan.komponen kunci={pilihan.kunci} />
    {/key}
  </main>
{:else if modeMasuk}
  <main id="utama" class="auth-app-root">
    {#if sesi.siap && sesi.pengguna && sesi.terverifikasi}
      <PengalihanAkun />
    {:else}
      {#key rute.jalur + ':' + (sesi.pengguna?.uid || '') + ':' + (sesi.peran || '')}
        <pilihan.komponen kunci={pilihan.kunci} />
      {/key}
    {/if}
  </main>
{:else}
  <Kepala />
  <main id="utama">
    <div class="wadah">
      {#key rute.jalur + ':' + (sesi.pengguna?.uid || '') + ':' + (sesi.peran || '')}
        <HalamanTerkelola Komponen={pilihan.komponen} kunciRute={pilihan.kunci} halaman={cmsHalaman} />
      {/key}
      {#if rute.bagian[0] === "umkm" && rute.bagian[1]}
        <UmkmLokasi usahaId={rute.bagian[1]} />
      {/if}
    </div>
  </main>
  <Kaki />
{/if}

<PesanSingkat />