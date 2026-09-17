<script>
  import { KOLEKSI } from "../../inti/nama.js";
  import { JENIS_SURAT_BAWAAN } from "../../inti/bawaan.js";
  import { isi, muatKoleksi } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { tambahIsi, simpanDokumen } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";
  import BarisKelola from "../../komponen/BarisKelola.svelte";
  import TabKalender from "./TabKalender.svelte";

  let js = $state({ nama: "", estimasi: "", syarat: "" });
  let fs = $state({ nama: "", kapasitas: "", ket: "" });
  let fu = $state({ nama: "", jenis: "", rt: "", koordinat: "" });
  let ru = $state({ kegiatan: "", waktu: "", tempat: "" });
  let sibuk = $state("");

  function syaratKeTeks(syarat) {
    if (Array.isArray(syarat)) return syarat.filter(Boolean).join("\n");
    return String(syarat || "").trim();
  }

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

  /*
   * Saat koleksi jenis_surat masih kosong, halaman warga memakai daftar
   * bawaan dari kode. Itu nyaman untuk awal, tetapi daftar bawaan tidak dapat
   * diedit dari Portal Petugas karena belum menjadi dokumen Firestore.
   * Tombol ini menyalin delapan layanan bawaan apa adanya ke Firestore.
   * Setelah itu setiap jenis surat (termasuk persyaratannya) dapat diedit
   * bebas melalui BarisKelola di bawah tanpa menyentuh kode.
   */
  async function aktifkanEditorSurat() {
    if ((isi.jenis_surat || []).length) return;
    sibuk = "salin-surat-bawaan";
    try {
      for (const surat of JENIS_SURAT_BAWAAN) {
        await simpanDokumen(
          KOLEKSI.JENIS_SURAT,
          surat.id,
          {
            nama: surat.nama,
            estimasi: surat.estimasi || "",
            syarat: syaratKeTeks(surat.syarat)
          },
          false
        );
      }
      await muatKoleksi(KOLEKSI.JENIS_SURAT);
      beriTahu("Delapan layanan bawaan sudah siap diedit. Persyaratan sekarang bisa dikustom bebas.");
    } catch (err) {
      beriTahu(err.code ? pesanRamah(err) : (err.message || "Gagal menyiapkan editor persyaratan."));
    }
    sibuk = "";
  }
</script>

