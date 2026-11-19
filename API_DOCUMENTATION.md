# API_DOCUMENTATION.md

## 1. Informasi Dasar API
- **Base URL:** URL deployment **Google Apps Script Web App** (`/exec`), dikonfigurasi terpusat pada `GAS_WEB_APP_URL` di `js/config.js`.
- **Protokol & Format:** HTTPS dengan pertukaran data JSON.
- **Kebijakan CORS & Caching:**
  - Permintaan baca (*read-only*) menggunakan HTTP `GET` dengan `cache: 'no-store'`.
  - Permintaan tulis (*mutation*) menggunakan HTTP `POST` dengan `Content-Type: text/plain;charset=utf-8` berisi payload JSON string agar bebas *CORS preflight* (`OPTIONS`).
  - Service Worker (`sw.js`) mengecualikan seluruh domain `script.google.com` dan `script.googleusercontent.com` dari Cache Storage.

## 2. Format Standar Request & Response

### Format Request `POST` (Admin)
```json
{
  "action": "nama_endpoint",
  "pin": "PIN_ADMIN_DARI_SESSION_STORAGE",
  "payload": {}
}
