/**
 * =====================================================================
 *  BACKEND "KOMPETENSI AUDITOR INVESTIGATIF"  (Google Apps Script)
 * =====================================================================
 *  Cara pakai singkat (panduan lengkap ada di README.md):
 *   1. Buka Google Sheets baru -> menu Ekstensi -> Apps Script
 *   2. Hapus isi editor, tempel seluruh isi file ini
 *   3. Ganti KATA_SANDI di bawah
 *   4. Pilih fungsi "setup" -> klik Jalankan (sekali saja)
 *   5. Terapkan -> Deployment baru -> Aplikasi web (Siapa saja) -> salin URL
 * =====================================================================
 */

// >>> GANTI kata sandi ini dengan milik Anda sendiri (jangan dibagikan sembarangan) <<<
const KATA_SANDI = "GANTI-KATA-SANDI-INI";

const JENJANG = ["Auditor Pertama", "Auditor Muda", "Auditor Madya", "Auditor Utama"];
const CATS = ["Kompetensi Dasar", "Pengetahuan Teknis", "Keterampilan Teknis", "Perilaku"];
const DEF_WEIGHTS = { "Kompetensi Dasar": 25, "Pengetahuan Teknis": 25, "Keterampilan Teknis": 35, "Perilaku": 15 };

const SHEET = { AUDITOR: "Auditor", NILAI: "Nilai", RENCANA: "Rencana", KOMP: "Kompetensi", BOBOT: "Bobot", REKAP: "Rekap" };
const HEAD = {
  Auditor: ["id", "nama", "nip", "unit", "jenjang", "tanggal", "penilai", "diperbarui"],
  Nilai: ["auditor_id", "kode", "nilai"],
  Rencana: ["auditor_id", "kode", "rencana"],
  Kompetensi: ["kode", "kategori", "nama", "indikator", "target_pertama", "target_muda", "target_madya", "target_utama"],
  Bobot: ["kategori", "bobot"],
  Rekap: ["nama", "unit", "jenjang", "tanggal", "dinilai", "capaian", "kesimpulan", "di_bawah_target"]
};

