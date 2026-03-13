// ============================================
// WMS - Dashboard Page (global namespace)
// ============================================
(function() {
  WMS.renderDashboard = async function(container) {
    var user = await WMS.getCurrentUser();
    var [tp, ts, occ, low, mt, mm, tl, ol, tShelves, tCap, recent, prods, inv, locs, matReqs] = await Promise.all([
      WMS.Stats.getTotalProductsInWarehouse(), WMS.Stats.getTotalStock(),
      WMS.Stats.getOccupancyPercent(), WMS.Stats.getLowStockProducts(),
      WMS.Stats.getMovementsToday(), WMS.Stats.getMovementsThisMonth(),
      WMS.Stats.getTotalLocations(), WMS.Stats.getOccupiedSlots(),
      WMS.Stats.getTotalShelves(), WMS.Stats.getTotalSlots(),
      WMS.Movements.getRecent(8), WMS.Products.getAll(), WMS.Inventory.getAll(),
      WMS.Locations.getAll(),
      (WMS.MaterialRequests ? WMS.MaterialRequests.getAll() : Promise.resolve([]))
    ]);

    var occClass = occ > 80 ? 'red' : occ > 50 ? 'orange' : 'green';
    var typeLabels = { entrada:'Entrada', salida:'Salida', ajuste:'Ajuste', transferencia:'Transferencia' };

    var lowHtml = '';
    if (low.length === 0) {
      lowHtml = '<div class="empty-state" style="padding:var(--space-6)"><div style="font-size:2rem;margin-bottom:var(--space-2)">✅</div><p class="text-muted" style="font-size:var(--font-sm)">Todos los productos tienen stock adecuado</p></div>';
    } else {
      lowHtml = '<div class="table-wrapper"><table class="table"><thead><tr><th>Código</th><th>Producto</th><th>Stock</th><th>Mínimo</th></tr></thead><tbody>';
      low.slice(0, 5).forEach(function(p) {
        var st = inv.filter(function(i){return i.productId===p.id;}).reduce(function(s,i){return s+(i.quantity||0);}, 0);
        lowHtml += '<tr><td><span class="product-sku">' + p.sku + '</span></td><td>' + p.description + '</td><td><span class="badge badge-danger">' + WMS.formatNumber(st) + '</span></td><td>' + WMS.formatNumber(p.minStock) + '</td></tr>';
      });
      lowHtml += '</tbody></table></div>';
    }

    var mvHtml = '';
    if (recent.length === 0) {
      mvHtml = '<div class="empty-state" style="padding:var(--space-6)"><p class="text-muted">No hay movimientos registrados</p></div>';
    } else {
      var formatLoc = function(val) {
        if (!val) return '—';
        var p = val.split('|'), l = locs.find(function(ll){return ll.id===p[0];});
        var d = (l?l.code:p[0]);
        if (p[1]||p[2]) d += (p[1]?'-F'+p[1]:'') + (p[2]?'-P'+p[2]:'');
        return d;
      };
      mvHtml = '<div class="table-wrapper"><table class="table"><thead><tr><th>Fecha</th><th>Tipo</th><th>Producto</th><th>Cantidad</th><th>Ubicación</th><th>Referencia</th></tr></thead><tbody>';
      recent.forEach(function(m) {
        var prod = prods.find(function(p) { return p.id === m.productId; });
        var dF = formatLoc(m.locationFrom), dT = formatLoc(m.locationTo);
        var locD = m.type==='entrada' ? '→ '+dT : m.type==='salida' ? dF+' →' : dF+' → '+dT;
        mvHtml += '<tr><td>' + WMS.formatDateTime(m.timestamp) + '</td><td><span class="movement-type ' + m.type + '">' + (typeLabels[m.type]||m.type) + '</span></td><td>' + (prod ? prod.description : m.productId) + '</td><td>' + (m.type==='salida'?'-':'+') + WMS.formatNumber(m.quantity) + '</td><td style="font-size:var(--font-xs)">' + locD + '</td><td>' + (m.reference||'—') + '</td></tr>';
      });
      mvHtml += '</tbody></table></div>';
    }

    var pendingReqs = matReqs.filter(function(r) { return r.estado === 'pendiente'; });
    var reqsHtml = '';
    if (pendingReqs.length === 0) {
      reqsHtml = '<div class="empty-state" style="padding:var(--space-6)"><p class="text-muted">No hay peticiones de material pendientes</p></div>';
    } else {
      reqsHtml = '<div class="table-wrapper"><table class="table"><thead><tr><th>Material</th><th>Módulo</th><th>Cantidad</th><th>Fecha</th></tr></thead><tbody>';
      pendingReqs.slice(0, 5).forEach(function(r) {
        reqsHtml += '<tr><td><span style="font-weight:600">' + r.codigo + '</span><br><span style="font-size:12px;color:var(--text-muted)">' + (r.descripcion||'') + '</span></td><td>' + (r.modulo||'—') + '</td><td><span class="badge badge-warning">' + r.cantidad + '</span></td><td>' + new Date(r.creado_en).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}) + '</td></tr>';
      });
      reqsHtml += '</tbody></table></div>';
    }

    container.innerHTML = '<div class="page-header"><div><h1 class="page-title">Dashboard</h1><p class="page-subtitle">Bienvenido, ' + (user?user.name:'Usuario') + '. Resumen operativo del almacén.</p></div></div>'
      + '<div class="kpi-grid" style="margin-bottom:var(--space-6);">'
      + '<div class="kpi-card animate-fade-in" style="animation-delay:0ms"><div class="kpi-card-icon blue">📦</div><div class="kpi-card-value">' + WMS.formatNumber(tp) + '</div><div class="kpi-card-label">Productos en el Almacén</div></div>'
      + '<div class="kpi-card animate-fade-in" style="animation-delay:80ms"><div class="kpi-card-icon green">📊</div><div class="kpi-card-value">' + WMS.formatNumber(ts) + '</div><div class="kpi-card-label">Unidades en Stock</div></div>'
      + '<div class="kpi-card animate-fade-in" style="animation-delay:160ms"><div class="kpi-card-icon ' + (occ>80?'red':occ>50?'orange':'purple') + '">📍</div><div class="kpi-card-value">' + occ + '%</div><div class="kpi-card-label">Ocupación del Almacén</div><div style="margin-top:var(--space-2)"><div class="progress-bar"><div class="progress-bar-fill ' + occClass + '" style="width:' + occ + '%"></div></div><div style="font-size:var(--font-xs);color:var(--text-muted);margin-top:var(--space-1)">' + ol + ' / ' + tCap + ' huecos ocupados</div></div></div>'
      + '<div class="kpi-card animate-fade-in" style="animation-delay:240ms"><div class="kpi-card-icon ' + (low.length>0?'red':'green') + '">⚠️</div><div class="kpi-card-value">' + low.length + '</div><div class="kpi-card-label">Alertas Stock Bajo</div>' + (low.length>0?'<span class="kpi-card-trend down">Requiere atención</span>':'<span class="kpi-card-trend up">Todo OK</span>') + '</div>'
      + '<div class="kpi-card animate-fade-in" style="animation-delay:320ms"><div class="kpi-card-icon purple">📥</div><div class="kpi-card-value">' + WMS.formatNumber(tCap) + '</div><div class="kpi-card-label">Capacidad (Pallets)</div><div style="font-size:var(--font-xs);color:var(--text-muted);margin-top:var(--space-1)">Huecos configurados</div></div>'
      + '<div class="kpi-card animate-fade-in" style="animation-delay:400ms"><div class="kpi-card-icon ' + (pendingReqs.length>0?'orange':'blue') + '">📩</div><div class="kpi-card-value">' + pendingReqs.length + '</div><div class="kpi-card-label">Peticiones Pendientes</div><div style="font-size:var(--font-xs);color:var(--text-muted);margin-top:var(--space-1)">' + (pendingReqs.length>0?'Pendientes de servir':'Al día') + '</div></div>'
      + '</div>'
      + '<div class="dashboard-grid">'
      + '<div class="card animate-fade-in" style="animation-delay:400ms"><div class="card-header"><h3 class="card-title">Acciones Rápidas</h3></div><div class="quick-actions">'
      + '<div class="quick-action-btn" onclick="window.location.hash=\'#/inventory/entry\'"><div class="quick-action-icon" style="background:var(--success-bg);color:var(--success)">📥</div><span class="quick-action-label">Nueva Entrada</span></div>'
      + '<div class="quick-action-btn" onclick="window.location.hash=\'#/inventory/exit\'"><div class="quick-action-icon" style="background:var(--danger-bg);color:var(--danger)">📤</div><span class="quick-action-label">Nueva Salida</span></div>'
      + '<div class="quick-action-btn" onclick="window.location.hash=\'#/inventory/stock\'"><div class="quick-action-icon" style="background:var(--info-bg);color:var(--info)">🔍</div><span class="quick-action-label">Consultar Stock</span></div>'
      + '<div class="quick-action-btn" onclick="window.location.hash=\'#/material-requests\'"><div class="quick-action-icon" style="background:rgba(255,152,0,0.12);color:var(--warning)">📩</div><span class="quick-action-label">Peticiones</span></div>'
      + '</div></div>'
      + '<div class="card animate-fade-in" style="animation-delay:480ms"><div class="card-header"><h3 class="card-title">⚠️ Alertas de Stock Bajo</h3></div>' + lowHtml + '</div>'
      + '<div class="card animate-fade-in" style="animation-delay:520ms"><div class="card-header"><h3 class="card-title">📩 Peticiones Pendientes</h3><a href="#/material-requests" class="btn btn-ghost btn-sm">Ver todas →</a></div>' + reqsHtml + '</div>'
      + '<div class="card full-width animate-fade-in" style="animation-delay:560ms"><div class="card-header"><h3 class="card-title">Movimientos Recientes</h3><a href="#/inventory/movements" class="btn btn-ghost btn-sm">Ver todos →</a></div>' + mvHtml + '</div>'
      + '</div>';
  };
})();
