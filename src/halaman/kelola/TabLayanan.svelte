<script>
  import { isi, muatKoleksi } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { tambahIsi } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";
  import BarisHapus from "../../komponen/BarisHapus.svelte";

  let js = $state({ nama: "", estimasi: "", syarat: "" });
  let fs = $state({ nama: "", kapasitas: "", ket: "" });
  let fu = $state({ nama: "", jenis: "", rt: "" });
  let ru = $state({ kegiatan: "", waktu: "", tempat: "" });
  let sibuk = $state("");

  async function tambah(koleksi, isian, kosongkan) {
    sibuk = koleksi;
    try {
      await tambahIsi(koleksi, isian);
      beriTahu("Tersimpan.");
      kosongkan();
      muatKoleksi(koleksi);
    } catch (err) { beriTahu(pesanRamah(err)); }
    sibuk = "";
  }
</script>

<section class="blok">
  <div class="kepala-bagian"><h2>Jenis surat yang dilayani</h2></div>
  <div class="catatan" style="margin-bottom:18px">
    <b>Menambah jenis surat di sini langsung menambah pilihannya di halaman Pengajuan Surat.</b>
    Warga bisa langsung mengajukannya, dan berkas cetaknya ikut menyesuaikan judul.
  </div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); tambah("jenis_surat", js, () => (js = { nama: "", estimasi: "", syarat: "" })); }}>
    <div class="isian"><label for="js-nama">Nama surat</label><input id="js-nama" bind:value={js.nama} required placeholder="Surat Keterangan Domisili" /></div>
    <div class="isian"><label for="js-estimasi">Perkiraan selesai</label><input id="js-estimasi" bind:value={js.estimasi} placeholder="1 hari kerja" /></div>
    <div class="isian"><label for="js-syarat">Syarat berkas</label><textarea id="js-syarat" bind:value={js.syarat} placeholder="Fotokopi KTP pemohon&#10;Fotokopi Kartu Keluarga"></textarea><span class="petunjuk">Satu syarat per baris.</span></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "jenis_surat"}>Tambahkan</button></div>
  </form>
  {#each isi.jenis_surat || [] as o}
    <BarisHapus koleksi="jenis_surat" id={o.id} judul={o.nama} baris={[o.estimasi || "-", String(o.syarat || "").split("\n").join(" \u00B7 ")]} />
  {/each}
  {#if !(isi.jenis_surat || []).length}
    <p class="verifikasi">Belum ada yang ditambahkan. Selama kosong, halaman publik memakai delapan jenis surat bawaan.</p>
  {/if}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Fasilitas yang bisa dipinjam</h2></div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); tambah("fasilitas", fs, () => (fs = { nama: "", kapasitas: "", ket: "" })); }}>
    <div class="isian"><label for="fs-nama">Nama fasilitas</label><input id="fs-nama" bind:value={fs.nama} required placeholder="Balai Warga" /></div>
    <div class="isian"><label for="fs-kapasitas">Kapasitas</label><input id="fs-kapasitas" bind:value={fs.kapasitas} placeholder="80 orang" /></div>
    <div class="isian"><label for="fs-ket">Keterangan</label><input id="fs-ket" bind:value={fs.ket} /></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "fasilitas"}>Tambahkan</button></div>
  </form>
  {#each isi.fasilitas || [] as o}
    <BarisHapus koleksi="fasilitas" id={o.id} judul={o.nama} baris={[o.kapasitas || "-", o.ket || ""]} />
  {/each}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Fasilitas umum di kawasan</h2></div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); tambah("fasum", fu, () => (fu = { nama: "", jenis: "", rt: "" })); }}>
    <div class="isian"><label for="fu-nama">Nama fasilitas</label><input id="fu-nama" bind:value={fu.nama} required placeholder="Musala" /></div>
    <div class="isian"><label for="fu-jenis">Jenis</label><input id="fu-jenis" bind:value={fu.jenis} placeholder="Ibadah" /></div>
    <div class="isian"><label for="fu-rt">Lokasi</label><input id="fu-rt" bind:value={fu.rt} placeholder="RT 01" /></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "fasum"}>Tambahkan</button></div>
    <p class="catatan-borang">Tampil di tabel halaman Peta Wilayah, di bawah peta.</p>
  </form>
  {#each isi.fasum || [] as o}
    <BarisHapus koleksi="fasum" id={o.id} judul={o.nama} baris={[(o.jenis || "-") + " \u00B7 " + (o.rt || "-")]} />
  {/each}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Kegiatan rutin</h2></div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); tambah("rutin", ru, () => (ru = { kegiatan: "", waktu: "", tempat: "" })); }}>
    <div class="isian"><label for="ru-kegiatan">Kegiatan</label><input id="ru-kegiatan" bind:value={ru.kegiatan} required placeholder="Posyandu balita dan lansia" /></div>
    <div class="isian"><label for="ru-waktu">Waktu</label><input id="ru-waktu" bind:value={ru.waktu} placeholder="Setiap Selasa pertama, 08.00" /></div>
    <div class="isian"><label for="ru-tempat">Tempat</label><input id="ru-tempat" bind:value={ru.tempat} placeholder="Balai warga" /></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "rutin"}>Tambahkan</button></div>
    <p class="catatan-borang">Cukup diisi sekali. Muncul di tabel Kegiatan Rutin pada halaman Kalender, jadi tidak perlu diumumkan berulang tiap bulan.</p>
  </form>
  {#each isi.rutin || [] as o}
    <BarisHapus koleksi="rutin" id={o.id} judul={o.kegiatan} baris={[(o.waktu || "-") + " \u00B7 " + (o.tempat || "-")]} />
  {/each}
</section>
