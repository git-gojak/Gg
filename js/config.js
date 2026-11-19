export const APP_CONFIG = Object.freeze({
  APP_NAME: 'SiAkad QR',
  APP_VERSION: '1.0.0',
  // Ganti dengan URL deployment Google Apps Script Web App (/exec) pada Tahap 4
  GAS_WEB_APP_URL: 'https://script.google.com/macros/s/REPLACE_WITH_DEPLOYMENT_ID/exec',
  SESSION_PIN_KEY: 'siakad_admin_session_pin',
  MODULES: {
    STUDENTS: 'students',
    ATTENDANCE: 'attendance',
    KITAB: 'kitab',
    DAILY: 'daily',
    SYAFAWI: 'syafawi',
    UAS: 'uas'
  },
  PRIMARY_KEYS: {
    students: 'student_id',
    attendance: 'attendance_id',
    kitab: 'correction_id',
    daily: 'daily_id',
    syafawi: 'syafawi_id',
    uas: 'uas_id'
  },
  VIEW_TITLES: {
    dashboard: {
      title: 'Dashboard Akademik',
      subtitle: 'Ringkasan kehadiran siswa, koreksi kitab, dan capaian nilai'
    },
    attendance: {
      title: 'Absensi QR Text',
      subtitle: 'Pemindaian QR text siswa dan riwayat kehadiran'
    },
    kitab: {
      title: 'Koreksi Kitab Berkala',
      subtitle: 'Pencatatan progres bacaan, halaman, dan catatan koreksi kitab'
    },
    daily: {
      title: 'Nilai Harian',
      subtitle: 'Rekap evaluasi dan tugas harian siswa'
    },
    syafawi: {
      title: 'Nilai Syafawi',
      subtitle: 'Rekap ujian lisan dan hafalan siswa'
    },
    uas: {
      title: 'Ujian Akhir Semester (UAS)',
      subtitle: 'Rekap nilai akhir semester per mata pelajaran'
    },
    students: {
      title: 'Master Data Siswa',
      subtitle: 'Daftar NIS, kelas, status aktif, dan identitas QR text siswa'
    }
  }
});

export function isApiConfigured() {
  return (
    typeof APP_CONFIG.GAS_WEB_APP_URL === 'string' &&
    APP_CONFIG.GAS_WEB_APP_URL.startsWith('https://script.google.com/') &&
    !APP_CONFIG.GAS_WEB_APP_URL.includes('REPLACE_WITH_DEPLOYMENT_ID')
  );
}
