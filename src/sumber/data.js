/**
 * ===========================================================================
 *  DATA -- semua perintah baca dan tulis ke Firestore
 * ===========================================================================
 *
 *  LAPIS 2 (sumber). Boleh mengimpor: inti/, sumber/firebase.js, sumber/akun.js
 *
 *  INI SATU-SATUNYA BERKAS YANG MENYENTUH DATA DI SERVER.
 *
 *  Halaman tidak pernah memanggil Firestore sendiri. Kalau sebuah halaman
 *  butuh cara baru mengambil atau menyimpan sesuatu, tambahkan fungsinya
 *  DI SINI, lalu panggil dari halaman. Untungnya ada dua:
 *
 *      1. Seluruh perintah ke server bisa dibaca dalam satu berkas.
 *         Mau tahu situs ini menulis apa saja? Buka berkas ini, selesai.
 *      2. Kalau nanti pindah dari Firebase ke layanan lain, cukup berkas
 *         ini yang ditulis ulang. Halaman tidak perlu disentuh sama sekali.
 *
 *  ATURAN PENAMAAN
 *      ambil...    membaca, mengembalikan data
 *      kirim...    warga menambah kiriman baru
 *      tambah...   pengurus menambah isi situs
 *      simpan...   menimpa satu dokumen yang sudah ada
 *      ubah...     mengubah sebagian kolom saja
 *      hapus...    menghapus dokumen
 */

import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase.js";
import { penggunaSekarang } from "./akun.js";
import { KOLEKSI, TANPA_URUTAN, STATUS, PERAN } from "../inti/nama.js";

/* =========================================================================
 *  MEMBACA
 * ========================================================================= */

/**
 * Mengambil satu koleksi penuh.
 *
 * Koleksi yang punya kolom "dibuat" diurutkan dari yang terbaru. Yang
 * tidak punya diambil apa adanya -- lihat TANPA_URUTAN di inti/nama.js.
 * Kalau koleksi tanpa kolom waktu terlanjur ikut diurutkan, Firestore
 * mengembalikan daftar KOSONG tanpa pesan galat, dan itu sulit dilacak.
 */
export async function ambilKoleksi(nama, batas = 200) {
  const acuan = TANPA_URUTAN.includes(nama)
    ? collection(db, nama)
    : query(collection(db, nama), orderBy("dibuat", "desc"), limit(batas));
  const cuplikan = await getDocs(acuan);
  const hasil = [];
  cuplikan.forEach((d) => hasil.push({ id: d.id, ...d.data() }));
  return hasil;
}

/** Mengambil satu dokumen tetap, misalnya konten/profil. */
export async function ambilKonten(bagian) {
  const d = await getDoc(doc(db, KOLEKSI.KONTEN, bagian));
  return d.exists() ? d.data() : null;
}

/**
 * Mengambil SATU dokumen dari koleksi mana pun, saat itu juga.
 *
 * Dipakai untuk isi yang sengaja tidak ikut dimuat di awal karena besar --
 * sekarang cuma isi berkas. Jangan dipakai untuk menampilkan daftar:
 * memanggil ini berulang di dalam perulangan berarti satu permintaan
 * jaringan per baris, dan itu jauh lebih lambat daripada ambilKoleksi().
 */
export async function ambilDokumen(koleksi, id) {
  const d = await getDoc(doc(db, koleksi, id));
  return d.exists() ? d.data() : null;
}

/**
 * Kiriman milik satu pengguna, untuk halaman Akun Saya.
 * Sengaja tanpa pengurutan supaya Firestore tidak menuntut indeks gabungan
 * yang harus dibuat manual di konsol.
 */
export async function ambilMilikSaya(nama, uid) {
  const cuplikan = await getDocs(query(collection(db, nama), where("uid", "==", uid)));
  const hasil = [];
  cuplikan.forEach((d) => hasil.push({ id: d.id, ...d.data() }));
  return hasil;
}

