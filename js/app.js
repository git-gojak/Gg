import { APP_CONFIG, isApiConfigured } from './config.js';
import { ApiClient } from './api.js';
import {
  getState,
  setActiveView,
  setAdminSession,
  clearAdminSession,
  restoreAdminSession,
  setSummaryData,
  setModuleRecords
} from './state.js';
import { normalizeQrText, isBasicQrValid, startQrCamera, stopQrCamera } from './qr.js';
import {
  showToast,
  openModal,
  closeModal,
  syncRoleUI,
  switchViewUI,
  renderDashboardSummary,
  renderLoadingState,
  renderErrorState,
  populateClassFilterOptions,
  renderModuleRecords,
  buildDynamicFormFields
} from './ui.js';

let currentFormContext = {
  mode: 'create', // 'create' | 'edit'
  module: null,
  id: null
};

let cameraActive = false;

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

/* ===========================
   1. PWA & SERVICE WORKER
   =========================== */
function initPwa() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            document.getElementById('sw-update-banner').classList.remove('hidden');
            document.getElementById('btn-sw-reload').onclick = () => {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            };
          }
        });
      });
    }).catch(() => {});

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    getState().deferredInstallPrompt = e;
    document.getElementById('btn-install-desktop').classList.remove('hidden');
    document.getElementById('btn-install-mobile').classList.remove('hidden');
  });

  const handleInstallClick = async () => {
    const promptEvent = getState().deferredInstallPrompt;
    if (!promptEvent) {
      openModal('modal-install-guide');
      return;
    }
    promptEvent.prompt();
    await promptEvent.userChoice;
    getState().deferredInstallPrompt = null;
    document.getElementById('btn-install-desktop').classList.add('hidden');
    document.getElementById('btn-install-mobile').classList.add('hidden');
  };

  document.getElementById('btn-install-desktop').addEventListener('click', handleInstallClick);
  document.getElementById('btn-install-mobile').addEventListener('click', handleInstallClick);
  document.getElementById('btn-install-guide-desktop').addEventListener('click', () => openModal('modal-install-guide'));
  document.getElementById('btn-open-install-guide').addEventListener('click', () => openModal('modal-install-guide'));

  const updateOnlineBadge = () => {
    const badge = document.getElementById('connection-badge');
    if (navigator.onLine) {
      badge.textContent = 'Online';
      badge.className = 'status-pill status-online';
    } else {
      badge.textContent = 'Offline';
      badge.className = 'status-pill status-offline';
    }
  };
  window.addEventListener('online', updateOnlineBadge);
  window.addEventListener('offline', updateOnlineBadge);
  updateOnlineBadge();
}

/* ===========================
   2. PEMUATAN DATA DARI API
   =========================== */
