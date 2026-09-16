import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "./firebase.js";

const storage = getStorage(app);
export const BATAS_VIDEO_MB = 100;
export const BATAS_VIDEO_BYTE = BATAS_VIDEO_MB * 1024 * 1024;

function namaAman(nama) {
  const dasar = String(nama || "video")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(-120);
  return dasar || "video";
}

function idAcak() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function periksaVideo(berkas) {
  if (!berkas) throw new Error("Pilih file video terlebih dahulu.");
  if (!String(berkas.type || "").startsWith("video/")) {
    throw new Error("File yang dipilih bukan video.");
  }
  if (berkas.size > BATAS_VIDEO_BYTE) {
    throw new Error(`Ukuran video maksimal ${BATAS_VIDEO_MB} MB.`);
  }
  return true;
}

export async function unggahVideoKegiatan(berkas, saatKemajuan = () => {}) {
  periksaVideo(berkas);
  const jalur = `video-kegiatan/${Date.now()}-${idAcak()}-${namaAman(berkas.name)}`;
  const acuan = ref(storage, jalur);
  const tugas = uploadBytesResumable(acuan, berkas, {
    contentType: berkas.type || "video/mp4",
    customMetadata: { jenis: "video-kegiatan" }
  });

  await new Promise((selesai, gagal) => {
    tugas.on(
      "state_changed",
      (cuplikan) => {
        const total = Number(cuplikan.totalBytes || 0);
        const terkirim = Number(cuplikan.bytesTransferred || 0);
        const persen = total > 0 ? Math.round((terkirim / total) * 100) : 0;
        saatKemajuan(Math.max(0, Math.min(100, persen)));
      },
      gagal,
      selesai
    );
  });

  const url = await getDownloadURL(tugas.snapshot.ref);
  return { url, jalur };
}

export async function hapusVideoKegiatan(jalur) {
  if (!jalur) return;
  await deleteObject(ref(storage, jalur));
}
