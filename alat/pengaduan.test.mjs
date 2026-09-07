import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createContext, SourceTextModule, SyntheticModule } from 'node:vm';
import { KOLEKSI } from '../src/inti/nama.js';

const jeda = () => {
  let selesai;
  const janji = new Promise((resolve) => { selesai = resolve; });
  return { janji, selesai };
};

// Jalankan handler produksi dengan dependency tiruan. Ini bukan uji render
// Svelte: script instance yang sama diuji untuk urutan tulis dan pergantian akun.
async function borang(tulisLaporan, tulisKontak = async () => {}) {
  const sesi = { pengguna: { uid: 'warga-a' } };
  const kontak = [], pesan = [], tiket = [], laporan = [];
  const tiruan = {
    '../inti/nama.js': { KOLEKSI },
    '../keadaan/isi.svelte.js': { isi: { pengaduan: [] }, muatKoleksi: () => {} },
    '../keadaan/pesan.svelte.js': { beriTahu: (p) => pesan.push(p) },
    '../keadaan/sesi.svelte.js': { sesi },
    '../inti/bawaan.js': { KATEGORI_PENGADUAN: ['Kebersihan'] },
    '../inti/peramban.js': {
      nomorAntrean: () => 'ADU-UJI',
      simpanan: { baca: () => '', tulis: (...args) => tiket.push(args) }
    },
    '../sumber/data.js': {
      kirimWarga: (koleksi, data) => { laporan.push(data); return tulisLaporan(); },
      tambahIsi: (koleksi, data) => { kontak.push(data); return tulisKontak(); }
    },
    '../sumber/firebase.js': { pesanRamah: () => 'Galat uji' },
    '../komponen/Lencana.svelte': { default: null },
    '../komponen/Kosong.svelte': { default: null }
  };
  const sumber = await readFile(new URL('../src/halaman/Pengaduan.svelte', import.meta.url), 'utf8');
  const script = sumber.match(/<script>([\s\S]*?)<\/script>/)[1];
  const context = createContext({ console, $state: (v) => v, $derived: (v) => v });
  const modul = new SourceTextModule(script + '\nexport { kirim }; export function isianUji(v) { form = { ...form, ...v }; }', { context });
  await modul.link((id) => {
    assert.ok(tiruan[id], `Dependency pengaduan belum dimodelkan: ${id}`);
    const nilai = tiruan[id];
    return new SyntheticModule(Object.keys(nilai), function () {
      for (const [k, v] of Object.entries(nilai)) this.setExport(k, v);
    }, { context });
  });
  await modul.evaluate();
  return {
    sesi, kontak, laporan, pesan, tiket,
    isian: modul.namespace.isianUji,
    kirim: () => modul.namespace.kirim({ preventDefault() {} })
  };
}

test('penggantian akun setelah laporan tersimpan tidak menulis kontak atas nama akun baru', async () => {
  const tunggu = jeda();
  const b = await borang(() => tunggu.janji);
  b.isian({ isi: 'Laporan uji', nama: 'Warga A', wa: '000' });
  const proses = b.kirim();
  b.sesi.pengguna = { uid: 'warga-b' };
  tunggu.selesai();
  await proses;
  assert.equal(b.laporan.length, 1);
  assert.equal(b.kontak.length, 0);
  assert.equal(b.pesan.length, 0);
  assert.equal(b.tiket.length, 0);
});

test('kontak memakai salinan isian saat kirim dan klik ganda tidak membuat laporan kedua', async () => {
  const tunggu = jeda();
  const b = await borang(() => tunggu.janji);
  b.isian({ isi: 'Laporan awal', nama: 'Warga A', wa: '000' });
  const proses = b.kirim();
  b.isian({ isi: 'Diedit saat menunggu', nama: 'Nama lain', wa: '999' });
  await b.kirim();
  tunggu.selesai();
  await proses;
  assert.equal(b.laporan.length, 1);
  assert.equal(b.laporan[0].isi, 'Laporan awal');
  assert.equal(b.kontak[0].nama, 'Warga A');
  assert.equal(b.kontak[0].wa, '000');
  assert.equal(b.kontak[0].uid, 'warga-a');
  assert.equal(b.tiket.length, 1);
});

test('pengaduan anonim yang sedang dikirim tidak dikaitkan ke akun yang baru masuk', async () => {
  const tunggu = jeda();
  const b = await borang(() => tunggu.janji);
  b.sesi.pengguna = null;
  b.isian({ isi: 'Laporan anonim', wa: '000' });
  const proses = b.kirim();
  b.sesi.pengguna = { uid: 'warga-b' };
  tunggu.selesai();
  await proses;
  assert.equal(b.kontak.length, 0);
  assert.equal(b.tiket.length, 0);
});

test('hasil kontak yang terlambat tidak menampilkan tiket pada sesi lain', async () => {
  const tunggu = jeda();
  const b = await borang(async () => {}, () => tunggu.janji);
  b.isian({ isi: 'Laporan uji', wa: '000' });
  const proses = b.kirim();
  await new Promise(setImmediate);
  assert.equal(b.kontak[0].uid, 'warga-a');
  b.sesi.pengguna = null;
  tunggu.selesai();
  await proses;
  assert.equal(b.tiket.length, 0);
  assert.equal(b.pesan.length, 0);
});
