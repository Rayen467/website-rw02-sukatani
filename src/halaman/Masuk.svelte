<script>
  /**
   * Halaman masuk.
   *
   * Dua jalur ditampilkan langsung tanpa langkah tambahan:
   * 1. akun Firebase email + kata sandi;
   * 2. Google, untuk warga yang ingin masuk cepat.
   *
   * Pendaftaran dan lupa sandi tetap ada, tetapi tidak mengganggu jalur
   * masuk utama.
   */
  import { beriTahu } from "../keadaan/pesan.svelte.js";
  import { sesi } from "../keadaan/sesi.svelte.js";
  import { masukEmail, masukGoogle, daftarAkun, lupaSandi, keluar } from "../sumber/akun.js";
  import { pesanRamah } from "../sumber/firebase.js";

  let mode = $state("masuk");
  let sibuk = $state(false);
  let sibukGoogle = $state(false);
  let f = $state({ email: "", sandi: "", ulang: "", nama: "" });

  async function google() {
    if (sibuk || sibukGoogle) return;
    sibukGoogle = true;
    try {
      await masukGoogle();
    } catch (err) {
      beriTahu(pesanRamah(err));
    }
    sibukGoogle = false;
  }

  async function jalankan(e) {
    e.preventDefault();
    sibuk = true;
    try {
      if (mode === "masuk") {
        const identitas = f.email.trim();
        if (!identitas.includes("@")) {
          beriTahu("Untuk sementara masukkan Gmail/email akun Firebase. Nama akun bisa dipakai setelah alias login didaftarkan.");
          sibuk = false;
          return;
        }
        await masukEmail(identitas, f.sandi);
        beriTahu("Berhasil masuk.");
      } else if (mode === "daftar") {
        if (f.sandi.length < 8) {
          beriTahu("Kata sandi minimal 8 huruf atau angka.");
          sibuk = false;
          return;
        }
        if (f.sandi !== f.ulang) {
          beriTahu("Kedua kata sandi belum sama.");
          sibuk = false;
          return;
        }
        await daftarAkun(f.email, f.sandi, f.nama);
        beriTahu("Akun dibuat. Tautan pemastian sudah dikirim ke " + f.email + ".");
      } else {
        await lupaSandi(f.email);
        beriTahu("Kalau alamat itu terdaftar, tautan penggantian sudah dikirim. Periksa juga folder spam.");
      }
    } catch (err) {
      beriTahu(pesanRamah(err));
    }
    sibuk = false;
  }
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Masuk</span></nav>

