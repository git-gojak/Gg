# SiAkad QR — Sistem Pendataan Absensi QR & Akademik Siswa (PWA)

Aplikasi web berbasis **Progressive Web App (PWA)** untuk mencatat dan memantau **absensi siswa menggunakan QR text**, **koreksi kitab berkala**, **nilai harian**, **nilai syafawi**, dan **Ujian Akhir Semester (UAS)**.

## Fitur Utama
- **Mode Publik (*Read-Only*):** Menampilkan dashboard ringkasan, daftar kehadiran, koreksi kitab, nilai harian, syafawi, UAS, dan master siswa tanpa perlu login/PIN.
- **Mode Admin (Terlindungi PIN):** Pemindaian QR via kamera atau input QR text sesuai pola siswa, serta operasi tambah, ubah, dan hapus data pada seluruh modul.
- **Progressive Web App (PWA):** Dapat diinstal langsung dari Google Chrome di Desktop maupun HP Android, berjalan dalam mode *standalone*, memiliki halaman `offline.html`, serta mekanisme pembaruan versi otomatis.

## Struktur File Proyek
```text
/
├── index.html                  # Halaman utama SPA (Public & Admin)
├── manifest.webmanifest        # Konfigurasi instalasi PWA
├── offline.html                # Halaman fallback saat perangkat offline
├── sw.js                       # Service Worker (cache aset statis, tanpa cache data API)
├── assets/
│   ├── css/styles.css          # Stylesheet adaptif Desktop & HP Android
│   └── icons/                  # icon-192.png, icon-512.png, icon-maskable-512.png
├── js/
│   ├── config.js               # Konfigurasi terpusat & URL Web App GAS
│   ├── state.js                # State aplikasi & sesi Admin (sessionStorage)
│   ├── api.js                  # Klien HTTP mengikuti API Contract
│   ├── qr.js                   # Pemindai kamera QR & normalisasi QR text
│   ├── ui.js                   # Rendering tabel desktop, card mobile, modal, & form
│   └── app.js                  # Entry point & orchestrator aplikasi
├── PROJECT_BLUEPRINT.md        # Spesifikasi kebutuhan, peran, dan alur aplikasi
├── API_DOCUMENTATION.md        # Kontrak API frontend <-> backend GAS
└── CHANGELOG.md                # Catatan perubahan versi proyek
