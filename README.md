# Kompetensi Auditor Investigatif — Database Google Sheets + GitHub Pages

Aplikasi asesmen kompetensi auditor. **Tampilan** berjalan di GitHub Pages (gratis),
**datanya** disimpan di Google Sheets milik Anda lewat Google Apps Script.

```
Peramban (GitHub Pages)  ──►  Google Apps Script (Code.gs)  ──►  Google Sheets
   index.html + config.js        pintu API + kata sandi            "database"
```

## Isi folder

| File | Fungsi |
|---|---|
| `index.html` | Aplikasi (tampilan + logika). Tidak perlu diubah. |
| `config.js` | **Satu-satunya file yang Anda ubah** di GitHub: berisi alamat API. |
| `apps-script/Code.gs` | Kode backend, ditempel ke Google Sheets (bukan dijalankan dari GitHub). |
| `README.md` | Panduan ini. |

## Lembar (tabel) yang dibuat otomatis di Google Sheets

| Lembar | Isi |
|---|---|
| `Auditor` | Data auditor: id, nama, NIP, unit, jenjang, tanggal, penilai |
| `Nilai` | Nilai 1–5 per auditor per kompetensi (satu baris = satu nilai) |
| `Rencana` | Rencana pengembangan per auditor per kompetensi |
| `Kompetensi` | 23 kompetensi, indikator, dan target per jenjang (bisa diedit) |
| `Bobot` | Bobot 4 kategori (total 100) |
| `Rekap` | Hasil hitung otomatis capaian tiap auditor. **Jangan diedit manual.** |

---

## BAGIAN 1 — Siapkan Google Sheets (±10 menit)

**Langkah 1. Buat spreadsheet baru**
1. Buka <https://sheets.new> (masuk dengan akun Google Anda).
2. Beri nama, misalnya `Database Kompetensi Auditor`.

**Langkah 2. Buka Apps Script**
1. Di menu atas klik **Ekstensi → Apps Script**. Tab baru akan terbuka.
2. Di editor, hapus semua tulisan yang ada (biasanya `function myFunction() {}`).
3. Buka file `apps-script/Code.gs` dari folder ini, **salin seluruh isinya**, lalu **tempel** ke editor.

**Langkah 3. Ganti kata sandi**
1. Di baris paling atas kode, cari:
   `const KATA_SANDI = "GANTI-KATA-SANDI-INI";`
2. Ganti tulisan di dalam tanda kutip dengan kata sandi Anda sendiri (minimal 12 karakter, campur huruf dan angka). Contoh: `"Audit-Itjen-2026-xK9"`.
3. Klik ikon disket (**Simpan project**) atau tekan `Ctrl+S`.

> Kata sandi ini hanya ada di Google (Code.gs), **tidak** ikut diunggah ke GitHub.
> Anda akan mengetiknya saat membuka aplikasi.

**Langkah 4. Jalankan `setup` (sekali saja)**
1. Di bagian atas editor, pada menu pilihan fungsi pilih **`setup`**.
2. Klik **Jalankan**.
3. Google akan meminta izin: klik **Tinjau izin** → pilih akun Anda → jika muncul peringatan
   "Google belum memverifikasi aplikasi ini", klik **Lanjutan** → **Buka (nama project) (tidak aman)** → **Izinkan**.
   (Peringatan ini normal karena skrip ini buatan Anda sendiri.)
4. Kembali ke tab spreadsheet: sekarang ada 6 lembar baru. Lembar `Kompetensi` sudah terisi.

**Langkah 5. Terbitkan sebagai aplikasi web**
1. Klik **Terapkan → Deployment baru**.
2. Klik ikon roda gigi di samping "Pilih jenis" → pilih **Aplikasi web**.
3. Isi:
   - **Jalankan sebagai**: `Saya` (akun Anda)
   - **Siapa yang memiliki akses**: `Siapa saja`
4. Klik **Deploy**, lalu **salin "URL aplikasi web"** (berakhiran `/exec`). Simpan dulu di Notepad.

> "Siapa saja" aman di sini karena setiap permintaan tetap harus membawa kata sandi dari Langkah 3.

**Langkah 6. Tes cepat**
Tempel URL tadi di peramban. Jika muncul tulisan *"API Kompetensi Auditor Investigatif aktif"*, backend sudah benar.

---

## BAGIAN 2 — Unggah ke GitHub dan aktifkan GitHub Pages (±10 menit)

**Langkah 7. Buat akun dan repositori**
1. Daftar/masuk di <https://github.com>.
2. Klik tanda **+** di kanan atas → **New repository**.
3. **Repository name**: `kompetensi-auditor` (huruf kecil, tanpa spasi).
4. Pilih **Public** (GitHub Pages gratis memerlukan repositori publik).
5. Centang **Add a README file**? **Jangan** (biarkan kosong). Klik **Create repository**.

**Langkah 8. Isi alamat API di `config.js`** (sebelum diunggah)
1. Buka `config.js` dengan Notepad.
2. Tempel URL dari Langkah 5:
   ```js
   window.APP_CONFIG = {
     API_URL: "https://script.google.com/macros/s/XXXXXXXX/exec",
     SHEET_URL: "https://docs.google.com/spreadsheets/d/XXXXXXXX/edit"
   };
   ```
   `SHEET_URL` boleh dikosongkan; fungsinya hanya memberi tautan "Buka Google Sheets" di tab Data.
3. Simpan.

**Langkah 9. Unggah file**
1. Di halaman repositori yang baru dibuat, klik tautan **uploading an existing file**.
2. Seret ke halaman: `index.html`, `config.js`, `README.md`, dan folder `apps-script`.
   (Jika folder tidak bisa diseret, cukup unggah `index.html` dan `config.js`; sisanya hanya arsip.)
