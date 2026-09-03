# Panduan Ngoding — Situs Warga RW 02

Dibaca sebelum menyentuh kode. Isinya bukan teori, tapi cara mengerjakan
hal-hal yang paling sering diminta.

> **Pengurus RW tidak perlu membaca berkas ini.** Seluruh isi situs diatur
> lewat halaman Kelola di situsnya langsung. Berkas ini untuk tim yang
> mengubah kodenya.

---

## 1. Satu aturan yang menjelaskan semuanya

Kode dibagi jadi empat lapis. **Impor hanya boleh mengarah ke bawah.**

```
    ┌──────────────────────────────────────────────────┐
    │  halaman/   komponen/        ← yang dilihat orang │  lapis 4
    └────────────────────┬─────────────────────────────┘
                         │ boleh impor
    ┌────────────────────▼─────────────────────────────┐
    │  keadaan/            ← data yang sedang di layar  │  lapis 3
    └────────────────────┬─────────────────────────────┘
                         │ boleh impor
    ┌────────────────────▼─────────────────────────────┐
    │  sumber/             ← satu-satunya yang bicara   │  lapis 2
    │                        ke server Firebase         │
    └────────────────────┬─────────────────────────────┘
                         │ boleh impor
    ┌────────────────────▼─────────────────────────────┐
    │  inti/               ← nama, angka, dan rumus     │  lapis 1
    │                        yang tidak butuh apa pun   │
    └──────────────────────────────────────────────────┘
```

Panah tidak pernah menunjuk ke atas. `inti/` tidak boleh tahu apa itu
halaman. `sumber/` tidak boleh tahu apa itu layar.

**Kenapa repot begini?** Karena kalau boleh saling impor, satu tahun lagi
tidak ada yang bisa mengubah apa pun tanpa merusak yang lain. Dengan aturan
ini, mengubah satu halaman DIJAMIN tidak merusak halaman lain — bukan
karena hati-hati, tapi karena secara susunan memang tidak bisa.

**Aturan ini diperiksa mesin, bukan diingat orang:**

```bash
npm run periksa
```

Pemeriksaan ini juga ikut jalan setiap `npm run build` dan setiap kode
diunggah ke GitHub. Kode yang melanggar tidak akan pernah sampai ke situs.

---

## 2. Isi tiap folder

| Folder | Isinya | Boleh impor dari |
|---|---|---|
| `src/inti/` | nama koleksi, isi bawaan, rumus format, fungsi peramban | — |
| `src/sumber/` | sambungan Firebase, masuk/daftar, baca/tulis data | `inti/` |
| `src/keadaan/` | data yang sedang di layar, rute, tema | `inti/`, `sumber/` |
| `src/komponen/` | bagian tampilan yang dipakai berulang | semua di atasnya |
| `src/halaman/` | satu berkas satu halaman | semua di atasnya |
| `src/gaya/` | CSS, dipecah per bagian | — |
| `alat/` | skrip pemeriksa, tidak ikut ke situs | — |

Berkas yang paling sering dibuka:

```
src/inti/nama.js              semua nama koleksi dan alamat halaman
src/inti/bawaan.js            isi awal + susunan menu
src/sumber/data.js            semua perintah baca-tulis ke server
src/keadaan/isi.svelte.js     daftar data apa saja yang dipegang situs
src/gaya/token.css            semua warna
```

---

## 3. Resep

### Menambah halaman baru

1. Buat `src/halaman/NamaHalaman.svelte`
2. Daftarkan alamatnya di `JALUR`, di `src/inti/nama.js`
3. Tambahkan cabangnya di `src/App.svelte`
4. Kalau mau muncul di menu atas, tambahkan barisnya di `MENU`,
   di `src/inti/bawaan.js`

### Menambah jenis data baru (koleksi Firestore baru)

Empat langkah, tiga di antaranya di berkas yang sama:

1. `src/inti/nama.js` → tambahkan namanya di `KOLEKSI`
2. `src/inti/nama.js` → masukkan ke `KOLEKSI_UMUM` (boleh dibaca warga)
   atau `KOLEKSI_PENGURUS` (hanya pengurus)
3. `src/inti/nama.js` → **kalau isinya tidak punya kolom `dibuat`**,
   masukkan juga ke `TANPA_URUTAN`
4. `src/keadaan/isi.svelte.js` → tambahkan barisnya di daftar `isi`, isi `null`

Terakhir, tambahkan aturannya di `firestore.rules` dan pasang di konsol
Firebase. Tanpa itu, servernya menolak.

> **Langkah 3 paling sering kelupaan.** Koleksi tanpa kolom `dibuat` yang
> ikut diurutkan akan mengembalikan **daftar kosong tanpa pesan galat apa
> pun.** Kalau data sudah ada di konsol Firebase tapi di situs tidak
> muncul, periksa `TANPA_URUTAN` duluan.

### Menyimpan sesuatu yang besar (berkas, foto)

Ada pola khusus, dan melanggarnya bikin situs lambat tanpa ada yang sadar.

**Jangan pernah menaruh isi base64 di koleksi yang ada di `KOLEKSI_UMUM`.**
Koleksi di daftar itu diambil PENUH setiap kali ada yang membuka situs.
Sepuluh PDF berukuran 500 KB berarti 5 MB terunduh oleh setiap pengunjung,
termasuk yang cuma mau baca pengumuman.

Polanya: pisah keterangan dari isinya, dua koleksi, id yang sama.