async function loadDashboard() {
  if (!isApiConfigured()) {
    renderDashboardSummary(null);
    return;
  }
  const date = document.getElementById('dashboard-date').value || getTodayString();
  try {
    const res = await ApiClient.getSummary(date);
    setSummaryData(res.data);
    renderDashboardSummary(res.data);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function readFiltersForModule(moduleName) {
  switch (moduleName) {
    case 'attendance':
      return {
        search: document.getElementById('filter-attendance-search').value,
        date: document.getElementById('filter-attendance-date').value,
        class_group: document.getElementById('filter-attendance-class').value
      };
    case 'kitab':
      return {
        search: document.getElementById('filter-kitab-search').value,
        date: document.getElementById('filter-kitab-date').value,
        class_group: document.getElementById('filter-kitab-class').value
      };
    case 'daily':
      return {
        search: document.getElementById('filter-daily-search').value,
        date: document.getElementById('filter-daily-date').value,
        class_group: document.getElementById('filter-daily-class').value
      };
    case 'syafawi':
      return {
        search: document.getElementById('filter-syafawi-search').value,
        period: document.getElementById('filter-syafawi-period').value,
        class_group: document.getElementById('filter-syafawi-class').value
      };
    case 'uas':
      return {
        search: document.getElementById('filter-uas-search').value,
        period: document.getElementById('filter-uas-period').value,
        class_group: document.getElementById('filter-uas-class').value
      };
    case 'students':
      return {
        search: document.getElementById('filter-students-search').value,
        class_group: document.getElementById('filter-students-class').value
      };
    default:
      return {};
  }
}

async function loadModuleData(moduleName) {
  if (!isApiConfigured()) {
    renderModuleRecords(moduleName, []);
    return;
  }
  renderLoadingState(`list-${moduleName}`);
  try {
    const filters = readFiltersForModule(moduleName);
    const res = await ApiClient.getPublicData(moduleName, filters);
    const items = res.data?.items || [];
    setModuleRecords(moduleName, items);
    populateClassFilterOptions();
    renderModuleRecords(moduleName, items);
  } catch (err) {
    renderErrorState(`list-${moduleName}`, err.message);
  }
}

async function navigateTo(viewName) {
  if (cameraActive && viewName !== 'attendance') {
    stopQrCamera(document.getElementById('qr-video'));
    document.getElementById('camera-container').classList.add('hidden');
    document.getElementById('btn-toggle-camera').textContent = 'Buka Kamera QR';
    cameraActive = false;
  }

  setActiveView(viewName);
  switchViewUI(viewName);

  if (viewName === 'dashboard') {
    await loadDashboard();
  } else {
    await loadModuleData(viewName);
  }
}

/* ===========================
   3. AUTENTIKASI & AKSI ADMIN
   =========================== */
function initAdminAuth() {
  const handleAdminButton = () => {
    if (getState().isAdmin) {
      clearAdminSession();
      syncRoleUI();
      const active = getState().activeView;
      if (active !== 'dashboard') {
        renderModuleRecords(active, getState().records[active]);
      }
      showToast('Berhasil keluar dari Mode Admin.');
    } else {
      document.getElementById('admin-pin-input').value = '';
      openModal('modal-admin-login');
    }
  };

  document.getElementById('btn-admin-desktop').addEventListener('click', handleAdminButton);
  document.getElementById('btn-admin-mobile').addEventListener('click', handleAdminButton);

  document.getElementById('form-admin-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const pin = document.getElementById('admin-pin-input').value.trim();
    const submitBtn = document.getElementById('btn-submit-pin');
    if (!pin) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Memverifikasi...';
    try {
      await ApiClient.verifyAdmin(pin);
      setAdminSession(pin);
      closeModal('modal-admin-login');
      syncRoleUI();
      showToast('Mode Admin aktif.', 'success');

      // Muat master siswa agar dropdown form Admin siap digunakan
      if (isApiConfigured()) {
        const resStudents = await ApiClient.getPublicData('students');
        setModuleRecords('students', resStudents.data?.items || []);
      }

      const active = getState().activeView;
      if (active !== 'dashboard') {
        renderModuleRecords(active, getState().records[active]);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Verifikasi PIN';
    }
  });
}

/* ===========================
   4. ABSENSI QR & FORM CRUD
   =========================== */
function initQrAttendance() {
  const qrDateInput = document.getElementById('qr-date');
  qrDateInput.value = getTodayString();

  document.getElementById('btn-toggle-camera').addEventListener('click', async () => {
    const camContainer = document.getElementById('camera-container');
    const videoEl = document.getElementById('qr-video');
    const statusEl = document.getElementById('camera-status');
    const toggleBtn = document.getElementById('btn-toggle-camera');

    if (cameraActive) {
      stopQrCamera(videoEl);
      camContainer.classList.add('hidden');
      toggleBtn.textContent = 'Buka Kamera QR';
      cameraActive = false;
      return;
    }

    try {
      camContainer.classList.remove('hidden');
      await startQrCamera(
        videoEl,
        (detectedQr) => {
          document.getElementById('qr-input-text').value = detectedQr;
          showToast(`QR terdeteksi: ${detectedQr}`, 'success');
        },
        (msg) => {
          statusEl.textContent = msg;
        }
      );
      toggleBtn.textContent = 'Tutup Kamera';
      cameraActive = true;
    } catch (err) {
      camContainer.classList.add('hidden');
      showToast(err.message, 'error');
    }
  });

  document.getElementById('form-qr-attendance').addEventListener('submit', async (e) => {
    e.preventDefault();
    const qrText = normalizeQrText(document.getElementById('qr-input-text').value);
    if (!isBasicQrValid(qrText)) {
      showToast('Format QR text tidak valid.', 'error');
      return;
    }

    const payload = {
      qr_text: qrText,
      date: document.getElementById('qr-date').value,
      session_name: document.getElementById('qr-session').value.trim(),
      status: document.getElementById('qr-status').value,
      notes: document.getElementById('qr-notes').value.trim()
    };

    try {
      const res = await ApiClient.scanAttendanceQr(payload);
      showToast(res.message || 'Absensi QR berhasil dicatat.', 'success');
      document.getElementById('qr-input-text').value = '';
      document.getElementById('qr-notes').value = '';
      await loadModuleData('attendance');
    } catch (err) {
      showToast(err.message, 'error');
      syncRoleUI();
    }
  });

  document.getElementById('btn-open-manual-attendance').addEventListener('click', () => {
    openCreateModal('attendance');
  });
}

async function openCreateModal(moduleName) {
  if (moduleName !== 'students' && getState().records.students.length === 0 && isApiConfigured()) {
    try {
      const res = await ApiClient.getPublicData('students');
      setModuleRecords('students', res.data?.items || []);
    } catch (_) {}
  }

  currentFormContext = { mode: 'create', module: moduleName, id: null };
  document.getElementById('modal-record-title').textContent = `Tambah Data (${moduleName.toUpperCase()})`;
  document.getElementById('dynamic-form-fields').innerHTML = buildDynamicFormFields(moduleName, null);
  openModal('modal-record-form');
}

async function openEditModal(moduleName, id) {
  if (moduleName !== 'students' && getState().records.students.length === 0 && isApiConfigured()) {
    try {
      const res = await ApiClient.getPublicData('students');
      setModuleRecords('students', res.data?.items || []);
    } catch (_) {}
  }

  const pkField = APP_CONFIG.PRIMARY_KEYS[moduleName];
  const record = (getState().records[moduleName] || []).find((item) => String(item[pkField]) === String(id));
  if (!record) {
    showToast('Data tidak ditemukan.', 'error');
    return;
  }

  currentFormContext = { mode: 'edit', module: moduleName, id };
  document.getElementById('modal-record-title').textContent = `Edit Data (${id})`;
  document.getElementById('dynamic-form-fields').innerHTML = buildDynamicFormFields(moduleName, record);
  openModal('modal-record-form');
}

async function handleDeleteRecord(moduleName, id) {
  const confirmed = window.confirm(`Hapus data dengan ID ${id}? Tindakan ini tidak dapat dibatalkan.`);
  if (!confirmed) return;

  try {
    const res = await ApiClient.deleteRecord(moduleName, id);
    showToast(res.message || 'Data berhasil dihapus.', 'success');
    await loadModuleData(moduleName);
  } catch (err) {
    showToast(err.message, 'error');
    syncRoleUI();
  }
}

function initDynamicCrudEvents() {
  document.querySelectorAll('[data-create-module]').forEach((btn) => {
    btn.addEventListener('click', () => openCreateModal(btn.dataset.createModule));
  });

  document.getElementById('app-content').addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit-module]');
    if (editBtn) {
      openEditModal(editBtn.dataset.editModule, editBtn.dataset.id);
      return;
    }

    const deleteBtn = e.target.closest('[data-delete-module]');
    if (deleteBtn) {
      handleDeleteRecord(deleteBtn.dataset.deleteModule, deleteBtn.dataset.id);
    }
  });

  document.getElementById('form-record-dynamic').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const record = {};
    formData.forEach((value, key) => {
      record[key] = typeof value === 'string' ? value.trim() : value;
    });

    if (record.score !== undefined && record.score !== '') {
      record.score = Number(record.score);
    }

    const saveBtn = document.getElementById('btn-save-record');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Menyimpan...';

    try {
      if (currentFormContext.mode === 'create') {
        const res = await ApiClient.createRecord(currentFormContext.module, record);
        showToast(res.message || 'Data berhasil ditambahkan.', 'success');
      } else {
        const res = await ApiClient.updateRecord(currentFormContext.module, currentFormContext.id, record);
        showToast(res.message || 'Data berhasil diperbarui.', 'success');
      }
      closeModal('modal-record-form');
      await loadModuleData(currentFormContext.module);
    } catch (err) {
      showToast(err.message, 'error');
      syncRoleUI();
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Simpan Data';
    }
  });
}

