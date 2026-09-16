<script>
  /**
   * Tab Dokumen & video.
   *
   * Dokumen kecil tetap disimpan seperti sebelumnya. Video kegiatan punya
   * jalur unggah khusus ke Firebase Storage supaya tidak dipaksa masuk ke
   * dokumen Firestore yang batas ukurannya jauh lebih kecil.
   */
  import { KOLEKSI } from "../../inti/nama.js";
  import { KATEGORI_BERKAS, CARA_BERKAS } from "../../inti/bawaan.js";
  import { bacaBerkas, BATAS_BERKAS_KB } from "../../inti/peramban.js";
  import { tanggalHariIni } from "../../inti/format.js";
  import { isi, muatKoleksi } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { simpanBerkas, hapusBerkas, ubahDokumen, simpanDokumen, hapusDokumen } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";
  import { BATAS_VIDEO_MB, unggahVideoKegiatan, hapusVideoKegiatan } from "../../sumber/storage.js";

  let videoBaru = $state({ judul: "", ket: "", tgl: tanggalHariIni() });
  let videoDipilih = $state(null);
  let videoKemajuan = $state(0);
  let videoStatus = $state("");

  let b = $state({ judul: "", kategori: "notulen", cara: "unggah", tautan: "", ket: "", tgl: tanggalHariIni() });
  let berkasDipilih = $state(null);
  let sibuk = $state(false);

  let editId = $state("");
  let editCaraLama = $state("");
  let edit = $state({ judul: "", kategori: "notulen", cara: "unggah", tautan: "", ket: "", tgl: "", namaBerkas: "", kb: "" });
  let editBerkas = $state(null);
  let menghapus = $state("");

  const daftar = $derived(isi.berkas || []);
  const labelKategori = (n) => (KATEGORI_BERKAS.find((k) => k.nilai === n) || {}).label || "Lainnya";

  async function simpanVideo(e) {
    e.preventDefault();
    if (!videoBaru.judul.trim()) {
      beriTahu("Isi judul video terlebih dahulu.");
      return;
    }
    if (!videoDipilih) {
      beriTahu("Pilih file video terlebih dahulu.");
      return;
    }

    sibuk = "video";
    videoKemajuan = 0;
    videoStatus = "Menyiapkan unggahan...";
    let jalurTerunggah = "";

    try {
      const hasil = await unggahVideoKegiatan(videoDipilih, (persen) => {
        videoKemajuan = persen;
        videoStatus = persen < 100 ? `Mengunggah video... ${persen}%` : "Menyimpan informasi video...";
      });
      jalurTerunggah = hasil.jalur;

      await simpanBerkas(
        {
          judul: videoBaru.judul.trim(),
          kategori: "video",
          katLabel: "Video kegiatan",
          cara: "tautan",
          tautan: hasil.url,
          namaBerkas: videoDipilih.name,
          kb: Math.ceil(videoDipilih.size / 1024),
          ket: videoBaru.ket.trim(),
          tgl: videoBaru.tgl,
          storagePath: hasil.jalur,
          sumber: "firebase-storage"
        },
        ""
      );

      videoBaru = { judul: "", ket: "", tgl: tanggalHariIni() };
      videoDipilih = null;
      videoKemajuan = 100;
      videoStatus = "Video berhasil dipublikasikan.";
      const input = document.getElementById("video-file");
      if (input) input.value = "";
      await muatKoleksi(KOLEKSI.BERKAS);
      beriTahu("Video berhasil diunggah dan sudah masuk ke Galeri Foto & Video.");
    } catch (err) {
      if (jalurTerunggah) {
        try { await hapusVideoKegiatan(jalurTerunggah); } catch { /* cegah file yatim sebisa mungkin */ }
      }
      videoKemajuan = 0;
      videoStatus = "";
      beriTahu(err?.message || (err?.code ? pesanRamah(err) : "Upload video belum berhasil."));
    } finally {
      sibuk = false;
    }
  }

  async function simpan(e) {
    e.preventDefault();
    sibuk = true;
    try {
      let data = "";
      let namaBerkas = "";
      let kb = 0;

      if (b.cara === "unggah") {
        if (!berkasDipilih) throw new Error("Belum ada berkas dipilih.");
        const hasil = await bacaBerkas(berkasDipilih);
        data = hasil.data;
        namaBerkas = hasil.nama;
        kb = hasil.kb;
      } else if (!b.tautan.trim()) {
        throw new Error("Alamat tautannya belum diisi.");
      }

      await simpanBerkas(
        {
          judul: b.judul,
          kategori: b.kategori,
          katLabel: labelKategori(b.kategori),
          cara: b.cara,
          tautan: b.cara === "tautan" ? b.tautan.trim() : "",
          namaBerkas,
          kb,
          ket: b.ket,
          tgl: b.tgl
        },
        data
      );

      b = { judul: "", kategori: b.kategori, cara: b.cara, tautan: "", ket: "", tgl: tanggalHariIni() };
      berkasDipilih = null;
      beriTahu("Tersimpan.");
      muatKoleksi(KOLEKSI.BERKAS);
    } catch (err) {
      muatKoleksi(KOLEKSI.BERKAS);
      const dasar = err.code ? pesanRamah(err) : err.message;
      beriTahu(
        b.cara === "unggah"
          ? dasar + " Daftar dokumen disegarkan; bila judul muncul tanpa berkas, hapus lalu unggah ulang."
          : dasar
      );
    }
    sibuk = false;
  }

  function bukaEdit(d) {
    editId = d.id;
    editCaraLama = d.cara || "tautan";
    edit = {
      judul: d.judul || "",
      kategori: d.kategori || "lainnya",
      cara: d.cara || "tautan",
      tautan: d.tautan || "",
      ket: d.ket || "",
      tgl: d.tgl || "",
      namaBerkas: d.namaBerkas || "",
      kb: d.kb || ""
    };
    editBerkas = null;
    setTimeout(() => document.getElementById("edit-berkas")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
  }

  function batalEdit() {
    editId = "";
    editCaraLama = "";
    editBerkas = null;
  }

  async function simpanEdit(e) {
    e.preventDefault();
    if (!editId) return;
    sibuk = "edit";
    try {
      const meta = {
        judul: edit.judul,
        kategori: edit.kategori,
        katLabel: labelKategori(edit.kategori),
        cara: edit.cara,
        tautan: edit.cara === "tautan" ? edit.tautan.trim() : "",
        ket: edit.ket,
        tgl: edit.tgl
      };

      if (edit.cara === "tautan") {
        if (!meta.tautan) throw new Error("Alamat tautannya belum diisi.");
        meta.namaBerkas = "";
        meta.kb = "";
        await ubahDokumen(KOLEKSI.BERKAS, editId, meta);
        if (editCaraLama === "unggah") await hapusDokumen(KOLEKSI.BERKAS_ISI, editId);
      } else {
        let hasil = null;
        if (editBerkas) hasil = await bacaBerkas(editBerkas);
        if (!hasil && editCaraLama !== "unggah") throw new Error("Pilih file baru ketika mengubah dokumen tautan menjadi unggahan.");

        meta.namaBerkas = hasil ? hasil.nama : edit.namaBerkas;
        meta.kb = hasil ? hasil.kb : edit.kb;
        await ubahDokumen(KOLEKSI.BERKAS, editId, meta);
        if (hasil) await simpanDokumen(KOLEKSI.BERKAS_ISI, editId, { data: hasil.data }, false);
      }

      await muatKoleksi(KOLEKSI.BERKAS);
      beriTahu("Dokumen diperbarui.");
      batalEdit();
    } catch (err) {
      beriTahu(err?.code ? pesanRamah(err) : (err?.message || "Perubahan belum tersimpan."));
    } finally {
      sibuk = false;
    }
  }

  async function hapus(d) {
    if (!confirm("Hapus \"" + d.judul + "\" dari situs? Tindakan ini tidak bisa dibatalkan.")) return;
    menghapus = d.id;
    try {
      await hapusBerkas(d.id);
      let storageGagal = false;
      if (d.storagePath) {
        try {
          await hapusVideoKegiatan(d.storagePath);
        } catch (errStorage) {
          storageGagal = true;
          console.warn("Metadata video terhapus, tetapi file Storage belum terhapus:", errStorage);
        }
      }
      beriTahu(storageGagal ? "Dihapus dari situs. File video lama belum bisa dibersihkan dari penyimpanan." : "Dihapus.");
      if (editId === d.id) batalEdit();
      muatKoleksi(KOLEKSI.BERKAS);
    } catch (err) {
      beriTahu(pesanRamah(err));
    }
    menghapus = "";
  }
</script>

<section class="blok video-upload-blok">
  <div class="kepala-bagian">
    <div>
      <h2>Upload video kegiatan</h2>
      <p>Unggah video langsung dari HP atau komputer. Video yang selesai diunggah otomatis masuk ke Galeri Foto &amp; Video.</p>
    </div>
  </div>

  <div class="catatan" style="margin-bottom:18px">
    <b>Video disimpan di Firebase Storage, bukan di Firestore.</b>
    Format video umum seperti MP4, WebM, dan MOV didukung. Ukuran maksimal {BATAS_VIDEO_MB} MB per video. Untuk video yang lebih besar, gunakan YouTube atau Google Drive melalui formulir tautan di bawah.
  </div>

  <form class="isian-borang" onsubmit={simpanVideo}>
    <div class="isian">
      <label for="video-judul">Judul video</label>
      <input id="video-judul" bind:value={videoBaru.judul} required placeholder="Kerja Bakti Warga RW 02" />
    </div>
    <div class="isian">
      <label for="video-tgl">Tanggal kegiatan</label>
      <input id="video-tgl" type="date" bind:value={videoBaru.tgl} />
    </div>
    <div class="isian wide">
      <label for="video-ket">Keterangan</label>
      <textarea id="video-ket" bind:value={videoBaru.ket} placeholder="Dokumentasi singkat kegiatan warga."></textarea>
    </div>
    <div class="isian wide">
      <label for="video-file">File video</label>
      <input
        id="video-file"
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/*"
        onchange={(e) => {
          videoDipilih = e.currentTarget.files?.[0] || null;
          videoKemajuan = 0;
          videoStatus = videoDipilih ? `${videoDipilih.name} · ${(videoDipilih.size / 1024 / 1024).toFixed(1)} MB` : "";
        }}
      />
      <span class="petunjuk">Pilih satu video. Jangan tutup halaman selama proses upload berlangsung.</span>
    </div>

    {#if videoStatus}
      <div class="video-progress wide" aria-live="polite">
        <div class="video-progress__atas"><span>{videoStatus}</span><b>{videoKemajuan > 0 ? `${videoKemajuan}%` : ""}</b></div>
        <div class="video-progress__bar"><span style={`width:${videoKemajuan}%`}></span></div>
      </div>
    {/if}

    <div>
      <button class="tombol utama" type="submit" disabled={sibuk === "video" || !videoDipilih}>
        {sibuk === "video" ? `Mengunggah ${videoKemajuan}%` : "Upload & publikasikan video"}
      </button>
    </div>
  </form>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Tambah dokumen atau tautan video</h2></div>

  <div class="catatan" style="margin-bottom:18px">
    <b>Dua cara untuk berkas non-video dan video eksternal.</b>
    Berkas sampai sekitar {BATAS_BERKAS_KB} KB bisa diunggah langsung ke situs &mdash;
    cukup untuk PDF surat, SK, formulir, notulen, dan gambar kecil.
    Untuk video yang sudah ada di YouTube/Google Drive, pilih cara <b>Tautan</b> dan tempel alamatnya di sini.
  </div>

  <form class="isian-borang" onsubmit={simpan}>
    <div class="isian">
      <label for="bk-judul">Judul</label>
      <input id="bk-judul" bind:value={b.judul} required placeholder="Notulen Rapat Warga 12 Januari 2026" />
    </div>

    <div class="isian">
      <label for="bk-kat">Kelompok</label>
      <select id="bk-kat" bind:value={b.kategori}>
        {#each KATEGORI_BERKAS as k}<option value={k.nilai}>{k.label}</option>{/each}
      </select>
    </div>

    <div class="isian">
      <label for="bk-cara">Cara memasukkan</label>
      <select id="bk-cara" bind:value={b.cara}>
        {#each CARA_BERKAS as c}<option value={c.nilai}>{c.label}</option>{/each}
      </select>
    </div>

    {#if b.cara === "unggah"}
      <div class="isian">
        <label for="bk-berkas">Berkas</label>
        <input
          id="bk-berkas"
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,image/*"
          onchange={(e) => (berkasDipilih = e.target.files[0] || null)}
        />
        <span class="petunjuk">PDF, Word, Excel, PowerPoint, atau gambar. Batasnya sekitar {BATAS_BERKAS_KB} KB.</span>
      </div>
    {:else}
      <div class="isian">
        <label for="bk-tautan">Alamat tautan</label>
        <input id="bk-tautan" bind:value={b.tautan} inputmode="url" placeholder="https://drive.google.com/..." />
        <span class="petunjuk">Untuk Google Drive, pastikan berkasnya disetel siapa saja yang memiliki tautan.</span>
      </div>
    {/if}

    <div class="isian"><label for="bk-tgl">Tanggal</label><input id="bk-tgl" type="date" bind:value={b.tgl} /></div>
    <div class="isian"><label for="bk-ket">Keterangan singkat</label><input id="bk-ket" bind:value={b.ket} placeholder="Hasil rapat pembentukan panitia HUT RI" /></div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === true}>{sibuk === true ? "Menyimpan..." : "Simpan"}</button></div>
  </form>
</section>

{#if editId}
  <section class="blok edit-berkas" id="edit-berkas">
    <div class="kepala-bagian"><h2>Ubah dokumen / video</h2><button class="tombol" type="button" onclick={batalEdit}>Batal</button></div>
    <div class="catatan" style="margin-bottom:18px"><b>Edit lengkap.</b> Anda bisa mengganti judul, kategori, tanggal, keterangan, tautan, atau file unggah. File lama tetap dipakai bila mode unggah tidak diganti dan tidak ada file baru dipilih.</div>
    <form class="isian-borang" onsubmit={simpanEdit}>
      <div class="isian"><label for="be-judul">Judul</label><input id="be-judul" bind:value={edit.judul} required /></div>
      <div class="isian"><label for="be-kat">Kelompok</label><select id="be-kat" bind:value={edit.kategori}>{#each KATEGORI_BERKAS as k}<option value={k.nilai}>{k.label}</option>{/each}</select></div>
      <div class="isian"><label for="be-cara">Cara</label><select id="be-cara" bind:value={edit.cara}>{#each CARA_BERKAS as c}<option value={c.nilai}>{c.label}</option>{/each}</select></div>
      {#if edit.cara === "unggah"}
        <div class="isian">
          <label for="be-file">{editCaraLama === "unggah" ? "Ganti file (opsional)" : "File baru"}</label>
          <input id="be-file" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,image/*" onchange={(e) => (editBerkas = e.currentTarget.files?.[0] || null)} />
          <span class="petunjuk">{editBerkas ? `File baru: ${editBerkas.name}` : editCaraLama === "unggah" ? `File sekarang: ${edit.namaBerkas || "tersimpan"}` : "Wajib pilih file untuk beralih dari tautan ke unggahan."}</span>
        </div>
      {:else}
        <div class="isian"><label for="be-tautan">Alamat tautan</label><input id="be-tautan" type="url" bind:value={edit.tautan} placeholder="https://..." /></div>
      {/if}
      <div class="isian"><label for="be-tgl">Tanggal</label><input id="be-tgl" type="date" bind:value={edit.tgl} /></div>
      <div class="isian"><label for="be-ket">Keterangan</label><textarea id="be-ket" bind:value={edit.ket}></textarea></div>
      <div class="baris-tombol"><button class="tombol utama" type="submit" disabled={sibuk === "edit"}>{sibuk === "edit" ? "Menyimpan..." : "Simpan perubahan"}</button><button class="tombol" type="button" onclick={batalEdit}>Batal</button></div>
    </form>
  </section>
{/if}

<section class="blok">
  <div class="kepala-bagian"><h2>Sudah ada di situs</h2></div>
  {#if daftar.length}
    {#each daftar as d}
      <div class="baris-kelola">
        <div class="isi">
          <b>{d.judul}</b>
          <p>{d.katLabel || ""}{d.tgl ? " · " + d.tgl : ""}</p>
          <p>
            {d.storagePath
              ? "Video diunggah: " + (d.namaBerkas || "video") + " (" + (d.kb || 0) + " KB)"
              : d.cara === "tautan"
                ? "Tautan: " + d.tautan
                : "Diunggah: " + (d.namaBerkas || "") + " (" + (d.kb || 0) + " KB)"}
          </p>
          {#if d.ket}<p>{d.ket}</p>{/if}
        </div>
        <div></div>
        <div class="baris-tombol">
          <button class="tombol" type="button" onclick={() => bukaEdit(d)}>{editId === d.id ? "Sedang diubah" : "Ubah"}</button>
          {#if d.tautan}<a class="tombol" href={d.tautan} target="_blank" rel="noopener noreferrer">Buka ↗</a>{/if}
          <button class="tombol" type="button" disabled={menghapus === d.id} onclick={() => hapus(d)}>{menghapus === d.id ? "Menghapus..." : "Hapus"}</button>
        </div>
      </div>
    {/each}
  {:else}
    <p class="kosong">Belum ada dokumen atau video. Yang ditambahkan di sini tampil di halaman Dokumen &amp; Video.</p>
  {/if}
</section>

<style>
  .edit-berkas{border-color:#c9ddd5;background:linear-gradient(180deg,#fbfefd,#fff)}
  .video-upload-blok{border-color:#bcded1;background:linear-gradient(180deg,#f7fcfa,#fff)}
  .video-progress{display:grid;gap:6px;padding:10px 12px;border:1px solid #d9e8e1;border-radius:10px;background:#f8fbf9}.video-progress__atas{display:flex;justify-content:space-between;gap:12px;color:#50665e;font-size:12px}.video-progress__atas b{color:#0a765d}.video-progress__bar{height:8px;overflow:hidden;border-radius:999px;background:#e4ede9}.video-progress__bar span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#159870,#08765d);transition:width .2s ease}
</style>
