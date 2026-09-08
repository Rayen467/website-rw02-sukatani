<script>
  /**
   * Satu baris daftar yang bisa DIUBAH dan DIHAPUS pengurus.
   *
   * Menggantikan BarisHapus, yang cuma bisa menghapus. Sebelum ini, salah
   * ketik satu huruf di judul pengumuman berarti hapus lalu tulis ulang
   * seluruhnya -- dan tanggal terbitnya ikut berubah jadi hari itu.
   *
   * CARA MEMAKAI
   * Tab pemanggil menyebutkan kolom apa saja yang boleh diubah:
   *
   *     <BarisKelola
   *       koleksi={KOLEKSI.PENGUMUMAN}
   *       id={k.id}
   *       judul={k.judul}
   *       baris={[k.tglText, k.ringkas]}
   *       kolom={[
   *         { nama: "judul", label: "Judul" },
   *         { nama: "ringkas", label: "Ringkasan", jenis: "panjang" }
   *       ]}
   *       nilai={k}
   *     />
   *
   * Kolom yang TIDAK disebutkan tidak akan tersentuh saat menyimpan --
   * itu gunanya ubahDokumen(), yang menimpa sebagian saja. Jadi menambah
   * satu kolom baru ke sebuah koleksi tidak berisiko mengosongkannya di
   * baris-baris lama.
   *
   * Kalau kolom dikosongkan, baris ini cuma menampilkan tombol Hapus,
   * sama seperti BarisHapus dulu.
   */
  import { muatKoleksi } from "../keadaan/isi.svelte.js";
  import { beriTahu } from "../keadaan/pesan.svelte.js";
  import { hapusDokumen, ubahDokumen } from "../sumber/data.js";
  import { pesanRamah } from "../sumber/firebase.js";

  let {
    koleksi,
    id,
    judul,
    baris = [],
    kolom = [],
    nilai = {},
    saatUbah = null,
    saatHapus = null,
    olahFoto = null
  } = $props();

  let membuka = $state(false);
  let sibuk = $state("");
  let bentuk = $state({});
  let berkasFoto = $state({});
  let hapusFoto = $state({});

  function buka() {
    /* Nilai lama disalin ke kotak isian. Inilah bedanya dengan cara lama:
       pengurus melihat isi yang sekarang, bukan borang kosong yang harus
       ditebak ulang. */
    const b = {};
    for (const k of kolom) {
      if (k.jenis !== "foto") b[k.nama] = nilai[k.nama] == null ? "" : String(nilai[k.nama]);
    }
    bentuk = b;
    berkasFoto = {};
    hapusFoto = {};
    membuka = true;
  }

  async function simpan(e) {
    e.preventDefault();
    sibuk = "simpan";
    try {
      const kirim = { ...bentuk };

      /* Kolom foto berbeda dengan teks: kalau tidak disentuh, nilainya jangan
         ikut dikirim supaya foto lama tetap ada. Kalau Petugas memilih file
         baru, file diproses lewat olahFoto() sebelum masuk ke Firestore.
         Tombol Hapus foto mengirim string kosong secara eksplisit. */
      for (const k of kolom.filter((x) => x.jenis === "foto")) {
        if (hapusFoto[k.nama]) {
          kirim[k.nama] = "";
        } else if (berkasFoto[k.nama]) {
          if (!olahFoto) throw new Error("pengolah foto belum dipasang");
          kirim[k.nama] = await olahFoto(berkasFoto[k.nama], k);
        }
      }

      if (saatUbah) await saatUbah(id, kirim);
      else await ubahDokumen(koleksi, id, kirim);
      beriTahu("Perubahan tersimpan.");
      membuka = false;
      muatKoleksi(koleksi);
    } catch (err) {
      beriTahu(pesanRamah(err));
    }
    sibuk = "";
  }

  async function hapus() {
    if (!confirm("Hapus “" + judul + "” dari situs?\n\nTindakan ini tidak bisa dibatalkan.")) return;
    sibuk = "hapus";
    try {
      if (saatHapus) await saatHapus(id);
      else await hapusDokumen(koleksi, id);
      beriTahu("Dihapus.");
      muatKoleksi(koleksi);
    } catch (err) {
      beriTahu(pesanRamah(err));
    }
    sibuk = "";
  }
