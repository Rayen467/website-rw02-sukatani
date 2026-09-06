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

## Authentication dan pemetaan aktor

Firebase Authentication menyimpan identitas akun (UID, email, penyedia masuk,
dan status verifikasi email). Peran aplikasi tersimpan terpisah pada koleksi
Firestore `pengurus`, dengan ID dokumen berupa alamat email akun dalam huruf
kecil. Menambah dokumen pengurus tidak membuat pengguna Authentication.

- Warga: akun Authentication dengan email terverifikasi, tanpa dokumen pengurus.
  Profil pada `warga/{uid}` dibuat melalui Akun Saya; status awalnya `baru`.
- Petugas: akun dengan email terverifikasi dan dokumen `pengurus/{email}` berisi
  `nama`, `jabatan`, dan `peran: "petugas"`.
- Master Admin: seperti Petugas, dengan `peran: "master"`. Dokumen bootstrap
  lama tanpa kolom peran tetap dianggap Master Admin.

Petugas dan Master Admin tetap mempunyai kewenangan sama sesuai aturan proyek.
Jangan membuat atau memberikan akun berhak istimewa hanya berdasarkan nama
akun atau jumlah pengguna pada tangkapan layar; cocokkan email yang sebenarnya.
Akun dengan tanda `+` pada alamat email harus memakai alamat lengkap yang sama
pada Authentication dan ID dokumen pengurus.

Sesudah menekan tautan pemastian email, buka Akun Saya dan pilih **Saya sudah
verifikasi**. Aplikasi memuat ulang data pengguna dan token untuk aturan server.
Jika akun berhasil dibuat tetapi email gagal terkirim, gunakan **Kirim ulang
tautan**; tidak perlu mendaftar ulang.

Pengaturan konsol yang perlu dicocokkan dengan proyek yang benar:

1. Authentication → Sign-in method: Email/Password dan Google untuk dua cara
   masuk yang ditawarkan situs. Email link tidak digunakan oleh aplikasi ini.
2. Authentication → Settings → Authorized domains: domain situs produksi
   `rayen467.github.io`; domain pengembangan ditambahkan hanya bila diperlukan.
3. Authentication → Users: cocokkan email lengkap dan penyedia masuk. Akun yang
   hanya memakai Google masuk dengan tombol Google; jangan menganggap kata
   sandi Google sebagai kata sandi situs.
4. Firestore → Data → pengurus: cocokkan email, nama, jabatan, dan peran dengan
   pengurus yang memang ditunjuk. Daftar Authentication tidak menampilkan peran.
5. Firestore → Rules: pastikan aturan aktif sesuai `firestore.rules`.

Perubahan kode tidak mengubah pengguna, metode masuk, domain, atau aturan aktif
pada Firebase Console secara otomatis.

Uji regresi autentikasi: `npm test`. Pengujian memakai Firebase tiruan untuk
memastikan data/peran sesi lama tidak masuk ke sesi berikutnya. Pengujian ini
bukan pengganti pengujian login dan aturan Firebase produksi.
