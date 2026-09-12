import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut,
  deleteUser,
  setPersistence,
  inMemoryPersistence
} from "firebase/auth";
import { konfigurasi } from "./firebase.js";

let authPembuatPetugas = null;
let janjiAuthPembuat = null;

function galat(kode, pesan) {
  const err = new Error(pesan || kode);
  err.code = kode;
  return err;
}

async function ambilAuthPembuatPetugas() {
  if (authPembuatPetugas) return authPembuatPetugas;
  if (janjiAuthPembuat) return janjiAuthPembuat;

  janjiAuthPembuat = (async () => {
    const appPembuat = initializeApp(konfigurasi, "rw02-pembuat-petugas");
    const authKedua = getAuth(appPembuat);
    authKedua.languageCode = "id";
    await setPersistence(authKedua, inMemoryPersistence);
    authPembuatPetugas = authKedua;
    return authKedua;
  })();

  try {
    return await janjiAuthPembuat;
  } finally {
    janjiAuthPembuat = null;
  }
}

/**
 * Membuat akun Petugas tanpa mengganti sesi admin yang sedang aktif.
 * Password hanya diteruskan ke Firebase Authentication pada app sekunder
 * dengan persistence in-memory dan tidak pernah disimpan di Firestore.
 */
export async function daftarPetugas(email, sandi, nama) {
  const pembuat = await ambilAuthPembuatPetugas();
  let penggunaBaru = null;

  try {
    const hasil = await createUserWithEmailAndPassword(
      pembuat,
      String(email || "").trim().toLowerCase(),
      sandi
    );
    penggunaBaru = hasil.user;
    if (nama) await updateProfile(penggunaBaru, { displayName: String(nama).trim() });

    try {
      await sendEmailVerification(penggunaBaru);
    } catch (penyebab) {
      try { await deleteUser(penggunaBaru); } catch { /* rollback best effort */ }
      penggunaBaru = null;
      throw galat(
        "auth/verification-send-failed",
        "Akun Petugas belum dipertahankan karena email verifikasi gagal dikirim. Coba lagi setelah jaringan stabil."
      );
    }

    return penggunaBaru;
  } catch (err) {
    if (penggunaBaru) {
      try { await deleteUser(penggunaBaru); } catch { /* rollback best effort */ }
    }
    throw err;
  }
}

export async function batalkanPetugasBaru() {
  const pembuat = await ambilAuthPembuatPetugas();
  const u = pembuat.currentUser;
  if (!u) return;
  await deleteUser(u);
}

export async function selesaikanPetugasBaru() {
  const pembuat = await ambilAuthPembuatPetugas();
  if (pembuat.currentUser) await signOut(pembuat);
}
