/**
 * Menghubungkan beberapa metode masuk ke SATU akun Firebase (UID yang sama).
 *
 * Tujuannya: satu akun warga/petugas dapat dipakai lewat Google ATAU lewat
 * email + password situs tanpa membuat akun/UID kedua. Password Google tidak
 * pernah dibaca atau disimpan oleh situs.
 */
import { app } from "./firebase.js";

function galat(kode, pesan) {
  const e = new Error(pesan);
  e.code = kode;
  return e;
}

async function konteks() {
  const sdk = await import("firebase/auth");
  const auth = sdk.getAuth(app);
  const pengguna = auth.currentUser;
  if (!pengguna) throw galat("auth/requires-login", "Silakan masuk terlebih dahulu.");
  return { sdk, auth, pengguna };
}

export async function metodeMasuk() {
  const { pengguna } = await konteks();
  const providers = [...new Set((pengguna.providerData || []).map((p) => p.providerId).filter(Boolean))];
  return {
    uid: pengguna.uid,
    email: String(pengguna.email || "").toLowerCase(),
    google: providers.includes("google.com"),
    password: providers.includes("password"),
    providers
  };
}

export async function hubungkanEmailSandi(sandi) {
  const { sdk, pengguna } = await konteks();
  if (!pengguna.email) throw galat("auth/missing-email", "Akun ini tidak memiliki alamat email.");
  if ((pengguna.providerData || []).some((p) => p.providerId === "password")) {
    return metodeMasuk();
  }

  const kredensial = sdk.EmailAuthProvider.credential(pengguna.email, sandi);
  await sdk.linkWithCredential(pengguna, kredensial);
  return metodeMasuk();
}

export async function hubungkanGoogle() {
  const { sdk, pengguna } = await konteks();
  if ((pengguna.providerData || []).some((p) => p.providerId === "google.com")) {
    return metodeMasuk();
  }

  const emailAwal = String(pengguna.email || "").toLowerCase();
  const penyedia = new sdk.GoogleAuthProvider();
  penyedia.setCustomParameters({ prompt: "select_account", login_hint: emailAwal });

  const hasil = await sdk.linkWithPopup(pengguna, penyedia);
  const google = (hasil.user.providerData || []).find((p) => p.providerId === "google.com");
  const emailGoogle = String(google?.email || "").toLowerCase();

  // Jangan diam-diam menghubungkan akun Google berbeda ke identitas RW ini.
  if (emailAwal && emailGoogle && emailAwal !== emailGoogle) {
    await sdk.unlink(hasil.user, "google.com");
    throw galat("auth/provider-email-mismatch", "Pilih akun Google dengan alamat email yang sama.");
  }

  return metodeMasuk();
}
