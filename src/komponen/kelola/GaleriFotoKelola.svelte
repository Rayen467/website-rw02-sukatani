<script>
  import { KOLEKSI } from "../../inti/nama.js";
  import { kecilkanFoto, SISI_FOTO_LAYAR, SISI_SAMPUL } from "../../inti/peramban.js";
  import { muatKoleksi } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { ambilCocok, tambahFotoAlbum, hapusFotoAlbum, ubahDokumen } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";

  let { album } = $props();

  let terbuka = $state(false);
  let memuat = $state(false);
  let sibuk = $state("");
  let foto = $state([]);
  let pilihan = $state([]);
  let kemajuan = $state("");

  function urutkan(daftar) {
    return [...daftar].sort((a, b) => Number(a.urut || 0) - Number(b.urut || 0));
  }

  async function muat() {
    if (!album?.id) return;
    memuat = true;
    try {
      foto = urutkan(await ambilCocok(KOLEKSI.GALERI_FOTO, "album", album.id));
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      memuat = false;
    }
  }

  async function toggle(e) {
    terbuka = e.currentTarget.open;
    if (terbuka && !foto.length) await muat();
  }

  async function tambah() {
    if (!pilihan.length || !album?.id) return;
    sibuk = "tambah";
    kemajuan = "";
    try {
      const hasil = [];
      let sampul = "";
      for (let i = 0; i < pilihan.length; i += 1) {
        kemajuan = `Memproses foto ${i + 1} dari ${pilihan.length}...`;
        const besar = await kecilkanFoto(pilihan[i], SISI_FOTO_LAYAR);
        hasil.push(besar);
        if (!album.sampul && !sampul) sampul = await kecilkanFoto(pilihan[i], SISI_SAMPUL);
      }
      await tambahFotoAlbum(album.id, hasil, foto.length);
      const perubahan = { jumlahFoto: String(foto.length + hasil.length) };
      if (sampul) perubahan.sampul = sampul;
      await ubahDokumen(KOLEKSI.GALERI, album.id, perubahan);
      pilihan = [];
      const input = document.getElementById(`galeri-tambah-${album.id}`);
      if (input) input.value = "";
      await muat();
      await muatKoleksi(KOLEKSI.GALERI);
      beriTahu(`${hasil.length} foto ditambahkan ke album.`);
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      kemajuan = "";
      sibuk = "";
    }
  }

  async function hapus(item) {
    if (!confirm("Hapus foto ini dari album? Tindakan ini tidak bisa dibatalkan.")) return;
    sibuk = `hapus:${item.id}`;
    try {
      await hapusFotoAlbum(item.id);
      const sisa = foto.filter((x) => x.id !== item.id);
      await ubahDokumen(KOLEKSI.GALERI, album.id, { jumlahFoto: String(sisa.length) });
      foto = sisa;
      await muatKoleksi(KOLEKSI.GALERI);
      beriTahu("Foto dihapus dari album.");
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      sibuk = "";
    }
  }

  async function ganti(item, berkas) {
    if (!berkas) return;
    sibuk = `ganti:${item.id}`;
    try {
      const data = await kecilkanFoto(berkas, SISI_FOTO_LAYAR);
      await ubahDokumen(KOLEKSI.GALERI_FOTO, item.id, { foto: data });
      foto = foto.map((x) => x.id === item.id ? { ...x, foto: data } : x);
      beriTahu("Foto album diganti.");
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      sibuk = "";
    }
  }

  async function jadikanSampul(item) {
    if (!item?.foto) return;
    sibuk = `sampul:${item.id}`;
    try {
      const blob = await fetch(item.foto).then((r) => r.blob());
      const sampul = await kecilkanFoto(blob, SISI_SAMPUL);
      await ubahDokumen(KOLEKSI.GALERI, album.id, { sampul });
      await muatKoleksi(KOLEKSI.GALERI);
      beriTahu("Sampul album diperbarui.");
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      sibuk = "";
    }
  }
</script>

