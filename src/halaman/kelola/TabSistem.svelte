<script>
  import { onMount } from "svelte";
  import { isi, muatKonten } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { simpanKonten } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";

  const SISTEM_KEY = "sistem";
  let form = $state({ provider: "GitHub Pages", siteUrl: "https://rayen467.github.io/website-rw02-sukatani/", domainTarget: "", apiUrl: "", healthUrl: "", mediaUrl: "", supportEmail: "", catatan: "" });
  let sibuk = $state(false);
  let cek = $state({ status: "", pesan: "" });
  let dimuat = $state(false);

  onMount(() => { muatKonten(SISTEM_KEY); });
  const dok = $derived(isi.konten?.[SISTEM_KEY] || null);

  $effect(() => {
    if (!dimuat && dok) {
      form = {
        provider: dok.provider || "GitHub Pages",
        siteUrl: dok.siteUrl || "https://rayen467.github.io/website-rw02-sukatani/",
        domainTarget: dok.domainTarget || "", apiUrl: dok.apiUrl || "", healthUrl: dok.healthUrl || "",
        mediaUrl: dok.mediaUrl || "", supportEmail: dok.supportEmail || "", catatan: dok.catatan || ""
      };
      dimuat = true;
    }
  });

  async function simpan() {
    sibuk = true;
    try {
      await simpanKonten(SISTEM_KEY, form);
      await muatKonten(SISTEM_KEY);
      beriTahu("Pengaturan koneksi tersimpan. Nilai ini bisa diganti lagi tanpa menyentuh source code.");
    } catch (err) { beriTahu(err?.code ? pesanRamah(err) : (err?.message || "Pengaturan belum tersimpan.")); }
    finally { sibuk = false; }
  }

  async function uji() {
    const tujuan = String(form.healthUrl || form.apiUrl || "").trim();
    if (!tujuan) { cek = { status: "gagal", pesan: "Isi URL health check atau API terlebih dahulu." }; return; }
    cek = { status: "cek", pesan: "Menguji koneksi..." };
    const mulai = performance.now();
    try {
      const r = await fetch(tujuan, { method: "GET", cache: "no-store" });
      const ms = Math.round(performance.now() - mulai);
      cek = r.ok ? { status: "ok", pesan: `Terhubung · HTTP ${r.status} · ${ms} ms` } : { status: "gagal", pesan: `Server merespons HTTP ${r.status} · ${ms} ms` };
    } catch { cek = { status: "gagal", pesan: "Belum bisa dijangkau dari browser. Periksa URL, HTTPS, CORS, DNS, atau status server." }; }
  }

  async function salin(teks, label) {
    if (!teks) return;
    try { await navigator.clipboard.writeText(teks); beriTahu(label + " disalin."); }
    catch { beriTahu("Belum bisa menyalin otomatis. Pilih teks lalu salin manual."); }
  }
</script>

