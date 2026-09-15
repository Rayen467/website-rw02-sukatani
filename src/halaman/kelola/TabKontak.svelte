<script>
  import { KONTEN } from "../../inti/nama.js";
  import { konten, muatKonten } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { simpanKonten } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";

  const AWAL = {
    heroJudul: "Hubungi Kami",
    heroSubjudul: "Kami Siap Melayani Warga RW 02",
    heroTeks: "Sampaikan pertanyaan, saran, atau kebutuhan Anda. Bersama kita wujudkan Sukatani yang lebih baik, guyub, maju, dan sejahtera.",
    heroKutipan: "Warga Bersuara, RW Bergerak",
    alamat: "Perum Pondok Sukatani Permai, RW 02, Kel. Sukatani, Kec. Rajeg, Kab. Tangerang, Banten 15540",
    jamSeninJumat: "08.00 – 16.00 WIB",
    jamSabtu: "08.00 – 12.00 WIB",
    email: "",
    sekretaris: "",
    posKeamanan: "",
    ketuaRW: "",
    ambulans: "",
    bendahara: "",
    kebersihan: "",
    namaTitik: "Sekretariat RW 02",
    koordinat: "",
    petaBatas: "",
    gambarPeta: "",
    iuranNominal: "",
    iuranJatuhTempo: "",
    iuranSetor: ""
  };

  let data = $state({ ...AWAL });
  let sibuk = $state(false);

  $effect(() => {
    const sumber = konten(KONTEN.KONTAK);
    if (sumber) data = { ...AWAL, ...sumber };
  });

  async function simpan(e) {
    e.preventDefault();
    sibuk = true;
    try {
      /* KONTEN.KONTAK juga dipakai modul lain (peta, profil, iuran).
         Selalu gabungkan nilai lama agar editor halaman Kontak tidak
         menghapus field yang dikelola modul lain. */
      const lama = konten(KONTEN.KONTAK) || {};
      await simpanKonten(KONTEN.KONTAK, { ...lama, ...data });
      await muatKonten(KONTEN.KONTAK);
      beriTahu("Tersimpan. Halaman Kontak sudah diperbarui.");
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      sibuk = false;
    }
  }
</script>

