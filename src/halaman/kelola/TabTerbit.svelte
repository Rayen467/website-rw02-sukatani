<script>
  import { KOLEKSI } from "../../inti/nama.js";
  import { isi, muatKoleksi } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { tambahIsi } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";
  import { tanggalHariIni } from "../../inti/format.js";
  import { kecilkanFoto } from "../../inti/peramban.js";
  import BarisHapus from "../../komponen/BarisHapus.svelte";

  let k = $state({ tipe: "pengumuman", judul: "", tglText: "", tanggal: "", ringkas: "", isi: "" });
  let g = $state({ judul: "", fn: "", jml: "" });
  let berkasFoto = $state(null);
  let sibuk = $state("");

  async function terbitkan(e) {
    e.preventDefault();
    sibuk = "konten";
    try {
      await tambahIsi(KOLEKSI.PENGUMUMAN, { ...k, tgl: k.tanggal || tanggalHariIni() });
      beriTahu("Terbit. Sudah muncul di halaman Berita.");
      k = { tipe: "pengumuman", judul: "", tglText: "", tanggal: "", ringkas: "", isi: "" };
      muatKoleksi(KOLEKSI.PENGUMUMAN);
    } catch (err) { beriTahu(pesanRamah(err)); }
    sibuk = "";
  }

  async function tambahGaleri(e) {
    e.preventDefault();
    sibuk = "galeri";
    let foto = "";
    if (berkasFoto) {
      beriTahu("Mengecilkan foto...");
      try { foto = await kecilkanFoto(berkasFoto, 1000); }
      catch (err) { beriTahu("Foto tidak dipakai: " + err.message); }
    }
    try {
      await tambahIsi(KOLEKSI.GALERI, { ...g, foto });
      beriTahu("Kegiatan tercatat di arsip.");
      g = { judul: "", fn: "", jml: "" };
      berkasFoto = null;
      muatKoleksi(KOLEKSI.GALERI);
    } catch (err) { beriTahu(pesanRamah(err)); }
    sibuk = "";
  }
</script>

<section class="blok">
  <div class="kepala-bagian"><h2>Terbitkan pengumuman atau agenda</h2></div>
  <div class="catatan" style="margin-bottom:18px">
    <b>Langsung muncul di halaman Berita dan Kalender.</b> Tidak perlu mengubah kode situs.
  </div>
  <form class="isian-borang" onsubmit={terbitkan}>
    <div class="isian"><label for="k-tipe">Jenis</label>
      <select id="k-tipe" bind:value={k.tipe}><option value="pengumuman">Pengumuman</option><option value="agenda">Agenda kegiatan</option></select>
    </div>
    <div class="isian"><label for="k-judul">Judul</label><input id="k-judul" bind:value={k.judul} required placeholder="Kerja bakti bulanan blok C dan D" /></div>
    <div class="isian"><label for="k-tglText">Tanggal dan waktu (tulisan)</label><input id="k-tglText" bind:value={k.tglText} placeholder="14 September 2026 pukul 08.00" /></div>
    <div class="isian">
      <label for="k-tanggal">Tanggal untuk kalender</label>
      <input id="k-tanggal" type="date" bind:value={k.tanggal} />
      <span class="petunjuk">Khusus agenda. Diisi supaya kegiatan muncul di Kalender Kegiatan.</span>
    </div>
    <div class="isian"><label for="k-ringkas">Ringkasan satu kalimat</label><input id="k-ringkas" bind:value={k.ringkas} placeholder="Muncul di daftar berita" /></div>
    <div class="isian"><label for="k-isi">Isi lengkap</label><textarea id="k-isi" bind:value={k.isi} required></textarea></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "konten"}>{sibuk === "konten" ? "Menerbitkan..." : "Terbitkan"}</button></div>
  </form>

  {#if (isi.pengumuman || []).length}
    <div class="kepala-bagian" style="margin-top:26px"><h2>Sudah terbit</h2></div>
    {#each isi.pengumuman as o}
      <BarisHapus koleksi="pengumuman" id={o.id} judul={o.judul}
        baris={[o.ringkas || o.isi || "", (o.tipe === "agenda" ? "Agenda" : "Pengumuman") + " \u00B7 " + (o.tglText || o.tgl || "-")]} />
    {/each}
  {/if}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Arsip kegiatan</h2></div>
  <form class="isian-borang" onsubmit={tambahGaleri}>
    <div class="isian"><label for="g-judul">Nama kegiatan</label><input id="g-judul" bind:value={g.judul} required placeholder="Kerja Bakti Bulanan" /></div>
    <div class="isian">
      <label for="g-fn">Nama berkas arsip</label>
      <input id="g-fn" bind:value={g.fn} placeholder="2026-09-14_Kerja-Bakti-Bulanan" />
      <span class="petunjuk">Format: tahun-bulan-tanggal_Nama-Kegiatan. Tanggal di depan supaya berkas terurut sendiri.</span>
    </div>
    <div class="isian"><label for="g-jml">Isi arsip</label><input id="g-jml" bind:value={g.jml} placeholder="22 foto, 1 notulen" /></div>
    <div class="isian">
      <label for="g-foto">Foto kegiatan</label>
      <input id="g-foto" type="file" accept="image/*" onchange={(e) => (berkasFoto = e.target.files[0] || null)} />
      <span class="petunjuk">Otomatis dikecilkan sebelum dikirim, jadi tidak boros kuota. Ambil mendatar supaya tidak terpotong.</span>
    </div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "galeri"}>{sibuk === "galeri" ? "Menyimpan..." : "Tambahkan"}</button></div>
  </form>

  {#if (isi.galeri || []).length}
    <div class="kepala-bagian" style="margin-top:26px"><h2>Sudah tercatat</h2></div>
    {#each isi.galeri as o}
      <BarisHapus koleksi="galeri" id={o.id} judul={o.judul} baris={[o.fn || "-", o.jml || ""]} />
    {/each}
  {/if}
</section>
