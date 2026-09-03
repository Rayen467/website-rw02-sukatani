<script>
  import { isi, pakai } from "../keadaan/isi.svelte.js";
  import { rute } from "../keadaan/rute.svelte.js";
  import { JENIS_SURAT_BAWAAN, FASILITAS_BAWAAN, TAUTAN_BAWAAN } from "../inti/bawaan.js";

  const HALAMAN = [
    ["Profil RW", "Sejarah, visi-misi, dan keterangan wilayah", "/profil", "profil sejarah visi misi wilayah batas luas"],
    ["Struktur pengurus", "Pengurus RW dan Ketua RT", "/pengurus", "pengurus ketua rw rt sekretaris bendahara struktur pkk"],
    ["Peta wilayah", "Peta dan fasilitas umum", "/peta", "peta denah wilayah batas fasilitas umum balai lapangan"],
    ["Data kependudukan", "Jumlah warga dan komposisinya", "/kependudukan", "kependudukan penduduk jumlah warga statistik usia pendidikan pekerjaan agama"],
    ["Kalender kegiatan", "Jadwal rutin dan acara mendatang", "/kalender", "kalender jadwal kegiatan ronda posyandu pengajian kerja bakti"],
    ["Laporan kas RW", "Pemasukan, pengeluaran, dan saldo", "/kas", "kas keuangan iuran saldo laporan bendahara transparansi"],
    ["Rencana dan realisasi", "Program yang sudah dan akan dikerjakan", "/program", "program rencana realisasi pembangunan"],
    ["Galeri foto", "Dokumentasi kegiatan warga", "/galeri", "galeri foto dokumentasi arsip"],
    ["Forum dan polling", "Survei pendapat warga", "/forum", "forum polling survei musyawarah suara"],
    ["Kontak dan lokasi", "Alamat sekretariat dan jam pelayanan", "/kontak", "kontak alamat lokasi jam layanan telepon sekretariat"],
    ["Tautan penting", "Desa, kecamatan, dan Dukcapil", "/tautan", "link tautan dukcapil kecamatan desa ktp online"]
  ];

  const hasil = $derived.by(() => {
    const q = String(rute.cari || "").trim().toLowerCase();
    if (!q) return [];
    const out = [];
    const cocok = (t) => String(t || "").toLowerCase().includes(q);

    pakai("jenis_surat", JENIS_SURAT_BAWAAN).forEach((s) => {
      if (cocok(s.nama)) out.push(["Pengajuan surat", s.nama, "Perkiraan selesai " + (s.estimasi || "-"), "/surat/" + s.id]);
    });
    (isi.pengumuman || []).forEach((k) => {
      if (cocok(k.judul) || cocok(k.ringkas) || cocok(k.isi))
        out.push([k.tipe === "agenda" ? "Agenda" : "Pengumuman", k.judul, k.ringkas || "", "/berita/" + k.id]);
    });
    (isi.usaha || []).forEach((u) => {
      if (cocok(u.nama) || cocok(u.ringkas) || cocok(u.katLabel))
        out.push(["Direktori UMKM", u.nama, u.ringkas || "", "/umkm/" + u.id]);
    });
    pakai("fasilitas", FASILITAS_BAWAAN).forEach((f) => {
      if (cocok(f.nama) || cocok(f.ket)) out.push(["Reservasi fasilitas", f.nama, f.ket || "", "/reservasi"]);
    });
    (isi.pengaduan || []).forEach((p) => {
      if (cocok(p.tiket) || cocok(p.kategori) || cocok(p.isi))
        out.push(["Pengaduan", (p.tiket || p.id) + " \u00B7 " + p.kategori, p.isi || "", "/pengaduan"]);
    });
    (isi.program || []).forEach((p) => {
      if (cocok(p.nama) || cocok(p.ket)) out.push(["Rencana dan realisasi", p.nama, p.ket || "", "/program"]);
    });
    (isi.galeri || []).forEach((g) => {
      if (cocok(g.judul) || cocok(g.fn)) out.push(["Galeri", g.judul, g.fn || "", "/galeri"]);
    });
    pakai("tautan", TAUTAN_BAWAAN).forEach((t) => {
      if (cocok(t.nama) || cocok(t.ket)) out.push(["Tautan penting", t.nama, t.ket || "", "/tautan"]);
    });
    HALAMAN.forEach((p) => {
      if (cocok(p[0]) || cocok(p[1]) || cocok(p[3])) out.push(["Halaman", p[0], p[1], p[2]]);
    });
    return out;
  });
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Hasil pencarian</span></nav>
<div class="kepala-halaman">
  <p class="alis">Pencarian</p>
  <h1>Hasil untuk &ldquo;{rute.cari}&rdquo;</h1>
</div>

{#if !rute.cari}
  <p class="kosong">Ketik kata kunci di kotak pencarian, misalnya <b>domisili</b>, <b>posyandu</b>, atau <b>kas</b>.</p>
{:else if !hasil.length}
  <p class="kosong">
    Tidak ada yang cocok dengan kata itu. Coba kata lain, atau buka
    <a href="#/surat">Pengajuan Surat</a>, <a href="#/berita">Berita</a>, atau <a href="#/kontak">Kontak</a>.
  </p>
{:else}
  <p class="alis" style="margin-bottom:8px">{hasil.length} hasil</p>
  {#each hasil as r}
    <a class="hasil-cari" href="#{r[3]}">
      <span class="dimana">{r[0]}</span>
      <h3>{r[1]}</h3>
      <p>{r[2]}</p>
    </a>
  {/each}
{/if}
