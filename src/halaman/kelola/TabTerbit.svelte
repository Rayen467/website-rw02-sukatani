<script>
  import { KOLEKSI } from "../../inti/nama.js";
  import { isi, muatKoleksi } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { tambahIsi, simpanAlbum, hapusAlbum } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";
  import { tanggalHariIni } from "../../inti/format.js";
  import { kecilkanFoto, SISI_SAMPUL, SISI_FOTO_LAYAR } from "../../inti/peramban.js";
  import BarisKelola from "../../komponen/BarisKelola.svelte";
  import GaleriFotoKelola from "../../komponen/kelola/GaleriFotoKelola.svelte";

  function kosongKonten() {
    return {
      tipe: "pengumuman",
      penting: false,
      judul: "",
      tgl: tanggalHariIni(),
      tglText: "",
      tanggal: "",
      jamMulai: "",
      jamSelesai: "",
      tempat: "",
      ringkas: "",
      isi: ""
    };
  }

  let k = $state(kosongKonten());
  let fotoPengumuman = $state(null);
  let g = $state({ judul: "", kategori: "kegiatan", tanggal: tanggalHariIni(), keterangan: "", fn: "", jml: "" });
  let berkasFoto = $state([]);
  let kemajuan = $state("");
  let sibuk = $state("");

  const kategoriGaleri = [
    { nilai: "kegiatan", label: "Kegiatan" },
    { nilai: "pembangunan", label: "Pembangunan" },
    { nilai: "acara", label: "Acara Warga" }
  ];

  const labelKategoriGaleri = (nilai) => kategoriGaleri.find((x) => x.nilai === nilai)?.label || "Belum dikategorikan";

  function olahFotoBerita(berkas) {
    return kecilkanFoto(berkas, SISI_SAMPUL);
  }

  async function terbitkan(e) {
    e.preventDefault();
    sibuk = "konten";
    try {
      if (k.tipe === "agenda" && !k.tanggal) throw new Error("Agenda kegiatan perlu tanggal acara supaya masuk kalender.");
      const foto = fotoPengumuman ? await olahFotoBerita(fotoPengumuman) : "";
      await tambahIsi(KOLEKSI.PENGUMUMAN, {
        ...k,
        /* tgl adalah tanggal PUBLIKASI/arsip. tanggal adalah tanggal ACARA.
           Keduanya tidak boleh lagi saling menimpa. */
        tgl: k.tgl || tanggalHariIni(),
        foto
      });
      beriTahu(k.tipe === "agenda" ? "Agenda terbit dan tanggal acaranya masuk Kalender Kegiatan." : "Terbit. Sudah muncul di Beranda dan halaman Berita.");
      k = kosongKonten();
      fotoPengumuman = null;
      muatKoleksi(KOLEKSI.PENGUMUMAN);
    } catch (err) {
      beriTahu(err?.code ? pesanRamah(err) : (err?.message || "Publikasi belum berhasil."));
    }
    sibuk = "";
  }

  async function tambahGaleri(e) {
    e.preventDefault();
    sibuk = "galeri";
    kemajuan = "";
    try {
      const fotoBesar = [];
      let sampul = "";
      for (let i = 0; i < berkasFoto.length; i++) {
        kemajuan = "Mengecilkan foto " + (i + 1) + " dari " + berkasFoto.length + "...";
        try {
          const besar = await kecilkanFoto(berkasFoto[i], SISI_FOTO_LAYAR);
          fotoBesar.push(besar);
          if (!sampul) sampul = await kecilkanFoto(berkasFoto[i], SISI_SAMPUL);
        } catch (err) {
          beriTahu("Foto ke-" + (i + 1) + " dilewati: " + err.message);
        }
      }
      kemajuan = "Mengirim ke server...";
      const hasil = await simpanAlbum({ ...g, sampul, jumlahFoto: String(fotoBesar.length) }, fotoBesar);
      beriTahu(fotoBesar.length ? (hasil.gagal ? "Album tersimpan. " + hasil.masuk + " foto berhasil, " + hasil.gagal + " foto gagal dikirim dan tidak dihitung." : "Tersimpan dengan " + hasil.masuk + " foto.") : "Kegiatan tercatat, belum ada fotonya.");
      g = { judul: "", kategori: "kegiatan", tanggal: tanggalHariIni(), keterangan: "", fn: "", jml: "" };
      berkasFoto = [];
      muatKoleksi(KOLEKSI.GALERI);
    } catch (err) { beriTahu(err?.code ? pesanRamah(err) : (err?.message || "Galeri belum tersimpan.")); }
    kemajuan = "";
    sibuk = "";
  }
</script>

