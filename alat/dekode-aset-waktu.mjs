import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const akar = process.cwd();
const sumber = path.join(akar, "aset-waktu-base64");
const tujuan = path.join(akar, "public", "visual", "waktu");

await mkdir(tujuan, { recursive: true });
const daftar = await readdir(sumber);
const kelompok = new Map();

for (const nama of daftar) {
  const cocok = nama.match(/^(hero|footer)-(pagi|siang|sore|malam)\.(\d+)\.b64$/);
  if (!cocok) continue;
  const kunci = `${cocok[1]}-${cocok[2]}`;
  if (!kelompok.has(kunci)) kelompok.set(kunci, []);
  kelompok.get(kunci).push({ urut: Number(cocok[3]), nama });
}

for (const [kunci, bagian] of kelompok) {
  bagian.sort((a, b) => a.urut - b.urut);
  let teks = "";
  for (const potong of bagian) {
    teks += (await readFile(path.join(sumber, potong.nama), "utf8")).trim();
  }
  const data = Buffer.from(teks, "base64");
  await writeFile(path.join(tujuan, `${kunci}.webp`), data);
  console.log(`aset waktu: ${kunci}.webp (${data.length} byte)`);
}


/* fallback build-safe: jangan biarkan mode waktu menampilkan background kosong
   bila satu aset belum tersedia di repo. Akan otomatis tertimpa saat aset asli
   dengan nama yang sama sudah ditambahkan. */
const fallback = {
  "hero-siang.webp": "hero-pagi.webp",
  "hero-sore.webp": "hero-pagi.webp",
  "footer-sore.webp": "footer-siang.webp"
};

for (const [tujuanNama, sumberNama] of Object.entries(fallback)) {
  const tujuanPath = path.join(tujuan, tujuanNama);
  try {
    await readFile(tujuanPath);
  } catch {
    const sumberPath = path.join(tujuan, sumberNama);
    const data = await readFile(sumberPath);
    await writeFile(tujuanPath, data);
    console.log(`fallback aset waktu: ${tujuanNama} <- ${sumberNama}`);
  }
}
