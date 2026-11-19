import { APP_CONFIG } from './config.js';
import { getState, getUniqueClasses } from './state.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3800);
}

export function openModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.remove('hidden');
}

export function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.add('hidden');
}

export function syncRoleUI() {
  const { isAdmin } = getState();
  const desktopBadge = document.getElementById('role-indicator-desktop');
  const desktopBtn = document.getElementById('btn-admin-desktop');
  const mobileBtn = document.getElementById('btn-admin-mobile');
  const accessDesc = document.getElementById('access-mode-description');

  document.querySelectorAll('.admin-only').forEach((el) => {
    el.classList.toggle('hidden', !isAdmin);
  });

  if (isAdmin) {
    desktopBadge.textContent = 'Mode Admin (Aktif)';
    desktopBadge.className = 'role-badge role-admin';
    desktopBtn.textContent = 'Keluar Admin';
    desktopBtn.className = 'btn btn-danger btn-block';
    mobileBtn.textContent = 'Keluar';
    mobileBtn.className = 'btn btn-danger btn-sm mobile-only';
    if (accessDesc) {
      accessDesc.innerHTML = 'Anda sedang berada di <strong>Mode Admin</strong>. Anda dapat memindai absensi QR, menambah, mengubah, dan menghapus data akademik.';
    }
  } else {
    desktopBadge.textContent = 'Mode Publik (Read-Only)';
    desktopBadge.className = 'role-badge role-public';
    desktopBtn.textContent = 'Masuk Admin';
    desktopBtn.className = 'btn btn-primary btn-block';
    mobileBtn.textContent = 'Admin';
    mobileBtn.className = 'btn btn-primary btn-sm mobile-only';
    if (accessDesc) {
      accessDesc.innerHTML = 'Anda sedang mengakses aplikasi dalam <strong>Mode Publik (Read-Only)</strong>. Seluruh rekap dapat dilihat langsung. Untuk melakukan pemindaian QR, input nilai, koreksi kitab, atau mengubah data, masuk ke <strong>Mode Admin</strong>.';
    }
  }
}

