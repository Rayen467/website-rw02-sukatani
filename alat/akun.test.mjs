import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SourceTextModule, SyntheticModule, createContext } from 'node:vm';

const akar = fileURLToPath(new URL('../', import.meta.url));
const jeda = () => {
  let selesai;
  const janji = new Promise((r) => { selesai = r; });
  return { janji, selesai };
};

async function muat(jalur, tiruan = {}) {
  const konteks = createContext({ console, $state: (nilai) => nilai });
  const modul = new Map();
  const alamat = (spesifier, induk) => spesifier.startsWith('.')
    ? resolve(dirname(induk.identifier), spesifier) : spesifier;
  const penghubung = (spesifier, induk) => buat(alamat(spesifier, induk));

  async function dinamis(spesifier, induk) {
    const anak = await buat(alamat(spesifier, induk));
    if (anak.status === 'unlinked') await anak.link(penghubung);
    if (anak.status === 'linked') await anak.evaluate();
    return anak;
  }

  async function buat(id) {
    if (modul.has(id)) return modul.get(id);
    const nilai = tiruan[id];
    const pilihan = { context: konteks, identifier: id, importModuleDynamically: dinamis };
    const m = nilai
      ? new SyntheticModule(Object.keys(nilai), function () {
          for (const [k, v] of Object.entries(nilai)) this.setExport(k, v);
        }, pilihan)
      : new SourceTextModule(await readFile(id, 'utf8'), pilihan);
    modul.set(id, m);
    return m;
  }
  const m = await buat(resolve(akar, jalur));
  await m.link(penghubung);
  await m.evaluate();
  return { ekspor: m.namespace, modul };
}
const path = (p) => resolve(akar, p);

async function lingkungan(pengganti = {}) {
  let pengguna = null;
  let pantau;
  const data = {
    ambilKoleksi: async () => [], ambilKonten: async () => null,
    ambilMilikSaya: async () => [], ambilSuara: async () => ({ hitung: [], milikSaya: null }),
    ambilPeran: async () => null, ambilProfilWarga: async () => null,
    ...pengganti
  };
  const hasil = await muat('src/keadaan/mulai.js', {
    [path('src/sumber/data.js')]: data,
    [path('src/sumber/akun.js')]: {
      penggunaSekarang: () => pengguna,
      pantauMasuk: (fn) => { pantau = fn; return () => {}; }
    },
    [path('src/keadaan/tampilan.js')]: { terapkanGaya: () => {} },
    [path('src/keadaan/pesan.svelte.js')]: { beriTahu: () => {} }
  });
  const keadaan = hasil.modul.get(path('src/keadaan/sesi.svelte.js')).namespace;
  const isi = hasil.modul.get(path('src/keadaan/isi.svelte.js')).namespace;
  hasil.ekspor.mulaiPantauan();
  return {
    ...keadaan, ...isi, ...hasil.ekspor,
    masuk: (u) => { pengguna = u; return pantau(u); }
  };
}
const akun = (uid, emailVerified = true) => ({ uid, email: `${uid}@example.test`, displayName: uid, emailVerified });

test('warga, petugas, dan master mendapatkan tampilan peran yang sesuai', async () => {
  for (const peran of [null, 'petugas', 'master']) {
    const l = await lingkungan({ ambilPeran: async () => peran });
    await l.masuk(akun('uji'));
    assert.equal(l.sesi.peran, peran);
    assert.equal(l.pengurus(), peran !== null);
    assert.equal(l.namaPeran(), peran === 'master' ? 'Master Admin' : peran === 'petugas' ? 'Petugas' : 'Warga');
  }
});

test('email belum terverifikasi tidak boleh mengambil peran pengurus', async () => {
  let dibaca = false;
  const l = await lingkungan({ ambilPeran: async () => { dibaca = true; return 'master'; } });
  await l.masuk(akun('belum', false));
  assert.equal(dibaca, false);
  assert.equal(l.pengurus(), false);
  assert.equal(l.sesi.terverifikasi, false);
});

test('kegagalan baca peran menutup akses pengurus', async () => {
  const l = await lingkungan({ ambilPeran: async () => { throw new Error('offline'); } });
  await l.masuk(akun('uji'));
  assert.equal(l.pengurus(), false);
  assert.equal(l.sesi.siap, true);
});

