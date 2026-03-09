// ============================================
// WMS - Utility Functions (global namespace)
// ============================================
window.WMS = window.WMS || {};

WMS.generateId = function() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
};

WMS.formatDate = function(date) {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

WMS.formatDateTime = function(date) {
  if (!date) return '—';
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

WMS.formatNumber = function(num) {
  if (num == null) return '0';
  return Number(num).toLocaleString('es-ES');
};

// Toast
WMS._toastContainer = null;
WMS.showToast = function(message, type, duration) {
  type = type || 'info'; duration = duration || 3500;
  if (!WMS._toastContainer) {
    WMS._toastContainer = document.createElement('div');
    WMS._toastContainer.className = 'toast-container';
    document.body.appendChild(WMS._toastContainer);
  }
  var icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  var toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = '<span class="toast-icon">' + (icons[type]||'ℹ') + '</span>'
    + '<span class="toast-message">' + message + '</span>'
    + '<span class="toast-close" onclick="this.parentElement.remove()">✕</span>';
  WMS._toastContainer.appendChild(toast);
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 300ms ease';
    setTimeout(function() { toast.remove(); }, 300);
  }, duration);
};

// Modal
WMS.openModal = function(id) {
  var el = document.getElementById(id);
  if (el) { el.classList.add('active'); document.body.style.overflow = 'hidden'; }
};
WMS.closeModal = function(id) {
  var el = document.getElementById(id);
  if (el) { el.classList.remove('active'); document.body.style.overflow = ''; }
};
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay') && e.target.classList.contains('active')) {
    e.target.classList.remove('active'); document.body.style.overflow = '';
  }
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    var active = document.querySelector('.modal-overlay.active');
    if (active) { active.classList.remove('active'); document.body.style.overflow = ''; }
  }
});

// Debounce
WMS.debounce = function(fn, delay) {
  var timer; delay = delay || 300;
  return function() {
    var args = arguments, ctx = this;
    clearTimeout(timer);
    timer = setTimeout(function() { fn.apply(ctx, args); }, delay);
  };
};

// Pagination
WMS.paginate = function(items, page, perPage) {
  page = page || 1; perPage = perPage || 15;
  var total = items.length, totalPages = Math.ceil(total / perPage);
  var start = (page - 1) * perPage;
  return { data: items.slice(start, start + perPage), total: total, totalPages: totalPages, page: page, perPage: perPage };
};

WMS.renderPagination = function(container, info, onPageChange) {
  if (info.totalPages <= 1) { container.innerHTML = ''; return; }
  var start = (info.page - 1) * 15 + 1;
  var end = Math.min(info.page * 15, info.total);
  var html = '<span>Mostrando ' + start + '-' + end + ' de ' + info.total + '</span><div class="pagination-buttons">';
  html += '<button class="pagination-btn" ' + (info.page === 1 ? 'disabled' : '') + ' data-page="' + (info.page - 1) + '">‹</button>';
  for (var i = 1; i <= info.totalPages; i++) {
    if (info.totalPages > 7 && i > 3 && i < info.totalPages - 2 && Math.abs(i - info.page) > 1) {
      if (i === 4 || i === info.totalPages - 3) html += '<span style="padding:0 4px;color:var(--text-muted)">…</span>';
      continue;
    }
    html += '<button class="pagination-btn ' + (i === info.page ? 'active' : '') + '" data-page="' + i + '">' + i + '</button>';
  }
  html += '<button class="pagination-btn" ' + (info.page === info.totalPages ? 'disabled' : '') + ' data-page="' + (info.page + 1) + '">›</button></div>';
  container.innerHTML = html;
  container.querySelectorAll('.pagination-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var p = parseInt(btn.dataset.page);
      if (p >= 1 && p <= info.totalPages) onPageChange(p);
    });
  });
};