<section class="blok">
  <div class="kepala-bagian"><div><h2>Kelola berita, pengumuman & agenda</h2><p>Satu publikasi punya tanggal terbit sendiri. Agenda juga punya tanggal/jam acara sendiri.</p></div></div>
  <div class="catatan" style="margin-bottom:18px"><b>Tanggal publikasi dan tanggal acara sekarang dipisahkan.</b> Contoh: pengumuman 17 Agustus bisa diterbitkan tanggal 5 Agustus, sementara acaranya tetap tercatat 17 Agustus di kalender. Foto hanya tampil bila memang diunggah untuk berita tersebut.</div>
  <form class="isian-borang" onsubmit={terbitkan}>
    <div class="isian"><label for="k-tipe">Jenis</label><select id="k-tipe" bind:value={k.tipe}><option value="pengumuman">Pengumuman / berita</option><option value="agenda">Agenda kegiatan</option></select></div>
    <label class="centang"><input type="checkbox" bind:checked={k.penting} /><span><b>Tandai sebagai pengumuman penting</b><span class="petunjuk">Disorot khusus pada halaman informasi.</span></span></label>
    <div class="isian"><label for="k-judul">Judul</label><input id="k-judul" bind:value={k.judul} required placeholder="Kerja bakti bulanan blok C dan D" /></div>
    <div class="isian"><label for="k-terbit">Tanggal publikasi</label><input id="k-terbit" type="date" bind:value={k.tgl} required /><span class="petunjuk">Tanggal saat informasi diterbitkan/diarsipkan. Bukan tanggal acara.</span></div>
    <div class="isian"><label for="k-tglText">Keterangan tanggal tambahan</label><input id="k-tglText" bind:value={k.tglText} placeholder="Contoh: Diperbarui 16 September 2026" /><span class="petunjuk">Opsional. Kosongkan jika tidak ada keterangan khusus.</span></div>

    {#if k.tipe === "agenda"}
      <div class="isian"><label for="k-tanggal">Tanggal acara</label><input id="k-tanggal" type="date" bind:value={k.tanggal} required /><span class="petunjuk">Tanggal inilah yang dipakai Kalender Kegiatan.</span></div>
      <div class="isian"><label for="k-jam-mulai">Jam mulai</label><input id="k-jam-mulai" type="time" bind:value={k.jamMulai} /></div>
      <div class="isian"><label for="k-jam-selesai">Jam selesai</label><input id="k-jam-selesai" type="time" bind:value={k.jamSelesai} /></div>
      <div class="isian"><label for="k-tempat">Tempat acara</label><input id="k-tempat" bind:value={k.tempat} placeholder="Balai Warga / GOR / Musala" /></div>
    {/if}

    <div class="isian"><label for="k-ringkas">Ringkasan satu kalimat</label><input id="k-ringkas" bind:value={k.ringkas} placeholder="Muncul di daftar berita" /></div>
    <div class="isian wide"><label for="k-isi">Isi lengkap</label><textarea id="k-isi" bind:value={k.isi} required></textarea></div>
    <div class="isian wide"><label for="k-foto">Foto / sampul berita</label><input id="k-foto" type="file" accept="image/*" onchange={(e) => (fotoPengumuman = e.currentTarget.files[0] || null)} /><span class="petunjuk">Opsional. Gunakan foto asli informasi/kegiatan. Tidak ada foto otomatis yang dipinjam dari kegiatan lain.</span>{#if fotoPengumuman}<span class="petunjuk"><b>Dipilih:</b> {fotoPengumuman.name}</span>{/if}</div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "konten"}>{sibuk === "konten" ? "Menerbitkan..." : "Terbitkan"}</button></div>
  </form>

  {#if (isi.pengumuman || []).length}
    <div class="kepala-bagian" style="margin-top:26px"><h2>Sudah terbit</h2></div>
    {#each isi.pengumuman as o}
      <BarisKelola
        koleksi={KOLEKSI.PENGUMUMAN}
        id={o.id}
        judul={o.judul}
        baris={[
          (o.tipe === "agenda" ? "Agenda" : "Pengumuman") + " · terbit " + (o.tgl || "tanggal belum diisi"),
          o.tipe === "agenda" ? "Acara " + (o.tanggal || "tanggal belum diisi") + (o.tempat ? " · " + o.tempat : "") : (o.ringkas || "")
        ]}
        nilai={o}
        olahFoto={olahFotoBerita}
        kolom={[
          { nama: "foto", label: "Foto / sampul berita", jenis: "foto", petunjuk: "Pilih foto baru untuk mengganti foto lama. Bisa juga dihapus tanpa menghapus beritanya." },
          { nama: "judul", label: "Judul" },
          { nama: "tipe", label: "Jenis", jenis: "pilih", pilihan: [{ nilai: "pengumuman", label: "Pengumuman / berita" }, { nilai: "agenda", label: "Agenda" }] },
          { nama: "penting", label: "Sorotan penting", jenis: "pilih", pilihan: [{ nilai: "false", label: "Biasa" }, { nilai: "true", label: "Penting" }] },
          { nama: "tgl", label: "Tanggal publikasi", jenis: "tanggal" },
          { nama: "tglText", label: "Keterangan tanggal tambahan" },
          { nama: "tanggal", label: "Tanggal acara / kalender", jenis: "tanggal" },
          { nama: "jamMulai", label: "Jam mulai" },
          { nama: "jamSelesai", label: "Jam selesai" },
          { nama: "tempat", label: "Tempat acara" },
          { nama: "ringkas", label: "Ringkasan", jenis: "panjang" },
          { nama: "isi", label: "Isi lengkap", jenis: "panjang" }
        ]}
      />
    {/each}
  {/if}
</section>

<section class="blok">
  <div class="kepala-bagian"><div><h2>Arsip kegiatan & galeri</h2><p>Foto yang disimpan di sini langsung menjadi album pada Galeri Foto & Video.</p></div></div>
  <div class="catatan" style="margin-bottom:18px"><b>Isi kategori dan tanggal sesuai kegiatan sebenarnya.</b> Data yang belum diketahui boleh dibiarkan untuk dilengkapi kemudian; sistem tidak mengarang tanggal, foto, atau kategori.</div>
  <form class="isian-borang" onsubmit={tambahGaleri}>
    <div class="isian"><label for="g-judul">Nama kegiatan</label><input id="g-judul" bind:value={g.judul} required placeholder="Kerja Bakti Bulanan" /></div>
    <div class="isian"><label for="g-kategori">Kategori galeri</label><select id="g-kategori" bind:value={g.kategori}>{#each kategoriGaleri as kategori}<option value={kategori.nilai}>{kategori.label}</option>{/each}</select></div>
    <div class="isian"><label for="g-tanggal">Tanggal kegiatan</label><input id="g-tanggal" type="date" bind:value={g.tanggal} /></div>
    <div class="isian wide"><label for="g-keterangan">Keterangan singkat</label><textarea id="g-keterangan" bind:value={g.keterangan} placeholder="Ringkasan singkat kegiatan yang memang terjadi."></textarea></div>
    <div class="isian"><label for="g-fn">Nama berkas arsip</label><input id="g-fn" bind:value={g.fn} placeholder="2026-09-14_Kerja-Bakti-Bulanan" /><span class="petunjuk">Opsional untuk arsip internal.</span></div>
    <div class="isian"><label for="g-jml">Keterangan isi arsip</label><input id="g-jml" bind:value={g.jml} placeholder="22 foto, 1 notulen" /></div>
    <div class="isian wide"><label for="g-foto">Foto kegiatan</label><input id="g-foto" type="file" accept="image/*" multiple onchange={(e) => (berkasFoto = [...e.target.files])} /><span class="petunjuk">Boleh pilih banyak sekaligus. Foto otomatis dikecilkan sebelum dikirim. Foto pertama dipakai sebagai sampul.</span>{#if berkasFoto.length}<span class="petunjuk"><b>{berkasFoto.length} foto dipilih.</b></span>{/if}</div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "galeri"}>{sibuk === "galeri" ? "Menyimpan..." : "Tambahkan album"}</button>{#if kemajuan}<span class="petunjuk" style="margin-left:12px">{kemajuan}</span>{/if}</div>
  </form>

  {#if (isi.galeri || []).length}
    <div class="kepala-bagian" style="margin-top:26px"><h2>Sudah tercatat</h2></div>
    {#each isi.galeri as o}
      <BarisKelola
        koleksi={KOLEKSI.GALERI}
        id={o.id}
        judul={o.judul}
        baris={[[labelKategoriGaleri(o.kategori), o.tanggal || "Tanggal belum diisi"].filter(Boolean).join(" · "), (o.jumlahFoto || "0") + " foto" + (o.jml ? " · " + o.jml : "")]}
        nilai={o}
        kolom={[
          { nama: "judul", label: "Nama kegiatan" },
          { nama: "kategori", label: "Kategori galeri", jenis: "pilih", pilihan: kategoriGaleri },
          { nama: "tanggal", label: "Tanggal kegiatan", jenis: "tanggal" },
          { nama: "keterangan", label: "Keterangan singkat", jenis: "panjang" },
          { nama: "fn", label: "Nama berkas arsip / keterangan lama" },
          { nama: "jml", label: "Isi arsip" }
        ]}
        saatHapus={hapusAlbum}
      />
      <GaleriFotoKelola album={o} />
    {/each}
  {/if}
</section>