3. Gulir ke bawah, klik **Commit changes**.

**Langkah 10. Aktifkan GitHub Pages**
1. Di repositori klik **Settings** → menu kiri **Pages**.
2. Pada **Build and deployment → Source** pilih **Deploy from a branch**.
3. **Branch**: pilih `main`, folder `/ (root)` → **Save**.
4. Tunggu 1–3 menit, muat ulang halaman Pages. Akan muncul alamat:
   `https://NAMA-ANDA.github.io/kompetensi-auditor/`

**Langkah 11. Pakai aplikasinya**
1. Buka alamat di Langkah 10.
2. Masukkan **kata sandi** dari Langkah 3 → **Masuk**.
3. Klik **Tambah auditor**, isi nilai. Pojok kanan atas akan menampilkan
   *"Menyimpan ke Google Sheets…"* lalu *"Tersimpan di Google Sheets"*.
4. Buka spreadsheet: data muncul di lembar `Auditor`, `Nilai`, `Rencana`, dan `Rekap`.

---

## Mencoba dulu tanpa Google Sheets (Mode Lokal)

Jika `API_URL` di `config.js` dibiarkan `""`, aplikasi tetap jalan, tetapi data hanya
tersimpan di peramban (ada contoh auditor). Cocok untuk mengecek bahwa GitHub Pages sudah aktif
sebelum menyambungkan Sheets.

## Mengubah sesuatu setelah berjalan

| Keperluan | Cara |
|---|---|
| Mengganti URL API | Edit `config.js` di GitHub (ikon pensil) → Commit. Tunggu 1–2 menit. |
| Mengganti kata sandi | Edit `KATA_SANDI` di Apps Script → Simpan → **Terapkan → Kelola deployment → ikon pensil → Versi: Versi baru → Terapkan**. |
| Mengubah isi `Code.gs` | Sama seperti di atas: **harus** membuat *Versi baru* pada deployment yang sama (URL tidak berubah). |
| Mengubah target / bobot | Lewat tab **Matriks target** di aplikasi, atau langsung di lembar `Kompetensi` / `Bobot`. |
| Menambah kompetensi baru | Tambah baris di lembar `Kompetensi` (kode unik, kategori harus salah satu dari 4 kategori yang ada, 4 target 1–5). Muat ulang aplikasi. |
| Mengunduh data | Di Sheets: **File → Unduh → Excel/CSV**. Atau tab **Data** di aplikasi. |

## Masalah umum

| Gejala | Penyebab & solusi |
|---|---|
| "Kata sandi salah" | Pastikan sama persis dengan `KATA_SANDI` di Code.gs (huruf besar/kecil berpengaruh). Setelah mengganti sandi, buat *Versi baru* deployment. |
| "KATA_SANDI di Code.gs belum diganti" | Ubah tulisan `GANTI-KATA-SANDI-INI` lalu deploy ulang. |
| "Jawaban server tidak terbaca" | Deployment belum diatur *Siapa saja*, atau URL di `config.js` salah/bukan yang berakhiran `/exec`. |
| `Lembar "…" tidak ada` | Jalankan fungsi `setup` dulu (Langkah 4). |
| Halaman GitHub Pages 404 | Tunggu beberapa menit; pastikan file bernama persis `index.html` (huruf kecil) di root repositori. |
| Perubahan di `config.js` belum terlihat | Muat ulang paksa (`Ctrl+F5`) atau tunggu 1–2 menit. |
| Tampilan tertahan di "Gagal menyimpan, mencoba lagi…" | Cek koneksi internet; aplikasi mencoba ulang otomatis tiap 8 detik. Jangan tutup tab sebelum berstatus *Tersimpan*. |

## Catatan keamanan (penting untuk data penilaian pegawai)

- Repositori **Public** berarti kode (`index.html`, `config.js`) bisa dilihat siapa pun, **tetapi data tidak ada di sana**.
  Data hanya bisa dibaca jika orang tahu URL API **dan** kata sandi.
- Gunakan kata sandi yang kuat dan bagikan hanya kepada penilai yang berwenang. Jangan menaruhnya di `config.js` atau GitHub.
- **Jangan bagikan akses (Bagikan/Share) spreadsheet** ke orang yang tidak berwenang; siapa pun yang punya akses Sheets dapat melihat semua data.
- Kata sandi disimpan di peramban hanya selama tab terbuka dan dihapus saat tombol **Keluar** ditekan atau tab ditutup.
- Ini adalah perlindungan sederhana dengan satu kata sandi bersama (belum akun per pengguna). Jika data akan dipakai
  lintas unit dalam skala besar atau perlu jejak audit per pengguna, pertimbangkan sistem yang lebih ketat
  dan sesuaikan dengan kebijakan keamanan informasi instansi Anda.
- Pertimbangkan apakah NIP perlu diisi; kolomnya opsional.
- Jika beberapa penilai mengedit **auditor yang sama** pada saat bersamaan, simpanan terakhir yang menang.
  Untuk auditor yang berbeda tidak ada masalah.

## Cara kerja singkat (untuk yang ingin tahu)

- Aplikasi mengirim perubahan ke URL Apps Script lewat HTTP POST (berisi kata sandi + aksi seperti `saveAuditor`).
- Apps Script memeriksa kata sandi, mengunci proses (agar tidak bentrok), lalu menulis ke lembar yang sesuai
  dan menghitung ulang lembar `Rekap`.
- Saat aplikasi dibuka, semua data dimuat dari Sheets (aksi `load`), sehingga semua perangkat melihat data yang sama.
