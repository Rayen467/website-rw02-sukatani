/**
 * Menghubungkan sesi Authentication, hak pengurus, dan data di layar.
 * Seluruh pantauan berhenti ketika akun berubah atau aplikasi dilepas.
 */
import { pantauMasuk, penggunaSekarang } from "../sumber/akun.js";
import { pantauPeran, ambilProfilWarga } from "../sumber/data.js";
import { emailAkun } from "../inti/nama.js";
import { hapusDrafSurat } from "../inti/draf-surat.js";
import { sesi, namaPeran } from "./sesi.svelte.js";
import { muatSemuaKonten, muatUmum, muatPengurus, muatMilikSaya, muatSuara, kosongkanIsiPribadi } from "./isi.svelte.js";
import { beriTahu } from "./pesan.svelte.js";

let generasiSesi = 0;

function kosongkanSesi() {
  hapusDrafSurat();
  kosongkanIsiPribadi();
  sesi.pengguna = null;
  sesi.peran = null;
  sesi.profilWarga = null;
  sesi.galatAkses = false;
  sesi.galatProfil = false;
  sesi.terverifikasi = true;
  sesi.siap = true;
}

export function mulaiPantauan() {
  muatSemuaKonten();
  muatUmum();
  let hidup = true;
  let hentikanPeran = () => {};

  const hentikanMasuk = pantauMasuk((u) => {
    hentikanPeran();
    hentikanPeran = () => {};
    ++generasiSesi;
    kosongkanSesi();
    if (!u || !hidup) return;

    const akunIni = u;
    let pantauanAktif = true;
    const akunSama = () => hidup && pantauanAktif && penggunaSekarang() === akunIni;
    sesi.pengguna = { email: emailAkun(u.email), nama: u.displayName || u.email, uid: u.uid };
    sesi.terverifikasi = u.emailVerified;
    if (!u.emailVerified) {
      beriTahu("Email belum dipastikan. Buka Akun Saya untuk mengirim atau memeriksa tautan pemastian.");
      return;
    }
    sesi.siap = false;
    let peranSebelumnya;

    async function terapkanPeran(peran) {
      if (!akunSama() || peran === peranSebelumnya) return;
      peranSebelumnya = peran;
      const generasi = ++generasiSesi;
      const masihSama = () => akunSama() && generasi === generasiSesi;
      kosongkanIsiPribadi();
      sesi.peran = peran;
      sesi.profilWarga = null;
      sesi.galatAkses = false;
      sesi.galatProfil = false;
      sesi.siap = false;

      if (peran) {
        sesi.siap = true;
        muatPengurus();
        muatMilikSaya(u.uid);
        muatSuara();
        beriTahu("Masuk sebagai " + namaPeran(peran) + ". Menu Kelola sudah terbuka.");
        return;
      }

      let profil = null;
      let gagalProfil = false;
      try { profil = await ambilProfilWarga(u.uid); } catch (err) { gagalProfil = true; }
      if (!masihSama()) return;
      sesi.profilWarga = profil;
      sesi.galatProfil = gagalProfil;
      sesi.siap = true;
      muatMilikSaya(u.uid);
      muatSuara();
      beriTahu(gagalProfil ? "Masuk. Profil belum berhasil dimuat; coba lagi di Akun Saya."
        : profil ? "Masuk sebagai warga." : "Masuk. Lengkapi keterangan di halaman Akun Saya supaya pengurus bisa mencocokkan.");
    }

    const berhenti = pantauPeran(u.email, terapkanPeran, () => {
      if (!akunSama()) return;
      // Listener berhenti saat galat. Tutup data pribadi sampai akses bisa diperiksa kembali.
      ++generasiSesi;
      kosongkanIsiPribadi();
      sesi.peran = null;
      sesi.profilWarga = null;
      sesi.galatAkses = true;
      sesi.siap = true;
      beriTahu("Hak akses belum dapat diperiksa. Muat ulang halaman untuk mencoba lagi.");
    });
    hentikanPeran = () => {
      pantauanAktif = false;
      berhenti();
    };
  });

  return () => {
    hidup = false;
    ++generasiSesi;
    hentikanPeran();
    hentikanMasuk();
    kosongkanSesi();
  };
}

/** Ambil ulang catatan sendiri setelah pendaftaran warga. */
export async function segarkanProfilWarga() {
  const u = penggunaSekarang();
  if (!u) return;
  const generasi = generasiSesi;
  try {
    const profil = await ambilProfilWarga(u.uid);
    if (generasi !== generasiSesi || penggunaSekarang() !== u) return;
    sesi.profilWarga = profil;
    sesi.galatProfil = false;
  } catch (err) {
    if (generasi === generasiSesi && penggunaSekarang() === u) sesi.galatProfil = true;
  }
  if (generasi !== generasiSesi || penggunaSekarang() !== u) return;
  muatMilikSaya(u.uid);
}
