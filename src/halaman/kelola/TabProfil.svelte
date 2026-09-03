<script>
  import { KOLEKSI, KONTEN } from "../../inti/nama.js";
  import { isi, konten, muatKoleksi, muatKonten } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { tambahIsi, simpanKonten, simpanDokumen } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";
  import { keSlug } from "../../inti/format.js";
  import { kecilkanFoto } from "../../inti/peramban.js";
  import { JENIS_USAHA } from "../../inti/bawaan.js";
  import BarisHapus from "../../komponen/BarisHapus.svelte";

  let sb = $state({ nama: "", teks: "", foto: "" });
  let st = $state({ jabatan: "", nama: "", kontak: "" });
  let rt = $state({ rt: "", blok: "", batas: "", ketua: "", kontak: "" });
  let pf = $state({ sejarah: "", visi: "", misi: "", luas: "", jumlahRT: "", batasUtara: "", batasTimur: "", batasSelatan: "", batasBarat: "" });
  let kn = $state({ posKeamanan: "", ketuaRW: "", ambulans: "", sekretaris: "", bendahara: "", kebersihan: "", alamat: "", koordinat: "", jamSeninJumat: "", jamSabtu: "", iuranNominal: "", iuranJatuhTempo: "", iuranSetor: "" });
  let uk = $state({ nama: "", kat: "siapsaji", ringkas: "", panjang: "", jam: "", wa: "" });

  let fotoSambutan = $state(null);
  let fotoStruktur = $state(null);
  let sibuk = $state("");

  $effect(() => { const k = konten(KONTEN.SAMBUTAN); if (k) sb = { ...sb, ...k }; });
  $effect(() => { const k = konten(KONTEN.PROFIL); if (k) pf = { ...pf, ...k }; });
  $effect(() => { const k = konten(KONTEN.KONTAK); if (k) kn = { ...kn, ...k }; });

  async function bacaFoto(berkas, sisi) {
    if (!berkas) return "";
    try { return await kecilkanFoto(berkas, sisi); }
    catch (err) { beriTahu("Foto tidak dipakai: " + err.message); return ""; }
  }

  async function jalan(tanda, aksi) {
    sibuk = tanda;
    try { await aksi(); beriTahu("Tersimpan."); }
    catch (err) { beriTahu(pesanRamah(err)); }
    sibuk = "";
  }
</script>

