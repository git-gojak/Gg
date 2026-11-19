import { APP_CONFIG } from './config.js';

const internalState = {
  activeView: 'dashboard',
  isAdmin: false,
  deferredInstallPrompt: null,
  summary: null,
  records: {
    students: [],
    attendance: [],
    kitab: [],
    daily: [],
    syafawi: [],
    uas: []
  }
};

export function getState() {
  return internalState;
}

export function setActiveView(viewName) {
  internalState.activeView = viewName;
}

export function getAdminPin() {
  return sessionStorage.getItem(APP_CONFIG.SESSION_PIN_KEY) || '';
}

export function setAdminSession(pin) {
  sessionStorage.setItem(APP_CONFIG.SESSION_PIN_KEY, pin);
  internalState.isAdmin = true;
}

export function clearAdminSession() {
  sessionStorage.removeItem(APP_CONFIG.SESSION_PIN_KEY);
  internalState.isAdmin = false;
}

export function restoreAdminSession() {
  const savedPin = getAdminPin();
  internalState.isAdmin = Boolean(savedPin);
  return internalState.isAdmin;
}

export function setSummaryData(summary) {
  internalState.summary = summary;
}

export function setModuleRecords(moduleName, items) {
  internalState.records[moduleName] = Array.isArray(items) ? items : [];
}

export function getUniqueClasses() {
  const classSet = new Set();
  Object.values(internalState.records).forEach((list) => {
    list.forEach((item) => {
      if (item && item.class_group) {
        classSet.add(String(item.class_group).trim());
      }
    });
  });
  return Array.from(classSet).sort();
}
