<script>
  import { beriTahu } from "../keadaan/pesan.svelte.js";
  import { pesanRamah } from "../sumber/firebase.js";
  import { rupiah } from "../inti/format.js";

  let { kasSekarang = [], saatSimpan = null, setelahSimpan = null } = $props();

  const XLSX_CDN = "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";

  const ALIAS = {
    tanggal: ["tanggal transaksi", "tanggal", "tgl", "date", "waktu"],
    ket: ["keterangan transaksi", "keterangan", "uraian", "deskripsi", "rincian", "transaksi", "keperluan", "memo"],
    masuk: ["total pemasukan", "pemasukan", "penerimaan", "uang masuk", "kas masuk", "debet", "debit", "income"],
    keluar: ["total pengeluaran", "pengeluaran", "belanja", "uang keluar", "kas keluar", "kredit", "credit", "biaya", "expense"],
    nominal: ["nominal", "jumlah transaksi", "nilai transaksi", "jumlah", "amount", "nilai", "total"],
    jenis: ["jenis transaksi", "jenis", "tipe", "type", "arus kas", "debit kredit", "debet kredit"],
    kategori: ["kategori", "akun", "account", "pos anggaran", "pos", "kelompok"],
    periode: ["periode", "bulan", "month"]
  };

  const BULAN = [
    ["januari", "jan", 0], ["februari", "feb", 1], ["maret", "mar", 2], ["april", "apr", 3],
    ["mei", "may", 4], ["juni", "jun", 5], ["juli", "jul", 6], ["agustus", "agu", 7],
    ["september", "sep", 8], ["oktober", "okt", "oct", 9], ["november", "nov", 10], ["desember", "des", "dec", 11]
  ];
  const NAMA_BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  let namaFile = $state("");
  let sibuk = $state(false);
  let menyimpan = $state(false);
  let kemajuan = $state("");
  let hasil = $state([]);
  let catatan = $state([]);
  let infoFormat = $state([]);
  let jumlahDuplikat = $state(0);
  let inputFile;
  let janjiXlsx = null;

  const totalMasuk = $derived(hasil.filter((x) => x.jenis === "masuk").reduce((n, x) => n + Number(x.nominal || 0), 0));
  const totalKeluar = $derived(hasil.filter((x) => x.jenis === "keluar").reduce((n, x) => n + Number(x.nominal || 0), 0));

  function teks(v) {
    return String(v === null || v === undefined ? "" : v).trim();
  }

  function kunci(v) {
    return teks(v)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function cocokAlias(teksHeader, nama) {
    const h = kunci(teksHeader);
    return ALIAS[nama].some((a) => {
      const x = kunci(a);
      return h === x || h.startsWith(x + " ") || h.endsWith(" " + x) || (x.length >= 5 && h.includes(x));
    });
  }

  function peranHeader(teksHeader) {
    /* Urutan penting: "Penerimaan - Jumlah" harus menjadi MASUK,
       bukan tertangkap lebih dulu sebagai kolom NOMINAL karena kata jumlah. */
    for (const nama of ["masuk", "keluar", "tanggal", "ket", "jenis", "kategori", "periode", "nominal"]) {
      if (cocokAlias(teksHeader, nama)) return nama;
    }
    return "";
  }

  function skorHeader(baris, sebelum = []) {
    const peta = {};
    let skor = 0;
    for (let i = 0; i < baris.length; i += 1) {
      const gabung = [sebelum[i], baris[i]].map(teks).filter(Boolean).join(" ");
      const peran = peranHeader(gabung) || peranHeader(baris[i]);
      if (peran && peta[peran] === undefined) {
        peta[peran] = i;
        skor += ["tanggal", "ket", "masuk", "keluar", "nominal"].includes(peran) ? 2 : 1;
      }
    }
    const punyaUang = peta.masuk !== undefined || peta.keluar !== undefined || peta.nominal !== undefined;
    const punyaKonteks = peta.ket !== undefined || peta.tanggal !== undefined;
    if (punyaUang) skor += 3;
    if (punyaKonteks) skor += 2;
    if (peta.masuk !== undefined && peta.keluar !== undefined) skor += 2;
    if (peta.nominal !== undefined && peta.jenis !== undefined) skor += 2;
    return { skor, peta };
  }

  function cariHeader(matrix) {
    let terbaik = { skor: -1, indeks: -1, peta: {} };
    const batas = Math.min(matrix.length, 35);
    for (let i = 0; i < batas; i += 1) {
      const baris = Array.isArray(matrix[i]) ? matrix[i] : [];
      const sebelum = i > 0 && Array.isArray(matrix[i - 1]) ? matrix[i - 1] : [];
      const a = skorHeader(baris, []);
      const b = skorHeader(baris, sebelum);
      const kandidat = b.skor > a.skor ? b : a;
      if (kandidat.skor > terbaik.skor) terbaik = { ...kandidat, indeks: i };
    }
    return terbaik;
  }

  function angkaUang(v) {
    if (typeof v === "number" && Number.isFinite(v)) return Math.round(v);
    let s = teks(v);
    if (!s) return 0;
    const negatif = /^\s*\(.*\)\s*$/.test(s) || /^\s*-/.test(s);
    s = s.replace(/[()]/g, "").replace(/\b(?:rp|idr)\b/gi, "").replace(/[^0-9.,-]/g, "").replace(/^-/, "");
    if (!s) return 0;

    const titik = s.lastIndexOf(".");
    const koma = s.lastIndexOf(",");
    if (titik >= 0 && koma >= 0) {
      const desimal = titik > koma ? "." : ",";
      const ribuan = desimal === "." ? "," : ".";
      s = s.split(ribuan).join("").replace(desimal, ".");
    } else if (koma >= 0) {
      const bagian = s.split(",");
      s = bagian.length > 2 || (bagian[1] && bagian[1].length === 3) ? bagian.join("") : bagian.join(".");
    } else if (titik >= 0) {
      const bagian = s.split(".");
      s = bagian.length > 2 || (bagian[1] && bagian[1].length === 3) ? bagian.join("") : bagian.join(".");
    }

    const n = Number.parseFloat(s);
    if (!Number.isFinite(n)) return 0;
    return Math.round((negatif ? -1 : 1) * n);
  }

  function jenisDari(v) {
    const s = kunci(v);
    if (!s) return "";
    if (/\b(masuk|pemasukan|penerimaan|debit|debet|income|in)\b/.test(s)) return "masuk";
    if (/\b(keluar|pengeluaran|belanja|kredit|credit|biaya|expense|out)\b/.test(s)) return "keluar";
    return "";
  }

  function kategoriDari(ket, asli = "") {
    const a = kunci(asli);
    if (a) {
      if (/iuran|kas warga/.test(a)) return "iuran warga";
      if (/bantuan|hibah|donasi|sumbangan/.test(a)) return "bantuan";
      if (/program|pembangunan|proyek|renovasi/.test(a)) return "program";
      if (/sosial|santunan|bansos/.test(a)) return "sosial";
      if (/operasional|belanja|biaya/.test(a)) return "operasional";
    }

    const s = kunci(ket);
    if (/iuran|uang kas|kas warga/.test(s)) return "iuran warga";
    if (/hibah|bantuan|donasi|sumbangan/.test(s)) return "bantuan";
    if (/pembangunan|renovasi|perbaikan|proyek|program|pengecoran|drainase/.test(s)) return "program";
    if (/santunan|sosial|bansos|takziah|duka/.test(s)) return "sosial";
    if (/listrik|lampu|air|atk|konsumsi|kebersihan|keamanan|honor|operasional|beli|bayar|service|servis/.test(s)) return "operasional";
    return "lainnya";
  }

  function namaBulanDariTeks(v) {
    const s = kunci(v);
    for (const item of BULAN) {
      const indeks = item[item.length - 1];
      const alias = item.slice(0, -1);
      if (alias.some((a) => new RegExp(`\\b${a}\\b`).test(s))) return indeks;
    }
    return -1;
  }

  function periodeDari(tanggal, sumber = "") {
    const gabung = `${teks(sumber)} ${teks(tanggal)}`;
    const bulanNama = namaBulanDariTeks(gabung);
    const tahun = (gabung.match(/\b(20\d{2}|19\d{2})\b/) || [])[1];
    if (bulanNama >= 0) return `${NAMA_BULAN[bulanNama]} ${tahun || new Date().getFullYear()}`;

    const s = teks(tanggal);
    const indo = s.match(/\b(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})\b/);
    if (indo) {
      const bln = Number(indo[2]) - 1;
      let th = Number(indo[3]);
      if (th < 100) th += 2000;
      if (bln >= 0 && bln < 12) return `${NAMA_BULAN[bln]} ${th}`;
    }

    const iso = s.match(/\b(20\d{2}|19\d{2})-(\d{1,2})-/);
    if (iso) {
      const bln = Number(iso[2]) - 1;
      if (bln >= 0 && bln < 12) return `${NAMA_BULAN[bln]} ${iso[1]}`;
    }

    return teks(sumber) && !/^sheet\s*\d*$/i.test(teks(sumber)) ? teks(sumber) : "Data impor";
  }

  function formatTanggal(v) {
    if (v instanceof Date && !Number.isNaN(v.getTime())) {
      return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(v);
    }
    return teks(v);
  }

  function nilaiSel(baris, indeks) {
    return indeks === undefined ? "" : baris[indeks];
  }

  function tandaTransaksi(x) {
    return [x.periode, x.tgl, x.ket, x.jenis, String(x.nominal)]
      .map((v) => kunci(v))
      .join("|");
  }

  function barisKeTransaksi(baris, peta, sumberPeriode) {
    const tgl = formatTanggal(nilaiSel(baris, peta.tanggal));
    const ket = teks(nilaiSel(baris, peta.ket));
    const kategoriAsli = teks(nilaiSel(baris, peta.kategori));
    const periodeAsli = teks(nilaiSel(baris, peta.periode));
    const masuk = angkaUang(nilaiSel(baris, peta.masuk));
    const keluar = angkaUang(nilaiSel(baris, peta.keluar));
    const nominalMentah = angkaUang(nilaiSel(baris, peta.nominal));
    let jenis = jenisDari(nilaiSel(baris, peta.jenis));
    let nominal = 0;

    if (peta.masuk !== undefined || peta.keluar !== undefined) {
      if (Math.abs(masuk) > 0 && Math.abs(keluar) > 0) return { salah: "kolom pemasukan dan pengeluaran sama-sama terisi" };
      if (Math.abs(masuk) > 0) { jenis = "masuk"; nominal = Math.abs(masuk); }
      else if (Math.abs(keluar) > 0) { jenis = "keluar"; nominal = Math.abs(keluar); }
    } else if (peta.nominal !== undefined) {
      nominal = Math.abs(nominalMentah);
      if (!jenis && nominalMentah < 0) jenis = "keluar";
      if (!jenis && nominalMentah > 0) jenis = "masuk";
    }

    if (!nominal) return { kosong: true };
    if (!ket) return { salah: "keterangan/uraian tidak ditemukan" };
    if (!jenis) return { salah: "jenis pemasukan/pengeluaran tidak dapat ditentukan" };

    const periode = periodeAsli || periodeDari(tgl, sumberPeriode);
    return {
      nilai: {
        periode,
        tgl: tgl || periode,
        ket,
        jenis,
        kategori: kategoriDari(ket, kategoriAsli),
        nominal: String(nominal)
      }
    };
  }

  function muatPustakaXlsx() {
    if (typeof window !== "undefined" && window.XLSX) return Promise.resolve(window.XLSX);
    if (janjiXlsx) return janjiXlsx;
    janjiXlsx = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = XLSX_CDN;
      script.async = true;
      script.onload = () => window.XLSX ? resolve(window.XLSX) : reject(new Error("Pembaca Excel tidak tersedia."));
      script.onerror = () => reject(new Error("Pembaca Excel gagal dimuat. Periksa koneksi internet lalu coba lagi."));
      document.head.appendChild(script);
    });
    return janjiXlsx;
  }

  async function bacaFile(event) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    namaFile = file.name;
    sibuk = true;
    hasil = [];
    catatan = [];
    infoFormat = [];
    jumlahDuplikat = 0;

    try {
      const XLSX = await muatPustakaXlsx();
      const buffer = await file.arrayBuffer();
      const buku = XLSX.read(buffer, { type: "array", cellDates: true, dense: true });
      const terkumpul = [];
      const masalah = [];
      const format = [];

      for (const namaSheet of buku.SheetNames) {
        const lembar = buku.Sheets[namaSheet];
        const matrix = XLSX.utils.sheet_to_json(lembar, { header: 1, defval: "", raw: true, blankrows: false });
        if (!matrix.length) continue;

        const deteksi = cariHeader(matrix);
        const peta = deteksi.peta || {};
        const punyaUang = peta.masuk !== undefined || peta.keluar !== undefined || peta.nominal !== undefined;
        const cukup = deteksi.skor >= 6 && punyaUang;
        if (!cukup) {
          masalah.push(`${namaSheet}: format tabel belum dikenali (judul kolom pemasukan/pengeluaran/nominal tidak ditemukan).`);
          continue;
        }

        const dikenali = Object.entries(peta).map(([nama, indeks]) => `${nama} ← ${teks(matrix[deteksi.indeks]?.[indeks]) || "kolom " + (indeks + 1)}`);
        format.push(`${namaSheet}: ${dikenali.join(", ")}`);

        for (let i = deteksi.indeks + 1; i < matrix.length; i += 1) {
          const baris = Array.isArray(matrix[i]) ? matrix[i] : [];
          if (!baris.some((v) => teks(v))) continue;
          const konversi = barisKeTransaksi(baris, peta, namaSheet);
          if (konversi.nilai) terkumpul.push({ ...konversi.nilai, sumber: namaSheet, barisExcel: i + 1 });
          else if (konversi.salah) masalah.push(`${namaSheet} baris ${i + 1}: ${konversi.salah}.`);
        }
      }

      const sudahAda = new Set((kasSekarang || []).map(tandaTransaksi));
      const dalamFile = new Set();
      const unik = [];
      let duplikat = 0;
      for (const x of terkumpul) {
        const sig = tandaTransaksi(x);
        if (sudahAda.has(sig) || dalamFile.has(sig)) {
          duplikat += 1;
          continue;
        }
        dalamFile.add(sig);
        unik.push(x);
      }

      hasil = unik;
      jumlahDuplikat = duplikat;
      catatan = masalah.slice(0, 12);
      if (masalah.length > 12) catatan = [...catatan, `+ ${masalah.length - 12} catatan lain tidak ditampilkan.`];
      infoFormat = format;

      if (!hasil.length) {
        beriTahu(terkumpul.length ? "Semua transaksi terdeteksi sebagai duplikat." : "Belum ada transaksi yang bisa dibaca dari file itu.");
      }
    } catch (err) {
      hasil = [];
      catatan = [err?.message || "File Excel gagal dibaca."];
      beriTahu(err?.message || "File Excel gagal dibaca.");
    } finally {
      sibuk = false;
    }
  }

  async function publikasikan() {
    if (!hasil.length || !saatSimpan || menyimpan) return;
    menyimpan = true;
    let masuk = 0;
    try {
      /* Disimpan dalam kelompok kecil supaya puluhan/ratusan baris tidak
         menembakkan permintaan jaringan sekaligus. */
      const ukuran = 8;
      for (let i = 0; i < hasil.length; i += ukuran) {
        const kelompok = hasil.slice(i, i + ukuran);
        kemajuan = `Menyimpan ${Math.min(i + ukuran, hasil.length)} dari ${hasil.length} transaksi...`;
        await Promise.all(kelompok.map((x) => saatSimpan({
          periode: x.periode,
          tgl: x.tgl,
          ket: x.ket,
          jenis: x.jenis,
          kategori: x.kategori,
          nominal: x.nominal
        })));
        masuk += kelompok.length;
      }
      await setelahSimpan?.();
      beriTahu(`${masuk} transaksi dari Excel dipublikasikan ke transparansi.`);
      hasil = [];
      infoFormat = [];
      catatan = [];
      namaFile = "";
      jumlahDuplikat = 0;
      kemajuan = "";
      if (inputFile) inputFile.value = "";
    } catch (err) {
      beriTahu(err?.code ? pesanRamah(err) : (err?.message || "Sebagian transaksi gagal disimpan."));
    } finally {
      menyimpan = false;
      kemajuan = "";
    }
  }
