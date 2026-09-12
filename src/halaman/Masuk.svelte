<script>
  import { beriTahu } from "../keadaan/pesan.svelte.js";
  import { pergi } from "../keadaan/rute.svelte.js";
  import { sesi, pengurus } from "../keadaan/sesi.svelte.js";
  import { waktu, FASE_WAKTU, pilihWaktu, kembaliOtomatis } from "../keadaan/waktu.svelte.js";
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

  const FOOTER_4K = Object.freeze({
    pagi: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/ac5972ef-a71b-4fdc-bf3a-f7b9c364f121.webp",
    siang: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/fd7cc752-5163-46de-89e3-9da5237b5063.webp",
    sore: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/5b8146fc-c187-43ac-85c0-11bf4a6eb9cd.webp",
    malam: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/bd68ce05-84b7-4d7e-a430-e1b4364d2984.webp"
  });

  const IKON_WAKTU = Object.freeze({ pagi: "☼", siang: "☀", sore: "◒", malam: "☾" });

  let mode = $state("masuk");
  let sibuk = $state(false);
  let sibukGoogle = $state(false);
  let lihatSandi = $state(false);
  let lihatUlang = $state(false);
  let f = $state({ identitas: "", sandi: "", ulang: "", nama: "" });

  const terkunci = $derived(sibuk || sibukGoogle);
  const cukupPanjang = $derived(f.sandi.length >= 15);
  const tidakTerlaluPanjang = $derived(f.sandi.length <= 128);
  const sama = $derived(f.sandi.length > 0 && f.sandi === f.ulang);
  const gambarLatar = $derived(FOOTER_4K[waktu.fase] || FOOTER_4K.malam);

  function identitasBersih() {
    return f.identitas.trim().toLowerCase();
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

    const identitas = identitasBersih();
    if (!identitas) {
      beriTahu(mode === "daftar" ? "Masukkan alamat email yang valid." : "Masukkan username atau Gmail/email.");
      return;
    }

    if (mode === "daftar" && !identitas.includes("@")) {
      beriTahu("Pendaftaran warga tetap memerlukan alamat email yang valid.");
      return;
    }

    sibuk = true;
    try {
      if (mode === "masuk") {
        await masukEmail(identitas, f.sandi);
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

        await daftarAkun(identitas, f.sandi, f.nama);
        f.sandi = "";
        f.ulang = "";
        beriTahu("Akun dibuat. Buka email Anda dan klik tautan verifikasi sebelum memakai layanan akun.");
        return;
      }

      await lupaSandi(identitas);
      beriTahu("Jika akun tersebut terdaftar, tautan reset kata sandi akan dikirim ke email pemilik akun. Periksa kotak masuk dan spam.");
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      sibuk = false;
    }
  }
</script>

