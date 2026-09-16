<script>
  import { onMount } from "svelte";
  import { isi, pakai, muatKonten } from "../keadaan/isi.svelte.js";
  import { RUTIN_BAWAAN } from "../inti/bawaan.js";
  import { NAMA_BULAN } from "../inti/format.js";
  import Belum from "../komponen/Belum.svelte";

  const KALENDER_KEY = "kalender";
  const kini = new Date();
  let tahun = $state(kini.getFullYear());
  let bulan = $state(kini.getMonth());
  let terpilih = $state(null);

  onMount(() => { muatKonten(KALENDER_KEY); });

  function parse(teks) {
    try { const v = JSON.parse(String(teks || "")); return Array.isArray(v) ? v : []; }
    catch { return []; }
  }

  function tanggalAcara(a) {
    const asli = String(a?.tanggal || "");
    if (!asli) return "";
    if (a?.ulang === "tahunan" && /^\d{4}-\d{2}-\d{2}$/.test(asli)) return `${tahun}-${asli.slice(5)}`;
    return asli;
  }

  const rutin = $derived(pakai("rutin", RUTIN_BAWAAN));
  const acaraKhusus = $derived.by(() => {
    const dok = isi.konten?.[KALENDER_KEY] || {};
    return parse(dok.acara)
      .filter((a) => a && String(a.tampil) !== "false")
      .map((a) => ({ ...a, sumber: "acara", tanggalEfektif: tanggalAcara(a) }));
  });

  const agendaBerita = $derived((isi.pengumuman || [])
    .filter((o) => o.tipe === "agenda" && o.tanggal)
    .map((o) => ({ id: o.id, judul: o.judul, tanggalEfektif: o.tanggal, mulai: "", selesai: "", tempat: "", kategori: "Agenda berita", keterangan: o.ringkas || o.isi || "", sumber: "berita" })));

  const jadwalFasilitas = $derived((isi.jadwal || [])
    .filter((o) => o.tanggal || /^\d{4}-\d{2}-\d{2}$/.test(String(o.id || "")))
    .map((o) => ({ id: o.id, judul: o.fasilitas ? `Pemakaian ${o.fasilitas}` : "Jadwal fasilitas", tanggalEfektif: o.tanggal || o.id, mulai: o.jam || "", selesai: "", tempat: o.fasilitas || "", kategori: "Fasilitas", keterangan: "Jadwal penggunaan fasilitas RW.", sumber: "fasilitas" })));

  const semuaAcara = $derived([...acaraKhusus, ...agendaBerita, ...jadwalFasilitas]);

  const sel = $derived.by(() => {
    const jumlahHari = new Date(tahun, bulan + 1, 0).getDate();
    const mulai = (new Date(tahun, bulan, 1).getDay() + 6) % 7;
    const hasil = [];
    for (let i = 0; i < mulai; i++) hasil.push(null);
    for (let d = 1; d <= jumlahHari; d++) {
      const iso = tahun + "-" + String(bulan + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0");
      hasil.push({ hari: d, iso, acara: semuaAcara.filter((a) => a.tanggalEfektif === iso) });
    }
    while (hasil.length % 7 !== 0) hasil.push(null);
    return hasil;
  });

  const agendaBulan = $derived(sel.filter(Boolean).flatMap((s) => s.acara.map((a) => ({ ...a, tanggalEfektif: s.iso }))).sort((a, b) => String(a.tanggalEfektif).localeCompare(String(b.tanggalEfektif)) || String(a.mulai || "").localeCompare(String(b.mulai || ""))));

  function geser(n) {
    let b = bulan + n, t = tahun;
    if (b < 0) { b = 11; t--; }
    if (b > 11) { b = 0; t++; }
    bulan = b; tahun = t; terpilih = null;
  }

  function hariIni() { tahun = kini.getFullYear(); bulan = kini.getMonth(); terpilih = null; }
  function labelSumber(a) { return a.sumber === "berita" ? "Agenda berita" : a.sumber === "fasilitas" ? "Jadwal fasilitas" : (a.kategori || "Kegiatan"); }
  function waktuAcara(a) { return [a.mulai, a.selesai].filter(Boolean).join("–") || "Sepanjang hari / waktu belum diisi"; }
</script>

<nav class="remah"><a href="#/">Beranda</a><span>›</span><span>Kalender Kegiatan</span></nav>
<div class="kepala-halaman">
  <p class="alis">Informasi</p>
  <h1>Kalender kegiatan</h1>
  <p>Agenda RW, kegiatan warga, hari penting, dan jadwal fasilitas dalam satu kalender.</p>
</div>

<section class="blok">
  <div class="kalender kalender-pro">
    <div class="kalender-kepala">
      <div><span class="kal-sub">Kalender RW 02</span><b>{NAMA_BULAN[bulan]} {tahun}</b></div>
      <span class="baris-tombol">
        <button class="tombol" type="button" onclick={() => geser(-1)} aria-label="Bulan sebelumnya">←</button>
        <button class="tombol" type="button" onclick={hariIni}>Hari ini</button>
        <button class="tombol" type="button" onclick={() => geser(1)} aria-label="Bulan berikutnya">→</button>
      </span>
    </div>
    <div class="kalender-petak">
      {#each ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"] as h}<div class="hari">{h}</div>{/each}
      {#each sel as s}
        {#if s}
          <div class:kal-hari-ini={s.iso === kini.toISOString().slice(0,10)} class:kal-ada={s.acara.length > 0} class="kalender-sel">
            <span class="angka-hari">{s.hari}</span>
            <div class="kal-acara-list">
              {#each s.acara as a}
                <button class:kal-berita={a.sumber === "berita"} class:kal-fasilitas={a.sumber === "fasilitas"} class="acara agenda kal-acara" type="button" onclick={() => (terpilih = { ...a, tanggalEfektif: s.iso })} title={a.judul}>{a.judul}</button>
              {/each}
            </div>
          </div>
        {:else}<div class="kalender-sel redup"></div>{/if}
      {/each}
    </div>
  </div>
</section>

{#if terpilih}
  <section class="blok kal-detail">
    <div class="kepala-bagian"><div><span class="kal-badge">{labelSumber(terpilih)}</span><h2>{terpilih.judul}</h2></div><button class="tombol" type="button" onclick={() => (terpilih = null)}>Tutup</button></div>
    <div class="kal-detail-grid">
      <div><span>Tanggal</span><b>{terpilih.tanggalEfektif}</b></div>
      <div><span>Waktu</span><b>{waktuAcara(terpilih)}</b></div>
      <div><span>Tempat</span><b>{terpilih.tempat || "Belum diisi"}</b></div>
      <div><span>Pengulangan</span><b>{terpilih.ulang === "tahunan" ? "Setiap tahun" : "Tidak berulang"}</b></div>
    </div>
    {#if terpilih.keterangan}<p>{terpilih.keterangan}</p>{/if}
  </section>
{/if}

<section class="blok">
  <div class="kepala-bagian"><h2>Agenda bulan ini</h2><span>{agendaBulan.length} kegiatan</span></div>
  {#if agendaBulan.length}
    <div class="kal-agenda-bulan">
      {#each agendaBulan as a}
        <button type="button" onclick={() => (terpilih = a)}>
          <time datetime={a.tanggalEfektif}><b>{a.tanggalEfektif.slice(8,10)}</b><span>{NAMA_BULAN[bulan].slice(0,3)}</span></time>
          <span class="kal-agenda-copy"><b>{a.judul}</b><small>{labelSumber(a)} · {waktuAcara(a)}{a.tempat ? " · " + a.tempat : ""}</small></span>
          <span aria-hidden="true">›</span>
        </button>
      {/each}
    </div>
  {:else}<p class="kosong">Belum ada agenda pada bulan ini. Petugas dapat menambahkannya dari Portal Petugas → Kalender & acara.</p>{/if}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Kegiatan rutin</h2></div>
  <div class="tabel-bungkus"><table class="data"><thead><tr><th>Kegiatan</th><th>Waktu</th><th>Tempat</th></tr></thead><tbody>{#each rutin as r}<tr><td>{r.kegiatan}</td><td><Belum nilai={r.waktu} /></td><td><Belum nilai={r.tempat} /></td></tr>{/each}</tbody></table></div>
  <p class="verifikasi">Kegiatan rutin diatur Petugas secara terpisah dari acara satu kali agar jadwal mingguan/bulanan tidak perlu dibuat berulang.</p>
</section>

<style>
  .kalender-pro .kalender-kepala>div{display:grid;gap:3px}.kal-sub{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#6b7d75}.kalender-pro .kalender-kepala b{font-size:22px}.kal-acara-list{display:grid;gap:4px;margin-top:8px}.kal-acara{width:100%;border:0;text-align:left;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kal-acara.kal-berita{background:#eef5ff;color:#315d8a}.kal-acara.kal-fasilitas{background:#fff4e8;color:#8b5a20}.kal-hari-ini .angka-hari{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:#0a765d;color:white}.kal-ada{background:#fbfefc}.kal-detail{border-color:#b8d9cc;background:linear-gradient(180deg,#f8fdfa,#fff)}.kal-badge{display:inline-flex;padding:4px 8px;margin-bottom:6px;border-radius:999px;background:#e6f5ef;color:#0b765d;font-size:11px;font-weight:800}.kal-detail-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:14px 0}.kal-detail-grid div{display:grid;gap:3px;padding:12px;border:1px solid #e0e9e5;border-radius:10px;background:#fff}.kal-detail-grid span{font-size:11px;color:#718079}.kal-detail p{white-space:pre-line;color:#566760}.kal-agenda-bulan{display:grid;gap:8px}.kal-agenda-bulan button{display:grid;grid-template-columns:54px 1fr auto;gap:12px;align-items:center;width:100%;padding:10px 12px;border:1px solid #e1e9e5;border-radius:12px;background:#fff;text-align:left;cursor:pointer}.kal-agenda-bulan button:hover{border-color:#a9d0c1;background:#f9fdfb}.kal-agenda-bulan time{display:grid;place-items:center;padding:6px;border-radius:9px;background:#edf7f3;color:#0a765d}.kal-agenda-bulan time b{font-size:18px}.kal-agenda-bulan time span{font-size:10px;text-transform:uppercase}.kal-agenda-copy{display:grid;gap:2px}.kal-agenda-copy small{color:#6b7b75}@media(max-width:760px){.kal-detail-grid{grid-template-columns:1fr 1fr}.kalender-pro .kalender-sel{min-height:82px}.kal-acara{font-size:10px;padding:3px 4px}}@media(max-width:520px){.kal-detail-grid{grid-template-columns:1fr}.kalender-pro .kalender-petak{font-size:11px}.kalender-pro .kalender-sel{min-height:70px;padding:5px}.kal-acara-list{display:none}.kal-ada::after{content:"•";color:#0a765d;font-size:20px;line-height:10px}.kal-agenda-bulan button{grid-template-columns:48px 1fr auto}}
</style>