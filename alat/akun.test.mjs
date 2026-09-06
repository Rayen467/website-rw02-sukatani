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

// Menjalankan fungsi produksi dengan Firebase tiruan. $state dijadikan
// objek biasa: pengujian ini memeriksa isolasi sesi, bukan reaktivitas Svelte.
async function muat(jalur, tiruan = {}) {
  const konteks = createContext({ console, $state: (nilai) => nilai });
  const modul = new Map();
  async function buat(id) {
    if (modul.has(id)) return modul.get(id);
    const nilai = tiruan[id];
    const m = nilai
      ? new SyntheticModule(Object.keys(nilai), function () {
          for (const [k, v] of Object.entries(nilai)) this.setExport(k, v);
        }, { context: konteks, identifier: id })
      : new SourceTextModule(await readFile(id, 'utf8'), { context: konteks, identifier: id });
    modul.set(id, m);
    return m;
  }
  const m = await buat(resolve(akar, jalur));
  await m.link((specifier, induk) => buat(specifier.startsWith('.')
    ? resolve(dirname(induk.identifier), specifier) : specifier));
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
  const l = await lingkungan({ ambilProfilWarga: (uid) => uid === 'lama' ? tunggu.janji : Promise.resolve({ nama: 'Baru' }) });
  const proses = l.masuk(akun('lama'));
  await Promise.resolve();
  await l.masuk(akun('baru'));
  tunggu.selesai({ nama: 'Lama' });
  await proses;
  assert.equal(l.sesi.pengguna.uid, 'baru');
  assert.equal(l.sesi.profilWarga.nama, 'Baru');
});

test('permintaan data pengurus dan suara yang terlambat tidak mengisi sesi baru', async () => {
  const tunggu = jeda();
  const l = await lingkungan({ ambilKoleksi: () => tunggu.janji, ambilSuara: () => tunggu.janji });
  const proses = Promise.all([l.muatKoleksi('warga'), l.muatSuara()]);
  await l.masuk(null);
  tunggu.selesai([{ rahasia: true }]);
  await proses;
  assert.equal(l.isi.warga, null);
  assert.equal(l.isi.suara, null);
});

test('kiriman warga lama tidak ditampilkan pada akun berikutnya', async () => {
  const tunggu = jeda();
  const l = await lingkungan({ ambilMilikSaya: () => tunggu.janji });
  const proses = l.muatMilikSaya('lama');
  l.kosongkanIsiPribadi();
  tunggu.selesai([{ uid: 'lama' }]);
  await proses;
  assert.equal(l.isi.surat, null);
});

test('peran asing dan akun belum terverifikasi tidak membuka menu Kelola', async () => {
  const l = await lingkungan();
  l.sesi.peran = 'salah';
  assert.equal(l.pengurus(), false);
  l.sesi.peran = 'master';
  l.sesi.terverifikasi = false;
  assert.equal(l.pengurus(), false);
});

async function sumberAkun(ganti = {}) {
  const auth = { currentUser: akun('uji', false) };
  const firebase = Object.fromEntries([
    'GoogleAuthProvider', 'signInWithPopup', 'signInWithEmailAndPassword',
    'createUserWithEmailAndPassword', 'sendEmailVerification', 'sendPasswordResetEmail',
    'updateProfile', 'signOut', 'onIdTokenChanged', 'reload', 'getIdToken'
  ].map((n) => [n, async () => {}]));
  Object.assign(firebase, ganti);
  const hasil = await muat('src/sumber/akun.js', {
    'firebase/auth': firebase,
    [path('src/sumber/firebase.js')]: { auth }
  });
  return { ...hasil.ekspor, auth };
}

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
  const tunggu = jeda();
  let token = false;
  const l = await sumberAkun({ reload: () => tunggu.janji, getIdToken: async () => { token = true; } });
  const proses = l.periksaVerifikasi();
  l.auth.currentUser = akun('baru');
  tunggu.selesai();
  assert.equal(await proses, false);
  assert.equal(token, false);
});

test('email login dinormalisasi tanpa mengubah kata sandi', async () => {
  let diterima;
  const l = await sumberAkun({ signInWithEmailAndPassword: async (...args) => { diterima = args; } });
  await l.masukEmail('  UJI@Example.test  ', ' Sandi Tetap ');
  assert.equal(diterima[1], 'uji@example.test');
  assert.equal(diterima[2], ' Sandi Tetap ');
});

test('akun yang sudah dibuat dibedakan dari kegagalan mengirim email verifikasi', async () => {
  const pengguna = akun('baru', false);
  const l = await sumberAkun({
    createUserWithEmailAndPassword: async () => ({ user: pengguna }),
    sendEmailVerification: async () => { throw new Error('jaringan terputus'); }
  });
  await assert.rejects(l.daftarAkun('baru@example.test', 'kata sandi', 'Nama'), {
    code: 'auth/verification-send-failed'
  });
});

test('penyegaran token rutin tidak mengulang sesi, perubahan verifikasi tetap diteruskan', async () => {
  let pantau;
  const l = await sumberAkun({ onIdTokenChanged: (auth, fn) => { pantau = fn; return () => {}; } });
  let jumlah = 0;
  l.pantauMasuk(() => { jumlah += 1; });
  await pantau(l.auth.currentUser);
  await pantau(l.auth.currentUser);
  assert.equal(jumlah, 1);
  l.auth.currentUser.emailVerified = true;
  await pantau(l.auth.currentUser);
  assert.equal(jumlah, 2);
  await pantau(null);
  assert.equal(jumlah, 3);
});
