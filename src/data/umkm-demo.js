/*
 * DATA DEMO DETAIL UMKM
 * ---------------------------------------------------------------------------
 * Tujuan: mengisi field yang belum tersedia supaya desain halaman detail UMKM
 * bisa diuji lengkap sebelum data asli dimasukkan dari Portal Petugas.
 *
 * CARA MEMATIKAN / MENGHAPUS:
 * 1) ubah DEMO_UMKM_AKTIF menjadi false, atau
 * 2) hapus file ini dan import/helper demo di UmkmRinci.svelte.
 *
 * Data asli SELALU menang atas data demo. Jadi saat field asli sudah diisi,
 * tampilan otomatis memakai data asli tanpa perlu mengubah layout.
 */

export const DEMO_UMKM_AKTIF = true;

const FOTO_SEPATU = [
  "https://images.unsplash.com/photo-1636262899511-dc5865c774dc?auto=format&fit=crop&w=1500&q=84",
  "https://images.unsplash.com/photo-1707109322463-f8e22fcaef4e?auto=format&fit=crop&w=1400&q=84",
  "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?auto=format&fit=crop&w=1200&q=82",
  "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=82",
  "https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=1200&q=82",
  "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=1200&q=82"
];

const DEMO_PER_ID = {
  "jasa-cuci-sepatu": {
    heroQuote: "Langkah Lebih Bersih, Setiap Hari",
    tagline: "Perawatan sepatu yang praktis untuk aktivitas sehari-hari.",
    ringkas: "Layanan pencucian dan perawatan sepatu untuk kebutuhan harian warga. Harga berkisar Rp35.000–Rp50.000, menyesuaikan jenis, merek, dan kondisi sepatu.",
    panjang: "Jasa Cuci Sepatu membantu warga menjaga kebersihan dan kondisi sepatu sehari-hari. Layanan dapat dikonsultasikan terlebih dahulu melalui WhatsApp agar jenis perawatan dan perkiraan biaya dapat disesuaikan dengan bahan, tingkat kotor, dan kondisi sepatu.",
    hargaMulai: 35000,
    hargaMaks: 50000,
    jam: "08.00–20.00 · setiap hari",
    bukaStatus: "Buka sekarang",
    tutupInfo: "Tutup pukul 20.00",
    galeri: FOTO_SEPATU,
    ratingDemo: "4.8",
    jumlahUlasanDemo: 12,
    terverifikasi: true,
    highlightDemo: [
      "Harga terjangkau",
      "Proses rapi",
      "Berbagai jenis sepatu",
      "Konsultasi langsung",
      "Perawatan sesuai kondisi",
      "Mendukung UMKM lokal"
    ],
    layanan: [
      {
        nama: "Cuci Reguler",
        deskripsi: "Pembersihan dasar untuk pemakaian harian dan kotoran ringan.",
        harga: 35000,
        foto: FOTO_SEPATU[0],
        label: "Populer"
      },
      {
        nama: "Deep Cleaning",
        deskripsi: "Pembersihan lebih menyeluruh untuk sepatu yang membutuhkan perhatian ekstra.",
        harga: 50000,
        foto: FOTO_SEPATU[1]
      },
      {
        nama: "Perawatan Sepatu Putih",
        deskripsi: "Perawatan untuk membantu menjaga tampilan sepatu berwarna terang.",
        hargaMulai: 40000,
        hargaMax: 50000,
        foto: FOTO_SEPATU[2]
      },
      {
        nama: "Konsultasi Kondisi",
        deskripsi: "Kirim foto sepatu terlebih dahulu untuk menentukan layanan yang sesuai.",
        hargaLabel: "Konsultasi",
        foto: FOTO_SEPATU[3]
      }
    ],
    keunggulanDemo: [
      "Hasil lebih bersih",
      "Harga terjangkau",
      "Proses rapi",
      "Melayani warga RW 02"
    ],
    caraPesan: [
      "Hubungi kami via WhatsApp",
      "Kirim foto dan jelaskan kondisi sepatu",
      "Konfirmasi layanan, biaya, dan estimasi waktu",
      "Serahkan sepatu sesuai kesepakatan",
      "Sepatu selesai dan siap diambil / dikirim"
    ],
    metodePembayaran: ["Tunai", "QRIS", "Transfer Bank"],
    sosialMediaDemo: ["Instagram", "TikTok"],
    promo: "Potongan Rp10.000 untuk layanan Deep Cleaning",
    promoKeterangan: "CONTOH DATA · berlaku untuk satu pasang sepatu. Ganti atau hapus dari Portal Petugas sebelum dipakai sebagai promo resmi.",
    testimoniDemo: {
      isi: "Sepatunya jadi jauh lebih bersih dan proses komunikasinya gampang lewat WhatsApp.",
      nama: "Warga RW 02",
      keterangan: "Contoh ulasan untuk menguji layout"
    },
    faq: [
      { tanya: "Berapa lama proses pencucian sepatu?", jawab: "Waktu pengerjaan mengikuti kondisi sepatu dan antrean. Konfirmasi estimasi terbaru melalui WhatsApp." },
      { tanya: "Apakah semua jenis sepatu bisa dicuci?", jawab: "Jenis material dan kondisi sepatu perlu dicek terlebih dahulu agar metode perawatan sesuai." },
      { tanya: "Apakah bisa antar-jemput?", jawab: "Ketersediaan antar-jemput belum menjadi data resmi. Tanyakan langsung kepada pemilik." }
    ]
  }
};

