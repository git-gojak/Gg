# PROJECT_BLUEPRINT.md

## 1. Tujuan Aplikasi
**SiAkad QR** adalah aplikasi web berbasis **Progressive Web App (PWA)** yang dijalankan dan diinstal melalui **Google Chrome** pada perangkat **Desktop** maupun **HP Android** untuk mengelola dan memantau kehadiran serta capaian akademik siswa:
1. **Absensi Siswa Berbasis QR Text** (pemindaian kamera QR / input teks sesuai pola QR siswa yang sudah ada, serta input manual cadangan).
2. **Pendataan Koreksi Kitab Berkala**.
3. **Pendataan Nilai Harian**.
4. **Pendataan Nilai Syafawi**.
5. **Pendataan Ujian Akhir Semester (UAS)**.

Aplikasi ditujukan untuk pengelolaan mandiri/internal dengan volume awal **ratusan data**, tanpa membangun paket aplikasi native (APK Android atau EXE Windows).

## 2. Masalah yang Diselesaikan
- **Sentralisasi Pencatatan:** Menyatukan absensi harian berbasis QR text, progres koreksi kitab, serta nilai harian, syafawi, dan UAS ke dalam satu basis data Google Sheets.
- **Pemisahan Akses Publik & Admin:** Menyediakan antarmuka *read-only* terbuka bagi publik tanpa hambatan login, sekaligus menjaga keamanan operasi mutasi data melalui verifikasi PIN Admin di backend Google Apps Script.
- **Pengalaman Adaptif Lintas Perangkat:** Menyediakan navigasi sidebar + tabel penuh pada Chrome Desktop serta navigasi bawah (*bottom bar*) + tampilan kartu (*card-stack*) pada Chrome Android, lengkap dengan dukungan instalasi PWA *standalone*.

## 3. Kebutuhan Fungsional & Non-Fungsional

### Kebutuhan Fungsional
- **Dashboard Informatif:** Menampilkan ringkasan siswa aktif, status kehadiran hari ini (`HADIR`, `IZIN`, `SAKIT`, `ALPA`), jumlah catatan koreksi kitab, dan akumulasi nilai.
- **Absensi QR Text:** Input/pemindaian `qr_text` siswa, validasi pola di backend, pencegahan duplikasi absensi pada tanggal & sesi yang sama, serta filter riwayat kehadiran.
- **Koreksi Kitab, Nilai Harian, Syafawi, dan UAS:** Tampilan daftar, pencarian, filter kelas/tanggal/periode, serta formulir tambah, ubah, dan hapus khusus Admin.
- **Master Siswa:** Pengelolaan identitas siswa (`student_id`, `nis`, `full_name`, `class_group`, `qr_text`, `status`).

### Kebutuhan Non-Fungsional
- **Platform & PWA:** Google Chrome (Desktop & Android), mendukung mode *standalone*, halaman fallback `offline.html`, pembaruan versi Service Worker, serta kebijakan *no-cache* untuk data API sensitif.
- **Keamanan:** Zero secret di frontend; PIN Admin disimpan sementara di `sessionStorage` selama sesi aktif dan diverifikasi lewat hash SHA-256 di backend Google Apps Script.

## 4. Pengguna dan Hak Akses

| Peran | Hak Akses UI & Data | Mekanisme Autentikasi |
| :--- | :--- | :--- |
| **Publik** | Melihat (*read-only*) Dashboard serta daftar dan filter Absensi, Koreksi Kitab, Nilai Harian, Nilai Syafawi, UAS, dan Master Siswa. | Terbuka langsung tanpa PIN. |
| **Admin** | Seluruh akses publik ditambah pemindaian absensi QR, input manual, tambah, ubah, dan hapus data (`CRUD`). | Verifikasi **PIN Admin** via endpoint `verifyAdmin` dan validasi PIN pada setiap mutasi `POST`. |

## 5. Komponen Frontend & PWA Terimplementasi (Tahap 3)
- `index.html`: Struktur SPA responsif dengan sidebar desktop, bottom navigation bar Android, dashboard, panel scan QR, tabel/kartu data, dan modal.
- `assets/css/styles.css`: Sistem desain modern dengan adaptasi layout spesifik Desktop (`>= 768px`) dan HP Android (`< 768px`).
- `js/config.js`, `js/state.js`, `js/api.js`, `js/qr.js`, `js/ui.js`, `js/app.js`: Modul JavaScript ES6 terpisah sesuai kontrak API.
- `manifest.webmanifest`, `sw.js`, `offline.html`, serta aset ikon `assets/icons/icon-192.png`, `icon-512.png`, dan `icon-maskable-512.png`.
