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
        return (r.codigo||'').toLowerCase().includes(q) || 
               (r.descripcion||'').toLowerCase().includes(q) ||
               (r.notas||'').toLowerCase().includes(q);
      });
    }

    if (statusFilter) {
      items = items.filter(function(r) { return r.estado === statusFilter; });
    }

    var pg = WMS.paginate(items, currentPage);
    var canWrite = await WMS.hasPermission('inventory', 'write');

    var rows = '';
    pg.data.forEach(function(r) {
      var statusBadge = '';
      if (r.estado === 'pendiente') statusBadge = '<span class="badge badge-warning">Pendiente</span>';
      else if (r.estado === 'completado') statusBadge = '<span class="badge badge-success">Completado</span>';
      else if (r.estado === 'cancelado') statusBadge = '<span class="badge badge-danger">Cancelado</span>';
      else statusBadge = '<span class="badge badge-neutral">' + r.estado + '</span>';

      rows += '<tr>' +
        '<td><div style="font-weight:600;color:var(--text-primary)">' + r.codigo + '</div><div style="font-size:12px;color:var(--text-muted)">' + (r.descripcion||'') + '</div></td>' +
        '<td>' + (canWrite && r.estado === 'pendiente' ? '<input type="number" class="form-input btn-sm update-qty-input" data-id="' + r.id + '" value="' + r.cantidad + '" style="width:80px; text-align:center">' : WMS.formatNumber(r.cantidad)) + '</td>' +
        '<td>' + (r.modulo || '—') + '</td>' +
        '<td>' + new Date(r.creado_en).toLocaleDateString() + ' ' + new Date(r.creado_en).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + '</td>' +
        '<td>' + statusBadge + '</td>' +
        '<td>' + (canWrite && r.estado === 'pendiente' ? '<div class="flex gap-1"><button class="btn btn-ghost btn-sm process-request-btn" data-id="' + r.id + '">Procesar 📦</button></div>' : '—') + '</td>' +
        '</tr>';
    });

    container.innerHTML = '<div class="page-header"><div><h1 class="page-title">Peticiones de Material</h1><p class="page-subtitle">Solicitudes recibidas desde otros proyectos</p></div></div>'
      + '<div class="card"><div class="filter-bar"><div class="search-bar"><span class="search-bar-icon">🔍</span><input type="text" id="requestSearch" placeholder="Buscar por SKU, módulo o notas..." value="' + searchQuery + '"></div>'
      + '<select class="form-select" id="statusFilter"><option value="">Todos los estados</option><option value="pendiente" ' + (statusFilter==='pendiente'?'selected':'') + '>Pendientes</option><option value="completado" ' + (statusFilter==='completado'?'selected':'') + '>Completados</option><option value="cancelado" ' + (statusFilter==='cancelado'?'selected':'') + '>Cancelados</option></select></div>'
      + (pg.data.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">📩</div><h3 class="empty-state-title">No hay peticiones</h3><p class="empty-state-text">No se han recibido peticiones de material todavía.</p></div>' :
      '<div class="table-wrapper"><table class="table"><thead><tr><th>Producto</th><th>Cantidad</th><th>Módulo</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>' + rows + '</tbody></table></div><div class="pagination" id="requestPagination"></div>')
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

    container.querySelectorAll('.update-qty-input').forEach(function(inp) {
      inp.addEventListener('change', async function(e) {
        var newQty = parseInt(e.target.value);
        if (newQty > 0) {
          await WMS.MaterialRequests.update(inp.dataset.id, { cantidad: newQty });
          WMS.showToast('Cantidad actualizada', 'success');
        } else {
          WMS.showToast('La cantidad debe ser mayor que 0', 'warning');
          e.target.value = 1;
        }
      });
    });

    var pgEl = document.getElementById('requestPagination');
    if (pgEl) WMS.renderPagination(pgEl, pg, async function(p) { currentPage = p; await renderPage(container); });
  }

  async function processRequest(id, container) {
    var req = await WMS.MaterialRequests.getById(id);
    if (!req) return;

    var products = await WMS.Products.getAll();
    var product = products.find(function(p) { return p.sku === req.codigo; });
    if (!product) {
      WMS.showToast('El producto solicitado (' + req.codigo + ') no existe en el catálogo WMS.', 'error');
      return;
    }

    var invs = await WMS.Inventory.getAll();
    var itemInvs = invs.filter(function(i) { return i.productId === product.id && i.quantity > 0; });
    if (itemInvs.length === 0) {
      WMS.showToast('No hay stock disponible en el almacén para el material ' + req.codigo + '.', 'error');
      return;
    }

    var locs = await WMS.Locations.getAll();

    var existingModal = document.getElementById('processRequestModal');
    if (existingModal) existingModal.remove();

    var modalHtml = '<div class="modal-overlay active" id="processRequestModal">' +
      '<div class="modal">' +
        '<div class="modal-header"><h3 class="modal-title">Procesar Petición</h3><button class="modal-close" onclick="WMS.closeModal(\'processRequestModal\'); setTimeout(function(){document.getElementById(\'processRequestModal\').remove()},300)">✕</button></div>' +
        '<div class="modal-body">' +
          '<div class="form-group"><label class="form-label">Material a servir</label><div style="font-weight:600; font-size:1.1rem; color:var(--text-primary)">' + req.codigo + ' <span style="font-size:0.9rem; font-weight:normal; color:var(--text-muted)">- ' + (req.descripcion||'') + '</span></div></div>' +
          '<div class="form-row">' +
            '<div class="form-group"><label class="form-label">Cantidad a procesar</label><input type="number" id="processQty" class="form-input" value="' + req.cantidad + '" min="1"></div>' +
            '<div class="form-group"><label class="form-label">Módulo destino</label><input type="text" class="form-input" value="' + (req.modulo || '—') + '" disabled></div>' +
          '</div>' +
          '<div class="form-group"><label class="form-label form-required">Ubicación de Salida</label><select id="processLocation" class="form-select">';
    
    itemInvs.forEach(function(i) {
      var l = locs.find(function(loc) { return loc.id === i.locationId; });
      var name = l ? l.code : i.locationId;
      if (l && l.name) name += ' (' + l.name + ')';
      modalHtml += '<option value="' + i.id + '">Ubic. ' + name + ' (Stock disp: ' + i.quantity + ')</option>';
    });

    modalHtml += '</select></div>' +
        '</div>' +
        '<div class="modal-footer"><button class="btn btn-ghost" onclick="WMS.closeModal(\'processRequestModal\'); setTimeout(function(){document.getElementById(\'processRequestModal\').remove()},300)">Cancelar</button><button class="btn btn-primary" id="confirmProcessBtn">Confirmar y Dar Salida</button></div>' +
      '</div></div>';

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    document.getElementById('confirmProcessBtn').addEventListener('click', async function() {
      var processBtn = this;
      var qty = parseInt(document.getElementById('processQty').value);
      var invId = document.getElementById('processLocation').value;
      if (!qty || qty <= 0) return WMS.showToast('La cantidad debe ser mayor a 0', 'error');
      
      var invRecord = itemInvs.find(function(i) { return i.id === invId; });
      if (!invRecord) return;
      if (qty > invRecord.quantity) {
        return WMS.showToast('La cantidad supera el stock en la ubicación seleccionada (' + invRecord.quantity + ' uds)', 'error');
      }

      processBtn.disabled = true;
      processBtn.innerHTML = 'Procesando...';

      try {
        var resStock = await WMS.Inventory.removeStock(product.id, invRecord.locationId, qty, invRecord.lot, invRecord.col, invRecord.row, invRecord.pos);
        if (resStock && resStock.error) { 
          WMS.showToast(resStock.error, 'error'); 
          processBtn.disabled = false; processBtn.innerHTML = 'Confirmar y Dar Salida';
          return; 
        }
        
        var user = await WMS.getCurrentUser();
        await WMS.Movements.create({
          type: 'salida',
          productId: product.id,
          quantity: qty,
          locationFrom: invRecord.locationId + (invRecord.row ? '|'+invRecord.row : '') + (invRecord.pos ? '|'+invRecord.pos : ''),
          userId: user ? user.id : null,
          reference: 'Petición servida (' + (req.modulo || '—') + ')',
          notes: 'Salida para solicitud de material'
        });

        await WMS.MaterialRequests.update(id, { estado: 'completado', cantidad: qty });

        WMS.showToast('Petición completada y stock descontado', 'success');
        WMS.closeModal('processRequestModal');
        setTimeout(function() { document.getElementById('processRequestModal').remove(); }, 300);
        await renderPage(container);
      } catch(e) {
        processBtn.disabled = false; processBtn.innerHTML = 'Confirmar y Dar Salida';
        WMS.showToast('Error al procesar: ' + e.message, 'error');
      }
    });
  }
})();
