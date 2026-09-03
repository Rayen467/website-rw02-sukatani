# Situs Warga RW 02 Perum Permai Sukatani

Situs informasi warga. Dibangun dengan Svelte 5 dan Vite, datanya di Firebase.
Seluruh isi situs diatur pengurus lewat halaman Kelola — tidak ada yang perlu
menyentuh kode untuk mengubah apa pun yang tampil.

## Menjalankan di komputer sendiri

```bash
npm install
npm run dev
```

Buka alamat yang muncul di layar, biasanya `http://localhost:5173`.

Jangan membuka `index.html` dengan klik dua kali — Firebase menolak alamat
`file://`, jadi login tidak akan jalan.

## Menyiapkan berkas untuk diunggah

```bash
npm run build
```

Hasilnya ada di folder `dist/`. Isi folder itu yang diunggah ke hosting.

## Susunan berkas

```
src/
├── main.js               titik mulai
├── App.svelte            memilih halaman mana yang ditampilkan
│
├── lib/                  otak situs, tidak ada tampilan di sini
│   ├── firebase.js       satu-satunya berkas yang bicara ke server
│   ├── keadaan.svelte.js data bersama seluruh situs
│   ├── bawaan.js         isi awal dan susunan menu
│   ├── gaya.js           mesin tampilan yang bisa diatur pengurus
│   ├── rute.svelte.js    penunjuk halaman
│   └── bantu.js          fungsi kecil: rupiah, foto, salin teks
│
├── komponen/             bagian yang dipakai berulang
│   ├── Kepala.svelte     kepala halaman dan menu
│   ├── Kaki.svelte       kaki halaman
│   ├── Peta.svelte       peta Google
│   └── ...
│
├── halaman/              satu berkas untuk satu halaman
│   ├── Beranda.svelte
│   ├── Surat.svelte
│   ├── ...
│   └── kelola/           halaman pengurus, satu berkas per tab
│       ├── Kelola.svelte
│       ├── TabKiriman.svelte
│       └── ...
│
└── gaya/global.css       seluruh gaya situs
```

**Mau mengubah satu halaman?** Buka berkasnya di `src/halaman/`.
**Mau mengubah warna atau tata letak?** Buka `src/gaya/global.css`.
**Mau menambah halaman?** Buat berkasnya di `src/halaman/`, daftarkan di
`App.svelte`, lalu tambahkan ke menu di `src/lib/bawaan.js`.

## Mengunggah ke GitHub Pages

1. Buat repositori baru di GitHub, misalnya `website-rw02-sukatani`.

2. Dari folder ini:

```bash
git init
git add .
git commit -m "Situs warga RW 02 Perum Permai Sukatani"
git branch -M main
git remote add origin https://github.com/NAMA-ANDA/website-rw02-sukatani.git
git push -u origin main
```

3. Buat berkas `.github/workflows/deploy.yml` di repositori dengan isi:

```yaml
name: Unggah ke GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  bangun:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  unggah:
    needs: bangun
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.pasang.outputs.page_url }}
    steps:
      - id: pasang
        uses: actions/deploy-pages@v4
```

4. Di GitHub: **Settings → Pages → Source → GitHub Actions**.

5. Setiap `git push` ke `main` otomatis membangun ulang dan mengunggah.

## Setelah situs online — WAJIB

Alamat situs harus didaftarkan di Firebase, kalau tidak login akan ditolak:

```
console.firebase.google.com/project/perumahansukatanirw02/authentication/settings
```

Bagian **Authorized domains** → **Add domain** → masukkan
`NAMA-ANDA.github.io` (dan nanti alamat domain sendiri, kalau sudah dibeli).

## Aturan keamanan Firestore

Berkas `firestore.rules` di folder ini adalah aturan yang berlaku.
Kalau diubah, tempel isinya ke:

```
console.firebase.google.com/project/perumahansukatanirw02/firestore/rules
```

## Tiga aktor

| | Warga | Petugas | Master Admin |
|---|---|---|---|
| Baca isi situs | ✓ | ✓ | ✓ |
| Kirim pengaduan, surat, pinjam fasilitas | ✓ | ✓ | ✓ |
| Lacak kiriman sendiri | ✓ | ✓ | ✓ |
| Mengisi seluruh isi situs | — | ✓ | ✓ |
| Menangani kiriman warga | — | ✓ | ✓ |
| Mengatur daftar pengurus | — | ✓ | ✓ |

Petugas dan Master Admin berkewenangan sama persis; peran hanya penanda
jabatan yang tampil di layar. Satu-satunya pengaman: tidak ada yang bisa
mencabut hak akses dirinya sendiri.

Pendaftaran akun hanya untuk warga. Hak pengurus tidak pernah diperoleh
lewat pendaftaran — hanya pengurus yang sudah menjabat yang dapat
memberikannya, lewat halaman Kelola.

## Catatan penting

**Email wajib dipastikan.** Daftar pengurus berisi alamat email. Tanpa
kewajiban memastikan email, orang lain bisa mendaftar memakai alamat email
pengurus dan langsung mendapat akses penuh. Aturan Firestore menolak semua
tulisan sampai email dipastikan lewat tautan.

**Foto disimpan di Firestore, bukan penyimpanan terpisah.** Foto dikecilkan
di perangkat sampai di bawah 700 KB sebelum dikirim. Ini menjaga situs tetap
di paket Firebase tanpa biaya, dan tidak menambah langkah pengaturan.
Kalau nanti foto sudah puluhan, pertimbangkan pindah ke penyimpanan terpisah.

**Data pribadi.** Nomor induk kependudukan hanya tersimpan pada pengajuan
surat dan tidak pernah ditampilkan di halaman mana pun, termasuk halaman
pengurus. Nama dan nomor pelapor pengaduan disimpan terpisah dari isi
laporan supaya tidak ikut terbaca warga lain.
