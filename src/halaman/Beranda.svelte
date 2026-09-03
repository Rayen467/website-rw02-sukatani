<script>
  import { KONTEN } from "../inti/nama.js";
  import { isi, konten, kontenNilai } from "../keadaan/isi.svelte.js";
  import Belum from "../komponen/Belum.svelte";
  import TombolSalin from "../komponen/TombolSalin.svelte";

  const sambutan = $derived(konten(KONTEN.SAMBUTAN) || {});
  const kabar = $derived((isi.pengumuman || []).slice(0, 3));
  const usaha = $derived((isi.usaha || []).slice(0, 3));  
  const namaRW = $derived(kontenNilai(KONTEN.IDENTITAS, "namaRW", "RW 02"));
</script>

<section class="sorot blok">
  <h1>Selamat datang di situs warga Permai Sukatani</h1>
  <p>Tempat mencari cara mengurus surat, nomor pengurus, jadwal kegiatan, laporan kas, dan usaha tetangga sendiri. Ditulis sekali, bisa dibuka kapan saja.</p>
  <span class="koordinat">{namaRW} · Desa Sukatani, Kec. Rajeg, Kab. Tangerang, Banten 15540</span>
  <div class="aksi">
    <a href="#/surat">Ajukan surat</a>
    <a href="#/pengaduan">Sampaikan pengaduan</a>
    <a href="#/reservasi">Pinjam balai warga</a>
  </div>
</section>

<section class="blok">
  <div class="darurat">
    <span class="judul">Nomor penting</span>
    <span class="butir"><span class="nama">Pos keamanan</span><span class="nomor"><Belum nilai={kontenNilai(KONTEN.KONTAK, "posKeamanan")} /></span></span>
    <span class="butir"><span class="nama">Ketua RW</span><span class="nomor"><Belum nilai={kontenNilai(KONTEN.KONTAK, "ketuaRW")} /></span></span>
    <span class="butir"><span class="nama">Ambulans desa</span><span class="nomor"><Belum nilai={kontenNilai(KONTEN.KONTAK, "ambulans")} /></span></span>
  </div>
</section>

{#if sambutan.teks}
  <section class="blok">
    <div class="kartu">
      <p class="alis">Sambutan Ketua RW</p>
      <div class="orang" style="margin-top:6px">
        <span class="foto">
          {#if sambutan.foto}<img class="gambar-penuh" src={sambutan.foto} alt="" decoding="async" />{/if}
        </span>
        <div>
          <p style="font-size:15.5px;color:var(--tinta);line-height:1.72">{sambutan.teks}</p>
          <p style="margin-top:10px">
            <b class="mono" style="font-size:13px">Ketua {namaRW}{sambutan.nama ? " — " + sambutan.nama : ""}</b>
          </p>
        </div>
      </div>
    </div>
  </section>
{/if}

<section class="blok">
  <div class="kepala-bagian"><h2>Layanan yang sering dipakai</h2></div>
  <div class="petak petak-3">
    <a class="kartu" href="#/surat"><h3>Pengajuan Surat</h3><p>Surat pengantar KTP, domisili, SKCK, keterangan tidak mampu, dan lainnya. Ada nomor antrean dan berkasnya bisa diunduh.</p></a>
    <a class="kartu" href="#/pengaduan"><h3>Pengaduan dan Aspirasi</h3><p>Laporkan sampah, lampu mati, saluran tersumbat, atau gangguan keamanan. Status laporan bisa dipantau.</p></a>
    <a class="kartu" href="#/reservasi"><h3>Reservasi Fasilitas</h3><p>Pinjam balai warga, tenda, kursi, atau pengeras suara. Jadwal ketersediaan terlihat langsung.</p></a>
  </div>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Berita dan pengumuman</h2><a href="#/berita">Lihat semua →</a></div>
  {#if kabar.length}
    <div class="daftar-kabar">
      {#each kabar as k}
        <article class="kabar">
          <div class="tanggal">{k.tglText || k.tgl || ""}</div>
          <div>
            <h3><a href="#/berita/{k.id}">{k.judul}</a></h3>
            <p>{k.ringkas || ""}</p>
            <div class="baris">
              <span class="label-kecil {k.tipe === 'agenda' ? 'agenda' : ''}">{k.tipe === "agenda" ? "Agenda" : "Pengumuman"}</span>
              <TombolSalin judul={k.judul} jalur="/berita/{k.id}" />
            </div>
          </div>
        </article>
      {/each}
    </div>
  {:else}
    <p class="kosong">Belum ada pengumuman. Pengurus dapat menerbitkannya lewat halaman Kelola.</p>
  {/if}
</section>

<section class="blok">
  <div class="petak petak-2">
    <a class="kartu" href="#/kas"><p class="alis">Transparansi</p><h3>Laporan Kas RW</h3><p>Pemasukan, pengeluaran, dan saldo kas dipublikasikan terbuka dan bisa diperiksa warga kapan saja.</p></a>
    <a class="kartu" href="#/program"><p class="alis">Transparansi</p><h3>Rencana dan Realisasi Program</h3><p>Apa yang sudah dikerjakan, apa yang sedang berjalan, dan apa yang direncanakan berikutnya.</p></a>
  </div>
</section>

{#if usaha.length}
  <section class="blok">
    <div class="kepala-bagian"><h2>Usaha warga</h2><a href="#/umkm">Semua usaha →</a></div>
    <div class="petak petak-3">
      {#each usaha as u}
        <a class="kartu usaha-kartu" href="#/umkm/{u.id}">
          <span class="muka">
            {#if u.foto}<img class="gambar-penuh" src={u.foto} alt="" decoding="async" />{:else}FOTO PRODUK{/if}
          </span>
          <span class="badan">
            <span class="jenis">{u.katLabel || ""}</span>
            <h3>{u.nama}</h3>
            <span style="font-size:13.5px;color:var(--tinta-2);line-height:1.5">{u.ringkas || ""}</span>
          </span>
        </a>
      {/each}
    </div>
  </section>
{/if}