// Data awal kompetensi: [kode, kategori, nama, indikator, target Pertama, Muda, Madya, Utama]
const SEED_KOMP = [
  ["D1", "Kompetensi Dasar", "Integritas dan etika", "Menaati kode etik APIP dan ASN; membuat pernyataan bebas benturan kepentingan per penugasan; menjaga kerahasiaan informasi serta identitas pelapor/saksi.", 3, 4, 4, 5],
  ["D2", "Kompetensi Dasar", "Independensi dan objektivitas", "Independen dalam pikiran dan penampilan; tidak terpengaruh tekanan pihak yang diperiksa maupun pimpinan unit.", 3, 4, 4, 5],
  ["D3", "Kompetensi Dasar", "Kehati-hatian profesional dan skeptisisme", "Menerapkan due professional care dan skeptisisme profesional; menjunjung asas praduga tak bersalah.", 3, 3, 4, 5],
  ["D4", "Kompetensi Dasar", "Pemahaman tata kelola", "Memahami SPIP, manajemen risiko, tata kelola, peran APIP, dan regulasi sektor ketenagakerjaan objek penugasan.", 2, 3, 4, 5],
  ["P1", "Pengetahuan Teknis", "Peraturan tipikor, kerugian negara, TP/TGR", "Memahami peraturan tindak pidana korupsi, kerugian keuangan negara, dan mekanisme penyelesaian TP/TGR.", 2, 3, 4, 5],
  ["P2", "Pengetahuan Teknis", "Hukum disiplin ASN", "Memahami PP 94/2021 dan mekanisme penjatuhan hukuman disiplin.", 2, 3, 4, 5],
  ["P3", "Pengetahuan Teknis", "Hukum acara pidana dasar dan kewenangan APIP", "Memahami alat bukti, hukum acara pidana dasar, dan batas kewenangan APIP dibanding aparat penegak hukum.", 2, 3, 4, 5],
  ["P4", "Pengetahuan Teknis", "Pengadaan, keuangan, dan BMN", "Memahami pengadaan barang/jasa (Perpres 16/2018 dan perubahannya, swakelola, pedoman LKPP), pengelolaan keuangan, dan BMN.", 2, 3, 4, 4],
  ["P5", "Pengetahuan Teknis", "Skema dan pola fraud", "Memahami fraud tree ACFE: korupsi, penyalahgunaan aset, kecurangan laporan.", 2, 3, 4, 5],
  ["P6", "Pengetahuan Teknis", "WBS, gratifikasi, benturan kepentingan", "Memahami kerangka whistleblowing system, pengendalian gratifikasi, dan manajemen benturan kepentingan (KPK).", 2, 3, 4, 4],
  ["P7", "Pengetahuan Teknis", "Standar audit APIP dan pedoman investigasi", "Memahami SAIPI/AAIPI dan pedoman audit investigatif BPKP.", 2, 3, 4, 5],
  ["K1", "Keterampilan Teknis", "Intake dan triage pengaduan", "Menelaah pengaduan/informasi awal dan menentukan layak tidaknya ditindaklanjuti.", 2, 3, 4, 5],
  ["K2", "Keterampilan Teknis", "Hipotesis dan program audit investigatif", "Menyusun hipotesis dan program audit investigatif yang terarah.", 1, 3, 4, 5],
  ["K3", "Keterampilan Teknis", "Pengumpulan bukti dan chain of custody", "Mengumpulkan, mengamankan, dan menjaga chain of custody bukti, termasuk bukti elektronik.", 2, 3, 4, 5],
  ["K4", "Keterampilan Teknis", "Wawancara dan permintaan keterangan", "Menguasai teknik wawancara saksi, terlapor, dan ahli; menyusun berita acara.", 2, 3, 4, 5],
  ["K5", "Keterampilan Teknis", "Analisis dokumen, aliran dana, dan data", "Melakukan analisis dokumen, analisis aliran dana, pencocokan data, dan data analytics.", 2, 3, 4, 4],
  ["K6", "Keterampilan Teknis", "Penghitungan kerugian negara", "Menghitung indikasi kerugian negara secara wajar dan didukung bukti.", 1, 2, 4, 5],
  ["K7", "Keterampilan Teknis", "Kertas kerja dan laporan hasil investigasi", "Menyusun kertas kerja dan laporan yang objektif, lengkap, dan dapat dipertanggungjawabkan.", 2, 3, 4, 5],
  ["K8", "Keterampilan Teknis", "Komunikasi hasil, rekomendasi, dan tindak lanjut", "Menyampaikan hasil kepada pimpinan, memberi rekomendasi, memantau tindak lanjut, dan berkoordinasi dengan APH.", 1, 2, 3, 5],
  ["B1", "Perilaku", "Tahan tekanan dan berani", "Tahan tekanan dan berani menyampaikan temuan.", 2, 3, 4, 5],
  ["B2", "Perilaku", "Teliti, sistematis, berpikir kritis", "Bekerja teliti dan sistematis serta berpikir kritis.", 3, 3, 4, 4],
  ["B3", "Perilaku", "Komunikasi persuasif dan tegas", "Berkomunikasi persuasif namun tegas dalam situasi sensitif.", 2, 3, 4, 5],
  ["B4", "Perilaku", "Kerja sama tim dan koordinasi lintas instansi", "Bekerja sama dalam tim dan berkoordinasi lintas instansi (BPKP, KPK, Kejaksaan, Kepolisian, BPK).", 3, 3, 4, 4]
];

