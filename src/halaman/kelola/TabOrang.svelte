<script>
  import { KOLEKSI } from "../../inti/nama.js";
  import { isi, muatKoleksi } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { sesi } from "../../keadaan/sesi.svelte.js";
  import { ubahStatus, simpanDokumen, hapusDokumen, ubahDokumen } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";
  import Lencana from "../../komponen/Lencana.svelte";

  let p = $state({ email: "", nama: "", jabatan: "", peran: "petugas" });
  let sibuk = $state("");

  /* Baris pengurus mana yang sedang dibuka untuk diubah, dan isian sementaranya.
     Email tidak ikut bisa diubah: email adalah ID dokumennya, jadi menggantinya
     berarti membuat pengurus baru sekaligus meninggalkan yang lama. Kalau
     alamatnya memang salah, cabut lalu tambahkan yang benar. */
  let ubahEmail = $state("");
  let u = $state({ nama: "", jabatan: "", peran: "petugas" });

  function bukaUbah(o) {
    ubahEmail = o.id;
    u = { nama: o.nama || "", jabatan: o.jabatan || "", peran: o.peran === "master" ? "master" : "petugas" };
  }

  async function simpanUbah(e) {
    e.preventDefault();
    sibuk = "ubah";
    try {
      await ubahDokumen(KOLEKSI.PENGURUS, ubahEmail, { nama: u.nama, jabatan: u.jabatan, peran: u.peran });
      beriTahu("Keterangan " + ubahEmail + " diperbarui.");
      ubahEmail = "";
      muatKoleksi(KOLEKSI.PENGURUS);
    } catch (err) { beriTahu(pesanRamah(err)); }
    sibuk = "";
  }

  /* Warga yang sudah ditolak menumpuk di daftar dan tidak pernah bisa hilang.
     Menghapus catatannya TIDAK menghapus akunnya -- orangnya masih bisa
     masuk dan mendaftar ulang kalau memang salah tolak. */
  async function hapusWarga(o) {
    const tanya =
      "Hapus catatan warga " + (o.nama || o.email) + "?\n\n" +
      "Akunnya tidak ikut terhapus; dia masih bisa mendaftar ulang.";
    if (!confirm(tanya)) return;
    sibuk = o.id;
    try {
      await hapusDokumen(KOLEKSI.WARGA, o.id);
      beriTahu("Catatan warga dihapus.");
      muatKoleksi(KOLEKSI.WARGA);
    } catch (err) { beriTahu(pesanRamah(err)); }
    sibuk = "";
  }

  const warga = $derived(isi.warga || []);
  const pengurusList = $derived(isi.pengurus || []);

  async function setStatusWarga(uid, status) {
    sibuk = uid;
    try {
      await ubahStatus(KOLEKSI.WARGA, uid, status);
      beriTahu(status === "aktif" ? "Warga disahkan." : "Warga ditolak.");
      muatKoleksi(KOLEKSI.WARGA);
    } catch (err) { beriTahu(pesanRamah(err)); }
    sibuk = "";
  }

  async function tambahPengurus(e) {
    e.preventDefault();
    const email = p.email.trim().toLowerCase();
    if (email.indexOf("@") < 1) { beriTahu("Alamat Gmail tidak sah."); return; }
    sibuk = "tambah";
    try {
      await simpanDokumen(KOLEKSI.PENGURUS, email, { nama: p.nama, jabatan: p.jabatan, peran: p.peran }, false);
      beriTahu(email + " ditambahkan sebagai " + (p.peran === "master" ? "master admin" : "petugas") + ".");
      p = { email: "", nama: "", jabatan: "", peran: "petugas" };
      muatKoleksi(KOLEKSI.PENGURUS);
    } catch (err) { beriTahu(pesanRamah(err)); }
    sibuk = "";
  }

  async function cabut(email) {
    if (!confirm("Cabut hak akses " + email + "?\n\nOrang ini langsung tidak bisa membuka halaman pengurus.")) return;
    sibuk = email;
    try {
      await hapusDokumen(KOLEKSI.PENGURUS, email);
      beriTahu("Hak akses " + email + " dicabut.");
      muatKoleksi(KOLEKSI.PENGURUS);
    } catch (err) { beriTahu(pesanRamah(err)); }
    sibuk = "";
  }
</script>

