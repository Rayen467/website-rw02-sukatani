import admin from 'firebase-admin';

const raw = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GCP_SA_KEY || '';
if (!raw) throw new Error('Service account Firebase tidak tersedia.');
const serviceAccount = JSON.parse(raw);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount), projectId: 'perumahansukatanirw02' });
const db = admin.firestore();

const koleksi = [
  'pengumuman','galeri','program','kas','usaha','pengaduan','surat','reservasi','usaha_baru',
  'warga','bansos_penerima','jenis_surat','fasilitas','fasum','rutin','forum_topik','forum_komentar','usaha_admin'
];

const statusRef = db.collection('konten').doc('demo_status');
const statusSnap = await statusRef.get();
const status = statusSnap.exists ? statusSnap.data() : {};
const kontenDibuat = String(status?.kontenDibuat || '').split(',').map(s => s.trim()).filter(Boolean);

let dihapus = 0;
for (const nama of koleksi) {
  const snap = await db.collection(nama).get();
  let batch = db.batch();
  let n = 0;
  for (const doc of snap.docs) {
    if (!doc.id.startsWith('demo-')) continue;
    batch.delete(doc.ref);
    n++;
    dihapus++;
    if (n >= 400) { await batch.commit(); batch = db.batch(); n = 0; }
  }
  if (n) await batch.commit();
}

for (const id of kontenDibuat) {
  const ref = db.collection('konten').doc(id);
  const snap = await ref.get();
  if (snap.exists && String(snap.data()?.demo || '') === 'true') {
    await ref.delete();
    dihapus++;
  }
}

if (statusSnap.exists) {
  await statusRef.delete();
  dihapus++;
}

console.log(`Pembersihan selesai. ${dihapus} dokumen demo dihapus. Data non-demo tidak disentuh.`);