/* ------------------------------------------------------------------ */
/*  SETUP: jalankan SEKALI untuk membuat semua lembar (sheet) dan isi awal */
/* ------------------------------------------------------------------ */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(HEAD).forEach(function (name) {
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    const h = HEAD[name];
    sh.getRange(1, 1, 1, h.length).setValues([h]).setFontWeight("bold").setBackground("#DDEBE9");
    sh.setFrozenRows(1);
  });
  // Kolom teks diformat "teks biasa" agar NIP tidak kehilangan angka 0 di depan,
  // tanggal tidak berubah format, dan isi sel tidak dianggap rumus.
  textCols(SHEET.AUDITOR, 8);
  textCols(SHEET.NILAI, 2);
  textCols(SHEET.RENCANA, 3);
  textCols(SHEET.KOMP, 4);
  textCols(SHEET.BOBOT, 1);
  textCols(SHEET.REKAP, 5);

  const komp = ss.getSheetByName(SHEET.KOMP);
  if (komp.getLastRow() < 2) komp.getRange(2, 1, SEED_KOMP.length, 8).setValues(SEED_KOMP);
  const bobot = ss.getSheetByName(SHEET.BOBOT);
  if (bobot.getLastRow() < 2) bobot.getRange(2, 1, CATS.length, 2).setValues(CATS.map(function (c) { return [c, DEF_WEIGHTS[c]]; }));

  // Hapus lembar kosong bawaan (Sheet1 / Lembar1) bila ada
  ss.getSheets().forEach(function (sh) {
    if (!HEAD[sh.getName()] && sh.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(sh);
  });
  ss.getSheetByName(SHEET.KOMP).autoResizeColumns(1, 3);
  Logger.log("Setup selesai. Lembar siap: " + Object.keys(HEAD).join(", "));
}

function textCols(name, n) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  sh.getRange(1, 1, sh.getMaxRows(), n).setNumberFormat("@");
}

/* ------------------------------------------------------------------ */
/*  PINTU MASUK API                                                     */
/* ------------------------------------------------------------------ */
function doGet() {
  return ContentService.createTextOutput("API Kompetensi Auditor Investigatif aktif. Buka aplikasi web Anda (GitHub Pages) untuk memakainya.");
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  let locked = false;
  try {
    const req = JSON.parse(e.postData.contents);
    if (KATA_SANDI.indexOf("GANTI-") === 0) return out({ ok: false, error: "KATA_SANDI di Code.gs belum diganti." });
    if (req.token !== KATA_SANDI) return out({ ok: false, code: "AUTH", error: "Kata sandi salah" });
    lock.waitLock(25000);
    locked = true;
    switch (req.action) {
      case "ping":
        return out({ ok: true });
      case "load":
        return out(Object.assign({ ok: true }, loadAll()));
      case "saveAuditor":
        upsertAuditor(req.auditor || {});
        updateRekap();
        return out({ ok: true });
      case "deleteAuditor":
        removeAuditor(String(req.id || ""));
        updateRekap();
        return out({ ok: true });
      case "saveTargets":
        saveTargets(req.targets, req.weights);
        updateRekap();
        return out({ ok: true });
      case "replaceAll":
        clearAuditors();
        saveTargets(req.targets, req.weights);
        (req.auditors || []).forEach(upsertAuditor);
        updateRekap();
        return out({ ok: true });
      default:
        return out({ ok: false, error: "Aksi tidak dikenal" });
    }
  } catch (err) {
    return out({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    if (locked) lock.releaseLock();
  }
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ------------------------------------------------------------------ */
/*  BACA DATA                                                           */
/* ------------------------------------------------------------------ */
function sheet(name) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh) throw new Error('Lembar "' + name + '" tidak ada. Jalankan fungsi setup terlebih dahulu.');
  return sh;
}

function table(name) {
  const sh = sheet(name);
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, sh.getLastColumn()).getValues().filter(function (r) { return r[0] !== "" && r[0] != null; });
}

function txt(v) {
  if (v instanceof Date) return Utilities.formatDate(v, "Asia/Jakarta", "yyyy-MM-dd");
  return v == null ? "" : String(v);
}

