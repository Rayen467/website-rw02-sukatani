<script>
  import { sesi } from "../keadaan/sesi.svelte.js";
  import { isi } from "../keadaan/isi.svelte.js";
  import { waktu } from "../keadaan/waktu.svelte.js";
  import { GAMBAR_WAKTU } from "../inti/waktu.js";
  import { STATUS } from "../inti/nama.js";

  const gambarHero = $derived(GAMBAR_WAKTU[waktu.fase] || GAMBAR_WAKTU.siang);

  const surat = $derived(isi.surat || []);
  const reservasi = $derived(isi.reservasi || []);
  const usaha = $derived(isi.usaha_baru || []);
  const semuaKiriman = $derived([...surat, ...reservasi, ...usaha]);

  const total = $derived(semuaKiriman.length);
  const proses = $derived(
    semuaKiriman.filter((x) => !x.status || x.status === STATUS.BARU || x.status === STATUS.PROSES).length
  );
  const selesai = $derived(semuaKiriman.filter((x) => x.status === STATUS.SELESAI).length);
  const ditolak = $derived(semuaKiriman.filter((x) => x.status === STATUS.DITOLAK).length);

  const namaWarga = $derived(
    sesi.profilWarga?.nama || sesi.pengguna?.nama || "Warga Sukatani"
  );

  const layananUtama = [
    {
      jenis: "surat",
      judul: "Pengajuan Surat Online",
      ringkas: "Urus surat pengantar dan keterangan tanpa harus datang hanya untuk mengambil antrean.",
      aksi: "Ajukan Surat",
      href: "#/surat",
      poin: ["KTP/KK, domisili, SKCK, dan lainnya", "Status dan dokumen dapat dipantau"]
    },
    {
      jenis: "pengaduan",
      judul: "Pengaduan & Aspirasi",
      ringkas: "Laporkan masalah lingkungan atau sampaikan aspirasi dengan jalur yang jelas.",
      aksi: "Buat Pengaduan",
      href: "#/pengaduan",
      poin: ["Lampirkan informasi lokasi", "Pantau status tindak lanjut"]
    },
    {
      jenis: "reservasi",
      judul: "Reservasi Fasilitas RW",
      ringkas: "Pesan balai warga, tenda, kursi, GOR, dan fasilitas RW yang tersedia.",
      aksi: "Lihat Jadwal",
      href: "#/reservasi",
      poin: ["Jadwal ketersediaan langsung", "Persetujuan tercatat oleh petugas"]
    },
    {
      jenis: "data",
      judul: "Data Kependudukan",
      ringkas: "Informasi kependudukan RW 02 untuk mendukung pelayanan lingkungan.",
      aksi: "Lihat Informasi",
      href: "#/kependudukan",
      poin: ["Statistik wilayah", "Data pribadi tidak dibuka ke publik"]
    }
  ];

  const pendukung = [
    {
      jenis: "umkm",
      judul: "Pendaftaran UMKM",
      ringkas: "Daftarkan usaha warga untuk ditinjau dan ditampilkan di direktori RW 02.",
      href: "#/daftar-usaha"
    },
    {
      jenis: "bansos",
      judul: "Informasi Bantuan Sosial",
      ringkas: "Program, syarat pengajuan, jalur usulan, dan informasi penerima.",
      href: "#/bansos"
    },
    {
      jenis: "tautan",
      judul: "Layanan Pemerintah",
      ringkas: "Akses cepat ke Kelurahan, Kecamatan, Dukcapil, KTP-el, dan layanan terkait.",
      href: "#/tautan"
    }
  ];

  const langkah = [
    ["Pilih Layanan", "Pilih kebutuhan yang sesuai."],
    ["Isi & Kirim", "Lengkapi formulir dengan data yang benar."],
    ["Diproses Petugas", "Pengurus memeriksa dan memperbarui status."],
    ["Pantau Status", "Lihat perkembangan melalui Akun Saya."]
  ];