const DEMO_KATEGORI = {
  siapsaji: {
    tagline: "Pilihan kuliner warga untuk kebutuhan harian, keluarga, dan kegiatan lingkungan.",
    jam: "Setiap hari · jam layanan menyesuaikan pemilik",
    metodePembayaran: ["Tunai", "Transfer / QRIS jika tersedia"],
    caraPesan: ["Pilih menu", "Hubungi pemilik", "Konfirmasi pesanan dan harga", "Ambil / kirim sesuai kesepakatan"]
  },
  kemasan: {
    tagline: "Produk rumahan warga yang praktis untuk dinikmati, disimpan, atau dibagikan.",
    metodePembayaran: ["Tunai", "Transfer jika tersedia"],
    caraPesan: ["Pilih produk", "Tanyakan stok", "Konfirmasi jumlah dan harga", "Atur pengambilan / pengiriman"]
  },
  retail: {
    tagline: "Belanja kebutuhan lebih dekat melalui usaha warga di lingkungan sendiri.",
    metodePembayaran: ["Tunai", "Pembayaran digital jika tersedia"],
    caraPesan: ["Lihat kategori produk", "Tanyakan stok", "Konfirmasi harga", "Datang atau atur pengambilan"]
  },
  jasa: {
    tagline: "Layanan warga untuk membantu kebutuhan sehari-hari secara lebih praktis.",
    metodePembayaran: ["Tunai", "Transfer jika tersedia"],
    caraPesan: ["Hubungi pemilik", "Jelaskan kebutuhan", "Konfirmasi biaya dan waktu", "Layanan dikerjakan sesuai kesepakatan"]
  }
};

export const DEMO_TERKAIT = [
  { id: "demo-laundry", nama: "Laundry Kiloan", kat: "jasa", katLabel: "Jasa", sampul: "/website-rw02-sukatani/foto/usaha-laundry-kiloan.jpg", demo: true },
  { id: "demo-jahit", nama: "Jahit & Permak", kat: "jasa", katLabel: "Jasa", sampul: "/website-rw02-sukatani/foto/usaha-jahit-permak.jpg", demo: true },
  { id: "demo-katering", nama: "Katering Harian", kat: "siapsaji", katLabel: "Kuliner", sampul: "/website-rw02-sukatani/foto/usaha-katering-harian.jpg", demo: true },
  { id: "demo-produk-rumahan", nama: "Produk Rumahan", kat: "kemasan", katLabel: "Produk Kemasan", sampul: "/website-rw02-sukatani/foto/usaha-keripik-sambal.jpg", demo: true }
];

function isiJikaKosong(asli, demo) {
  const hasil = { ...demo, ...asli };
  for (const [kunci, nilai] of Object.entries(demo || {})) {
    const sekarang = asli?.[kunci];
    const kosong = sekarang === undefined || sekarang === null || sekarang === "" || (Array.isArray(sekarang) && sekarang.length === 0);
    if (kosong) hasil[kunci] = nilai;
  }
  return hasil;
}

export function terapkanDemoUmkm(id, asli) {
  if (!asli || !DEMO_UMKM_AKTIF) return asli;
  const kategori = DEMO_KATEGORI[String(asli.kat || "").toLowerCase()] || {};
  const khusus = DEMO_PER_ID[id] || {};
  const denganKategori = isiJikaKosong(asli, kategori);
  const lengkap = isiJikaKosong(denganKategori, khusus);
  return { ...lengkap, __demoAktif: true };
}
