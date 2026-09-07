import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  setLogLevel,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

// Tidak pernah memakai konfigurasi aplikasi, kredensial, atau proyek produksi.
// Berhenti sebelum membuat klien kalau emulator lokal tidak ditentukan.
const alamatEmulator = process.env.FIRESTORE_EMULATOR_HOST;
assert.match(alamatEmulator ?? '', /^(127\.0\.0\.1|localhost):\d+$/,
  'Jalankan npm run test:rules; pengujian hanya boleh mengakses emulator lokal.');
const [host, port] = alamatEmulator.split(':');
let lingkungan;
setLogLevel('silent');

const peran = (nilai, nama = 'Pengurus Uji') => ({
  nama, jabatan: 'Pengurus', peran: nilai,
});
const akun = (uid, email = `${uid}@contoh.test`, verified = true) =>
  lingkungan.authenticatedContext(uid, { email, email_verified: verified }).firestore();
const tanpaAkun = () => lingkungan.unauthenticatedContext().firestore();

const isiPublik = [
  'jadwal', 'polling', 'galeri', 'kas', 'program', 'usaha', 'konten',
  'pengurus_tampil', 'batas_rt', 'tautan', 'berkas', 'berkas_isi',
  'galeri_foto', 'jenis_surat', 'fasilitas', 'fasum', 'rutin', 'bansos',
];
const layananPrivat = ['surat', 'reservasi', 'usaha_baru'];
const permohonan = {
  surat: (uid) => ({
    jenis: 'Domisili', nama: 'Warga Uji', nik: '1234567890123456',
    alamat: 'Blok A', ttl: '', rt: '01', keperluan: '', wa: '',
    antrean: 'UJI-1', uid, status: 'baru', dibuat: serverTimestamp(),
  }),
  reservasi: (uid) => ({
    fasilitas: 'Balai warga', tanggal: '2026-09-06', jam: '09:00',
    acara: 'Pertemuan', nama: 'Warga Uji', wa: '', uid,
    status: 'baru', dibuat: serverTimestamp(),
  }),
  usaha_baru: (uid) => ({
    nama: 'Warung Uji', pemilik: 'Warga Uji', jenis: 'Makanan',
    produk: '', wa: '', alamat: '', uid, status: 'baru', dibuat: serverTimestamp(),
  }),
};

before(async () => {
  lingkungan = await initializeTestEnvironment({
    projectId: 'demo-rw02-aktor',
    firestore: {
      host, port: Number(port),
      rules: await readFile(new URL('../firestore.rules', import.meta.url), 'utf8'),
    },
  });
});

beforeEach(async () => {
  await lingkungan.clearFirestore();
  await lingkungan.withSecurityRulesDisabled(async (konteks) => {
    const db = konteks.firestore();
    const batch = writeBatch(db);
    for (const nilai of ['master', 'petugas']) {
      batch.set(doc(db, 'pengurus', `${nilai}@contoh.test`), peran(nilai));
    }
    batch.set(doc(db, 'pengurus', 'legacy@contoh.test'), {
      nama: 'Bootstrap lama', jabatan: 'Ketua RW',
    });
    for (const [id, nilai] of [['invalid', 'admin'], ['empty', ''], ['null', null]]) {
      batch.set(doc(db, 'pengurus', `${id}@contoh.test`), peran(nilai));
    }
    for (const uid of ['warga', 'tetangga']) {
      batch.set(doc(db, 'warga', uid), {
        nama: uid, blok: 'A', rt: '01', wa: '', email: `${uid}@contoh.test`,
        status: 'baru', dibuat: serverTimestamp(),
      });
      for (const koleksi of layananPrivat) {
        batch.set(doc(db, koleksi, uid), permohonan[koleksi](uid));
      }
      batch.set(doc(db, 'pengaduan', uid), {
        kategori: 'Lingkungan', isi: 'Laporan uji', lokasi: '', status: 'baru',
        catatan: '', tiket: uid, uid, dibuat: serverTimestamp(),
      });
      batch.set(doc(db, 'pengaduan_kontak', uid), {
        nama: uid, wa: '081234567890', tiket: uid, uid, dibuat: serverTimestamp(),
      });
    }
    for (const koleksi of isiPublik) {
      batch.set(doc(db, koleksi, 'uji'), { judul: 'Data publik uji' });
    }
    batch.set(doc(db, 'pengumuman', 'uji'), {
      judul: 'Pengumuman uji', isi: 'Isi', tipe: 'pengumuman', ringkas: '', tglText: '',
    });
    await batch.commit();
  });
});

after(async () => { await lingkungan?.cleanup(); });

