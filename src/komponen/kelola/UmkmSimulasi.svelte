<script>
  import { KOLEKSI } from "../../inti/nama.js";
  import { isi, muatKoleksi } from "../../keadaan/isi.svelte.js";
  import { beriTahu } from "../../keadaan/pesan.svelte.js";
  import { simpanDokumen, hapusDokumen } from "../../sumber/data.js";
  import { hapusSemuaBuktiUmkm } from "../../sumber/umkm-bukti.js";

  let sibuk = $state(false);

  const admin = $derived(Array.isArray(isi.usaha_admin) ? isi.usaha_admin : []);
  const simulasi = $derived(admin.filter((x) => String(x.simulasi || "") === "1"));

  const DEMO = [
    {
      id: "simulasi-dapur-sari",
      usaha: {
        nama: "Dapur Sari · SIMULASI",
        kat: "siapsaji",
        katLabel: "Kuliner",
        ringkas: "Data dummy untuk mencoba legalitas, bukti sertifikat, QR, dan tindak lanjut UMKM.",
        panjang: "Nasi box\nKue basah\nCatering kegiatan warga",
        wa: "081200000001",
        alamat: "Blok A · RT 01 (data simulasi)",
        jam: "07.00–19.00 WIB",
        instagram: "",
        marketplace: "",
        maps: ""
      },
      admin: {
        pemilik: "Siti Demo",
        email: "demo-kuliner@example.com",
        rt: "RT 01",
        bentukUsaha: "Perseorangan",
        risikoUsaha: "Rendah",
        catatanIdentitas: "DATA SIMULASI — bebas diedit dan dihapus.",
        nibStatus: "aktif", nibNomor: "SIM-NIB-2026-001",
        kbliStatus: "aktif", kbliKode: "56103",
        izinRbaStatus: "aktif", izinRbaNomor: "SIM-RBA-001",
        npwpStatus: "proses", npwpNomor: "",
        pkpStatus: "tidak_perlu", pkpNomor: "",
        pbUmkuStatus: "tidak_perlu", pbUmkuNomor: "",
        halalStatus: "proses", halalNomor: "", halalJalur: "Self declare",
        sppirtStatus: "proses", sppirtNomor: "",
        bpomStatus: "tidak_perlu", bpomNomor: "",
        sniStatus: "tidak_perlu", sniNomor: "",
        slhsStatus: "belum", slhsNomor: "",
        nkvStatus: "tidak_perlu", nkvNomor: "",
        lingkunganStatus: "tidak_perlu", lingkunganNomor: "",
        pbgStatus: "tidak_perlu", pbgNomor: "",
        merekStatus: "belum", merekNomor: "",
        bpjsTkStatus: "tidak_perlu", bpjsTkNomor: "",
        bpjsKesStatus: "tidak_perlu", bpjsKesNomor: "",
        rekeningStatus: "aktif", qrisStatus: "aktif", pembukuanStatus: "proses", digitalStatus: "aktif",
        statusPendampingan: "proses",
        aksiBerikutnya: "Lengkapi bukti halal dan SPP-IRT, lalu verifikasi masa berlaku dokumen.",
        catatanPendampingan: "Gunakan usaha ini untuk latihan upload bukti dan QR.",
        dokumenLain: "",
        simulasi: "1"
      }
    },
    {
      id: "simulasi-servis-digital",
      usaha: {
        nama: "Servis Digital RW · SIMULASI",
        kat: "jasa",
        katLabel: "Jasa",
        ringkas: "Contoh usaha jasa untuk simulasi profil, kanal digital, QR WhatsApp, dan administrasi dasar.",
        panjang: "Instal ulang laptop\nServis ringan\nBantuan perangkat lunak",
        wa: "081200000002",
        alamat: "Blok C · RT 03 (data simulasi)",
        jam: "09.00–20.00 WIB",
        instagram: "",
        marketplace: "",
        maps: ""
      },
      admin: {
        pemilik: "Budi Demo", email: "demo-jasa@example.com", rt: "RT 03",
        bentukUsaha: "Perseorangan", risikoUsaha: "Rendah", catatanIdentitas: "DATA SIMULASI — usaha jasa.",
        nibStatus: "aktif", nibNomor: "SIM-NIB-2026-002", kbliStatus: "aktif", kbliKode: "95110",
        izinRbaStatus: "tidak_perlu", izinRbaNomor: "", npwpStatus: "aktif", npwpNomor: "SIM-NPWP-002",
        pkpStatus: "tidak_perlu", pkpNomor: "", pbUmkuStatus: "tidak_perlu", pbUmkuNomor: "",
        halalStatus: "tidak_perlu", halalNomor: "", halalJalur: "", sppirtStatus: "tidak_perlu", sppirtNomor: "",
        bpomStatus: "tidak_perlu", bpomNomor: "", sniStatus: "tidak_perlu", sniNomor: "", slhsStatus: "tidak_perlu", slhsNomor: "", nkvStatus: "tidak_perlu", nkvNomor: "",
        lingkunganStatus: "tidak_perlu", lingkunganNomor: "", pbgStatus: "tidak_perlu", pbgNomor: "", merekStatus: "proses", merekNomor: "",
        bpjsTkStatus: "tidak_perlu", bpjsTkNomor: "", bpjsKesStatus: "tidak_perlu", bpjsKesNomor: "",
        rekeningStatus: "aktif", qrisStatus: "aktif", pembukuanStatus: "aktif", digitalStatus: "aktif",
        statusPendampingan: "siap", aksiBerikutnya: "Pertahankan pembukuan dan lengkapi perlindungan merek bila diperlukan.", catatanPendampingan: "Data simulasi.", dokumenLain: "", simulasi: "1"
      }
    },
    {
      id: "simulasi-warung-hijau",
      usaha: {
        nama: "Warung Hijau · SIMULASI",
        kat: "retail",
        katLabel: "Retail",
        ringkas: "Contoh UMKM yang sengaja belum lengkap untuk menguji rekomendasi tindakan Petugas.",
        panjang: "Sembako\nMinuman\nKebutuhan rumah tangga",
        wa: "081200000003",
        alamat: "Blok E · RT 05 (data simulasi)",
        jam: "06.00–21.00 WIB",
        instagram: "",
        marketplace: "",
        maps: ""
      },
      admin: {
        pemilik: "Rina Demo", email: "demo-retail@example.com", rt: "RT 05", bentukUsaha: "Perseorangan", risikoUsaha: "Rendah", catatanIdentitas: "DATA SIMULASI — kondisi awal belum lengkap.",
        nibStatus: "belum", nibNomor: "", kbliStatus: "belum", kbliKode: "", izinRbaStatus: "belum", izinRbaNomor: "",
        npwpStatus: "belum", npwpNomor: "", pkpStatus: "tidak_perlu", pkpNomor: "", pbUmkuStatus: "belum", pbUmkuNomor: "",
        halalStatus: "tidak_perlu", halalNomor: "", halalJalur: "", sppirtStatus: "tidak_perlu", sppirtNomor: "", bpomStatus: "tidak_perlu", bpomNomor: "", sniStatus: "tidak_perlu", sniNomor: "", slhsStatus: "tidak_perlu", slhsNomor: "", nkvStatus: "tidak_perlu", nkvNomor: "",
        lingkunganStatus: "belum", lingkunganNomor: "", pbgStatus: "tidak_perlu", pbgNomor: "", merekStatus: "belum", merekNomor: "", bpjsTkStatus: "tidak_perlu", bpjsTkNomor: "", bpjsKesStatus: "tidak_perlu", bpjsKesNomor: "",
        rekeningStatus: "belum", qrisStatus: "proses", pembukuanStatus: "belum", digitalStatus: "belum",
        statusPendampingan: "butuh", aksiBerikutnya: "Mulai dari NIB dan KBLI, lalu aktifkan pembukuan sederhana.", catatanPendampingan: "Data simulasi untuk kondisi UMKM yang perlu pendampingan.", dokumenLain: "", simulasi: "1"
      }
    }
  ];

  async function buat() {
    sibuk = true;
    try {
      for (const d of DEMO) {
        await simpanDokumen(KOLEKSI.USAHA, d.id, d.usaha, false);
        await simpanDokumen(KOLEKSI.USAHA_ADMIN, d.id, {
          ...d.admin,
          usahaId: d.id,
          namaUsaha: d.usaha.nama,
          diperbarui: new Date().toISOString()
        }, false);
      }
      await Promise.all([muatKoleksi(KOLEKSI.USAHA), muatKoleksi(KOLEKSI.USAHA_ADMIN)]);
      beriTahu("3 UMKM simulasi dibuat. Semua bertanda SIMULASI dan dapat dihapus kapan saja.");
    } catch (err) {
      beriTahu("Data simulasi belum berhasil dibuat.");
    } finally {
      sibuk = false;
    }
  }

  async function hapusSemua() {
    if (!simulasi.length) return;
    if (!confirm(`Hapus ${simulasi.length} UMKM simulasi beserta semua bukti upload-nya?`)) return;
    sibuk = true;
    try {
      for (const a of simulasi) {
        const id = a.usahaId || a.id;
        await hapusSemuaBuktiUmkm(id);
        await hapusDokumen(KOLEKSI.USAHA_ADMIN, id);
        await hapusDokumen(KOLEKSI.USAHA, id);
      }
      await Promise.all([muatKoleksi(KOLEKSI.USAHA), muatKoleksi(KOLEKSI.USAHA_ADMIN)]);
      beriTahu("Semua data simulasi UMKM berhasil dihapus.");
    } catch {
      beriTahu("Sebagian data simulasi belum berhasil dihapus. Coba lagi.");
    } finally {
      sibuk = false;
    }
  }
