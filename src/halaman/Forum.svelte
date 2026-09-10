<script>
  import { KONTEN, KOLEKSI } from "../inti/nama.js";
  import { isi, konten, muatSuara, muatKoleksi } from "../keadaan/isi.svelte.js";
  import { beriTahu } from "../keadaan/pesan.svelte.js";
  import { sesi, pengurus } from "../keadaan/sesi.svelte.js";
  import { POLLING_BAWAAN } from "../inti/bawaan.js";
  import { keDaftar } from "../inti/format.js";
  import {
    pilihPolling,
    kirimTopikForum,
    kirimKomentarForum,
    hapusTopikForum,
    hapusKomentarForum
  } from "../sumber/data.js";
  import { pesanRamah } from "../sumber/firebase.js";
  import { pergi } from "../keadaan/rute.svelte.js";
  import Kosong from "../komponen/Kosong.svelte";

  const polling = $derived.by(() => {
    const k = konten(KONTEN.POLLING);
    if (k && k.pertanyaan) {
      return {
        id: k.id || POLLING_BAWAAN.id,
        pertanyaan: k.pertanyaan,
        keterangan: k.keterangan || "",
        opsi: keDaftar(k.opsi)
      };
    }
    return POLLING_BAWAAN;
  });

  const suara = $derived(isi.suara);
  const pilihanku = $derived(suara ? suara.milikSaya : null);
  const total = $derived(suara ? suara.hitung.reduce((a, n) => a + n, 0) : 0);

  const semuaTopik = $derived((isi.forum_topik || []).filter((x) => x.status !== "dihapus"));
  const semuaKomentar = $derived((isi.forum_komentar || []).filter((x) => x.status !== "dihapus"));

  let topikAktif = $state("");
  let bukaFormTopik = $state(false);
  let mengirimTopik = $state(false);
  let mengirimKomentar = $state(false);
  let cari = $state("");
  let kategori = $state("semua");
  let formTopik = $state({ judul: "", isi: "", kategori: "Lingkungan" });
  let komentar = $state("");

  const kategoriTopik = ["Lingkungan", "Keamanan", "Fasilitas", "Kegiatan", "UMKM", "Pelayanan", "Lainnya"];

  const topikTersaring = $derived.by(() => {
    const q = cari.trim().toLowerCase();
    return semuaTopik.filter((t) => {
      const cocokKategori = kategori === "semua" || String(t.kategori || "").toLowerCase() === kategori;
      const cocokCari = !q || [t.judul, t.isi, t.nama, t.rt]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
      return cocokKategori && cocokCari;
    });
  });

  const topikDipilih = $derived(semuaTopik.find((t) => t.id === topikAktif) || null);
  const komentarAktif = $derived(
    semuaKomentar.filter((k) => k.topikId === topikAktif).slice().reverse()
  );

  const namaSaya = $derived(
    sesi.profilWarga?.nama ||
      sesi.pengguna?.displayName ||
      sesi.pengguna?.nama ||
      String(sesi.pengguna?.email || "Warga RW 02").split("@")[0]
  );
  const rtSaya = $derived(sesi.profilWarga?.rt || "");

  $effect(() => {
    if (!topikAktif && semuaTopik.length) topikAktif = semuaTopik[0].id;
    if (topikAktif && !semuaTopik.some((t) => t.id === topikAktif)) {
      topikAktif = semuaTopik[0]?.id || "";
    }
  });

  function wajibAkun(pesan) {
    if (!sesi.pengguna) {
      beriTahu(pesan || "Masuk dulu untuk menggunakan forum.");
      pergi("/masuk");
      return false;
    }
    if (!sesi.terverifikasi) {
      beriTahu("Verifikasi email dulu sebelum menulis di forum.");
      pergi("/akun");
      return false;
    }
    return true;
  }

  async function pilih(i) {
    if (!sesi.pengguna) { beriTahu("Masuk dulu untuk ikut memilih."); pergi("/masuk"); return; }
    if (!sesi.terverifikasi) { beriTahu("Verifikasi email dulu sebelum ikut polling."); pergi("/akun"); return; }
    try {
      await pilihPolling(polling.id, i);
      beriTahu("Suara tercatat. Terima kasih.");
      muatSuara();
    } catch (err) {
      beriTahu(pesanRamah(err));
    }
  }

  function mulaiTopik() {
    if (!wajibAkun("Masuk dulu untuk membuat topik diskusi.")) return;
    bukaFormTopik = true;
    requestAnimationFrame(() => document.getElementById("forum-judul")?.focus());
  }

  async function kirimTopik(e) {
    e.preventDefault();
    if (!wajibAkun()) return;
    if (formTopik.judul.trim().length < 5 || formTopik.isi.trim().length < 10) {
      beriTahu("Judul minimal 5 karakter dan isi diskusi minimal 10 karakter.");
      return;
    }

    mengirimTopik = true;
    try {
      const hasil = await kirimTopikForum({
        judul: formTopik.judul.trim().slice(0, 160),
        isi: formTopik.isi.trim().slice(0, 3000),
        kategori: formTopik.kategori,
        nama: namaSaya,
        rt: rtSaya
      });
      formTopik = { judul: "", isi: "", kategori: "Lingkungan" };
      bukaFormTopik = false;
      await muatKoleksi(KOLEKSI.FORUM_TOPIK);
      topikAktif = hasil.id;
      beriTahu("Topik diskusi berhasil diterbitkan.");
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      mengirimTopik = false;
    }
  }

  async function kirimKomentar(e) {
    e.preventDefault();
    if (!topikDipilih) return;
    if (!wajibAkun("Masuk dulu untuk membalas diskusi.")) return;
    if (komentar.trim().length < 2) {
      beriTahu("Tulis tanggapan terlebih dahulu.");
      return;
    }

    mengirimKomentar = true;
    try {
      await kirimKomentarForum(topikDipilih.id, {
        isi: komentar.trim().slice(0, 1500),
        nama: namaSaya,
        rt: rtSaya
      });
      komentar = "";
      await muatKoleksi(KOLEKSI.FORUM_KOMENTAR);
      beriTahu("Tanggapan berhasil dikirim.");
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      mengirimKomentar = false;
    }
  }

  function bolehHapus(item) {
    return Boolean(item && sesi.pengguna && (item.uid === sesi.pengguna.uid || pengurus()));
  }

  async function hapusTopik(item) {
    if (!bolehHapus(item)) return;
    if (!window.confirm("Hapus topik ini dari forum?")) return;
    try {
      await hapusTopikForum(item.id);
      await muatKoleksi(KOLEKSI.FORUM_TOPIK);
      beriTahu("Topik dihapus dari forum.");
    } catch (err) {
      beriTahu(pesanRamah(err));
    }
  }

  async function hapusKomentar(item) {
    if (!bolehHapus(item)) return;
    if (!window.confirm("Hapus tanggapan ini?")) return;
    try {
      await hapusKomentarForum(item.id);
      await muatKoleksi(KOLEKSI.FORUM_KOMENTAR);
      beriTahu("Tanggapan dihapus.");
    } catch (err) {
      beriTahu(pesanRamah(err));
    }
  }

  function jumlahBalasan(id) {
    return semuaKomentar.filter((k) => k.topikId === id).length;
  }

  function waktuTeks(nilai) {
    if (!nilai) return "Baru saja";
    let d = null;
    if (typeof nilai?.toDate === "function") d = nilai.toDate();
    else if (nilai?.seconds) d = new Date(nilai.seconds * 1000);
    else if (typeof nilai === "string" || typeof nilai === "number") d = new Date(nilai);
    if (!d || Number.isNaN(d.getTime())) return "Baru saja";
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      timeZone: "Asia/Jakarta"
    }).format(d) + " WIB";
  }
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Forum dan Polling</span></nav>