<section class="blok">
  <div class="kepala-bagian"><div><h2>Server, domain & koneksi</h2><p>Tempat tunggal untuk alamat website, API, media, health check, dan domain tujuan.</p></div></div>
  <div class="catatan" style="margin-bottom:18px"><b>Tujuannya supaya petugas awam tidak perlu membuka source code.</b> Nilai koneksi aplikasi disimpan di database dan bisa diganti dari sini. Perubahan DNS/domain hosting tetap diterapkan sekali di panel penyedia domain/GitHub Pages/Vercel karena browser tidak boleh mengubah DNS sendiri.</div>
  <form class="isian-borang" onsubmit={(e) => { e.preventDefault(); simpan(); }}>
    <div class="isian"><label for="sys-provider">Penyedia hosting</label><select id="sys-provider" bind:value={form.provider}><option>GitHub Pages</option><option>Vercel</option><option>Server/VPS sendiri</option><option>Lainnya</option></select></div>
    <div class="isian"><label for="sys-site">URL website aktif</label><input id="sys-site" type="url" bind:value={form.siteUrl} placeholder="https://domain-anda.id/" /></div>
    <div class="isian"><label for="sys-domain">Domain tujuan</label><input id="sys-domain" bind:value={form.domainTarget} placeholder="rw02sukatani.id" /><span class="petunjuk">Setelah DNS/provider diarahkan, URL website aktif di atas dapat diganti tanpa menyentuh kode.</span></div>
    <div class="isian"><label for="sys-api">Base URL API/server</label><input id="sys-api" type="url" bind:value={form.apiUrl} placeholder="https://api.domain-anda.id" /></div>
    <div class="isian"><label for="sys-health">URL health check</label><input id="sys-health" type="url" bind:value={form.healthUrl} placeholder="https://api.domain-anda.id/health" /></div>
    <div class="isian"><label for="sys-media">Base URL media/CDN</label><input id="sys-media" type="url" bind:value={form.mediaUrl} placeholder="https://media.domain-anda.id" /></div>
    <div class="isian"><label for="sys-email">Email sistem/pengurus</label><input id="sys-email" type="email" bind:value={form.supportEmail} placeholder="layanan@domain-anda.id" /></div>
    <div class="isian wide"><label for="sys-note">Catatan operasional</label><textarea id="sys-note" bind:value={form.catatan}></textarea></div>
    <div class="baris-tombol"><button class="tombol utama" type="submit" disabled={sibuk}>{sibuk ? "Menyimpan..." : "Simpan pengaturan"}</button><button class="tombol" type="button" onclick={uji}>Uji koneksi server</button></div>
  </form>
  {#if cek.pesan}<div class:sys-ok={cek.status === "ok"} class:sys-gagal={cek.status === "gagal"} class="sys-status">{cek.pesan}</div>{/if}
</section>

<section class="blok">
  <div class="kepala-bagian"><h2>Ringkasan untuk petugas</h2></div>
  <div class="sys-grid">
    <article><span>Website</span><b>{form.siteUrl || "Belum diisi"}</b><button class="tombol" type="button" onclick={() => salin(form.siteUrl, "URL website")}>Salin</button></article>
    <article><span>Domain tujuan</span><b>{form.domainTarget || "Belum diisi"}</b><button class="tombol" type="button" onclick={() => salin(form.domainTarget, "Domain")}>Salin</button></article>
    <article><span>API/server</span><b>{form.apiUrl || "Belum memakai server eksternal"}</b><button class="tombol" type="button" onclick={() => salin(form.apiUrl, "URL API")}>Salin</button></article>
    <article><span>Media/CDN</span><b>{form.mediaUrl || "Firebase/tautan bawaan"}</b><button class="tombol" type="button" onclick={() => salin(form.mediaUrl, "URL media")}>Salin</button></article>
  </div>
</section>

<section class="blok"><div class="kepala-bagian"><h2>Catatan perubahan domain</h2></div><div class="catatan"><b>Bisa diganti di dashboard:</b> URL referensi website, API, health check, media/CDN, email sistem, dan domain tujuan. <b>Tetap membutuhkan panel penyedia:</b> DNS (A/CNAME), custom domain GitHub Pages/Vercel, SSL, dan Firebase Authorized Domains. Itu konfigurasi infrastruktur, bukan coding aplikasi.</div></section>

<style>.sys-status{margin-top:16px;padding:12px 14px;border-radius:10px;background:#f3f6f4;color:#53635d}.sys-status.sys-ok{background:#eaf8f1;color:#116b4f}.sys-status.sys-gagal{background:#fff2ef;color:#9b3a2d}.sys-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.sys-grid article{display:grid;gap:8px;padding:16px;border:1px solid #dce7e1;border-radius:12px;background:#fff}.sys-grid span{font-size:12px;color:#6b7d75}.sys-grid b{overflow-wrap:anywhere}.sys-grid .tombol{width:max-content}@media(max-width:720px){.sys-grid{grid-template-columns:1fr}}</style>