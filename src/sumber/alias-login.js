import { doc, getDoc } from "firebase/firestore/lite";
import { db } from "./firebase.js";
import { KOLEKSI_LOGIN_PETUGAS, periksaUsername } from "../inti/identitas-login.js";

/**
 * Mengubah username Petugas menjadi email akun Firebase.
 * Hanya exact document get yang dipakai; Firestore Rules melarang list alias.
 */
export async function emailDariUsername(nilai) {
  const cek = periksaUsername(nilai);
  if (!cek.valid) return null;

  const acuan = await getDoc(doc(db, KOLEKSI_LOGIN_PETUGAS, cek.username));
  if (!acuan.exists()) return null;

  const email = String(acuan.data()?.email || "").trim().toLowerCase();
  return email.includes("@") ? email : null;
}
