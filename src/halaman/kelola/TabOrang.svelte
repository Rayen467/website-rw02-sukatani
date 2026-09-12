<script>
  import { KOLEKSI } from "../../inti/nama.js";
  import { KOLEKSI_LOGIN_PETUGAS, periksaUsername } from "../../inti/identitas-login.js";
  import { isi, muatKoleksi } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { sesi } from "../../keadaan/sesi.svelte.js";
  import {
    ubahStatus,
    simpanDokumen,
    hapusDokumen,
    ubahDokumen,
    ambilDokumen
  } from "../../sumber/data.js";
  import {
    daftarPetugas,
    batalkanPetugasBaru,
    selesaikanPetugasBaru,
    validasiKataSandi
  } from "../../sumber/akun.js";
  import { pesanRamah } from "../../sumber/firebase.js";
  import Lencana from "../../komponen/Lencana.svelte";

  let p = $state({
    email: "",
    username: "",
    nama: "",
    jabatan: "",
    peran: "petugas",
    sandi: "",
    ulang: "",
    akunLama: false
  });
  let sibuk = $state("");
  let lihatSandi = $state(false);
  let lihatUlang = $state(false);

  /* Baris pengurus mana yang sedang dibuka untuk diubah. Email tetap menjadi
     ID dokumen role, sedangkan username hanya alias login yang boleh diganti. */
  let ubahEmail = $state("");
  let usernameLama = $state("");
  let u = $state({ nama: "", jabatan: "", peran: "petugas", username: "" });

  function emailBersih(nilai) {
    return String(nilai || "").trim().toLowerCase();
  }

  function bukaUbah(o) {
    ubahEmail = o.id;
    usernameLama = String(o.username || "").trim().toLowerCase();
    u = {
      nama: o.nama || "",
      jabatan: o.jabatan || "",
      peran: o.peran === "petugas" ? "petugas" : "master",
      username: usernameLama
    };
  }

  async function simpanUbah(e) {
    e.preventDefault();
    const cek = u.username.trim() ? periksaUsername(u.username) : { valid: true, username: "", masalah: [] };
    if (!cek.valid) {
      beriTahu(cek.masalah[0]);
      return;
    }

    const usernameBaru = cek.username;
    sibuk = "ubah";
    let aliasBaruDibuat = false;

    try {
      if (usernameBaru && usernameBaru !== usernameLama) {
        const sudahAda = await ambilDokumen(KOLEKSI_LOGIN_PETUGAS, usernameBaru);
        if (sudahAda && emailBersih(sudahAda.email) !== emailBersih(ubahEmail)) {
          beriTahu("Username sudah dipakai petugas lain.");
          return;
        }
      }

      await ubahDokumen(KOLEKSI.PENGURUS, ubahEmail, {
        nama: u.nama,
        jabatan: u.jabatan,
        peran: u.peran,
        username: usernameBaru
      });

      if (usernameBaru && usernameBaru !== usernameLama) {
        await simpanDokumen(KOLEKSI_LOGIN_PETUGAS, usernameBaru, { email: emailBersih(ubahEmail) }, false);
        aliasBaruDibuat = true;
      }
      if (usernameLama && usernameLama !== usernameBaru) {
        await hapusDokumen(KOLEKSI_LOGIN_PETUGAS, usernameLama);
      }

      beriTahu("Keterangan " + ubahEmail + " diperbarui.");
      ubahEmail = "";
      usernameLama = "";
      muatKoleksi(KOLEKSI.PENGURUS);
    } catch (err) {
      if (aliasBaruDibuat && usernameBaru !== usernameLama) {
        try { await hapusDokumen(KOLEKSI_LOGIN_PETUGAS, usernameBaru); } catch { /* rollback best effort */ }
      }
      try {
        await ubahDokumen(KOLEKSI.PENGURUS, ubahEmail, { username: usernameLama });
      } catch { /* rollback best effort */ }
      beriTahu(pesanRamah(err));
    } finally {
      sibuk = "";
    }
  }

  const warga = $derived(isi.warga || []);
  const pengurusList = $derived(isi.pengurus || []);
  const cukupPanjang = $derived(p.sandi.length >= 15);
  const tidakTerlaluPanjang = $derived(p.sandi.length <= 128);
  const sandiSama = $derived(p.sandi.length > 0 && p.sandi === p.ulang);

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
    const email = emailBersih(p.email);
    const cekUsername = periksaUsername(p.username);

    if (!email || email.indexOf("@") < 1) {
      beriTahu("Masukkan Gmail/email aktif yang valid.");
      return;
    }
    if (!cekUsername.valid) {
      beriTahu(cekUsername.masalah[0]);
      return;
    }
    if (pengurusList.some((o) => emailBersih(o.id) === email)) {
      beriTahu("Email tersebut sudah terdaftar sebagai pengurus.");
      return;
    }

    if (!p.akunLama) {
      if (!cukupPanjang || !tidakTerlaluPanjang) {
        beriTahu("Gunakan passphrase 15 sampai 128 karakter.");
        return;
      }
      if (!sandiSama) {
        beriTahu("Konfirmasi kata sandi belum sama.");
        return;
      }
      const cekSandi = await validasiKataSandi(p.sandi);
      if (!cekSandi.valid) {
        beriTahu(cekSandi.masalah[0] || "Kata sandi belum memenuhi kebijakan keamanan.");
        return;
      }
    }

    sibuk = "tambah";
    let akunBaru = false;
    let roleBaru = false;
    let aliasBaru = false;

    try {
      const alias = await ambilDokumen(KOLEKSI_LOGIN_PETUGAS, cekUsername.username);
      if (alias) {
        beriTahu("Username sudah dipakai. Pilih username lain.");
        return;
      }

      if (!p.akunLama) {
        await daftarPetugas(email, p.sandi, p.nama);
        akunBaru = true;
      }

      await simpanDokumen(KOLEKSI.PENGURUS, email, {
        nama: p.nama,
        jabatan: p.jabatan,
        peran: p.peran,
        username: cekUsername.username
      }, false);
      roleBaru = true;

      await simpanDokumen(KOLEKSI_LOGIN_PETUGAS, cekUsername.username, { email }, false);
      aliasBaru = true;

      if (akunBaru) await selesaikanPetugasBaru();

      beriTahu(
        p.akunLama
          ? `${email} diberi akses Petugas dengan username ${cekUsername.username}.`
          : `Akun Petugas ${cekUsername.username} dibuat. Tautan verifikasi sudah dikirim ke ${email}.`
      );

      p = {
        email: "",
        username: "",
        nama: "",
        jabatan: "",
        peran: "petugas",
        sandi: "",
        ulang: "",
        akunLama: false
      };
      lihatSandi = false;
      lihatUlang = false;
      muatKoleksi(KOLEKSI.PENGURUS);
    } catch (err) {
      if (aliasBaru) {
        try { await hapusDokumen(KOLEKSI_LOGIN_PETUGAS, cekUsername.username); } catch { /* best effort */ }
      }
      if (roleBaru) {
        try { await hapusDokumen(KOLEKSI.PENGURUS, email); } catch { /* best effort */ }
      }
      if (akunBaru) {
        try { await batalkanPetugasBaru(); } catch { /* best effort */ }
      } else {
        try { await selesaikanPetugasBaru(); } catch { /* no-op */ }
      }
      beriTahu(pesanRamah(err));
    } finally {
      sibuk = "";
    }
  }

  async function cabut(o) {
    if (!confirm("Cabut hak akses " + o.id + "?\n\nOrang ini langsung tidak bisa membuka halaman pengurus.")) return;
    sibuk = o.id;
    try {
      await hapusDokumen(KOLEKSI.PENGURUS, o.id);
      if (o.username) {
        try { await hapusDokumen(KOLEKSI_LOGIN_PETUGAS, String(o.username).toLowerCase()); } catch { /* role sudah aman tercabut */ }
      }
      beriTahu("Hak akses " + o.id + " dicabut.");
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
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    <p class="verifikasi">Mengesahkan warga tidak memberi hak pengurus. Warga tetap hanya bisa melihat kirimannya sendiri.</p>
  {:else}
    <p class="kosong">Belum ada warga yang mendaftar akun.</p>
  {/if}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Pengurus dan hak akses</h2></div>
  <div class="catatan awas" style="margin-bottom:18px">
    <b>Akses Petugas adalah akses internal.</b> Username hanya alias untuk mempermudah login; identitas akun sebenarnya tetap Gmail/email Firebase dan role tetap diperiksa di server.
  </div>

  {#if pengurusList.length}
    <div class="tabel-bungkus">
      <table class="data">
        <thead><tr><th>Email</th><th>Username</th><th>Nama</th><th>Jabatan</th><th>Peran</th><th></th></tr></thead>
        <tbody>
          {#each pengurusList as o}
            <tr>
              <td><b class="mono" style="font-size:12.5px">{o.id}</b></td>
              <td><span class="mono">{o.username || "belum dibuat"}</span></td>
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
                    <button class="tombol" type="button" onclick={() => cabut(o)} disabled={sibuk === o.id}>Cabut</button>
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
      <div class="isian">
        <label for="u-username">Username login</label>
        <input id="u-username" bind:value={u.username} maxlength="32" autocapitalize="none" spellcheck="false" placeholder="mis. rayen.rt02" />
        <span class="petunjuk">4–32 karakter: huruf kecil, angka, titik, garis bawah, atau minus.</span>
      </div>
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
      <p class="catatan-borang">Email tidak diubah dari panel ini karena email tetap menjadi identitas akun Firebase dan kunci role pengurus.</p>
    </form>
  {/if}

  <div class="kepala-bagian" style="margin-top:26px">
    <div>
      <h2>Daftarkan Petugas</h2>
      <p class="petunjuk" style="margin:4px 0 0">Buat akun login + role sekaligus, atau hubungkan akun Firebase yang sudah ada.</p>
    </div>
  </div>

  <form class="isian-borang petugas-signup" onsubmit={tambahPengurus}>
    <label class="opsi-akun">
      <input type="checkbox" bind:checked={p.akunLama} />
      <span><b>Email ini sudah punya akun RW 02</b><small>Aktifkan hanya jika orang tersebut sebelumnya sudah pernah mendaftar/masuk dengan email yang sama. Password tidak perlu diminta lagi.</small></span>
    </label>

    <div class="grid-petugas">
      <div class="isian">
        <label for="p-username">Username</label>
        <input id="p-username" bind:value={p.username} required maxlength="32" autocapitalize="none" spellcheck="false" autocomplete="off" placeholder="mis. sekretaris02" />
        <span class="petunjuk">Dipakai saat login supaya tidak perlu mengetik Gmail panjang.</span>
      </div>
      <div class="isian">
        <label for="p-email">Gmail / email aktif</label>
        <input id="p-email" type="email" bind:value={p.email} required inputmode="email" autocapitalize="none" spellcheck="false" autocomplete="off" placeholder="nama@gmail.com" />
        <span class="petunjuk">Tetap dipakai untuk verifikasi dan pemulihan akun.</span>
      </div>
      <div class="isian"><label for="p-nama">Nama</label><input id="p-nama" bind:value={p.nama} required autocomplete="off" /></div>
      <div class="isian"><label for="p-jabatan">Jabatan</label><input id="p-jabatan" bind:value={p.jabatan} required autocomplete="off" placeholder="Ketua RT 03" /></div>
    </div>

    {#if !p.akunLama}
      <div class="grid-petugas">
        <div class="isian">
          <label for="p-sandi">Password akun RW 02</label>
          <div class="auth-password-wrap">
            <input id="p-sandi" type={lihatSandi ? "text" : "password"} bind:value={p.sandi} required minlength="15" maxlength="128" autocomplete="new-password" placeholder="Minimal 15 karakter" />
            <button class="tombol mini" type="button" onclick={() => (lihatSandi = !lihatSandi)}>{lihatSandi ? "Sembunyikan" : "Lihat"}</button>
          </div>
        </div>
        <div class="isian">
          <label for="p-ulang">Ulangi password</label>
          <div class="auth-password-wrap">
            <input id="p-ulang" type={lihatUlang ? "text" : "password"} bind:value={p.ulang} required minlength="15" maxlength="128" autocomplete="new-password" placeholder="Ketik ulang password" />
            <button class="tombol mini" type="button" onclick={() => (lihatUlang = !lihatUlang)}>{lihatUlang ? "Sembunyikan" : "Lihat"}</button>
          </div>
        </div>
      </div>

      <div class="kebijakan-sandi" aria-live="polite">
        <span class:lolos={cukupPanjang}>● minimal 15 karakter</span>
        <span class:lolos={tidakTerlaluPanjang}>● maksimal 128 karakter</span>
        <span class:lolos={sandiSama}>● konfirmasi sama</span>
        <small>Gunakan passphrase panjang. Tidak perlu memaksa pola simbol/angka buatan sendiri. Jangan gunakan password Gmail orang tersebut.</small>
      </div>
    {/if}

    <div class="isian">
      <label for="p-peran">Sebutan</label>
      <select id="p-peran" bind:value={p.peran}><option value="petugas">Petugas</option><option value="master">Master Admin</option></select>
    </div>

    <div class="baris-tombol">
      <button class="tombol utama" type="submit" disabled={sibuk === "tambah"}>
        {sibuk === "tambah" ? "Mendaftarkan..." : p.akunLama ? "Hubungkan akses Petugas" : "Buat akun Petugas"}
      </button>
    </div>

    <div class="catatan-borang signup-note">
      <b>Keamanan:</b> password tidak disimpan di Firestore, source code, atau localStorage. Pembuatan akun memakai Firebase Authentication pada sesi sekunder in-memory agar admin yang sedang login tidak terganti. Akun baru wajib memverifikasi email sebelum role Petugas dapat dipakai.
    </div>
  </form>
</section>

<style>
  .grid-petugas {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px 18px;
  }

  .opsi-akun {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    padding: 13px 14px;
    border: 1px solid var(--garis, #d7dfdb);
    border-radius: 12px;
    background: color-mix(in srgb, var(--hijau, #087a61) 5%, transparent);
    cursor: pointer;
  }

  .opsi-akun input { margin-top: 3px; }
  .opsi-akun span { display: grid; gap: 3px; }
  .opsi-akun small { color: var(--tinta-3, #6c7773); line-height: 1.45; }

  .auth-password-wrap {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    align-items: center;
  }

  .kebijakan-sandi {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
    padding: 12px 14px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--hijau, #087a61) 6%, transparent);
    color: var(--tinta-3, #6c7773);
    font-size: 13px;
  }

  .kebijakan-sandi span.lolos { color: var(--hijau, #087a61); font-weight: 750; }
  .kebijakan-sandi small { flex-basis: 100%; line-height: 1.45; }
  .signup-note { line-height: 1.55; }

  @media (max-width: 760px) {
    .grid-petugas { grid-template-columns: 1fr; }
    .auth-password-wrap { grid-template-columns: 1fr; }
  }
</style>