<section class="blok">
  <div class="kepala-bagian"><h2>Jenis surat & persyaratan</h2></div>
  <div class="catatan" style="margin-bottom:18px">
    <b>Persyaratan benar-benar bisa dikustom.</b> KTP dan Kartu Keluarga boleh tetap menjadi syarat standar, tetapi pengurus bebas menambah, mengganti, atau menghapus syarat lain sesuai keperluan surat — misalnya Buku Nikah, Ijazah, pas foto, surat lahir, surat kematian, bukti usaha, atau dokumen pendukung lainnya. Tulis satu persyaratan per baris.
  </div>

  {#if !(isi.jenis_surat || []).length}
    <div class="catatan" style="margin-bottom:18px">
      Saat ini halaman warga masih memakai delapan layanan bawaan. Supaya persyaratan delapan layanan itu bisa diedit satu per satu, salin dulu daftar bawaan ke editor Portal Petugas.
      <div style="margin-top:12px">
        <button class="tombol utama" type="button" onclick={aktifkanEditorSurat} disabled={sibuk === "salin-surat-bawaan"}>
          {sibuk === "salin-surat-bawaan" ? "Menyiapkan..." : "Aktifkan editor 8 layanan bawaan"}
        </button>
      </div>
    </div>
  {/if}

  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); tambah(KOLEKSI.JENIS_SURAT, js, () => (js = { nama: "", estimasi: "", syarat: "" })); }}>
    <div class="isian"><label for="js-nama">Nama surat</label><input id="js-nama" bind:value={js.nama} required placeholder="Surat Pengantar untuk keperluan ..." /></div>
    <div class="isian"><label for="js-estimasi">Perkiraan selesai</label><input id="js-estimasi" bind:value={js.estimasi} placeholder="1 hari kerja" /></div>
    <div class="isian">
      <label for="js-syarat">Persyaratan custom</label>
      <textarea id="js-syarat" bind:value={js.syarat} placeholder="Fotokopi KTP pemohon&#10;Fotokopi Kartu Keluarga&#10;Fotokopi Buku Nikah&#10;Fotokopi Ijazah"></textarea>
      <span class="petunjuk">Bebas diisi dokumen apa pun. Satu persyaratan per baris; tidak ada daftar yang dikunci sistem.</span>
    </div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === KOLEKSI.JENIS_SURAT}>Tambahkan jenis surat</button></div>
  </form>

  {#each isi.jenis_surat || [] as o}
    <BarisKelola
      koleksi={KOLEKSI.JENIS_SURAT}
      id={o.id}
      judul={o.nama}
      baris={[o.estimasi || "-", syaratKeTeks(o.syarat).split("\n").filter(Boolean).join(" · ")]}
      nilai={{ ...o, syarat: syaratKeTeks(o.syarat) }}
      kolom={[
        { nama: "nama", label: "Nama surat" },
        { nama: "estimasi", label: "Perkiraan waktu" },
        { nama: "syarat", label: "Persyaratan custom — satu per baris", jenis: "panjang" }
      ]}
    />
  {/each}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Fasilitas yang bisa dipinjam</h2></div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); tambah(KOLEKSI.FASILITAS, fs, () => (fs = { nama: "", kapasitas: "", ket: "" })); }}>
    <div class="isian"><label for="fs-nama">Nama fasilitas</label><input id="fs-nama" bind:value={fs.nama} required placeholder="Balai Warga" /></div>
    <div class="isian"><label for="fs-kapasitas">Kapasitas</label><input id="fs-kapasitas" bind:value={fs.kapasitas} placeholder="80 orang" /></div>
    <div class="isian"><label for="fs-ket">Keterangan</label><input id="fs-ket" bind:value={fs.ket} /></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === KOLEKSI.FASILITAS}>Tambahkan</button></div>
  </form>
  {#each isi.fasilitas || [] as o}
    <BarisKelola koleksi={KOLEKSI.FASILITAS} id={o.id} judul={o.nama} baris={[o.kapasitas || "-", o.ket || ""]} nilai={o} kolom={[{ nama: "nama", label: "Nama fasilitas" },{ nama: "kapasitas", label: "Kapasitas" },{ nama: "ket", label: "Keterangan", jenis: "panjang" }]} />
  {/each}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Fasilitas umum di kawasan</h2></div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); tambah(KOLEKSI.FASUM, fu, () => (fu = { nama: "", jenis: "", rt: "", koordinat: "" })); }}>
    <div class="isian"><label for="fu-nama">Nama fasilitas</label><input id="fu-nama" bind:value={fu.nama} required placeholder="Musala" /></div>
    <div class="isian"><label for="fu-jenis">Jenis</label><input id="fu-jenis" bind:value={fu.jenis} placeholder="Ibadah" /></div>
    <div class="isian"><label for="fu-rt">Lokasi</label><input id="fu-rt" bind:value={fu.rt} placeholder="RT 01" /></div>
    <div class="isian"><label for="fu-koordinat">Koordinat peta</label><input id="fu-koordinat" bind:value={fu.koordinat} placeholder="-6.129217,106.497767" /><span class="petunjuk">Opsional. Kalau diisi, fasilitas akan muncul sebagai titik di peta wilayah.</span></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === KOLEKSI.FASUM}>Tambahkan</button></div>
    <p class="catatan-borang">Tampil di tabel halaman Peta Wilayah. Jika koordinat diisi, titiknya juga muncul langsung di peta.</p>
  </form>
  {#each isi.fasum || [] as o}
    <BarisKelola koleksi={KOLEKSI.FASUM} id={o.id} judul={o.nama} baris={[(o.jenis || "-") + " · " + (o.rt || "-")]} nilai={o} kolom={[{ nama: "nama", label: "Nama fasilitas" },{ nama: "jenis", label: "Jenis" },{ nama: "rt", label: "Lokasi" },{ nama: "koordinat", label: "Koordinat peta" }]} />
  {/each}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Kegiatan rutin</h2></div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); tambah(KOLEKSI.RUTIN, ru, () => (ru = { kegiatan: "", waktu: "", tempat: "" })); }}>
    <div class="isian"><label for="ru-kegiatan">Kegiatan</label><input id="ru-kegiatan" bind:value={ru.kegiatan} required placeholder="Posyandu balita dan lansia" /></div>
    <div class="isian"><label for="ru-waktu">Waktu</label><input id="ru-waktu" bind:value={ru.waktu} placeholder="Setiap Selasa pertama, 08.00" /></div>
    <div class="isian"><label for="ru-tempat">Tempat</label><input id="ru-tempat" bind:value={ru.tempat} placeholder="Balai warga" /></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === KOLEKSI.RUTIN}>Tambahkan</button></div>
    <p class="catatan-borang">Kegiatan rutin tampil di bawah kalender. Acara dengan tanggal tertentu dikelola pada bagian Kalender & acara di bawah.</p>
  </form>
  {#each isi.rutin || [] as o}
    <BarisKelola koleksi={KOLEKSI.RUTIN} id={o.id} judul={o.kegiatan} baris={[(o.waktu || "-") + " · " + (o.tempat || "-")]} nilai={o} kolom={[{ nama: "kegiatan", label: "Kegiatan" },{ nama: "waktu", label: "Waktu" },{ nama: "tempat", label: "Tempat" }]} />
  {/each}
</section>

<TabKalender />