export function switchViewUI(viewName) {
  document.querySelectorAll('.view-section').forEach((sec) => {
    sec.classList.toggle('active', sec.id === `view-${viewName}`);
  });

  document.querySelectorAll('.nav-item, .bottom-nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  const meta = APP_CONFIG.VIEW_TITLES[viewName] || APP_CONFIG.VIEW_TITLES.dashboard;
  document.getElementById('page-title').textContent = meta.title;
  document.getElementById('page-subtitle').textContent = meta.subtitle;
}

export function renderDashboardSummary(summary) {
  const data = summary || {};
  const att = data.attendance_today || {};
  const counts = data.counts || {};

  document.getElementById('stat-students').textContent = data.total_active_students ?? 0;
  document.getElementById('stat-hadir').textContent = att.HADIR ?? 0;
  document.getElementById('stat-attendance-detail').textContent =
    `Izin: ${att.IZIN ?? 0} | Sakit: ${att.SAKIT ?? 0} | Alpa: ${att.ALPA ?? 0}`;

  document.getElementById('stat-kitab').textContent = counts.kitab ?? 0;
  const totalGrades = (counts.daily ?? 0) + (counts.syafawi ?? 0) + (counts.uas ?? 0);
  document.getElementById('stat-grades').textContent = totalGrades;
  document.getElementById('stat-grades-detail').textContent =
    `Harian: ${counts.daily ?? 0} | Syafawi: ${counts.syafawi ?? 0} | UAS: ${counts.uas ?? 0}`;
}

export function renderLoadingState(containerId, message = 'Memuat data...') {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="state-box">
      <div class="spinner" aria-hidden="true"></div>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

export function renderErrorState(containerId, message) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="state-box state-error">
      <p><strong>Gagal memuat data:</strong> ${escapeHtml(message)}</p>
    </div>
  `;
}

export function populateClassFilterOptions() {
  const classes = getUniqueClasses();
  const selectIds = [
    'filter-attendance-class',
    'filter-kitab-class',
    'filter-daily-class',
    'filter-syafawi-class',
    'filter-uas-class',
    'filter-students-class'
  ];

  selectIds.forEach((id) => {
    const select = document.getElementById(id);
    if (!select) return;
    const current = select.value;
    select.innerHTML = '<option value="">Semua Kelas</option>';
    classes.forEach((cls) => {
      const opt = document.createElement('option');
      opt.value = cls;
      opt.textContent = cls;
      select.appendChild(opt);
    });
    select.value = current;
  });
}

const MODULE_COLUMNS = {
  attendance: [
    { key: 'date', label: 'Tanggal' },
    { key: 'session_name', label: 'Sesi' },
    { key: 'nis', label: 'NIS' },
    { key: 'full_name', label: 'Nama Siswa' },
    { key: 'class_group', label: 'Kelas' },
    { key: 'status', label: 'Status', badge: true },
    { key: 'input_method', label: 'Metode' },
    { key: 'notes', label: 'Catatan' }
  ],
  kitab: [
    { key: 'date', label: 'Tanggal' },
    { key: 'nis', label: 'NIS' },
    { key: 'full_name', label: 'Nama Siswa' },
    { key: 'class_group', label: 'Kelas' },
    { key: 'kitab_name', label: 'Kitab' },
    { key: 'chapter_page', label: 'Bab / Halaman' },
    { key: 'score', label: 'Nilai' },
    { key: 'predicate', label: 'Predikat' },
    { key: 'notes', label: 'Catatan' }
  ],
  daily: [
    { key: 'date', label: 'Tanggal' },
    { key: 'nis', label: 'NIS' },
    { key: 'full_name', label: 'Nama Siswa' },
    { key: 'class_group', label: 'Kelas' },
    { key: 'subject_topic', label: 'Materi / Mapel' },
    { key: 'score', label: 'Nilai' },
    { key: 'notes', label: 'Catatan' }
  ],
  syafawi: [
    { key: 'date', label: 'Tanggal' },
    { key: 'period', label: 'Periode' },
    { key: 'nis', label: 'NIS' },
    { key: 'full_name', label: 'Nama Siswa' },
    { key: 'class_group', label: 'Kelas' },
    { key: 'topic', label: 'Materi Syafawi' },
    { key: 'score', label: 'Nilai' },
    { key: 'notes', label: 'Catatan' }
  ],
  uas: [
    { key: 'academic_year', label: 'Tahun Ajaran' },
    { key: 'semester', label: 'Semester' },
    { key: 'nis', label: 'NIS' },
    { key: 'full_name', label: 'Nama Siswa' },
    { key: 'class_group', label: 'Kelas' },
    { key: 'subject', label: 'Mata Pelajaran' },
    { key: 'score', label: 'Nilai UAS' },
    { key: 'notes', label: 'Catatan' }
  ],
  students: [
    { key: 'student_id', label: 'ID' },
    { key: 'nis', label: 'NIS' },
    { key: 'full_name', label: 'Nama Lengkap' },
    { key: 'class_group', label: 'Kelas' },
    { key: 'qr_text', label: 'QR Text' },
    { key: 'status', label: 'Status', badge: true }
  ]
};

export function renderModuleRecords(moduleName, items) {
  const container = document.getElementById(`list-${moduleName}`);
  const countBadge = document.getElementById(`count-${moduleName}`);
  if (!container) return;

  if (countBadge) {
    countBadge.textContent = moduleName === 'students' ? `${items.length} siswa` : `${items.length} data`;
  }

  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="state-box">
        <p>Belum ada data untuk ditampilkan pada modul ini.</p>
      </div>
    `;
    return;
  }

  const { isAdmin } = getState();
  const cols = MODULE_COLUMNS[moduleName] || [];
  const pkField = APP_CONFIG.PRIMARY_KEYS[moduleName];

  // 1. Render Tabel Desktop
  const theadHtml = cols.map((c) => `<th>${escapeHtml(c.label)}</th>`).join('') +
    (isAdmin ? '<th>Aksi</th>' : '');

  const tbodyHtml = items.map((row) => {
    const pkVal = escapeHtml(row[pkField] || '');
    const cells = cols.map((c) => {
      const raw = row[c.key] ?? '-';
      if (c.badge) {
        return `<td><span class="badge badge-${escapeHtml(raw)}">${escapeHtml(raw)}</span></td>`;
      }
      return `<td>${escapeHtml(raw === '' ? '-' : raw)}</td>`;
    }).join('');

    const actionCell = isAdmin
      ? `<td>
          <div class="row-actions">
            <button type="button" class="btn btn-outline btn-sm" data-edit-module="${moduleName}" data-id="${pkVal}">Edit</button>
            <button type="button" class="btn btn-danger btn-sm" data-delete-module="${moduleName}" data-id="${pkVal}">Hapus</button>
          </div>
        </td>`
      : '';

    return `<tr>${cells}${actionCell}</tr>`;
  }).join('');

  // 2. Render Card-Stack HP Android
  const mobileCardsHtml = items.map((row) => {
    const pkVal = escapeHtml(row[pkField] || '');
    const title = escapeHtml(row.full_name || row.student_id || pkVal);
    const subtitle = escapeHtml([row.nis, row.class_group].filter(Boolean).join(' • '));
    const badgeVal = row.status || row.score || row.predicate || '';

    const metaPairs = cols
      .filter((c) => !['full_name', 'nis', 'class_group', 'status'].includes(c.key))
      .map((c) => `<div><strong>${escapeHtml(c.label)}:</strong> ${escapeHtml(row[c.key] || '-')}</div>`)
      .join('');

    const mobileActionHtml = isAdmin
      ? `<div class="record-card-actions">
          <button type="button" class="btn btn-outline btn-sm" data-edit-module="${moduleName}" data-id="${pkVal}">Edit</button>
          <button type="button" class="btn btn-danger btn-sm" data-delete-module="${moduleName}" data-id="${pkVal}">Hapus</button>
        </div>`
      : '';

    return `
      <article class="record-card">
        <div class="record-card-top">
          <div>
            <strong>${title}</strong>
            <div class="muted-text">${subtitle}</div>
          </div>
          ${badgeVal !== '' ? `<span class="badge badge-${escapeHtml(badgeVal)}">${escapeHtml(badgeVal)}</span>` : ''}
        </div>
        <div class="record-card-meta">${metaPairs}</div>
        ${mobileActionHtml}
      </article>
    `;
  }).join('');

  container.innerHTML = `
    <div class="table-responsive">
      <table class="data-table">
        <thead><tr>${theadHtml}</tr></thead>
        <tbody>${tbodyHtml}</tbody>
      </table>
    </div>
    <div class="mobile-cards">${mobileCardsHtml}</div>
  `;
}