/* ===========================
   5. INISIALISASI APLIKASI
   =========================== */
document.addEventListener('DOMContentLoaded', () => {
  const today = getTodayString();
  document.getElementById('dashboard-date').value = today;

  if (!isApiConfigured()) {
    document.getElementById('config-warning-banner').classList.remove('hidden');
  }

  restoreAdminSession();
  syncRoleUI();
  initPwa();
  initAdminAuth();
  initQrAttendance();
  initDynamicCrudEvents();

  // Navigasi Sidebar & Bottom Bar
  document.querySelectorAll('.nav-item, .bottom-nav-item').forEach((btn) => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.view));
  });

  // Quick links pada Dashboard
  document.querySelectorAll('[data-jump]').forEach((btn) => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.jump));
  });

  // Tombol tutup modal
  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
  });

  // Tombol filter & muat ulang
  document.getElementById('dashboard-date').addEventListener('change', loadDashboard);
  document.getElementById('btn-apply-attendance-filter').addEventListener('click', () => loadModuleData('attendance'));
  document.getElementById('btn-apply-kitab-filter').addEventListener('click', () => loadModuleData('kitab'));
  document.getElementById('btn-apply-daily-filter').addEventListener('click', () => loadModuleData('daily'));
  document.getElementById('btn-apply-syafawi-filter').addEventListener('click', () => loadModuleData('syafawi'));
  document.getElementById('btn-apply-uas-filter').addEventListener('click', () => loadModuleData('uas'));
  document.getElementById('btn-apply-students-filter').addEventListener('click', () => loadModuleData('students'));

  document.getElementById('btn-refresh').addEventListener('click', () => {
    const active = getState().activeView;
    navigateTo(active);
  });

  navigateTo('dashboard');
});
