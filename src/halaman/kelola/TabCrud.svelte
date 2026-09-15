<script>
  import { KOLEKSI, KONTEN, STATUS } from "../../inti/nama.js";
  import { isi, muatKoleksi, muatKonten } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import {
    tambahIsi,
    simpanDokumen,
    simpanKonten,
    pindahDokumen,
    ubahDokumen,
    hapusDokumen
  } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";
  import { keSlug } from "../../inti/format.js";
  import BarisKelola from "../../komponen/BarisKelola.svelte";

  const STATUS_KIRIMAN = [
    { nilai: STATUS.BARU, label: "Diterima" },
    { nilai: STATUS.PROSES, label: "Diproses" },
    { nilai: STATUS.SELESAI, label: "Selesai" },
    { nilai: STATUS.DITOLAK, label: "Ditolak" }
  ];
  const STATUS_FORUM = [
    { nilai: STATUS.AKTIF, label: "Aktif" },
    { nilai: "dihapus", label: "Disembunyikan" }
  ];
  const STATUS_WARGA = [
    { nilai: STATUS.BARU, label: "Menunggu" },
    { nilai: STATUS.AKTIF, label: "Aktif" },
    { nilai: STATUS.DITOLAK, label: "Ditolak" }
  ];

  function kunciJadwal(tanggal, fasilitas) {
    return `${tanggal || "tanggal"}--${keSlug(fasilitas || "fasilitas") || "fasilitas"}`;
  }

  const MODUL = [
    {
      id: "jadwal", kelompok: "Operasional", label: "Jadwal fasilitas", koleksi: KOLEKSI.JADWAL, kunci: "jadwal",
      keterangan: "Blokir tanggal fasilitas secara manual, termasuk jadwal yang tidak berasal dari formulir reservasi.",
      awal: { tanggal: "", fasilitas: "" },
      kolom: [
        { nama: "tanggal", label: "Tanggal", jenis: "tanggal", wajib: true },
        { nama: "fasilitas", label: "Fasilitas", wajib: true }
      ],
      idDari: (d) => kunciJadwal(d.tanggal, d.fasilitas),
      judul: (o) => o.fasilitas || "Jadwal fasilitas",
      baris: (o) => [o.tanggal || o.id]
    },
    {
      id: "pengaduan", kelompok: "Kiriman warga", label: "Pengaduan", koleksi: KOLEKSI.PENGADUAN, kunci: "pengaduan",
      keterangan: "Koreksi data salah, status, catatan penanganan, atau hapus kiriman duplikat/spam.",
      awal: { tiket: "", kategori: "", lokasi: "", isi: "", status: STATUS.BARU, catatan: "", uid: "" },
      kolom: [
        { nama: "tiket", label: "Nomor tiket" },
        { nama: "kategori", label: "Kategori", wajib: true },
        { nama: "lokasi", label: "Lokasi" },
        { nama: "isi", label: "Isi pengaduan", jenis: "panjang", wajib: true },
        { nama: "status", label: "Status", jenis: "pilih", pilihan: STATUS_KIRIMAN },
        { nama: "catatan", label: "Catatan penanganan", jenis: "panjang" }
      ],
      judul: (o) => o.tiket || o.kategori || "Pengaduan",
      baris: (o) => [o.kategori || "", o.lokasi || "", o.status || STATUS.BARU]
    },
    {
      id: "pengaduan-kontak", kelompok: "Kiriman warga", label: "Kontak pengaduan", koleksi: KOLEKSI.PENGADUAN_KONTAK, kunci: "pengaduan_kontak",
      keterangan: "Data privat nama/WhatsApp pelapor. Gunakan hanya untuk koreksi atau membersihkan data yang salah.",
      awal: { tiket: "", nama: "", wa: "", uid: "" },
      kolom: [
        { nama: "tiket", label: "Nomor tiket" },
        { nama: "nama", label: "Nama pelapor" },
        { nama: "wa", label: "WhatsApp" }
      ],
      judul: (o) => o.nama || o.tiket || "Kontak pengaduan",
      baris: (o) => [o.tiket || "", o.wa || ""]
    },
    {
      id: "surat", kelompok: "Kiriman warga", label: "Pengajuan surat", koleksi: KOLEKSI.SURAT, kunci: "surat",
      keterangan: "Pengurus dapat membetulkan salah input pemohon, status, nomor antrean, atau menghapus kiriman ganda.",
      awal: { jenis: "", nama: "", nik: "", ttl: "", alamat: "", rt: "", keperluan: "", wa: "", antrean: "", status: STATUS.BARU, uid: "" },
      kolom: [
        { nama: "jenis", label: "Jenis surat", wajib: true },
        { nama: "nama", label: "Nama pemohon", wajib: true },
        { nama: "nik", label: "NIK" },
        { nama: "ttl", label: "Tempat / tanggal lahir" },
        { nama: "alamat", label: "Alamat", jenis: "panjang" },
        { nama: "rt", label: "RT" },
        { nama: "keperluan", label: "Keperluan", jenis: "panjang" },
        { nama: "wa", label: "WhatsApp" },
        { nama: "antrean", label: "Nomor antrean" },
        { nama: "status", label: "Status", jenis: "pilih", pilihan: STATUS_KIRIMAN }
      ],
      judul: (o) => o.nama || o.jenis || "Pengajuan surat",
      baris: (o) => [o.jenis || "", o.antrean ? `Antrean ${o.antrean}` : "", o.status || STATUS.BARU]
    },
    {
      id: "reservasi", kelompok: "Kiriman warga", label: "Reservasi fasilitas", koleksi: KOLEKSI.RESERVASI, kunci: "reservasi",
      keterangan: "Koreksi tanggal, jam, fasilitas, acara, pemohon, kontak, dan status. Kunci kalender ikut disinkronkan saat reservasi sedang diproses.",
      awal: { fasilitas: "", tanggal: "", jam: "", acara: "", nama: "", wa: "", status: STATUS.BARU, uid: "" },
      kolom: [
        { nama: "fasilitas", label: "Fasilitas", wajib: true },
        { nama: "tanggal", label: "Tanggal", jenis: "tanggal", wajib: true },
        { nama: "jam", label: "Jam" },
        { nama: "acara", label: "Acara", jenis: "panjang" },
        { nama: "nama", label: "Nama pemohon", wajib: true },
        { nama: "wa", label: "WhatsApp" },
        { nama: "status", label: "Status", jenis: "pilih", pilihan: STATUS_KIRIMAN }
      ],
      judul: (o) => o.fasilitas || "Reservasi",
      baris: (o) => [o.tanggal || "", o.nama || "", o.status || STATUS.BARU]
    },
    {
      id: "usaha-baru", kelompok: "Kiriman warga", label: "Pendaftaran UMKM", koleksi: KOLEKSI.USAHA_BARU, kunci: "usaha_baru",
      keterangan: "Koreksi pendaftaran sebelum dipublikasikan ke Pusat UMKM.",
      awal: { nama: "", pemilik: "", jenis: "", produk: "", wa: "", alamat: "", status: STATUS.BARU, uid: "" },
      kolom: [
        { nama: "nama", label: "Nama usaha", wajib: true },
        { nama: "pemilik", label: "Pemilik", wajib: true },
        { nama: "jenis", label: "Jenis usaha" },
        { nama: "produk", label: "Produk / layanan", jenis: "panjang" },
        { nama: "wa", label: "WhatsApp" },
        { nama: "alamat", label: "Alamat", jenis: "panjang" },
        { nama: "status", label: "Status", jenis: "pilih", pilihan: STATUS_KIRIMAN }
      ],
      judul: (o) => o.nama || "Pendaftaran UMKM",
      baris: (o) => [o.pemilik || "", o.jenis || "", o.status || STATUS.BARU]
    },
    {
      id: "warga", kelompok: "Akun & warga", label: "Profil warga", koleksi: KOLEKSI.WARGA, kunci: "warga",
      keterangan: "Edit profil warga atau hapus profil yang salah. Menghapus profil tidak menghapus akun Firebase Authentication.",
      awal: { nama: "", blok: "", rt: "", wa: "", email: "", status: STATUS.BARU },
      mintaId: true,
      idLabel: "UID Firebase (untuk profil baru)",
      kolom: [
        { nama: "nama", label: "Nama", wajib: true },
        { nama: "blok", label: "Blok" },
        { nama: "rt", label: "RT" },
        { nama: "wa", label: "WhatsApp" },
        { nama: "email", label: "Email" },
        { nama: "status", label: "Status", jenis: "pilih", pilihan: STATUS_WARGA }
      ],
      judul: (o) => o.nama || o.email || "Warga",
      baris: (o) => [o.email || "", [o.blok, o.rt].filter(Boolean).join(" · "), o.status || STATUS.BARU]
    },
    {
      id: "forum-topik", kelompok: "Forum & moderasi", label: "Topik forum", koleksi: KOLEKSI.FORUM_TOPIK, kunci: "forum_topik",
      keterangan: "Pengurus dapat memperbaiki topik, menyembunyikan, atau menghapus spam secara permanen. Komentar ikut dibersihkan ketika topik dihapus permanen.",
      awal: { judul: "", isi: "", kategori: "Umum", nama: "Pengurus RW 02", rt: "", status: STATUS.AKTIF, uid: "" },
      kolom: [
        { nama: "judul", label: "Judul", wajib: true },
        { nama: "isi", label: "Isi", jenis: "panjang", wajib: true },
        { nama: "kategori", label: "Kategori" },
        { nama: "nama", label: "Nama penulis" },
        { nama: "rt", label: "RT" },
        { nama: "status", label: "Status", jenis: "pilih", pilihan: STATUS_FORUM }
      ],
      judul: (o) => o.judul || "Topik forum",
      baris: (o) => [o.kategori || "", o.nama || "", o.status || STATUS.AKTIF]
    },
    {
      id: "forum-komentar", kelompok: "Forum & moderasi", label: "Komentar forum", koleksi: KOLEKSI.FORUM_KOMENTAR, kunci: "forum_komentar",
      keterangan: "Edit atau hapus tanggapan forum. ID topik tetap terlihat agar komentar tidak salah pindah diskusi.",
      awal: { topikId: "", isi: "", kategori: "", nama: "Pengurus RW 02", rt: "", status: STATUS.AKTIF, uid: "" },
      kolom: [
        { nama: "topikId", label: "ID topik", wajib: true },
        { nama: "isi", label: "Isi komentar", jenis: "panjang", wajib: true },
        { nama: "kategori", label: "Kategori" },
        { nama: "nama", label: "Nama penulis" },
        { nama: "rt", label: "RT" },
        { nama: "status", label: "Status", jenis: "pilih", pilihan: STATUS_FORUM }
      ],
      judul: (o) => o.nama || "Komentar forum",
      baris: (o) => [o.topikId || "", String(o.isi || "").slice(0, 120), o.status || STATUS.AKTIF]
    },
    {
      id: "bansos-penerima", kelompok: "Data privat", label: "Penerima bansos", koleksi: KOLEKSI.BANSOS_PENERIMA, kunci: "bansos_penerima",
      keterangan: "Editor cadangan untuk data privat penerima bantuan sosial.",
      awal: { nama: "", rt: "", program: "", periode: "", keterangan: "" },
      kolom: [
        { nama: "nama", label: "Nama penerima", wajib: true },
        { nama: "rt", label: "RT" },
        { nama: "program", label: "Program" },
        { nama: "periode", label: "Periode" },
        { nama: "keterangan", label: "Keterangan", jenis: "panjang" }
      ],
      judul: (o) => o.nama || "Penerima bansos",
      baris: (o) => [o.program || "", o.rt || "", o.periode || ""]
    }
  ];

  const DOKUMEN = [
    [KONTEN.BERANDA, "Beranda"],
    [KONTEN.PROFIL, "Profil RW"],
    [KONTEN.KEPENDUDUKAN, "Kependudukan"],
    [KONTEN.KONTAK, "Kontak, peta & iuran"],
    [KONTEN.SAMBUTAN, "Sambutan Ketua RW"],
    [KONTEN.STATISTIK, "Statistik warga"],
    [KONTEN.BANSOS, "Rekap bansos"],
    [KONTEN.IDENTITAS, "Identitas situs"],
    [KONTEN.POLLING, "Polling"],
    [KONTEN.TAMPILAN, "Tampilan"],
    [KONTEN.MAJELIS_TAKLIM, "Majelis Taklim"],
    [KONTEN.GOR_NURANI, "GOR Nurani"]
  ];

  let modulAktif = $state(MODUL[0].id);
  let baru = $state({ ...MODUL[0].awal });
  let idBaru = $state("");
  let cari = $state("");
  let sibuk = $state("");
  let dokumenAktif = $state(KONTEN.BERANDA);
  let jsonDokumen = $state("{}");
  let jsonKotor = $state(false);

  const modul = $derived(MODUL.find((m) => m.id === modulAktif) || MODUL[0]);
  const daftar = $derived.by(() => {
    const semua = Array.isArray(isi[modul.kunci]) ? isi[modul.kunci] : [];
    const q = cari.trim().toLowerCase();
    if (!q) return semua;
    return semua.filter((o) => Object.values(o || {}).some((v) => typeof v === "string" && v.toLowerCase().includes(q)));
  });

  $effect(() => {
    const id = dokumenAktif;
    if (jsonKotor) return;
    jsonDokumen = JSON.stringify(isi.konten[id] || {}, null, 2);
  });

  function pilihModul(id) {
    modulAktif = id;
    const m = MODUL.find((x) => x.id === id) || MODUL[0];
    baru = { ...m.awal };
    idBaru = "";
    cari = "";
  }

  function setBaru(nama, nilai) {
    baru[nama] = nilai;
  }

  function kolomLengkap(m, item) {
    const dasar = [...m.kolom];
    const sudah = new Set(dasar.map((k) => k.nama));
    const abaikan = new Set(["id", "dibuat", "diubah", "uid", "sha256", "dataUrl"]);
    for (const nama of Object.keys(item || {})) {
      if (sudah.has(nama) || abaikan.has(nama)) continue;
      const nilai = item[nama];
      if (nilai == null || typeof nilai === "object") continue;
      dasar.push({
        nama,
        label: nama.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase()),
        jenis: String(nilai).length > 120 ? "panjang" : undefined
      });
    }
    return dasar;
  }

  async function tambahBaru(e) {
    e.preventDefault();
    sibuk = "tambah";
    try {
      const data = { ...baru };
      let id = "";
      if (modul.mintaId) {
        id = idBaru.trim();
        if (!id) throw new Error("ID dokumen wajib diisi.");
      } else if (modul.idDari) {
        id = modul.idDari(data);
      }

      if (id) await simpanDokumen(modul.koleksi, id, data, false);
      else await tambahIsi(modul.koleksi, data);

      await muatKoleksi(modul.koleksi);
      baru = { ...modul.awal };
      idBaru = "";
      beriTahu(`${modul.label} berhasil ditambahkan.`);
    } catch (err) {
      beriTahu(err?.code ? pesanRamah(err) : (err?.message || "Belum berhasil ditambahkan."));
    } finally {
      sibuk = "";
    }
  }

  async function sinkronJadwalReservasi(lama, baruData) {
    const statusLama = lama.status || STATUS.BARU;
    const statusBaru = baruData.status || STATUS.BARU;
    const lamaAktif = statusLama === STATUS.PROSES;
    const baruAktif = statusBaru === STATUS.PROSES;
    if (!lamaAktif && !baruAktif) return;

    const kunciLama = kunciJadwal(lama.tanggal, lama.fasilitas);
    const kunciBaru = kunciJadwal(baruData.tanggal, baruData.fasilitas);

    if (lamaAktif && (!baruAktif || kunciLama !== kunciBaru)) {
      await hapusDokumen(KOLEKSI.JADWAL, kunciLama);
    }
    if (baruAktif && (!lamaAktif || kunciLama !== kunciBaru)) {
      await simpanDokumen(KOLEKSI.JADWAL, kunciBaru, {
        tanggal: baruData.tanggal || "",
        fasilitas: baruData.fasilitas || ""
      }, false);
    }
    await muatKoleksi(KOLEKSI.JADWAL);
  }

  async function ubahKhusus(id, perubahan, item) {
    if (modul.id === "reservasi") {
      const lengkap = { ...item, ...perubahan };
      await sinkronJadwalReservasi(item, lengkap);
      await ubahDokumen(modul.koleksi, id, perubahan);
      return;
    }

    if (!modul.idDari) {
      await ubahDokumen(modul.koleksi, id, perubahan);
      return;
    }

    const lengkap = { ...item, ...perubahan };
    delete lengkap.id;
    delete lengkap.dibuat;
    delete lengkap.diubah;
    const idTujuan = modul.idDari(lengkap);
    await pindahDokumen(modul.koleksi, id, idTujuan, lengkap);
  }

  async function hapusKhusus(id, item) {
    if (modul.id === "pengaduan" && item.tiket) {
      const kontak = (isi.pengaduan_kontak || []).filter((x) => x.tiket === item.tiket);
      for (const k of kontak) await hapusDokumen(KOLEKSI.PENGADUAN_KONTAK, k.id);
      if (kontak.length) await muatKoleksi(KOLEKSI.PENGADUAN_KONTAK);
    }

    if (modul.id === "forum-topik") {
      const komentar = (isi.forum_komentar || []).filter((x) => x.topikId === id);
      for (const k of komentar) await hapusDokumen(KOLEKSI.FORUM_KOMENTAR, k.id);
      if (komentar.length) await muatKoleksi(KOLEKSI.FORUM_KOMENTAR);
    }

    if (modul.id === "reservasi" && (item.status || STATUS.BARU) === STATUS.PROSES) {
      await hapusDokumen(KOLEKSI.JADWAL, kunciJadwal(item.tanggal, item.fasilitas));
      await muatKoleksi(KOLEKSI.JADWAL);
    }

    await hapusDokumen(modul.koleksi, id);
  }

  function muatJsonDokumen() {
    jsonDokumen = JSON.stringify(isi.konten[dokumenAktif] || {}, null, 2);
    jsonKotor = false;
  }

  async function simpanJsonDokumen() {
    sibuk = "dokumen";
    try {
      const data = JSON.parse(jsonDokumen || "{}");
      if (!data || Array.isArray(data) || typeof data !== "object") throw new Error("Isi harus berupa objek JSON, misalnya {\"judul\":\"...\"}.");
      await simpanKonten(dokumenAktif, data);
      await muatKonten(dokumenAktif);
      jsonKotor = false;
      beriTahu("Dokumen tetap tersimpan.");
    } catch (err) {
      beriTahu(err?.code ? pesanRamah(err) : (err?.message || "JSON belum valid."));
    } finally {
      sibuk = "";
    }
  }

  async function kosongkanDokumen() {
    if (!confirm("Kembalikan dokumen ini ke nilai bawaan/kosong? Semua isian khusus pada bagian ini akan dikosongkan.")) return;
    sibuk = "dokumen";
    try {
      await simpanKonten(dokumenAktif, {});
      await muatKonten(dokumenAktif);
      jsonKotor = false;
      jsonDokumen = "{}";
      beriTahu("Dokumen dikosongkan. Halaman publik akan memakai nilai bawaan bila tersedia.");
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      sibuk = "";
    }
  }
