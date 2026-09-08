import test from "node:test";
import assert from "node:assert/strict";
import { faseUntukJam, labelFase, bagianWaktu, ZONA_WAKTU_RW } from "../src/inti/waktu.js";

test("batas fase waktu RW 02 tepat", () => {
  const kasus = [
    [0, "malam"],
    [4, "malam"],
    [5, "pagi"],
    [10, "pagi"],
    [11, "siang"],
    [14, "siang"],
    [15, "sore"],
    [17, "sore"],
    [18, "malam"],
    [23, "malam"]
  ];
  for (const [jam, fase] of kasus) assert.equal(faseUntukJam(jam), fase, "jam " + jam);
});

test("faseUntukJam aman untuk angka di luar 0-23", () => {
  assert.equal(faseUntukJam(24), "malam");
  assert.equal(faseUntukJam(29), "pagi");
  assert.equal(faseUntukJam(-1), "malam");
});

test("label fase konsisten", () => {
  assert.equal(labelFase("pagi"), "Pagi");
  assert.equal(labelFase("siang"), "Siang");
  assert.equal(labelFase("sore"), "Sore");
  assert.equal(labelFase("malam"), "Malam");
});

test("jam situs memakai zona Asia/Jakarta", () => {
  assert.equal(ZONA_WAKTU_RW, "Asia/Jakarta");

  // 2026-09-08 03:30 UTC = 10:30 WIB -> Pagi.
  const hasil = bagianWaktu(new Date("2026-09-08T03:30:00Z"));
  assert.equal(hasil.fase, "pagi");
  assert.equal(hasil.jam, "10:30");
  assert.match(hasil.tanggal, /8 September 2026/);
});

test("perpindahan 10:59 ke 11:00 WIB tanpa reload", () => {
  assert.equal(bagianWaktu(new Date("2026-09-08T03:59:00Z")).fase, "pagi");
  assert.equal(bagianWaktu(new Date("2026-09-08T04:00:00Z")).fase, "siang");
});
