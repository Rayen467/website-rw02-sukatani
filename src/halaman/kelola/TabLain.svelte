<script>
  import { KOLEKSI, KONTEN } from "../../inti/nama.js";
  import { isi, konten, muatKoleksi, muatKonten } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { tambahIsi, simpanKonten } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";
  import { IDENTITAS_BAWAAN } from "../../inti/bawaan.js";
  import BarisKelola from "../../komponen/BarisKelola.svelte";

  let tt = $state({ nama: "", ket: "", url: "" });
  let bp = $state({ nama: "", syarat: "", jalur: "" });
  let pl = $state({ id: "poll-2026-09", pertanyaan: "", keterangan: "", opsi: "" });
  let idn = $state({ ...IDENTITAS_BAWAAN });
  let sibuk = $state("");

  $effect(() => { const k = konten(KONTEN.POLLING); if (k) pl = { ...pl, ...k }; });
  $effect(() => { const k = konten(KONTEN.IDENTITAS); if (k) idn = { ...idn, ...k }; });

  async function jalan(tanda, aksi) {
    sibuk = tanda;
    try { await aksi(); beriTahu("Tersimpan."); }
    catch (err) { beriTahu(pesanRamah(err)); }
    sibuk = "";
  }
</script>

<section class="blok">
  <div class="kepala-bagian"><h2>Tautan penting</h2></div>
  <div class="catatan" style="margin-bottom:18px">
    <b>Pastikan alamatnya benar sebelum disimpan.</b> Warga yang diarahkan ke laman keliru bisa tertipu, dan yang disalahkan pengurus.
  </div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault();
    if (tt.url && tt.url.indexOf("http") !== 0) { beriTahu("Alamat harus diawali http:// atau https://"); return; }
    jalan("tautan", async () => { await tambahIsi(KOLEKSI.TAUTAN, tt); tt = { nama: "", ket: "", url: "" }; muatKoleksi(KOLEKSI.TAUTAN); });
  }}>
    <div class="isian"><label for="tt-nama">Nama laman</label><input id="tt-nama" bind:value={tt.nama} required placeholder="Kantor Desa Sukatani" /></div>
    <div class="isian"><label for="tt-ket">Keterangan</label><input id="tt-ket" bind:value={tt.ket} placeholder="Layanan administrasi tingkat desa" /></div>
    <div class="isian">
      <label for="tt-url">Alamat lengkap</label>
      <input id="tt-url" type="url" bind:value={tt.url} placeholder="https://contoh.desa.id" />
      <span class="petunjuk">Harus diawali https:// &mdash; salin langsung dari bilah alamat peramban.</span>
    </div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "tautan"}>Tambahkan</button></div>
  </form>
  {#each isi.tautan || [] as o}
    <BarisKelola
      koleksi={KOLEKSI.TAUTAN}
      id={o.id}
      judul={o.nama} baris={[o.ket || "", o.url || "-"]}
      nilai={o}
      kolom={[
        { nama: "nama", label: "Nama laman" },
        { nama: "ket", label: "Keterangan" },
        { nama: "url", label: "Alamat" }
      ]}
    />
  {/each}
  {#if !(isi.tautan || []).length}
    <p class="verifikasi">Belum ada yang ditambahkan. Selama kosong, halaman publik memakai daftar bawaan.</p>
  {/if}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Program bantuan sosial</h2></div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); jalan("bansos", async () => { await tambahIsi(KOLEKSI.BANSOS, bp); bp = { nama: "", syarat: "", jalur: "" }; muatKoleksi(KOLEKSI.BANSOS); }); }}>
    <div class="isian"><label for="bp-nama">Nama program</label><input id="bp-nama" bind:value={bp.nama} required placeholder="Bantuan Pangan Non Tunai" /></div>
    <div class="isian"><label for="bp-syarat">Syarat umum</label><textarea id="bp-syarat" bind:value={bp.syarat}></textarea><span class="petunjuk">Satu syarat per baris.</span></div>
    <div class="isian"><label for="bp-jalur">Jalur pengajuan</label><input id="bp-jalur" bind:value={bp.jalur} placeholder="Diusulkan Ketua RT, diverifikasi RW" /></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "bansos"}>Tambahkan</button></div>
  </form>
  {#each isi.bansos || [] as o}
    <BarisKelola
      koleksi={KOLEKSI.BANSOS}
      id={o.id}
      judul={o.nama} baris={[o.jalur || "-"]}
      nilai={o}
      kolom={[
        { nama: "nama", label: "Nama program" },
        { nama: "jalur", label: "Jalur pengajuan" },
        { nama: "syarat", label: "Syarat", jenis: "panjang" }
      ]}
    />
  {/each}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Polling warga</h2></div>
  <div class="catatan" style="margin-bottom:18px">
    <b>Mengganti pertanyaan tidak menghapus suara lama.</b> Isi kode polling dengan yang baru setiap membuka polling baru, supaya suaranya terpisah.
  </div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); jalan("polling", async () => {
    await simpanKonten(KONTEN.POLLING, { ...pl, id: pl.id.toLowerCase().replace(/[^a-z0-9-]/g, "-") });
    muatKonten(KONTEN.POLLING);
  }); }}>
    <div class="isian"><label for="pl-id">Kode polling</label><input id="pl-id" bind:value={pl.id} required /><span class="petunjuk">Huruf kecil dan tanda hubung. Ganti setiap membuka polling baru.</span></div>
    <div class="isian"><label for="pl-tanya">Pertanyaan</label><input id="pl-tanya" bind:value={pl.pertanyaan} required /></div>
    <div class="isian"><label for="pl-ket">Keterangan</label><textarea id="pl-ket" bind:value={pl.keterangan}></textarea></div>
    <div class="isian"><label for="pl-opsi">Pilihan jawaban</label><textarea id="pl-opsi" bind:value={pl.opsi} placeholder="Perbaikan saluran air&#10;Penambahan lampu jalan"></textarea><span class="petunjuk">Satu pilihan per baris, paling banyak delapan.</span></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "polling"}>Simpan polling</button></div>
  </form>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Identitas situs</h2></div>
  <div class="catatan" style="margin-bottom:18px">
    Yang tampil di kepala halaman, kaki halaman, dan kop surat. Berguna kalau situs ini nanti dipakai RW lain.
  </div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); jalan("identitas", async () => { await simpanKonten(KONTEN.IDENTITAS, idn); muatKonten(KONTEN.IDENTITAS); }); }}>
    <div class="isian"><label for="id-lambang">Lambang singkat</label><input id="id-lambang" bind:value={idn.lambang} maxlength="4" /><span class="petunjuk">Dua sampai empat huruf, tampil di lingkaran pojok kiri atas.</span></div>
    <div class="isian"><label for="id-nama">Nama situs</label><input id="id-nama" bind:value={idn.namaSitus} /></div>
    <div class="isian"><label for="id-rw">Nama RW</label><input id="id-rw" bind:value={idn.namaRW} /></div>
    <div class="isian"><label for="id-wilayah">Wilayah singkat</label><input id="id-wilayah" bind:value={idn.wilayah} /></div>
    <div class="isian"><label for="id-kaki">Alamat lengkap di kaki halaman</label><input id="id-kaki" bind:value={idn.alamatKaki} /></div>
    <div class="isian">
      <label for="id-situs">Alamat situs</label>
      <input id="id-situs" bind:value={idn.alamatSitus} placeholder="https://permaisukatani.my.id" />
      <span class="petunjuk">Dipakai pada tautan yang disalin ke grup WhatsApp. Ganti di sini kalau nanti pindah alamat, tanpa menyentuh kode.</span>
    </div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "identitas"}>Simpan identitas</button></div>
  </form>
</section>
