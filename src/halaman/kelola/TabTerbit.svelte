<script>
  import { KOLEKSI } from "../../inti/nama.js";
  import { isi, muatKoleksi } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { tambahIsi, simpanAlbum, hapusAlbum } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";
  import { tanggalHariIni } from "../../inti/format.js";
  import { kecilkanFoto } from "../../inti/peramban.js";
  import BarisKelola from "../../komponen/BarisKelola.svelte";

  let k = $state({ tipe: "pengumuman", judul: "", tglText: "", tanggal: "", ringkas: "", isi: "" });
  let g = $state({ judul: "", fn: "", jml: "" });
  /* Banyak foto sekaligus. Satu kegiatan kerja bakti biasanya belasan
     sampai dua puluhan foto; memaksa pengurus mengunggah satu-satu berarti
     tidak akan pernah diunggah sama sekali. */
  let berkasFoto = $state([]);
  let kemajuan = $state("");
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
    kemajuan = "";
    try {
      const fotoBesar = [];
      let sampul = "";

      /* Foto dikecilkan satu per satu, bukan berbarengan. Dua puluh foto
         yang digambar ke kanvas sekaligus membekukan HP kelas menengah.
         Kemajuannya ditampilkan supaya pengurus tahu situsnya tidak macet. */
      for (let i = 0; i < berkasFoto.length; i++) {
        kemajuan = "Mengecilkan foto " + (i + 1) + " dari " + berkasFoto.length + "...";
        try {
          const besar = await kecilkanFoto(berkasFoto[i], 1200);
          fotoBesar.push(besar);
          /* Sampul dibuat terpisah dan jauh lebih kecil. Sampul ikut
             terunduh setiap pengunjung membuka situs, jadi harus ringan;
             foto ukuran penuh baru diambil kalau albumnya dibuka. */
          if (!sampul) sampul = await kecilkanFoto(berkasFoto[i], 400);
        } catch (err) {
          beriTahu("Foto ke-" + (i + 1) + " dilewati: " + err.message);
        }
      }

      kemajuan = "Mengirim ke server...";
      const hasil = await simpanAlbum(
        { ...g, sampul, jumlahFoto: String(fotoBesar.length) },
        fotoBesar
      );

      beriTahu(
        fotoBesar.length
          ? "Tersimpan dengan " + hasil.masuk + " foto."
          : "Kegiatan tercatat, belum ada fotonya."
      );
      g = { judul: "", fn: "", jml: "" };
      berkasFoto = [];
      muatKoleksi(KOLEKSI.GALERI);
    } catch (err) { beriTahu(pesanRamah(err)); }
    kemajuan = "";
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
      <BarisKelola
        koleksi={KOLEKSI.PENGUMUMAN}
        id={o.id}
        judul={o.judul}
        baris={[o.ringkas || o.isi || "", (o.tipe === "agenda" ? "Agenda" : "Pengumuman") + " \u00B7 " + (o.tglText || o.tgl || "-")]}
        nilai={o}
        kolom={[
          { nama: "judul", label: "Judul" },
          { nama: "tipe", label: "Jenis", jenis: "pilih", pilihan: [{ nilai: "pengumuman", label: "Pengumuman" }, { nilai: "agenda", label: "Agenda" }] },
          { nama: "tglText", label: "Tanggal tampil" },
          { nama: "ringkas", label: "Ringkasan", jenis: "panjang" },
          { nama: "isi", label: "Isi lengkap", jenis: "panjang" }
        ]}
      />
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
      <input id="g-foto" type="file" accept="image/*" multiple onchange={(e) => (berkasFoto = [...e.target.files])} />
      <span class="petunjuk">
        Boleh pilih banyak sekaligus &mdash; tahan Ctrl di komputer, atau ketuk beberapa foto di HP.
        Semuanya otomatis dikecilkan sebelum dikirim, jadi tidak boros kuota.
        Ambil mendatar supaya tidak terpotong.
      </span>
      {#if berkasFoto.length}
        <span class="petunjuk"><b>{berkasFoto.length} foto dipilih.</b> Yang pertama dipakai sebagai sampul album.</span>
      {/if}
    </div>
    <div>
      <button class="tombol utama" type="submit" disabled={sibuk === "galeri"}>
        {sibuk === "galeri" ? "Menyimpan..." : "Tambahkan"}
      </button>
      {#if kemajuan}<span class="petunjuk" style="margin-left:12px">{kemajuan}</span>{/if}
    </div>
  </form>

  {#if (isi.galeri || []).length}
    <div class="kepala-bagian" style="margin-top:26px"><h2>Sudah tercatat</h2></div>
    {#each isi.galeri as o}
      <BarisKelola
        koleksi={KOLEKSI.GALERI}
        id={o.id}
        judul={o.judul}
        baris={[o.fn || "-", (o.jumlahFoto || "0") + " foto" + (o.jml ? " · " + o.jml : "")]}
        nilai={o}
        kolom={[
          { nama: "judul", label: "Nama kegiatan" },
          { nama: "fn", label: "Keterangan" },
          { nama: "jml", label: "Isi arsip" }
        ]}
        saatHapus={hapusAlbum}
      />
    {/each}
  {/if}
</section>
