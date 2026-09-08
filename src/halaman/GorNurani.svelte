<script>
  import { KONTEN } from "../inti/nama.js";
  import { kontenNilai } from "../keadaan/isi.svelte.js";
  import { keDaftar } from "../inti/format.js";
  import { GOR_NURANI_BAWAAN } from "../inti/bawaan.js";

  const nilai = (k) => kontenNilai(KONTEN.GOR_NURANI, k, GOR_NURANI_BAWAAN[k] || "");
  const misi = $derived(keDaftar(nilai("misi")));
  const tujuan = $derived(keDaftar(nilai("tujuan")));
  const struktur = $derived(keDaftar(nilai("strukturPengurus")));
  const tugasKetua = $derived(keDaftar(nilai("tugasKetua")));
  const tugasPelaksana = $derived(keDaftar(nilai("tugasPelaksana")));
  const tugasBendahara = $derived(keDaftar(nilai("tugasBendahara")));
  const alokasi = $derived(keDaftar(nilai("alokasiProfit")));
  const jadwal = $derived(keDaftar(nilai("jadwalTetap")));
  const badminton = $derived(keDaftar(nilai("aturanBadminton")));
  const hajatan = $derived(keDaftar(nilai("aturanHajatan")));
  const perlengkapan = $derived(keDaftar(nilai("perlengkapan")));
</script>

<nav class="remah"><a href="#/">Beranda</a><span>›</span><span>GOR Nurani</span></nav>

<div class="kepala-halaman">
  <p class="alis">Fasilitas warga</p>
  <h1>{nilai("nama")}</h1>
  <p>
    Profil, jadwal, tata kelola, dan ketentuan pemanfaatan GOR mini RW 02
    berdasarkan dokumen Anggaran Dasar dan Anggaran Rumah Tangga Pengelolaan GOR Nurani.
  </p>
</div>

<section class="blok">
  <div class="petak petak-2">
    <div class="kartu">
      <p class="alis">Identitas fasilitas</p>
      <h3>{nilai("jenis")}</h3>
      <div class="tabel-bungkus" style="border:0;background:none">
        <table class="data"><tbody>
          <tr><th>Pendirian</th><td>{nilai("tahunPendirian")}</td></tr>
          <tr><th>Mulai operasional</th><td>{nilai("mulaiOperasional")}</td></tr>
          <tr><th>Luas</th><td>{nilai("luas")}</td></tr>
          <tr><th>Lokasi</th><td>{nilai("alamat")}</td></tr>
        </tbody></table>
      </div>
    </div>
    <div class="kartu">
      <p class="alis">Riwayat singkat</p>
      <p>{nilai("riwayat")}</p>
    </div>
  </div>
</section>

