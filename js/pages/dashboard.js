// ============================================
// WMS - Dashboard Page (global namespace)
// ============================================
(function() {
  WMS.renderDashboard = function(container) {
    var user = WMS.getCurrentUser();
    var tp = WMS.Stats.getTotalProducts(), ts = WMS.Stats.getTotalStock();
    var occ = WMS.Stats.getOccupancyPercent(), low = WMS.Stats.getLowStockProducts();
    var mt = WMS.Stats.getMovementsToday(), mm = WMS.Stats.getMovementsThisMonth();
    var tl = WMS.Stats.getTotalLocations(), ol = WMS.Stats.getOccupiedLocations();
    var tShelves = WMS.Stats.getTotalShelves(), tCap = WMS.Stats.getTotalSlots();
    var recent = WMS.Movements.getRecent(8), prods = WMS.Products.getAll();
    var occClass = occ > 80 ? 'red' : occ > 50 ? 'orange' : 'green';
    var typeLabels = { entrada:'Entrada', salida:'Salida', ajuste:'Ajuste', transferencia:'Transferencia' };

    var lowHtml = '';
    if (low.length === 0) {
      lowHtml = '<div class="empty-state" style="padding:var(--space-6)"><div style="font-size:2rem;margin-bottom:var(--space-2)">✅</div><p class="text-muted" style="font-size:var(--font-sm)">Todos los productos tienen stock adecuado</p></div>';
    } else {
      lowHtml = '<div class="table-wrapper"><table class="table"><thead><tr><th>Código</th><th>Producto</th><th>Stock</th><th>Mínimo</th></tr></thead><tbody>';
      low.slice(0, 5).forEach(function(p) {
        var st = WMS.Inventory.getTotalStock(p.id);
        lowHtml += '<tr><td><span class="product-sku">' + p.sku + '</span></td><td>' + p.description + '</td><td><span class="badge badge-danger">' + WMS.formatNumber(st) + '</span></td><td>' + WMS.formatNumber(p.minStock) + '</td></tr>';
      });
      lowHtml += '</tbody></table></div>';
    }

    var mvHtml = '';
    if (recent.length === 0) {
      mvHtml = '<div class="empty-state" style="padding:var(--space-6)"><p class="text-muted">No hay movimientos registrados</p></div>';
    } else {
      mvHtml = '<div class="table-wrapper"><table class="table"><thead><tr><th>Fecha</th><th>Tipo</th><th>Producto</th><th>Cantidad</th><th>Referencia</th></tr></thead><tbody>';
      recent.forEach(function(m) {
        var prod = prods.find(function(p) { return p.id === m.productId; });
        mvHtml += '<tr><td>' + WMS.formatDateTime(m.timestamp) + '</td><td><span class="movement-type ' + m.type + '">' + (typeLabels[m.type]||m.type) + '</span></td><td>' + (prod ? prod.description : m.productId) + '</td><td>' + (m.type==='salida'?'-':'+') + WMS.formatNumber(m.quantity) + '</td><td>' + (m.reference||'—') + '</td></tr>';
      });
      mvHtml += '</tbody></table></div>';
    }

    container.innerHTML = '<div class="page-header"><div><h1 class="page-title">Dashboard</h1><p class="page-subtitle">Bienvenido, ' + (user?user.name:'Usuario') + '. Resumen operativo del almacén.</p></div></div>'
      + '<div class="kpi-grid" style="margin-bottom:var(--space-6);">'
      + '<div class="kpi-card animate-fade-in" style="animation-delay:0ms"><div class="kpi-card-icon blue">📦</div><div class="kpi-card-value">' + WMS.formatNumber(tp) + '</div><div class="kpi-card-label">Productos en Catálogo</div></div>'
      + '<div class="kpi-card animate-fade-in" style="animation-delay:80ms"><div class="kpi-card-icon green">📊</div><div class="kpi-card-value">' + WMS.formatNumber(ts) + '</div><div class="kpi-card-label">Unidades en Stock</div></div>'
      + '<div class="kpi-card animate-fade-in" style="animation-delay:160ms"><div class="kpi-card-icon ' + (occ>80?'red':occ>50?'orange':'purple') + '">📍</div><div class="kpi-card-value">' + occ + '%</div><div class="kpi-card-label">Ocupación del Almacén</div><div style="margin-top:var(--space-2)"><div class="progress-bar"><div class="progress-bar-fill ' + occClass + '" style="width:' + occ + '%"></div></div><div style="font-size:var(--font-xs);color:var(--text-muted);margin-top:var(--space-1)">' + ol + ' / ' + tl + ' posiciones</div></div></div>'
      + '<div class="kpi-card animate-fade-in" style="animation-delay:240ms"><div class="kpi-card-icon ' + (low.length>0?'red':'green') + '">⚠️</div><div class="kpi-card-value">' + low.length + '</div><div class="kpi-card-label">Alertas Stock Bajo</div>' + (low.length>0?'<span class="kpi-card-trend down">Requiere atención</span>':'<span class="kpi-card-trend up">Todo OK</span>') + '</div>'
      + '<div class="kpi-card animate-fade-in" style="animation-delay:320ms"><div class="kpi-card-icon blue">🏗️</div><div class="kpi-card-value">' + tShelves + '</div><div class="kpi-card-label">Estanterías</div><div style="font-size:var(--font-xs);color:var(--text-muted);margin-top:var(--space-1)">' + tl + ' módulos totales</div></div>'
      + '<div class="kpi-card animate-fade-in" style="animation-delay:400ms"><div class="kpi-card-icon purple">📥</div><div class="kpi-card-value">' + WMS.formatNumber(tCap) + '</div><div class="kpi-card-label">Capacidad (Pallets)</div><div style="font-size:var(--font-xs);color:var(--text-muted);margin-top:var(--space-1)">Huecos configurados</div></div>'
      + '<div class="kpi-card animate-fade-in" style="animation-delay:480ms"><div class="kpi-card-icon blue">🔄</div><div class="kpi-card-value">' + WMS.formatNumber(mt) + '</div><div class="kpi-card-label">Movimientos Hoy</div><div style="font-size:var(--font-xs);color:var(--text-muted);margin-top:var(--space-1)">' + WMS.formatNumber(mm) + ' este mes</div></div>'
      + '</div>'
      + '<div class="dashboard-grid">'
      + '<div class="card animate-fade-in" style="animation-delay:400ms"><div class="card-header"><h3 class="card-title">Acciones Rápidas</h3></div><div class="quick-actions">'
      + '<div class="quick-action-btn" onclick="window.location.hash=\'#/inventory/entry\'"><div class="quick-action-icon" style="background:var(--success-bg);color:var(--success)">📥</div><span class="quick-action-label">Nueva Entrada</span></div>'
      + '<div class="quick-action-btn" onclick="window.location.hash=\'#/inventory/exit\'"><div class="quick-action-icon" style="background:var(--danger-bg);color:var(--danger)">📤</div><span class="quick-action-label">Nueva Salida</span></div>'
      + '<div class="quick-action-btn" onclick="window.location.hash=\'#/inventory/stock\'"><div class="quick-action-icon" style="background:var(--info-bg);color:var(--info)">🔍</div><span class="quick-action-label">Consultar Stock</span></div>'
      + '<div class="quick-action-btn" onclick="window.location.hash=\'#/products\'"><div class="quick-action-icon" style="background:rgba(132,94,247,0.12);color:var(--accent)">📋</div><span class="quick-action-label">Productos</span></div>'
      + '</div></div>'
      + '<div class="card animate-fade-in" style="animation-delay:480ms"><div class="card-header"><h3 class="card-title">⚠️ Alertas de Stock Bajo</h3></div>' + lowHtml + '</div>'
      + '<div class="card full-width animate-fade-in" style="animation-delay:560ms"><div class="card-header"><h3 class="card-title">Movimientos Recientes</h3><a href="#/inventory/movements" class="btn btn-ghost btn-sm">Ver todos →</a></div>' + mvHtml + '</div>'
      + '</div>';
  };
})();
