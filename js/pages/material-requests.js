// ============================================
// WMS - Material Requests Page (Global Namespace)
// ============================================
(function() {
  var currentPage = 1, searchQuery = '', statusFilter = '';

  WMS.renderMaterialRequests = async function(container) {
    currentPage = 1; searchQuery = ''; statusFilter = '';
    await renderPage(container);
  };

  async function renderPage(container) {
    var allRequests = await WMS.MaterialRequests.getAll();
    var items = allRequests;

    if (searchQuery) {
      var q = searchQuery.toLowerCase();
      items = items.filter(function(r) {
        return (r.productSku||'').toLowerCase().includes(q) || 
               (r.origin||'').toLowerCase().includes(q) ||
               (r.notes||'').toLowerCase().includes(q);
      });
    }

    if (statusFilter) {
      items = items.filter(function(r) { return r.status === statusFilter; });
    }

    var pg = WMS.paginate(items, currentPage);
    var canWrite = await WMS.hasPermission('inventory', 'write');

    var rows = '';
    pg.data.forEach(function(r) {
      var statusBadge = '';
      if (r.status === 'pending') statusBadge = '<span class="badge badge-warning">Pendiente</span>';
      else if (r.status === 'completed') statusBadge = '<span class="badge badge-success">Completado</span>';
      else if (r.status === 'cancelled') statusBadge = '<span class="badge badge-danger">Cancelado</span>';
      else statusBadge = '<span class="badge badge-neutral">' + r.status + '</span>';

      rows += '<tr>' +
        '<td><div style="font-weight:600;color:var(--text-primary)">' + r.productSku + '</div><div style="font-size:12px;color:var(--text-muted)">' + (r.productDescription||'') + '</div></td>' +
        '<td>' + WMS.formatNumber(r.quantity) + '</td>' +
        '<td>' + (r.origin || 'Externo') + '</td>' +
        '<td>' + new Date(r.createdAt).toLocaleDateString() + ' ' + new Date(r.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + '</td>' +
        '<td>' + statusBadge + '</td>' +
        '<td>' + (canWrite && r.status === 'pending' ? '<div class="flex gap-1"><button class="btn btn-ghost btn-sm process-request-btn" data-id="' + r.id + '">Procesar 📦</button></div>' : '—') + '</td>' +
        '</tr>';
    });

    container.innerHTML = '<div class="page-header"><div><h1 class="page-title">Peticiones de Material</h1><p class="page-subtitle">Solicitudes recibidas desde otros proyectos</p></div></div>'
      + '<div class="card"><div class="filter-bar"><div class="search-bar"><span class="search-bar-icon">🔍</span><input type="text" id="requestSearch" placeholder="Buscar por SKU, origen o notas..." value="' + searchQuery + '"></div>'
      + '<select class="form-select" id="statusFilter"><option value="">Todos los estados</option><option value="pending" ' + (statusFilter==='pending'?'selected':'') + '>Pendientes</option><option value="completed" ' + (statusFilter==='completed'?'selected':'') + '>Completados</option><option value="cancelled" ' + (statusFilter==='cancelled'?'selected':'') + '>Cancelados</option></select></div>'
      + (pg.data.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">📩</div><h3 class="empty-state-title">No hay peticiones</h3><p class="empty-state-text">No se han recibido peticiones de material todavía.</p></div>' :
      '<div class="table-wrapper"><table class="table"><thead><tr><th>Producto</th><th>Cantidad</th><th>Origen</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>' + rows + '</tbody></table></div><div class="pagination" id="requestPagination"></div>')
      + '</div>';

    var si = document.getElementById('requestSearch');
    if (si) si.addEventListener('input', WMS.debounce(async function(e) { searchQuery = e.target.value; currentPage = 1; await renderPage(container); }, 250));
    
    var sf = document.getElementById('statusFilter');
    if (sf) sf.addEventListener('change', async function(e) { statusFilter = e.target.value; currentPage = 1; await renderPage(container); });

    container.querySelectorAll('.process-request-btn').forEach(function(b) {
      b.addEventListener('click', async function() {
        await processRequest(b.dataset.id, container);
      });
    });

    var pgEl = document.getElementById('requestPagination');
    if (pgEl) WMS.renderPagination(pgEl, pg, async function(p) { currentPage = p; await renderPage(container); });
  }

  async function processRequest(id, container) {
    var req = await WMS.MaterialRequests.getById(id);
    if (!req) return;

    if (confirm('¿Deseas marcar la petición de ' + req.productSku + ' como completada?')) {
      await WMS.MaterialRequests.update(id, { status: 'completed' });
      WMS.showToast('Petición completada.', 'success');
      await renderPage(container);
    }
  }
})();