</script>

<div class="baris-kelola" class:sedang-diubah={membuka}>
  <div class="isi">
    <b>{judul}</b>
    {#each baris as t}{#if t}<p>{t}</p>{/if}{/each}
  </div>
  <div></div>
  <div class="baris-tombol">
    {#if kolom.length}
      <button class="tombol" type="button" onclick={() => (membuka ? (membuka = false) : buka())}>
        {membuka ? "Batal" : "Ubah"}
      </button>
    {/if}
    <button class="tombol" type="button" onclick={hapus} disabled={sibuk === "hapus"}>
      {sibuk === "hapus" ? "Menghapus..." : "Hapus"}
    </button>
  </div>
</div>

{#if membuka}
  <form class="ubah-panel" onsubmit={simpan}>
    {#each kolom as k}
      <div class="isian">
        <label for="ubah-{id}-{k.nama}">{k.label}</label>
        {#if k.jenis === "foto"}
          {#if nilai[k.nama] && !hapusFoto[k.nama]}
            <div style="margin-bottom:10px">
              <img
                src={nilai[k.nama]}
                alt=""
                style="width:84px;height:84px;object-fit:cover;border-radius:8px;display:block"
              />
            </div>
          {/if}
          <input
            id="ubah-{id}-{k.nama}"
            type="file"
            accept="image/*"
            onchange={(e) => {
              berkasFoto[k.nama] = e.currentTarget.files[0] || null;
              if (berkasFoto[k.nama]) hapusFoto[k.nama] = false;
            }}
          />
          {#if nilai[k.nama]}
            <div class="baris-tombol" style="margin-top:8px">
              <button
                class="tombol"
                type="button"
                onclick={() => {
                  hapusFoto[k.nama] = !hapusFoto[k.nama];
                  if (hapusFoto[k.nama]) berkasFoto[k.nama] = null;
                }}
              >
                {hapusFoto[k.nama] ? "Batal hapus foto" : "Hapus foto"}
              </button>
            </div>
          {/if}
          {#if berkasFoto[k.nama]}
            <span class="petunjuk">Foto baru: {berkasFoto[k.nama].name}</span>
          {:else if hapusFoto[k.nama]}
            <span class="petunjuk">Foto akan dihapus saat perubahan disimpan.</span>
          {/if}
        {:else if k.jenis === "panjang"}
          <textarea id="ubah-{id}-{k.nama}" bind:value={bentuk[k.nama]}></textarea>
        {:else if k.jenis === "tanggal"}
          <input id="ubah-{id}-{k.nama}" type="date" bind:value={bentuk[k.nama]} />
        {:else if k.jenis === "angka"}
          <input id="ubah-{id}-{k.nama}" inputmode="numeric" bind:value={bentuk[k.nama]} />
        {:else if k.jenis === "pilih"}
          <select id="ubah-{id}-{k.nama}" bind:value={bentuk[k.nama]}>
            {#each k.pilihan as o}<option value={o.nilai}>{o.label}</option>{/each}
          </select>
        {:else}
          <input id="ubah-{id}-{k.nama}" bind:value={bentuk[k.nama]} />
        {/if}
        {#if k.petunjuk}<span class="petunjuk">{k.petunjuk}</span>{/if}
      </div>
    {/each}
    <div class="baris-tombol">
      <button class="tombol utama" type="submit" disabled={sibuk === "simpan"}>
        {sibuk === "simpan" ? "Menyimpan..." : "Simpan perubahan"}
      </button>
      <button class="tombol" type="button" onclick={() => (membuka = false)}>Batal</button>
    </div>
  </form>
{/if}