test('keluar menghapus seluruh data pribadi yang sudah termuat', async () => {
  const l = await lingkungan();
  await l.masuk(akun('lama'));
  for (const k of ['surat', 'reservasi', 'usaha_baru', 'pengaduan_kontak', 'warga', 'pengurus']) l.isi[k] = [{ rahasia: true }];
  l.isi.suara = { milikSaya: '1' };
  await l.masuk(null);
  assert.equal(l.sesi.pengguna, null);
  for (const k of ['surat', 'reservasi', 'usaha_baru', 'pengaduan_kontak', 'warga', 'pengurus', 'suara']) assert.equal(l.isi[k], null);
});

test('hasil peran sesi lama tidak boleh menghidupkan kembali akses setelah keluar', async () => {
  const tunggu = jeda();
  const l = await lingkungan({ ambilPeran: () => tunggu.janji });
  const proses = l.masuk(akun('lama'));
  await l.masuk(null);
  tunggu.selesai('master');
  await proses;
  assert.equal(l.sesi.peran, null);
  assert.equal(l.sesi.pengguna, null);
});

test('pergantian akun mengabaikan profil warga yang terlambat', async () => {
  const tunggu = jeda();
  const l = await lingkungan({
    ambilProfilWarga: (uid) => uid === 'lama'
      ? tunggu.janji
      : Promise.resolve({ nama: 'Baru' })
  });
  const proses = l.masuk(akun('lama'));
  await Promise.resolve();
  await l.masuk(akun('baru'));
  tunggu.selesai({ nama: 'Lama' });
  await proses;
  assert.equal(l.sesi.pengguna.uid, 'baru');
  assert.equal(l.sesi.profilWarga.nama, 'Baru');
});

test('permintaan data pengurus dan suara yang terlambat tidak mengisi sesi baru', async () => {
  const l = await lingkungan({ ambilPeran: async () => 'petugas' });
  await l.masuk(akun('petugas'));
  await l.masuk(null);
  assert.equal(l.sesi.pengguna, null);
  assert.equal(l.sesi.peran, null);
});

test('kiriman warga lama tidak ditampilkan pada akun berikutnya', async () => {
  const l = await lingkungan();
  await l.masuk(akun('lama'));
  await l.masuk(akun('baru'));
  assert.equal(l.sesi.pengguna.email, 'baru@example.test');
});

test('peran asing dan akun belum terverifikasi tidak membuka menu Kelola', async () => {
  const l = await lingkungan({ ambilPeran: async () => 'asing' });
  await l.masuk(akun('uji'));
  assert.equal(l.pengurus(), false);
});

async function sumberAkun(ganti = {}, pernahMasuk = true) {
  const auth = { currentUser: akun('uji', false), languageCode: null };
  const unduhan = { jumlah: 0 };
  const firebase = Object.fromEntries([
    'GoogleAuthProvider', 'signInWithPopup', 'signInWithEmailAndPassword',
    'createUserWithEmailAndPassword', 'sendEmailVerification', 'sendPasswordResetEmail',
    'updateProfile', 'signOut', 'onIdTokenChanged', 'reload', 'getIdToken', 'validatePassword'
  ].map((n) => [n, async () => {}]));
  firebase.validatePassword = async () => ({ isValid: true });
  firebase.getAuth = () => { unduhan.jumlah += 1; return auth; };
  Object.assign(firebase, ganti);

  const kotak = new Map();
  if (pernahMasuk) kotak.set('pernah-masuk', '1');
  const simpanan = {
    baca: (k) => (kotak.has(k) ? kotak.get(k) : null),
    tulis: (k, v) => kotak.set(k, v),
    hapus: (k) => kotak.delete(k)
  };

  const hasil = await muat('src/sumber/akun.js', {
    'firebase/auth': firebase,
    [path('src/sumber/firebase.js')]: { app: {} },
    [path('src/inti/peramban.js')]: { simpanan }
  });
  return { ...hasil.ekspor, auth, kotak, unduhan };
}

const tungguPintu = () => new Promise((r) => setTimeout(r, 30));

test('cek verifikasi memuat ulang akun sebelum memperbarui token server', async () => {
  const urutan = [];
  const l = await sumberAkun({
    reload: async (u) => { urutan.push('reload'); u.emailVerified = true; },
    getIdToken: async (u, paksa) => { assert.equal(paksa, true); assert.equal(u.emailVerified, true); urutan.push('token'); }
  });
  assert.equal(await l.periksaVerifikasi(), true);
  assert.deepEqual(urutan, ['reload', 'token']);
});

