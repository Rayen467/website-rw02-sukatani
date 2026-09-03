<script>
  import { isi } from "../lib/keadaan.svelte.js";
  import { rupiah } from "../lib/bantu.js";
  import Lencana from "../komponen/Lencana.svelte";

  const daftar = $derived(isi.program || []);
  const hitung = $derived.by(() => {
    const h = { selesai: 0, proses: 0, rencana: 0 };
    daftar.forEach((p) => { if (h[p.status] !== undefined) h[p.status]++; });
    return h;
  });
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Rencana dan Realisasi</span></nav>
<div class="kepala-halaman">
  <p class="alis">Transparansi</p>
  <h1>Rencana dan realisasi program</h1>
  <p>Daftar pekerjaan yang sudah selesai, sedang berjalan, dan direncanakan. Diperbarui setiap rapat pengurus.</p>
</div>

{#if daftar.length}
  <section class="blok">
    <div class="deret-angka">
      <div class="angka baik"><span class="label">Selesai</span><span class="besar">{hitung.selesai}</span><span class="bawah">pekerjaan</span></div>
      <div class="angka"><span class="label">Sedang berjalan</span><span class="besar">{hitung.proses}</span><span class="bawah">pekerjaan</span></div>
      <div class="angka"><span class="label">Direncanakan</span><span class="besar">{hitung.rencana}</span><span class="bawah">pekerjaan</span></div>
      <div class="angka"><span class="label">Seluruhnya</span><span class="besar">{daftar.length}</span><span class="bawah">tercatat</span></div>
    </div>
  </section>

  <section class="blok">
    <div class="tabel-bungkus">
      <table class="data">
        <thead><tr><th>Program</th><th>Tahun</th><th>Status</th><th>Anggaran</th><th>Keterangan</th></tr></thead>
        <tbody>
          {#each daftar as p}
            <tr>
              <td><b>{p.nama}</b></td>
              <td>{p.tahun || "-"}</td>
              <td><Lencana status={p.status} /></td>
              <td class="angka-kanan">{p.anggaran ? rupiah(p.anggaran) : "\u2026\u2026"}</td>
              <td style="font-size:13.5px;color:var(--tinta-2)">{p.ket || ""}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
{:else}
  <p class="kosong">Belum ada program yang dicatat pengurus.</p>
{/if}
