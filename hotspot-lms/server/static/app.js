/* EduLAN — shared client utilities */

(function initThemeEarly() {
  const saved = localStorage.getItem('edulan_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));
})();

function escapeHtml(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('edulan_theme', next);
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.textContent = next === 'dark' ? '☀️' : '🌙';
    btn.title = next === 'dark' ? 'Mode terang' : 'Mode gelap';
  });
}

function injectPageLoader() {
  if (document.getElementById('pageLoader')) return;
  const el = document.createElement('div');
  el.id = 'pageLoader';
  el.className = 'page-loader';
  el.innerHTML = '<div class="page-loader-bar"></div>';
  document.body.prepend(el);
}

function showPageLoader(active = true) {
  injectPageLoader();
  document.getElementById('pageLoader').classList.toggle('active', active);
}

function skeletonCards(count = 3) {
  return Array.from({ length: count }, () => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-line sm"></div>
      <div class="skeleton skeleton-line lg"></div>
      <div class="skeleton skeleton-line md"></div>
    </div>
  `).join('');
}

function skeletonStats(count = 4) {
  return `<div class="skeleton-grid" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr))">${Array.from({ length: count }, () => '<div class="skeleton skeleton-stat"></div>').join('')}</div>`;
}

function loadingCenter(text = 'Memuat data...') {
  return `<div class="loading-center"><div class="spinner"></div><span>${text}</span></div>`;
}

function setContainerLoading(id, loading, skeletonCount = 3) {
  const el = document.getElementById(id);
  if (!el) return;
  if (loading) el.innerHTML = skeletonCards(skeletonCount);
}

function brandLogo(size = 'md') {
  const sizes = { sm: 32, md: 36, lg: 48 };
  const s = sizes[size] || 36;
  return `<span class="brand-icon" style="width:${s}px;height:${s}px">
    <svg width="${Math.round(s * 0.55)}" height="${Math.round(s * 0.55)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  </span>`;
}

function requireAuth(role) {
  const user = JSON.parse(localStorage.getItem('hlms_user') || 'null');
  if (!user) { window.location.href = '/index.html'; return null; }
  if (role && user.role !== role) { window.location.href = '/index.html'; return null; }
  return user;
}

function logout() {
  localStorage.removeItem('hlms_user');
  window.location.href = '/index.html';
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

function courseTitle(id, courses) {
  return courses.find(c => c.id === id)?.title || 'Tanpa kelas';
}

function initThemeToggle(container) {
  if (!container || container.querySelector('.theme-toggle')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'theme-toggle';
  btn.textContent = getTheme() === 'dark' ? '☀️' : '🌙';
  btn.title = getTheme() === 'dark' ? 'Mode terang' : 'Mode gelap';
  btn.onclick = toggleTheme;
  container.appendChild(btn);
}

/* ── myITS Classroom shell helpers ── */

function getInitials(name) {
  if (!name) return '?';
  const parts = String(name).trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
}

function hidePageLoaderFull() {
  const el = document.getElementById('pageLoaderWrapper');
  if (el) {
    el.classList.add('hidden');
    setTimeout(() => el.remove(), 300);
  }
}

function toggleDrawer(side) {
  const left = document.getElementById('drawerPrimary');
  const right = document.getElementById('drawerBlocks');
  const overlay = document.getElementById('drawerOverlay');
  const body = document.body;
  if (side === 'left' && left) {
    left.classList.toggle('open');
    body.classList.toggle('drawer-left-open', left.classList.contains('open'));
  }
  if (side === 'right' && right) {
    right.classList.toggle('open');
    body.classList.toggle('drawer-right-open', right.classList.contains('open'));
  }
  if (overlay) overlay.style.display = (left?.classList.contains('open') || right?.classList.contains('open')) ? 'block' : 'none';
}

function closeAllDrawers() {
  document.getElementById('drawerPrimary')?.classList.remove('open');
  document.getElementById('drawerBlocks')?.classList.remove('open');
  document.getElementById('drawerOverlay') && (document.getElementById('drawerOverlay').style.display = 'none');
  document.body.classList.remove('drawer-left-open', 'drawer-right-open');
}

function toggleUserMenu() {
  document.getElementById('userDropdown')?.classList.toggle('show');
}

function toggleRecentMenu() {
  document.getElementById('recentDropdown')?.classList.toggle('show');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.edw-user-menu')) document.getElementById('userDropdown')?.classList.remove('show');
  if (!e.target.closest('.edw-recent-toggle')) document.getElementById('recentDropdown')?.classList.remove('show');
});

function setActiveNav(view) {
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.classList.toggle('active', el.dataset.nav === view);
  });
}