<section class="blok">
  <div class="kepala-bagian">
    <div>
      <h2>Kelola halaman Kontak</h2>
      <p>Informasi yang dilihat warga saat mencari sekretariat, jam layanan, dan jalur komunikasi RW 02.</p>
    </div>
    <a class="tombol" href="#/kontak" target="_blank" rel="noopener noreferrer">Lihat halaman ↗</a>
  </div>

  <div class="catatan" style="margin-bottom:18px">
    <b>Satu sumber data untuk beberapa bagian situs.</b> Alamat, kontak, jam pelayanan, dan nomor penting di sini juga dapat dipakai oleh Peta, Profil, serta layanan terkait. Jangan isi nomor yang belum diizinkan untuk dipublikasikan.
  </div>

  <form class="isian-borang" onsubmit={simpan}>
    <div class="wide" style="grid-column:1/-1"><div class="kepala-bagian"><h3>Tampilan utama</h3></div></div>
    <div class="isian"><label for="kt-hero-judul">Judul utama</label><input id="kt-hero-judul" bind:value={data.heroJudul} /></div>
    <div class="isian"><label for="kt-hero-sub">Subjudul</label><input id="kt-hero-sub" bind:value={data.heroSubjudul} /></div>
    <div class="isian wide"><label for="kt-hero-teks">Kalimat pembuka</label><textarea id="kt-hero-teks" bind:value={data.heroTeks}></textarea></div>
    <div class="isian"><label for="kt-hero-kutipan">Kutipan singkat</label><input id="kt-hero-kutipan" bind:value={data.heroKutipan} /></div>

    <div class="wide" style="grid-column:1/-1"><div class="kepala-bagian"><h3>Sekretariat & jam pelayanan</h3></div></div>
    <div class="isian wide"><label for="kt-alamat">Alamat sekretariat</label><textarea id="kt-alamat" bind:value={data.alamat}></textarea></div>
    <div class="isian"><label for="kt-jam1">Senin–Jumat</label><input id="kt-jam1" bind:value={data.jamSeninJumat} /></div>
    <div class="isian"><label for="kt-jam2">Sabtu</label><input id="kt-jam2" bind:value={data.jamSabtu} /></div>
    <div class="isian"><label for="kt-email">Email resmi</label><input id="kt-email" type="email" bind:value={data.email} placeholder="rw02@example.com" /></div>
    <div class="isian"><label for="kt-sekretaris">WhatsApp / kontak sekretariat</label><input id="kt-sekretaris" bind:value={data.sekretaris} inputmode="tel" /></div>

    <div class="wide" style="grid-column:1/-1"><div class="kepala-bagian"><h3>Nomor penting</h3></div></div>
    <div class="isian"><label for="kt-ketua">Ketua RW</label><input id="kt-ketua" bind:value={data.ketuaRW} inputmode="tel" /></div>
    <div class="isian"><label for="kt-keamanan">Pos keamanan</label><input id="kt-keamanan" bind:value={data.posKeamanan} inputmode="tel" /></div>
    <div class="isian"><label for="kt-ambulans">Ambulans / darurat</label><input id="kt-ambulans" bind:value={data.ambulans} inputmode="tel" /></div>
    <div class="isian"><label for="kt-bendahara">Bendahara</label><input id="kt-bendahara" bind:value={data.bendahara} inputmode="tel" /></div>
    <div class="isian"><label for="kt-kebersihan">Kebersihan</label><input id="kt-kebersihan" bind:value={data.kebersihan} inputmode="tel" /></div>

    <div class="wide" style="grid-column:1/-1"><div class="kepala-bagian"><h3>Lokasi</h3></div></div>
    <div class="isian"><label for="kt-titik">Nama titik lokasi</label><input id="kt-titik" bind:value={data.namaTitik} /></div>
    <div class="isian"><label for="kt-koordinat">Koordinat</label><input id="kt-koordinat" bind:value={data.koordinat} placeholder="-6.xxxxxx,106.xxxxxx" /></div>
    <div class="isian wide"><label for="kt-peta">Tautan / data peta batas</label><textarea id="kt-peta" bind:value={data.petaBatas}></textarea><span class="petunjuk">Jangan isi koordinat perkiraan. Gunakan data lapangan yang benar.</span></div>

    <div class="wide" style="grid-column:1/-1"><div class="kepala-bagian"><h3>Informasi iuran yang dipakai situs</h3></div></div>
    <div class="isian"><label for="kt-iuran">Nominal iuran</label><input id="kt-iuran" bind:value={data.iuranNominal} /></div>
    <div class="isian"><label for="kt-jatuh">Jatuh tempo</label><input id="kt-jatuh" bind:value={data.iuranJatuhTempo} /></div>
    <div class="isian"><label for="kt-setor">Cara / tujuan setor</label><input id="kt-setor" bind:value={data.iuranSetor} /></div>

    <div class="wide" style="grid-column:1/-1">
      <div class="baris-tombol">
        <button class="tombol utama" type="submit" disabled={sibuk}>{sibuk ? "Menyimpan..." : "Simpan halaman Kontak"}</button>
        <a class="tombol" href="#/kontak" target="_blank" rel="noopener noreferrer">Pratinjau halaman</a>
      </div>
    </div>
  </form>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Pesan dari halaman Kontak</h2></div>
  <div class="catatan">
    Formulir Kontak masuk ke antrean pengaduan agar tidak membuat kotak masuk terpisah. Buka <a href="#/kelola/kiriman"><b>Layanan masuk</b></a> untuk membaca, memproses, dan menyelesaikan pesan warga.
  </div>
</section>