<script>
  import { KONTEN } from "../../inti/nama.js";
  import { konten, muatKonten } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { simpanKonten } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";
  import { HURUF, PERPADUAN, BAWAAN, terapkanGaya } from "../../keadaan/tampilan.js";

  let g = $state({ ...BAWAAN });
  let sibuk = $state(false);

  $effect(() => { const k = konten(KONTEN.TAMPILAN); if (k) g = { ...BAWAAN, ...k }; });

  /* Pratinjau langsung: pengurus melihat hasilnya sebelum memutuskan. */
  $effect(() => { terapkanGaya(g); });

  async function simpan(e) {
    e.preventDefault();
    sibuk = true;
    try {
      await simpanKonten(KONTEN.TAMPILAN, g);
      beriTahu("Tampilan tersimpan. Berlaku untuk semua warga.");
      muatKonten(KONTEN.TAMPILAN);
    } catch (err) { beriTahu(pesanRamah(err)); }
    sibuk = false;
  }

  async function kembalikan() {
    if (!confirm("Kembalikan seluruh tampilan ke bawaan?")) return;
    g = { ...BAWAAN };
    await simpan(new Event("submit"));
  }
</script>

<section class="blok">
  <div class="kepala-bagian"><h2>Warna situs</h2></div>
  <div class="catatan" style="margin-bottom:18px">
    <b>Perubahan langsung terlihat sebelum disimpan.</b> Warna pendamping dihitung otomatis dari dua warna ini,
    supaya tulisan selalu terbaca baik di tampilan terang maupun gelap.
  </div>

  <div class="kepala-bagian"><h2 style="font-size:16px">Perpaduan siap pakai</h2></div>
  <div class="petak petak-3" style="margin-bottom:22px">
    {#each PERPADUAN as c}
      <button class="kartu" type="button" style="cursor:pointer;text-align:left" onclick={() => { g.utama = c[0]; g.aksen = c[1]; }}>
        <span style="display:flex;gap:8px;margin-bottom:8px">
          <span style="width:36px;height:36px;border-radius:6px;background:{c[0]}"></span>
          <span style="width:36px;height:36px;border-radius:6px;background:{c[1]}"></span>
        </span>
        <span style="font-size:13.5px;font-weight:600">{c[2]}</span>
      </button>
    {/each}
  </div>

  <form class="isian-borang" onsubmit={simpan}>
    <div class="isian">
      <label for="tp-utama">Warna utama</label>
      <input id="tp-utama" type="color" bind:value={g.utama} style="height:52px;padding:4px" />
      <span class="petunjuk">Dipakai untuk kepala halaman, tombol utama, dan penanda menu aktif.</span>
    </div>
    <div class="isian">
      <label for="tp-aksen">Warna penanda</label>
      <input id="tp-aksen" type="color" bind:value={g.aksen} style="height:52px;padding:4px" />
      <span class="petunjuk">Dipakai untuk peringatan, agenda, dan bagian yang belum terisi.</span>
    </div>
    <div class="isian">
      <label for="tp-huruf">Jenis huruf</label>
      <select id="tp-huruf" bind:value={g.huruf}>
        {#each Object.keys(HURUF) as k}<option value={k}>{HURUF[k].nama}</option>{/each}
      </select>
    </div>
    <div class="isian">
      <label for="tp-ukuran">Ukuran huruf</label>
      <select id="tp-ukuran" bind:value={g.ukuran}>
        <option value="15">Kecil (15 piksel)</option>
        <option value="16">Normal (16 piksel)</option>
        <option value="17">Besar (17 piksel)</option>
        <option value="18">Lebih besar (18 piksel)</option>
      </select>
      <span class="petunjuk">Perbesar bila banyak warga lanjut usia yang membuka situs.</span>
    </div>
    <div class="isian">
      <label for="tp-sudut">Bentuk sudut</label>
      <select id="tp-sudut" bind:value={g.sudut}>
        <option value="0">Siku, tegas</option>
        <option value="5">Sedikit membulat</option>
        <option value="10">Membulat</option>
        <option value="16">Sangat membulat</option>
      </select>
    </div>
    <div class="isian">
      <label for="tp-lebar">Lebar halaman</label>
      <select id="tp-lebar" bind:value={g.lebar}>
        <option value="980">Sempit, enak dibaca</option>
        <option value="1120">Normal</option>
        <option value="1320">Lebar</option>
      </select>
    </div>
    <div class="isian">
      <label for="tp-tema">Tampilan bawaan</label>
      <select id="tp-tema" bind:value={g.tema}>
        <option value="sistem">Ikuti setelan HP warga</option>
        <option value="light">Selalu terang</option>
        <option value="dark">Selalu gelap</option>
      </select>
      <span class="petunjuk">Warga yang sudah memilih sendiri lewat tombol di kepala halaman tidak ikut berubah.</span>
    </div>
    <div class="baris-tombol">
      <button class="tombol utama" type="submit" disabled={sibuk}>{sibuk ? "Menyimpan..." : "Simpan tampilan"}</button>
      <button class="tombol" type="button" onclick={kembalikan}>Kembalikan ke bawaan</button>
    </div>
    <p class="catatan-borang">Tampilan berlaku untuk semua warga yang membuka situs, bukan hanya di perangkat ini.</p>
  </form>
</section>
