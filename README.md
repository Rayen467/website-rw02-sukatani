# Situs Warga RW 02 Perum Permai Sukatani

Situs informasi warga. Svelte 5 + Vite, datanya di Firebase.

**Live:** https://rayen467.github.io/website-rw02-sukatani/

Seluruh isi situs diatur pengurus lewat halaman **Kelola** di situsnya
langsung — berita, foto, kas, nomor pengurus, jenis surat, bahkan warna dan
huruf. Tidak ada yang perlu menyentuh kode untuk mengubah apa yang tampil.

---

## Buat yang mau ngoding

Baca **[PANDUAN.md](PANDUAN.md)** dulu. Isinya aturan susunan kode dan
resep untuk hal yang paling sering diminta.

```bash
npm install
npm run dev
```

---

## Susunan berkas

Empat lapis. Impor hanya boleh mengarah ke bawah, dan itu diperiksa mesin
lewat `npm run periksa`.

```
src/
├── main.js                     titik mulai
├── App.svelte                  memilih halaman mana yang tampil
│
├── inti/                       LAPIS 1 — tidak mengimpor apa pun
│   ├── nama.js                 semua nama koleksi dan alamat halaman
│   ├── bawaan.js               isi awal situs + susunan menu
│   ├── format.js               rupiah, tanggal, slug
│   └── peramban.js             penyimpanan lokal, papan klip, kecilkan foto
│
├── sumber/                     LAPIS 2 — satu-satunya yang bicara ke server
│   ├── firebase.js             sambungan + terjemahan pesan galat
│   ├── akun.js                 masuk, daftar, keluar, lupa sandi
│   └── data.js                 semua perintah baca dan tulis
│
├── keadaan/                    LAPIS 3 — data yang sedang di layar
│   ├── sesi.svelte.js          siapa yang sedang masuk
│   ├── isi.svelte.js           isi situs yang sudah dimuat
│   ├── pesan.svelte.js         pemberitahuan sekilas
│   ├── rute.svelte.js          halaman mana yang terbuka
│   ├── tampilan.js             warna dan huruf yang diatur pengurus
│   └── mulai.js                menyalakan situs, memantau Firebase
│
├── komponen/                   LAPIS 4 — bagian tampilan yang dipakai ulang
├── halaman/                    LAPIS 4 — satu berkas satu halaman
│   └── kelola/                 halaman pengurus, satu berkas per tab
│
└── gaya/                       CSS, satu berkas per bagian
    ├── global.css              daftar isi, urutannya penting
    ├── token.css               SEMUA WARNA ada di sini
    ├── dasar.css               tipografi dan tautan
    ├── kepala.css              menu atas
    ├── kerangka.css            lebar dan jarak
    ├── kartu.css               kartu, tombol, borang
    ├── bagian.css              kalender, galeri, polling, surat
    ├── kaki.css                kaki halaman
    └── layar-kecil.css         tampilan HP — harus tetap paling bawah

alat/
└── periksa-arsitektur.mjs      penjaga aturan susunan, ikut jalan saat build
```

---

## Perintah

```bash
npm run dev        jalankan di komputer sendiri
npm run periksa    periksa susunan kode
npm run build      periksa lalu bangun ke folder dist/
npm run preview    lihat hasil build
```

---

## Unggah

Sudah otomatis. Setiap `git push` ke `main`, GitHub Actions memeriksa,
membangun, lalu mengunggah. Tidak ada langkah manual.

Pemeriksaan arsitektur ikut jalan di sana. Kode yang melanggar susunan
lapis tidak akan sampai ke situs.

---

## Tiga aktor

| | Warga | Petugas | Master Admin |
|---|---|---|---|
| Baca isi situs | ✓ | ✓ | ✓ |
| Kirim pengaduan, surat, pinjam fasilitas | ✓ | ✓ | ✓ |
| Lacak kiriman sendiri | ✓ | ✓ | ✓ |
| Mengisi seluruh isi situs | — | ✓ | ✓ |
| Menangani kiriman warga | — | ✓ | ✓ |
| Mengatur daftar pengurus | — | ✓ | ✓ |

Petugas dan Master Admin berkewenangan **sama persis**; peran hanya
penanda jabatan yang tampil di layar. Satu-satunya pengaman: tidak ada
yang bisa mencabut hak akses dirinya sendiri.

Pendaftaran akun hanya untuk warga. Hak pengurus tidak pernah diperoleh
lewat pendaftaran — hanya pengurus yang sudah menjabat yang dapat
memberikannya, lewat halaman Kelola.

---

## Catatan yang perlu diingat

**Foto disimpan di Firestore, bukan penyimpanan berkas terpisah.** Foto
dikecilkan di perangkat sampai di bawah 700 KB sebelum dikirim. Ini menjaga
situs tetap di paket Firebase tanpa biaya. Kalau nanti fotonya sudah
puluhan, yang perlu diganti cuma `src/inti/peramban.js` dan pemanggilnya.

**Data pribadi.** Nomor induk kependudukan hanya tersimpan pada pengajuan
surat dan tidak pernah ditampilkan di halaman mana pun, termasuk halaman
pengurus. Nama dan nomor pelapor pengaduan disimpan di koleksi terpisah
(`pengaduan_kontak`) supaya tidak ikut terbaca warga lain.

**Aturan Firestore.** Berkas `firestore.rules` di folder ini yang berlaku.
Kalau diubah, tempel isinya ke konsol Firebase — mengubah berkasnya saja
tidak berpengaruh apa-apa.