/**
 * Memeriksa apakah sebuah email terdaftar sebagai pengurus.
 * Mengembalikan "master", "petugas", atau null.
 *
 * Dokumen tanpa kolom peran dianggap master admin. Itu jalan masuk untuk
 * orang pertama yang didaftarkan langsung lewat konsol Firebase, waktu
 * belum ada pengurus mana pun yang bisa menambahkan.
 */
export async function ambilPeran(email) {
  const d = await getDoc(doc(db, KOLEKSI.PENGURUS, String(email || "").toLowerCase()));
  if (!d.exists()) return null;
  return d.data().peran === PERAN.PETUGAS ? PERAN.PETUGAS : PERAN.MASTER;
}

/** Catatan warga milik satu pengguna. Kuncinya uid, bukan email. */
export async function ambilProfilWarga(uid) {
  const d = await getDoc(doc(db, KOLEKSI.WARGA, uid));
  return d.exists() ? d.data() : null;
}

/**
 * Menghitung hasil polling.
 * Satu suara satu dokumen, kuncinya uid pemilih -- jadi memilih dua kali
 * hanya menimpa suara sendiri, tidak menambah hitungan.
 */
export async function ambilSuara(pollId) {
  const cuplikan = await getDocs(collection(db, KOLEKSI.POLLING, pollId, KOLEKSI.SUARA));
  const hitung = [];
  let milikSaya = null;
  const u = penggunaSekarang();
  cuplikan.forEach((d) => {
    const n = d.data().pilihan;
    hitung[n] = (hitung[n] || 0) + 1;
    if (u && d.id === u.uid) milikSaya = String(n);
  });
  for (let i = 0; i < 10; i++) if (!hitung[i]) hitung[i] = 0;
  return { hitung, milikSaya };
}

/* =========================================================================
 *  MENULIS
 * ========================================================================= */

/**
 * Menyeragamkan isi sebelum dikirim.
 *
 * Semua nilai dijadikan teks dan yang kosong jadi teks kosong, bukan
 * dibuang. Alasannya: aturan Firestore memeriksa keberadaan kolom, dan
 * kolom yang hilang membuat pengubahan ditolak dengan pesan yang
 * membingungkan. Lebih baik ada tapi kosong.
 */
function bersihkan(isi) {
  const hasil = {};
  Object.keys(isi).forEach((k) => {
    hasil[k] = isi[k] === null || isi[k] === undefined ? "" : String(isi[k]);
  });
  return hasil;
}

/**
 * Kiriman warga: pengaduan, pengajuan surat, peminjaman, pendaftaran usaha.
 * Selalu diberi uid pengirim dan status "baru" -- warga tidak bisa
 * mengirim sesuatu yang langsung berstatus selesai.
 */
export function kirimWarga(koleksi, isi) {
  const u = penggunaSekarang();
  return addDoc(collection(db, koleksi), {
    ...bersihkan(isi),
    uid: u ? u.uid : "",
    status: STATUS.BARU,
    dibuat: serverTimestamp()
  });
}

/** Isi situs yang ditambah pengurus: berita, foto, program, catatan kas. */
export function tambahIsi(koleksi, isi) {
  return addDoc(collection(db, koleksi), {
    ...bersihkan(isi),
    dibuat: serverTimestamp()
  });
}

/** Menimpa satu dokumen tetap, misalnya konten/profil. */
export function simpanKonten(bagian, isi) {
  return setDoc(doc(db, KOLEKSI.KONTEN, bagian), {
    ...bersihkan(isi),
    diubah: serverTimestamp()
  });
}

/**
 * Menimpa satu dokumen dengan id yang ditentukan sendiri.
 * tambahWaktu dimatikan untuk koleksi yang ada di TANPA_URUTAN, supaya
 * tidak muncul kolom waktu yang setengah-setengah: sebagian dokumen punya,
 * sebagian tidak, lalu pengurutan menghasilkan daftar yang tidak lengkap.
 */
export function simpanDokumen(koleksi, id, isi, tambahWaktu = true) {
  const isian = bersihkan(isi);
  if (tambahWaktu) isian.dibuat = serverTimestamp();
  return setDoc(doc(db, koleksi, id), isian);
}