function clamp(n) {
  n = Math.round(Number(n));
  return n >= 1 && n <= 5 ? n : 1;
}

function readKomp() {
  return table(SHEET.KOMP).map(function (r) {
    return { kode: txt(r[0]), kat: txt(r[1]), nama: txt(r[2]), ind: txt(r[3]), tg: [4, 5, 6, 7].map(function (i) { return clamp(r[i]); }) };
  });
}

function readBobot() {
  const w = Object.assign({}, DEF_WEIGHTS);
  table(SHEET.BOBOT).forEach(function (r) {
    const n = Number(r[1]);
    if (CATS.indexOf(txt(r[0])) >= 0 && isFinite(n) && n >= 0) w[txt(r[0])] = n;
  });
  return w;
}

function readAuditors() {
  const nilai = {}, rencana = {};
  table(SHEET.NILAI).forEach(function (r) {
    const id = txt(r[0]);
    (nilai[id] = nilai[id] || {})[txt(r[1])] = Number(r[2]);
  });
  table(SHEET.RENCANA).forEach(function (r) {
    const id = txt(r[0]);
    (rencana[id] = rencana[id] || {})[txt(r[1])] = txt(r[2]);
  });
  return table(SHEET.AUDITOR).map(function (r) {
    const id = txt(r[0]);
    return { id: id, nama: txt(r[1]), nip: txt(r[2]), unit: txt(r[3]), jenjang: txt(r[4]), tanggal: txt(r[5]), penilai: txt(r[6]), scores: nilai[id] || {}, plans: rencana[id] || {} };
  });
}

function loadAll() {
  return { kompetensi: readKomp(), weights: readBobot(), auditors: readAuditors() };
}

/* ------------------------------------------------------------------ */
/*  TULIS DATA                                                          */
/* ------------------------------------------------------------------ */
function clean(v, max) {
  return String(v == null ? "" : v).slice(0, max);
}

// Ganti semua baris milik satu auditor (kolom pertama = id) dengan baris baru.
function replaceRows(sh, id, rows) {
  const last = sh.getLastRow();
  const ncol = sh.getLastColumn();
  let keep = [];
  if (last > 1) {
    const rng = sh.getRange(2, 1, last - 1, ncol);
    keep = rng.getValues().filter(function (r) { return String(r[0]) !== id && r[0] !== ""; });
    rng.clearContent();
  }
  const all = keep.concat(rows);
  if (all.length) sh.getRange(2, 1, all.length, ncol).setValues(all);
}

function upsertAuditor(a) {
  const id = clean(a.id, 40);
  if (!id) throw new Error("ID auditor kosong");
  const row = [
    id, clean(a.nama, 200), clean(a.nip, 50), clean(a.unit, 200),
    JENJANG.indexOf(a.jenjang) >= 0 ? a.jenjang : JENJANG[1],
    clean(a.tanggal, 10), clean(a.penilai, 200), new Date().toISOString()
  ];
  const sh = sheet(SHEET.AUDITOR);
  const last = sh.getLastRow();
  let r = -1;
  if (last > 1) {
    const ids = sh.getRange(2, 1, last - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) if (String(ids[i][0]) === id) { r = i + 2; break; }
  }
  if (r < 0) r = last + 1;
  sh.getRange(r, 1, 1, row.length).setValues([row]);

  const nv = [], np = [];
  readKomp().forEach(function (k) {
    const v = Math.round(Number(a.scores && a.scores[k.kode]));
    if (v >= 1 && v <= 5) nv.push([id, k.kode, v]);
    const p = clean(a.plans && a.plans[k.kode], 2000);
    if (p) np.push([id, k.kode, p]);
  });
  replaceRows(sheet(SHEET.NILAI), id, nv);
  replaceRows(sheet(SHEET.RENCANA), id, np);
}

