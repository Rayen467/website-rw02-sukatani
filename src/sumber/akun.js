/**
 * ===========================================================================
 *  AKUN -- API autentikasi yang dipakai halaman
 * ===========================================================================
 *
 * Halaman hanya memanggil fungsi di sini. SDK Firebase tetap dimuat secara
 * dinamis melalui pintu.js supaya pengunjung yang tidak login tidak perlu
 * mengunduh pustaka autentikasi.
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

function emailBersih(email) {
  return String(email || "").trim().toLowerCase();
}

export async function masukGoogle() {
  return (await bukaPintu()).masukGoogle();
}

export async function masukEmail(email, sandi) {
  return (await bukaPintu()).masukEmail(emailBersih(email), sandi);
}

export async function validasiKataSandi(sandi) {
  return (await bukaPintu()).validasiKataSandi(sandi);
}

export async function daftarAkun(email, sandi, nama) {
  return (await bukaPintu()).daftarAkun(emailBersih(email), sandi, String(nama || "").trim());
}

export async function lupaSandi(email) {
  return (await bukaPintu()).lupaSandi(emailBersih(email));
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