<section class="blok">
  <div class="petak petak-2">
    <div class="kartu">
      <p class="alis">Visi</p>
      <p style="font-size:16px;color:var(--tinta);line-height:1.65">{nilai("visi")}</p>
    </div>
    <div class="kartu">
      <h3>Misi</h3>
      <ol class="poin">{#each misi as x}<li>{x}</li>{/each}</ol>
    </div>
  </div>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Landasan dan tujuan</h2></div>
  <div class="petak petak-3">
    <div class="kartu"><p class="alis">Landasan</p><p>{nilai("landasan")}</p></div>
    <div class="kartu"><p class="alis">Sifat</p><p>{nilai("sifat")}</p></div>
    <div class="kartu"><p class="alis">Asas</p><p>{nilai("asas")}</p></div>
  </div>
  <div class="kartu" style="margin-top:16px">
    <h3>Tujuan GOR Nurani</h3>
    <ol class="poin">{#each tujuan as x}<li>{x}</li>{/each}</ol>
  </div>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Jadwal penggunaan tetap</h2></div>
  <div class="kartu">
    <ul class="poin">{#each jadwal as x}<li>{x}</li>{/each}</ul>
    <p class="verifikasi">
      Jadwal di atas berasal dari AD/ART. Perubahan karena kebutuhan mendesak dapat dimusyawarahkan dengan pengurus GOR dan pengurus RW 02.
    </p>
  </div>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Tarif hajatan</h2></div>
  <div class="tabel-bungkus">
    <table class="data">
      <thead><tr><th>Kategori penyewa</th><th>Tarif</th><th>Komposisi</th></tr></thead>
      <tbody>
        <tr>
          <td><b>Warga RT 01/02</b></td>
          <td>{nilai("tarifRt0102")}</td>
          <td>{nilai("komposisiRt0102")}</td>
        </tr>
        <tr>
          <td><b>Warga RW 02 di luar RT 01/02</b></td>
          <td>{nilai("tarifRw02Lain")}</td>
          <td>{nilai("komposisiRw02Lain")}</td>
        </tr>
        <tr>
          <td><b>Penyewa di luar RW 02</b></td>
          <td>{nilai("tarifLuarRw02")}</td>
          <td>{nilai("komposisiLuarRw02")}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="catatan" style="margin-top:14px">
    <b>Catatan tarif.</b> {nilai("tarifCatatan")}
  </div>
</section>

<section class="blok">
  <div class="petak petak-2">
    <div class="kartu">
      <h3>Ketentuan hajatan</h3>
      <ol class="poin">{#each hajatan as x}<li>{x}</li>{/each}</ol>
    </div>
    <div class="kartu">
      <h3>Ketentuan bulu tangkis</h3>
      <ol class="poin">{#each badminton as x}<li>{x}</li>{/each}</ol>
    </div>
  </div>
  <div class="baris-tombol" style="margin-top:16px">
    <a class="tombol utama" href="#/reservasi">Ajukan pemakaian GOR</a>
  </div>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Struktur dan tugas pengelola</h2></div>
  <div class="petak petak-3">
    {#each struktur as x}
      <div class="kartu"><h3>{x.replace(/\.$/, "")}</h3></div>
    {/each}
  </div>
  <div class="catatan" style="margin-top:16px">
    <b>Ketentuan pengurus.</b> {nilai("ketentuanPengurus")}
  </div>
  <div class="petak petak-3" style="margin-top:16px">
    <div class="kartu"><h3>Tugas Ketua GOR</h3><ul class="poin">{#each tugasKetua as x}<li>{x}</li>{/each}</ul></div>
    <div class="kartu"><h3>Tugas Pelaksana Harian</h3><ul class="poin">{#each tugasPelaksana as x}<li>{x}</li>{/each}</ul></div>
    <div class="kartu"><h3>Tugas Bendahara</h3><ul class="poin">{#each tugasBendahara as x}<li>{x}</li>{/each}</ul></div>
  </div>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Alokasi hasil pengelolaan</h2></div>
  <div class="kartu">
    <ol class="poin">{#each alokasi as x}<li>{x}</li>{/each}</ol>
    <p><b>Batas penyaluran:</b> {nilai("batasDistribusiProfit")}</p>
  </div>
</section>

<section class="blok">
  <div class="petak petak-2">
    <div class="kartu">
      <h3>Rapat dan pengambilan keputusan</h3>
      <p>{nilai("rapat")}</p>
      <p>{nilai("keputusan")}</p>
    </div>
    <div class="kartu">
      <h3>Pembangunan dan perubahan aturan</h3>
      <p>{nilai("renovasi")}</p>
      <p>{nilai("perubahanAdart")}</p>
    </div>
  </div>
</section>

<section class="blok">
  <div class="petak petak-2">
    <div class="kartu">
      <h3>Perlengkapan yang disebut dalam AD/ART</h3>
      <ul class="poin">{#each perlengkapan as x}<li>{x}</li>{/each}</ul>
    </div>
    <div class="kartu">
      <p class="alis">Pemanfaatan</p>
      <h3>Olahraga, sosial, dan kesejahteraan warga</h3>
      <p>{nilai("pemanfaatan")}</p>
    </div>
  </div>
</section>

<section class="blok">
  <div class="kartu">
    <p class="alis">Makna lambang dalam AD</p>
    <p>{nilai("maknaLogo")}</p>
  </div>
  <p class="verifikasi" style="margin-top:14px">
    Sumber ringkasan: {nilai("sumberDokumen")}. Nilai tarif dan jadwal ditampilkan sesuai scan dokumen yang diberikan;
    bila pengurus menetapkan perubahan melalui rapat, data di halaman Kelola harus diperbarui agar situs mengikuti keputusan terbaru.
  </p>
</section>
