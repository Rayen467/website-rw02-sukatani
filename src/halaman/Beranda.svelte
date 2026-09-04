<script>
  import { KONTEN } from "../inti/nama.js";
  import { keDaftar } from "../inti/format.js";
  import { SAMBUTAN_BAWAAN, BERANDA_BAWAAN } from "../inti/bawaan.js";
  import { isi, kontenNilai } from "../keadaan/isi.svelte.js";
  import Belum from "../komponen/Belum.svelte";
  import TombolSalin from "../komponen/TombolSalin.svelte";

  /* Naskah dari Ketua RW dipakai sampai pengurus menyimpan gantinya lewat
     Kelola. kontenNilai() jatuh ke bawaan per kolom, jadi mengganti nama
     saja tidak ikut mengosongkan naskahnya. */
  const sambutan = $derived({
    teks: kontenNilai(KONTEN.SAMBUTAN, "teks", SAMBUTAN_BAWAAN.teks),
    nama: kontenNilai(KONTEN.SAMBUTAN, "nama", SAMBUTAN_BAWAAN.nama),
    foto: kontenNilai(KONTEN.SAMBUTAN, "foto", "")
  });
  const kabar = $derived((isi.pengumuman || []).slice(0, 3));
  const usaha = $derived((isi.usaha || []).slice(0, 3));  
  const namaRW = $derived(kontenNilai(KONTEN.IDENTITAS, "namaRW", "RW 02"));

  /* Seluruh tulisan beranda diambil dari konten/beranda, dengan naskah di
     inti/bawaan.js sebagai cadangan per kolom. Pengurus mengubahnya lewat
     Kelola, tab Beranda -- tanpa menyentuh berkas ini. */
  const t = $derived(
    Object.fromEntries(
      Object.keys(BERANDA_BAWAAN).map((k) => [k, kontenNilai(KONTEN.BERANDA, k, BERANDA_BAWAAN[k])])
    )
  );
</script>

<section class="sorot blok">
  <h1>{t.judul}</h1>
  <p>{t.ringkas}</p>
  <span class="koordinat">{namaRW} · {t.alamat}</span>
  <div class="aksi">
    <a href="#/surat">Ajukan surat</a>
    <a href="#/pengaduan">Sampaikan pengaduan</a>
    <a href="#/reservasi">Pinjam balai warga</a>
  </div>
</section>

<section class="blok zona">
  <div class="darurat">
    <span class="judul">Nomor penting</span>
    <span class="butir"><span class="nama">Pos keamanan</span><span class="nomor"><Belum nilai={kontenNilai(KONTEN.KONTAK, "posKeamanan")} /></span></span>
    <span class="butir"><span class="nama">Ketua RW</span><span class="nomor"><Belum nilai={kontenNilai(KONTEN.KONTAK, "ketuaRW")} /></span></span>
    <span class="butir"><span class="nama">Ambulans desa</span><span class="nomor"><Belum nilai={kontenNilai(KONTEN.KONTAK, "ambulans")} /></span></span>
  </div>
</section>

{#if sambutan.teks}
  <section class="blok">
    <div class="sambutan">
      <p class="alis">Sambutan Ketua RW</p>
      <div class="orang" class:tanpa-foto={!sambutan.foto}>
        {#if sambutan.foto}
          <span class="foto"><img class="gambar-penuh" src={sambutan.foto} alt="" decoding="async" /></span>
        {/if}
        <div>
          <!-- Satu alinea satu paragraf. Kalau seluruh naskah ditaruh di satu
               <p>, peramban menelan semua baris barunya dan sambutan berubah
               jadi satu blok tembok yang tidak terbaca. -->
          {#each keDaftar(sambutan.teks) as alinea}
            <p class="alinea">{alinea}</p>
          {/each}
          <p class="tanda-tangan">
            <b class="mono">Ketua {namaRW}{sambutan.nama ? " — " + sambutan.nama : ""}</b>
          </p>
        </div>
      </div>
    </div>
  </section>
{/if}

<section class="blok zona">
  <div class="kepala-bagian"><h2>{t.judulLayanan}</h2></div>
  <div class="petak petak-3">
    <a class="kartu tindakan" href="#/surat"><h3>{t.layanan1Judul}</h3><p>{t.layanan1Teks}</p></a>
    <a class="kartu tindakan" href="#/pengaduan"><h3>{t.layanan2Judul}</h3><p>{t.layanan2Teks}</p></a>
    <a class="kartu tindakan" href="#/reservasi"><h3>{t.layanan3Judul}</h3><p>{t.layanan3Teks}</p></a>
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
    <a class="kartu sunyi" href="#/kas"><p class="alis">Transparansi</p><h3>{t.judulKas}</h3><p>{t.teksKas}</p></a>
    <a class="kartu sunyi" href="#/program"><p class="alis">Transparansi</p><h3>{t.judulProgram}</h3><p>{t.teksProgram}</p></a>
  </div>
</section>

{#if usaha.length}
  <section class="blok">
    <div class="kepala-bagian"><h2>Usaha warga</h2><a href="#/umkm">Semua usaha →</a></div>
    <div class="petak petak-3">
      {#each usaha as u}
        <a class="kartu usaha-kartu" href="#/umkm/{u.id}">
          <span class="muka">
            {#if u.foto}<img class="gambar-penuh" src={u.foto} alt="" decoding="async" />{/if}
          </span>
          <span class="badan">
            <span class="jenis">{u.katLabel || ""}</span>
            <h3>{u.nama}</h3>
            <span class="usaha-ringkas">{u.ringkas || ""}</span>
          </span>
        </a>
      {/each}
    </div>
  </section>
{/if}
