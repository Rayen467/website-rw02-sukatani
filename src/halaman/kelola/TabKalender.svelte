<script>
  import { onMount } from "svelte";
  import { isi, muatKonten } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { simpanKonten } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";
  import { tanggalHariIni } from "../../inti/format.js";

  const KALENDER_KEY = "kalender";
  const KATEGORI = ["Kegiatan warga", "Hari besar / libur", "Keagamaan", "Kebangsaan", "Rapat", "Kesehatan", "Olahraga", "Ulang tahun / HUT", "Lainnya"];
  let acara = $state([]);
  let baru = $state({ judul: "", tanggal: tanggalHariIni(), mulai: "", selesai: "", tempat: "", kategori: "Kegiatan warga", ulang: "tidak", keterangan: "", tampil: "true" });
  let sibuk = $state(false);
  let dimuat = $state(false);

  const dok = $derived(isi.konten?.[KALENDER_KEY] || null);

  function parse(teks) {
    try { const v = JSON.parse(String(teks || "")); return Array.isArray(v) ? v : []; }
    catch { return []; }
  }

  onMount(() => { muatKonten(KALENDER_KEY); });
  $effect(() => {
    if (!dimuat && dok) {
      acara = parse(dok.acara).sort((a, b) => String(a.tanggal || "").localeCompare(String(b.tanggal || "")));
      dimuat = true;
    }
  });

  function idBaru() { return globalThis.crypto?.randomUUID?.() || `acara-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
  function tambah() {
    if (!baru.judul.trim() || !baru.tanggal) { beriTahu("Judul dan tanggal acara wajib diisi."); return; }
    acara = [...acara, { ...baru, id: idBaru() }].sort((a, b) => String(a.tanggal || "").localeCompare(String(b.tanggal || "")));
    baru = { judul: "", tanggal: tanggalHariIni(), mulai: "", selesai: "", tempat: "", kategori: "Kegiatan warga", ulang: "tidak", keterangan: "", tampil: "true" };
  }
  function hapus(id) { if (confirm("Hapus acara ini dari kalender?")) acara = acara.filter((a) => a.id !== id); }

  async function simpan() {
    sibuk = true;
    try {
      await simpanKonten(KALENDER_KEY, { acara: JSON.stringify(acara) });
      await muatKonten(KALENDER_KEY);
      beriTahu("Kalender tersimpan. Acara langsung dipakai halaman Kalender warga.");
    } catch (err) { beriTahu(err?.code ? pesanRamah(err) : (err?.message || "Kalender belum tersimpan.")); }
    finally { sibuk = false; }
  }
</script>

<section class="blok">
  <div class="kepala-bagian"><div><h2>Kalender acara & hari penting</h2><p>Kelola acara RW, hari besar, kegiatan keagamaan, agenda kebangsaan, HUT, rapat, dan kegiatan warga tanpa mengubah kode.</p></div></div>
  <div class="catatan" style="margin-bottom:18px"><b>Kalender publik menggabungkan tiga sumber:</b> acara di halaman ini, agenda dari Berita, dan jadwal fasilitas/reservasi. Untuk acara seperti 17 Agustus atau HUT yang berulang tiap tahun, pilih <b>Ulang setiap tahun</b>.</div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); tambah(); }}>
    <div class="isian"><label for="ka-judul">Nama acara</label><input id="ka-judul" bind:value={baru.judul} required placeholder="Peringatan HUT RI / Maulid Nabi / Rapat Warga" /></div>
    <div class="isian"><label for="ka-tanggal">Tanggal</label><input id="ka-tanggal" type="date" bind:value={baru.tanggal} required /></div>
    <div class="isian"><label for="ka-mulai">Jam mulai</label><input id="ka-mulai" type="time" bind:value={baru.mulai} /></div>
    <div class="isian"><label for="ka-selesai">Jam selesai</label><input id="ka-selesai" type="time" bind:value={baru.selesai} /></div>
    <div class="isian"><label for="ka-kategori">Kategori</label><select id="ka-kategori" bind:value={baru.kategori}>{#each KATEGORI as k}<option>{k}</option>{/each}</select></div>
    <div class="isian"><label for="ka-ulang">Pengulangan</label><select id="ka-ulang" bind:value={baru.ulang}><option value="tidak">Tidak berulang</option><option value="tahunan">Ulang setiap tahun</option></select></div>
    <div class="isian"><label for="ka-tempat">Tempat</label><input id="ka-tempat" bind:value={baru.tempat} placeholder="Balai Warga / GOR / Musala" /></div>
    <div class="isian wide"><label for="ka-ket">Keterangan</label><textarea id="ka-ket" bind:value={baru.keterangan}></textarea></div>
    <div><button class="tombol" type="submit">+ Tambahkan ke daftar</button></div>
  </form>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Daftar acara</h2><span>{acara.length} acara</span></div>
  {#if acara.length}
    <div class="kal-admin-list">
      {#each acara as a}
        <article class="kal-admin-card">
          <div class="kal-admin-title"><b>{a.judul || "Acara"}</b><span>{a.tanggal || "-"} · {a.kategori || "Lainnya"}</span></div>
          <div class="isian-borang ringkas">
            <div class="isian"><label>Judul</label><input bind:value={a.judul} /></div>
            <div class="isian"><label>Tanggal</label><input type="date" bind:value={a.tanggal} /></div>
            <div class="isian"><label>Mulai</label><input type="time" bind:value={a.mulai} /></div>
            <div class="isian"><label>Selesai</label><input type="time" bind:value={a.selesai} /></div>
            <div class="isian"><label>Kategori</label><select bind:value={a.kategori}>{#each KATEGORI as k}<option>{k}</option>{/each}</select></div>
            <div class="isian"><label>Pengulangan</label><select bind:value={a.ulang}><option value="tidak">Tidak</option><option value="tahunan">Tahunan</option></select></div>
            <div class="isian"><label>Tempat</label><input bind:value={a.tempat} /></div>
            <div class="isian"><label>Tampil</label><select bind:value={a.tampil}><option value="true">Tampil</option><option value="false">Sembunyikan</option></select></div>
            <div class="isian wide"><label>Keterangan</label><textarea bind:value={a.keterangan}></textarea></div>
          </div>
          <button class="tombol" type="button" onclick={() => hapus(a.id)}>Hapus acara</button>
        </article>
      {/each}
    </div>
  {:else}<p class="kosong">Belum ada acara khusus. Agenda Berita dan jadwal reservasi tetap bisa tampil di kalender publik.</p>{/if}
</section>

<div class="kal-save"><span><b>Simpan setelah selesai mengubah daftar.</b> Acara tahunan otomatis muncul pada tanggal yang sama di tahun berikutnya.</span><button class="tombol utama" type="button" onclick={simpan} disabled={sibuk}>{sibuk ? "Menyimpan..." : "Simpan kalender"}</button></div>

<style>.kal-admin-list{display:grid;gap:14px}.kal-admin-card{padding:18px;border:1px solid #dae7e0;border-radius:14px;background:#fff}.kal-admin-title{display:flex;justify-content:space-between;gap:12px;margin-bottom:14px}.kal-admin-title span{font-size:12px;color:#667a72}.kal-save{position:sticky;bottom:14px;z-index:5;display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:18px;padding:14px 16px;border:1px solid #a9d0c1;border-radius:14px;background:rgba(245,252,249,.96);box-shadow:0 12px 30px rgba(10,70,55,.12)}@media(max-width:720px){.kal-save,.kal-admin-title{align-items:stretch;flex-direction:column}}</style>