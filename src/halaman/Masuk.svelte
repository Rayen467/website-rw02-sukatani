<script>
  import { beriTahu } from "../keadaan/pesan.svelte.js";
  import { pergi } from "../keadaan/rute.svelte.js";
  import { sesi, pengurus } from "../keadaan/sesi.svelte.js";
  import {
    masukEmail,
    masukGoogle,
    daftarAkun,
    lupaSandi,
    validasiKataSandi,
    keluar,
    siapkanAkun
  } from "../sumber/akun.js";
  import { pesanRamah } from "../sumber/firebase.js";

  siapkanAkun();

  let mode = $state("masuk");
  let sibuk = $state(false);
  let sibukGoogle = $state(false);
  let lihatSandi = $state(false);
  let lihatUlang = $state(false);
  let f = $state({ email: "", sandi: "", ulang: "", nama: "" });

  const terkunci = $derived(sibuk || sibukGoogle);
  const cukupPanjang = $derived(f.sandi.length >= 15);
  const tidakTerlaluPanjang = $derived(f.sandi.length <= 128);
  const sama = $derived(f.sandi.length > 0 && f.sandi === f.ulang);

  function emailBersih() {
    return f.email.trim().toLowerCase();
  }

  function gantiMode(nilai) {
    mode = nilai;
    f.sandi = "";
    f.ulang = "";
    lihatSandi = false;
    lihatUlang = false;
  }

  async function google() {
    if (terkunci) return;
    sibukGoogle = true;
    try {
      await masukGoogle();
      beriTahu("Berhasil masuk dengan Google.");
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      sibukGoogle = false;
    }
  }

  async function jalankan(e) {
    e.preventDefault();
    if (terkunci) return;

    const email = emailBersih();
    if (!email || !email.includes("@")) {
      beriTahu("Masukkan alamat email yang valid.");
      return;
    }

    sibuk = true;
    try {
      if (mode === "masuk") {
        await masukEmail(email, f.sandi);
        beriTahu("Berhasil masuk.");
        return;
      }

      if (mode === "daftar") {
        if (!f.nama.trim()) {
          beriTahu("Masukkan nama lengkap.");
          return;
        }
        if (!cukupPanjang || !tidakTerlaluPanjang) {
          beriTahu("Gunakan passphrase 15 sampai 128 karakter.");
          return;
        }
        if (!sama) {
          beriTahu("Konfirmasi kata sandi belum sama.");
          return;
        }

        const cek = await validasiKataSandi(f.sandi);
        if (!cek.valid) {
          beriTahu(cek.masalah[0] || "Kata sandi belum memenuhi kebijakan keamanan.");
          return;
        }

        await daftarAkun(email, f.sandi, f.nama);
        f.sandi = "";
        f.ulang = "";
        beriTahu("Akun dibuat. Buka email Anda dan klik tautan verifikasi sebelum memakai layanan akun.");
        return;
      }

      await lupaSandi(email);
      beriTahu("Jika alamat itu terdaftar, tautan reset kata sandi akan dikirim. Periksa kotak masuk dan folder spam.");
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      sibuk = false;
    }
  }
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Akun</span></nav>