</script>

<section class="sim-card">
  <div class="sim-copy">
    <span>LAB SIMULASI</span>
    <h3>Uji alur UMKM tanpa menyentuh data asli</h3>
    <p>Buat tiga skenario dummy: kuliner, jasa, dan retail. Edit bebas, upload bukti, coba QR, lalu hapus semuanya sekali klik.</p>
  </div>
  <div class="sim-status">
    <strong>{simulasi.length}</strong>
    <span>data simulasi aktif</span>
  </div>
  <div class="sim-actions">
    <button type="button" class="tombol utama" onclick={buat} disabled={sibuk}>{sibuk ? "Memproses..." : simulasi.length ? "Reset / isi ulang simulasi" : "Buat 3 data simulasi"}</button>
    {#if simulasi.length}<button type="button" class="tombol danger" onclick={hapusSemua} disabled={sibuk}>Hapus semua simulasi</button>{/if}
  </div>
</section>

<style>
  .sim-card{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:18px;align-items:center;margin-top:14px;padding:16px 18px;border:1px solid #cfe3da;border-radius:15px;background:linear-gradient(120deg,#0b5f4d 0%,#0c765e 48%,#e8f7f0 48.2%,#f8fcfa 100%);box-shadow:0 16px 38px -34px rgba(5,74,56,.7)}
  .sim-copy{color:#fff;max-width:650px}.sim-copy>span{font-size:12px;font-weight:900;letter-spacing:.11em;color:#9ce5cc}.sim-copy h3{margin:4px 0 5px;font-size:18px}.sim-copy p{margin:0;color:rgba(240,255,249,.72);line-height:1.45}
  .sim-status{min-width:110px;text-align:center;color:#155545}.sim-status strong{display:block;font-size:30px;line-height:1}.sim-status span{display:block;margin-top:4px;font-size:12px;color:#688078}.sim-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px}.sim-actions .danger{color:#a12c39;border-color:#edcbd0;background:#fff5f6}
  @media(max-width:1050px){.sim-card{grid-template-columns:1fr auto;background:linear-gradient(120deg,#0b5f4d,#0c765e)}.sim-status{color:#fff}.sim-status span{color:rgba(255,255,255,.68)}.sim-actions{grid-column:1/-1;justify-content:flex-start}}
  @media(max-width:680px){.sim-card{grid-template-columns:1fr;padding:14px}.sim-status{text-align:left}.sim-actions{grid-column:auto}.sim-actions .tombol{width:100%}}
</style>