for (const identitas of ['master', 'petugas', 'legacy']) {
  test(`${identitas}: dapat mengatur pengurus lain, layanan, dan seluruh isi situs`, async () => {
    const db = akun(identitas);
    const pengurusBaru = doc(db, 'pengurus', 'baru@contoh.test');
    await assertSucceeds(setDoc(pengurusBaru, peran('petugas')));
    await assertSucceeds(updateDoc(pengurusBaru, { peran: 'master' }));
    await assertSucceeds(deleteDoc(pengurusBaru));
    // Petugas juga boleh mencabut Master Admin lain: kedua jabatan setara.
    const lainnya = identitas === 'master' ? 'petugas' : 'master';
    await assertSucceeds(deleteDoc(doc(db, 'pengurus', `${lainnya}@contoh.test`)));
    await assertSucceeds(getDocs(collection(db, 'pengurus')));
    for (const koleksi of layananPrivat) {
      await assertSucceeds(getDocs(collection(db, koleksi)));
      await assertSucceeds(updateDoc(doc(db, koleksi, 'tetangga'), { status: 'proses' }));
    }
    await assertSucceeds(getDoc(doc(db, 'pengaduan_kontak', 'tetangga')));
    await assertSucceeds(updateDoc(doc(db, 'pengaduan', 'tetangga'), {
      status: 'selesai', catatan: 'Sudah ditangani',
    }));
    await assertSucceeds(updateDoc(doc(db, 'warga', 'tetangga'), { status: 'aktif' }));
    for (const koleksi of isiPublik) {
      const ref = doc(db, koleksi, 'uji');
      await assertSucceeds(updateDoc(ref, { judul: 'Diperbarui pengurus' }));
      await assertSucceeds(deleteDoc(ref));
      await assertSucceeds(setDoc(ref, { judul: 'Dibuat pengurus' }));
    }
    await assertSucceeds(updateDoc(doc(db, 'pengumuman', 'uji'), { judul: 'Judul baru' }));
  });

  test(`${identitas}: tidak dapat mencabut hak sendiri atau menulis peran/ID tidak sah`, async () => {
    const db = akun(identitas);
    await assertFails(deleteDoc(doc(db, 'pengurus', `${identitas}@contoh.test`)));
    await assertFails(setDoc(doc(db, 'pengurus', 'Baru@contoh.test'), peran('master')));
    for (const nilai of ['admin', '', null]) {
      await assertFails(setDoc(doc(db, 'pengurus', 'baru@contoh.test'), peran(nilai)));
      await assertFails(updateDoc(doc(db, 'pengurus', `${identitas}@contoh.test`), { peran: nilai }));
    }
    await assertFails(setDoc(doc(db, 'pengurus', 'baru@contoh.test'), {
      nama: 'Tanpa peran', jabatan: 'Pengurus',
    }));
  });
}

for (const identitas of ['master', 'petugas']) {
  test(`${identitas}: email token huruf campuran tetap dikenali dan terlindung dari pencabutan sendiri`, async () => {
    const db = akun(identitas, `${identitas.toUpperCase()}@Contoh.Test`);
    await assertSucceeds(updateDoc(doc(db, 'konten', 'uji'), { judul: 'Diubah' }));
    await assertSucceeds(getDoc(doc(db, 'pengurus', `${identitas}@contoh.test`)));
    await assertFails(deleteDoc(doc(db, 'pengurus', `${identitas}@contoh.test`)));
    const lainnya = identitas === 'master' ? 'petugas' : 'master';
    await assertSucceeds(updateDoc(doc(db, 'pengurus', `${lainnya}@contoh.test`), { jabatan: 'Sekretaris' }));
  });
}

test('ID pengurus huruf besar yang lama juga tidak dapat diperbarui', async () => {
  await lingkungan.withSecurityRulesDisabled(async (konteks) => {
    await setDoc(doc(konteks.firestore(), 'pengurus', 'Lama@contoh.test'), peran('petugas'));
  });
  await assertFails(updateDoc(doc(akun('master'), 'pengurus', 'Lama@contoh.test'), { nama: 'Nama baru' }));
});

for (const identitas of ['invalid', 'empty', 'null']) {
  test(`peran ${identitas}: dokumen ada tetapi tidak memberi hak pengurus`, async () => {
    const db = akun(identitas);
    await assertSucceeds(getDoc(doc(db, 'pengurus', `${identitas}@contoh.test`)));
    await assertFails(getDocs(collection(db, 'pengurus')));
    await assertFails(getDoc(doc(db, 'pengurus', 'master@contoh.test')));
    await assertFails(setDoc(doc(db, 'pengurus', 'baru@contoh.test'), peran('master')));
    await assertFails(updateDoc(doc(db, 'konten', 'uji'), { judul: 'Tidak sah' }));
    await assertFails(getDoc(doc(db, 'surat', 'tetangga')));
    await assertFails(getDoc(doc(db, 'pengaduan_kontak', 'tetangga')));
  });
}

