<script>
  /**
   * Rangka situs.
   *
   * Berkas ini hanya memilih halaman mana yang ditampilkan. Isi tiap
   * halaman ada di src/halaman/. Kalau ingin mengubah satu halaman,
   * buka berkasnya langsung -- tidak perlu menyentuh berkas ini.
   */
  import { onMount } from "svelte";
  import { mulaiRute, rute } from "./lib/rute.svelte.js";
  import { mulaiPantauan, pengurus, sesi } from "./lib/keadaan.svelte.js";
  import { terapkanGaya } from "./lib/gaya.js";

  import Kepala from "./komponen/Kepala.svelte";
  import Kaki from "./komponen/Kaki.svelte";
  import PesanSingkat from "./komponen/Pesan.svelte";

  import Beranda from "./halaman/Beranda.svelte";
  import Profil from "./halaman/Profil.svelte";
  import Pengurus from "./halaman/Pengurus.svelte";
  import PetaWilayah from "./halaman/PetaWilayah.svelte";
  import Surat from "./halaman/Surat.svelte";
  import SuratBorang from "./halaman/SuratBorang.svelte";
  import SuratCetak from "./halaman/SuratCetak.svelte";
  import Pengaduan from "./halaman/Pengaduan.svelte";
  import Reservasi from "./halaman/Reservasi.svelte";
  import Kependudukan from "./halaman/Kependudukan.svelte";
  import Berita from "./halaman/Berita.svelte";
  import BeritaRinci from "./halaman/BeritaRinci.svelte";
  import Kalender from "./halaman/Kalender.svelte";
  import Galeri from "./halaman/Galeri.svelte";
  import Forum from "./halaman/Forum.svelte";
  import Kas from "./halaman/Kas.svelte";
  import Program from "./halaman/Program.svelte";
  import Umkm from "./halaman/Umkm.svelte";
  import UmkmRinci from "./halaman/UmkmRinci.svelte";
  import DaftarUsaha from "./halaman/DaftarUsaha.svelte";
  import Bansos from "./halaman/Bansos.svelte";
  import Tautan from "./halaman/Tautan.svelte";
  import Kontak from "./halaman/Kontak.svelte";
  import Masuk from "./halaman/Masuk.svelte";
  import Akun from "./halaman/Akun.svelte";
  import Cari from "./halaman/Cari.svelte";
  import TidakAda from "./halaman/TidakAda.svelte";
  import Kelola from "./halaman/kelola/Kelola.svelte";

  onMount(() => {
    terapkanGaya(null);
    mulaiRute();
    mulaiPantauan();
  });

  /** Halaman satu bagian, misalnya /berita. */
  const halaman = {
    "": Beranda,
    profil: Profil,
    pengurus: Pengurus,
    peta: PetaWilayah,
    surat: Surat,
    pengaduan: Pengaduan,
    reservasi: Reservasi,
    kependudukan: Kependudukan,
    berita: Berita,
    kalender: Kalender,
    galeri: Galeri,
    forum: Forum,
    kas: Kas,
    program: Program,
    umkm: Umkm,
    "daftar-usaha": DaftarUsaha,
    bansos: Bansos,
    tautan: Tautan,
    kontak: Kontak,
    masuk: Masuk,
    akun: Akun,
    cari: Cari,
    kelola: Kelola
  };

  const pilihan = $derived.by(() => {
    const [satu, dua, tiga] = rute.bagian;

    if (satu === "surat" && tiga === "cetak") return { komponen: SuratCetak, kunci: dua };
    if (satu === "surat" && dua) return { komponen: SuratBorang, kunci: dua };
    if (satu === "berita" && dua) return { komponen: BeritaRinci, kunci: dua };
    if (satu === "umkm" && dua) return { komponen: UmkmRinci, kunci: dua };

    const K = halaman[satu || ""];
    return K ? { komponen: K, kunci: null } : { komponen: TidakAda, kunci: null };
  });
</script>

<a class="lompat" href="#utama">Lompat ke isi</a>

<Kepala />

<main id="utama">
  <div class="wadah">
    {#key rute.jalur}
      <pilihan.komponen kunci={pilihan.kunci} />
    {/key}
  </div>
</main>

<Kaki />
<PesanSingkat />