<div class="forum-hero">
  <div>
    <p class="alis">Suara warga</p>
    <h1>Forum &amp; Polling RW 02</h1>
    <p>Ruang musyawarah digital untuk bertanya, menyampaikan gagasan, berdiskusi, dan ikut survei warga secara terbuka.</p>
  </div>
  <button class="tombol utama" type="button" onclick={mulaiTopik}>＋ Mulai Diskusi</button>
</div>

<section class="blok forum-layout">
  <div class="forum-utama">
    <div class="forum-toolbar">
      <label class="forum-cari">
        <span>⌕</span>
        <input bind:value={cari} placeholder="Cari topik, isi, nama, atau RT..." aria-label="Cari diskusi" />
      </label>
      <select bind:value={kategori} aria-label="Filter kategori forum">
        <option value="semua">Semua kategori</option>
        {#each kategoriTopik as k}<option value={k.toLowerCase()}>{k}</option>{/each}
      </select>
      <button class="tombol" type="button" onclick={() => { cari = ""; kategori = "semua"; }}>Reset</button>
    </div>

    {#if bukaFormTopik}
      <form class="kartu forum-buat" onsubmit={kirimTopik}>
        <div class="forum-buat-head">
          <div><p class="alis">Topik baru</p><h2>Mulai diskusi warga</h2></div>
          <button class="tombol" type="button" onclick={() => (bukaFormTopik = false)}>Tutup</button>
        </div>
        <div class="isian"><label for="forum-judul">Judul diskusi</label><input id="forum-judul" bind:value={formTopik.judul} maxlength="160" required placeholder="Contoh: Usulan lampu penerangan di jalan blok C" /></div>
        <div class="isian"><label for="forum-kategori">Kategori</label><select id="forum-kategori" bind:value={formTopik.kategori}>{#each kategoriTopik as k}<option>{k}</option>{/each}</select></div>
        <div class="isian"><label for="forum-isi">Isi diskusi</label><textarea id="forum-isi" bind:value={formTopik.isi} maxlength="3000" required placeholder="Jelaskan kondisi, alasan, atau usulan yang ingin dibahas bersama warga."></textarea></div>
        <div class="forum-identitas"><span>Dipublikasikan sebagai <b>{namaSaya}</b>{rtSaya ? " · " + rtSaya : ""}</span><small>Gunakan bahasa yang sopan dan hindari data pribadi sensitif.</small></div>
        <button class="tombol utama" type="submit" disabled={mengirimTopik}>{mengirimTopik ? "Menerbitkan..." : "Terbitkan Topik"}</button>
      </form>
    {/if}

    <div class="forum-dua-kolom">
      <div class="forum-daftar">
        <div class="kepala-bagian"><h2>Diskusi Warga</h2><span class="label-kecil">{topikTersaring.length} topik</span></div>

        {#if isi.forum_topik === null}
          <div class="kartu"><p>Memuat diskusi warga...</p></div>
        {:else if topikTersaring.length}
          {#each topikTersaring as t}
            <button class="forum-topik" class:aktif={t.id === topikAktif} type="button" onclick={() => (topikAktif = t.id)}>
              <span class="forum-avatar">{String(t.nama || "W").slice(0, 1).toUpperCase()}</span>
              <span class="forum-topik-copy">
                <span class="forum-meta"><b>{t.kategori || "Diskusi"}</b><small>{waktuTeks(t.dibuat)}</small></span>
                <strong>{t.judul}</strong>
                <span class="forum-ringkas">{t.isi}</span>
                <span class="forum-bawah"><span>{t.nama || "Warga"}{t.rt ? " · " + t.rt : ""}</span><span>💬 {jumlahBalasan(t.id)} tanggapan</span></span>
              </span>
            </button>
          {/each}
        {:else}
          <Kosong judul="Belum ada diskusi yang cocok" ket="Buat topik baru atau ubah kata pencarian dan kategori." tab="lain" aksi="Kelola polling" />
        {/if}
      </div>

      <div class="forum-rinci">
        {#if topikDipilih}
          <article class="kartu forum-thread">
            <div class="forum-thread-head">
              <div>
                <span class="forum-chip">{topikDipilih.kategori || "Diskusi"}</span>
                <h2>{topikDipilih.judul}</h2>
                <p class="forum-penulis">{topikDipilih.nama || "Warga"}{topikDipilih.rt ? " · " + topikDipilih.rt : ""} · {waktuTeks(topikDipilih.dibuat)}</p>
              </div>
              {#if bolehHapus(topikDipilih)}
                <button class="tombol bahaya" type="button" onclick={() => hapusTopik(topikDipilih)}>Hapus</button>
              {/if}
            </div>
            <p class="forum-thread-isi">{topikDipilih.isi}</p>

            <div class="forum-komentar-head"><h3>Tanggapan warga</h3><span>{komentarAktif.length}</span></div>
            <div class="forum-komentar-list">
              {#if komentarAktif.length}
                {#each komentarAktif as k}
                  <article class="forum-komentar">
                    <span class="forum-avatar kecil">{String(k.nama || "W").slice(0, 1).toUpperCase()}</span>
                    <div>
                      <div class="forum-komentar-meta"><strong>{k.nama || "Warga"}{k.rt ? " · " + k.rt : ""}</strong><small>{waktuTeks(k.dibuat)}</small></div>
                      <p>{k.isi}</p>
                      {#if bolehHapus(k)}<button type="button" onclick={() => hapusKomentar(k)}>Hapus tanggapan</button>{/if}
                    </div>
                  </article>
                {/each}
              {:else}
                <p class="forum-belum">Belum ada tanggapan. Jadilah yang pertama ikut berdiskusi.</p>
              {/if}
            </div>

            {#if sesi.pengguna && sesi.terverifikasi}
              <form class="forum-balas" onsubmit={kirimKomentar}>
                <label for="forum-komentar">Tulis tanggapan</label>
                <textarea id="forum-komentar" bind:value={komentar} maxlength="1500" placeholder="Tulis pendapat, pertanyaan, atau solusi secara singkat dan sopan." required></textarea>
                <div><small>Dipublikasikan sebagai {namaSaya}{rtSaya ? " · " + rtSaya : ""}</small><button class="tombol utama" type="submit" disabled={mengirimKomentar}>{mengirimKomentar ? "Mengirim..." : "Kirim Tanggapan"}</button></div>
              </form>
            {:else}
              <div class="kunci forum-kunci">
                <p>{sesi.pengguna ? "Verifikasi email untuk membalas diskusi." : "Masuk untuk ikut berdiskusi."}</p>
                <button class="tombol utama" type="button" onclick={() => pergi(sesi.pengguna ? "/akun" : "/masuk")}>{sesi.pengguna ? "Verifikasi Akun" : "Masuk / Daftar"}</button>
              </div>
            {/if}
          </article>
        {:else}
          <div class="kartu forum-thread-kosong">
            <span>💬</span><h2>Pilih topik diskusi</h2><p>Pilih salah satu topik di sebelah kiri atau buat diskusi baru.</p>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <aside class="forum-samping">
    <div class="kartu forum-panduan">
      <p class="alis">Etika forum</p>
      <h3>Diskusi yang sehat</h3>
      <ul>
        <li>Fokus pada masalah dan solusi.</li>
        <li>Jangan membagikan NIK, alamat lengkap, atau data sensitif.</li>
        <li>Hormati perbedaan pendapat antarwarga.</li>
        <li>Pengurus dapat menghapus konten yang tidak pantas.</li>
      </ul>
    </div>

    <div class="kartu forum-stat">
      <span><strong>{semuaTopik.length}</strong><small>Topik aktif</small></span>
      <span><strong>{semuaKomentar.length}</strong><small>Tanggapan</small></span>
      <span><strong>{total}</strong><small>Suara polling</small></span>
    </div>
  </aside>
</section>

<section class="blok" id="polling-warga">
  <div class="kartu forum-polling-card">
    <div class="forum-polling-head"><div><p class="alis">Polling berjalan</p><h2>Survei keputusan warga</h2></div><span class="forum-chip">Satu akun · satu suara</span></div>
    {#if !polling.pertanyaan || !polling.opsi.length}
      <Kosong
        judul="Belum ada polling dibuka"
        ket="Pertanyaan musyawarah beserta pilihannya akan tampil di sini, dan hasilnya terlihat langsung setelah Anda memilih."
        tab="lain"
        aksi="Buka polling warga"
      />
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

      {#if sesi.pengguna && !sesi.terverifikasi}
        <div class="kunci" style="margin-top:14px">
          <h3>Verifikasi email sebelum memilih</h3>
          <p>Akun sudah masuk, tetapi Firestore hanya menerima suara dari akun dengan email yang sudah diverifikasi.</p>
          <div class="baris-tombol"><button class="tombol utama" type="button" onclick={() => pergi("/akun")}>Buka verifikasi akun</button></div>
        </div>
      {:else if sesi.pengguna && pilihanku === null}
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
                <b>{o}{String(i) === pilihanku ? " — pilihan Anda" : ""}</b>
                <span>{jml} suara · {persen}%</span>
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
  <div class="kepala-bagian"><h2>Jalur musyawarah resmi</h2></div>
  <div class="petak petak-2">
    <div class="kartu">
      <h3>Usulan yang perlu ditindaklanjuti</h3>
      <p>Diskusi forum membantu bertukar pendapat. Jika usulan membutuhkan tindak lanjut resmi pengurus, kirim juga melalui Pengaduan &amp; Aspirasi agar mendapatkan nomor tiket dan status proses.</p>
      <div class="baris-tombol" style="margin-top:8px"><a class="tombol" href="#/pengaduan">Buat pengajuan resmi</a></div>
    </div>
    <div class="kartu">
      <h3>Pemilihan pengurus</h3>
      <p>Polling di situs dipakai untuk menjaring pendapat, bukan menggantikan pemungutan suara. Pemilihan pengurus RW tetap dilakukan dalam rapat warga sesuai ketentuan yang berlaku.</p>
    </div>
  </div>
</section>

<style>
  .forum-hero { display:flex; align-items:center; justify-content:space-between; gap:24px; padding:28px; margin-bottom:22px; border:1px solid var(--garis); border-radius:22px; background:linear-gradient(135deg,var(--brand-soft),var(--kertas)); }
  .forum-hero h1 { margin:2px 0 7px; font-size:clamp(30px,4vw,48px); letter-spacing:-.04em; }
  .forum-hero p:last-child { max-width:68ch; margin:0; color:var(--tinta-2); }
  .forum-layout { display:grid; grid-template-columns:minmax(0,1fr) 230px; gap:16px; }
  .forum-toolbar { display:grid; grid-template-columns:minmax(0,1fr) 180px auto; gap:8px; margin-bottom:12px; }
  .forum-cari { display:flex; align-items:center; gap:8px; min-height:42px; padding:0 12px; border:1px solid var(--garis); border-radius:12px; background:var(--kertas); }
  .forum-cari input { width:100%; border:0; outline:0; background:transparent; color:var(--tinta); font:inherit; }
  .forum-toolbar select { border:1px solid var(--garis); border-radius:12px; padding:0 10px; background:var(--kertas); color:var(--tinta); }
  .forum-buat { margin-bottom:14px; }
  .forum-buat-head,.forum-thread-head,.forum-polling-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
  .forum-buat-head h2,.forum-thread h2,.forum-polling-head h2 { margin:0; }
  .forum-identitas { display:flex; justify-content:space-between; gap:10px; margin:8px 0 12px; color:var(--tinta-2); font-size:12px; }
  .forum-dua-kolom { display:grid; grid-template-columns:minmax(250px,.72fr) minmax(0,1.28fr); gap:12px; align-items:start; }
  .forum-daftar { display:grid; gap:7px; }
  .forum-topik { width:100%; display:grid; grid-template-columns:38px minmax(0,1fr); gap:10px; padding:12px; border:1px solid var(--garis); border-radius:14px; text-align:left; background:var(--kertas); color:var(--tinta); cursor:pointer; transition:.18s ease; }
  .forum-topik:hover,.forum-topik.aktif { border-color:var(--brand); box-shadow:0 10px 28px rgba(0,0,0,.06); transform:translateY(-1px); }
  .forum-topik.aktif { background:var(--brand-soft); }
  .forum-avatar { width:38px; height:38px; display:grid; place-items:center; border-radius:50%; background:var(--brand); color:white; font-weight:800; }
  .forum-avatar.kecil { width:32px; height:32px; font-size:12px; }
  .forum-topik-copy { min-width:0; display:block; }
  .forum-meta,.forum-bawah,.forum-komentar-meta { display:flex; align-items:center; justify-content:space-between; gap:8px; }
  .forum-meta b,.forum-chip { display:inline-flex; width:max-content; padding:3px 7px; border-radius:999px; background:var(--brand-soft); color:var(--brand); font-size:10px; }
  .forum-meta small,.forum-bawah,.forum-penulis,.forum-komentar-meta small { color:var(--tinta-3); font-size:10px; }
  .forum-topik-copy > strong { display:block; margin:5px 0 3px; font-size:13px; line-height:1.3; }
  .forum-ringkas { display:-webkit-box; overflow:hidden; -webkit-line-clamp:2; -webkit-box-orient:vertical; color:var(--tinta-2); font-size:11px; line-height:1.45; }
  .forum-bawah { margin-top:7px; }
  .forum-thread { position:sticky; top:84px; }
  .forum-thread h2 { margin-top:8px; font-size:22px; line-height:1.18; }
  .forum-thread-isi { white-space:pre-line; color:var(--tinta-2); line-height:1.65; }
  .forum-komentar-head { display:flex; align-items:center; justify-content:space-between; margin-top:18px; padding-top:15px; border-top:1px solid var(--garis); }
  .forum-komentar-head h3 { margin:0; }
  .forum-komentar-head span { min-width:28px; height:28px; display:grid; place-items:center; border-radius:999px; background:var(--brand-soft); color:var(--brand); font-weight:800; }
  .forum-komentar-list { display:grid; gap:8px; margin-top:10px; }
  .forum-komentar { display:grid; grid-template-columns:32px minmax(0,1fr); gap:9px; padding:10px; border:1px solid var(--garis); border-radius:12px; background:var(--kertas-2,var(--kertas)); }
  .forum-komentar p { margin:5px 0 0; white-space:pre-line; color:var(--tinta-2); font-size:12px; line-height:1.55; }
  .forum-komentar button { margin-top:5px; padding:0; border:0; background:none; color:var(--bahaya,#b42318); font-size:10px; cursor:pointer; }
  .forum-belum { padding:14px; border:1px dashed var(--garis); border-radius:12px; color:var(--tinta-3); font-size:12px; }
  .forum-balas { display:grid; gap:7px; margin-top:12px; padding-top:12px; border-top:1px solid var(--garis); }
  .forum-balas textarea { min-height:90px; }
  .forum-balas > div { display:flex; align-items:center; justify-content:space-between; gap:10px; }
  .forum-balas small { color:var(--tinta-3); }
  .forum-kunci { margin-top:12px; }
  .forum-thread-kosong { min-height:260px; display:grid; place-items:center; align-content:center; text-align:center; color:var(--tinta-3); }
  .forum-thread-kosong > span { font-size:34px; }
  .forum-thread-kosong h2 { margin:8px 0 0; color:var(--tinta); }
  .forum-samping { display:grid; align-content:start; gap:10px; }
  .forum-panduan ul { display:grid; gap:7px; margin:10px 0 0; padding-left:18px; color:var(--tinta-2); font-size:12px; line-height:1.5; }
  .forum-stat { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .forum-stat span { padding:10px; border-radius:10px; background:var(--brand-soft); }
  .forum-stat strong,.forum-stat small { display:block; }
  .forum-stat strong { color:var(--brand); font-size:22px; }
  .forum-stat small { margin-top:2px; color:var(--tinta-3); font-size:10px; }
  .forum-polling-card { padding:22px; }
  .forum-polling-card > h3 { margin-top:18px; }

  @media (max-width: 980px) {
    .forum-layout { grid-template-columns:1fr; }
    .forum-samping { grid-template-columns:1fr 1fr; }
    .forum-thread { position:static; }
  }

  @media (max-width: 760px) {
    .forum-hero { align-items:flex-start; flex-direction:column; padding:20px; }
    .forum-toolbar { grid-template-columns:1fr; }
    .forum-toolbar select,.forum-toolbar .tombol { min-height:42px; }
    .forum-dua-kolom { grid-template-columns:1fr; }
    .forum-samping { grid-template-columns:1fr; }
    .forum-identitas,.forum-balas > div,.forum-thread-head,.forum-polling-head { align-items:flex-start; flex-direction:column; }
    .forum-balas .tombol { width:100%; }
    .forum-thread h2 { font-size:19px; }
  }
</style>
