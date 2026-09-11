<script>
  import { sesi } from "../keadaan/sesi.svelte.js";
  import { beriTahu } from "../keadaan/pesan.svelte.js";
  import { pergi } from "../keadaan/rute.svelte.js";
  import { validasiKataSandi, siapkanAkun } from "../sumber/akun.js";
  import { metodeMasuk, hubungkanEmailSandi, hubungkanGoogle } from "../sumber/tautan-akun.js";
  import { pesanRamah } from "../sumber/firebase.js";

  siapkanAkun();

  let info = $state(null);
  let memuat = $state(false);
  let sibuk = $state(false);
  let sandi = $state("");
  let ulang = $state("");
  let lihat = $state(false);
  let uidTerakhir = "";

  const cocok = $derived(sandi.length > 0 && sandi === ulang);
  const cukup = $derived(sandi.length >= 15 && sandi.length <= 128);
  const lengkap = $derived(Boolean(info?.google && info?.password));

  async function muat() {
    if (!sesi.pengguna || memuat) return;
    memuat = true;
    try {
      info = await metodeMasuk();
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      memuat = false;
    }
  }

  $effect(() => {
    const uid = sesi.pengguna?.uid || "";
    if (uid && uid !== uidTerakhir) {
      uidTerakhir = uid;
      muat();
    }
    if (!uid) {
      uidTerakhir = "";
      info = null;
    }
  });

  async function aktifkanPassword(e) {
    e.preventDefault();
    if (sibuk) return;
    if (!cukup) {
      beriTahu("Gunakan password situs 15 sampai 128 karakter.");
      return;
    }
    if (!cocok) {
      beriTahu("Konfirmasi password belum sama.");
      return;
    }

    sibuk = true;
    try {
      const cek = await validasiKataSandi(sandi);
      if (!cek.valid) {
        beriTahu(cek.masalah[0] || "Password belum memenuhi kebijakan keamanan.");
        return;
      }
      info = await hubungkanEmailSandi(sandi);
      sandi = "";
      ulang = "";
      beriTahu("Login email + password berhasil dihubungkan ke akun yang sama.");
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      sibuk = false;
    }
  }

  async function aktifkanGoogle() {
    if (sibuk) return;
    sibuk = true;
    try {
      info = await hubungkanGoogle();
      beriTahu("Login Google berhasil dihubungkan ke akun yang sama.");
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      sibuk = false;
    }
  }
</script>

<nav class="remah"><a href="#/">Beranda</a><span>&rsaquo;</span><span>Keamanan Akun</span></nav>