</script>

<section class="excel-import" aria-labelledby="excel-kas-title">
  <div class="excel-head">
    <div>
      <span class="excel-kicker">IMPOR OTOMATIS</span>
      <h3 id="excel-kas-title">Upload Excel → langsung jadi data transparansi</h3>
      <p>Format file tidak harus sama. Sistem mencari sendiri kolom tanggal, uraian, pemasukan/pengeluaran, nominal, kategori, dan periode.</p>
    </div>
    <span class="excel-badge">.XLSX · .XLS · .CSV</span>
  </div>

  <label class="excel-drop" class:sibuk>
    <input bind:this={inputFile} type="file" accept=".xlsx,.xls,.xlsb,.csv,.ods" onchange={bacaFile} disabled={sibuk || menyimpan} />
    <span class="excel-icon">⇧</span>
    <span>
      <strong>{sibuk ? "Membaca dan menyesuaikan format..." : (namaFile || "Pilih file laporan Excel")}</strong>
      <small>Judul boleh berada beberapa baris di atas tabel, nama kolom boleh berbeda, dan satu file boleh punya beberapa sheet.</small>
    </span>
    <b>{sibuk ? "Mohon tunggu" : "Pilih file"}</b>
  </label>

  <div class="excel-format-tags" aria-label="Format yang dikenali">
    <span>Pemasukan + Pengeluaran</span>
    <span>Debit + Kredit</span>
    <span>Nominal + Jenis</span>
    <span>Nominal +/-</span>
    <span>Multi-sheet</span>
  </div>

  {#if infoFormat.length}
    <div class="excel-detected">
      <strong>Format yang terdeteksi</strong>
      {#each infoFormat as f}<p>{f}</p>{/each}
    </div>
  {/if}

  {#if hasil.length || catatan.length || jumlahDuplikat}
    <div class="excel-summary">
      <article><small>Siap dipublikasi</small><strong>{hasil.length}</strong><span>transaksi</span></article>
      <article class="masuk"><small>Pemasukan terbaca</small><strong>{rupiah(totalMasuk)}</strong></article>
      <article class="keluar"><small>Pengeluaran terbaca</small><strong>{rupiah(totalKeluar)}</strong></article>
      <article><small>Duplikat dilewati</small><strong>{jumlahDuplikat}</strong><span>baris</span></article>
    </div>
  {/if}

  {#if hasil.length}
    <div class="excel-preview-wrap">
      <div class="excel-preview-title"><strong>Pratinjau hasil konversi</strong><span>Menampilkan {Math.min(hasil.length, 12)} dari {hasil.length}</span></div>
      <div class="excel-table-scroll">
        <table>
          <thead><tr><th>Periode</th><th>Tanggal</th><th>Keterangan</th><th>Jenis</th><th>Kategori</th><th>Nominal</th></tr></thead>
          <tbody>
            {#each hasil.slice(0, 12) as x}
              <tr>
                <td>{x.periode}</td>
                <td>{x.tgl}</td>
                <td>{x.ket}</td>
                <td><span class:jenis-masuk={x.jenis === "masuk"} class:jenis-keluar={x.jenis === "keluar"}>{x.jenis === "masuk" ? "Masuk" : "Keluar"}</span></td>
                <td>{x.kategori}</td>
                <td class="nominal">{rupiah(x.nominal)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      <div class="excel-actions">
        <p><b>Aman dari upload ulang:</b> transaksi yang sama persis dengan data yang sudah ada otomatis dilewati. Data lama tidak dihapus.</p>
        <button class="tombol utama" type="button" onclick={publikasikan} disabled={menyimpan}>
          {menyimpan ? (kemajuan || "Menyimpan...") : `Publikasikan ${hasil.length} transaksi ke Transparansi`}
        </button>
      </div>
    </div>
  {/if}

  {#if catatan.length}
    <div class="excel-notes">
      <strong>Baris yang perlu diperiksa</strong>
      {#each catatan as x}<p>• {x}</p>{/each}
      <small>Baris bermasalah tidak ikut dipublikasikan. File aslinya tetap tidak berubah.</small>
    </div>
  {/if}
</section>

<style>
  .excel-import{margin:0 0 26px;padding:22px;border:1px solid #cfe4dc;border-radius:18px;background:linear-gradient(145deg,#f7fcfa,#fff);box-shadow:0 14px 36px -30px rgba(12,91,70,.45);color:#17372e}
  .excel-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;margin-bottom:16px}.excel-head>div{min-width:0}.excel-kicker{display:block;margin-bottom:5px;color:#08735c;font-size:11px;font-weight:900;letter-spacing:.13em}.excel-head h3{margin:0 0 6px;font-size:20px;line-height:1.25}.excel-head p{max-width:760px;margin:0;color:#647871;font-size:13px;line-height:1.55}.excel-badge{flex:0 0 auto;padding:7px 10px;border-radius:999px;background:#e9f7f1;color:#08735c;font-size:11px;font-weight:850}
  .excel-drop{min-height:92px;display:grid;grid-template-columns:48px minmax(0,1fr) auto;gap:13px;align-items:center;padding:14px 16px;border:1.5px dashed #8fcbb8;border-radius:14px;background:#f4fbf8;cursor:pointer;transition:.18s}.excel-drop:hover{border-color:#168267;background:#eef9f5}.excel-drop.sibuk{opacity:.72;cursor:wait}.excel-drop input{position:absolute;inline-size:1px;block-size:1px;opacity:0;pointer-events:none}.excel-icon{width:43px;height:43px;display:grid;place-items:center;border-radius:12px;background:#0b7a61;color:#fff;font-size:22px;font-weight:900}.excel-drop strong{display:block;margin-bottom:3px;font-size:14px}.excel-drop small{display:block;color:#71817c;font-size:11.5px;line-height:1.45}.excel-drop>b{padding:9px 12px;border-radius:10px;background:#fff;border:1px solid #b9d9ce;color:#0b6d58;font-size:12px}
  .excel-format-tags{display:flex;flex-wrap:wrap;gap:7px;margin-top:11px}.excel-format-tags span{padding:5px 8px;border-radius:999px;background:#f0f4f2;color:#60706b;font-size:10.5px;font-weight:700}
  .excel-detected,.excel-notes{margin-top:14px;padding:12px 14px;border-radius:12px;background:#f5f8f7;border:1px solid #e1e9e6}.excel-detected strong,.excel-notes strong{display:block;margin-bottom:5px;font-size:12px}.excel-detected p,.excel-notes p{margin:3px 0;color:#61716c;font-size:11.5px;line-height:1.45}.excel-notes{background:#fff9ec;border-color:#f0ddb0}.excel-notes small{display:block;margin-top:7px;color:#7e7259;font-size:11px}
  .excel-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-top:14px}.excel-summary article{padding:12px;border:1px solid #e0e9e5;border-radius:12px;background:#fff}.excel-summary small,.excel-summary span{display:block;color:#74827d;font-size:10.5px}.excel-summary strong{display:block;margin:3px 0;color:#183b31;font-size:16px;line-height:1.2}.excel-summary .masuk strong{color:#08745b}.excel-summary .keluar strong{color:#b34d55}
  .excel-preview-wrap{margin-top:14px;border:1px solid #dbe7e2;border-radius:14px;overflow:hidden;background:#fff}.excel-preview-title{display:flex;justify-content:space-between;gap:12px;padding:12px 14px;border-bottom:1px solid #e7eeeb}.excel-preview-title strong{font-size:12.5px}.excel-preview-title span{color:#73817c;font-size:11px}.excel-table-scroll{overflow:auto;max-height:330px}.excel-table-scroll table{width:100%;border-collapse:collapse;min-width:760px;font-size:11px}.excel-table-scroll th{position:sticky;top:0;z-index:1;padding:9px 10px;background:#f5f8f7;color:#60706b;text-align:left;font-size:10px;letter-spacing:.03em}.excel-table-scroll td{padding:9px 10px;border-top:1px solid #edf1ef;color:#384e47;vertical-align:top}.excel-table-scroll td.nominal{font-weight:800;white-space:nowrap}.jenis-masuk,.jenis-keluar{display:inline-block;padding:3px 6px;border-radius:999px;font-size:9.5px;font-weight:850}.jenis-masuk{background:#e8f7f1;color:#08745b}.jenis-keluar{background:#fff0f1;color:#b34d55}
  .excel-actions{display:flex;gap:16px;align-items:center;justify-content:space-between;padding:13px 14px;border-top:1px solid #e6eeea;background:#fbfdfc}.excel-actions p{max-width:620px;margin:0;color:#667871;font-size:11px;line-height:1.45}.excel-actions button{flex:0 0 auto;white-space:nowrap}
  @media(max-width:760px){.excel-head{display:block}.excel-badge{display:inline-block;margin-top:9px}.excel-drop{grid-template-columns:42px 1fr}.excel-drop>b{grid-column:1/-1;text-align:center}.excel-summary{grid-template-columns:1fr 1fr}.excel-actions{align-items:stretch;flex-direction:column}.excel-actions button{width:100%}}
</style>