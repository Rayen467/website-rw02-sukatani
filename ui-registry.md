# Pola komponen akun

Dicatat 2026-09-06 dari komponen yang sudah ada; perubahan autentikasi memakai
kelas dan token yang sama tanpa mengubah palet atau tipografi situs.

### Masuk, verifikasi email, dan status aktor

Berkas: src/halaman/Masuk.svelte, src/halaman/Akun.svelte,
src/halaman/kelola/TabOrang.svelte. Acuan: src/gaya/kartu.css dan dasar.css.

| Properti | Kelas / token |
| --- | --- |
| Panel informasi | `.catatan`, `--info-soft`, garis `--info`, teks `--tinta` |
| Verifikasi tertunda | `.catatan.awas`, `--action-soft`, garis `--action` |
| Panel | Radius 5px, padding 14px 17px, garis kiri 3px |
| Tombol utama | `.tombol.utama`, `--brand`, teks `--brand-ink` |
| Tombol sekunder | `.tombol`, `--permukaan`, garis `--garis`, teks `--tinta-2` |
| Tombol | Radius 4px, padding 8px 14px, 13.5px bobot 600 |
| Jarak tindakan | `.baris-tombol`, gap 9px |
| Fokus | `:focus-visible`, outline 2px `--action`, offset 2px |
| Hover utama | `--brand-2` |
| Teks petunjuk | `.petunjuk`, `.verifikasi`, `.catatan-borang` |

Tindakan asynchronous memakai `disabled` selama memproses. Status sesi awal
memakai `role="status"`. Tombol verifikasi mengikuti tombol utama; kirim ulang
mengikuti tombol sekunder. Tidak ada bayangan tambahan atau warna literal baru.