| Keterangan (ringan, dimuat di awal) | Isi (berat, diambil saat dibutuhkan) |
|---|---|
| `berkas` — judul, ukuran, jenis | `berkas_isi` — berkas base64 |
| `galeri` — judul album, sampul kecil | `galeri_foto` — foto ukuran penuh |

Yang berat diambil lewat `ambilDokumen()` atau `ambilCocok()` waktu tombol
ditekan, bukan lewat `muatKoleksi()`.

> **Menghapus harus mengurus keduanya.** Lihat `hapusBerkas()` dan
> `hapusAlbum()` di `src/sumber/data.js` — isinya dihapus DULUAN. Kalau
> urutannya dibalik dan langkah kedua gagal, isi yang tertinggal tidak
> muncul di layar mana pun tapi tetap memakan kuota, dan cuma bisa dibuang
> lewat konsol Firebase. Karena itu baris berkas dan album memakai
> `saatHapus` sendiri, bukan penghapus bawaan `BarisKelola`.

### Menambah kolom di halaman Kelola

1. Buka tab yang cocok di `src/halaman/kelola/`
2. Tambahkan isiannya di borang
3. Tampilkan di halaman yang membacanya dengan
   `kontenNilai(KONTEN.PROFIL, "namaKolom")`

Tidak perlu mengubah `sumber/data.js` — `simpanKonten` menyimpan kolom apa
pun yang diberikan.

### Mengubah warna atau tampilan

Jangan menulis warna langsung di halaman. Ubah tokennya di
`src/gaya/token.css`, dan **isi ketiga bloknya sekaligus**: terang,
`prefers-color-scheme: dark`, dan `[data-theme="dark"]`. Lupa satu berarti
ada tulisan yang hilang di sebagian layar.

### Menambah perintah baru ke server

Tulis fungsinya di `src/sumber/data.js`, lalu panggil dari halaman.
Jangan memanggil Firestore langsung dari halaman — pemeriksa akan menolak.

---

## 4. Cara menamai

Semua nama dalam bahasa Indonesia, termasuk nama kelas CSS. Ini disengaja:
yang melanjutkan situs ini kemungkinan besar mahasiswa KKN berikutnya, dan
`class="tabel-bungkus"` lebih cepat dipahami daripada `class="table-wrap"`.

Awalan fungsi di `sumber/data.js` punya arti tetap:

| Awalan | Artinya |
|---|---|
| `ambil…` | membaca, mengembalikan data |
| `kirim…` | warga menambah kiriman baru |
| `tambah…` | pengurus menambah isi situs |
| `simpan…` | menimpa satu dokumen |
| `ubah…` | mengubah sebagian kolom saja |
| `hapus…` | menghapus dokumen |
| `muat…` | mengambil ulang dari server ke layar (di `keadaan/`) |

---

## 5. Yang tidak boleh

**Menulis nama koleksi sebagai teks.**

```js
muatKoleksi("pengumuman");          // ditolak pemeriksa
muatKoleksi(KOLEKSI.PENGUMUMAN);    // benar
```

Firestore tidak pernah mengeluh kalau nama koleksi salah ketik. Hasilnya
cuma kosong, dan yang mengubah kode akan mengira datanya yang belum ada.
Itu jenis kesalahan yang paling lama dicari. `KOLEKSI.PENGUMUMAM` langsung
kelihatan karena nilainya `undefined`.

**Memanggil Firebase dari halaman.** Semua lewat `src/sumber/data.js`.

**Halaman mengimpor halaman lain.** Kalau ada tampilan yang dipakai dua
halaman, jadikan komponen di `src/komponen/`.

**Menaruh berita, kas, atau pengaduan karangan di `inti/bawaan.js`.**
Halaman yang belum diisi harus menampilkan keterangan kosong yang jujur.
Warga membaca situs ini untuk tahu keadaan sebenarnya.

**Melonggarkan `firestore.rules` supaya sesuatu jalan.** Pemeriksaan di
kode cuma mengatur apa yang tampil di layar; yang benar-benar menjaga data
adalah aturan di server.

---

## 6. Menjalankan

```bash
npm install
npm run dev
```

Buka alamat yang muncul, biasanya `http://localhost:5173`.

**Versi Node.** Pakai Node 22, sesuai isi `.nvmrc`. GitHub Actions membaca
berkas yang sama, jadi hasil di laptop dan hasil di server dijamin identik.
Kalau pakai nvm, cukup `nvm use` di folder ini.

Tidak perlu Docker. Situs ini statis dan tidak punya server sendiri; semua
versi paket sudah terkunci di `package-lock.json`, dan `npm ci` memasang
pohon yang sama persis di mesin mana pun.

Jangan membuka `index.html` dengan klik dua kali — Firebase menolak alamat
`file://`, jadi login tidak akan jalan.

Sebelum push:

```bash
npm run build
```

Perintah ini menjalankan pemeriksa dulu, baru membangun. Kalau lolos di
komputer sendiri, dijamin lolos juga di GitHub.

---

## 7. Kalau ada yang tidak jalan

| Gejala | Periksa duluan |
|---|---|
| Data ada di Firebase, tidak muncul di situs | `TANPA_URUTAN` di `inti/nama.js` |
| "Ditolak aturan keamanan" | `firestore.rules` sudah dipasang di konsol? |
| Login ditolak terus | alamat situs sudah didaftarkan di Authorized domains? |
| Menu Kelola tidak muncul | email sudah dipastikan lewat tautan? |
| Warna aneh di tampilan gelap | ada token yang cuma diisi di satu blok `token.css` |
| Tampilan HP rusak | `layar-kecil.css` harus tetap paling bawah di `global.css` |