function removeAuditor(id) {
  const sh = sheet(SHEET.AUDITOR);
  const last = sh.getLastRow();
  if (last > 1) {
    const ids = sh.getRange(2, 1, last - 1, 1).getValues();
    for (let i = ids.length - 1; i >= 0; i--) if (String(ids[i][0]) === id) sh.deleteRow(i + 2);
  }
  replaceRows(sheet(SHEET.NILAI), id, []);
  replaceRows(sheet(SHEET.RENCANA), id, []);
}

function clearAuditors() {
  [SHEET.AUDITOR, SHEET.NILAI, SHEET.RENCANA].forEach(function (n) {
    const sh = sheet(n);
    const last = sh.getLastRow();
    if (last > 1) sh.getRange(2, 1, last - 1, sh.getLastColumn()).clearContent();
  });
}

function saveTargets(targets, weights) {
  if (targets && typeof targets === "object") {
    const sh = sheet(SHEET.KOMP);
    const last = sh.getLastRow();
    if (last > 1) {
      const v = sh.getRange(2, 1, last - 1, 8).getValues();
      v.forEach(function (r) {
        const t = targets[String(r[0])];
        if (Array.isArray(t) && t.length === 4) {
          for (let i = 0; i < 4; i++) {
            const n = Math.round(Number(t[i]));
            if (n >= 1 && n <= 5) r[4 + i] = n;
          }
        }
      });
      sh.getRange(2, 5, last - 1, 4).setValues(v.map(function (r) { return r.slice(4, 8); }));
    }
  }
  if (weights && typeof weights === "object") {
    const w = Object.assign({}, DEF_WEIGHTS);
    CATS.forEach(function (c) {
      const n = Number(weights[c]);
      if (isFinite(n) && n >= 0) w[c] = n;
    });
    sheet(SHEET.BOBOT).getRange(2, 1, CATS.length, 2).setValues(CATS.map(function (c) { return [c, w[c]]; }));
  }
}

/* ------------------------------------------------------------------ */
/*  REKAP OTOMATIS (lembar "Rekap" - jangan diedit manual)              */
/* ------------------------------------------------------------------ */
function hitung(a, komp, weights) {
  const ji = Math.max(0, JENJANG.indexOf(a.jenjang));
  let wa = 0, wt = 0, filled = 0, gaps = 0;
  CATS.forEach(function (cat) {
    const sc = komp.filter(function (k) { return k.kat === cat && a.scores[k.kode] > 0; });
    if (!sc.length) return;
    const avgA = sc.reduce(function (s, k) { return s + a.scores[k.kode]; }, 0) / sc.length;
    const avgT = sc.reduce(function (s, k) { return s + k.tg[ji]; }, 0) / sc.length;
    filled += sc.length;
    gaps += sc.filter(function (k) { return a.scores[k.kode] < k.tg[ji]; }).length;
    wa += weights[cat] * avgA;
    wt += weights[cat] * avgT;
  });
  const cap = wt > 0 ? wa / wt : null;
  let verdict = "Belum dinilai";
  if (cap != null) verdict = cap >= 1 ? "Memenuhi jenjang" : cap >= 0.85 ? "Mendekati target" : "Perlu pengembangan intensif";
  return { filled: filled, gaps: gaps, cap: cap, verdict: verdict };
}

function updateRekap() {
  const komp = readKomp(), weights = readBobot();
  const rows = readAuditors().map(function (a) {
    const c = hitung(a, komp, weights);
    return [a.nama, a.unit, a.jenjang, a.tanggal, c.filled + "/" + komp.length, c.cap == null ? "" : c.cap, c.verdict, c.gaps];
  });
  const sh = sheet(SHEET.REKAP);
  const last = sh.getLastRow();
  if (last > 1) sh.getRange(2, 1, last - 1, HEAD.Rekap.length).clearContent();
  if (rows.length) {
    sh.getRange(2, 1, rows.length, HEAD.Rekap.length).setValues(rows);
    sh.getRange(2, 6, rows.length, 1).setNumberFormat("0%");
  }
}