</script>

<div class="layanan-modern">
  <section class="layanan-hero" style={"--layanan-hero:url('" + gambarHero + "')"}>
    <div class="layanan-hero-lapis"></div>
    <div class="layanan-wadah layanan-hero-grid">
      <div class="layanan-hero-copy">
        <p class="layanan-kicker"><span></span>Layanan Warga</p>
        <h1>Semua Kebutuhan<br />Warga dalam Satu Tempat</h1>
        <p>
          Ajukan surat, laporkan masalah, pesan fasilitas, dan pantau prosesnya
          dengan mudah, cepat, dan transparan.
        </p>
      </div>

      <aside class="layanan-hero-quote" aria-label="Pesan pelayanan">
        <span class="layanan-daun-mini">⌁</span>
        <p>“Pelayanan yang baik<br />untuk lingkungan yang<br />lebih baik.”</p>
        <span class="layanan-garis-emas"></span>
      </aside>
    </div>
  </section>

  <div class="layanan-wadah layanan-isi">
    <section class="layanan-status" aria-label="Ringkasan layanan warga">
      <div class="layanan-sapa">
        <div class="layanan-avatar" aria-hidden="true">
          <svg viewBox="0 0 48 48"><circle cx="24" cy="16" r="9"/><path d="M8 42c2-11 8-16 16-16s14 5 16 16"/></svg>
        </div>
        <div>
          <span>Halo, <strong>{namaWarga}</strong></span>
          <small>{sesi.pengguna ? "Terima kasih telah menjadi bagian dari RW 02." : "Masuk untuk melihat status pengajuan pribadi."}</small>
        </div>
      </div>

      <div class="layanan-status-ringkas">
        <div class="status-item total">
          <span class="status-ikon">▣</span>
          <div><strong>{sesi.pengguna ? total : "—"}</strong><small>Pengajuan Saya</small></div>
        </div>
        <div class="status-item proses">
          <span class="status-ikon">◔</span>
          <div><strong>{sesi.pengguna ? proses : "—"}</strong><small>Diproses</small></div>
        </div>
        <div class="status-item selesai">
          <span class="status-ikon">✓</span>
          <div><strong>{sesi.pengguna ? selesai : "—"}</strong><small>Selesai</small></div>
        </div>
        <div class="status-item ditolak">
          <span class="status-ikon">×</span>
          <div><strong>{sesi.pengguna ? ditolak : "—"}</strong><small>Ditolak</small></div>
        </div>
      </div>

      <a class="layanan-riwayat" href={sesi.pengguna ? "#/akun" : "#/masuk"}>
        {sesi.pengguna ? "Lihat Riwayat" : "Masuk"} <span>→</span>
      </a>
    </section>

    <section class="layanan-utama" aria-labelledby="judul-layanan-utama">
      <h2 id="judul-layanan-utama" class="sr-only">Layanan utama</h2>
      <div class="layanan-kartu-grid">
        {#each layananUtama as l}
          <article class="layanan-kartu {l.jenis}">
            <div class="layanan-kartu-ikon" aria-hidden="true">
              {#if l.jenis === "surat"}
                <svg viewBox="0 0 48 48"><path d="M13 7h17l7 7v27H13z"/><path d="M30 7v8h7M18 22h14M18 28h14M18 34h10"/></svg>
              {:else if l.jenis === "pengaduan"}
                <svg viewBox="0 0 48 48"><path d="M8 25V14h8l19-7v28l-19-7H8z"/><path d="M16 28l4 12h8l-5-10M39 15l4-3M40 23h5M39 31l4 3"/></svg>
              {:else if l.jenis === "reservasi"}
                <svg viewBox="0 0 48 48"><rect x="8" y="12" width="32" height="29" rx="3"/><path d="M8 20h32M16 7v10M32 7v10M15 26h5M25 26h5M15 33h5M25 33h5"/></svg>
              {:else}
                <svg viewBox="0 0 48 48"><circle cx="17" cy="17" r="6"/><circle cx="32" cy="19" r="5"/><path d="M6 39c1-10 6-15 12-15s11 5 12 15M26 39c1-7 4-11 9-11s8 4 9 11"/></svg>
              {/if}
            </div>

            <div class="layanan-dekor" aria-hidden="true"></div>

            <div class="layanan-kartu-copy">
              <h3>{l.judul}</h3>
              <p>{l.ringkas}</p>
            </div>

            <a class="layanan-kartu-aksi" href={l.href}>
              {l.aksi}<span>→</span>
            </a>

            <ul>
              {#each l.poin as p}
                <li><span>✓</span>{p}</li>
              {/each}
            </ul>
          </article>
        {/each}
      </div>
    </section>

    <section class="layanan-pendukung">
      <div class="layanan-judul-bagian">
        <h2>Layanan Pendukung Warga</h2>
        <p>Informasi dan layanan tambahan untuk mendukung kebutuhan masyarakat.</p>
      </div>

      <div class="layanan-pendukung-grid">
        {#each pendukung as p}
          <a class="layanan-pendukung-kartu {p.jenis}" href={p.href}>
            <span class="pendukung-ikon" aria-hidden="true">
              {#if p.jenis === "umkm"}▦{:else if p.jenis === "bansos"}♥{:else}↗{/if}
            </span>
            <span class="pendukung-copy">
              <strong>{p.judul}</strong>
              <small>{p.ringkas}</small>
            </span>
            <span class="pendukung-panah">→</span>
          </a>
        {/each}
      </div>
    </section>

    <section class="layanan-proses">
      <div class="layanan-judul-bagian">
        <h2>Bagaimana Prosesnya?</h2>
        <p>Mudah, cepat, dan bisa dipantau kapan saja.</p>
      </div>

      <div class="layanan-langkah">
        {#each langkah as l, i}
          <article class="layanan-langkah-item">
            <span class="langkah-nomor">{i + 1}</span>
            <div class="langkah-ikon" aria-hidden="true">
              {#if i === 0}↖{:else if i === 1}▤{:else if i === 2}⚙{:else}▣{/if}
            </div>
            <h3>{l[0]}</h3>
            <p>{l[1]}</p>
            {#if i < langkah.length - 1}<span class="langkah-panah" aria-hidden="true">›</span>{/if}
          </article>
        {/each}
      </div>
    </section>

    <section class="layanan-bantuan">
      <div>
        <h2>Butuh Bantuan?</h2>
        <p>Jika mengalami kendala, hubungi pengurus melalui halaman kontak.</p>
      </div>
      <a class="bantuan-tombol" href="#/kontak"><span>●</span> Hubungi Pengurus <b>→</b></a>
      <a class="bantuan-umum" href="#/kontak">
        <span class="bantuan-chat">•••</span>
        <span><strong>Pertanyaan umum</strong><small>Lihat panduan dan kontak pelayanan.</small></span>
        <b>→</b>
      </a>
    </section>
  </div>
</div>

<style>
  .layanan-modern {
    --lm-hijau: #087554;
    --lm-hijau-tua: #0b493b;
    --lm-tinta: #102d3d;
    --lm-teks: #536269;
    width: 100vw;
    margin-left: calc(50% - 50vw);
    margin-top: -32px;
    margin-bottom: -64px;
    overflow: hidden;
    color: var(--lm-tinta);
    background: #fbfcf9;
    font-family: "Plus Jakarta Sans", system-ui, sans-serif;
  }

  .layanan-wadah {
    width: min(1180px, calc(100% - 40px));
    margin-inline: auto;
  }

  .layanan-hero {
    position: relative;
    min-height: 250px;
    display: flex;
    align-items: center;
    background: #dfe8df var(--layanan-hero) center 52% / cover no-repeat;
  }

  .layanan-hero-lapis {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, rgba(247,250,245,.93) 0%, rgba(247,250,245,.80) 37%, rgba(247,250,245,.28) 68%, rgba(247,250,245,.13)),
      linear-gradient(180deg, rgba(255,255,255,.08), rgba(235,241,233,.28));
  }

  .layanan-hero-grid {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 240px;
    gap: 38px;
    align-items: center;
    padding: 48px 0 38px;
  }

  .layanan-hero-copy {
    max-width: 650px;
  }

  .layanan-kicker {
    display: flex;
    align-items: center;
    gap: 9px;
    margin: 0 0 12px;
    color: #12694f;
    font-family: "IBM Plex Mono", monospace;
    font-size: 9px;
    font-weight: 750;
    letter-spacing: .10em;
    text-transform: uppercase;
  }

  .layanan-kicker span {
    width: 26px;
    height: 2px;
    border-radius: 99px;
    background: #d4a322;
  }

  .layanan-hero h1 {
    max-width: 17ch;
    margin: 0;
    color: #102d3d;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(34px, 4.4vw, 50px);
    font-weight: 750;
    line-height: .98;
    letter-spacing: -.035em;
  }

  .layanan-hero-copy > p:last-child {
    max-width: 590px;
    margin: 12px 0 0;
    color: #3f5660;
    font-size: 13px;
    line-height: 1.55;
  }

  .layanan-hero-quote {
    align-self: center;
    min-height: 150px;
    padding: 22px 20px;
    border: 1px solid rgba(255,255,255,.55);
    border-radius: 12px;
    background: rgba(246, 249, 242, .78);
    backdrop-filter: blur(9px);
    box-shadow: 0 18px 40px -28px rgba(20,60,45,.45);
  }

  .layanan-daun-mini {
    display: block;
    margin-bottom: 9px;
    color: #27a669;
    font-size: 28px;
    line-height: 1;
  }

  .layanan-hero-quote p {
    margin: 0;
    color: #234d43;
    font-family: Georgia, serif;
    font-size: 14px;
    line-height: 1.45;
  }

  .layanan-garis-emas {
    display: block;
    width: 25px;
    height: 2px;
    margin-top: 13px;
    background: #d3a42b;
  }

  .layanan-isi {
    padding: 12px 0 50px;
  }

  .layanan-status {
    display: grid;
    grid-template-columns: minmax(250px, 1.1fr) minmax(420px, 1.35fr) auto;
    gap: 16px;
    align-items: center;
    min-height: 82px;
    padding: 11px 16px;
    border: 1px solid #dce9e2;
    border-radius: 11px;
    background:
      radial-gradient(circle at 8% 50%, rgba(98, 181, 137, .08), transparent 20%),
      linear-gradient(135deg, #f3faf5, #f7fbf8);
  }

  .layanan-sapa {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 0;
  }

  .layanan-avatar {
    width: 50px;
    height: 50px;
    flex: 0 0 50px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: #0a7557;
    background: #d9eee5;
  }

  .layanan-avatar svg {
    width: 32px;
    height: 32px;
    fill: currentColor;
  }

  .layanan-sapa span,
  .layanan-sapa small {
    display: block;
  }

  .layanan-sapa span {
    color: #173947;
    font-size: 12px;
  }

  .layanan-sapa strong {
    font-size: 13px;
  }

  .layanan-sapa small {
    margin-top: 3px;
    color: #708079;
    font-size: 8.5px;
  }

  .layanan-status-ringkas {
    display: grid;
    grid-template-columns: repeat(4, minmax(78px, 1fr));
    gap: 7px;
  }

  .status-item {
    min-height: 52px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 9px;
    border: 1px solid #e7ece8;
    border-radius: 8px;
    background: rgba(255,255,255,.86);
  }

  .status-ikon {
    width: 27px;
    height: 27px;
    flex: 0 0 27px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    font-size: 14px;
    font-weight: 800;
  }

  .status-item.total .status-ikon { color: #0c815c; background: #e8f7f0; }
  .status-item.proses .status-ikon { color: #ce8c09; background: #fff3d8; }
  .status-item.selesai .status-ikon { color: #168b58; background: #e4f6ec; }
  .status-item.ditolak .status-ikon { color: #d43b48; background: #fce7ea; }

  .status-item strong,
  .status-item small { display: block; }

  .status-item strong {
    color: #173643;
    font-size: 16px;
    line-height: 1;
  }

  .status-item small {
    margin-top: 3px;
    color: #71807b;
    font-size: 7.5px;
  }

  .layanan-riwayat {
    min-height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 8px 14px;
    border: 1px solid #177155;
    border-radius: 7px;
    color: #176148;
    font-size: 9px;
    font-weight: 750;
    white-space: nowrap;
  }

  .layanan-riwayat:hover {
    text-decoration: none;
    background: #edf7f2;
  }

  .layanan-utama {
    margin-top: 15px;
  }

  .layanan-kartu-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .layanan-kartu {
    --aksen: #087554;
    --aksen-gelap: #075e46;
    --card-bg: #eef8f2;
    position: relative;
    min-width: 0;
    min-height: 330px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 15px 15px 14px;
    border: 1px solid rgba(10, 91, 67, .11);
    border-radius: 10px;
    background: var(--card-bg);
    box-shadow: 0 16px 38px -33px rgba(20, 60, 45, .45);
  }

  .layanan-kartu.pengaduan {
    --aksen: #c87b00;
    --aksen-gelap: #a96500;
    --card-bg: #fff4e4;
    border-color: rgba(202, 126, 16, .13);
  }

  .layanan-kartu.reservasi {
    --aksen: #0c74b8;
    --aksen-gelap: #09629d;
    --card-bg: #eaf5ff;
    border-color: rgba(25, 116, 182, .13);
  }

  .layanan-kartu.data {
    --aksen: #6b43c8;
    --aksen-gelap: #5735a7;
    --card-bg: #f1edff;
    border-color: rgba(100, 67, 190, .13);
  }

  .layanan-kartu-ikon {
    position: relative;
    z-index: 2;
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    color: var(--aksen);
    background: rgba(255,255,255,.86);
    box-shadow: 0 10px 22px -18px rgba(0,0,0,.35);
  }

  .layanan-kartu-ikon svg {
    width: 27px;
    height: 27px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.4;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .layanan-dekor {
    position: absolute;
    z-index: 0;
    right: -38px;
    top: 12px;
    width: 150px;
    height: 150px;
    opacity: .08;
    border-radius: 48% 52% 44% 56%;
    background:
      radial-gradient(circle at 35% 35%, var(--aksen) 0 22%, transparent 23%),
      radial-gradient(circle at 65% 58%, var(--aksen) 0 29%, transparent 30%);
    transform: rotate(-15deg);
  }

  .layanan-kartu-copy {
    position: relative;
    z-index: 1;
    min-height: 111px;
    margin-top: 11px;
  }

  .layanan-kartu h3 {
    max-width: 12ch;
    margin: 0;
    color: #122f3e;
    font-family: "Archivo", sans-serif;
    font-size: 19px;
    line-height: 1.05;
    letter-spacing: -.035em;
  }

  .layanan-kartu-copy p {
    margin: 8px 0 0;
    color: #57676b;
    font-size: 10px;
    line-height: 1.48;
  }

  .layanan-kartu-aksi {
    position: relative;
    z-index: 2;
    min-height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: auto;
    border-radius: 7px;
    color: #fff;
    background: linear-gradient(180deg, var(--aksen), var(--aksen-gelap));
    font-size: 10px;
    font-weight: 750;
  }

  .layanan-kartu-aksi:hover {
    color: #fff;
    text-decoration: none;
    transform: translateY(-1px);
  }

  .layanan-kartu ul {
    position: relative;
    z-index: 1;
    display: grid;
    gap: 7px;
    margin: 12px 0 0;
    padding: 0;
    list-style: none;
  }

  .layanan-kartu li {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    color: #58686a;
    font-size: 8.5px;
    line-height: 1.35;
  }

  .layanan-kartu li > span {
    width: 17px;
    height: 17px;
    flex: 0 0 17px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: #fff;
    background: var(--aksen);
    font-size: 9px;
    font-weight: 800;
  }

  .layanan-pendukung,
  .layanan-proses {
    margin-top: 27px;
  }

  .layanan-judul-bagian h2 {
    margin: 0;
    color: #112f3e;
    font-family: Georgia, serif;
    font-size: 23px;
    line-height: 1.05;
  }

  .layanan-judul-bagian p {
    margin: 4px 0 0;
    color: #71807e;
    font-size: 9.5px;
  }

  .layanan-pendukung-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 12px;
  }

  .layanan-pendukung-kartu {
    min-width: 0;
    min-height: 78px;
    display: grid;
    grid-template-columns: 45px minmax(0, 1fr) 24px;
    gap: 11px;
    align-items: center;
    padding: 11px 13px;
    border: 1px solid #e0e7e2;
    border-radius: 8px;
    color: inherit;
    background: #fff;
  }

  .layanan-pendukung-kartu:hover {
    text-decoration: none;
    border-color: #bdd5c8;
    transform: translateY(-1px);
  }

  .pendukung-ikon {
    width: 45px;
    height: 45px;
    display: grid;
    place-items: center;
    border-radius: 9px;
    color: #0d7555;
    background: #e8f5ef;
    font-size: 22px;
    font-weight: 800;
  }

  .layanan-pendukung-kartu.bansos .pendukung-ikon {
    color: #d9374e;
    background: #fce9ed;
  }

  .layanan-pendukung-kartu.tautan .pendukung-ikon {
    color: #126ba3;
    background: #e7f2f9;
  }

  .pendukung-copy strong,
  .pendukung-copy small { display: block; }

  .pendukung-copy strong {
    color: #183846;
    font-size: 10px;
  }

  .pendukung-copy small {
    margin-top: 3px;
    color: #71807b;
    font-size: 8px;
    line-height: 1.4;
  }

  .pendukung-panah {
    justify-self: end;
    color: #0f6f54;
    font-size: 22px;
  }

  .layanan-langkah {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-top: 14px;
  }

  .layanan-langkah-item {
    position: relative;
    min-width: 0;
    padding: 0 10px;
    text-align: center;
  }

  .langkah-nomor {
    position: absolute;
    top: -2px;
    left: 7px;
    width: 31px;
    height: 31px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: #fff;
    background: #15764e;
    font-size: 11px;
    font-weight: 800;
  }

  .langkah-ikon {
    width: 60px;
    height: 60px;
    display: grid;
    place-items: center;
    margin: 0 auto 8px;
    border-radius: 50%;
    color: #0e7654;
    background: #edf7f2;
    font-size: 23px;
    font-weight: 800;
  }

  .layanan-langkah-item h3 {
    margin: 0;
    color: #183645;
    font-size: 11px;
  }

  .layanan-langkah-item p {
    max-width: 23ch;
    margin: 5px auto 0;
    color: #71807d;
    font-size: 8.5px;
    line-height: 1.45;
  }

  .langkah-panah {
    position: absolute;
    top: 20px;
    right: -12px;
    color: #2d9b71;
    font-size: 32px;
    font-weight: 300;
  }

  .layanan-bantuan {
    display: grid;
    grid-template-columns: 1fr auto minmax(260px, .75fr);
    gap: 14px;
    align-items: center;
    margin-top: 28px;
    padding: 13px 0 0;
    border-top: 1px solid #e3e9e5;
  }

  .layanan-bantuan h2 {
    margin: 0;
    color: #143341;
    font-family: Georgia, serif;
    font-size: 21px;
  }

  .layanan-bantuan p {
    margin: 3px 0 0;
    color: #74817e;
    font-size: 8.5px;
  }

  .bantuan-tombol {
    min-height: 39px;
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 8px 15px;
    border: 1px solid #16805b;
    border-radius: 999px;
    color: #17664c;
    font-size: 9px;
    font-weight: 750;
    white-space: nowrap;
  }

  .bantuan-tombol:hover {
    text-decoration: none;
    background: #eff8f3;
  }

  .bantuan-tombol > span {
    width: 22px;
    height: 22px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: #fff;
    background: #1a9a63;
    font-size: 7px;
  }

  .bantuan-umum {
    min-height: 57px;
    display: grid;
    grid-template-columns: 42px 1fr 20px;
    gap: 10px;
    align-items: center;
    padding: 8px 11px;
    border-radius: 8px;
    color: inherit;
    background: #ecf6f0;
  }

  .bantuan-umum:hover { text-decoration: none; }

  .bantuan-chat {
    width: 42px;
    height: 36px;
    display: grid;
    place-items: center;
    border-radius: 8px;
    color: #fff;
    background: #178657;
    font-size: 16px;
    letter-spacing: 2px;
  }

  .bantuan-umum strong,
  .bantuan-umum small { display: block; }

  .bantuan-umum strong { color: #173946; font-size: 9.5px; }
  .bantuan-umum small { margin-top: 2px; color: #74817c; font-size: 7.5px; }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0,0,0,0);
    white-space: nowrap;
    border: 0;
  }

  :global(:root[data-theme="dark"]) .layanan-modern {
    background: #07171e;
    color: #eef7f4;
  }

  :global(:root[data-theme="dark"]) .layanan-hero-lapis {
    background:
      linear-gradient(90deg, rgba(6,25,32,.92), rgba(6,25,32,.72) 43%, rgba(6,25,32,.30) 74%, rgba(6,25,32,.18)),
      linear-gradient(180deg, rgba(0,0,0,.08), rgba(0,0,0,.32));
  }

  :global(:root[data-theme="dark"]) .layanan-hero h1,
  :global(:root[data-theme="dark"]) .layanan-hero-copy > p:last-child {
    color: #eff8f5;
  }

  :global(:root[data-theme="dark"]) .layanan-hero-quote {
    border-color: rgba(216,239,231,.12);
    background: rgba(8,35,40,.76);
  }

  :global(:root[data-theme="dark"]) .layanan-hero-quote p { color: #dcebe6; }

  :global(:root[data-theme="dark"]) .layanan-status,
  :global(:root[data-theme="dark"]) .layanan-pendukung-kartu,
  :global(:root[data-theme="dark"]) .bantuan-umum {
    border-color: rgba(208,233,224,.10);
    background: #0e272d;
  }

  :global(:root[data-theme="dark"]) .status-item {
    border-color: rgba(208,233,224,.08);
    background: #102a30;
  }

  :global(:root[data-theme="dark"]) .layanan-sapa span,
  :global(:root[data-theme="dark"]) .status-item strong,
  :global(:root[data-theme="dark"]) .layanan-judul-bagian h2,
  :global(:root[data-theme="dark"]) .pendukung-copy strong,
  :global(:root[data-theme="dark"]) .layanan-langkah-item h3,
  :global(:root[data-theme="dark"]) .layanan-bantuan h2,
  :global(:root[data-theme="dark"]) .bantuan-umum strong {
    color: #eef8f5;
  }

  :global(:root[data-theme="dark"]) .layanan-sapa small,
  :global(:root[data-theme="dark"]) .status-item small,
  :global(:root[data-theme="dark"]) .layanan-judul-bagian p,
  :global(:root[data-theme="dark"]) .pendukung-copy small,
  :global(:root[data-theme="dark"]) .layanan-langkah-item p,
  :global(:root[data-theme="dark"]) .layanan-bantuan p,
  :global(:root[data-theme="dark"]) .bantuan-umum small {
    color: #aabdb7;
  }

  :global(:root[data-theme="dark"]) .layanan-kartu {
    filter: brightness(.76) saturate(.82);
  }

  @media (max-width: 980px) {
    .layanan-hero-grid {
      grid-template-columns: 1fr 210px;
    }

    .layanan-status {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .layanan-status-ringkas {
      grid-template-columns: repeat(4, 1fr);
    }

    .layanan-riwayat {
      justify-self: start;
    }

    .layanan-kartu-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .layanan-bantuan {
      grid-template-columns: 1fr auto;
    }

    .bantuan-umum {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 680px) {
    .layanan-modern {
      margin-top: -32px;
      margin-bottom: -64px;
    }

    .layanan-wadah {
      width: min(100% - 24px, 1180px);
    }

    .layanan-hero {
      min-height: 310px;
      background-position: 63% center;
    }

    .layanan-hero-grid {
      grid-template-columns: 1fr;
      gap: 14px;
      padding: 56px 0 24px;
    }

    .layanan-hero h1 {
      max-width: 16ch;
      font-size: 31px;
      line-height: 1.01;
    }

    .layanan-hero-copy > p:last-child {
      max-width: 44ch;
      font-size: 11px;
    }

    .layanan-hero-quote {
      width: min(230px, 75%);
      min-height: 0;
      padding: 12px 14px;
      justify-self: end;
    }

    .layanan-hero-quote p {
      font-size: 11px;
    }

    .layanan-daun-mini {
      display: none;
    }

    .layanan-isi {
      padding: 10px 0 38px;
    }

    .layanan-status {
      padding: 11px;
    }

    .layanan-avatar {
      width: 42px;
      height: 42px;
      flex-basis: 42px;
    }

    .layanan-avatar svg {
      width: 27px;
      height: 27px;
    }

    .layanan-status-ringkas {
      grid-template-columns: 1fr 1fr;
    }

    .status-item {
      min-height: 46px;
    }

    .layanan-kartu-grid,
    .layanan-pendukung-grid,
    .layanan-langkah {
      grid-template-columns: 1fr;
    }

    .layanan-kartu {
      min-height: 285px;
    }

    .layanan-kartu h3 {
      font-size: 18px;
    }

    .layanan-kartu-copy {
      min-height: 90px;
    }

    .layanan-pendukung,
    .layanan-proses {
      margin-top: 22px;
    }

    .layanan-judul-bagian h2 {
      font-size: 20px;
    }

    .layanan-langkah {
      gap: 12px;
    }

    .layanan-langkah-item {
      min-height: 82px;
      display: grid;
      grid-template-columns: 42px 48px 1fr;
      grid-template-rows: auto auto;
      gap: 2px 8px;
      align-items: center;
      padding: 8px 0;
      text-align: left;
      border-bottom: 1px solid #e5ebe7;
    }

    .langkah-nomor {
      position: static;
      grid-column: 1;
      grid-row: 1 / 3;
      width: 31px;
      height: 31px;
      margin: auto;
    }

    .langkah-ikon {
      grid-column: 2;
      grid-row: 1 / 3;
      width: 44px;
      height: 44px;
      margin: 0;
      font-size: 18px;
    }

    .layanan-langkah-item h3 {
      grid-column: 3;
      grid-row: 1;
      align-self: end;
    }

    .layanan-langkah-item p {
      grid-column: 3;
      grid-row: 2;
      max-width: none;
      margin: 2px 0 0;
      align-self: start;
    }

    .langkah-panah {
      display: none;
    }

    .layanan-bantuan {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .bantuan-tombol {
      justify-self: start;
    }

    .bantuan-umum {
      grid-column: auto;
    }
  }
</style>
