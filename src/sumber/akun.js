/**
 * ===========================================================================
 *  AKUN -- API autentikasi yang dipakai halaman
 * ===========================================================================
 *
 * Halaman hanya memanggil fungsi di sini. SDK Firebase tetap dimuat secara
 * dinamis supaya pengunjung yang tidak login tidak perlu mengunduh pustaka
 * autentikasi. Resolver username dan pembuat akun Petugas juga dimuat hanya
 * saat fitur tersebut benar-benar dipakai.
 */

import { KUNCI_SIMPAN } from "../inti/nama.js";
import { simpanan } from "../inti/peramban.js";

let pintu = null;
let unduhan = null;
let saatBerubah = null;
let identitasSebelumnya;
let lepas = null;
let dilepas = false;

function tandaiPernahMasuk(ada) {
  if (ada) simpanan.tulis(KUNCI_SIMPAN.PERNAH_MASUK, "1");
  else simpanan.hapus(KUNCI_SIMPAN.PERNAH_MASUK);
}

function bukaPintu() {
  if (unduhan) return unduhan;
  unduhan = import("./pintu.js").then((p) => {
    pintu = p;
    if (saatBerubah && !dilepas) {
      lepas = p.pantau((u) => {
        const identitas = JSON.stringify(u ? [u.uid, u.email, u.emailVerified] : null);
        if (identitas === identitasSebelumnya) return;
        identitasSebelumnya = identitas;
        tandaiPernahMasuk(!!u);
        return saatBerubah(u);
      });
    }
    return p;
  });
  unduhan.catch(() => { unduhan = null; });
  return unduhan;
}

export function siapkanAkun() {
  return bukaPintu();
}

export function pantauMasuk(fn) {
  saatBerubah = fn;
  dilepas = false;

  if (simpanan.baca(KUNCI_SIMPAN.PERNAH_MASUK)) {
    bukaPintu();
  } else {
    identitasSebelumnya = JSON.stringify(null);
    fn(null);
  }

  return () => {
    dilepas = true;
    if (lepas) lepas();
    lepas = null;
    saatBerubah = null;
  };
}

export function penggunaSekarang() {
  return pintu ? pintu.auth.currentUser : null;
}

function identitasBersih(nilai) {
  return String(nilai || "").trim().toLowerCase();
}

function galatKredensial() {
  const err = new Error("Kredensial tidak cocok.");
  err.code = "auth/invalid-credential";
  return err;
}

async function emailUntukMasuk(identitas) {
  const nilai = identitasBersih(identitas);
  if (!nilai) return null;
  if (nilai.includes("@")) return nilai;

  const { emailDariUsername } = await import("./alias-login.js");
  return emailDariUsername(nilai);
}

export async function masukGoogle() {
  return (await bukaPintu()).masukGoogle();
}

/** Menerima Gmail/email langsung atau username Petugas. */
export async function masukEmail(identitas, sandi) {
  const email = await emailUntukMasuk(identitas);
  if (!email) throw galatKredensial();
  return (await bukaPintu()).masukEmail(email, sandi);
}

export async function validasiKataSandi(sandi) {
  return (await bukaPintu()).validasiKataSandi(sandi);
}

export async function daftarAkun(email, sandi, nama) {
  return (await bukaPintu()).daftarAkun(identitasBersih(email), sandi, String(nama || "").trim());
}

/**
 * Pembuatan akun Petugas berjalan di Firebase Auth app sekunder dengan
 * persistence in-memory. Ini menjaga sesi admin utama tetap aktif.
 */
export async function daftarPetugas(email, sandi, nama) {
  const cek = await validasiKataSandi(sandi);
  if (!cek.valid) {
    const err = new Error(cek.masalah.join(" "));
    err.code = "auth/password-policy";
    throw err;
  }
  const modul = await import("./pembuat-petugas.js");
  return modul.daftarPetugas(identitasBersih(email), sandi, String(nama || "").trim());
}

export async function batalkanPetugasBaru() {
  const modul = await import("./pembuat-petugas.js");
  return modul.batalkanPetugasBaru();
}

export async function selesaikanPetugasBaru() {
  const modul = await import("./pembuat-petugas.js");
  return modul.selesaikanPetugasBaru();
}

/** Menerima Gmail/email atau username Petugas tanpa membocorkan keberadaan akun. */
export async function lupaSandi(identitas) {
  const email = await emailUntukMasuk(identitas);
  if (!email) return;
  return (await bukaPintu()).lupaSandi(email);
}

export async function kirimUlangVerifikasi() {
  return (await bukaPintu()).kirimUlangVerifikasi();
}

export async function periksaVerifikasi() {
  return (await bukaPintu()).periksaVerifikasi();
}

export async function keluar() {
  return (await bukaPintu()).keluar();
}
