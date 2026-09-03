<script>
  import { sesi, beriTahu } from "../lib/keadaan.svelte.js";
  import { masukEmail, masukGoogle, daftarAkun, lupaSandi, keluar, pesanRamah } from "../lib/firebase.js";

  let mode = $state("masuk");
  let sibuk = $state(false);
  let f = $state({ email: "", sandi: "", ulang: "", nama: "" });

  async function jalankan(e) {
    e.preventDefault();
    sibuk = true;
    try {
      if (mode === "masuk") {
        await masukEmail(f.email, f.sandi);
        beriTahu("Berhasil masuk.");
      } else if (mode === "daftar") {
        if (f.sandi.length < 8) { beriTahu("Kata sandi minimal 8 huruf atau angka."); sibuk = false; return; }
        if (f.sandi !== f.ulang) { beriTahu("Kedua kata sandi belum sama."); sibuk = false; return; }
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

  async function google() {
    try { await masukGoogle(); } catch (err) { beriTahu(pesanRamah(err)); }
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
    <h1>
      {mode === "masuk" ? "Masuk ke akun warga" : mode === "daftar" ? "Daftar akun warga" : "Lupa kata sandi"}
    </h1>
    <p>
      {#if mode === "masuk"}Masuk untuk melacak pengajuan surat, laporan, dan permohonan pinjam yang Anda kirim.
      {:else if mode === "daftar"}Pendaftaran ini untuk warga. Cukup sekali, lalu Anda bisa melacak sendiri semua yang Anda kirim.
      {:else}Masukkan alamat email akun Anda. Tautan penggantian kata sandi dikirim ke email itu.{/if}
    </p>
  </div>

  <div class="pilihan-baris">
    {#each [["masuk", "Masuk"], ["daftar", "Daftar"], ["lupa", "Lupa sandi"]] as t}
      <button class="pilihan" type="button" aria-pressed={mode === t[0]} onclick={() => (mode = t[0])}>{t[1]}</button>
    {/each}
  </div>

  <form class="isian-borang" onsubmit={jalankan}>
    {#if mode === "daftar"}
      <div class="isian"><label for="m-nama">Nama lengkap</label><input id="m-nama" bind:value={f.nama} required autocomplete="name" /></div>
    {/if}

    <div class="isian">
      <label for="m-email">Alamat email</label>
      <input id="m-email" type="email" bind:value={f.email} required autocomplete="email" />
      {#if mode === "daftar"}
        <span class="petunjuk">Pakai email yang benar-benar bisa Anda buka. Tautan pemastian dikirim ke sana.</span>
      {/if}
    </div>

    {#if mode !== "lupa"}
      <div class="isian">
        <label for="m-sandi">Kata sandi</label>
        <input id="m-sandi" type="password" bind:value={f.sandi} required autocomplete={mode === "daftar" ? "new-password" : "current-password"} />
        {#if mode === "daftar"}<span class="petunjuk">Minimal 8 huruf atau angka.</span>{/if}
      </div>
    {/if}

    {#if mode === "daftar"}
      <div class="isian"><label for="m-ulang">Ulangi kata sandi</label><input id="m-ulang" type="password" bind:value={f.ulang} required autocomplete="new-password" /></div>
    {/if}

    <div>
      <button class="tombol utama" type="submit" disabled={sibuk}>
        {sibuk ? "Memproses..." : mode === "masuk" ? "Masuk" : mode === "daftar" ? "Daftar" : "Kirim tautan penggantian"}
      </button>
    </div>

    {#if mode === "daftar"}
      <p class="catatan-borang">
        <b>Pendaftaran ini hanya untuk warga.</b> Hak pengurus tidak diperoleh lewat pendaftaran &mdash;
        hanya pengurus yang sudah menjabat yang dapat memberikannya, lewat halaman Kelola.
        Jadi mendaftar di sini tidak pernah memberi akses ke data warga lain.
      </p>
    {:else if mode === "lupa"}
      <p class="catatan-borang">Kalau email tidak masuk dalam beberapa menit, periksa folder spam. Tautan hanya dikirim bila alamat itu memang terdaftar.</p>
    {/if}
  </form>

  <div class="kartu" style="margin-top:26px;max-width:580px">
    <h3>Atau pakai akun Google</h3>
    <p>Lebih cepat, dan tidak perlu mengingat kata sandi baru. Email akun Google sudah otomatis dipastikan, jadi Anda bisa langsung memakai situs tanpa menunggu tautan.</p>
    <div class="baris-tombol"><button class="tombol" type="button" onclick={google}>Lanjutkan dengan Google</button></div>
  </div>
{/if}