{#if !sesi.siap}
  <div class="auth-box" role="status">Memeriksa sesi akun...</div>
{:else if !sesi.pengguna}
  <section class="auth-box">
    <p class="alis">Keamanan akun</p>
    <h1>Masuk terlebih dahulu</h1>
    <p>Masuk memakai salah satu metode yang sudah aktif, lalu hubungkan metode kedua dari halaman ini.</p>
    <button class="tombol utama" type="button" onclick={() => pergi("/masuk")}>Buka halaman masuk</button>
  </section>
{:else}
  <section class="auth-box auth-hero">
    <div>
      <p class="alis">Keamanan akun</p>
      <h1>Satu akun, dua cara masuk</h1>
      <p>
        Google dan Email + Password dapat dihubungkan ke <strong>UID Firebase yang sama</strong>.
        Artinya role Petugas, data warga, dan riwayat layanan tetap satu akun—bukan dua akun terpisah.
      </p>
    </div>
    <div class="identitas">
      <span>Email akun</span>
      <strong>{sesi.pengguna.email}</strong>
      <small>UID tetap sama saat provider ditambahkan.</small>
    </div>
  </section>

  <section class="auth-box">
    <div class="kepala-bagian">
      <div>
        <p class="alis">Metode masuk</p>
        <h2>Status login akun</h2>
      </div>
      {#if lengkap}<span class="badge-ok">2 metode aktif</span>{/if}
    </div>

    {#if memuat || !info}
      <p class="catatan">Memuat metode masuk...</p>
    {:else}
      <div class="provider-grid">
        <article class:aktif={info.google} class="provider-card">
          <div class="provider-icon google">G</div>
          <div>
            <strong>Google</strong>
            <span>{info.google ? "Aktif — bisa dipakai untuk login" : "Belum dihubungkan"}</span>
          </div>
          {#if info.google}
            <span class="status aktif">Aktif</span>
          {:else}
            <button class="tombol" type="button" disabled={sibuk} onclick={aktifkanGoogle}>Hubungkan</button>
          {/if}
        </article>

        <article class:aktif={info.password} class="provider-card">
          <div class="provider-icon">@</div>
          <div>
            <strong>Email + Password</strong>
            <span>{info.password ? "Aktif — memakai password khusus situs" : "Belum dihubungkan"}</span>
          </div>
          {#if info.password}<span class="status aktif">Aktif</span>{/if}
        </article>
      </div>
    {/if}
  </section>

  {#if info && !info.password}
    <section class="auth-box">
      <p class="alis">Aktifkan metode kedua</p>
      <h2>Buat password khusus website RW 02</h2>
      <p>
        Password ini <strong>bukan password Gmail</strong>. Gunakan password/passphrase khusus website supaya akun Google asli Anda
        juga dapat masuk lewat form Email + Password tanpa membuat UID baru.
      </p>

      <form class="link-form" onsubmit={aktifkanPassword}>
        <label for="link-password">Password situs baru</label>
        <div class="password-wrap">
          <input id="link-password" type={lihat ? "text" : "password"} bind:value={sandi} minlength="15" maxlength="128" autocomplete="new-password" required />
          <button type="button" class="tombol mini" onclick={() => (lihat = !lihat)}>{lihat ? "Sembunyikan" : "Lihat"}</button>
        </div>

        <label for="link-confirm">Ulangi password</label>
        <input id="link-confirm" type={lihat ? "text" : "password"} bind:value={ulang} minlength="15" maxlength="128" autocomplete="new-password" required />

        <div class="policy">
          <span class:lolos={cukup}>● 15–128 karakter</span>
          <span class:lolos={cocok}>● Konfirmasi sama</span>
          <small>Gunakan passphrase unik. Jangan pakai ulang password Gmail.</small>
        </div>

        <button class="tombol utama" type="submit" disabled={sibuk || !cukup || !cocok}>
          {sibuk ? "Menghubungkan..." : "Aktifkan login Email + Password"}
        </button>
      </form>
    </section>
  {/if}

  {#if lengkap}
    <section class="auth-box success-box">
      <p class="alis">Selesai</p>
      <h2>Dua metode masuk sudah aktif</h2>
      <p>
        Sekarang Anda boleh login memakai tombol Google atau memakai email <strong>{info.email}</strong> + password situs.
        Keduanya membuka akun Firebase yang sama dan mempertahankan role Petugas yang sama.
      </p>
      <button class="tombol utama" type="button" onclick={() => pergi("/masuk")}>Kembali ke halaman masuk</button>
    </section>
  {/if}
{/if}

<style>
  .auth-box { width:min(100% - 28px, 820px); margin:22px auto; padding:24px; border:1px solid var(--garis); border-radius:20px; background:var(--kartu); box-shadow:0 14px 40px rgba(0,0,0,.08); }
  .auth-box h1,.auth-box h2 { margin:4px 0 10px; }
  .auth-box p { line-height:1.65; }
  .auth-hero { display:grid; grid-template-columns:1.5fr .8fr; gap:22px; align-items:center; }
  .identitas { padding:18px; border-radius:16px; background:var(--lembut); display:grid; gap:5px; overflow-wrap:anywhere; }
  .identitas span,.identitas small,.provider-card span { color:var(--redup); }
  .provider-grid { display:grid; gap:12px; }
  .provider-card { display:grid; grid-template-columns:auto 1fr auto; gap:14px; align-items:center; padding:16px; border:1px solid var(--garis); border-radius:16px; }
  .provider-card.aktif { border-color:color-mix(in srgb,var(--hijau) 55%,var(--garis)); }
  .provider-card > div:nth-child(2) { display:grid; gap:4px; }
  .provider-icon { width:42px; height:42px; border-radius:12px; display:grid; place-items:center; font-weight:800; background:var(--lembut); }
  .provider-icon.google { background:#fff; color:#4285f4; border:1px solid #ddd; }
  .status,.badge-ok { display:inline-flex; align-items:center; padding:6px 10px; border-radius:999px; font-size:12px; font-weight:800; }
  .status.aktif,.badge-ok { background:color-mix(in srgb,var(--hijau) 14%,transparent); color:var(--hijau); }
  .link-form { display:grid; gap:10px; margin-top:18px; }
  .link-form label { font-weight:700; }
  .link-form input { min-height:46px; padding:0 13px; border:1px solid var(--garis); border-radius:10px; background:var(--latar); color:inherit; }
  .password-wrap { display:grid; grid-template-columns:1fr auto; gap:8px; }
  .tombol.mini { min-height:46px; }
  .policy { display:grid; gap:4px; padding:12px 0 4px; color:var(--redup); }
  .policy .lolos { color:var(--hijau); font-weight:700; }
  .success-box { border-color:color-mix(in srgb,var(--hijau) 50%,var(--garis)); }
  @media (max-width:700px) {
    .auth-box { width:min(100% - 20px,820px); padding:18px; border-radius:16px; }
    .auth-hero { grid-template-columns:1fr; }
    .provider-card { grid-template-columns:auto 1fr; }
    .provider-card > :last-child { grid-column:2; justify-self:start; }
    .password-wrap { grid-template-columns:1fr; }
  }
</style>