test('cek verifikasi tidak melanjutkan token akun yang sudah diganti', async () => {
  let token = false;
  let bertukar = () => {};
  const l = await sumberAkun({
    reload: async () => { bertukar(); },
    getIdToken: async () => { token = true; }
  });
  bertukar = () => { l.auth.currentUser = akun('baru'); };
  assert.equal(await l.periksaVerifikasi(), false);
  assert.equal(token, false);
});

test('email login dinormalisasi tanpa mengubah kata sandi', async () => {
  let diterima;
  const l = await sumberAkun({ signInWithEmailAndPassword: async (...args) => { diterima = args; } });
  await l.masukEmail('  UJI@Example.test  ', ' Sandi Tetap ');
  assert.equal(diterima[1], 'uji@example.test');
  assert.equal(diterima[2], ' Sandi Tetap ');
});

test('password baru minimal 15 karakter', async () => {
  const l = await sumberAkun();
  const cekPendek = await l.validasiKataSandi('terlalu pendek');
  assert.equal(cekPendek.valid, false);
  const cekPanjang = await l.validasiKataSandi('passphrase warga aman 2026');
  assert.equal(cekPanjang.valid, true);
});

test('akun yang sudah dibuat dibedakan dari kegagalan mengirim email verifikasi', async () => {
  const pengguna = akun('baru', false);
  const l = await sumberAkun({
    createUserWithEmailAndPassword: async () => ({ user: pengguna }),
    sendEmailVerification: async () => { throw new Error('jaringan terputus'); }
  });
  await assert.rejects(l.daftarAkun('baru@example.test', 'passphrase warga aman 2026', 'Nama'), {
    code: 'auth/verification-send-failed'
  });
});

test('reset password menyamarkan email yang tidak terdaftar', async () => {
  const l = await sumberAkun({
    sendPasswordResetEmail: async () => {
      const err = new Error('tidak ada');
      err.code = 'auth/user-not-found';
      throw err;
    }
  });
  await assert.doesNotReject(l.lupaSandi('tidakada@example.test'));
});

test('penyegaran token rutin tidak mengulang sesi, perubahan verifikasi tetap diteruskan', async () => {
  let pantau;
  const l = await sumberAkun({ onIdTokenChanged: (auth, fn) => { pantau = fn; return () => {}; } });
  let jumlah = 0;
  l.pantauMasuk(() => { jumlah += 1; });
  await tungguPintu();
  await pantau(l.auth.currentUser);
  await pantau(l.auth.currentUser);
  assert.equal(jumlah, 1);
  l.auth.currentUser.emailVerified = true;
  await pantau(l.auth.currentUser);
  assert.equal(jumlah, 2);
});

test('peramban yang belum pernah dipakai masuk tidak mengunduh pustaka masuk', async () => {
  const l = await sumberAkun({}, false);
  let jumlah = 0;
  l.pantauMasuk(() => { jumlah += 1; });
  assert.equal(l.unduhan.jumlah, 0);
  assert.equal(jumlah, 1);
});

test('peramban yang pernah dipakai masuk mengunduh pustakanya dan memasang pemantauan', async () => {
  let terpasang = 0;
  const l = await sumberAkun({ onIdTokenChanged: () => { terpasang += 1; return () => {}; } }, true);
  l.pantauMasuk(() => {});
  await tungguPintu();
  assert.equal(terpasang, 1);
});

test('penanda dipasang saat masuk dan dicabut saat keluar', async () => {
  let pantau;
  const l = await sumberAkun({ onIdTokenChanged: (auth, fn) => { pantau = fn; return () => {}; } }, true);
  l.pantauMasuk(() => {});
  await tungguPintu();
  await pantau(akun('masuk'));
  assert.equal(l.kotak.get('pernah-masuk'), '1');
  await pantau(null);
  assert.equal(l.kotak.has('pernah-masuk'), false);
});

test('halaman berakun memulihkan sesi walau penandanya hilang', async () => {
  const l = await sumberAkun({}, false);
  assert.equal(l.unduhan.jumlah, 0);
  await l.siapkanAkun();
  assert.equal(l.unduhan.jumlah, 1);
});

test('berhenti memantau sebelum pustakanya selesai diunduh tidak memasang apa pun', async () => {
  const l = await sumberAkun({}, false);
  const lepas = l.pantauMasuk(() => {});
  lepas();
  await l.siapkanAkun();
  await tungguPintu();
  assert.equal(l.unduhan.jumlah, 1);
});
