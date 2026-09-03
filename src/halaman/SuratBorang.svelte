<script>
  import { KOLEKSI } from "../inti/nama.js";
  import { pakai, muatMilikSaya } from "../keadaan/isi.svelte.js";
  import { beriTahu } from "../keadaan/pesan.svelte.js";
  import { sesi } from "../keadaan/sesi.svelte.js";
  import { JENIS_SURAT_BAWAAN, RT_BAWAAN } from "../inti/bawaan.js";
  import { keDaftar } from "../inti/format.js";
  import { nomorAntrean } from "../inti/peramban.js";
  import { kirimWarga } from "../sumber/data.js";
  import { pesanRamah } from "../sumber/firebase.js";
  import { pergi } from "../keadaan/rute.svelte.js";
  import TidakAda from "./TidakAda.svelte";

  let { kunci } = $props();

  const surat = $derived(
    pakai("jenis_surat", JENIS_SURAT_BAWAAN)
      .map((s) => ({ ...s, daftarSyarat: Array.isArray(s.syarat) ? s.syarat : keDaftar(s.syarat) }))
      .find((s) => s.id === kunci)
  );

  let form = $state({ nama: "", nik: "", ttl: "", alamat: "", rt: RT_BAWAAN[0], keperluan: "", wa: "" });
  let mengirim = $state(false);
  let antrean = $state("");

  async function kirim(e) {
    e.preventDefault();
    if (!sesi.pengguna) { beriTahu("Masuk dulu supaya pengajuan bisa Anda lacak sendiri."); pergi("/masuk"); return; }
    if (!sesi.terverifikasi) { beriTahu("Pastikan email Anda dulu lewat tautan yang kami kirim."); return; }
    mengirim = true;
    const nomor = nomorAntrean("SP");
    try {
      await kirimWarga(KOLEKSI.SURAT, { jenis: surat.nama, antrean: nomor, ...form });
      antrean = nomor;
      try { localStorage.setItem("surat-terakhir", JSON.stringify({ jenis: kunci, antrean: nomor, ...form })); } catch (err) {}
      beriTahu("Pengajuan terkirim. Nomor antrean " + nomor + ".");
      if (sesi.pengguna) muatMilikSaya(sesi.pengguna.uid);
    } catch (err) {
      beriTahu(pesanRamah(err));
    }
    mengirim = false;
  }
</script>

{#if !surat}
  <TidakAda />
{:else}
  <nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><a href="#/surat">Pengajuan Surat</a><span>&rsaquo;</span><span>{surat.nama}</span></nav>
  <div class="kepala-halaman">
    <p class="alis">Pengajuan surat</p>
    <h1>{surat.nama}</h1>
    <p>Perkiraan selesai {surat.estimasi || "\u2026\u2026"}. Isi keterangan di bawah sesuai yang tertulis di Kartu Keluarga.</p>
  </div>

  {#if surat.daftarSyarat.length}
    <section class="blok">
      <div class="kartu">
        <h3>Syarat yang harus dibawa</h3>
        <ul class="poin">{#each surat.daftarSyarat as sy}<li>{sy}</li>{/each}</ul>
      </div>
    </section>
  {/if}

  {#if antrean}
    <div class="catatan">
      <b>Pengajuan tercatat.</b> Nomor antrean Anda <b class="mono">{antrean}</b>.
      Simpan nomor ini dan tunjukkan kepada pengurus.
    </div>
    <div class="baris-tombol" style="margin-top:14px">
      <a class="tombol utama" href="#/surat/{surat.id}/cetak">Lihat dan cetak berkas</a>
      <a class="tombol" href="#/akun">Lacak di Akun Saya</a>
    </div>
  {:else}
    <form class="isian-borang" onsubmit={kirim}>
      <div class="isian"><label for="s-nama">Nama lengkap sesuai KTP</label><input id="s-nama" bind:value={form.nama} required /></div>
      <div class="isian">
        <label for="s-nik">Nomor induk kependudukan</label>
        <input id="s-nik" bind:value={form.nik} inputmode="numeric" required />
        <span class="petunjuk">Hanya dipakai untuk mengisi berkas. Tidak pernah ditampilkan di halaman publik mana pun.</span>
      </div>
      <div class="isian"><label for="s-ttl">Tempat dan tanggal lahir</label><input id="s-ttl" bind:value={form.ttl} /></div>
      <div class="isian"><label for="s-alamat">Alamat di dalam kawasan</label><input id="s-alamat" bind:value={form.alamat} placeholder="Blok dan nomor rumah" required /></div>
      <div class="isian"><label for="s-rt">RT</label><select id="s-rt" bind:value={form.rt}>{#each RT_BAWAAN as r}<option>{r}</option>{/each}</select></div>
      <div class="isian"><label for="s-keperluan">Keperluan surat</label><textarea id="s-keperluan" bind:value={form.keperluan} placeholder="Jelaskan singkat untuk apa surat ini dipakai."></textarea></div>
      <div class="isian"><label for="s-wa">Nomor WhatsApp</label><input id="s-wa" bind:value={form.wa} inputmode="tel" /></div>
      <div><button class="tombol utama" type="submit" disabled={mengirim}>{mengirim ? "Mengirim..." : "Kirim pengajuan"}</button></div>
      {#if !sesi.pengguna}
        <p class="catatan-borang">Anda belum masuk. Dengan akun, pengajuan ini bisa Anda lacak sendiri di halaman Akun Saya.</p>
      {/if}
    </form>
  {/if}
{/if}
