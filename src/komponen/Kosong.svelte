<script>
  /**
   * Keadaan kosong: yang dilihat warga ketika sebuah halaman belum ada isinya.
   *
   * INI HALAMAN YANG PALING SERING DILIHAT DI AWAL, DAN DULU YANG PALING
   * BURUK. Bentuknya kotak bergaris putus-putus dengan satu kalimat abu di
   * tengah -- persis penanda "belum jadi" yang dipakai perancang saat
   * membuat rangka. Enam halaman tampil begitu, dan itulah yang akan
   * dilihat pengurus dan warga pada hari pertama situs dibuka.
   *
   * Kalimatnya juga buntu: "Belum ada pengumuman yang diterbitkan" memberi
   * tahu keadaan tanpa memberi tahu apa pun yang bisa dikerjakan.
   *
   * Sekarang tiga hal selalu ada:
   *   1. APA yang akan muncul di sini, supaya warga tahu halaman ini bukan
   *      rusak melainkan memang belum diisi.
   *   2. SIAPA yang mengisinya, supaya warga tahu harus menunggu siapa.
   *   3. Bagi pengurus yang sedang masuk: TOMBOL langsung ke tab yang tepat
   *      di halaman Kelola. Tidak perlu mencari sendiri tab mana.
   *
   * Bentuknya bukan lagi kotak putus-putus, melainkan bidang bergaris tepi
   * penuh dengan garis aksen di kiri -- sama seperti bagian lain di situs
   * ini. Keadaan kosong adalah keadaan yang sah, bukan kerusakan, dan
   * tampilannya harus mengatakan itu.
   */
  import { pengurus } from "../keadaan/sesi.svelte.js";

  let {
    /** Judul singkat, misalnya "Belum ada pengumuman". */
    judul,
    /** Satu kalimat: apa yang akan muncul di sini kalau sudah diisi. */
    ket = "",
    /** Tab Kelola yang mengisinya, misalnya "terbit". Kosong = tanpa tombol. */
    tab = "",
    /** Tulisan tombolnya, misalnya "Terbitkan pengumuman". */
    aksi = ""
  } = $props();
</script>

<div class="kosong">
  <p class="kosong-judul">{judul}</p>
  {#if ket}<p class="kosong-ket">{ket}</p>{/if}

  {#if tab && pengurus()}
    <a class="tombol utama kosong-tombol" href="#/kelola/{tab}">{aksi || "Isi sekarang"}</a>
  {:else if tab}
    <p class="kosong-siapa">Diisi pengurus RW lewat halaman Kelola.</p>
  {/if}
</div>