</script>

<section class="crud-hero">
  <div>
    <span>PUSAT CRUD PENGURUS</span>
    <h2>Tambah, lihat, ubah & hapus data seluruh modul</h2>
    <p>Halaman ini menutup celah yang sebelumnya hanya bisa dibaca atau diganti statusnya. Editor khusus seperti UMKM, galeri foto, dokumen, pengurus, kas, dan profil tetap dipakai karena lebih aman untuk file dan data khusus.</p>
  </div>
  <div class="crud-links">
    <a href="#/petugas/umkm">Pusat UMKM</a>
    <a href="#/petugas/terbit">Berita & galeri</a>
    <a href="#/petugas/berkas">Dokumen & video</a>
    <a href="#/petugas/orang">Warga & pengurus</a>
  </div>
</section>

<section class="crud-shell">
  <aside class="crud-nav">
    {#each [...new Set(MODUL.map((m) => m.kelompok))] as kelompok}
      <div class="crud-nav-group">
        <b>{kelompok}</b>
        {#each MODUL.filter((m) => m.kelompok === kelompok) as m}
          <button type="button" class:aktif={modulAktif === m.id} onclick={() => pilihModul(m.id)}>
            <span>{m.label}</span><small>{Array.isArray(isi[m.kunci]) ? isi[m.kunci].length : "…"}</small>
          </button>
        {/each}
      </div>
    {/each}
  </aside>

  <div class="crud-main">
    <header class="crud-head">
      <div><span>{modul.kelompok}</span><h3>{modul.label}</h3><p>{modul.keterangan}</p></div>
      <label class="crud-search"><span>Cari data</span><input type="search" bind:value={cari} placeholder={`Cari di ${modul.label.toLowerCase()}...`} /></label>
    </header>

    <details class="crud-create" open>
      <summary>+ Tambah {modul.label}</summary>
      <form onsubmit={tambahBaru}>
        {#if modul.mintaId}
          <label><span>{modul.idLabel || "ID dokumen"}</span><input bind:value={idBaru} required /><small>Untuk profil warga, gunakan UID akun Firebase yang benar. Membuat profil di sini tidak membuat akun login baru.</small></label>
        {/if}
        {#each modul.kolom as k}
          <label class:wide={k.jenis === "panjang"}>
            <span>{k.label}</span>
            {#if k.jenis === "panjang"}
              <textarea value={baru[k.nama] || ""} oninput={(e) => setBaru(k.nama, e.currentTarget.value)} required={k.wajib}></textarea>
            {:else if k.jenis === "tanggal"}
              <input type="date" value={baru[k.nama] || ""} oninput={(e) => setBaru(k.nama, e.currentTarget.value)} required={k.wajib} />
            {:else if k.jenis === "pilih"}
              <select value={baru[k.nama] || ""} onchange={(e) => setBaru(k.nama, e.currentTarget.value)}>{#each k.pilihan as p}<option value={p.nilai}>{p.label}</option>{/each}</select>
            {:else}
              <input value={baru[k.nama] || ""} oninput={(e) => setBaru(k.nama, e.currentTarget.value)} required={k.wajib} />
            {/if}
          </label>
        {/each}
        {#if Object.prototype.hasOwnProperty.call(modul.awal, "uid")}
          <label><span>UID pemilik (opsional)</span><input value={baru.uid || ""} oninput={(e) => setBaru("uid", e.currentTarget.value)} /><small>Kosongkan untuk data administratif yang dibuat langsung oleh pengurus.</small></label>
        {/if}
        <div class="wide"><button class="tombol utama" type="submit" disabled={sibuk === "tambah"}>{sibuk === "tambah" ? "Menyimpan..." : `Tambah ${modul.label}`}</button></div>
      </form>
    </details>

    <div class="crud-list-head"><b>{daftar.length} data</b><span>Tombol Ubah membuka seluruh field yang dikelola, termasuk field tambahan yang sudah ada di server.</span></div>

    {#if daftar.length}
      <div class="crud-list">
        {#each daftar as o}
          <div class="crud-item">
            <BarisKelola
              koleksi={modul.koleksi}
              id={o.id}
              judul={modul.judul(o)}
              baris={modul.baris(o)}
              nilai={o}
              kolom={kolomLengkap(modul, o)}
              saatUbah={(modul.idDari || modul.id === "reservasi") ? (id, perubahan) => ubahKhusus(id, perubahan, o) : null}
              saatHapus={(id) => hapusKhusus(id, o)}
            />
            {#if o.uid}<small class="crud-owner">UID pemilik: {o.uid}</small>{/if}
          </div>
        {/each}
      </div>
    {:else}
      <div class="crud-empty">Belum ada data yang cocok dengan pencarian ini.</div>
    {/if}
  </div>
</section>

<section class="crud-advanced">
  <div class="crud-advanced-head">
    <div><span>MODE LANJUTAN</span><h3>Editor lengkap dokumen tetap</h3><p>Dipakai bila sebuah halaman publik punya field baru yang belum dibuatkan borang khusus. Semua kunci dokumen dapat diperbarui tanpa menyentuh kode.</p></div>
    <label><span>Bagian website</span><select bind:value={dokumenAktif} onchange={() => { jsonKotor = false; muatJsonDokumen(); }}>{#each DOKUMEN as [id, label]}<option value={id}>{label}</option>{/each}</select></label>
  </div>
  <textarea class="crud-json" bind:value={jsonDokumen} oninput={() => (jsonKotor = true)} spellcheck="false"></textarea>
  <div class="crud-advanced-actions">
    <button type="button" class="tombol" onclick={muatJsonDokumen}>Muat ulang dari server</button>
    <button type="button" class="tombol" onclick={kosongkanDokumen} disabled={sibuk === "dokumen"}>Reset bagian</button>
    <button type="button" class="tombol utama" onclick={simpanJsonDokumen} disabled={sibuk === "dokumen"}>{sibuk === "dokumen" ? "Menyimpan..." : "Simpan semua field"}</button>
  </div>
  <p class="crud-warning"><b>Catatan:</b> editor JSON adalah jalur cadangan. Untuk pekerjaan harian, gunakan menu khusus karena ada validasi, upload file, preview, dan alur bisnis yang lebih aman.</p>
</section>

<style>
  .crud-hero,.crud-shell,.crud-advanced{border:1px solid #dce7e3;border-radius:18px;background:#fff;box-shadow:0 14px 40px -34px rgba(9,62,47,.45)}
  .crud-hero{display:flex;justify-content:space-between;gap:20px;padding:22px 24px;background:linear-gradient(125deg,#effaf6,#fff 58%,#eef8f4)}.crud-hero>div:first-child{max-width:800px}.crud-hero span,.crud-head>div>span,.crud-advanced-head>div>span{font-size:12px;font-weight:900;letter-spacing:.09em;color:#0a735b}.crud-hero h2{margin:5px 0 7px;font-size:27px;color:#15261f}.crud-hero p,.crud-head p,.crud-advanced-head p{margin:0;color:#6b7874;line-height:1.55}.crud-links{display:flex;align-content:flex-start;justify-content:flex-end;flex-wrap:wrap;gap:7px;max-width:360px}.crud-links a{height:max-content;padding:8px 10px;border:1px solid #cfe0da;border-radius:9px;color:#0a6d58;text-decoration:none;font-weight:750;background:#fff}
  .crud-shell{display:grid;grid-template-columns:230px minmax(0,1fr);margin-top:14px;overflow:hidden}.crud-nav{padding:14px;border-right:1px solid #e2ebe7;background:#f8fbfa}.crud-nav-group+ .crud-nav-group{margin-top:15px}.crud-nav-group>b{display:block;margin:0 7px 6px;color:#7a8782;font-size:11px;text-transform:uppercase;letter-spacing:.08em}.crud-nav button{width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 10px;border:0;border-radius:9px;background:transparent;color:#30463e;text-align:left;cursor:pointer}.crud-nav button:hover{background:#edf6f2}.crud-nav button.aktif{background:#0b6d58;color:#fff}.crud-nav button small{min-width:24px;text-align:center;padding:2px 5px;border-radius:99px;background:rgba(255,255,255,.18);font-size:11px}.crud-main{min-width:0;padding:18px}.crud-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-end}.crud-head h3,.crud-advanced h3{margin:4px 0;font-size:22px;color:#172820}.crud-search{display:grid;gap:5px;min-width:260px}.crud-search>span,.crud-create label>span,.crud-advanced-head label>span{font-size:12px;font-weight:800;color:#51645d}.crud-search input,.crud-create input,.crud-create textarea,.crud-create select,.crud-advanced select{width:100%;min-height:42px;padding:9px 10px;border:1px solid #d4dfdb;border-radius:9px;background:#fff;color:#1d2b26}.crud-create{margin-top:16px;border:1px solid #dfe9e5;border-radius:13px;overflow:hidden}.crud-create>summary{padding:12px 14px;font-weight:850;cursor:pointer;background:#f5faf8;color:#1e4438}.crud-create form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:14px}.crud-create label{display:grid;gap:5px}.crud-create label.wide,.crud-create .wide{grid-column:1/-1}.crud-create textarea{min-height:92px;resize:vertical}.crud-create small{color:#77847f;line-height:1.4}.crud-list-head{display:flex;justify-content:space-between;gap:12px;margin:18px 0 8px;color:#66746f;font-size:12px}.crud-list-head b{color:#213b32}.crud-list{display:grid;gap:8px}.crud-item{border:1px solid #e7eeeb;border-radius:12px;overflow:hidden}.crud-item :global(.baris-kelola){border:0!important;margin:0!important}.crud-owner{display:block;padding:0 14px 10px;color:#8a9692;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.crud-empty{margin-top:12px;padding:22px;border:1px dashed #cfddd7;border-radius:12px;text-align:center;color:#74817c;background:#fafcfb}
  .crud-advanced{margin-top:14px;padding:18px}.crud-advanced-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(240px,340px);gap:18px;align-items:end}.crud-advanced-head label{display:grid;gap:5px}.crud-json{width:100%;min-height:320px;margin-top:14px;padding:14px;border:1px solid #d3ded9;border-radius:12px;background:#101714;color:#dcebe5;font:12.5px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;resize:vertical}.crud-advanced-actions{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:8px;margin-top:10px}.crud-warning{margin:12px 0 0;padding:11px 13px;border-radius:10px;background:#fff8e7;color:#755b1d;font-size:13px;line-height:1.45}
  @media(max-width:900px){.crud-shell{grid-template-columns:1fr}.crud-nav{display:flex;gap:8px;overflow:auto;border-right:0;border-bottom:1px solid #e2ebe7}.crud-nav-group{display:flex;gap:5px;flex:0 0 auto}.crud-nav-group>b{display:none}.crud-nav button{width:auto;white-space:nowrap}.crud-head{align-items:stretch;flex-direction:column}.crud-search{min-width:0}.crud-hero{flex-direction:column}.crud-links{justify-content:flex-start;max-width:none}.crud-advanced-head{grid-template-columns:1fr}}
  @media(max-width:640px){.crud-main{padding:13px}.crud-create form{grid-template-columns:1fr}.crud-create label.wide,.crud-create .wide{grid-column:auto}.crud-list-head{display:block}.crud-list-head span{display:block;margin-top:3px}.crud-hero{padding:17px}.crud-hero h2{font-size:23px}.crud-json{min-height:260px}}
</style>
