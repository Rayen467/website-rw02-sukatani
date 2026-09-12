/**
 * Bukti administrasi UMKM.
 *
 * Berkas bukti sengaja disimpan per dokumen dan baru dibaca ketika Petugas
 * membuka satu UMKM. Project RW 02 masih memakai paket Firebase Spark; sejak
 * 2026 Cloud Storage memerlukan Blaze. Karena itu implementasi sekarang
 * memakai dokumen Firestore privat berukuran kecil. Gambar dikompresi di
 * browser sebelum fungsi ini dipanggil, sedangkan PDF dibatasi dari UI.
 */
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch
} from "firebase/firestore/lite";
import { db } from "./firebase.js";
import { KOLEKSI } from "../inti/nama.js";

function teks(nilai) {
  return nilai === null || nilai === undefined ? "" : String(nilai);
}

function rapikan(isi) {
  const hasil = {};
  Object.entries(isi || {}).forEach(([k, v]) => { hasil[k] = teks(v); });
  return hasil;
}

export async function ambilBuktiUmkm(usahaId) {
  const q = query(
    collection(db, KOLEKSI.USAHA_BUKTI),
    where("usahaId", "==", teks(usahaId))
  );
  const cuplikan = await getDocs(q);
  const hasil = [];
  cuplikan.forEach((d) => hasil.push({ id: d.id, ...d.data() }));
  return hasil.sort((a, b) => {
    const ta = a.diubah?.seconds || a.dibuat?.seconds || 0;
    const tb = b.diubah?.seconds || b.dibuat?.seconds || 0;
    return tb - ta;
  });
}

export function simpanBuktiUmkm(id, isi) {
  return setDoc(doc(db, KOLEKSI.USAHA_BUKTI, id), {
    ...rapikan(isi),
    dibuat: serverTimestamp(),
    diubah: serverTimestamp()
  });
}

export function ubahBuktiUmkm(id, isi) {
  return updateDoc(doc(db, KOLEKSI.USAHA_BUKTI, id), {
    ...rapikan(isi),
    diubah: serverTimestamp()
  });
}

export function hapusBuktiUmkm(id) {
  return deleteDoc(doc(db, KOLEKSI.USAHA_BUKTI, id));
}

export async function hapusSemuaBuktiUmkm(usahaId) {
  const daftar = await ambilBuktiUmkm(usahaId);
  for (let awal = 0; awal < daftar.length; awal += 400) {
    const batch = writeBatch(db);
    daftar.slice(awal, awal + 400).forEach((item) => {
      batch.delete(doc(db, KOLEKSI.USAHA_BUKTI, item.id));
    });
    await batch.commit();
  }
}