<section class="blok">
  <div class="kepala-bagian"><h2>Sambutan Ketua RW</h2></div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); jalan("sambutan", async () => {
    const foto = (await bacaFoto(fotoSambutan, 600)) || sb.foto || "";
    await simpanKonten(KONTEN.SAMBUTAN, { nama: sb.nama, teks: sb.teks, foto });
    muatKonten(KONTEN.SAMBUTAN);
  }); }}>
    <div class="isian"><label for="sb-nama">Nama Ketua RW</label><input id="sb-nama" bind:value={sb.nama} /></div>
    <div class="isian"><label for="sb-teks">Isi sambutan</label><textarea id="sb-teks" bind:value={sb.teks} style="min-height:150px"></textarea></div>
    <div class="isian">
      <label for="sb-foto">Foto Ketua RW</label>
      <input id="sb-foto" type="file" accept="image/*" onchange={(e) => (fotoSambutan = e.target.files[0] || null)} />
      <span class="petunjuk">Minta izin dulu sebelum menayangkan foto seseorang.</span>
    </div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "sambutan"}>Simpan sambutan</button></div>
  </form>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Struktur pengurus yang ditampilkan</h2></div>
  <div class="catatan" style="margin-bottom:18px">
    <b>Ini daftar yang tampil di halaman Struktur Pengurus.</b> Berbeda dengan daftar hak akses di tab
    Warga &amp; pengurus &mdash; menambah nama di sini tidak memberi hak apa pun, jadi aman untuk pengurus yang tidak punya akun.
  </div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); jalan("struktur", async () => {
    const foto = await bacaFoto(fotoStruktur, 600);
    await tambahIsi(KOLEKSI.PENGURUS_TAMPIL, { ...st, foto });
    st = { jabatan: "", nama: "", kontak: "" };
    fotoStruktur = null;
    muatKoleksi(KOLEKSI.PENGURUS_TAMPIL);
  }); }}>
    <div class="isian"><label for="st-jabatan">Jabatan</label><input id="st-jabatan" bind:value={st.jabatan} required placeholder="Ketua RW" /></div>
    <div class="isian"><label for="st-nama">Nama</label><input id="st-nama" bind:value={st.nama} required /></div>
    <div class="isian">
      <label for="st-kontak">Nomor kontak</label>
      <input id="st-kontak" bind:value={st.kontak} inputmode="tel" />
      <span class="petunjuk">Kosongkan bila yang bersangkutan tidak bersedia nomornya ditayangkan.</span>
    </div>
    <div class="isian"><label for="st-foto">Foto</label><input id="st-foto" type="file" accept="image/*" onchange={(e) => (fotoStruktur = e.target.files[0] || null)} /></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "struktur"}>Tambahkan</button></div>
  </form>
  {#each isi.pengurus_tampil || [] as o}
    <BarisHapus koleksi="pengurus_tampil" id={o.id} judul={o.jabatan || "-"} baris={[(o.nama || "-") + (o.kontak ? " \u00B7 " + o.kontak : "")]} />
  {/each}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Batas dan cakupan tiap RT</h2></div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); jalan("rt", async () => {
    await simpanDokumen(KOLEKSI.BATAS_RT, keSlug(rt.rt) || "rt", rt, false);
    rt = { rt: "", blok: "", batas: "", ketua: "", kontak: "" };
    muatKoleksi(KOLEKSI.BATAS_RT);
  }); }}>
    <div class="isian"><label for="rt-nama">RT</label><input id="rt-nama" bind:value={rt.rt} required placeholder="RT 03" /></div>
    <div class="isian"><label for="rt-blok">Cakupan blok</label><input id="rt-blok" bind:value={rt.blok} placeholder="Blok C dan D" /></div>
    <div class="isian"><label for="rt-batas">Batas wilayah</label><input id="rt-batas" bind:value={rt.batas} placeholder="Dari gerbang sampai lapangan" /></div>
    <div class="isian"><label for="rt-ketua">Nama Ketua RT</label><input id="rt-ketua" bind:value={rt.ketua} /></div>
    <div class="isian"><label for="rt-kontak">Nomor Ketua RT</label><input id="rt-kontak" bind:value={rt.kontak} inputmode="tel" /></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "rt"}>Simpan RT</button></div>
    <p class="catatan-borang">Dipakai di dua tempat: tabel Ketua RT pada halaman Struktur Pengurus, dan keterangan batas pada halaman Peta Wilayah.</p>
  </form>
  {#each isi.batas_rt || [] as o}
    <BarisHapus koleksi="batas_rt" id={o.id} judul={o.rt || "-"} baris={[(o.blok || "-") + " \u00B7 " + (o.batas || "-"), (o.ketua || "-") + (o.kontak ? " \u00B7 " + o.kontak : "")]} />
  {/each}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Profil RW</h2></div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); jalan("profil", async () => { await simpanKonten(KONTEN.PROFIL, pf); muatKonten(KONTEN.PROFIL); }); }}>
    <div class="isian"><label for="f-sejarah">Sejarah singkat</label><textarea id="f-sejarah" bind:value={pf.sejarah}></textarea></div>
    <div class="isian"><label for="f-visi">Visi</label><textarea id="f-visi" bind:value={pf.visi}></textarea></div>
    <div class="isian"><label for="f-misi">Misi</label><textarea id="f-misi" bind:value={pf.misi} placeholder="Satu misi per baris"></textarea><span class="petunjuk">Tulis satu misi per baris. Nanti tampil sebagai daftar bernomor.</span></div>
    <div class="isian"><label for="f-luas">Luas wilayah</label><input id="f-luas" bind:value={pf.luas} placeholder="12 hektare" /></div>
    <div class="isian"><label for="f-rt">Jumlah RT</label><input id="f-rt" bind:value={pf.jumlahRT} placeholder="5" /></div>
    <div class="isian"><label for="f-utara">Batas utara</label><input id="f-utara" bind:value={pf.batasUtara} /></div>
    <div class="isian"><label for="f-timur">Batas timur</label><input id="f-timur" bind:value={pf.batasTimur} /></div>
    <div class="isian"><label for="f-selatan">Batas selatan</label><input id="f-selatan" bind:value={pf.batasSelatan} /></div>
    <div class="isian"><label for="f-barat">Batas barat</label><input id="f-barat" bind:value={pf.batasBarat} /></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "profil"}>Simpan profil</button></div>
  </form>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Kontak, jam layanan, dan iuran</h2></div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); jalan("kontak", async () => { await simpanKonten(KONTEN.KONTAK, kn); muatKonten(KONTEN.KONTAK); }); }}>
    <div class="isian"><label for="n-pos">Nomor pos keamanan</label><input id="n-pos" bind:value={kn.posKeamanan} /></div>
    <div class="isian"><label for="n-rw">Nomor Ketua RW</label><input id="n-rw" bind:value={kn.ketuaRW} /></div>
    <div class="isian"><label for="n-sek">Nomor Sekretaris</label><input id="n-sek" bind:value={kn.sekretaris} /></div>
    <div class="isian"><label for="n-ben">Nomor Bendahara</label><input id="n-ben" bind:value={kn.bendahara} /></div>
    <div class="isian"><label for="n-ker">Nomor Seksi Kebersihan</label><input id="n-ker" bind:value={kn.kebersihan} /></div>
    <div class="isian"><label for="n-amb">Nomor ambulans desa</label><input id="n-amb" bind:value={kn.ambulans} /></div>
    <div class="isian"><label for="n-alamat">Alamat sekretariat</label><input id="n-alamat" bind:value={kn.alamat} /></div>
    <div class="isian">
      <label for="n-koordinat">Titik koordinat peta</label>
      <input id="n-koordinat" bind:value={kn.koordinat} placeholder="-6.129217,106.497767" />
      <span class="petunjuk">Buka Google Maps, tekan lama di titik balai warga, salin angka yang muncul. Tulis lintang dan bujur dipisah koma, tanpa spasi.</span>
    </div>
    <div class="isian"><label for="n-jam1">Jam layanan Senin sampai Jumat</label><input id="n-jam1" bind:value={kn.jamSeninJumat} /></div>
    <div class="isian"><label for="n-jam2">Jam layanan Sabtu</label><input id="n-jam2" bind:value={kn.jamSabtu} /></div>
    <div class="isian"><label for="n-iuran">Nominal iuran per bulan</label><input id="n-iuran" bind:value={kn.iuranNominal} /></div>
    <div class="isian"><label for="n-tempo">Jatuh tempo iuran</label><input id="n-tempo" bind:value={kn.iuranJatuhTempo} /></div>
    <div class="isian"><label for="n-setor">Iuran disetor kepada</label><input id="n-setor" bind:value={kn.iuranSetor} /></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "kontak"}>Simpan kontak</button></div>
    <p class="catatan-borang">Nomor yang diisi di sini tampil di halaman publik. Pastikan pemiliknya sudah mengizinkan.</p>
  </form>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Katalog usaha warga</h2></div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); jalan("usaha", async () => {
    const label = (JENIS_USAHA.find((j) => j.nilai === uk.kat) || {}).label || "Lainnya";
    await simpanDokumen(KOLEKSI.USAHA, keSlug(uk.nama) || "usaha", { ...uk, katLabel: label });
    uk = { nama: "", kat: "siapsaji", ringkas: "", panjang: "", jam: "", wa: "" };
    muatKoleksi(KOLEKSI.USAHA);
  }); }}>
    <div class="isian"><label for="uk-nama">Nama usaha</label><input id="uk-nama" bind:value={uk.nama} required /></div>
    <div class="isian"><label for="uk-jenis">Jenis</label><select id="uk-jenis" bind:value={uk.kat}>{#each JENIS_USAHA as j}<option value={j.nilai}>{j.label}</option>{/each}</select></div>
    <div class="isian"><label for="uk-ringkas">Keterangan singkat</label><input id="uk-ringkas" bind:value={uk.ringkas} required /></div>
    <div class="isian"><label for="uk-panjang">Keterangan lengkap</label><textarea id="uk-panjang" bind:value={uk.panjang}></textarea></div>
    <div class="isian"><label for="uk-jam">Jam buka</label><input id="uk-jam" bind:value={uk.jam} /></div>
    <div class="isian"><label for="uk-wa">Nomor pemesanan</label><input id="uk-wa" bind:value={uk.wa} inputmode="tel" /></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "usaha"}>Tampilkan di katalog</button></div>
  </form>
  {#each isi.usaha || [] as o}
    <BarisHapus koleksi="usaha" id={o.id} judul={o.nama} baris={[(o.katLabel || "") + " \u00B7 " + (o.jam || ""), o.ringkas || ""]} />
  {/each}
</section>