{#if !sesi.siap}
  <section class="login-stage login-stage-state" style={"--login-bg:url('" + gambarLatar + "')"} data-fase={waktu.fase}>
    <div class="login-state-card" role="status">
      <img src="/website-rw02-sukatani/visual/brand/logo-icon.webp" alt="" aria-hidden="true" />
      <span>Portal RW 02 Sukatani</span>
      <strong>Memeriksa sesi akun secara aman...</strong>
    </div>
  </section>
{:else if sesi.pengguna && !sesi.terverifikasi}
  <section class="login-stage login-stage-state" style={"--login-bg:url('" + gambarLatar + "')"} data-fase={waktu.fase}>
    <div class="login-state-card">
      <img src="/website-rw02-sukatani/visual/brand/logo-icon.webp" alt="Logo RW 02 Sukatani" />
      <span>Verifikasi diperlukan</span>
      <h1>Periksa email Anda</h1>
      <p>
        Akun <strong>{sesi.pengguna.email}</strong> sudah dibuat, tetapi email belum diverifikasi.
        Verifikasi email wajib sebelum akun memperoleh akses penuh, termasuk akses Petugas.
      </p>
      <div class="login-state-actions">
        <a class="login-primary" href="#/akun">Buka Akun Saya</a>
        <button class="login-secondary" type="button" onclick={() => keluar()}>Keluar</button>
      </div>
    </div>
  </section>
{:else if sesi.pengguna}
  <section class="login-stage login-stage-state" style={"--login-bg:url('" + gambarLatar + "')"} data-fase={waktu.fase}>
    <div class="login-state-card">
      <img src="/website-rw02-sukatani/visual/brand/logo-icon.webp" alt="Logo RW 02 Sukatani" />
      <span>Sesi aktif</span>
      <h1>Anda sudah masuk</h1>
      <p>Terautentikasi sebagai <strong>{sesi.pengguna.email}</strong>.</p>
      <div class="login-state-actions">
        <button class="login-primary" type="button" onclick={() => pergi(pengurus() ? "/kelola" : "/akun")}>
          {pengurus() ? "Buka Dashboard Petugas" : "Buka Dashboard Warga"}
        </button>
        <button class="login-secondary" type="button" onclick={() => keluar()}>Keluar</button>
      </div>
    </div>
  </section>
{:else}
  <section class="login-stage" style={"--login-bg:url('" + gambarLatar + "')"} data-fase={waktu.fase}>
    <div class="login-stage-bg" aria-hidden="true"></div>

    <div class="login-shell">
      <aside class="login-showcase" aria-label="RW 02 Sukatani">
        <div class="login-brand">
          <img src="/website-rw02-sukatani/visual/brand/logo-icon.webp" alt="Logo RW 02 Sukatani" />
          <div>
            <span>Portal Warga &amp; Petugas</span>
            <strong>RW 02 Sukatani</strong>
            <small>Guyub · Maju · Sejahtera</small>
          </div>
        </div>

        <div class="login-landscape" aria-hidden="true"></div>
        <div class="login-landscape-shade" aria-hidden="true"></div>

        <div class="login-story">
          <span class="login-story-kicker">Permai Sukatani · Rajeg</span>
          <h2>Sukatani<br />Lebih Maju Bersama</h2>
          <i aria-hidden="true"></i>
          <p>Pelayanan warga, administrasi lingkungan, dan kegiatan RW dalam satu platform.</p>
          <div class="login-benefit">
            <span><b>●</b> Pelayanan<br />lebih cepat</span>
            <span><b>●</b> Data<br />lebih tertata</span>
            <span><b>●</b> Lingkungan<br />lebih harmonis</span>
          </div>
        </div>

        <div class="login-showcase-meta">
          <span>© 2026 Portal RW 02 Sukatani</span>
          <span>{waktu.label} · {waktu.jam} WIB</span>
        </div>
      </aside>

      <section class="login-panel" aria-labelledby="login-title">
        <div class="login-panel-top">
          <a class="login-home" href="#/" aria-label="Kembali ke beranda">← Beranda</a>
          <div>
            <strong>Back-office &amp; layanan warga</strong>
            <span>RW 02 Sukatani</span>
          </div>
        </div>

        <div class="login-form-area">
          {#if mode === "masuk"}
            <div class="login-heading">
              <span>Akses akun</span>
              <h1 id="login-title">Login</h1>
              <p>Masuk menggunakan username Petugas atau alamat Gmail/email akun RW 02.</p>
            </div>
          {:else if mode === "daftar"}
            <div class="login-heading">
              <span>Akun warga baru</span>
              <h1 id="login-title">Daftar</h1>
              <p>Buat akun warga untuk mengakses layanan dan memantau status pengajuan.</p>
            </div>
          {:else}
            <div class="login-heading">
              <span>Pemulihan akun</span>
              <h1 id="login-title">Lupa sandi?</h1>
              <p>Masukkan username Petugas atau email. Tautan reset dikirim ke email pemilik akun.</p>
            </div>
          {/if}

          <form class="login-form" onsubmit={jalankan}>
            {#if mode === "daftar"}
              <label class="login-field" for="login-name">
                <span>Nama lengkap</span>
                <div class="login-input-wrap">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" /></svg>
                  <input id="login-name" bind:value={f.nama} required autocomplete="name" maxlength="120" placeholder="Nama sesuai identitas" />
                </div>
              </label>
            {/if}

            <label class="login-field" for="login-identity">
              <span>{mode === "daftar" ? "Alamat email" : "Username / Email"}</span>
              <div class="login-input-wrap">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20a8 8 0 0 1 16 0M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /></svg>
                <input
                  id="login-identity"
                  type={mode === "daftar" ? "email" : "text"}
                  bind:value={f.identitas}
                  required
                  inputmode={mode === "daftar" ? "email" : "text"}
                  autocapitalize="none"
                  spellcheck="false"
                  autocomplete={mode === "masuk" ? "username" : "email"}
                  placeholder={mode === "daftar" ? "nama@email.com" : "username atau nama@gmail.com"}
                />
              </div>
            </label>

            {#if mode !== "lupa"}
              <label class="login-field" for="login-password">
                <span>Password</span>
                <div class="login-input-wrap login-password-wrap">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V8a5 5 0 0 1 10 0v2M6 10h12v10H6z" /></svg>
                  <input
                    id="login-password"
                    type={lihatSandi ? "text" : "password"}
                    bind:value={f.sandi}
                    required
                    minlength={mode === "daftar" ? 15 : undefined}
                    maxlength="128"
                    autocomplete={mode === "daftar" ? "new-password" : "current-password"}
                    placeholder={mode === "daftar" ? "Gunakan passphrase panjang" : "Masukkan password akun situs"}
                  />
                  <button class="login-reveal" type="button" aria-label={lihatSandi ? "Sembunyikan password" : "Tampilkan password"} onclick={() => (lihatSandi = !lihatSandi)}>
                    {lihatSandi ? "Tutup" : "Lihat"}
                  </button>
                </div>
              </label>
            {/if}

            {#if mode === "daftar"}
              <label class="login-field" for="login-password-confirm">
                <span>Ulangi password</span>
                <div class="login-input-wrap login-password-wrap">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V8a5 5 0 0 1 10 0v2M6 10h12v10H6z" /></svg>
                  <input id="login-password-confirm" type={lihatUlang ? "text" : "password"} bind:value={f.ulang} required minlength="15" maxlength="128" autocomplete="new-password" placeholder="Ketik ulang password" />
                  <button class="login-reveal" type="button" onclick={() => (lihatUlang = !lihatUlang)}>{lihatUlang ? "Tutup" : "Lihat"}</button>
                </div>
              </label>

              <div class="login-policy" aria-live="polite">
                <span class:lolos={cukupPanjang}>Minimal 15 karakter</span>
                <span class:lolos={tidakTerlaluPanjang}>Maksimal 128 karakter</span>
                <span class:lolos={sama}>Konfirmasi sama</span>
              </div>
            {/if}

            {#if mode === "masuk"}
              <button class="login-forgot" type="button" onclick={() => gantiMode("lupa")}>Lupa password?</button>
            {/if}

            <button class="login-primary login-submit" type="submit" disabled={terkunci}>
              <span>{sibuk ? "Memproses..." : mode === "masuk" ? "Masuk" : mode === "daftar" ? "Buat akun" : "Kirim tautan reset"}</span>
              <b aria-hidden="true">→</b>
            </button>
          </form>

          {#if mode === "masuk"}
            <p class="login-switch">Belum punya akun? <button type="button" onclick={() => gantiMode("daftar")}>Daftar warga</button></p>

            <div class="login-or"><span>atau masuk dengan</span></div>
            <button class="login-google" type="button" onclick={google} disabled={terkunci}>
              <svg viewBox="0 0 48 48" aria-hidden="true" width="19" height="19">
                <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h11.8c-.5 2.7-2 5-4.3 6.6v5.5h7c4.1-3.8 6.6-9.4 6.6-16.3z" />
                <path fill="#34A853" d="M24 46c5.8 0 10.7-1.9 14.3-5.2l-7-5.5c-1.9 1.3-4.4 2.1-7.3 2.1-5.6 0-10.4-3.8-12.1-8.9H4.7v5.6C8.3 41.4 15.6 46 24 46z" />
                <path fill="#FBBC05" d="M11.9 28.5c-.4-1.3-.7-2.7-.7-4.5s.3-3.2.7-4.5v-5.6H4.7C3.1 17.1 2 20.4 2 24s1.1 6.9 2.7 10.1l7.2-5.6z" />
                <path fill="#EA4335" d="M24 9.5c3.2 0 6 1.1 8.2 3.2l6.2-6.2C34.7 3 29.8 1 24 1 15.6 1 8.3 5.6 4.7 13.9l7.2 5.6C13.6 14.3 18.4 9.5 24 9.5z" />
              </svg>
              <span>{sibukGoogle ? "Menghubungkan..." : "Lanjutkan dengan Google"}</span>
            </button>
          {:else}
            <p class="login-switch">Sudah punya akun? <button type="button" onclick={() => gantiMode("masuk")}>Kembali ke login</button></p>
          {/if}
        </div>

        <div class="login-time-block">
          <div class="login-time-head">
            <span>Tampilan latar sesuai waktu</span>
            <button type="button" class:aktif={waktu.otomatis} onclick={kembaliOtomatis}>Otomatis · {waktu.jam} WIB</button>
          </div>
          <div class="login-time-tabs" role="group" aria-label="Pratinjau waktu">
            {#each FASE_WAKTU as fase}
              <button
                type="button"
                class:aktif={!waktu.otomatis && waktu.fase === fase.id}
                class:sekarang={waktu.otomatis && waktu.fase === fase.id}
                aria-pressed={!waktu.otomatis && waktu.fase === fase.id}
                onclick={() => pilihWaktu(fase.id)}
              >
                <b aria-hidden="true">{IKON_WAKTU[fase.id]}</b>
                <span>{fase.label}</span>
              </button>
            {/each}
          </div>
        </div>

        <div class="login-panel-foot">
          <span>RW 02 Sukatani · Permai Sukatani, Rajeg</span>
          <a href="#/kontak">Bantuan / Hubungi pengurus</a>
        </div>
      </section>
    </div>
  </section>
{/if}

<style>
  :global(.auth-app-root) {
    min-height: 100dvh;
    padding: 0 !important;
    margin: 0 !important;
    max-width: none !important;
    background: #0c4a3d;
  }

  .login-stage {
    --login-green: #0b503f;
    --login-green-deep: #063a30;
    --login-mint: #75d4b7;
    --login-paper: #f8fbfa;
    position: relative;
    min-height: 100dvh;
    display: grid;
    place-items: center;
    overflow: hidden;
    padding: clamp(18px, 3.2vw, 52px);
    isolation: isolate;
    background: #0c4a3d;
  }

  .login-stage-bg {
    position: absolute;
    inset: 0;
    z-index: -3;
    background-image:
      linear-gradient(110deg, rgba(4, 47, 39, .48), rgba(4, 47, 39, .2)),
      var(--login-bg);
    background-size: cover;
    background-position: center;
    transform: scale(1.025);
    filter: saturate(.96) contrast(1.02);
    transition: background-image .55s ease, filter .55s ease;
  }

  .login-stage::before,
  .login-stage::after {
    content: "";
    position: absolute;
    z-index: -2;
    border-radius: 999px;
    pointer-events: none;
  }

  .login-stage::before {
    width: 46vw;
    height: 46vw;
    min-width: 420px;
    min-height: 420px;
    top: -24vw;
    right: -12vw;
    background: rgba(255, 255, 255, .08);
  }

  .login-stage::after {
    width: 34vw;
    height: 34vw;
    min-width: 320px;
    min-height: 320px;
    bottom: -22vw;
    left: -10vw;
    background: rgba(219, 255, 240, .09);
  }

  .login-shell {
    width: min(1260px, 100%);
    min-height: min(770px, calc(100dvh - 56px));
    display: grid;
    grid-template-columns: minmax(0, 1.28fr) minmax(390px, .72fr);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, .38);
    border-radius: 34px;
    box-shadow: 0 38px 90px rgba(2, 34, 28, .28);
    animation: loginMasuk .65s cubic-bezier(.2, .78, .2, 1) both;
  }

  .login-showcase {
    position: relative;
    min-width: 0;
    overflow: hidden;
    background: #f8fbfa;
  }

  .login-showcase::before {
    content: "";
    position: absolute;
    z-index: 4;
    width: 58%;
    height: 38%;
    top: -11%;
    right: -19%;
    border-radius: 0 0 0 100%;
    background: var(--login-green);
  }

  .login-brand {
    position: absolute;
    z-index: 8;
    top: clamp(25px, 4vw, 48px);
    left: clamp(25px, 4vw, 48px);
    display: flex;
    align-items: center;
    gap: 13px;
    color: #164e40;
  }

  .login-brand img {
    width: 66px;
    height: 66px;
    object-fit: contain;
    filter: drop-shadow(0 8px 14px rgba(8, 63, 51, .12));
  }

  .login-brand div { display: grid; line-height: 1.08; }
  .login-brand span { font-size: 13px; font-weight: 720; color: #3d7164; }
  .login-brand strong { margin-top: 3px; font-size: clamp(23px, 2.4vw, 32px); letter-spacing: -.035em; }
  .login-brand small { margin-top: 6px; font-size: 11px; font-weight: 800; letter-spacing: .09em; color: #70988e; text-transform: uppercase; }

  .login-landscape {
    position: absolute;
    z-index: 1;
    left: 0;
    right: -1px;
    top: 21%;
    height: 55%;
    background-image: var(--login-bg);
    background-size: cover;
    background-position: center;
    transition: background-image .55s ease;
  }

  .login-landscape::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(255,255,255,.02), rgba(5,45,37,.08));
  }

  .login-landscape-shade {
    position: absolute;
    z-index: 2;
    left: -8%;
    right: -10%;
    top: 13%;
    height: 22%;
    border-radius: 0 0 56% 48% / 0 0 78% 68%;
    background: #f8fbfa;
    transform: rotate(-1.6deg);
  }

  .login-story {
    position: absolute;
    z-index: 6;
    left: 0;
    right: -7%;
    bottom: -2%;
    min-height: 38%;
    padding: clamp(42px, 6vw, 78px) clamp(26px, 5vw, 58px) 36px;
    border-radius: 0 58% 0 0 / 0 54% 0 0;
    background: #f8fbfa;
    color: #143f35;
  }

  .login-story-kicker {
    display: block;
    margin-bottom: 6px;
    color: #4e786d;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .login-story h2 {
    margin: 0;
    max-width: 510px;
    font-size: clamp(30px, 4.1vw, 49px);
    line-height: .98;
    letter-spacing: -.045em;
    color: #0d4739;
  }

  .login-story i {
    display: block;
    width: 64px;
    height: 5px;
    margin: 17px 0;
    border-radius: 99px;
    background: #22a879;
  }

  .login-story > p {
    max-width: 540px;
    margin: 0;
    color: #627a73;
    font-size: 14px;
    line-height: 1.55;
  }

  .login-benefit {
    display: flex;
    flex-wrap: wrap;
    gap: 18px 30px;
    margin-top: 20px;
  }

  .login-benefit span {
    display: grid;
    grid-template-columns: 20px auto;
    column-gap: 7px;
    color: #47675e;
    font-size: 12px;
    font-weight: 720;
    line-height: 1.3;
  }

  .login-benefit b {
    grid-row: 1 / span 2;
    color: #20a879;
    font-size: 14px;
  }

  .login-showcase-meta {
    position: absolute;
    z-index: 8;
    left: 28px;
    right: 28px;
    bottom: 16px;
    display: flex;
    justify-content: space-between;
    gap: 10px;
    color: #879c95;
    font-size: 10px;
    pointer-events: none;
  }

  .login-panel {
    position: relative;
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding: clamp(28px, 4vw, 52px);
    color: #effff9;
    background:
      radial-gradient(circle at 92% 18%, rgba(94, 203, 164, .13), transparent 28%),
      linear-gradient(150deg, #0b5745 0%, #084535 50%, #063a30 100%);
  }

  .login-panel::after {
    content: "";
    position: absolute;
    width: 250px;
    height: 250px;
    right: -95px;
    top: 35%;
    border-radius: 50%;
    border: 1px solid rgba(163, 245, 213, .08);
    box-shadow: 0 0 0 28px rgba(163,245,213,.025), 0 0 0 58px rgba(163,245,213,.018);
    pointer-events: none;
  }

  .login-panel-top {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    min-height: 62px;
  }

  .login-panel-top > div {
    display: grid;
    justify-items: end;
    text-align: right;
    color: rgba(236, 255, 248, .68);
    font-size: 11px;
    line-height: 1.35;
  }

  .login-panel-top > div strong { color: rgba(255,255,255,.88); font-size: 12px; }

  .login-home {
    color: rgba(234,255,248,.72);
    font-size: 12px;
    font-weight: 760;
    text-decoration: none;
    transition: color .18s ease, transform .18s ease;
  }
  .login-home:hover { color: #fff; transform: translateX(-2px); }

  .login-form-area {
    position: relative;
    z-index: 3;
    width: min(100%, 430px);
    margin: auto;
    padding: 18px 0 8px;
  }

  .login-heading { margin-bottom: 24px; }
  .login-heading > span {
    display: inline-flex;
    color: #93dfc7;
    font-size: 11px;
    font-weight: 850;
    letter-spacing: .11em;
    text-transform: uppercase;
  }

  .login-heading h1 {
    margin: 4px 0 8px;
    color: #fff;
    font-size: clamp(38px, 4.6vw, 58px);
    line-height: .98;
    letter-spacing: -.045em;
  }

  .login-heading p {
    margin: 0;
    color: rgba(235, 255, 248, .68);
    font-size: 13px;
    line-height: 1.55;
  }

  .login-form { display: grid; gap: 15px; }
  .login-field { display: grid; gap: 7px; }
  .login-field > span { color: rgba(244, 255, 251, .86); font-size: 12px; font-weight: 760; }

  .login-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 52px;
    border: 1px solid rgba(207, 241, 229, .26);
    border-radius: 15px;
    background: rgba(3, 42, 34, .35);
    box-shadow: inset 0 1px rgba(255,255,255,.025);
    transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
  }

  .login-input-wrap:focus-within {
    border-color: rgba(127, 232, 195, .72);
    background: rgba(2, 35, 29, .45);
    box-shadow: 0 0 0 4px rgba(87, 207, 166, .09);
  }

  .login-input-wrap > svg {
    width: 19px;
    height: 19px;
    margin-left: 15px;
    fill: none;
    stroke: #9bc8b9;
    stroke-width: 1.7;
    stroke-linecap: round;
    stroke-linejoin: round;
    flex: 0 0 auto;
  }

  .login-input-wrap input {
    min-width: 0;
    flex: 1;
    height: 50px;
    padding: 0 14px 0 11px;
    border: 0;
    outline: 0;
    color: #fff;
    background: transparent;
    font: inherit;
    font-size: 13px;
  }

  .login-input-wrap input::placeholder { color: rgba(219, 242, 234, .44); }
  .login-password-wrap input { padding-right: 66px; }

  .login-reveal {
    position: absolute;
    right: 8px;
    top: 8px;
    bottom: 8px;
    min-width: 50px;
    padding: 0 8px;
    border: 0;
    border-radius: 9px;
    color: #a7d9c8;
    background: rgba(255,255,255,.05);
    font: inherit;
    font-size: 11px;
    font-weight: 800;
    cursor: pointer;
  }

  .login-policy {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }
  .login-policy span {
    padding: 6px 8px;
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 999px;
    color: rgba(232,255,247,.56);
    font-size: 10px;
  }
  .login-policy span.lolos { color: #c7ffe9; border-color: rgba(108,225,184,.35); background: rgba(75,187,148,.12); }

  .login-forgot {
    justify-self: end;
    margin-top: -5px;
    padding: 2px 0;
    border: 0;
    color: #9ed7c3;
    background: transparent;
    font: inherit;
    font-size: 11px;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }

  .login-primary,
  .login-secondary,
  .login-google {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 52px;
    border-radius: 15px;
    font: inherit;
    font-weight: 800;
    text-decoration: none;
    cursor: pointer;
  }

  .login-primary {
    border: 1px solid rgba(217, 255, 240, .42);
    color: #064032;
    background: linear-gradient(135deg, #95e5c9, #61cda6);
    box-shadow: 0 14px 28px rgba(1, 25, 20, .18), inset 0 1px rgba(255,255,255,.5);
    transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
  }
  .login-primary:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.04); box-shadow: 0 20px 36px rgba(1,25,20,.24); }
  .login-primary:disabled { opacity: .62; cursor: wait; }

  .login-submit { width: 100%; margin-top: 3px; padding: 0 18px 0 24px; justify-content: space-between; }
  .login-submit b { font-size: 20px; font-weight: 500; }

  .login-secondary {
    padding: 0 18px;
    border: 1px solid rgba(9, 82, 65, .16);
    color: #135547;
    background: #eff9f5;
  }

  .login-switch {
    margin: 14px 0 0;
    color: rgba(237,255,249,.72);
    text-align: center;
    font-size: 11px;
  }
  .login-switch button {
    padding: 0;
    border: 0;
    color: #b9ecd9;
    background: transparent;
    font: inherit;
    font-weight: 760;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }

  .login-or {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 18px 0 12px;
    color: rgba(232,255,247,.44);
    font-size: 10px;
  }
  .login-or::before, .login-or::after { content: ""; height: 1px; flex: 1; background: rgba(255,255,255,.12); }

  .login-google {
    width: 100%;
    min-height: 48px;
    border: 1px solid rgba(255,255,255,.18);
    color: #eefdf8;
    background: rgba(255,255,255,.055);
    font-size: 12px;
    transition: background .18s ease, transform .18s ease;
  }
  .login-google:hover:not(:disabled) { background: rgba(255,255,255,.09); transform: translateY(-1px); }
  .login-google:disabled { opacity: .55; cursor: wait; }

  .login-time-block {
    position: relative;
    z-index: 3;
    width: min(100%, 430px);
    margin: 16px auto 0;
    padding-top: 17px;
    border-top: 1px solid rgba(255,255,255,.12);
  }

  .login-time-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 8px;
    color: rgba(232,255,247,.54);
    font-size: 10px;
  }
  .login-time-head button {
    padding: 0;
    border: 0;
    color: rgba(200,239,225,.7);
    background: transparent;
    font: inherit;
    font-weight: 760;
    cursor: pointer;
  }
  .login-time-head button.aktif { color: #bff2df; }

  .login-time-tabs {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
    padding: 5px;
    border: 1px solid rgba(255,255,255,.15);
    border-radius: 13px;
    background: rgba(1,31,25,.15);
  }
  .login-time-tabs button {
    min-height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    border: 0;
    border-radius: 9px;
    color: rgba(228,251,243,.62);
    background: transparent;
    font: inherit;
    font-size: 10px;
    cursor: pointer;
    transition: color .18s ease, background .18s ease, box-shadow .18s ease;
  }
  .login-time-tabs button b { font-size: 15px; font-weight: 500; }
  .login-time-tabs button.aktif { color: #073d31; background: #77d7b6; box-shadow: inset 0 1px rgba(255,255,255,.45); }
  .login-time-tabs button.sekarang { color: #d8fff0; background: rgba(107,215,177,.12); }

  .login-panel-foot {
    position: relative;
    z-index: 3;
    width: min(100%, 430px);
    margin: 17px auto 0;
    display: flex;
    justify-content: space-between;
    gap: 10px;
    color: rgba(229,252,244,.43);
    font-size: 9px;
  }
  .login-panel-foot a { color: rgba(207,244,231,.72); }

  .login-stage-state {
    background-image: linear-gradient(rgba(5,55,45,.45), rgba(5,55,45,.58)), var(--login-bg);
    background-size: cover;
    background-position: center;
  }

  .login-state-card {
    width: min(560px, 100%);
    padding: 34px;
    border: 1px solid rgba(255,255,255,.42);
    border-radius: 28px;
    color: #193f35;
    background: rgba(250,253,252,.93);
    box-shadow: 0 30px 70px rgba(4,39,32,.26);
    backdrop-filter: blur(18px);
    animation: loginMasuk .55s ease both;
  }
  .login-state-card img { width: 64px; height: 64px; object-fit: contain; margin-bottom: 18px; }
  .login-state-card > span { display: block; color: #43806f; font-size: 11px; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }
  .login-state-card h1 { margin: 5px 0 10px; font-size: 36px; letter-spacing: -.04em; }
  .login-state-card p { color: #60736d; line-height: 1.6; }
  .login-state-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
  .login-state-actions .login-primary, .login-state-actions .login-secondary { min-height: 46px; padding: 0 18px; }

  @keyframes loginMasuk {
    from { opacity: 0; transform: translateY(14px) scale(.988); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media (max-width: 980px) {
    .login-stage { padding: 14px; place-items: start center; }
    .login-shell { grid-template-columns: 1fr; min-height: auto; border-radius: 26px; }
    .login-showcase { min-height: 360px; }
    .login-showcase::before { width: 48%; height: 45%; right: -18%; }
    .login-landscape { top: 28%; height: 55%; }
    .login-landscape-shade { top: 18%; height: 25%; }
    .login-story { min-height: 40%; right: -2%; padding-top: 55px; }
    .login-story h2 { font-size: 34px; }
    .login-benefit { display: none; }
    .login-showcase-meta { display: none; }
    .login-panel { min-height: 680px; }
  }

  @media (max-width: 680px) {
    .login-stage { padding: 0; background: var(--login-green-deep); }
    .login-shell { width: 100%; border: 0; border-radius: 0; box-shadow: none; }
    .login-showcase { min-height: 250px; }
    .login-brand { top: 20px; left: 20px; }
    .login-brand img { width: 48px; height: 48px; }
    .login-brand span { font-size: 10px; }
    .login-brand strong { font-size: 21px; }
    .login-brand small { display: none; }
    .login-showcase::before { width: 55%; height: 50%; right: -26%; top: -18%; }
    .login-landscape { top: 0; height: 100%; background-position: center; }
    .login-landscape::after { background: linear-gradient(180deg, rgba(248,251,250,.78) 0%, rgba(248,251,250,.1) 42%, rgba(8,65,52,.18) 100%); }
    .login-landscape-shade { display: none; }
    .login-story { left: 14px; right: 14px; bottom: 14px; min-height: 0; padding: 13px 16px; border-radius: 16px; background: rgba(248,251,250,.9); backdrop-filter: blur(12px); }
    .login-story-kicker, .login-story i, .login-story > p { display: none; }
    .login-story h2 { font-size: 24px; line-height: 1; }
    .login-panel { min-height: 0; padding: 22px 18px 28px; }
    .login-panel-top { min-height: 45px; }
    .login-panel-top > div { display: none; }
    .login-form-area { padding-top: 8px; }
    .login-heading { margin-bottom: 19px; }
    .login-heading h1 { font-size: 38px; }
    .login-heading p { font-size: 12px; }
    .login-input-wrap { min-height: 50px; border-radius: 13px; }
    .login-input-wrap input { height: 48px; font-size: 12px; }
    .login-primary, .login-google { border-radius: 13px; }
    .login-time-block { margin-top: 18px; }
    .login-time-head { align-items: flex-start; flex-direction: column; }
    .login-time-tabs button { min-height: 40px; flex-direction: column; gap: 1px; }
    .login-panel-foot { flex-direction: column; align-items: center; text-align: center; }
    .login-state-card { margin: 16px; padding: 24px; border-radius: 22px; }
    .login-state-card h1 { font-size: 30px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .login-shell, .login-state-card { animation: none !important; }
    .login-stage-bg, .login-landscape, .login-primary, .login-google, .login-input-wrap { transition: none !important; }
  }
</style>
