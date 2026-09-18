<script>
  import { isi, muatKoleksi } from "../../keadaan/isi.svelte.js";
  import { sesi } from "../../keadaan/sesi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { KOLEKSI, STATUS } from "../../inti/nama.js";
  import { ubahDokumen } from "../../sumber/data.js";
  import { pesanRamah } from "../../sumber/firebase.js";
  import Lencana from "../../komponen/Lencana.svelte";

  let { daftar = [] } = $props();

  const petugas = $derived((isi.pengurus || []).map((p) => ({
    ...p,
    email: String(p.id || p.email || "").toLowerCase()
  })).filter((p) => p.email));

  const emailSaya = $derived(String(sesi.pengguna?.email || "").toLowerCase());
  const profilSaya = $derived(petugas.find((p) => p.email === emailSaya));
  const namaSaya = $derived(profilSaya?.nama || sesi.pengguna?.nama || emailSaya || "Petugas");

  const aktif = $derived(daftar.filter((x) => ![STATUS.SELESAI, STATUS.DITOLAK].includes(x.status)));
  const belumDitugaskan = $derived(aktif.filter((x) => !x.petugasEmail));
  const tugasSaya = $derived(aktif.filter((x) => String(x.petugasEmail || "").toLowerCase() === emailSaya));

  const TAHAP = [
    ["diterima", "Diterima"],
    ["ditugaskan", "Ditugaskan"],
    ["verifikasi", "Verifikasi data"],
    ["menunggu_ttd", "Menunggu tanda tangan"],
    ["menunggu_cap", "Menunggu ACC / cap RW"],
    ["siap", "Sudah ACC · siap diserahkan"],
    ["selesai", "Selesai"],
    ["ditolak", "Ditolak"]
  ];

  let bentuk = $state({});
  let sibuk = $state("");
  let cetakId = $state("");

  function nilai(x, k, awal = "") {
    const id = `${x.id}:${k}`;
    return bentuk[id] !== undefined ? bentuk[id] : (x[k] ?? awal);
  }

  function setNilai(x, k, v) {
    bentuk[`${x.id}:${k}`] = v;
  }

  function statusDariTahap(tahap) {
    if (tahap === "selesai") return STATUS.SELESAI;
    if (tahap === "ditolak") return STATUS.DITOLAK;
    if (["ditugaskan", "verifikasi", "menunggu_ttd", "menunggu_cap", "siap"].includes(tahap)) return STATUS.PROSES;
    return STATUS.BARU;
  }

  function namaPetugas(email) {
    if (!email) return "Belum ditugaskan";
    const p = petugas.find((x) => x.email === String(email).toLowerCase());
    return p?.nama || email;
  }

  function tahapLabel(tahap) {
    return TAHAP.find(([v]) => v === tahap)?.[1] || "Diterima";
  }

  function gmailHref(x) {
    const ke = String(nilai(x, "petugasEmail", x.petugasEmail || "")).trim();
    if (!ke) return "";
    const nomor = x.antrean || x.id;
    const subjek = `[RW02][${nomor}] ${x.jenis || "Pengajuan surat"} - ${x.rt || ""}`.trim();
    const isiEmail = [
      `Halo ${namaPetugas(ke)},`,
      "",
      "Ada pengajuan layanan yang ditugaskan kepada Anda.",
      `Nomor antrean: ${nomor}`,
      `Jenis layanan: ${x.jenis || "-"}`,
      `Pemohon: ${x.nama || "-"}`,
      `RT: ${x.rt || "-"}`,
      `Keperluan: ${x.keperluan || "-"}`,
      "",
      "Buka Portal Petugas RW 02 untuk melihat data lengkap dan memproses dokumen.",
      "Data sensitif seperti NIK tidak dicantumkan di email ini."
    ].join("\n");
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(ke)}&su=${encodeURIComponent(subjek)}&body=${encodeURIComponent(isiEmail)}`;
  }

  async function ambilTugas(x) {
    if (!emailSaya) return;
    setNilai(x, "petugasEmail", emailSaya);
    setNilai(x, "petugasNama", namaSaya);
    setNilai(x, "tahap", "ditugaskan");
    await simpan(x, "Tugas surat diambil oleh " + namaSaya + ".");
  }

  async function simpan(x, pesan = "Pengajuan surat diperbarui.") {
    sibuk = x.id;
    try {
      const email = String(nilai(x, "petugasEmail", x.petugasEmail || "")).trim().toLowerCase();
      const tahap = String(nilai(x, "tahap", x.tahap || (email ? "ditugaskan" : "diterima")));
      await ubahDokumen(KOLEKSI.SURAT, x.id, {
        petugasEmail: email,
        petugasNama: email ? namaPetugas(email) : "",
        tahap,
        status: statusDariTahap(tahap),
        nomorSurat: nilai(x, "nomorSurat", x.nomorSurat || ""),
        tanggalSurat: nilai(x, "tanggalSurat", x.tanggalSurat || ""),
        catatanPetugas: nilai(x, "catatanPetugas", x.catatanPetugas || "")
      });
      await muatKoleksi(KOLEKSI.SURAT);
      beriTahu(pesan);
    } catch (err) {
      beriTahu(pesanRamah(err));
    } finally {
      sibuk = "";
    }
  }

  async function setTahapCepat(x, tahap, pesan) {
    setNilai(x, "tahap", tahap);
    await simpan(x, pesan);
  }

  function cetak(x) {
    cetakId = x.id;
    setTimeout(() => window.print(), 60);
  }
</script>

<section class="meja-surat">
  <header class="meja-head">
    <div>
      <span class="kicker">MEJA SURAT DIGITAL</span>
      <h2>Pengajuan surat & penugasan petugas</h2>
      <p>Form warga diubah menjadi lembar kerja surat yang sama dengan arsip warga. Petugas bisa verifikasi, menyiapkan nomor surat, mencetak berkas A4, meneruskan ke RW untuk ACC/cap, lalu menandai siap diserahkan.</p>
    </div>
    <div class="meja-ringkas">
      <div><b>{belumDitugaskan.length}</b><span>Belum ditugaskan</span></div>
      <div><b>{tugasSaya.length}</b><span>Tugas saya</span></div>
      <div><b>{aktif.length}</b><span>Masih aktif</span></div>
    </div>
  </header>

  {#if daftar.length}
    <div class="surat-list">
      {#each daftar as x}
        {@const emailTugas = String(nilai(x, "petugasEmail", x.petugasEmail || ""))}
        {@const tahap = String(nilai(x, "tahap", x.tahap || (emailTugas ? "ditugaskan" : "diterima")))}
        <article class="surat-card">
          <div class="surat-summary">
            <div class="surat-title-row">
              <div>
                <span class="antrean">{x.antrean || x.id}</span>
                <h3>{x.jenis || "Pengajuan surat"}</h3>
              </div>
              <Lencana status={statusDariTahap(tahap)} />
            </div>

            <div class="pemohon-grid">
              <div><small>Pemohon</small><b>{x.nama || "-"}</b></div>
              <div><small>RT</small><b>{x.rt || "-"}</b></div>
              <div><small>Alamat</small><b>{x.alamat || "-"}</b></div>
              <div><small>WhatsApp</small><b>{x.wa || "-"}</b></div>
            </div>
            {#if x.keperluan}<p class="keperluan"><b>Keperluan:</b> {x.keperluan}</p>{/if}

            <div class="alur-mini">
              {#each TAHAP.filter((t) => t[0] !== "ditolak") as t}
                <span class:aktif={t[0] === tahap}>{t[1]}</span>
              {/each}
            </div>
          </div>

          <div class="surat-control">
            <label>
              <span>Petugas penanggung jawab</span>
              <select value={emailTugas} onchange={(e) => setNilai(x, "petugasEmail", e.currentTarget.value)}>
                <option value="">Belum ditugaskan</option>
                {#each petugas as p}<option value={p.email}>{p.nama || p.email} · {p.jabatan || "Petugas"}</option>{/each}
              </select>
            </label>
            <label>
              <span>Tahap layanan</span>
              <select value={tahap} onchange={(e) => setNilai(x, "tahap", e.currentTarget.value)}>
                {#each TAHAP as t}<option value={t[0]}>{t[1]}</option>{/each}
              </select>
            </label>
            <label>
              <span>Nomor surat resmi</span>
              <input value={nilai(x, "nomorSurat", x.nomorSurat || "")} oninput={(e) => setNilai(x, "nomorSurat", e.currentTarget.value)} placeholder="Contoh: 001/RW02/IX/2026" />
            </label>
            <label>
              <span>Tanggal surat</span>
              <input value={nilai(x, "tanggalSurat", x.tanggalSurat || "")} oninput={(e) => setNilai(x, "tanggalSurat", e.currentTarget.value)} placeholder="16 September 2026" />
            </label>
            <label class="wide">
              <span>Catatan internal petugas</span>
              <textarea value={nilai(x, "catatanPetugas", x.catatanPetugas || "")} oninput={(e) => setNilai(x, "catatanPetugas", e.currentTarget.value)} placeholder="Contoh: data sudah dicocokkan, menunggu tanda tangan Ketua RW"></textarea>
            </label>

            <div class="aksi wide">
              {#if !emailTugas}<button type="button" class="tombol utama" onclick={() => ambilTugas(x)} disabled={sibuk === x.id}>Ambil tugas</button>{/if}
              <button type="button" class="tombol utama" onclick={() => simpan(x)} disabled={sibuk === x.id}>{sibuk === x.id ? "Menyimpan..." : "Simpan alur"}</button>
              <button type="button" class="tombol" onclick={() => cetak(x)}>Preview / cetak A4</button>
              <a class="tombol" href={"#/surat-pengajuan/" + encodeURIComponent(x.id)}>Buka berkas penuh</a>
              {#if tahap === "menunggu_ttd"}
                <button type="button" class="tombol utama" onclick={() => setTahapCepat(x, "menunggu_cap", "Surat diteruskan ke RW untuk ACC / cap.")} disabled={sibuk === x.id}>Kirim ke RW / minta cap</button>
              {:else if tahap === "menunggu_cap"}
                <button type="button" class="tombol utama" onclick={() => setTahapCepat(x, "siap", "ACC / cap RW selesai. Surat siap diserahkan.")} disabled={sibuk === x.id}>ACC + cap selesai</button>
              {:else if tahap === "siap"}
                <button type="button" class="tombol utama" onclick={() => setTahapCepat(x, "selesai", "Surat ditandai sudah diserahkan / selesai.")} disabled={sibuk === x.id}>Tandai diserahkan</button>
              {/if}
              {#if gmailHref(x)}<a class="tombol gmail" href={gmailHref(x)} target="_blank" rel="noreferrer">Buka Gmail penugasan ↗</a>{/if}
            </div>
            <p class="email-note wide">Gmail di sini membuka draft email ke petugas yang dipilih tanpa menaruh NIK di isi email. Pengiriman otomatis penuh membutuhkan gateway email server; dashboard tidak mengaku email sudah terkirim sebelum gateway itu benar-benar aktif.</p>
          </div>

          <details class="preview-wrap">
            <summary>Lihat lembar surat</summary>
            <div class="surat-a4" class:cetak-aktif={cetakId === x.id}>
              <div class="draft-mark">{tahap === "menunggu_cap" ? "SIAP UNTUK ACC / CAP RW" : tahap === "siap" ? "SUDAH ACC · SIAP DISERAHKAN" : tahap === "selesai" ? "ARSIP SELESAI" : "DRAFT PETUGAS"}</div>
              <header>
                <b>RUKUN WARGA 02</b>
                <span>PERUM PERMAI SUKATANI · KECAMATAN RAJEG</span>
                <span>KABUPATEN TANGERANG · BANTEN</span>
              </header>
              <h2>{String(x.jenis || "SURAT KETERANGAN").toUpperCase()}</h2>
              <p class="nomor">Nomor: {nilai(x, "nomorSurat", x.nomorSurat || "Belum ditetapkan")}</p>
              <p>Yang bertanda tangan di bawah ini, pengurus RW 02 Perum Permai Sukatani, menerangkan bahwa:</p>
              <table><tbody>
                <tr><td>Nama</td><td>: {x.nama || "-"}</td></tr>
                <tr><td>NIK</td><td>: {x.nik || "-"}</td></tr>
                <tr><td>No. Kartu Keluarga</td><td>: {x.kk || "-"}</td></tr>
                <tr><td>Tempat/Tanggal Lahir</td><td>: {x.ttl || "-"}</td></tr>
                <tr><td>Alamat</td><td>: {x.alamat || "-"}, {x.rt || "-"}</td></tr>
                <tr><td>Keperluan</td><td>: {x.keperluan || "-"}</td></tr>
              </tbody></table>
              <p>Dokumen ini disiapkan berdasarkan pengajuan warga dengan nomor antrean <b>{x.antrean || x.id}</b>. Data perlu diverifikasi petugas sebelum surat ditandatangani dan diberi stempel.</p>
              <p>Demikian surat ini dibuat untuk dipergunakan sebagaimana mestinya.</p>
              <div class="ttd dua">
                <div>
                  <span>&nbsp;</span>
                  <span>Ketua RT</span>
                  <i></i>
                  <b>( ................................ )</b>
                </div>
                <div>
                  <span>Sukatani, {nilai(x, "tanggalSurat", x.tanggalSurat || "....................")}</span>
                  <span>Ketua RW 02</span>
                  <i></i>
                  <b>( ................................ )</b>
                  <small>Ruang tanda tangan &amp; cap/stempel RW 02</small>
                </div>
              </div>
              <footer>
                Penanggung jawab layanan: {emailTugas ? namaPetugas(emailTugas) : "belum ditugaskan"} · Tahap: {tahapLabel(tahap)}
              </footer>
            </div>
          </details>
        </article>
      {/each}
    </div>
  {:else}
    <div class="kosong">Tidak ada pengajuan surat yang cocok dengan saringan saat ini.</div>
  {/if}
</section>

<style>
  .meja-surat{display:grid;gap:14px}.meja-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:18px;border:1px solid #dbe8e2;border-radius:16px;background:linear-gradient(135deg,#eff9f4,#fff)}.kicker{display:block;color:#08765b;font-size:10px;font-weight:900;letter-spacing:.1em}.meja-head h2{margin:4px 0 6px;font-size:20px}.meja-head p{margin:0;max-width:760px;color:#5e746d;font-size:12px;line-height:1.55}.meja-ringkas{display:flex;gap:8px;flex-wrap:wrap}.meja-ringkas div{min-width:88px;padding:10px 12px;border:1px solid #dfe9e5;border-radius:12px;background:#fff}.meja-ringkas b,.meja-ringkas span{display:block}.meja-ringkas b{font-size:20px}.meja-ringkas span{margin-top:2px;color:#6b7d77;font-size:9px}.surat-list{display:grid;gap:12px}.surat-card{border:1px solid #dfe7e3;border-radius:16px;background:#fff;overflow:hidden}.surat-summary{padding:16px 18px;border-bottom:1px solid #edf2ef}.surat-title-row{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.antrean{font:800 11px/1.2 ui-monospace,monospace;color:#08765b}.surat-title-row h3{margin:4px 0 0;font-size:17px}.pemohon-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:14px}.pemohon-grid div{padding:9px 10px;border-radius:10px;background:#f7faf8}.pemohon-grid small,.pemohon-grid b{display:block}.pemohon-grid small{font-size:9px;color:#75847f}.pemohon-grid b{margin-top:2px;font-size:11px;overflow-wrap:anywhere}.keperluan{margin:12px 0 0;font-size:11px;color:#50635e}.alur-mini{display:flex;gap:5px;flex-wrap:wrap;margin-top:12px}.alur-mini span{padding:5px 8px;border-radius:999px;background:#eef2f0;color:#78837f;font-size:8px;font-weight:800}.alur-mini span.aktif{background:#dff5e9;color:#087258}.surat-control{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px;padding:16px 18px;background:#fbfcfb}.surat-control label>span{display:block;margin-bottom:5px;font-size:10px;font-weight:800;color:#52655f}.surat-control input,.surat-control select,.surat-control textarea{width:100%;min-height:40px;padding:9px 10px;border:1px solid #d7e1dc;border-radius:9px;background:#fff;font:inherit}.surat-control textarea{min-height:72px;resize:vertical}.wide{grid-column:1/-1}.aksi{display:flex;gap:8px;flex-wrap:wrap}.gmail{border-color:#d7e6ff!important;color:#285f9d!important;background:#f2f7ff!important}.email-note{margin:0;color:#74847e;font-size:9.5px;line-height:1.5}.preview-wrap{border-top:1px solid #e8eeeb}.preview-wrap>summary{padding:12px 18px;cursor:pointer;font-size:11px;font-weight:800;color:#166d56}.surat-a4{position:relative;width:min(760px,calc(100% - 32px));margin:4px auto 20px;padding:52px 58px;border:1px solid #d7d7d7;background:#fff;color:#111;box-shadow:0 16px 38px -30px #000;font-family:"Times New Roman",serif}.surat-a4 header{text-align:center;border-bottom:3px double #111;padding-bottom:10px}.surat-a4 header b,.surat-a4 header span{display:block}.surat-a4 header b{font-size:20px}.surat-a4 header span{font-size:11px;line-height:1.5}.surat-a4 h2{text-align:center;margin:24px 0 2px;font-size:17px;text-decoration:underline}.surat-a4 .nomor{text-align:center;margin:0 0 25px;font-size:12px}.surat-a4 p{font-size:13px;line-height:1.65;text-align:justify}.surat-a4 table{width:100%;border-collapse:collapse;margin:18px 0}.surat-a4 td{padding:4px 2px;font-size:13px;vertical-align:top}.surat-a4 td:first-child{width:165px}.ttd{display:flex;justify-content:flex-end;margin-top:34px}.ttd.dua{justify-content:space-between;gap:70px}.ttd div{width:230px;text-align:center}.ttd span,.ttd b,.ttd small{display:block;font-size:12px}.ttd small{margin-top:7px;color:#666;font-size:9px;font-weight:400}.ttd i{display:block;height:68px}.surat-a4 footer{margin-top:32px;padding-top:8px;border-top:1px solid #bbb;font-size:9px;color:#555}.draft-mark{position:absolute;right:22px;top:18px;padding:5px 8px;border:1px solid #d5a8a8;color:#9a4040;font:800 9px/1 sans-serif;letter-spacing:.08em;transform:rotate(2deg)}
  @media(max-width:760px){.meja-head{display:grid}.pemohon-grid,.surat-control{grid-template-columns:1fr}.wide{grid-column:auto}.surat-a4{padding:32px 24px}}
  @media print{ :global(body *){visibility:hidden!important}.surat-a4.cetak-aktif,.surat-a4.cetak-aktif *{visibility:visible!important}.surat-a4.cetak-aktif{position:absolute;left:0;top:0;width:100%;margin:0;border:0;box-shadow:none;padding:18mm 20mm}.draft-mark{display:block!important} }
</style>