<details class="foto-kelola" ontoggle={toggle}>
  <summary>
    <span>Kelola foto album</span>
    <small>{album.jumlahFoto || foto.length || 0} foto · tambah, ganti, sampul, hapus</small>
  </summary>

  <div class="foto-body">
    <div class="foto-upload">
      <label for={`galeri-tambah-${album.id}`}>
        <span>Tambah foto</span>
        <input id={`galeri-tambah-${album.id}`} type="file" accept="image/*" multiple onchange={(e) => (pilihan = [...(e.currentTarget.files || [])])} />
        <small>{pilihan.length ? `${pilihan.length} foto dipilih` : "Pilih beberapa foto sekaligus. Semua dikecilkan otomatis sebelum disimpan."}</small>
      </label>
      <button class="tombol utama" type="button" onclick={tambah} disabled={!pilihan.length || sibuk === "tambah"}>{sibuk === "tambah" ? "Menambahkan..." : "Tambah ke album"}</button>
      {#if kemajuan}<span class="kemajuan">{kemajuan}</span>{/if}
    </div>

    {#if memuat}
      <div class="foto-kosong">Memuat foto album...</div>
    {:else if foto.length}
      <div class="foto-grid">
        {#each foto as item, i}
          <article class="foto-item">
            {#if item.foto}<img src={item.foto} alt={`Foto ${album.judul || "album"} ${i + 1}`} />{:else}<div class="foto-placeholder">Tanpa gambar</div>{/if}
            <div class="foto-meta"><b>Foto {i + 1}</b><small>ID: {item.id}</small></div>
            <div class="foto-actions">
              <label class="tombol ganti">
                {sibuk === `ganti:${item.id}` ? "Mengganti..." : "Ganti"}
                <input type="file" accept="image/*" disabled={Boolean(sibuk)} onchange={(e) => { const f = e.currentTarget.files?.[0]; if (f) ganti(item, f); e.currentTarget.value = ""; }} />
              </label>
              <button class="tombol" type="button" onclick={() => jadikanSampul(item)} disabled={Boolean(sibuk)}>{sibuk === `sampul:${item.id}` ? "Memasang..." : "Jadi sampul"}</button>
              <button class="tombol bahaya" type="button" onclick={() => hapus(item)} disabled={Boolean(sibuk)}>{sibuk === `hapus:${item.id}` ? "Menghapus..." : "Hapus"}</button>
            </div>
          </article>
        {/each}
      </div>
    {:else}
      <div class="foto-kosong">Album belum punya foto. Tambahkan dari pemilih di atas.</div>
    {/if}
  </div>
</details>

<style>
  .foto-kelola{margin:0 0 12px;border:1px solid #dde8e4;border-radius:12px;background:#fbfdfc;overflow:hidden}.foto-kelola>summary{display:flex;justify-content:space-between;gap:12px;padding:10px 13px;cursor:pointer;color:#28473c;font-weight:800}.foto-kelola>summary small{font-weight:500;color:#78857f}.foto-body{padding:13px;border-top:1px solid #e5ece9;background:#fff}.foto-upload{display:flex;gap:10px;align-items:end;flex-wrap:wrap;padding:11px;border:1px dashed #bed5cc;border-radius:10px;background:#f7fbf9}.foto-upload label{display:grid;gap:4px;min-width:260px;flex:1}.foto-upload label>span{font-size:12px;font-weight:800}.foto-upload small,.kemajuan{color:#75827d;font-size:12px}.foto-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:12px}.foto-item{min-width:0;padding:9px;border:1px solid #e1eae6;border-radius:11px;background:#fff}.foto-item>img,.foto-placeholder{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:8px;background:#eef4f1}.foto-placeholder{display:grid;place-items:center;color:#78857f}.foto-meta{display:grid;margin:7px 1px}.foto-meta b{font-size:13px}.foto-meta small{overflow:hidden;text-overflow:ellipsis;color:#87928e;font:10px ui-monospace,SFMono-Regular,Menlo,monospace}.foto-actions{display:flex;gap:5px;flex-wrap:wrap}.foto-actions .tombol{font-size:11px;padding:6px 8px}.foto-actions .bahaya{color:#a3313e;border-color:#efcbd0;background:#fff6f7}.ganti{position:relative;overflow:hidden;cursor:pointer}.ganti input{position:absolute;inset:0;opacity:0;cursor:pointer}.foto-kosong{margin-top:10px;padding:16px;border:1px dashed #d3dfda;border-radius:9px;text-align:center;color:#76847e;background:#fafcfb}
  @media(max-width:760px){.foto-kelola>summary{display:grid}.foto-grid{grid-template-columns:1fr 1fr}.foto-upload{align-items:stretch}.foto-upload label{min-width:0;width:100%}}
  @media(max-width:480px){.foto-grid{grid-template-columns:1fr}}
</style>