function toggleSectionCard(header) {
  const card = header.closest('.edw-section-card');
  if (card) card.classList.toggle('open');
}

function renderMiniCalendar(containerId, events, year, month) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const today = new Date();
  if (year === undefined) year = today.getFullYear();
  if (month === undefined) month = today.getMonth();

  const eventDays = new Set((events || []).map(e => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month ? d.getDate() : -1;
  }).filter(d => d > 0));

  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1; // Mon start
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

  let html = `<div class="edw-cal-controls">
    <h5>${monthNames[month]} ${year}</h5>
    <div class="edw-cal-nav">
      <button type="button" data-cal-prev aria-label="Bulan sebelumnya">‹</button>
      <button type="button" data-cal-next aria-label="Bulan berikutnya">›</button>
    </div>
  </div>
  <table class="edw-cal-table"><thead><tr>
    ${['Sen','Sel','Rab','Kam','Jum','Sab','Min'].map(d => `<th>${d}</th>`).join('')}
  </tr></thead><tbody>`;

  let day = 1;
  for (let row = 0; row < 6; row++) {
    html += '<tr>';
    for (let col = 0; col < 7; col++) {
      const cell = row * 7 + col;
      if (cell < startOffset || day > daysInMonth) {
        html += '<td><div class="edw-cal-day blank">·</div></td>';
      } else {
        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const hasEvent = eventDays.has(day);
        html += `<td><div class="edw-cal-day${isToday ? ' today' : ''}${hasEvent ? ' has-event' : ''}">
          <span class="edw-cal-num">${day}</span>${hasEvent ? '<span class="edw-cal-dot"></span>' : ''}
        </div></td>`;
        day++;
      }
    }
    html += '</tr>';
    if (day > daysInMonth) break;
  }
  html += '</tbody></table>';
  el.innerHTML = html;

  el.querySelector('[data-cal-prev]')?.addEventListener('click', () => {
    const m = month - 1;
    renderMiniCalendar(containerId, events, m < 0 ? year - 1 : year, m < 0 ? 11 : m);
  });
  el.querySelector('[data-cal-next]')?.addEventListener('click', () => {
    const m = month + 1;
    renderMiniCalendar(containerId, events, m > 11 ? year + 1 : year, m > 11 ? 0 : m);
  });
}

function renderTimeline(containerId, items, onAction) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!items.length) {
    el.innerHTML = '<div class="empty-state" style="padding:32px"><div class="empty-state-icon">📅</div><p>Tidak ada aktivitas mendatang</p></div>';
    return;
  }
  el.innerHTML = `<ul class="edw-timeline-list">${items.map(item => `
    <li class="edw-timeline-item">
      <div class="edw-timeline-icon ${item.type || 'assign'}">${item.icon || '📝'}</div>
      <div class="edw-timeline-body">
        <h5>${escapeHtml(item.title)}</h5>
        <p>${escapeHtml(item.course || '')}${item.due ? ' · Jatuh tempo ' + item.due : ''}</p>
      </div>
      ${onAction ? `<div class="edw-timeline-action"><button class="btn btn-sm btn-primary" data-tl-id="${escapeHtml(item.id)}">Buka</button></div>` : ''}
    </li>
  `).join('')}</ul>`;
  if (onAction) {
    el.querySelectorAll('[data-tl-id]').forEach(btn => {
      btn.addEventListener('click', () => onAction(btn.dataset.tlId));
    });
  }
}

function courseProgress(courseId, assignments, submissions, studentId) {
  const courseAssigns = assignments.filter(a => a.courseId === courseId);
  if (!courseAssigns.length) return 0;
  const submitted = courseAssigns.filter(a =>
    submissions.some(s => s.assignmentId === a.id && (!studentId || s.studentId === studentId))
  ).length;
  return Math.round((submitted / courseAssigns.length) * 100);
}

function initClassroomShell(options = {}) {
  const { role = 'student', activeNav = 'dashboard', user = {} } = options;
  const name = user.name || user.username || 'Pengguna';
  const initials = getInitials(name);
  const isTeacher = role === 'teacher';

  document.body.classList.add('classroom-body');
  if (window.innerWidth >= 992) {
    document.body.classList.add('drawer-left-open');
    setTimeout(() => document.getElementById('drawerPrimary')?.classList.add('open'), 0);
  }

  const avatarEl = document.getElementById('navUserInitials');
  if (avatarEl) avatarEl.textContent = initials;
  setActiveNav(activeNav);

  document.getElementById('drawerOverlay')?.addEventListener('click', closeAllDrawers);
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 992) {
      document.getElementById('drawerPrimary')?.classList.add('open');
      document.body.classList.add('drawer-left-open');
    }
  });

  hidePageLoaderFull();
}