test('warga tidak dapat memberi hak pada dirinya atau orang lain maupun membaca daftar pengurus', async () => {
  const db = akun('warga');
  const sendiri = await assertSucceeds(getDoc(doc(db, 'pengurus', 'warga@contoh.test')));
  assert.equal(sendiri.exists(), false);
  await assertFails(getDoc(doc(db, 'pengurus', 'master@contoh.test')));
  await assertFails(getDocs(collection(db, 'pengurus')));
  for (const email of ['warga@contoh.test', 'baru@contoh.test']) {
    await assertFails(setDoc(doc(db, 'pengurus', email), peran('master')));
  }
  await assertFails(updateDoc(doc(db, 'pengurus', 'master@contoh.test'), { peran: 'petugas' }));
  await assertFails(deleteDoc(doc(db, 'pengurus', 'master@contoh.test')));
  await assertFails(updateDoc(doc(db, 'konten', 'uji'), { judul: 'Tidak sah' }));
  await assertFails(updateDoc(doc(db, 'warga', 'warga'), { status: 'aktif' }));
});

test('warga hanya dapat melihat profil dan permohonan privat miliknya', async () => {
  const db = akun('warga');
  await assertSucceeds(getDoc(doc(db, 'warga', 'warga')));
  await assertFails(getDoc(doc(db, 'warga', 'tetangga')));
  await assertFails(getDocs(collection(db, 'warga')));
  for (const koleksi of layananPrivat) {
    await assertSucceeds(getDoc(doc(db, koleksi, 'warga')));
    await assertFails(getDoc(doc(db, koleksi, 'tetangga')));
    const hasil = await assertSucceeds(getDocs(query(collection(db, koleksi), where('uid', '==', 'warga'))));
    assert.equal(hasil.size, 1);
    await assertFails(getDocs(collection(db, koleksi)));
    await assertFails(updateDoc(doc(db, koleksi, 'warga'), { status: 'selesai' }));
  }
  await assertFails(getDoc(doc(db, 'pengaduan_kontak', 'tetangga')));
});

test('warga dapat mengirim permohonan sendiri tetapi tidak memakai UID tetangga', async () => {
  const db = akun('warga');
  for (const koleksi of layananPrivat) {
    const ref = doc(db, koleksi, 'baru');
    await assertFails(setDoc(ref, permohonan[koleksi]('tetangga')));
    await assertSucceeds(setDoc(ref, permohonan[koleksi]('warga')));
    await assertSucceeds(getDoc(ref));
  }
});

test('akun belum terverifikasi tidak mendapat hak pengurus atau akses layanan privat', async () => {
  for (const identitas of ['master', 'petugas', 'warga']) {
    const db = akun(identitas, `${identitas}@contoh.test`, false);
    await assertFails(getDoc(doc(db, 'pengurus', `${identitas}@contoh.test`)));
    await assertFails(getDocs(collection(db, 'pengurus')));
    await assertFails(setDoc(doc(db, 'pengurus', 'baru@contoh.test'), peran('master')));
    await assertFails(updateDoc(doc(db, 'konten', 'uji'), { judul: 'Tidak sah' }));
    await assertFails(getDoc(doc(db, 'warga', 'warga')));
    for (const koleksi of layananPrivat) {
      await assertFails(getDoc(doc(db, koleksi, 'warga')));
      await assertFails(setDoc(doc(db, koleksi, 'baru'), permohonan[koleksi](identitas)));
    }
  }
});

test('hak langsung hilang setelah dokumen pengurus dicabut', async () => {
  const db = akun('petugas');
  await assertSucceeds(updateDoc(doc(db, 'konten', 'uji'), { judul: 'Masih pengurus' }));
  await assertSucceeds(deleteDoc(doc(akun('master'), 'pengurus', 'petugas@contoh.test')));
  await assertFails(updateDoc(doc(db, 'konten', 'uji'), { judul: 'Sudah dicabut' }));
  await assertFails(getDoc(doc(db, 'surat', 'tetangga')));
});

test('pengunjung dapat membaca isi publik tetapi tidak mengubahnya atau mengakses data privat', async () => {
  const db = tanpaAkun();
  for (const koleksi of [...isiPublik, 'pengumuman', 'pengaduan']) {
    await assertSucceeds(getDocs(collection(db, koleksi)));
    await assertFails(setDoc(doc(db, koleksi, 'tidak-sah'), { judul: 'Tidak sah' }));
  }
  for (const koleksi of [...layananPrivat, 'warga', 'pengurus', 'pengaduan_kontak']) {
    await assertFails(getDocs(collection(db, koleksi)));
  }
});

test('pengaduan anonim tetap tersedia dan tidak dapat memalsukan UID orang lain', async () => {
  const db = tanpaAkun();
  const laporan = {
    kategori: 'Keamanan', isi: 'Laporan tanpa nama', lokasi: '', status: 'baru',
    catatan: '', tiket: 'ANONIM-UJI', uid: '', dibuat: serverTimestamp(),
  };
  await assertSucceeds(setDoc(doc(db, 'pengaduan', 'anonim'), laporan));
  await assertFails(setDoc(doc(db, 'pengaduan', 'palsu'), { ...laporan, uid: 'tetangga' }));
});
