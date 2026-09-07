import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simpanDrafSurat, ambilDrafSurat, hapusDrafSurat } from '../src/inti/draf-surat.js';

test('draf cetak hanya terbaca oleh UID dan jenis surat pemiliknya', () => {
  simpanDrafSurat('pemilik', { jenis: 'domisili', nama: 'Data uji', nik: '1234567890123456' });
  assert.equal(ambilDrafSurat('pemilik', 'domisili').nama, 'Data uji');
  assert.equal(ambilDrafSurat('orang-lain', 'domisili'), null);
  assert.equal(ambilDrafSurat(null, 'domisili'), null);
  assert.equal(ambilDrafSurat('pemilik', 'usaha'), null);
});

test('draf dibersihkan ketika sesi berakhir dan data lama tidak dibaca', () => {
  const dihapus = [];
  globalThis.localStorage = { removeItem: (kunci) => dihapus.push(kunci) };
  simpanDrafSurat('pemilik', { jenis: 'domisili', nama: 'Data uji' });
  hapusDrafSurat();
  assert.equal(ambilDrafSurat('pemilik', 'domisili'), null);
  assert.deepEqual(dihapus, ['surat-terakhir']);
  delete globalThis.localStorage;
});

test('penyimpanan draf tidak menulis NIK ke penyimpanan browser', () => {
  globalThis.localStorage = { setItem: () => { throw new Error('Tidak boleh ditulis'); } };
  assert.doesNotThrow(() => simpanDrafSurat('pemilik', { jenis: 'domisili', nik: '1234567890123456' }));
  delete globalThis.localStorage;
});
