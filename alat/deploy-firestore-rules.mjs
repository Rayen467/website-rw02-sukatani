import { readFile } from "node:fs/promises";
import { sign } from "node:crypto";

const project = process.argv[2] || process.env.FIREBASE_PROJECT || "perumahansukatanirw02";
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!credentialsPath) {
  throw new Error("GOOGLE_APPLICATION_CREDENTIALS belum disetel.");
}

const kredensial = JSON.parse(await readFile(credentialsPath, "utf8"));
if (!kredensial.client_email || !kredensial.private_key) {
  throw new Error("Service account JSON tidak memiliki client_email/private_key.");
}

function b64url(nilai) {
  return Buffer.from(nilai).toString("base64url");
}

async function aksesToken() {
  const sekarang = Math.floor(Date.now() / 1000);
  const kepala = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const isi = b64url(JSON.stringify({
    iss: kredensial.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    iat: sekarang,
    exp: sekarang + 3600
  }));
  const tanpaTanda = `${kepala}.${isi}`;
  const tanda = sign("RSA-SHA256", Buffer.from(tanpaTanda), kredensial.private_key).toString("base64url");
  const assertion = `${tanpaTanda}.${tanda}`;

  const respons = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });

  const data = await respons.json();
  if (!respons.ok || !data.access_token) {
    throw new Error(`Gagal memperoleh access token (${respons.status}): ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

async function api(token, url, opsi = {}) {
  const respons = await fetch(url, {
    ...opsi,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json; charset=utf-8",
      ...(opsi.headers || {})
    }
  });

  const teks = await respons.text();
  let data = null;
  try { data = teks ? JSON.parse(teks) : {}; } catch { data = { raw: teks }; }
  return { respons, data };
}

const token = await aksesToken();
const aturan = await readFile("firestore.rules", "utf8");

console.log(`Membuat ruleset Firestore untuk project ${project}...`);
const ruleset = await api(
  token,
  `https://firebaserules.googleapis.com/v1/projects/${encodeURIComponent(project)}/rulesets`,
  {
    method: "POST",
    body: JSON.stringify({
      source: {
        files: [{ name: "firestore.rules", content: aturan }]
      }
    })
  }
);

if (!ruleset.respons.ok || !ruleset.data?.name) {
  throw new Error(`Ruleset ditolak (${ruleset.respons.status}): ${JSON.stringify(ruleset.data)}`);
}

const rulesetName = ruleset.data.name;
const releaseName = `projects/${project}/releases/cloud.firestore`;
console.log(`Ruleset valid: ${rulesetName.split("/").at(-1)}. Memperbarui release cloud.firestore...`);

let rilis = await api(
  token,
  `https://firebaserules.googleapis.com/v1/projects/${encodeURIComponent(project)}/releases/cloud.firestore`,
  {
    method: "PATCH",
    body: JSON.stringify({
      release: { name: releaseName, rulesetName },
      updateMask: "rulesetName"
    })
  }
);

// Project Firestore baru mungkin belum memiliki named release tersebut.
if (rilis.respons.status === 404) {
  rilis = await api(
    token,
    `https://firebaserules.googleapis.com/v1/projects/${encodeURIComponent(project)}/releases`,
    {
      method: "POST",
      body: JSON.stringify({ name: releaseName, rulesetName })
    }
  );
}

if (!rilis.respons.ok) {
  throw new Error(`Release aturan gagal (${rilis.respons.status}): ${JSON.stringify(rilis.data)}`);
}

console.log("Deploy complete: Firestore Security Rules sudah dirilis.");
