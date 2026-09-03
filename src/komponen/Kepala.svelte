<script>
  import { KONTEN } from "../inti/nama.js";
  import { MENU, IDENTITAS_BAWAAN } from "../inti/bawaan.js";
  import { kontenNilai } from "../keadaan/isi.svelte.js";
  import { sesi, pengurus } from "../keadaan/sesi.svelte.js";
  import { rute, pergi } from "../keadaan/rute.svelte.js";
  import TombolTema from "./TombolTema.svelte";
  import TombolAkun from "./TombolAkun.svelte";

  let menuTerbuka = $state(null);
  let laciTerbuka = $state(false);
  let kataCari = $state("");

  const ident = $derived({
    lambang: kontenNilai(KONTEN.IDENTITAS, "lambang", IDENTITAS_BAWAAN.lambang),
    namaSitus: kontenNilai(KONTEN.IDENTITAS, "namaSitus", IDENTITAS_BAWAAN.namaSitus),
    namaRW: kontenNilai(KONTEN.IDENTITAS, "namaRW", IDENTITAS_BAWAAN.namaRW),
    wilayah: kontenNilai(KONTEN.IDENTITAS, "wilayah", IDENTITAS_BAWAAN.wilayah)
  });

  /* Menu tambahan yang hanya muncul untuk orang tertentu. */
  const daftarMenu = $derived([
    ...MENU,
    ...(pengurus()
      ? [{ label: "Kelola", alamat: "/kelola" }]
      : sesi.pengguna
        ? [{ label: "Akun Saya", alamat: "/akun" }]
        : [])
  ]);

  /* Menandai menu induk dari halaman yang sedang dibuka. */
  const induk = $derived.by(() => {
    const jalur = "/" + (rute.bagian[0] || "");
    for (const g of daftarMenu) {
      if (g.alamat === jalur) return g.label;
      if (g.isi && g.isi.some((x) => x[0] === jalur)) return g.label;
    }
    return null;
  });

  function bukaMenu(label) {
    menuTerbuka = menuTerbuka === label ? null : label;
  }

  function tutupSemua() {
    menuTerbuka = null;
    laciTerbuka = false;
  }

  function cari(e) {
    e.preventDefault();
    rute.cari = kataCari;
    pergi("/cari");
    tutupSemua();
  }

  $effect(() => {
    rute.jalur;
    tutupSemua();
  });
</script>

<svelte:window
  onclick={(e) => {
    if (!e.target.closest(".menu-butir") && !e.target.closest(".burger")) tutupSemua();
  }}
  onkeydown={(e) => e.key === "Escape" && tutupSemua()}
/>

<header class="situs tanpa-cetak">
  <div class="wadah">
    <div class="situs-atas">
      <a class="merek" href="#/">
        <span class="lambang" aria-hidden="true">{ident.lambang}</span>
        <span>
          <span class="nama">{ident.namaSitus}</span>
          <span class="sub">{ident.namaRW} · {ident.wilayah}</span>
        </span>
      </a>

      <form class="cari-kotak" role="search" onsubmit={cari}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.6-3.6" />
        </svg>
        <input
          type="search"
          bind:value={kataCari}
          placeholder="Cari surat, jadwal, atau usaha warga"
          aria-label="Cari di situs ini"
        />
        <button type="submit">Cari</button>
      </form>

      <TombolAkun />
      <TombolTema />

      <button
        class="tombol-kecil burger"
        type="button"
        aria-expanded={laciTerbuka}
        onclick={(e) => {
          e.stopPropagation();
          laciTerbuka = !laciTerbuka;
        }}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        <span class="teks">Menu</span>
      </button>
    </div>

    <nav class="menu-utama" aria-label="Menu utama">
      {#each daftarMenu as g}
        <div class="menu-butir" class:terpilih={induk === g.label}>
          {#if g.alamat}
            <a href="#{g.alamat}">{g.label}</a>
          {:else}
            <button
              type="button"
              aria-expanded={menuTerbuka === g.label}
              onclick={(e) => {
                e.stopPropagation();
                bukaMenu(g.label);
              }}>{g.label}</button
            >
            {#if menuTerbuka === g.label}
              <div class="turunan">
                {#each g.isi as it}
                  <a href="#{it[0]}">{it[1]}<span>{it[2]}</span></a>
                {/each}
              </div>
            {/if}
          {/if}
        </div>
      {/each}
    </nav>

    {#if laciTerbuka}
      <div class="laci">
        {#each daftarMenu as g}
          {#if g.alamat}
            <a href="#{g.alamat}">{g.label}</a>
          {:else}
            <div class="kelompok">{g.label}</div>
            {#each g.isi as it}
              <a href="#{it[0]}">{it[1]}</a>
            {/each}
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</header>