export function buildDynamicFormFields(moduleName, existingRecord = null) {
  const { records } = getState();
  const today = new Date().toISOString().slice(0, 10);
  const students = records.students || [];

  const studentOptions = students.map((s) => {
    const selected = existingRecord && existingRecord.student_id === s.student_id ? 'selected' : '';
    return `<option value="${escapeHtml(s.student_id)}" ${selected}>${escapeHtml(s.nis)} — ${escapeHtml(s.full_name)} (${escapeHtml(s.class_group)})</option>`;
  }).join('');

  const studentSelectHtml = `
    <div class="form-group span-2">
      <label for="fld-student_id">Siswa *</label>
      <select id="fld-student_id" name="student_id" class="form-control" required>
        <option value="">-- Pilih Siswa --</option>
        ${studentOptions}
      </select>
    </div>
  `;

  const schemas = {
    students: `
      <div class="form-group">
        <label for="fld-nis">NIS *</label>
        <input type="text" id="fld-nis" name="nis" class="form-control" value="${escapeHtml(existingRecord?.nis || '')}" required>
      </div>
      <div class="form-group">
        <label for="fld-class_group">Kelas / Kelompok *</label>
        <input type="text" id="fld-class_group" name="class_group" class="form-control" value="${escapeHtml(existingRecord?.class_group || '')}" required>
      </div>
      <div class="form-group span-2">
        <label for="fld-full_name">Nama Lengkap Siswa *</label>
        <input type="text" id="fld-full_name" name="full_name" class="form-control" value="${escapeHtml(existingRecord?.full_name || '')}" required>
      </div>
      <div class="form-group">
        <label for="fld-qr_text">QR Text (Sesuai Pola) *</label>
        <input type="text" id="fld-qr_text" name="qr_text" class="form-control" value="${escapeHtml(existingRecord?.qr_text || '')}" required>
      </div>
      <div class="form-group">
        <label for="fld-status">Status *</label>
        <select id="fld-status" name="status" class="form-control" required>
          <option value="ACTIVE" ${existingRecord?.status === 'ACTIVE' ? 'selected' : ''}>ACTIVE</option>
          <option value="INACTIVE" ${existingRecord?.status === 'INACTIVE' ? 'selected' : ''}>INACTIVE</option>
        </select>
      </div>
    `,
    attendance: `
      ${studentSelectHtml}
      <div class="form-group">
        <label for="fld-date">Tanggal *</label>
        <input type="date" id="fld-date" name="date" class="form-control" value="${escapeHtml(existingRecord?.date || today)}" required>
      </div>
      <div class="form-group">
        <label for="fld-session_name">Sesi *</label>
        <input type="text" id="fld-session_name" name="session_name" class="form-control" value="${escapeHtml(existingRecord?.session_name || 'Pagi')}" required>
      </div>
      <div class="form-group">
        <label for="fld-status">Status Kehadiran *</label>
        <select id="fld-status" name="status" class="form-control" required>
          ${['HADIR', 'IZIN', 'SAKIT', 'ALPA'].map((st) =>
            `<option value="${st}" ${existingRecord?.status === st ? 'selected' : ''}>${st}</option>`
          ).join('')}
        </select>
      </div>
      <div class="form-group">
        <label for="fld-input_method">Metode Input</label>
        <input type="text" id="fld-input_method" name="input_method" class="form-control" value="${escapeHtml(existingRecord?.input_method || 'MANUAL')}" readonly>
      </div>
      <div class="form-group span-2">
        <label for="fld-notes">Catatan</label>
        <input type="text" id="fld-notes" name="notes" class="form-control" value="${escapeHtml(existingRecord?.notes || '')}">
      </div>
    `,
    kitab: `
      ${studentSelectHtml}
      <div class="form-group">
        <label for="fld-date">Tanggal *</label>
        <input type="date" id="fld-date" name="date" class="form-control" value="${escapeHtml(existingRecord?.date || today)}" required>
      </div>
      <div class="form-group">
        <label for="fld-kitab_name">Nama Kitab *</label>
        <input type="text" id="fld-kitab_name" name="kitab_name" class="form-control" value="${escapeHtml(existingRecord?.kitab_name || '')}" required>
      </div>
      <div class="form-group">
        <label for="fld-chapter_page">Bab / Halaman *</label>
        <input type="text" id="fld-chapter_page" name="chapter_page" class="form-control" value="${escapeHtml(existingRecord?.chapter_page || '')}" required>
      </div>
      <div class="form-group">
        <label for="fld-score">Nilai (0 - 100)</label>
        <input type="number" id="fld-score" name="score" min="0" max="100" class="form-control" value="${escapeHtml(existingRecord?.score ?? '')}">
      </div>
      <div class="form-group">
        <label for="fld-predicate">Predikat</label>
        <input type="text" id="fld-predicate" name="predicate" class="form-control" placeholder="Lancar / Cukup / Mengulang" value="${escapeHtml(existingRecord?.predicate || '')}">
      </div>
      <div class="form-group">
        <label for="fld-notes">Catatan Koreksi</label>
        <input type="text" id="fld-notes" name="notes" class="form-control" value="${escapeHtml(existingRecord?.notes || '')}">
      </div>
    `,
    daily: `
      ${studentSelectHtml}
      <div class="form-group">
        <label for="fld-date">Tanggal *</label>
        <input type="date" id="fld-date" name="date" class="form-control" value="${escapeHtml(existingRecord?.date || today)}" required>
      </div>
      <div class="form-group">
        <label for="fld-subject_topic">Materi / Mata Pelajaran *</label>
        <input type="text" id="fld-subject_topic" name="subject_topic" class="form-control" value="${escapeHtml(existingRecord?.subject_topic || '')}" required>
      </div>
      <div class="form-group">
        <label for="fld-score">Nilai (0 - 100) *</label>
        <input type="number" id="fld-score" name="score" min="0" max="100" class="form-control" value="${escapeHtml(existingRecord?.score ?? '')}" required>
      </div>
      <div class="form-group">
        <label for="fld-notes">Catatan</label>
        <input type="text" id="fld-notes" name="notes" class="form-control" value="${escapeHtml(existingRecord?.notes || '')}">
      </div>
    `,
    syafawi: `
      ${studentSelectHtml}
      <div class="form-group">
        <label for="fld-date">Tanggal *</label>
        <input type="date" id="fld-date" name="date" class="form-control" value="${escapeHtml(existingRecord?.date || today)}" required>
      </div>
      <div class="form-group">
        <label for="fld-period">Periode *</label>
        <input type="text" id="fld-period" name="period" class="form-control" placeholder="Contoh: Ganjil 2026/2027" value="${escapeHtml(existingRecord?.period || '')}" required>
      </div>
      <div class="form-group">
        <label for="fld-topic">Materi Syafawi *</label>
        <input type="text" id="fld-topic" name="topic" class="form-control" value="${escapeHtml(existingRecord?.topic || '')}" required>
      </div>
      <div class="form-group">
        <label for="fld-score">Nilai (0 - 100) *</label>
        <input type="number" id="fld-score" name="score" min="0" max="100" class="form-control" value="${escapeHtml(existingRecord?.score ?? '')}" required>
      </div>
      <div class="form-group span-2">
        <label for="fld-notes">Catatan Penguji</label>
        <input type="text" id="fld-notes" name="notes" class="form-control" value="${escapeHtml(existingRecord?.notes || '')}">
      </div>
    `,
    uas: `
      ${studentSelectHtml}
      <div class="form-group">
        <label for="fld-academic_year">Tahun Ajaran *</label>
        <input type="text" id="fld-academic_year" name="academic_year" class="form-control" placeholder="2026/2027" value="${escapeHtml(existingRecord?.academic_year || '2026/2027')}" required>
      </div>
      <div class="form-group">
        <label for="fld-semester">Semester *</label>
        <select id="fld-semester" name="semester" class="form-control" required>
          <option value="GANJIL" ${existingRecord?.semester === 'GANJIL' ? 'selected' : ''}>GANJIL</option>
          <option value="GENAP" ${existingRecord?.semester === 'GENAP' ? 'selected' : ''}>GENAP</option>
        </select>
      </div>
      <div class="form-group">
        <label for="fld-subject">Mata Pelajaran / Kitab *</label>
        <input type="text" id="fld-subject" name="subject" class="form-control" value="${escapeHtml(existingRecord?.subject || '')}" required>
      </div>
      <div class="form-group">
        <label for="fld-score">Nilai UAS (0 - 100) *</label>
        <input type="number" id="fld-score" name="score" min="0" max="100" class="form-control" value="${escapeHtml(existingRecord?.score ?? '')}" required>
      </div>
      <div class="form-group span-2">
        <label for="fld-notes">Catatan</label>
        <input type="text" id="fld-notes" name="notes" class="form-control" value="${escapeHtml(existingRecord?.notes || '')}">
      </div>
    `
  };

  return schemas[moduleName] || '';
}
