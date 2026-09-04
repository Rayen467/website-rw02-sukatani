<script>
  /**
   * Menempel banyak baris sekaligus dari Excel, Sheets, atau WhatsApp.
   *
   * ALURNYA SENGAJA TIGA LANGKAH, BUKAN SATU
   *      tempel  ->  PRATINJAU  ->  simpan
   *
   * Langkah tengah itu yang penting. Data tempelan hampir selalu ada yang
   * meleset: kolom tertukar, baris judul ikut tersalin, ada baris kosong di
   * tengah. Menyimpan langsung berarti pengurus baru sadar setelah tiga
   * puluh baris sampah masuk ke situs, dan membersihkannya satu-satu jauh
   * lebih lama daripada mengetiknya dari awal.
   *
   * Jadi: yang salah ditandai merah dan tidak ikut disimpan, jumlahnya
   * disebut jelas, dan tombol simpan menyebut berapa baris yang akan masuk.
   *
   * CARA MEMAKAI
   *     <TempelMassal
   *       kolom={[
   *         { nama: "tgl", label: "Tanggal", wajib: true },
   *         { nama: "ket", label: "Keterangan", wajib: true },
   *         { nama: "nominal", label: "Nominal", jenis: "angka", wajib: true }
   *       ]}
   *       contoh={"2026-09-01\tIuran bulanan\t250000"}
   *       saatSimpan={async (baris) => { ... }}
   *     />
   */
  import { uraiTabel, barisJudul, angkaDari, rupiah } from "../inti/format.js";
  import { beriTahu } from "../keadaan/pesan.svelte.js";
  import { pesanRamah } from "../sumber/firebase.js";

  let { kolom = [], contoh = "", saatSimpan = null, petunjuk = "" } = $props();

  let teks = $state("");
  let sibuk = $state(false);
  let kemajuan = $state("");

  /* Baris mentah hasil tempelan, sudah dibuang baris judulnya. */
  const mentah = $derived.by(() => {
    const semua = uraiTabel(teks);
    if (semua.length && barisJudul(semua[0])) return semua.slice(1);
    return semua;
  });

  /* Tiap baris diperiksa dan diberi keterangan salahnya, bukan sekadar
     dibuang. Pengurus perlu tahu baris mana yang bermasalah dan kenapa. */
  const diperiksa = $derived(
    mentah.map((sel, i) => {
      const nilai = {};
      const salah = [];
      kolom.forEach((k, j) => {
        const isian = (sel[j] || "").trim();
        if (k.wajib && !isian) salah.push(k.label + " kosong");
        nilai[k.nama] = k.jenis === "angka" ? String(angkaDari(isian)) : isian;
        if (k.jenis === "angka" && isian && angkaDari(isian) === 0 && !/^0+$/.test(isian)) {
          salah.push(k.label + " bukan angka");
        }
      });
      return { nomor: i + 1, nilai, salah, sel };
    })
  );

  const sah = $derived(diperiksa.filter((b) => !b.salah.length));
  const cacat = $derived(diperiksa.filter((b) => b.salah.length));

  async function simpan() {
    if (!sah.length || !saatSimpan) return;
    sibuk = true;
    let masuk = 0;
    try {
      for (let i = 0; i < sah.length; i++) {
        kemajuan = "Menyimpan baris " + (i + 1) + " dari " + sah.length + "...";
        await saatSimpan(sah[i].nilai);
        masuk += 1;
      }
      teks = "";
      beriTahu(masuk + " baris tersimpan.");
    } catch (err) {
      /* Yang sudah masuk tetap tersimpan. Menyebut angkanya penting supaya
         pengurus tahu harus menempel ulang dari baris ke berapa. */
      beriTahu(
        masuk + " baris tersimpan, sisanya gagal: " + pesanRamah(err)
      );
    }
    kemajuan = "";
    sibuk = false;
  }
</script>

<div class="tempel">
  <div class="isian">
    <label for="tempel-kotak">Tempel dari Excel, Google Sheets, atau catatan</label>
    <textarea
      id="tempel-kotak"
      bind:value={teks}
      placeholder={contoh}
      spellcheck="false"
    ></textarea>
    <span class="petunjuk">
      Salin barisnya dari mana saja lalu tempel di sini. Urutan kolomnya:
      <b>{kolom.map((k) => k.label).join(" · ")}</b>.
      Baris judul boleh ikut tersalin, nanti dilewati sendiri.
      {petunjuk}
    </span>
  </div>

  {#if diperiksa.length}
    <div class="tabel-bungkus">
      <table class="data">
        <thead>
          <tr>
            <th>#</th>
            {#each kolom as k}<th>{k.label}</th>{/each}
            <th>Periksa</th>
          </tr>
        </thead>
        <tbody>
          {#each diperiksa as b}
            <tr class:baris-cacat={b.salah.length}>
              <td class="mono">{b.nomor}</td>
              {#each kolom as k}
                <td>
                  {#if k.jenis === "angka" && b.nilai[k.nama]}
                    {rupiah(b.nilai[k.nama])}
                  {:else}
                    {b.nilai[k.nama] || "—"}
                  {/if}
                </td>
              {/each}
              <td>
                {#if b.salah.length}
                  <span class="status tolak">{b.salah.join(", ")}</span>
                {:else}
                  <span class="status selesai">Siap</span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="baris-tombol">
      <button class="tombol utama" type="button" onclick={simpan} disabled={sibuk || !sah.length}>
        {sibuk ? "Menyimpan..." : "Simpan " + sah.length + " baris"}
      </button>
      <button class="tombol" type="button" onclick={() => (teks = "")} disabled={sibuk}>Kosongkan</button>
      {#if kemajuan}<span class="petunjuk">{kemajuan}</span>{/if}
    </div>

    {#if cacat.length}
      <p class="catatan-borang">
        <b>{cacat.length} baris tidak akan disimpan</b> karena ada isian yang kurang.
        Betulkan di sumbernya lalu tempel ulang, atau biarkan dan masukkan sisanya lewat borang biasa.
      </p>
    {/if}
  {/if}
</div>