{#if !sesi.siap}
  <div class="auth-status" role="status">Memeriksa sesi akun secara aman...</div>
{:else if sesi.pengguna && !sesi.terverifikasi}
  <section class="auth-card auth-verifikasi">
    <span class="auth-eyebrow">Verifikasi diperlukan</span>
    <h1>Periksa email Anda</h1>
    <p>
      Akun <strong>{sesi.pengguna.email}</strong> sudah dibuat, tetapi email belum diverifikasi.
      Verifikasi email wajib sebelum akun memperoleh akses penuh.
    </p>
    <div class="auth-actions">
      <a class="tombol utama" href="#/akun">Buka Akun Saya</a>
      <button class="tombol" type="button" onclick={() => keluar()}>Keluar</button>
    </div>
  </section>
{:else if sesi.pengguna}
  <section class="auth-card auth-sudah-masuk">
    <span class="auth-eyebrow">Sesi aktif</span>
    <h1>Anda sudah masuk</h1>
    <p>Terautentikasi sebagai <strong>{sesi.pengguna.email}</strong>.</p>
    <div class="auth-actions">
      <button class="tombol utama" type="button" onclick={() => pergi(pengurus() ? "/kelola" : "/akun")}>
        {pengurus() ? "Buka Dashboard Petugas" : "Buka Dashboard Warga"}
      </button>
      <button class="tombol" type="button" onclick={() => keluar()}>Keluar</button>
    </div>
  </section>
{:else}
  <section class="auth-intro">
    <span class="auth-eyebrow">Akun RW 02 Sukatani</span>
    <h1>Masuk dengan aman</h1>
    <p>
      Gunakan Google untuk cara tercepat, atau buat akun email/password khusus situs RW 02.
      Hak Warga dan Petugas ditentukan oleh server setelah identitas berhasil diverifikasi.
    </p>
  </section>

  <div class="auth-layout">
    <section class="auth-card auth-google" aria-labelledby="google-title">
      <div>
        <span class="auth-label">Direkomendasikan</span>
        <h2 id="google-title">Masuk dengan Google</h2>
        <p>Gunakan akun Google yang sudah Anda miliki. Website tidak menerima atau menyimpan password Google Anda.</p>
      </div>
      <button class="tombol-google" type="button" onclick={google} disabled={terkunci}>
        <svg viewBox="0 0 48 48" aria-hidden="true" width="21" height="21">
          <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h11.8c-.5 2.7-2 5-4.3 6.6v5.5h7c4.1-3.8 6.6-9.4 6.6-16.3z" />
          <path fill="#34A853" d="M24 46c5.8 0 10.7-1.9 14.3-5.2l-7-5.5c-1.9 1.3-4.4 2.1-7.3 2.1-5.6 0-10.4-3.8-12.1-8.9H4.7v5.6C8.3 41.4 15.6 46 24 46z" />
          <path fill="#FBBC05" d="M11.9 28.5c-.4-1.3-.7-2.7-.7-4.5s.3-3.2.7-4.5v-5.6H4.7C3.1 17.1 2 20.4 2 24s1.1 6.9 2.7 10.1l7.2-5.6z" />
          <path fill="#EA4335" d="M24 9.5c3.2 0 6 1.1 8.2 3.2l6.2-6.2C34.7 3 29.8 1 24 1 15.6 1 8.3 5.6 4.7 13.9l7.2 5.6C13.6 14.3 18.4 9.5 24 9.5z" />
        </svg>
        <span>{sibukGoogle ? "Menghubungkan ke Google..." : "Lanjutkan dengan Google"}</span>
      </button>
    </section>

    <div class="auth-divider" aria-hidden="true"><span>atau</span></div>

    <section class="auth-card auth-email" aria-labelledby="email-auth-title">
      <div class="auth-tabs" role="tablist" aria-label="Pilihan akun email">
        <button type="button" class:aktif={mode === "masuk"} aria-selected={mode === "masuk"} role="tab" onclick={() => gantiMode("masuk")}>Masuk</button>
        <button type="button" class:aktif={mode === "daftar"} aria-selected={mode === "daftar"} role="tab" onclick={() => gantiMode("daftar")}>Daftar</button>
        <button type="button" class:aktif={mode === "lupa"} aria-selected={mode === "lupa"} role="tab" onclick={() => gantiMode("lupa")}>Lupa sandi</button>
      </div>

      <div class="auth-copy">
        {#if mode === "masuk"}
          <span class="auth-label">Email + password situs</span>
          <h2 id="email-auth-title">Masuk ke akun RW 02</h2>
          <p>Password di sini adalah <strong>password akun situs RW 02</strong>, bukan password Gmail. Jika akun dibuat lewat Google, gunakan tombol Google di atas.</p>
        {:else if mode === "daftar"}
          <span class="auth-label">Akun baru</span>
          <h2 id="email-auth-title">Buat akun warga</h2>
          <p>Email harus bisa Anda buka karena tautan verifikasi akan dikirim sebelum akun memperoleh akses penuh.</p>
        {:else}
          <span class="auth-label">Pemulihan akun</span>
          <h2 id="email-auth-title">Reset kata sandi</h2>
          <p>Masukkan email akun situs. Untuk keamanan, jawaban yang ditampilkan tetap sama baik email terdaftar maupun tidak.</p>
        {/if}
      </div>

      <form class="auth-form" onsubmit={jalankan}>
        {#if mode === "daftar"}
          <div class="auth-field">
            <label for="auth-name">Nama lengkap</label>
            <input id="auth-name" bind:value={f.nama} required autocomplete="name" maxlength="120" placeholder="Nama sesuai identitas" />
          </div>
        {/if}

        <div class="auth-field">
          <label for="auth-email">Alamat email</label>
          <input
            id="auth-email"
            type="email"
            bind:value={f.email}
            required
            inputmode="email"
            autocapitalize="none"
            spellcheck="false"
            autocomplete={mode === "masuk" ? "username" : "email"}
            placeholder="nama@email.com"
          />
        </div>

        {#if mode !== "lupa"}
          <div class="auth-field">
            <label for="auth-password">Kata sandi</label>
            <div class="auth-password-wrap">
              <input
                id="auth-password"
                type={lihatSandi ? "text" : "password"}
                bind:value={f.sandi}
                required
                minlength={mode === "daftar" ? 15 : undefined}
                maxlength="128"
                autocomplete={mode === "daftar" ? "new-password" : "current-password"}
                placeholder={mode === "daftar" ? "Gunakan passphrase panjang" : "Masukkan password akun situs"}
              />
              <button type="button" class="auth-reveal" aria-label={lihatSandi ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} onclick={() => (lihatSandi = !lihatSandi)}>
                {lihatSandi ? "Sembunyikan" : "Lihat"}
              </button>
            </div>
          </div>
        {/if}

        {#if mode === "daftar"}
          <div class="auth-field">
            <label for="auth-password-confirm">Ulangi kata sandi</label>
            <div class="auth-password-wrap">
              <input
                id="auth-password-confirm"
                type={lihatUlang ? "text" : "password"}
                bind:value={f.ulang}
                required
                minlength="15"
                maxlength="128"
                autocomplete="new-password"
                placeholder="Ketik ulang tanpa perubahan"
              />
              <button type="button" class="auth-reveal" aria-label={lihatUlang ? "Sembunyikan konfirmasi kata sandi" : "Tampilkan konfirmasi kata sandi"} onclick={() => (lihatUlang = !lihatUlang)}>
                {lihatUlang ? "Sembunyikan" : "Lihat"}
              </button>
            </div>
          </div>

          <div class="auth-policy" aria-live="polite">
            <strong>Kebijakan kata sandi</strong>
            <span class:lolos={cukupPanjang}>● Minimal 15 karakter</span>
            <span class:lolos={tidakTerlaluPanjang}>● Maksimal 128 karakter</span>
            <span class:lolos={sama}>● Konfirmasi sama</span>
            <small>Passphrase panjang diperbolehkan; tidak wajib pola huruf besar + angka + simbol buatan sendiri.</small>
          </div>
        {/if}

        <button class="tombol utama auth-submit" type="submit" disabled={terkunci}>
          {sibuk ? "Memproses secara aman..." : mode === "masuk" ? "Masuk" : mode === "daftar" ? "Buat akun & kirim verifikasi" : "Kirim tautan reset"}
        </button>
      </form>

      <div class="auth-security-note">
        <strong>Keamanan akun</strong>
        <p>
          Password tidak disimpan di website ini. Firebase Authentication menangani autentikasi, sesi, verifikasi email,
          dan tautan reset. Pengurus/Petugas tetap memerlukan role server; mendaftar sebagai warga tidak memberikan hak Petugas.
        </p>
      </div>
    </section>
  </div>
{/if}

<style>
  .auth-intro,
  .auth-layout,
  .auth-card,
  .auth-status {
    width: min(100% - 28px, 760px);
    margin-inline: auto;
  }

  .auth-intro {
    padding: 28px 0 18px;
  }

  .auth-intro h1,
  .auth-card h1,
  .auth-card h2 {
    margin: 5px 0 8px;
    line-height: 1.08;
  }

  .auth-intro p,
  .auth-card p {
    max-width: 62ch;
    line-height: 1.6;
  }

  .auth-eyebrow,
  .auth-label {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    color: var(--hijau, #087a61);
    font-size: .8rem;
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .auth-layout {
    padding-bottom: 32px;
  }

  .auth-card {
    padding: 22px;
    border: 1px solid color-mix(in srgb, var(--garis, #d9e0dd) 82%, transparent);
    border-radius: 20px;
    background: color-mix(in srgb, var(--kartu, #fff) 96%, transparent);
    box-shadow: 0 14px 40px rgba(7, 35, 30, .08);
  }

  .auth-google {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 22px;
    align-items: center;
  }

  .tombol-google {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 48px;
    padding: 0 18px;
    border: 1px solid #d6dbe1;
    border-radius: 12px;
    background: #fff;
    color: #202124;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .tombol-google:hover { background: #f7f8f9; }
  .tombol-google:disabled { opacity: .58; cursor: wait; }

  .auth-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 18px 0;
    color: var(--teks-redup, #6b7773);
    font-size: .85rem;
  }

  .auth-divider::before,
  .auth-divider::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--garis, #d9e0dd);
  }

  .auth-tabs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    padding: 5px;
    margin-bottom: 20px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--hijau, #087a61) 7%, transparent);
  }

  .auth-tabs button {
    min-height: 40px;
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: inherit;
    font: inherit;
    font-weight: 750;
    cursor: pointer;
  }

  .auth-tabs button.aktif {
    background: var(--kartu, #fff);
    box-shadow: 0 4px 14px rgba(5, 31, 27, .08);
    color: var(--hijau, #087a61);
  }

  .auth-copy { margin-bottom: 18px; }
  .auth-copy p { margin-bottom: 0; }

  .auth-form {
    display: grid;
    gap: 16px;
  }

  .auth-field {
    display: grid;
    gap: 7px;
  }

  .auth-field label {
    font-weight: 760;
  }

  .auth-field input {
    width: 100%;
    min-height: 48px;
    padding: 0 13px;
    border: 1px solid var(--garis, #cfd8d4);
    border-radius: 10px;
    background: color-mix(in srgb, var(--kartu, #fff) 98%, transparent);
    color: inherit;
    font: inherit;
    outline: none;
  }

  .auth-field input:focus {
    border-color: var(--hijau, #087a61);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--hijau, #087a61) 18%, transparent);
  }

  .auth-password-wrap {
    position: relative;
  }

  .auth-password-wrap input {
    padding-right: 94px;
  }

  .auth-reveal {
    position: absolute;
    inset: 5px 5px 5px auto;
    min-width: 72px;
    border: 0;
    border-radius: 8px;
    background: color-mix(in srgb, var(--hijau, #087a61) 9%, transparent);
    color: var(--hijau, #087a61);
    font: inherit;
    font-size: .82rem;
    font-weight: 800;
    cursor: pointer;
  }

  .auth-policy {
    display: grid;
    gap: 6px;
    padding: 14px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--hijau, #087a61) 6%, transparent);
    color: var(--teks-redup, #64716c);
    font-size: .88rem;
  }

  .auth-policy span { transition: color .15s ease; }
  .auth-policy span.lolos { color: var(--hijau, #087a61); font-weight: 750; }
  .auth-policy small { line-height: 1.45; }

  .auth-submit {
    min-height: 48px;
    margin-top: 2px;
  }

  .auth-security-note {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--garis, #d9e0dd);
  }

  .auth-security-note p {
    margin: 5px 0 0;
    color: var(--teks-redup, #64716c);
    font-size: .9rem;
  }

  .auth-sudah-masuk,
  .auth-verifikasi,
  .auth-status {
    margin-top: 28px;
    margin-bottom: 32px;
  }

  .auth-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 18px;
  }

  .auth-status {
    padding: 18px;
    border-radius: 14px;
    background: var(--kartu, #fff);
  }

  @media (max-width: 680px) {
    .auth-intro,
    .auth-layout,
    .auth-card,
    .auth-status {
      width: min(100% - 20px, 760px);
    }

    .auth-intro { padding-top: 18px; }
    .auth-card { padding: 17px; border-radius: 16px; }

    .auth-google {
      grid-template-columns: 1fr;
      gap: 14px;
    }

    .tombol-google { width: 100%; }
    .auth-tabs button { font-size: .9rem; }
    .auth-security-note p { font-size: .88rem; }
  }
</style>
