<script>
  /**
   * Tab Beranda.
   *
   * Seluruh tulisan di halaman depan. Sebelum ini semuanya tertanam di
   * dalam Beranda.svelte, jadi mengganti satu kalimat pun harus lewat kode
   * -- yang bertentangan dengan seluruh alasan halaman Kelola ini ada.
   *
   * Kolomnya disusun dari BERANDA_BAWAAN, bukan ditulis ulang di sini.
   * Artinya menambah satu tulisan baru di beranda cukup dikerjakan di satu
   * tempat: tambahkan kunci di BERANDA_BAWAAN, pakai di Beranda.svelte,
   * dan isiannya muncul sendiri di layar ini.
   */
  import { KONTEN } from "../../inti/nama.js";
  import { BERANDA_BAWAAN } from "../../inti/bawaan.js";
  import { konten, muatKonten } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { simpanKonten } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";

  /* Judul manusiawi tiap kolom, dan mana yang butuh kotak besar. */
  const KOLOM = [
    ["judul", "Judul besar", true],
    ["ringkas", "Kalimat pembuka", true],
    ["alamat", "Alamat yang tampil di bawah judul", false],
    ["judulLayanan", "Judul bagian layanan", false],
    ["layanan1Judul", "Kartu 1 — judul", false],
    ["layanan1Teks", "Kartu 1 — keterangan", true],
    ["layanan2Judul", "Kartu 2 — judul", false],
    ["layanan2Teks", "Kartu 2 — keterangan", true],
    ["layanan3Judul", "Kartu 3 — judul", false],
    ["layanan3Teks", "Kartu 3 — keterangan", true],
    ["judulKas", "Kartu kas — judul", false],
    ["teksKas", "Kartu kas — keterangan", true],
    ["judulProgram", "Kartu program — judul", false],
    ["teksProgram", "Kartu program — keterangan", true]
  ];

  let b = $state({ ...BERANDA_BAWAAN });
  let sibuk = $state(false);

  /* Isi dari server menimpa bawaan begitu sampai. Kolom yang belum pernah
     disimpan tetap memakai naskah bawaan, bukan jadi kosong. */
  $effect(() => {
    const k = konten(KONTEN.BERANDA);
    if (k) b = { ...BERANDA_BAWAAN, ...k };
  });

  async function simpan(e) {
    e.preventDefault();
    sibuk = true;
    try {
      const bersih = {};
      for (const [nama] of KOLOM) bersih[nama] = b[nama];
      await simpanKonten(KONTEN.BERANDA, bersih);
      beriTahu("Tersimpan. Beranda sudah berubah.");
      muatKonten(KONTEN.BERANDA);
    } catch (err) {
      beriTahu(pesanRamah(err));
    }
    sibuk = false;
  }

  function kembalikan() {
    if (!confirm("Kembalikan semua tulisan beranda ke naskah bawaan?\n\nBelum tersimpan sampai Anda menekan Simpan.")) return;
    b = { ...BERANDA_BAWAAN };
    beriTahu("Naskah bawaan dimuat. Tekan Simpan untuk memakainya.");
  }
</script>

<section class="blok">
  <div class="kepala-bagian"><h2>Tulisan di halaman depan</h2></div>

  <div class="catatan" style="margin-bottom:18px">
    <b>Ini yang pertama dibaca warga.</b> Semua tulisan di bawah langsung berubah
    di halaman depan begitu disimpan. Nomor penting, sambutan Ketua RW, berita,
    dan usaha warga diatur di tab lain &mdash; yang di sini hanya tulisan tetapnya.
  </div>

  <form class="isian-borang" onsubmit={simpan}>
    {#each KOLOM as [nama, label, panjang]}
      <div class="isian">
        <label for="br-{nama}">{label}</label>
        {#if panjang}
          <textarea id="br-{nama}" bind:value={b[nama]}></textarea>
        {:else}
          <input id="br-{nama}" bind:value={b[nama]} />
        {/if}
      </div>
    {/each}

    <div class="baris-tombol">
      <button class="tombol utama" type="submit" disabled={sibuk}>
        {sibuk ? "Menyimpan..." : "Simpan beranda"}
      </button>
      <button class="tombol" type="button" onclick={kembalikan}>Kembalikan ke bawaan</button>
    </div>

    <p class="catatan-borang">
      Mengosongkan sebuah kolom membuat bagian itu memakai naskah bawaan lagi,
      bukan tampil kosong. Jadi tidak ada cara membuat beranda kehilangan judulnya.
    </p>
  </form>
</section>
