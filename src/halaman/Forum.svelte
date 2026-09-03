<script>
  import { KONTEN } from "../inti/nama.js";
  import { isi, konten, muatSuara } from "../keadaan/isi.svelte.js";
  import { beriTahu } from "../keadaan/pesan.svelte.js";
  import { sesi } from "../keadaan/sesi.svelte.js";
  import { POLLING_BAWAAN } from "../inti/bawaan.js";
  import { keDaftar } from "../inti/format.js";
  import { pilihPolling } from "../sumber/data.js";
  import { pesanRamah } from "../sumber/firebase.js";
  import { pergi } from "../keadaan/rute.svelte.js";

  const polling = $derived.by(() => {
    const k = konten(KONTEN.POLLING);
    if (k && k.pertanyaan) {
      return { id: k.id || POLLING_BAWAAN.id, pertanyaan: k.pertanyaan, keterangan: k.keterangan || "", opsi: keDaftar(k.opsi) };
    }
    return POLLING_BAWAAN;
  });

  const suara = $derived(isi.suara);
  const pilihanku = $derived(suara ? suara.milikSaya : null);
  const total = $derived(suara ? suara.hitung.reduce((a, n) => a + n, 0) : 0);

  async function pilih(i) {
    if (!sesi.pengguna) { beriTahu("Masuk dulu untuk ikut memilih."); pergi("/masuk"); return; }
    try {
      await pilihPolling(polling.id, i);
      beriTahu("Suara tercatat. Terima kasih.");
      muatSuara();
    } catch (err) {
      beriTahu(pesanRamah(err));
    }
  }
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Forum dan Polling</span></nav>
<div class="kepala-halaman">
  <p class="alis">Informasi</p>
  <h1>Forum dan polling warga</h1>
  <p>Survei pendapat warga untuk bahan musyawarah. Hasilnya terbuka, tetapi keputusan akhir tetap diambil dalam rapat warga.</p>
</div>

<section class="blok">
  <div class="kartu">
    <p class="alis">Polling berjalan</p>
    {#if !polling.pertanyaan || !polling.opsi.length}
      <p class="kosong">Belum ada polling yang dibuka pengurus.</p>
    {:else}
      <h3>{polling.pertanyaan}</h3>
      {#if polling.keterangan}<p>{polling.keterangan}</p>{/if}

      {#if !sesi.pengguna}
        <div class="kunci" style="margin-top:14px">
          <h3>Masuk dulu untuk ikut memilih</h3>
          <p>Polling memakai akun supaya satu warga hanya menyumbang satu suara. Hasilnya tetap bisa dilihat siapa pun tanpa masuk.</p>
          <div class="baris-tombol"><button class="tombol utama" type="button" onclick={() => pergi("/masuk")}>Masuk atau daftar</button></div>
        </div>
      {/if}

      {#if sesi.pengguna && pilihanku === null}
        <div class="polling" style="margin-top:12px">
          {#each polling.opsi as o, i}
            <button class="polling-pilihan" type="button" onclick={() => pilih(i)}>{o}</button>
          {/each}
        </div>
      {:else if suara}
        <div class="polling" style="margin-top:12px">
          {#each polling.opsi as o, i}
            {@const jml = suara.hitung[i] || 0}
            {@const persen = total ? Math.round((jml * 100) / total) : 0}
            <div class="polling-hasil" class:milikku={String(i) === pilihanku}>
              <div class="atas">
                <b>{o}{String(i) === pilihanku ? " \u2014 pilihan Anda" : ""}</b>
                <span>{jml} suara \u00B7 {persen}%</span>
              </div>
              <div class="jalur"><div class="isi" style="width:{persen}%"></div></div>
            </div>
          {/each}
        </div>
        {#if pilihanku !== null}
          <p class="verifikasi">Satu akun satu suara. Suara boleh diubah selama polling berjalan, dan tidak memuat nama siapa pun.</p>
          <div class="baris-tombol" style="margin-top:10px">
            {#each polling.opsi as o, i}
              {#if String(i) !== pilihanku}
                <button class="tombol" type="button" onclick={() => pilih(i)}>Ubah ke: {o}</button>
              {/if}
            {/each}
          </div>
        {/if}
      {/if}
    {/if}
  </div>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Musyawarah dan usulan</h2></div>
  <div class="petak petak-2">
    <div class="kartu">
      <h3>Usulan warga</h3>
      <p>Usulan disampaikan melalui halaman Pengaduan dan Aspirasi dengan kategori usulan, atau dititipkan kepada Ketua RT. Seluruh usulan yang masuk dibahas pada rapat pengurus terdekat.</p>
      <div class="baris-tombol" style="margin-top:8px"><a class="tombol" href="#/pengaduan">Sampaikan usulan</a></div>
    </div>
    <div class="kartu">
      <h3>Pemilihan pengurus</h3>
      <p>Polling di situs dipakai untuk menjaring pendapat, bukan menggantikan pemungutan suara. Pemilihan pengurus RW tetap dilakukan dalam rapat warga sesuai ketentuan yang berlaku.</p>
    </div>
  </div>
</section>
