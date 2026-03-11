// ============================================
// WMS - App Router & Shell (global namespace)
// ============================================
(function() {
  function getPath() { return (window.location.hash.replace('#', '') || '/dashboard'); }

  async function navigate() {
    var path = getPath();
    
    // Check if session is truly valid (DB check)
    if (WMS.isAuthenticated()) {
      var user = await WMS.getCurrentUser();
      if (!user) { WMS.logout(); return; }
      
      // Force shell refresh if role changed while in session
      var shellRoleEl = document.querySelector('.sidebar-user-role');
      if (shellRoleEl && shellRoleEl.textContent !== WMS.getRoleLabel(user.role)) {
        await renderShell();
      }
    }

    if (!WMS.isAuthenticated() && path !== '/login') { window.location.hash = '#/login'; return; }
    if (WMS.isAuthenticated() && path === '/login') { window.location.hash = '#/dashboard'; return; }
    if (path === '/login') { WMS.renderLogin(); return; }
    if (!document.getElementById('appShell')) await renderShell();
    updateActiveNav(path);
    var c = document.getElementById('pageContent'); if (!c) return;
    
    // Show a small loader while switching pages
    c.innerHTML = '<div style="display:flex;justify-content:center;padding:50px;color:var(--text-secondary)">Cargando...</div>';

    if (path === '/dashboard') await WMS.renderDashboard(c);
    else if (path === '/products') await WMS.renderProducts(c);
    else if (path === '/locations') await WMS.renderLocations(c);
    else if (path.indexOf('/inventory') === 0) { var sub = path.split('/')[2] || null; await WMS.renderInventory(c, sub); }
    else if (path === '/users') await WMS.renderUsers(c);
    else if (path === '/map3d') await WMS.renderMap3D(c);
    else c.innerHTML = '<div class="empty-state" style="margin-top:var(--space-12)"><div class="empty-state-icon">🔍</div><h3 class="empty-state-title">Página no encontrada</h3><a href="#/dashboard" class="btn btn-primary">Ir al Dashboard</a></div>';
    updateBreadcrumb(path);
  }

  async function renderShell() {
    var user = await WMS.getCurrentUser();
    document.getElementById('app').innerHTML = '<div class="app" id="appShell">'
      + '<div class="sidebar-overlay" id="sidebarOverlay"></div>'
      + '<aside class="sidebar" id="sidebar">'
      + '<div class="sidebar-header"><div class="sidebar-logo">📦</div><div class="sidebar-brand"><span class="sidebar-brand-name">ITC Warehouse</span><span class="sidebar-brand-sub">Gestión de Almacén</span></div></div>'
      + '<nav class="sidebar-nav">'
      + '<div class="nav-section"><div class="nav-section-title">Principal</div><a href="#/dashboard" class="nav-item" data-path="/dashboard"><span class="nav-item-icon">📊</span> Dashboard</a></div>'
      + '<div class="nav-section"><div class="nav-section-title">Almacén</div><a href="#/locations" class="nav-item" data-path="/locations"><span class="nav-item-icon">📍</span> Ubicaciones</a><a href="#/map3d" class="nav-item" data-path="/map3d"><span class="nav-item-icon">🗺️</span> Mapa 3D</a></div>'
      + '<div class="nav-section"><div class="nav-section-title">Operaciones</div>'
      + '<a href="#/inventory/stock" class="nav-item" data-path="/inventory/stock"><span class="nav-item-icon">📋</span> Control de stocks</a>'
      + '<a href="#/inventory/entry" class="nav-item" data-path="/inventory/entry"><span class="nav-item-icon">📥</span> Nueva Entrada</a>'
      + '<a href="#/inventory/exit" class="nav-item" data-path="/inventory/exit"><span class="nav-item-icon">📤</span> Nueva Salida</a>'
      + '<a href="#/inventory/movements" class="nav-item" data-path="/inventory/movements"><span class="nav-item-icon">🔄</span> Movimientos</a>'
      + '<a href="#/products" class="nav-item" data-path="/products"><span class="nav-item-icon">📦</span> Productos</a>'
      + '</div>'
      + '<div class="nav-section"><div class="nav-section-title">Sistema</div><a href="#/users" class="nav-item" data-path="/users"><span class="nav-item-icon">👥</span> Usuarios</a></div>'
      + '</nav>'
      + '<div class="sidebar-footer">'
      + '<div class="sidebar-user"><div class="sidebar-user-avatar">' + WMS.getUserInitials(user?user.name:'') + '</div><div class="sidebar-user-info"><div class="sidebar-user-name">' + (user?user.name:'Usuario') + '</div><div class="sidebar-user-role">' + WMS.getRoleLabel(user?user.role:'') + '</div></div></div>'
      + '<button class="btn btn-logout" id="logoutBtn"><span>Cerrar Sesión</span> <span>🚪</span></button>'
      + '</div>'
      + '</aside>'
      + '<main class="main">'
      + '<header class="topbar"><button class="topbar-toggle" id="sidebarToggle">☰</button><div class="topbar-breadcrumb" id="breadcrumb"><span>ITC Warehouse</span><span>›</span><span class="topbar-breadcrumb-current">Dashboard</span></div><div class="topbar-search"><span class="topbar-search-icon">🔍</span><input type="text" placeholder="Buscar productos, ubicaciones..." id="globalSearch"></div><div class="topbar-actions"><button class="topbar-btn" title="Notificaciones">🔔<span class="badge-dot"></span></button></div></header>'
      + '<div class="content" id="pageContent"></div>'
      + '</main></div>';

    document.getElementById('sidebarToggle').addEventListener('click', function() {
      document.getElementById('sidebar').classList.toggle('open');
      document.getElementById('sidebarOverlay').classList.toggle('active');
    });
    document.getElementById('sidebarOverlay').addEventListener('click', function() {
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('sidebarOverlay').classList.remove('active');
    });
    document.getElementById('logoutBtn').addEventListener('click', function() {
      if (confirm('¿Cerrar sesión?')) WMS.logout();
    });
    document.querySelectorAll('.nav-item').forEach(function(item) {
      item.addEventListener('click', function() {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebarOverlay').classList.remove('active');
      });
    });

    // Global Search Logic
    var searchInput = document.getElementById('globalSearch');
    var searchTimeout;
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(function() {
          navigate(); // Re-render current page with search context
        }, 500);
      });
    }
  }

  function updateActiveNav(path) {
    document.querySelectorAll('.nav-item').forEach(function(item) {
      var ip = item.dataset.path;
      if (ip === path || (path.startsWith(ip) && ip !== '/dashboard')) item.classList.add('active');
      else item.classList.remove('active');
    });
  }

  var routeTitles = { '/dashboard':'Dashboard', '/products':'Productos', '/locations':'Ubicaciones', '/inventory':'Control de stocks', '/inventory/entry':'Entrada', '/inventory/exit':'Salida', '/inventory/stock':'Stock', '/inventory/movements':'Movimientos', '/users':'Usuarios', '/map3d':'Mapa 3D' };
  function updateBreadcrumb(path) {
    var bc = document.getElementById('breadcrumb'); if (!bc) return;
    var title = routeTitles[path] || 'Página';
    var parent = path.split('/').length > 2 ? '/' + path.split('/')[1] : null;
    var html = '<span>ITC Warehouse</span>';
    if (parent && routeTitles[parent]) html += '<span>›</span><a href="#' + parent + '" style="color:var(--text-muted)">' + routeTitles[parent] + '</a>';
    html += '<span>›</span><span class="topbar-breadcrumb-current">' + title + '</span>';
    bc.innerHTML = html;
  }

  window.addEventListener('hashchange', navigate);
  window.addEventListener('DOMContentLoaded', navigate);
  if (document.readyState !== 'loading') navigate();
})();