/** Mengubah status kiriman saja. Isi laporannya tidak ikut tersentuh. */
export function ubahStatus(koleksi, id, status) {
  return updateDoc(doc(db, koleksi, id), { status });
}

export function hapusDokumen(koleksi, id) {
  return deleteDoc(doc(db, koleksi, id));
}

/**
 * Warga mendaftarkan diri supaya pengurus bisa mencocokkan dengan data RT.
 * Kuncinya uid, jadi satu akun hanya bisa punya satu catatan warga.
 */
export function daftarWarga(isi) {
  const u = penggunaSekarang();
  if (!u) throw new Error("belum masuk");
  return setDoc(doc(db, KOLEKSI.WARGA, u.uid), {
    ...bersihkan(isi),
    email: String(u.email || ""),
    status: STATUS.BARU,
    dibuat: serverTimestamp()
  });
}

/** Memilih di polling. Kunci dokumennya uid, jadi tidak bisa memilih dua kali. */
export function pilihPolling(pollId, nomor) {
  const u = penggunaSekarang();
  if (!u) throw new Error("belum masuk");
  return setDoc(doc(db, KOLEKSI.POLLING, pollId, KOLEKSI.SUARA, u.uid), {
    pilihan: nomor,
    dibuat: serverTimestamp()
  });
}

/**
 * Menyetujui peminjaman sekaligus mengunci tanggalnya di kalender warga.
 *
 * Dua tulisan sekaligus supaya pengurus tidak perlu ingat mengisi kalender
 * secara terpisah. Kalau langkah kedua gagal, yang pertama sudah terlanjur
 * tersimpan -- itu diterima: peminjaman disetujui tapi kalender belum
 * terisi masih bisa dibetulkan tangan, sedangkan kebalikannya tidak.
 */
export async function setujuiReservasi(id, tanggal, fasilitas) {
  await updateDoc(doc(db, KOLEKSI.RESERVASI, id), { status: STATUS.PROSES });
  if (tanggal) {
    await setDoc(doc(db, KOLEKSI.JADWAL, tanggal), {
      fasilitas: String(fasilitas || ""),
      dibuat: serverTimestamp()
    });
  }
}

/**
 * Menyimpan satu berkas: keterangannya di koleksi berkas, isinya di
 * koleksi berkas_isi dengan id yang sama.
 *
 * Keterangan ditulis DULUAN supaya id-nya lahir, lalu isinya menyusul.
 * Kalau langkah kedua gagal, yang tertinggal adalah dokumen yang judulnya
 * ada tapi isinya kosong -- halaman menampilkannya sebagai "berkasnya
 * belum terpasang", dan pengurus bisa menghapusnya. Kebalikannya jauh
 * lebih buruk: isi tanpa keterangan menjadi sampah yang tidak terlihat
 * siapa pun dan tidak bisa dihapus lewat layar.
 */
export async function simpanBerkas(keterangan, isiBerkas) {
  const acuan = await addDoc(collection(db, KOLEKSI.BERKAS), {
    ...bersihkan(keterangan),
    dibuat: serverTimestamp()
  });
  if (isiBerkas) {
    await setDoc(doc(db, KOLEKSI.BERKAS_ISI, acuan.id), { data: String(isiBerkas) });
  }
  return acuan.id;
}

/**
 * Menghapus berkas beserta isinya.
 *
 * Isinya dihapus lebih dulu. Kalau urutannya dibalik dan langkah kedua
 * gagal, isi yang tertinggal tidak punya keterangan lagi -- tidak muncul
 * di layar mana pun, tapi tetap memakan kuota dan tidak bisa dihapus
 * tanpa membuka konsol Firebase.
 */
export async function hapusBerkas(id) {
  try {
    await deleteDoc(doc(db, KOLEKSI.BERKAS_ISI, id));
  } catch (err) {
    /* Berkas yang cara masuknya tautan memang tidak punya dokumen isi. */
  }
  await deleteDoc(doc(db, KOLEKSI.BERKAS, id));
}