{#if sesi.pengguna}
  <div class="kepala-halaman">
    <p class="alis">Akun</p>
    <h1>Anda sudah masuk</h1>
    <p>Masuk sebagai {sesi.pengguna.email}.</p>
  </div>
  <div class="baris-tombol">
    <a class="tombol utama" href="#/akun">Buka Akun Saya</a>
    <button class="tombol" type="button" onclick={() => keluar()}>Keluar</button>
  </div>
{:else}
  <div class="kepala-halaman">
    <p class="alis">Akun warga</p>
    <h1>Masuk ke situs warga</h1>
    <p>Gunakan akun yang sudah terdaftar, atau masuk cepat dengan Google.</p>
  </div>

  <div class="pilihan-baris">
    {#each [["masuk", "Masuk"], ["daftar", "Daftar"], ["lupa", "Lupa sandi"]] as t}
      <button
        class="pilihan"
        type="button"
        aria-pressed={mode === t[0]}
        onclick={() => (mode = t[0])}
      >{t[1]}</button>
    {/each}
  </div>

  <form class="isian-borang" onsubmit={jalankan}>
    {#if mode === "daftar"}
      <div class="isian">
        <label for="m-nama">Nama lengkap</label>
        <input id="m-nama" bind:value={f.nama} required autocomplete="name" />
      </div>
    {/if}

    <div class="isian">
      <label for="m-email">{mode === "masuk" ? "Nama akun / Gmail" : "Alamat email"}</label>
      <input
        id="m-email"
        type={mode === "masuk" ? "text" : "email"}
        bind:value={f.email}
        required
        autocomplete={mode === "masuk" ? "username" : "email"}
        placeholder={mode === "masuk" ? "Masukkan Gmail akun" : "nama@gmail.com"}
      />
      {#if mode === "masuk"}
        <span class="petunjuk">Akun Firebase saat ini masuk memakai Gmail/email. Tampilan nama akun disiapkan untuk alias login berikutnya.</span>
      {:else if mode === "daftar"}
        <span class="petunjuk">Pakai email yang benar-benar bisa dibuka. Tautan pemastian dikirim ke sana.</span>
      {/if}
    </div>

    {#if mode !== "lupa"}
      <div class="isian">
        <label for="m-sandi">Password</label>
        <input
          id="m-sandi"
          type="password"
          bind:value={f.sandi}
          required
          autocomplete={mode === "daftar" ? "new-password" : "current-password"}
        />
        {#if mode === "daftar"}
          <span class="petunjuk">Minimal 8 karakter.</span>
        {/if}
      </div>
    {/if}

    {#if mode === "daftar"}
      <div class="isian">
        <label for="m-ulang">Ulangi password</label>
        <input id="m-ulang" type="password" bind:value={f.ulang} required autocomplete="new-password" />
      </div>
    {/if}

    <div class="baris-tombol">
      <button class="tombol utama" type="submit" disabled={sibuk || sibukGoogle}>
        {sibuk ? "Memproses..." : mode === "masuk" ? "Masuk" : mode === "daftar" ? "Daftar" : "Kirim tautan penggantian"}
      </button>
    </div>
  </form>

  {#if mode === "masuk"}
    <div class="pemisah-atau"><span>atau</span></div>

    <div class="kartu masuk-utama">
      <button class="tombol-google" type="button" onclick={google} disabled={sibuk || sibukGoogle}>
        <svg viewBox="0 0 48 48" aria-hidden="true" width="20" height="20">
          <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h11.8c-.5 2.7-2 5-4.3 6.6v5.5h7c4.1-3.8 6.6-9.4 6.6-16.3z" />
          <path fill="#34A853" d="M24 46c5.8 0 10.7-1.9 14.3-5.2l-7-5.5c-1.9 1.3-4.4 2.1-7.3 2.1-5.6 0-10.4-3.8-12.1-8.9H4.7v5.6C8.3 41.4 15.6 46 24 46z" />
          <path fill="#FBBC05" d="M11.9 28.5c-.4-1.3-.7-2.7-.7-4.5s.3-3.2.7-4.5v-5.6H4.7C3.1 17.1 2 20.4 2 24s1.1 6.9 2.7 10.1l7.2-5.6z" />
          <path fill="#EA4335" d="M24 9.5c3.2 0 6 1.1 8.2 3.2l6.2-6.2C34.7 3 29.8 1 24 1 15.6 1 8.3 5.6 4.7 13.9l7.2 5.6C13.6 14.3 18.4 9.5 24 9.5z" />
        </svg>
        <span>{sibukGoogle ? "Membuka Google..." : "Lanjutkan dengan Google"}</span>
      </button>
      <p class="masuk-alasan">Tidak perlu mengetik password situs. Pilih akun Google dan lanjutkan.</p>
    </div>
  {/if}

  {#if mode === "daftar"}
    <p class="catatan-borang" style="margin-top:18px">
      <b>Pendaftaran ini hanya untuk warga.</b> Hak petugas/admin diberikan oleh pengurus melalui sistem pengelolaan.
    </p>
  {:else if mode === "lupa"}
    <p class="catatan-borang" style="margin-top:18px">
      Kalau email tidak masuk dalam beberapa menit, periksa folder spam.
    </p>
  {/if}
{/if}
