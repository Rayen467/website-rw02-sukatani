<script>
  import { onMount } from "svelte";
  import { isi, muatKonten } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { simpanKonten } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";

  const CMS_KEY = "cms_halaman";
  const PILIHAN = [
    ["beranda", "Beranda"], ["profil", "Profil"], ["layanan", "Layanan"],
    ["berita", "Berita"], ["transparansi", "Transparansi"], ["umkm", "UMKM"],
    ["kontak", "Kontak"], ["kalender", "Kalender"], ["galeri", "Galeri"],
    ["program", "Program"], ["kas", "Kas"], ["bansos", "Bansos"], ["tautan", "Tautan"]
  ];
  const MODE = [
    { nilai: "normal", label: "Normal + blok tambahan" },
    { nilai: "custom", label: "Halaman kustom penuh" }
  ];

  function bacaJson(teks, bawaan) {
    try { return JSON.parse(String(teks || "")) ?? bawaan; }
    catch { return bawaan; }
  }

  let dipilih = $state("beranda");
  let form = $state({ aktif: "true", mode: "normal", alis: "", judul: "", subjudul: "" });
  let blok = $state([]);
  let baru = $state({ jenis: "teks", posisi: "bawah", alis: "", judul: "", isi: "", gambar: "", alt: "", tombol: "", url: "", tampil: "true" });
  let sibuk = $state(false);
  let terakhirDimuat = $state("");

  onMount(() => { muatKonten(CMS_KEY); });
  const dokumen = $derived(isi.konten?.[CMS_KEY] || {});

  function semuaHalaman() { return bacaJson(dokumen.halaman, {}); }
  function semuaBlok() { return bacaJson(dokumen.blok, []); }

  function muatForm() {
    const cfg = semuaHalaman()[dipilih] || {};
    form = { aktif: String(cfg.aktif ?? "true"), mode: cfg.mode || "normal", alis: cfg.alis || "", judul: cfg.judul || "", subjudul: cfg.subjudul || "" };
    blok = semuaBlok().filter((b) => b?.halaman === dipilih).sort((a, b) => Number(a.urutan || 0) - Number(b.urutan || 0)).map((b) => ({ ...b }));
  }

  $effect(() => {
    const versi = `${dokumen.diubah?.seconds || ""}|${dokumen.halaman || ""}|${dokumen.blok || ""}`;
    if (versi && versi !== terakhirDimuat && !sibuk) { terakhirDimuat = versi; muatForm(); }
  });

  function gantiHalaman(e) { dipilih = e.currentTarget.value; muatForm(); }
  function idBaru() { return globalThis.crypto?.randomUUID?.() || `blok-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
  function tambahBlok() {
    if (!baru.judul.trim() && !baru.isi.trim() && !baru.gambar.trim()) { beriTahu("Isi judul, teks, atau gambar blok terlebih dahulu."); return; }
    blok = [...blok, { ...baru, id: idBaru(), halaman: dipilih, urutan: blok.length + 1 }];
    baru = { jenis: "teks", posisi: "bawah", alis: "", judul: "", isi: "", gambar: "", alt: "", tombol: "", url: "", tampil: "true" };
  }
  function hapusBlok(id) { blok = blok.filter((b) => b.id !== id); }
  function naik(i) { if (i <= 0) return; const salin = [...blok]; [salin[i - 1], salin[i]] = [salin[i], salin[i - 1]]; blok = salin; }
  function turun(i) { if (i >= blok.length - 1) return; const salin = [...blok]; [salin[i], salin[i + 1]] = [salin[i + 1], salin[i]]; blok = salin; }

  async function simpan() {
    sibuk = true;
    try {
      const halaman = semuaHalaman();
      halaman[dipilih] = { ...form };
      const blokLain = semuaBlok().filter((b) => b?.halaman !== dipilih);
      const blokHalaman = blok.map((b, i) => ({ ...b, halaman: dipilih, urutan: i + 1 }));
      await simpanKonten(CMS_KEY, { halaman: JSON.stringify(halaman), blok: JSON.stringify([...blokLain, ...blokHalaman]) });
      await muatKonten(CMS_KEY);
      beriTahu("Pengaturan halaman tersimpan. Perubahan publik langsung memakai data ini.");
    } catch (err) { beriTahu(err?.code ? pesanRamah(err) : (err?.message || "Belum berhasil menyimpan editor halaman.")); }
    finally { sibuk = false; }
  }
</script>

<section class="blok">
  <div class="kepala-bagian"><div><h2>Editor halaman tanpa coding</h2><p>Atur halaman publik, tambah blok, sembunyikan blok, atau nonaktifkan halaman sementara.</p></div></div>
  <div class="catatan" style="margin-bottom:18px"><b>Mode Normal</b> mempertahankan formulir dan data bawaan lalu menambahkan blok di atas/bawah. <b>Mode Kustom</b> mengganti isi utama dengan blok yang Anda susun. Untuk Layanan, UMKM, Kontak, Kalender, dan halaman interaktif lain, gunakan Mode Normal agar fungsi tetap tersedia.</div>
  <div class="isian-borang">
    <div class="isian"><label for="cms-page">Halaman</label><select id="cms-page" value={dipilih} onchange={gantiHalaman}>{#each PILIHAN as p}<option value={p[0]}>{p[1]}</option>{/each}</select></div>
    <div class="isian"><label for="cms-mode">Mode</label><select id="cms-mode" bind:value={form.mode}>{#each MODE as m}<option value={m.nilai}>{m.label}</option>{/each}</select></div>
    <div class="isian"><label for="cms-aktif">Status halaman</label><select id="cms-aktif" bind:value={form.aktif}><option value="true">Aktif</option><option value="false">Nonaktif sementara</option></select></div>
    <div class="isian"><label for="cms-alis">Label kecil</label><input id="cms-alis" bind:value={form.alis} placeholder="Informasi warga" /></div>
    <div class="isian"><label for="cms-judul">Judul halaman kustom / pesan nonaktif</label><input id="cms-judul" bind:value={form.judul} /></div>
    <div class="isian wide"><label for="cms-sub">Subjudul / penjelasan</label><textarea id="cms-sub" bind:value={form.subjudul}></textarea></div>
  </div>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Tambah blok ke {PILIHAN.find((p) => p[0] === dipilih)?.[1] || dipilih}</h2></div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); tambahBlok(); }}>
    <div class="isian"><label for="cb-jenis">Tipe blok</label><select id="cb-jenis" bind:value={baru.jenis}><option value="teks">Teks</option><option value="sorot">Sorotan</option><option value="dua-kolom">Gambar + teks</option></select></div>
    <div class="isian"><label for="cb-posisi">Posisi</label><select id="cb-posisi" bind:value={baru.posisi}><option value="atas">Di atas isi bawaan</option><option value="bawah">Di bawah isi bawaan</option></select></div>
    <div class="isian"><label for="cb-alis">Label kecil</label><input id="cb-alis" bind:value={baru.alis} /></div>
    <div class="isian"><label for="cb-judul">Judul</label><input id="cb-judul" bind:value={baru.judul} /></div>
    <div class="isian wide"><label for="cb-isi">Isi</label><textarea id="cb-isi" bind:value={baru.isi}></textarea></div>
    <div class="isian"><label for="cb-gambar">URL gambar</label><input id="cb-gambar" bind:value={baru.gambar} inputmode="url" placeholder="https://..." /></div>
    <div class="isian"><label for="cb-alt">Teks alternatif gambar</label><input id="cb-alt" bind:value={baru.alt} /></div>
    <div class="isian"><label for="cb-tombol">Teks tombol</label><input id="cb-tombol" bind:value={baru.tombol} /></div>
    <div class="isian"><label for="cb-url">Alamat tombol</label><input id="cb-url" bind:value={baru.url} placeholder="#/layanan atau https://..." /></div>
    <div><button class="tombol" type="submit">+ Tambah blok</button></div>
  </form>
</section>

{#if blok.length}
  <section class="blok">
    <div class="kepala-bagian"><h2>Blok yang dikelola</h2><span>{blok.length} blok</span></div>
    <div class="cms-editor-list">
      {#each blok as b, i}
        <article class="cms-editor-card">
          <div class="cms-editor-head"><b>{i + 1}. {b.judul || b.alis || "Blok tanpa judul"}</b><span>{b.posisi || "bawah"} · {b.jenis || "teks"}</span></div>
          <div class="isian-borang ringkas">
            <div class="isian"><label>Label</label><input bind:value={b.alis} /></div>
            <div class="isian"><label>Judul</label><input bind:value={b.judul} /></div>
            <div class="isian"><label>Posisi</label><select bind:value={b.posisi}><option value="atas">Atas</option><option value="bawah">Bawah</option></select></div>
            <div class="isian"><label>Tampil</label><select bind:value={b.tampil}><option value="true">Ya</option><option value="false">Sembunyikan</option></select></div>
            <div class="isian wide"><label>Isi</label><textarea bind:value={b.isi}></textarea></div>
            <div class="isian"><label>URL gambar</label><input bind:value={b.gambar} /></div>
            <div class="isian"><label>Teks alternatif</label><input bind:value={b.alt} /></div>
            <div class="isian"><label>Tombol</label><input bind:value={b.tombol} /></div>
            <div class="isian"><label>URL tombol</label><input bind:value={b.url} /></div>
          </div>
          <div class="baris-tombol"><button class="tombol" type="button" onclick={() => naik(i)} disabled={i === 0}>↑ Naik</button><button class="tombol" type="button" onclick={() => turun(i)} disabled={i === blok.length - 1}>↓ Turun</button><button class="tombol" type="button" onclick={() => hapusBlok(b.id)}>Hapus blok</button></div>
        </article>
      {/each}
    </div>
  </section>
{/if}

<div class="cms-savebar"><div><b>Perubahan belum diterapkan sebelum disimpan.</b><span>Data surat, aduan, kas, UMKM, dan layanan lain tidak ikut dihapus saat Anda mengubah layout.</span></div><button class="tombol utama" type="button" onclick={simpan} disabled={sibuk}>{sibuk ? "Menyimpan..." : "Simpan halaman"}</button></div>

<style>.cms-editor-list{display:grid;gap:14px}.cms-editor-card{padding:18px;border:1px solid #d9e6df;border-radius:14px;background:#fff}.cms-editor-head{display:flex;justify-content:space-between;gap:12px;margin-bottom:14px}.cms-editor-head span{font-size:12px;color:#6f8079}.isian-borang.ringkas{margin-bottom:14px}.cms-savebar{position:sticky;bottom:14px;z-index:5;display:flex;justify-content:space-between;gap:20px;align-items:center;margin-top:18px;padding:14px 16px;border:1px solid #a9d0c1;border-radius:14px;background:rgba(245,252,249,.96);box-shadow:0 12px 30px rgba(10,70,55,.12);backdrop-filter:blur(10px)}.cms-savebar div{display:grid;gap:2px}.cms-savebar span{font-size:12px;color:#66766f}@media(max-width:720px){.cms-savebar{align-items:stretch;flex-direction:column}.cms-editor-head{flex-direction:column}}</style>