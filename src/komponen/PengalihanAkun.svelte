<script>
  import { onMount } from "svelte";
  import { sesi, pengurus } from "../keadaan/sesi.svelte.js";
  import { pergi } from "../keadaan/rute.svelte.js";
  import { waktu } from "../keadaan/waktu.svelte.js";

  const FOOTER_4K = Object.freeze({
    pagi: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/ac5972ef-a71b-4fdc-bf3a-f7b9c364f121.webp",
    siang: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/fd7cc752-5163-46de-89e3-9da5237b5063.webp",
    sore: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/5b8146fc-c187-43ac-85c0-11bf4a6eb9cd.webp",
    malam: "https://d2ol7oe51mr4n9.cloudfront.net/user_3J2DcrlVJWc07vYNUqg33j72Wvv/bd68ce05-84b7-4d7e-a430-e1b4364d2984.webp"
  });

  const petugas = $derived(pengurus());
  const gambarLatar = $derived(FOOTER_4K[waktu.fase] || FOOTER_4K.malam);

  onMount(() => {
    const tujuan = pengurus() ? "/kelola" : "/akun";
    const timer = window.setTimeout(() => pergi(tujuan), 420);
    return () => window.clearTimeout(timer);
  });
</script>

<section class="alih-akun" style={"--alih-bg:url('" + gambarLatar + "')"} aria-live="polite" aria-busy="true">
  <div class="alih-latar" aria-hidden="true"></div>
  <div class="alih-kartu">
    <div class="alih-logo-wrap">
      <img src="/website-rw02-sukatani/visual/brand/logo-icon.webp" alt="Logo RW 02 Sukatani" />
      <span class="alih-ring" aria-hidden="true"></span>
    </div>

    <span class="alih-label">RW 02 Sukatani</span>
    <h1>{petugas ? "Membuka Dashboard Petugas" : "Menyiapkan Ruang Warga"}</h1>
    <p>{petugas ? "Menyiapkan data operasional dan layanan internal." : "Menyiapkan akun, layanan, dan status pengajuan Anda."}</p>

    <div class="alih-progress" aria-hidden="true"><i></i></div>
    <small>{sesi.pengguna?.email || "Memeriksa akun..."}</small>
  </div>
</section>

<style>
  .alih-akun {
    position: relative;
    min-height: 100dvh;
    display: grid;
    place-items: center;
    overflow: hidden;
    padding: 24px;
    isolation: isolate;
    background: #073f34;
  }

  .alih-latar {
    position: absolute;
    inset: 0;
    z-index: -2;
    background-image: linear-gradient(rgba(4,45,37,.58), rgba(4,45,37,.72)), var(--alih-bg);
    background-size: cover;
    background-position: center;
    transform: scale(1.02);
  }

  .alih-akun::after {
    content: "";
    position: absolute;
    z-index: -1;
    width: 520px;
    height: 520px;
    right: -180px;
    top: -220px;
    border-radius: 50%;
    background: rgba(128,226,191,.08);
  }

  .alih-kartu {
    width: min(420px, 100%);
    padding: 34px 32px 30px;
    border: 1px solid rgba(255,255,255,.24);
    border-radius: 26px;
    color: #effff9;
    text-align: center;
    background: rgba(5,65,52,.74);
    box-shadow: 0 28px 70px rgba(1,28,23,.28);
    backdrop-filter: blur(18px);
    animation: masuk .38s ease both;
  }

  .alih-logo-wrap {
    position: relative;
    width: 82px;
    height: 82px;
    margin: 0 auto 18px;
    display: grid;
    place-items: center;
  }

  .alih-logo-wrap img {
    width: 58px;
    height: 58px;
    object-fit: contain;
    position: relative;
    z-index: 2;
    filter: drop-shadow(0 8px 16px rgba(0,0,0,.14));
  }

  .alih-ring {
    position: absolute;
    inset: 0;
    border: 2px solid rgba(142,230,199,.18);
    border-top-color: #8ee6c7;
    border-radius: 50%;
    animation: putar .9s linear infinite;
  }

  .alih-label {
    color: #9ce4cc;
    font-size: 12px;
    font-weight: 850;
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  h1 {
    margin: 7px 0 9px;
    color: #fff;
    font-size: clamp(25px, 4vw, 34px);
    line-height: 1.08;
    letter-spacing: -.035em;
  }

  p {
    margin: 0;
    color: rgba(235,255,248,.7);
    font-size: 14px;
    line-height: 1.55;
  }

  .alih-progress {
    height: 5px;
    margin: 24px 0 13px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(255,255,255,.12);
  }

  .alih-progress i {
    display: block;
    width: 42%;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg,#83e0c0,#d4fff0);
    animation: jalan 1.05s ease-in-out infinite;
  }

  small {
    display: block;
    max-width: 100%;
    overflow: hidden;
    color: rgba(227,251,242,.46);
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @keyframes putar { to { transform: rotate(360deg); } }
  @keyframes jalan {
    0% { transform: translateX(-110%); }
    55% { transform: translateX(145%); }
    100% { transform: translateX(260%); }
  }
  @keyframes masuk {
    from { opacity: 0; transform: translateY(10px) scale(.99); }
    to { opacity: 1; transform: none; }
  }

  @media (max-width: 680px) {
    .alih-akun { padding: 16px; }
    .alih-kartu { padding: 28px 22px 24px; border-radius: 22px; }
    .alih-logo-wrap { width: 72px; height: 72px; }
    .alih-logo-wrap img { width: 50px; height: 50px; }
    h1 { font-size: 27px; }
    p { font-size: 13px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .alih-ring, .alih-progress i, .alih-kartu { animation: none !important; }
  }
</style>
