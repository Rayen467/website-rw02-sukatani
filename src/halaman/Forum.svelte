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
  let urutan = $state("aktif");
  let formTopik = $state({ judul: "", isi: "", kategori: "Lingkungan" });
  let komentar = $state("");

  const kategoriTopik = ["Lingkungan", "Keamanan", "Fasilitas", "Kegiatan", "UMKM", "Pelayanan", "Lainnya"];

  function waktuMillis(nilai) {
    if (!nilai) return 0;
    if (typeof nilai?.toDate === "function") return nilai.toDate().getTime();
    if (typeof nilai?.seconds === "number") return nilai.seconds * 1000;
    const hasil = new Date(nilai).getTime();
    return Number.isFinite(hasil) ? hasil : 0;
  }

  function jumlahBalasan(id) {
    return semuaKomentar.filter((k) => k.topikId === id).length;
  }

  function aktivitasTerakhir(topik) {
    let terbaru = waktuMillis(topik?.dibuat);
    for (const k of semuaKomentar) {
      if (k.topikId !== topik?.id) continue;
      terbaru = Math.max(terbaru, waktuMillis(k.dibuat));
    }
    return terbaru;
  }

  const jumlahKategori = $derived.by(() => {
    const hasil = new Map();
    for (const k of kategoriTopik) hasil.set(k.toLowerCase(), 0);
    for (const t of semuaTopik) {
      const k = String(t.kategori || "Lainnya").toLowerCase();
      hasil.set(k, (hasil.get(k) || 0) + 1);
    }
    return hasil;
  });

  const topikTersaring = $derived.by(() => {
    const q = cari.trim().toLowerCase();
    const hasil = semuaTopik.filter((t) => {
      const cocokKategori = kategori === "semua" || String(t.kategori || "").toLowerCase() === kategori;
      const cocokCari = !q || [t.judul, t.isi, t.nama, t.rt, t.kategori]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
      return cocokKategori && cocokCari;
    });

    return hasil.slice().sort((a, b) => {
      if (urutan === "ramai") {
        const selisih = jumlahBalasan(b.id) - jumlahBalasan(a.id);
        return selisih || aktivitasTerakhir(b) - aktivitasTerakhir(a);
      }
      if (urutan === "baru") return waktuMillis(b.dibuat) - waktuMillis(a.dibuat);
      return aktivitasTerakhir(b) - aktivitasTerakhir(a);
    });
  });

  const topikPopuler = $derived(
    semuaTopik
      .slice()
      .sort((a, b) => {
        const ramai = jumlahBalasan(b.id) - jumlahBalasan(a.id);
        return ramai || aktivitasTerakhir(b) - aktivitasTerakhir(a);
      })
      .slice(0, 4)
  );

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
    const tersedia = topikTersaring;
    if (!topikAktif && tersedia.length) topikAktif = tersedia[0].id;
    if (topikAktif && !semuaTopik.some((t) => t.id === topikAktif)) {
      topikAktif = tersedia[0]?.id || semuaTopik[0]?.id || "";
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
    requestAnimationFrame(() => {
      document.getElementById("forum-buat")?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById("forum-judul")?.focus();
    });
  }

  function pilihTopik(id) {
    topikAktif = id;
    if (typeof window !== "undefined" && window.innerWidth <= 760) {
      requestAnimationFrame(() => document.getElementById("forum-rinci")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
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

  function waktuTeks(nilai) {
    const ms = typeof nilai === "number" ? nilai : waktuMillis(nilai);
    if (!ms) return "Baru saja";
    const selisih = Math.max(0, Date.now() - ms);
    const menit = Math.floor(selisih / 60000);
    if (menit < 1) return "Baru saja";
    if (menit < 60) return `${menit} menit lalu`;
    const jam = Math.floor(menit / 60);
    if (jam < 24) return `${jam} jam lalu`;
    const hari = Math.floor(jam / 24);
    if (hari < 7) return `${hari} hari lalu`;
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Jakarta"
    }).format(new Date(ms));
  }

  function ikonKategori(nilai) {
    const map = {
      lingkungan: "L",
      keamanan: "K",
      fasilitas: "F",
      kegiatan: "A",
      umkm: "U",
      pelayanan: "P",
      lainnya: "•"
    };
    return map[String(nilai || "lainnya").toLowerCase()] || "•";
  }
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Forum Warga</span></nav>

<section class="forum-hero">
  <div class="forum-hero-copy">
    <span class="forum-eyebrow">RUANG MUSYAWARAH DIGITAL · RW 02</span>
    <h1>Forum Warga</h1>
    <p>Bahas lingkungan, keamanan, fasilitas, kegiatan, UMKM, dan pelayanan dalam satu ruang diskusi yang rapi dan mudah diikuti.</p>
    <div class="forum-hero-actions">
      <button class="tombol utama" type="button" onclick={mulaiTopik}>＋ Mulai diskusi</button>
      <a class="tombol" href="#polling-warga">Lihat polling warga</a>
    </div>
  </div>

  <div class="forum-hero-stats" aria-label="Ringkasan forum">
    <div><strong>{semuaTopik.length}</strong><span>Topik aktif</span></div>
    <div><strong>{semuaKomentar.length}</strong><span>Tanggapan</span></div>
    <div><strong>{total}</strong><span>Suara polling</span></div>
  </div>
</section>

<section class="forum-shell">
  <div class="forum-main">
    <div class="forum-toolbar-card">
      <label class="forum-search">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
        <input bind:value={cari} type="search" placeholder="Cari topik, isi, nama, RT, atau kategori..." aria-label="Cari diskusi" />
      </label>
      <select bind:value={urutan} aria-label="Urutkan forum">
        <option value="aktif">Aktivitas terbaru</option>
        <option value="baru">Topik terbaru</option>
        <option value="ramai">Paling ramai</option>
      </select>
      <button class="tombol forum-reset" type="button" onclick={() => { cari = ""; kategori = "semua"; urutan = "aktif"; }}>Reset</button>
    </div>

    <div class="forum-kategori" aria-label="Kategori forum">
      <button type="button" class:aktif={kategori === "semua"} onclick={() => (kategori = "semua")}>
        <span>Semua</span><b>{semuaTopik.length}</b>
      </button>
      {#each kategoriTopik as k}
        {@const nilai = k.toLowerCase()}
        <button type="button" class:aktif={kategori === nilai} data-kategori={nilai} onclick={() => (kategori = nilai)}>
          <span>{k}</span><b>{jumlahKategori.get(nilai) || 0}</b>
        </button>
      {/each}
    </div>

    {#if bukaFormTopik}
      <form class="forum-composer" id="forum-buat" onsubmit={kirimTopik}>
        <div class="forum-composer-head">
          <div class="forum-avatar besar">{String(namaSaya || "W").slice(0, 1).toUpperCase()}</div>
          <div>
            <span>TOPIK BARU</span>
            <h2>Mulai diskusi bersama warga</h2>
            <p>Bagikan kondisi, pertanyaan, atau usulan dengan konteks yang cukup agar mudah ditanggapi.</p>
          </div>
          <button class="forum-close" type="button" aria-label="Tutup form topik" onclick={() => (bukaFormTopik = false)}>×</button>
        </div>

        <div class="forum-composer-grid">
          <label class="forum-field forum-span-2">
            <span>Judul diskusi</span>
            <input id="forum-judul" bind:value={formTopik.judul} maxlength="160" required placeholder="Contoh: Usulan lampu penerangan di jalan blok C" />
            <small>{formTopik.judul.length}/160 karakter</small>
          </label>
          <label class="forum-field">
            <span>Kategori</span>
            <select bind:value={formTopik.kategori}>{#each kategoriTopik as k}<option>{k}</option>{/each}</select>
          </label>
          <div class="forum-identitas-card">
            <span>Dipublikasikan sebagai</span>
            <b>{namaSaya}</b>
            <small>{rtSaya || "RT belum dicantumkan"}</small>
          </div>
          <label class="forum-field forum-span-2">
            <span>Isi diskusi</span>
            <textarea bind:value={formTopik.isi} maxlength="3000" required placeholder="Jelaskan kondisi, alasan, lokasi umum, atau solusi yang ingin dibahas. Jangan masukkan NIK, nomor KK, atau alamat rumah lengkap."></textarea>
            <small>{formTopik.isi.length}/3000 karakter</small>
          </label>
        </div>

        <div class="forum-composer-foot">
          <p><b>Jaga privasi.</b> Forum bersifat terbuka. Hindari data pribadi sensitif dan gunakan bahasa yang sopan.</p>
          <div>
            <button class="tombol" type="button" onclick={() => (bukaFormTopik = false)}>Batal</button>
            <button class="tombol utama" type="submit" disabled={mengirimTopik}>{mengirimTopik ? "Menerbitkan..." : "Terbitkan topik"}</button>
          </div>
        </div>
      </form>
    {/if}

    <div class="forum-workspace">
      <section class="forum-feed" aria-label="Daftar diskusi warga">
        <header class="forum-section-head">
          <div>
            <span>DISKUSI WARGA</span>
            <h2>{kategori === "semua" ? "Semua percakapan" : kategoriTopik.find((k) => k.toLowerCase() === kategori) || "Diskusi"}</h2>
          </div>
          <b>{topikTersaring.length} topik</b>
        </header>

        {#if isi.forum_topik === null}
          <div class="forum-loading">Memuat percakapan warga...</div>
        {:else if topikTersaring.length}
          <div class="forum-feed-list">
            {#each topikTersaring as t}
              {@const balasan = jumlahBalasan(t.id)}
              {@const kat = String(t.kategori || "Lainnya").toLowerCase()}
              <button class="forum-topic-card" class:aktif={t.id === topikAktif} type="button" onclick={() => pilihTopik(t.id)}>
                <span class="forum-category-icon" data-kategori={kat}>{ikonKategori(kat)}</span>
                <span class="forum-topic-body">
                  <span class="forum-topic-top">
                    <span class="forum-tag" data-kategori={kat}>{t.kategori || "Diskusi"}</span>
                    {#if balasan >= 3}<span class="forum-hot">RAMAI</span>{/if}
                    <time>{waktuTeks(aktivitasTerakhir(t))}</time>
                  </span>
                  <strong>{t.judul}</strong>
                  <span class="forum-excerpt">{t.isi}</span>
                  <span class="forum-topic-bottom">
                    <span><b>{t.nama || "Warga"}</b>{t.rt ? ` · ${t.rt}` : ""}</span>
                    <span class="forum-replies">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v10H9l-4 4z"/></svg>
                      {balasan} tanggapan
                    </span>
                  </span>
                </span>
              </button>
            {/each}
          </div>
        {:else}
          <Kosong judul="Belum ada diskusi yang cocok" ket="Coba kategori lain, hapus pencarian, atau mulai topik baru." tab="lain" aksi="Kelola polling" />
        {/if}
      </section>

      <section class="forum-detail" id="forum-rinci" aria-label="Isi diskusi">
        {#if topikDipilih}
          {@const katAktif = String(topikDipilih.kategori || "Lainnya").toLowerCase()}
          <article class="forum-thread">
            <header class="forum-thread-header">
              <div class="forum-thread-author">
                <span class="forum-avatar">{String(topikDipilih.nama || "W").slice(0, 1).toUpperCase()}</span>
                <div>
                  <b>{topikDipilih.nama || "Warga"}</b>
                  <span>{topikDipilih.rt || "Warga RW 02"} · {waktuTeks(topikDipilih.dibuat)}</span>
                </div>
              </div>
              <div class="forum-thread-actions">
                <span class="forum-tag" data-kategori={katAktif}>{topikDipilih.kategori || "Diskusi"}</span>
                {#if bolehHapus(topikDipilih)}<button type="button" class="forum-delete" onclick={() => hapusTopik(topikDipilih)}>Hapus</button>{/if}
              </div>
            </header>

            <div class="forum-thread-copy">
              <h2>{topikDipilih.judul}</h2>
              <p>{topikDipilih.isi}</p>
            </div>

            <div class="forum-thread-info">
              <span><b>{komentarAktif.length}</b> tanggapan</span>
              <span>Aktivitas {waktuTeks(aktivitasTerakhir(topikDipilih))}</span>
              <a href="#/pengaduan">Perlu tindak lanjut resmi? Buat pengaduan →</a>
            </div>

            <section class="forum-comments">
              <header><div><span>PERCAKAPAN</span><h3>Tanggapan warga</h3></div><b>{komentarAktif.length}</b></header>

              {#if komentarAktif.length}
                <div class="forum-comment-list">
                  {#each komentarAktif as k, i}
                    <article class="forum-comment">
                      <span class="forum-avatar kecil">{String(k.nama || "W").slice(0, 1).toUpperCase()}</span>
                      <div>
                        <div class="forum-comment-meta">
                          <span><strong>{k.nama || "Warga"}</strong>{k.rt ? ` · ${k.rt}` : ""}</span>
                          <time>{waktuTeks(k.dibuat)}</time>
                        </div>
                        <p>{k.isi}</p>
                        <footer>
                          <span>#{i + 1}</span>
                          {#if bolehHapus(k)}<button type="button" onclick={() => hapusKomentar(k)}>Hapus tanggapan</button>{/if}
                        </footer>
                      </div>
                    </article>
                  {/each}
                </div>
              {:else}
                <div class="forum-empty-comments"><span>Belum ada tanggapan</span><p>Jadilah warga pertama yang ikut memberi pendapat atau solusi.</p></div>
              {/if}
            </section>

            {#if sesi.pengguna && sesi.terverifikasi}
              <form class="forum-reply" onsubmit={kirimKomentar}>
                <div class="forum-reply-head">
                  <span class="forum-avatar kecil">{String(namaSaya || "W").slice(0, 1).toUpperCase()}</span>
                  <div><b>Tulis tanggapan</b><small>Sebagai {namaSaya}{rtSaya ? ` · ${rtSaya}` : ""}</small></div>
                </div>
                <textarea bind:value={komentar} maxlength="1500" placeholder="Sampaikan pendapat, pertanyaan, pengalaman, atau solusi dengan singkat dan sopan." required></textarea>
                <div class="forum-reply-foot"><small>{komentar.length}/1500 karakter</small><button class="tombol utama" type="submit" disabled={mengirimKomentar}>{mengirimKomentar ? "Mengirim..." : "Kirim tanggapan"}</button></div>
              </form>
            {:else}
              <div class="forum-login-card">
                <div><b>{sesi.pengguna ? "Verifikasi akun untuk membalas" : "Ikut percakapan warga"}</b><p>{sesi.pengguna ? "Email perlu diverifikasi sebelum Anda menulis di forum." : "Masuk atau daftar agar nama dan riwayat diskusi terhubung dengan akun Anda."}</p></div>
                <button class="tombol utama" type="button" onclick={() => pergi(sesi.pengguna ? "/akun" : "/masuk")}>{sesi.pengguna ? "Verifikasi akun" : "Masuk / daftar"}</button>
              </div>
            {/if}
          </article>
        {:else}
          <div class="forum-thread-empty"><span>◌</span><h2>Pilih topik diskusi</h2><p>Pilih percakapan dari daftar atau buat topik baru untuk memulai.</p></div>
        {/if}
      </section>
    </div>
  </div>

  <aside class="forum-sidebar">
    <section class="forum-side-card forum-side-welcome">
      <span class="forum-side-kicker">FORUM RW 02</span>
      <h3>Diskusi dekat, solusi lebih cepat</h3>
      <p>Gunakan forum untuk bertukar informasi dan ide. Untuk laporan yang perlu status resmi, tetap gunakan Pengaduan & Aspirasi.</p>
      <a href="#/pengaduan">Buka Pengaduan & Aspirasi →</a>
    </section>

    <section class="forum-side-card">
      <div class="forum-side-head"><span>PALING RAMAI</span><h3>Diskusi populer</h3></div>
      {#if topikPopuler.length}
        <div class="forum-popular-list">
          {#each topikPopuler as t, i}
            <button type="button" onclick={() => pilihTopik(t.id)}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div><b>{t.judul}</b><small>{jumlahBalasan(t.id)} tanggapan · {t.kategori || "Diskusi"}</small></div>
            </button>
          {/each}
        </div>
      {:else}
        <p class="forum-side-empty">Belum ada diskusi populer.</p>
      {/if}
    </section>

    <section class="forum-side-card forum-rules">
      <div class="forum-side-head"><span>PANDUAN</span><h3>Etika forum</h3></div>
      <ol>
        <li><b>Fokus pada masalah.</b><span>Bahas kondisi dan solusi, bukan menyerang orang.</span></li>
        <li><b>Jaga data pribadi.</b><span>Jangan tulis NIK, KK, alamat lengkap, atau nomor pribadi orang lain.</span></li>
        <li><b>Berbeda boleh.</b><span>Hormati pendapat warga lain dan tetap gunakan bahasa yang wajar.</span></li>
      </ol>
    </section>

    <a class="forum-polling-shortcut" href="#polling-warga">
      <span>POLLING WARGA</span>
      <strong>{polling.pertanyaan || "Lihat survei warga yang sedang berjalan"}</strong>
      <small>{total} suara tercatat →</small>
    </a>
  </aside>
</section>

<section class="forum-poll-section" id="polling-warga">
  <div class="forum-poll-intro">
    <span class="forum-eyebrow">POLLING WARGA</span>
    <h2>Suara warga, hasil transparan</h2>
    <p>Satu akun menyimpan satu pilihan. Hasil agregat terlihat langsung tanpa menampilkan identitas pemilih.</p>
  </div>

  <div class="forum-poll-card">
    <header>
      <div><span>SURVEI BERJALAN</span><h3>{polling.pertanyaan || "Belum ada polling aktif"}</h3></div>
      <span class="forum-poll-badge">1 akun · 1 suara</span>
    </header>

    {#if !polling.pertanyaan || !polling.opsi.length}
      <Kosong judul="Belum ada polling dibuka" ket="Pertanyaan musyawarah beserta pilihannya akan tampil di sini saat pengurus membuka polling." tab="lain" aksi="Buka polling warga" />
    {:else}
      {#if polling.keterangan}<p class="forum-poll-note">{polling.keterangan}</p>{/if}

      {#if !sesi.pengguna}
        <div class="forum-poll-lock"><div><b>Masuk untuk ikut memilih</b><p>Hasil tetap bisa dilihat siapa pun, tetapi memilih memerlukan akun agar satu warga hanya memiliki satu suara aktif.</p></div><button class="tombol utama" type="button" onclick={() => pergi("/masuk")}>Masuk / daftar</button></div>
      {:else if !sesi.terverifikasi}
        <div class="forum-poll-lock"><div><b>Verifikasi email sebelum memilih</b><p>Akun sudah masuk, tetapi suara baru dapat disimpan setelah email diverifikasi.</p></div><button class="tombol utama" type="button" onclick={() => pergi("/akun")}>Verifikasi akun</button></div>
      {:else if pilihanku === null}
        <div class="forum-poll-options">
          {#each polling.opsi as o, i}
            <button type="button" onclick={() => pilih(i)}><span>{String.fromCharCode(65 + i)}</span><b>{o}</b><small>Pilih opsi ini →</small></button>
          {/each}
        </div>
      {:else if suara}
        <div class="forum-poll-results">
          {#each polling.opsi as o, i}
            {@const jml = suara.hitung[i] || 0}
            {@const persen = total ? Math.round((jml * 100) / total) : 0}
            <div class="forum-poll-result" class:milikku={String(i) === pilihanku}>
              <div><span>{String.fromCharCode(65 + i)}</span><b>{o}{String(i) === pilihanku ? " · Pilihan Anda" : ""}</b><strong>{persen}%</strong></div>
              <div class="forum-poll-track"><i style={`width:${persen}%`}></i></div>
              <small>{jml} dari {total} suara</small>
            </div>
          {/each}
        </div>

        <div class="forum-poll-footer">
          <p>Pilihan dapat diubah selama polling masih tersedia. Identitas pemilih tidak ditampilkan pada hasil.</p>
          <div>
            {#each polling.opsi as o, i}
              {#if String(i) !== pilihanku}<button class="tombol" type="button" onclick={() => pilih(i)}>Ubah ke {o}</button>{/if}
            {/each}
          </div>
        </div>
      {/if}
    {/if}
  </div>
</section>

<section class="forum-official">
  <div><span class="forum-eyebrow">JALUR RESMI</span><h2>Dari diskusi ke tindak lanjut</h2><p>Forum membantu warga menyamakan informasi dan pendapat. Jika ada hal yang perlu diproses pengurus, gunakan layanan resmi agar mendapat nomor tiket dan status.</p></div>
  <div class="forum-official-grid">
    <a href="#/pengaduan"><span>01</span><div><b>Pengaduan & Aspirasi</b><small>Untuk masalah lingkungan, keamanan, fasilitas, dan usulan yang membutuhkan tindak lanjut.</small></div><strong>→</strong></a>
    <a href="#/surat"><span>02</span><div><b>Pengajuan Surat</b><small>Untuk administrasi warga yang membutuhkan proses, verifikasi, dan dokumen resmi.</small></div><strong>→</strong></a>
  </div>
</section>

<style>
  .forum-hero{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:34px;align-items:center;margin:0 0 18px;padding:34px;border:1px solid color-mix(in srgb,var(--brand) 20%,var(--garis));border-radius:26px;background:radial-gradient(circle at 90% 10%,color-mix(in srgb,var(--brand) 18%,transparent),transparent 32%),linear-gradient(135deg,color-mix(in srgb,var(--brand-soft) 82%,var(--kertas)),var(--kertas));box-shadow:0 24px 60px -52px rgba(6,76,58,.55)}
  .forum-hero::after{content:"";position:absolute;right:-80px;bottom:-130px;width:310px;height:310px;border:1px solid color-mix(in srgb,var(--brand) 18%,transparent);border-radius:50%;pointer-events:none}
  .forum-eyebrow,.forum-side-kicker,.forum-section-head>div>span,.forum-side-head>span,.forum-poll-card header>div>span{display:block;color:var(--brand);font-size:11px;font-weight:800;letter-spacing:.09em}
  .forum-hero h1{margin:7px 0 8px;font-size:clamp(38px,4.7vw,58px);line-height:1.02;letter-spacing:-.05em}
  .forum-hero-copy>p{max-width:720px;margin:0;color:var(--tinta-2);font-size:15px;line-height:1.7}
  .forum-hero-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:21px}.forum-hero-actions .tombol{min-height:43px}
  .forum-hero-stats{position:relative;z-index:1;display:grid;grid-template-columns:repeat(3,minmax(92px,1fr));gap:8px}.forum-hero-stats div{min-width:104px;padding:17px 15px;border:1px solid color-mix(in srgb,var(--brand) 15%,var(--garis));border-radius:16px;background:color-mix(in srgb,var(--kertas) 86%,transparent);backdrop-filter:blur(9px)}.forum-hero-stats strong,.forum-hero-stats span{display:block}.forum-hero-stats strong{font-family:var(--font-display);font-size:27px;line-height:1;color:var(--brand)}.forum-hero-stats span{margin-top:6px;color:var(--tinta-3);font-size:11px}

  .forum-shell{display:grid;grid-template-columns:minmax(0,1fr) 285px;gap:16px;align-items:start}.forum-main{min-width:0}
  .forum-toolbar-card{display:grid;grid-template-columns:minmax(0,1fr) 185px auto;gap:8px;padding:10px;border:1px solid var(--garis);border-radius:16px;background:var(--kertas);box-shadow:0 12px 34px -32px rgba(0,0,0,.35)}
  .forum-search{display:flex;align-items:center;gap:9px;min-height:44px;padding:0 12px;border:1px solid var(--garis);border-radius:11px;background:var(--permukaan-3,var(--kertas));transition:.18s}.forum-search:focus-within{border-color:var(--brand);box-shadow:0 0 0 3px color-mix(in srgb,var(--brand) 10%,transparent)}.forum-search svg{width:18px;height:18px;fill:none;stroke:var(--tinta-3);stroke-width:1.8;stroke-linecap:round}.forum-search input{width:100%;border:0;outline:0;background:transparent;color:var(--tinta);font:inherit}.forum-toolbar-card select{min-height:44px;border:1px solid var(--garis);border-radius:11px;padding:0 11px;background:var(--permukaan-3,var(--kertas));color:var(--tinta)}.forum-reset{min-height:44px}
  .forum-kategori{display:flex;gap:7px;overflow-x:auto;padding:10px 1px 15px;scrollbar-width:none}.forum-kategori::-webkit-scrollbar{display:none}.forum-kategori button{flex:none;display:flex;align-items:center;gap:7px;min-height:36px;padding:0 11px;border:1px solid var(--garis);border-radius:999px;background:var(--kertas);color:var(--tinta-2);font:inherit;font-size:11px;font-weight:650;cursor:pointer;transition:.16s}.forum-kategori button:hover,.forum-kategori button.aktif{border-color:var(--brand);background:var(--brand-soft);color:var(--brand)}.forum-kategori b{min-width:20px;height:20px;display:grid;place-items:center;border-radius:999px;background:var(--permukaan-3,var(--kertas));font-size:9px}

  .forum-composer{margin:0 0 15px;padding:20px;border:1px solid color-mix(in srgb,var(--brand) 24%,var(--garis));border-radius:20px;background:linear-gradient(145deg,var(--kertas),color-mix(in srgb,var(--brand-soft) 45%,var(--kertas)));box-shadow:0 20px 55px -44px rgba(5,83,62,.5)}
  .forum-composer-head{display:grid;grid-template-columns:48px minmax(0,1fr) auto;gap:12px;align-items:start;padding-bottom:16px;border-bottom:1px solid var(--garis)}.forum-composer-head>div:nth-child(2)>span{color:var(--brand);font-size:10px;font-weight:800;letter-spacing:.09em}.forum-composer-head h2{margin:3px 0 3px;font-size:22px}.forum-composer-head p{margin:0;color:var(--tinta-3);font-size:12px}.forum-close{width:34px;height:34px;border:1px solid var(--garis);border-radius:10px;background:var(--kertas);color:var(--tinta-2);font-size:22px;cursor:pointer}
  .forum-composer-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(180px,.75fr);gap:13px;margin-top:17px}.forum-span-2{grid-column:1/-1}.forum-field{display:grid;gap:6px}.forum-field>span{font-size:12px;font-weight:700}.forum-field input,.forum-field select,.forum-field textarea{width:100%;min-height:44px;padding:10px 12px;border:1px solid var(--garis);border-radius:11px;background:var(--kertas);color:var(--tinta);outline:0}.forum-field textarea{min-height:132px;resize:vertical;line-height:1.6}.forum-field input:focus,.forum-field select:focus,.forum-field textarea:focus{border-color:var(--brand);box-shadow:0 0 0 3px color-mix(in srgb,var(--brand) 9%,transparent)}.forum-field small{justify-self:end;color:var(--tinta-3);font-size:10px}.forum-identitas-card{display:grid;align-content:center;padding:11px 13px;border:1px solid var(--garis);border-radius:11px;background:var(--brand-soft)}.forum-identitas-card span,.forum-identitas-card small{color:var(--tinta-3);font-size:10px}.forum-identitas-card b{margin:2px 0;color:var(--brand)}
  .forum-composer-foot{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:14px;padding-top:14px;border-top:1px solid var(--garis)}.forum-composer-foot p{max-width:630px;margin:0;color:var(--tinta-3);font-size:11px}.forum-composer-foot>div{display:flex;gap:8px;flex:none}

  .forum-workspace{display:grid;grid-template-columns:minmax(290px,.72fr) minmax(0,1.28fr);gap:12px;align-items:start}.forum-feed,.forum-detail{min-width:0}.forum-section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;padding:5px 2px 10px}.forum-section-head h2{margin:2px 0 0;font-size:20px}.forum-section-head>b{padding:5px 8px;border-radius:999px;background:var(--brand-soft);color:var(--brand);font-size:10px}
  .forum-feed-list{display:grid;gap:8px}.forum-topic-card{width:100%;display:grid;grid-template-columns:40px minmax(0,1fr);gap:10px;padding:13px;border:1px solid var(--garis);border-radius:15px;background:var(--kertas);color:var(--tinta);text-align:left;cursor:pointer;transition:transform .16s,border-color .16s,box-shadow .16s}.forum-topic-card:hover{transform:translateY(-1px);border-color:color-mix(in srgb,var(--brand) 55%,var(--garis));box-shadow:0 13px 30px -28px rgba(0,0,0,.38)}.forum-topic-card.aktif{border-color:var(--brand);background:linear-gradient(135deg,color-mix(in srgb,var(--brand-soft) 72%,var(--kertas)),var(--kertas));box-shadow:inset 3px 0 0 var(--brand)}
  .forum-category-icon{width:40px;height:40px;display:grid;place-items:center;border-radius:12px;background:var(--brand-soft);color:var(--brand);font-family:var(--font-display);font-size:14px;font-weight:800}.forum-topic-body{min-width:0;display:block}.forum-topic-top{display:flex;align-items:center;gap:5px;min-width:0}.forum-topic-top time{margin-left:auto;color:var(--tinta-3);font-size:9.5px;white-space:nowrap}.forum-tag{display:inline-flex;width:max-content;padding:4px 7px;border-radius:999px;background:var(--brand-soft);color:var(--brand);font-size:9px;font-weight:800;letter-spacing:.02em}.forum-hot{padding:3px 6px;border-radius:999px;background:#fff2d8;color:#9a6700;font-size:8px;font-weight:850;letter-spacing:.06em}.forum-topic-body>strong{display:block;margin:6px 0 4px;font-family:var(--font-display);font-size:13.5px;line-height:1.35;letter-spacing:-.02em}.forum-excerpt{display:-webkit-box;overflow:hidden;-webkit-line-clamp:2;-webkit-box-orient:vertical;color:var(--tinta-2);font-size:11px;line-height:1.52}.forum-topic-bottom{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:9px;color:var(--tinta-3);font-size:9.5px}.forum-topic-bottom b{color:var(--tinta-2);font-weight:650}.forum-replies{display:flex;align-items:center;gap:4px;white-space:nowrap}.forum-replies svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linejoin:round}.forum-loading{padding:28px;border:1px dashed var(--garis);border-radius:14px;color:var(--tinta-3);text-align:center}

  .forum-thread{position:sticky;top:84px;border:1px solid var(--garis);border-radius:18px;background:var(--kertas);overflow:hidden;box-shadow:0 18px 42px -38px rgba(0,0,0,.38)}.forum-thread-header{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:16px 17px;border-bottom:1px solid var(--garis);background:var(--permukaan-3,var(--kertas))}.forum-thread-author{display:flex;align-items:center;gap:10px;min-width:0}.forum-avatar{width:38px;height:38px;display:grid;place-items:center;flex:none;border-radius:50%;background:linear-gradient(145deg,var(--brand),color-mix(in srgb,var(--brand) 72%,#0a493a));color:#fff;font-family:var(--font-display);font-size:13px;font-weight:800}.forum-avatar.besar{width:48px;height:48px;font-size:16px}.forum-avatar.kecil{width:32px;height:32px;font-size:11px}.forum-thread-author>div{display:grid;min-width:0}.forum-thread-author b{font-size:11.5px}.forum-thread-author span{color:var(--tinta-3);font-size:9.5px}.forum-thread-actions{display:flex;align-items:center;gap:7px}.forum-delete{border:0;background:none;color:#b42318;font-size:10px;font-weight:700;cursor:pointer}.forum-thread-copy{padding:20px 19px}.forum-thread-copy h2{margin:0 0 10px;font-size:25px;line-height:1.22}.forum-thread-copy p{margin:0;white-space:pre-line;color:var(--tinta-2);font-size:13px;line-height:1.72}.forum-thread-info{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:11px 19px;border-top:1px solid var(--garis);border-bottom:1px solid var(--garis);background:var(--permukaan-3,var(--kertas));color:var(--tinta-3);font-size:9.5px}.forum-thread-info b{color:var(--brand)}.forum-thread-info a{margin-left:auto;color:var(--brand);font-weight:700;text-decoration:none}
  .forum-comments{padding:18px 19px}.forum-comments>header{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-bottom:10px}.forum-comments>header span{color:var(--brand);font-size:9px;font-weight:800;letter-spacing:.09em}.forum-comments>header h3{margin:2px 0 0;font-size:17px}.forum-comments>header>b{min-width:29px;height:29px;display:grid;place-items:center;border-radius:999px;background:var(--brand-soft);color:var(--brand);font-size:10px}.forum-comment-list{display:grid;gap:8px}.forum-comment{display:grid;grid-template-columns:32px minmax(0,1fr);gap:9px;padding:11px;border:1px solid var(--garis);border-radius:13px;background:var(--permukaan-3,var(--kertas))}.forum-comment-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--tinta-3);font-size:9.5px}.forum-comment-meta strong{color:var(--tinta);font-size:10.5px}.forum-comment p{margin:6px 0 0;white-space:pre-line;color:var(--tinta-2);font-size:11.5px;line-height:1.6}.forum-comment footer{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:6px;color:var(--tinta-3);font-size:9px}.forum-comment footer button{border:0;background:none;color:#b42318;font:inherit;font-weight:700;cursor:pointer}.forum-empty-comments{padding:18px;border:1px dashed var(--garis);border-radius:12px;text-align:center}.forum-empty-comments span{font-weight:700}.forum-empty-comments p{margin:4px 0 0;color:var(--tinta-3);font-size:11px}
  .forum-reply{display:grid;gap:9px;margin:0 19px 19px;padding:14px;border:1px solid color-mix(in srgb,var(--brand) 20%,var(--garis));border-radius:14px;background:linear-gradient(145deg,var(--kertas),color-mix(in srgb,var(--brand-soft) 40%,var(--kertas)))}.forum-reply-head{display:flex;align-items:center;gap:8px}.forum-reply-head>div{display:grid}.forum-reply-head b{font-size:11px}.forum-reply-head small{color:var(--tinta-3);font-size:9.5px}.forum-reply textarea{width:100%;min-height:94px;padding:11px 12px;border:1px solid var(--garis);border-radius:10px;background:var(--kertas);color:var(--tinta);resize:vertical;outline:none;line-height:1.55}.forum-reply textarea:focus{border-color:var(--brand);box-shadow:0 0 0 3px color-mix(in srgb,var(--brand) 9%,transparent)}.forum-reply-foot{display:flex;align-items:center;justify-content:space-between;gap:10px}.forum-reply-foot small{color:var(--tinta-3);font-size:9px}.forum-login-card{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:0 19px 19px;padding:14px;border:1px solid var(--garis);border-radius:13px;background:var(--brand-soft)}.forum-login-card b{font-size:11px}.forum-login-card p{margin:3px 0 0;color:var(--tinta-2);font-size:10px;line-height:1.5}.forum-thread-empty{min-height:360px;display:grid;place-items:center;align-content:center;padding:28px;border:1px dashed var(--garis);border-radius:18px;background:var(--kertas);text-align:center}.forum-thread-empty>span{font-size:34px;color:var(--brand)}.forum-thread-empty h2{margin:8px 0 4px}.forum-thread-empty p{margin:0;color:var(--tinta-3)}

  .forum-sidebar{display:grid;gap:10px}.forum-side-card,.forum-polling-shortcut{padding:17px;border:1px solid var(--garis);border-radius:17px;background:var(--kertas);box-shadow:0 14px 35px -34px rgba(0,0,0,.36)}.forum-side-welcome{background:linear-gradient(145deg,color-mix(in srgb,var(--brand-soft) 65%,var(--kertas)),var(--kertas))}.forum-side-card h3{margin:4px 0 7px;font-size:17px}.forum-side-card p{margin:0;color:var(--tinta-2);font-size:11.5px;line-height:1.6}.forum-side-card>a{display:inline-flex;margin-top:10px;color:var(--brand);font-size:10.5px;font-weight:700;text-decoration:none}.forum-side-head h3{margin:3px 0 10px}.forum-popular-list{display:grid}.forum-popular-list button{width:100%;display:grid;grid-template-columns:26px minmax(0,1fr);gap:7px;padding:10px 0;border:0;border-bottom:1px solid var(--garis);background:none;color:var(--tinta);text-align:left;cursor:pointer}.forum-popular-list button:last-child{border-bottom:0;padding-bottom:0}.forum-popular-list button>span{color:var(--brand);font-family:var(--font-display);font-size:11px;font-weight:800}.forum-popular-list button div{display:grid;gap:3px}.forum-popular-list b{display:-webkit-box;overflow:hidden;-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:10.5px;line-height:1.45}.forum-popular-list small{color:var(--tinta-3);font-size:9px}.forum-rules ol{display:grid;gap:11px;margin:12px 0 0;padding:0;list-style:none}.forum-rules li{display:grid;grid-template-columns:22px 1fr;column-gap:8px;counter-increment:aturan}.forum-rules ol{counter-reset:aturan}.forum-rules li::before{content:counter(aturan);width:22px;height:22px;display:grid;place-items:center;grid-row:1/3;border-radius:7px;background:var(--brand-soft);color:var(--brand);font-size:9px;font-weight:800}.forum-rules b{font-size:10.5px}.forum-rules span{color:var(--tinta-3);font-size:9.5px;line-height:1.5}.forum-polling-shortcut{display:grid;gap:5px;text-decoration:none;background:linear-gradient(135deg,var(--brand),color-mix(in srgb,var(--brand) 75%,#073f34));color:white}.forum-polling-shortcut>span{font-size:9px;font-weight:800;letter-spacing:.1em;opacity:.75}.forum-polling-shortcut strong{font-family:var(--font-display);font-size:13px;line-height:1.4}.forum-polling-shortcut small{font-size:9.5px;opacity:.8}.forum-side-empty{font-size:10px!important}

  .forum-poll-section{display:grid;grid-template-columns:minmax(260px,.65fr) minmax(0,1.35fr);gap:24px;align-items:start;margin-top:28px;padding:29px;border:1px solid var(--garis);border-radius:24px;background:linear-gradient(140deg,color-mix(in srgb,var(--brand-soft) 55%,var(--kertas)),var(--kertas))}.forum-poll-intro{padding:8px 4px}.forum-poll-intro h2{margin:6px 0 9px;font-size:30px}.forum-poll-intro p{margin:0;color:var(--tinta-2);font-size:13px;line-height:1.7}.forum-poll-card{padding:20px;border:1px solid var(--garis);border-radius:18px;background:var(--kertas);box-shadow:0 22px 55px -48px rgba(0,0,0,.45)}.forum-poll-card>header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.forum-poll-card h3{margin:4px 0 0;font-size:20px}.forum-poll-badge{flex:none;padding:5px 8px;border-radius:999px;background:var(--brand-soft);color:var(--brand);font-size:9px;font-weight:800}.forum-poll-note{margin:11px 0 0;color:var(--tinta-2);font-size:11.5px;line-height:1.6}.forum-poll-lock{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-top:15px;padding:14px;border:1px solid var(--garis);border-radius:13px;background:var(--permukaan-3,var(--kertas))}.forum-poll-lock b{font-size:11px}.forum-poll-lock p{margin:3px 0 0;color:var(--tinta-3);font-size:10px;line-height:1.5}.forum-poll-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:15px}.forum-poll-options button{display:grid;grid-template-columns:32px minmax(0,1fr) auto;gap:9px;align-items:center;padding:12px;border:1px solid var(--garis);border-radius:12px;background:var(--kertas);color:var(--tinta);text-align:left;cursor:pointer;transition:.16s}.forum-poll-options button:hover{border-color:var(--brand);background:var(--brand-soft)}.forum-poll-options button>span{width:32px;height:32px;display:grid;place-items:center;border-radius:9px;background:var(--brand-soft);color:var(--brand);font-family:var(--font-display);font-weight:800}.forum-poll-options b{font-size:11px}.forum-poll-options small{color:var(--brand);font-size:9px;font-weight:700}.forum-poll-results{display:grid;gap:11px;margin-top:16px}.forum-poll-result{padding:12px;border:1px solid var(--garis);border-radius:12px}.forum-poll-result.milikku{border-color:var(--brand);background:color-mix(in srgb,var(--brand-soft) 58%,var(--kertas))}.forum-poll-result>div:first-child{display:grid;grid-template-columns:28px minmax(0,1fr) auto;gap:8px;align-items:center}.forum-poll-result>div:first-child>span{width:28px;height:28px;display:grid;place-items:center;border-radius:8px;background:var(--brand-soft);color:var(--brand);font-weight:800}.forum-poll-result b{font-size:10.5px}.forum-poll-result strong{color:var(--brand);font-family:var(--font-display);font-size:16px}.forum-poll-track{height:7px;margin-top:9px;overflow:hidden;border-radius:999px;background:var(--garis)}.forum-poll-track i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--brand),color-mix(in srgb,var(--brand) 58%,#58c7a0));transition:width .3s}.forum-poll-result>small{display:block;margin-top:5px;color:var(--tinta-3);font-size:9px}.forum-poll-footer{margin-top:13px;padding-top:12px;border-top:1px solid var(--garis)}.forum-poll-footer p{margin:0;color:var(--tinta-3);font-size:9.5px}.forum-poll-footer>div{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.forum-poll-footer .tombol{font-size:10px}

  .forum-official{display:grid;grid-template-columns:minmax(260px,.72fr) minmax(0,1.28fr);gap:24px;align-items:center;margin:18px 0 0;padding:27px;border:1px solid var(--garis);border-radius:22px;background:var(--kertas)}.forum-official h2{margin:5px 0 7px;font-size:27px}.forum-official>div:first-child>p{margin:0;color:var(--tinta-2);font-size:12px;line-height:1.65}.forum-official-grid{display:grid;gap:8px}.forum-official-grid a{display:grid;grid-template-columns:35px minmax(0,1fr) auto;gap:10px;align-items:center;padding:13px;border:1px solid var(--garis);border-radius:13px;color:var(--tinta);text-decoration:none;transition:.16s}.forum-official-grid a:hover{border-color:var(--brand);background:var(--brand-soft)}.forum-official-grid>a>span{width:35px;height:35px;display:grid;place-items:center;border-radius:10px;background:var(--brand-soft);color:var(--brand);font-family:var(--font-display);font-size:10px;font-weight:800}.forum-official-grid div{display:grid;gap:2px}.forum-official-grid b{font-size:11px}.forum-official-grid small{color:var(--tinta-3);font-size:9.5px;line-height:1.45}.forum-official-grid>a>strong{color:var(--brand)}

  @media(max-width:1100px){.forum-shell{grid-template-columns:1fr}.forum-sidebar{grid-template-columns:repeat(2,minmax(0,1fr))}.forum-polling-shortcut{min-height:100%}.forum-workspace{grid-template-columns:minmax(270px,.8fr) minmax(0,1.2fr)}}
  @media(max-width:850px){.forum-hero{grid-template-columns:1fr}.forum-hero-stats{max-width:440px}.forum-poll-section,.forum-official{grid-template-columns:1fr}.forum-workspace{grid-template-columns:1fr}.forum-thread{position:static}.forum-feed-list{grid-template-columns:repeat(2,minmax(0,1fr))}.forum-sidebar{grid-template-columns:1fr 1fr}}
  @media(max-width:680px){.forum-hero{padding:22px;border-radius:19px}.forum-hero h1{font-size:36px}.forum-hero-stats{grid-template-columns:repeat(3,1fr);width:100%}.forum-hero-stats div{min-width:0;padding:13px 10px}.forum-hero-stats strong{font-size:22px}.forum-hero-actions{display:grid;grid-template-columns:1fr}.forum-toolbar-card{grid-template-columns:1fr}.forum-toolbar-card select,.forum-reset{width:100%}.forum-composer{padding:15px}.forum-composer-head{grid-template-columns:40px minmax(0,1fr) auto}.forum-avatar.besar{width:40px;height:40px}.forum-composer-grid{grid-template-columns:1fr}.forum-span-2{grid-column:auto}.forum-composer-foot{align-items:flex-start;flex-direction:column}.forum-composer-foot>div{width:100%}.forum-composer-foot .tombol{flex:1}.forum-feed-list{grid-template-columns:1fr}.forum-topic-card{padding:12px}.forum-thread-copy{padding:17px 15px}.forum-thread-copy h2{font-size:21px}.forum-thread-header,.forum-comments{padding-left:15px;padding-right:15px}.forum-thread-header{align-items:flex-start}.forum-thread-actions{align-items:flex-end;flex-direction:column}.forum-thread-info{padding-left:15px;padding-right:15px}.forum-thread-info a{width:100%;margin-left:0}.forum-reply,.forum-login-card{margin-left:15px;margin-right:15px}.forum-login-card{align-items:flex-start;flex-direction:column}.forum-login-card .tombol{width:100%}.forum-sidebar{grid-template-columns:1fr}.forum-poll-section{padding:20px}.forum-poll-options{grid-template-columns:1fr}.forum-poll-card{padding:15px}.forum-poll-card>header,.forum-poll-lock{align-items:flex-start;flex-direction:column}.forum-poll-lock .tombol{width:100%}.forum-official{padding:20px}.forum-official h2{font-size:24px}.forum-topic-top time{font-size:9px}}
</style>