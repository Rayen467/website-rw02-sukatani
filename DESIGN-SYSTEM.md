# Design System — RW 02 Sukatani

## Status

**WAJIB / LOCKED.** Aturan ini berlaku untuk seluruh halaman publik, halaman layanan, reservasi, surat, pengaduan, autentikasi, dashboard petugas, dan halaman admin.

Perubahan layout, warna, kartu, hero, animasi, atau struktur halaman **tidak boleh mengganti typography system** ini. Perubahan keluarga font hanya dilakukan jika ada keputusan eksplisit untuk mengganti design system.

## Typography resmi

### Sora — display / heading

Gunakan untuk:
- Hero title
- H1
- H2
- H3
- Judul kartu penting
- Headline CTA
- Angka/statistik besar

Weight utama:
- 700 untuk hero, H1, H2, statistik utama
- 600 untuk H3 dan judul kartu

### Poppins — body / UI

Gunakan untuk:
- Paragraf
- Navigasi
- Tombol
- Form dan label
- Deskripsi layanan
- Tabel
- Berita
- Tanggal/alamat
- Caption dan microcopy

Weight utama:
- 400 untuk body
- 500 untuk navigasi dan label
- 600 untuk tombol/aksi
- Hindari 300 agar teks tidak terlalu tipis

## Hierarki ukuran

| Fungsi | Font | Desktop | Mobile | Weight |
| --- | --- | ---: | ---: | ---: |
| Hero title | Sora | 48–52px | 34–38px | 700 |
| H1 | Sora | 40–44px | 30–34px | 700 |
| H2 | Sora | 30–34px | 25–28px | 700 |
| H3 | Sora | 21–24px | 19–21px | 600 |
| Card title | Sora | 17–19px | 16–18px | 600 |
| Lead text | Poppins | 17px | 16px | 400 |
| Body | Poppins | 15–16px | 14.5–15.5px | 400 |
| Navigation | Poppins | 14px | 14px | 500 |
| Button | Poppins | 14px | 14px | 600 |
| Label/Form | Poppins | 13–14px | 13–14px | 500 |
| Caption | Poppins | 12–13px | 12px | 400 |

## Prinsip penggunaan

1. Maksimal dua keluarga font: **Sora + Poppins**.
2. Jangan menambahkan font lain pada halaman atau komponen baru.
3. Jangan membuat semua teks bold. Target visual: mayoritas regular, sebagian medium, dan bold hanya untuk hirarki penting.
4. Body copy harus lega dan mudah dibaca; line-height sekitar 1.65–1.7.
5. Font system harus tetap konsisten ketika halaman di-redesign.
6. Implementasi final berada di `src/gaya/tipografi-wajib.css` dan dimuat sebagai style layer terakhir dari `src/main.js`.

## Ringkas

**Layout boleh berubah. Visual boleh berkembang. Komponen boleh diganti. Typography system tetap Sora + Poppins.**
