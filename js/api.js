import { APP_CONFIG, isApiConfigured } from './config.js';
import { getAdminPin, clearAdminSession } from './state.js';

function ensureConfigured() {
  if (!isApiConfigured()) {
    const err = new Error('URL Google Apps Script Web App belum diatur di js/config.js.');
    err.code = 'API_NOT_CONFIGURED';
    throw err;
  }
}

async function parseGasResponse(response) {
  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}`);
  }
  const result = await response.json();
  if (!result || typeof result.ok !== 'boolean') {
    throw new Error('Format respons server tidak valid.');
  }
  if (!result.ok) {
    const code = result.error?.code || 'INTERNAL_ERROR';
    const message = result.error?.message || 'Terjadi kesalahan pada server.';
    if (code === 'UNAUTHORIZED') {
      clearAdminSession();
    }
    const err = new Error(message);
    err.code = code;
    throw err;
  }
  return result;
}

async function apiGet(params) {
  ensureConfigured();
  const url = new URL(APP_CONFIG.GAS_WEB_APP_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      url.searchParams.set(key, String(value).trim());
    }
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    cache: 'no-store'
  });
  return parseGasResponse(response);
}

async function apiPost(action, payload = {}, explicitPin = null) {
  ensureConfigured();
  const pin = explicitPin !== null ? explicitPin : getAdminPin();

  // Menggunakan text/plain agar bebas CORS preflight pada Google Apps Script Web App
  const response = await fetch(APP_CONFIG.GAS_WEB_APP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify({
      action,
      pin,
      payload
    })
  });
  return parseGasResponse(response);
}

export const ApiClient = {
  getSummary(date) {
    return apiGet({ action: 'getSummary', date });
  },

  getPublicData(module, filters = {}) {
    return apiGet({
      action: 'getPublicData',
      module,
      date: filters.date,
      class_group: filters.class_group,
      period: filters.period,
      search: filters.search
    });
  },

  verifyAdmin(pin) {
    return apiPost('verifyAdmin', {}, pin);
  },

  scanAttendanceQr(payload) {
    return apiPost('scanAttendanceQr', payload);
  },

  createRecord(module, record) {
    return apiPost('createRecord', { module, record });
  },

  updateRecord(module, id, record) {
    return apiPost('updateRecord', { module, id, record });
  },

  deleteRecord(module, id) {
    return apiPost('deleteRecord', { module, id });
  }
};
