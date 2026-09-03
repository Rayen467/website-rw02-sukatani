<script>
  import { KONTEN } from "../inti/nama.js";
  import { kontenNilai } from "../keadaan/isi.svelte.js";
  import Peta from "../komponen/Peta.svelte";
  import Belum from "../komponen/Belum.svelte";

  const baris = $derived([
    ["Urusan surat dan administrasi", "Sekretaris RW", kontenNilai(KONTEN.KONTAK, "sekretaris")],
    ["Keuangan dan iuran", "Bendahara RW", kontenNilai(KONTEN.KONTAK, "bendahara")],
    ["Keamanan", "Pos keamanan", kontenNilai(KONTEN.KONTAK, "posKeamanan")],
    ["Kebersihan dan sampah", "Seksi kebersihan", kontenNilai(KONTEN.KONTAK, "kebersihan")],
    ["Keadaan darurat", "Ambulans desa", kontenNilai(KONTEN.KONTAK, "ambulans")]
  ]);
</script>

<nav class="remah"><a href="#/">Beranda</a><span>›</span><span>Kontak dan Lokasi</span></nav>

<div class="kepala-halaman">
  <p class="alis">Kontak</p>
  <h1>Kontak dan lokasi sekretariat</h1>
  <p>Alamat sekretariat, jam pelayanan, dan nomor yang bisa dihubungi warga.</p>
</div>

<section class="blok">
  <div class="petak petak-2">
    <div class="kartu">
      <h3>Sekretariat RW</h3>
      <p><Belum nilai={kontenNilai(KONTEN.KONTAK, "alamat")} panjang={true} /></p>
    </div>
    <div class="kartu">
      <h3>Jam pelayanan</h3>
      <div class="tabel-bungkus" style="border:0;background:none">
        <table class="data"><tbody>
          <tr><th>Senin sampai Jumat</th><td><Belum nilai={kontenNilai(KONTEN.KONTAK, "jamSeninJumat")} /></td></tr>
          <tr><th>Sabtu</th><td><Belum nilai={kontenNilai(KONTEN.KONTAK, "jamSabtu")} /></td></tr>
          <tr><th>Keadaan darurat</th><td>Pos keamanan <Belum nilai={kontenNilai(KONTEN.KONTAK, "posKeamanan")} /></td></tr>
        </tbody></table>
      </div>
    </div>
  </div>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Nomor yang bisa dihubungi</h2></div>
  <div class="tabel-bungkus">
    <table class="data">
      <thead><tr><th>Keperluan</th><th>Hubungi</th><th>Nomor</th></tr></thead>
      <tbody>
        {#each baris as b}
          <tr><td>{b[0]}</td><td>{b[1]}</td><td><Belum nilai={b[2]} /></td></tr>
        {/each}
      </tbody>
    </table>
  </div>
  <p class="verifikasi">Nomor hanya ditampilkan setelah pemiliknya memberi izin.</p>
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Lokasi sekretariat</h2></div>
  <Peta perbesaran={18} />
</section>