<section class="blok">
  <div class="kepala-bagian">
    <h2>Warga terdaftar</h2>
    <span class="jumlah-kecil">{warga.filter((x) => x.status === "baru").length} menunggu verifikasi</span>
  </div>
  {#if warga.length}
    <div class="tabel-bungkus">
      <table class="data">
        <thead><tr><th>Nama</th><th>Blok</th><th>RT</th><th>Kontak</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {#each warga as o}
            <tr>
              <td><b>{o.nama || "-"}</b><br /><span class="mono" style="font-size:11px;color:var(--tinta-3)">{o.email || ""}</span></td>
              <td>{o.blok || "-"}</td>
              <td>{o.rt || "-"}</td>
              <td>{o.wa || "-"}</td>
              <td><Lencana status={o.status} /></td>
              <td>
                <div class="baris-tombol">
                  {#if o.status !== "aktif"}
                    <button class="tombol" type="button" onclick={() => setStatusWarga(o.id, "aktif")} disabled={sibuk === o.id}>Sahkan</button>
                  {/if}
                  {#if o.status !== "ditolak"}
                    <button class="tombol" type="button" onclick={() => setStatusWarga(o.id, "ditolak")} disabled={sibuk === o.id}>Tolak</button>
                  {/if}
                  <button class="tombol" type="button" onclick={() => hapusWarga(o)} disabled={sibuk === o.id}>Hapus</button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <p class="verifikasi">Menyahkan warga tidak memberi hak pengurus. Warga tetap hanya bisa melihat kirimannya sendiri.</p>
  {:else}
    <p class="kosong">Belum ada warga yang mendaftar akun.</p>
  {/if}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Pengurus dan hak akses</h2></div>
  <div class="catatan awas" style="margin-bottom:18px">
    <b>Menambah orang di sini langsung memberi akses penuh.</b> Master Admin dan Petugas berkewenangan sama persis
    &mdash; keduanya dapat melihat seluruh data warga dan mengubah daftar ini. Perbedaannya hanya sebutan jabatan
    yang tampil di layar. Satu-satunya pengaman: Anda tidak bisa mencabut hak diri sendiri.
  </div>

  {#if pengurusList.length}
    <div class="tabel-bungkus">
      <table class="data">
        <thead><tr><th>Email</th><th>Nama</th><th>Jabatan</th><th>Peran</th><th></th></tr></thead>
        <tbody>
          {#each pengurusList as o}
            <tr>
              <td><b class="mono" style="font-size:12.5px">{o.id}</b></td>
              <td>{o.nama || "-"}</td>
              <td>{o.jabatan || "-"}</td>
              <td>
                {#if o.peran === "petugas"}
                  <span class="status proses">Petugas</span>
                {:else}
                  <span class="status selesai">Master Admin</span>
                {/if}
              </td>
              <td>
                <div class="baris-tombol">
                  <button class="tombol" type="button" onclick={() => (ubahEmail === o.id ? (ubahEmail = "") : bukaUbah(o))}>
                    {ubahEmail === o.id ? "Batal" : "Ubah"}
                  </button>
                  {#if sesi.pengguna && o.id === sesi.pengguna.email}
                    <span class="mono" style="font-size:11px;color:var(--tinta-3)">diri sendiri</span>
                  {:else}
                    <button class="tombol" type="button" onclick={() => cabut(o.id)} disabled={sibuk === o.id}>Cabut</button>
                  {/if}
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <p class="kosong">Daftar pengurus belum termuat.</p>
  {/if}

  {#if ubahEmail}
    <form class="ubah-panel" style="margin-top:14px" onsubmit={simpanUbah}>
      <p class="alis">Mengubah keterangan {ubahEmail}</p>
      <div class="isian"><label for="u-nama">Nama</label><input id="u-nama" bind:value={u.nama} required /></div>
      <div class="isian"><label for="u-jabatan">Jabatan</label><input id="u-jabatan" bind:value={u.jabatan} required /></div>
      <div class="isian">
        <label for="u-peran">Sebutan</label>
        <select id="u-peran" bind:value={u.peran}><option value="petugas">Petugas</option><option value="master">Master Admin</option></select>
      </div>
      <div class="baris-tombol">
        <button class="tombol utama" type="submit" disabled={sibuk === "ubah"}>{sibuk === "ubah" ? "Menyimpan..." : "Simpan perubahan"}</button>
        <button class="tombol" type="button" onclick={() => (ubahEmail = "")}>Batal</button>
      </div>
      <p class="catatan-borang">
        Alamat email tidak bisa diubah karena alamat itulah yang menjadi kunci hak aksesnya.
        Kalau alamatnya memang keliru, cabut dulu lalu tambahkan yang benar.
      </p>
    </form>
  {/if}

  <div class="kepala-bagian" style="margin-top:26px"><h2>Tambah pengurus</h2></div>
  <form class="isian-borang" onsubmit={tambahPengurus}>
    <div class="isian">
      <label for="p-email">Alamat Gmail</label>
      <input id="p-email" type="email" bind:value={p.email} required placeholder="nama@gmail.com" />
      <span class="petunjuk">Harus alamat yang dipakai orangnya untuk masuk. Huruf besar otomatis dikecilkan.</span>
    </div>
    <div class="isian"><label for="p-nama">Nama</label><input id="p-nama" bind:value={p.nama} required /></div>
    <div class="isian"><label for="p-jabatan">Jabatan</label><input id="p-jabatan" bind:value={p.jabatan} required placeholder="Ketua RT 03" /></div>
    <div class="isian">
      <label for="p-peran">Sebutan</label>
      <select id="p-peran" bind:value={p.peran}><option value="petugas">Petugas</option><option value="master">Master Admin</option></select>
    </div>
    <div><button class="tombol utama" type="submit" disabled={sibuk === "tambah"}>{sibuk === "tambah" ? "Menyimpan..." : "Tambah"}</button></div>
    <p class="catatan-borang">
      Kedua peran berkewenangan <b>sama persis</b>. Pilihan ini hanya menentukan sebutan yang tampil di layar
      &mdash; dipakai membedakan Ketua RW dan Sekretaris dari Ketua RT dan kader.
      Karena kewenangannya sama, pertimbangkan baik-baik sebelum menambah orang.
    </p>
  </form>
</section>
