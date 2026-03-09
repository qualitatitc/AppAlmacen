// ============================================
// WMS - Inventory Page (global namespace)
// ============================================
(function() {
  var activeTab = 'entry', movPage = 1, stockPage = 1, stockSearch = '', movFilter = '';
  var typeLabels = { entrada:'Entrada', salida:'Salida', ajuste:'Ajuste', transferencia:'Transferencia' };

  WMS.renderInventory = async function(container, sub) {
    if (sub === 'entry') activeTab = 'entry';
    else if (sub === 'exit') activeTab = 'exit';
    else if (sub === 'stock') activeTab = 'stock';
    else if (sub === 'movements') activeTab = 'movements';

    container.innerHTML = '<div class="page-header"><div><h1 class="page-title">Inventario</h1><p class="page-subtitle">Gestión de entradas, salidas y consulta de stock</p></div></div>'
      + '<div class="tabs"><div class="tab ' + (activeTab==='entry'?'active':'') + '" data-tab="entry">📥 Entrada</div><div class="tab ' + (activeTab==='exit'?'active':'') + '" data-tab="exit">📤 Salida</div><div class="tab ' + (activeTab==='stock'?'active':'') + '" data-tab="stock">🔍 Consultar Stock</div><div class="tab ' + (activeTab==='movements'?'active':'') + '" data-tab="movements">📋 Movimientos</div></div>'
      + '<div id="inventoryContent" class="inventory-tabs-content"></div>';

    container.querySelectorAll('.tab').forEach(function(tab) {
      tab.addEventListener('click', async function() {
        activeTab = tab.dataset.tab;
        container.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        window.location.hash = '#/inventory/' + activeTab;
        await renderTab(document.getElementById('inventoryContent'));
      });
    });
    await renderTab(document.getElementById('inventoryContent'));
  };

  async function renderTab(el) {
    el.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-secondary)">Cargando...</div>';
    if (activeTab === 'entry') await renderEntry(el);
    else if (activeTab === 'exit') await renderExit(el);
    else if (activeTab === 'stock') await renderStock(el);
    else if (activeTab === 'movements') await renderMovements(el);
  }

  function positionOptions(locs) {
    var positions = (locs || []).filter(function(l) { return l.level==='position' && l.status==='active'; });
    return positions.map(function(p) { return '<option value="' + p.id + '">' + p.code + ' — ' + p.name + '</option>'; }).join('');
  }

  function productOptions(prods) {
    return (prods || []).map(function(p) { return '<option value="' + p.id + '">' + (p.sku || p.id) + '</option>'; }).join('');
  }

  // ---- ENTRY ----
  async function renderEntry(el) {
    var [prods, locations] = await Promise.all([WMS.Products.getAll(), WMS.Locations.getAll()]);
    el.innerHTML = '<div class="card animate-fade-in"><div class="card-header"><h3 class="card-title">📥 Registrar Entrada de Mercancía</h3><span class="badge badge-success">Nueva entrada</span></div>'
      + '<form id="entryForm"><div class="form-row"><div class="form-group"><label class="form-label form-required">Código</label><select class="form-select" id="entryProduct" required><option value="">Seleccionar...</option>' + productOptions(prods) + '</select></div><div class="form-group" style="flex:2"><label class="form-label">Descripción</label><input type="text" class="form-input" id="entryProductName" readonly style="background-color:rgba(255,255,255,0.05);color:var(--text-secondary)"></div><div class="form-group"><label class="form-label form-required">Cantidad</label><input type="number" class="form-input" id="entryQty" min="1" required></div></div>'
      + '<div class="form-row">'
      +   '<div class="form-group"><label class="form-label form-required">Estantería</label><select class="form-select" id="entryShelf" required><option value="">...</option></select></div>'
      +   '<div class="form-group"><label class="form-label form-required">Módulo (M)</label><select class="form-select" id="entryModule" required disabled><option value="">...</option></select></div>'
      +   '<div class="form-group"><label class="form-label form-required">Fila (F)</label><select class="form-select" id="entryRowSelect" required disabled><option value="">...</option></select></div>'
      +   '<div class="form-group"><label class="form-label form-required">Posición (P)</label><select class="form-select" id="entryPosSelect" required disabled><option value="">...</option></select></div>'
      +   '<div class="form-group"><label class="form-label">Lote</label><input type="text" class="form-input" id="entryLot"></div>'
      + '</div>'
      + '<div class="form-row"><div class="form-group"><label class="form-label">Proveedor</label><input type="text" class="form-input" id="entrySupplier"></div><div class="form-group"><label class="form-label">Doc. referencia</label><input type="text" class="form-input" id="entryRef" placeholder="Nº albarán"></div></div>'
      + '<div class="form-group"><label class="form-label">Observaciones</label><textarea class="form-textarea" id="entryNotes"></textarea></div>'
      + '<div id="entryStockInfo" style="margin-bottom:var(--space-4)"></div>'
      + '<div style="display:flex;gap:var(--space-3);justify-content:flex-end"><button type="reset" class="btn btn-secondary">Limpiar</button><button type="submit" class="btn btn-success" id="entrySubmitBtn">📥 Registrar Entrada</button></div></form></div>';

    document.getElementById('entryProduct').addEventListener('change', function(e) {
      const p = prods.find(x => x.id === e.target.value);
      document.getElementById('entryProductName').value = p ? p.description : '';
      if (p && p.lotRequired) WMS.showToast('Nota: Este producto requiere lote.', 'info');
    });
    
    // --- Cascading Select Logic ---
    var shelfSel = document.getElementById('entryShelf');
    var modSel = document.getElementById('entryModule');
    var rowSel = document.getElementById('entryRowSelect');
    var posSel = document.getElementById('entryPosSelect');
    
    // locations is already available from line 49
    var shelves = Array.from(new Set(locations.map(function(l) { return (l.code || '').split('-')[0]; }))).filter(function(s) { return s; }).sort();
    shelfSel.innerHTML = '<option value="">Sel...</option>' + shelves.map(function(s) { return `<option value="${s}">${s}</option>`; }).join('');

    shelfSel.addEventListener('change', function() {
      var s = shelfSel.value;
      modSel.innerHTML = '<option value="">...</option>';
      modSel.disabled = !s;
      rowSel.innerHTML = '<option value="">...</option>'; rowSel.disabled = true;
      posSel.innerHTML = '<option value="">...</option>'; posSel.disabled = true;
      if (!s) return;
      var mods = locations.filter(l => l.code.startsWith(s + '-M')).sort((a,b) => {
        return parseInt(a.code.split('-M')[1]) - parseInt(b.code.split('-M')[1]);
      });
      modSel.innerHTML += mods.map(m => `<option value="${m.id}">${m.code.split('-')[1]}</option>`).join('');
    });

    modSel.addEventListener('change', function() {
      var mid = modSel.value;
      rowSel.innerHTML = '<option value="">...</option>';
      rowSel.disabled = !mid;
      posSel.innerHTML = '<option value="">...</option>'; posSel.disabled = true;
      if (!mid) return;
      var m = locations.find(l => l.id === mid);
      if (!m) return;
      for (var i = 0; i < (m.rows || 1); i++) {
        rowSel.innerHTML += `<option value="${i}">F${i + 1}</option>`;
      }
    });

    rowSel.addEventListener('change', function() {
      var mid = modSel.value;
      posSel.innerHTML = '<option value="">...</option>';
      posSel.disabled = !rowSel.value;
      if (!rowSel.value) return;
      var m = locations.find(l => l.id === mid);
      if (!m) return;
      for (var i = 1; i <= (m.slotsPerRow || 3); i++) {
        posSel.innerHTML += `<option value="${i}">P${i}</option>`;
      }
    });

    document.getElementById('entryForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      var pid = document.getElementById('entryProduct').value;
      var qty = parseInt(document.getElementById('entryQty').value);
      var lid = document.getElementById('entryModule').value;
      var lot = document.getElementById('entryLot').value.trim();
      var row = document.getElementById('entryRowSelect').value, pos = document.getElementById('entryPosSelect').value;
      var btn = document.getElementById('entrySubmitBtn');

      if (!pid || !qty || !lid || row === '' || pos === '') { WMS.showToast('Producto, cantidad y ubicación completa son obligatorios.', 'warning'); return; }
      var prod = prods.find(x => x.id === pid);
      if (prod && prod.lotRequired && !lot) { WMS.showToast('Este producto requiere número de lote.', 'warning'); return; }
      
      btn.disabled = true; btn.textContent = 'Procesando...';
      try {
        await WMS.Inventory.addStock(pid, lid, qty, lot, null, '', row, pos);
        var preciseLoc = lid; if (row||pos) preciseLoc += '|' + row + '|' + pos;
        var user = await WMS.getCurrentUser();
        await WMS.Movements.create({ type:'entrada', productId:pid, quantity:qty, locationTo:preciseLoc, lot:lot, supplier:document.getElementById('entrySupplier').value.trim(), reference:document.getElementById('entryRef').value.trim(), notes:document.getElementById('entryNotes').value.trim(), userId:(user?user.id:null), entryNumber:'ENT-'+Date.now().toString(36).toUpperCase() });
        WMS.showToast('Entrada registrada: ' + qty + ' uds de ' + (prod?prod.sku:pid), 'success');
        e.target.reset();
        document.getElementById('entryProductName').value = '';
        document.getElementById('entryStockInfo').innerHTML = '';
      } catch (err) {
        WMS.showToast('Error al registrar entrada: ' + err.message, 'error');
      } finally {
        btn.disabled = false; btn.textContent = '📥 Registrar Entrada';
      }
    });
  }

  // ---- EXIT ----
  async function renderExit(el) {
    var [prods, locations, invData] = await Promise.all([WMS.Products.getAll(), WMS.Locations.getAll(), WMS.Inventory.getAll()]);
    el.innerHTML = '<div class="card animate-fade-in"><div class="card-header"><h3 class="card-title">📤 Registrar Salida de Mercancía</h3><span class="badge badge-danger">Nueva salida</span></div>'
      + '<form id="exitForm"><div class="form-row"><div class="form-group"><label class="form-label form-required">Producto</label><select class="form-select" id="exitProduct" required><option value="">Seleccionar...</option>' + productOptions(prods) + '</select></div><div class="form-group"><label class="form-label form-required">Cantidad</label><input type="number" class="form-input" id="exitQty" min="1" required></div></div>'
      + '<div class="form-row"><div class="form-group"><label class="form-label form-required">Stock disponible (Ubicación exacta)</label><select class="form-select" id="exitStockChoice" required><option value="">Seleccione un código primero...</option></select></div></div>'
      + '<div class="form-row"><div class="form-group"><label class="form-label">Doc. referencia</label><input type="text" class="form-input" id="exitRef"></div><div class="form-group"><label class="form-label">Lote</label><input type="text" class="form-input" id="exitLot"></div></div>'
      + '<div class="form-group"><label class="form-label">Observaciones</label><textarea class="form-textarea" id="exitNotes"></textarea></div>'
      + '<div id="exitStockInfo" style="margin-bottom:var(--space-4)"></div>'
      + '<div style="display:flex;gap:var(--space-3);justify-content:flex-end"><button type="reset" class="btn btn-secondary">Limpiar</button><button type="submit" class="btn btn-danger" id="exitSubmitBtn">📤 Registrar Salida</button></div></form></div>';

    var updateInfo = function() {
      var pid = document.getElementById('exitProduct').value;
      var sel = document.getElementById('exitStockChoice');
      sel.innerHTML = '<option value="">Seleccionar stock origen...</option>';
      if (!pid) return;
      var entries = invData.filter(function(i) { return i.productId===pid && i.quantity>0; });
      entries.forEach(function(en) {
        var loc = locations.find(function(l){return l.id===en.locationId;});
        var detail = (loc?loc.code:en.locationId);
        if (en.row||en.pos) detail += (en.row?'-F'+(parseInt(en.row)+1):'') + (en.pos?'-P'+en.pos:'');
        var txt = detail + ' - Disp: ' + en.quantity + ' uds' + (en.lot?' (Lote: '+en.lot+')':'');
        var val = en.locationId + '|' + (en.lot||'') + '|' + (en.row||'') + '|' + (en.pos||'');
        sel.innerHTML += '<option value="' + val + '">' + txt + '</option>';
      });
    };
    document.getElementById('exitProduct').addEventListener('change', updateInfo);

    document.getElementById('exitForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      var pid = document.getElementById('exitProduct').value;
      var qty = parseInt(document.getElementById('exitQty').value);
      var choice = document.getElementById('exitStockChoice').value;
      var btn = document.getElementById('exitSubmitBtn');

      if (!pid || !qty || !choice) { WMS.showToast('Producto, cantidad y origen son obligatorios.', 'warning'); return; }
      var parts = choice.split('|'), lid = parts[0], lot = parts[1], row = parts[2], pos = parts[3];
      
      btn.disabled = true; btn.textContent = 'Procesando...';
      try {
        var r = await WMS.Inventory.removeStock(pid, lid, qty, lot, '', row, pos);
        if (r && r.error) { WMS.showToast(r.error, 'error'); return; }
        var prod = prods.find(x => x.id === pid);
        var preciseLoc = lid; if (row||pos) preciseLoc += '|' + row + '|' + pos;
        var user = await WMS.getCurrentUser();
        await WMS.Movements.create({ type:'salida', productId:pid, quantity:qty, locationFrom:preciseLoc, reason:'venta', lot:lot, reference:document.getElementById('exitRef').value.trim(), notes:document.getElementById('exitNotes').value.trim(), userId:(user?user.id:null) });
        WMS.showToast('Salida registrada: ' + qty + ' uds de ' + (prod?prod.sku:pid), 'success');
        e.target.reset(); document.getElementById('exitStockInfo').innerHTML = '';
        await renderExit(el); // Refresh stock options
      } catch (err) {
        WMS.showToast('Error al registrar salida: ' + err.message, 'error');
      } finally {
        btn.disabled = false; btn.textContent = '📤 Registrar Salida';
      }
    });
  }

  // ---- STOCK QUERY ----
  async function renderStock(el) {
    var [summary, locs, invAll] = await Promise.all([WMS.Inventory.getStockSummary(), WMS.Locations.getAll(), WMS.Inventory.getAll()]);
    var items = summary;
    if (stockSearch) { var q = stockSearch.toLowerCase(); items = items.filter(function(p) { return (p.sku||'').toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q); }); }
    var pg = WMS.paginate(items, stockPage);
    var rows = ''; pg.data.forEach(function(p) {
      var isLow = p.minStock > 0 && p.totalStock <= p.minStock;
      rows += '<tr class="stock-row" data-product-id="' + p.id + '" style="cursor:pointer"><td><span class="product-sku">' + p.sku + '</span></td><td>' + p.description + '</td><td><span class="badge badge-neutral">' + (p.category||'—') + '</span></td><td><strong>' + WMS.formatNumber(p.totalStock) + '</strong> ' + (p.unit||'uds') + '</td><td>' + p.locationCount + '</td><td>' + (p.minStock?WMS.formatNumber(p.minStock):'—') + '</td><td>' + (isLow?'<span class="badge badge-danger">⚠ Stock bajo</span>':p.totalStock===0?'<span class="badge badge-neutral">Sin stock</span>':'<span class="badge badge-success">OK</span>') + '</td></tr>';
    });

    el.innerHTML = '<div class="card animate-fade-in"><div class="card-header"><h3 class="card-title">🔍 Consulta de Stock</h3></div><div class="filter-bar"><div class="search-bar"><span class="search-bar-icon">🔍</span><input type="text" id="stockSearchInput" placeholder="Buscar por código o descripción..." value="' + stockSearch + '"></div></div>'
      + (pg.data.length===0 ? '<div class="empty-state"><div class="empty-state-icon">📦</div><h3 class="empty-state-title">Sin resultados</h3></div>' :
      '<div class="table-wrapper"><table class="table"><thead><tr><th>Código</th><th>Descripción</th><th>Categoría</th><th>Stock Total</th><th>Ubicaciones</th><th>Stock Mín.</th><th>Estado</th></tr></thead><tbody>' + rows + '</tbody></table></div><div class="pagination" id="stockPagination"></div>')
      + '</div><div id="stockDetail" style="margin-top:var(--space-4)"></div>';

    var si = document.getElementById('stockSearchInput');
    if (si) si.addEventListener('input', WMS.debounce(async function(e) { stockSearch = e.target.value; stockPage = 1; await renderStock(el); }, 250));
    var pEl = document.getElementById('stockPagination');
    if (pEl) WMS.renderPagination(pEl, pg, async function(p) { stockPage = p; await renderStock(el); });
    el.querySelectorAll('.stock-row').forEach(function(row) {
      row.addEventListener('click', async function() {
        var pid = row.dataset.productId;
        var prod = await WMS.Products.getById(pid); if(!prod) return;
        var entries = invAll.filter(function(i) { return i.productId===pid && i.quantity>0; });
        var recMoves = (await WMS.Movements.getByProduct(pid)).sort(function(a,b){return new Date(b.timestamp)-new Date(a.timestamp);}).slice(0,5);
        var totalSt = entries.reduce((s,i) => s+(i.quantity||0), 0);
        var deHtml = '<div class="card animate-fade-in"><div class="card-header"><h3 class="card-title">📦 ' + prod.sku + ' — ' + prod.description + '</h3><span class="badge badge-primary">Stock: ' + WMS.formatNumber(totalSt) + '</span></div><h4 style="color:var(--text-secondary);font-size:var(--font-sm);margin-bottom:var(--space-3)">Distribución por Ubicación</h4>';
        if (entries.length === 0) deHtml += '<p class="text-muted" style="font-size:var(--font-sm)">Sin stock</p>';
        else entries.forEach(function(e) {
          var loc = locs.find(function(l){return l.id===e.locationId;});
          var detail = (loc?loc.code:e.locationId);
          if (e.row||e.pos) detail += (e.row?'-F'+(parseInt(e.row)+1):'') + (e.pos?'-P'+e.pos:'');
          deHtml += '<div class="stock-location-item"><div><span class="stock-location-code">' + detail + '</span><span class="text-muted" style="font-size:var(--font-xs);margin-left:var(--space-2)">' + (loc?loc.name:'') + '</span>' + (e.lot?'<span class="badge badge-info" style="margin-left:var(--space-2)">Lote: '+e.lot+'</span>':'') + '</div><div><span class="stock-location-qty">' + WMS.formatNumber(e.quantity) + '</span></div></div>';
        });
        if (recMoves.length > 0) {
          deHtml += '<h4 style="color:var(--text-secondary);font-size:var(--font-sm);margin:var(--space-5) 0 var(--space-3)">Movimientos Recientes</h4><div class="table-wrapper"><table class="table"><thead><tr><th>Fecha</th><th>Tipo</th><th>Cantidad</th><th>Referencia</th></tr></thead><tbody>';
          recMoves.forEach(function(m) { deHtml += '<tr><td>' + WMS.formatDateTime(m.timestamp) + '</td><td><span class="movement-type ' + m.type + '">' + (typeLabels[m.type]||m.type) + '</span></td><td>' + (m.type==='salida'?'-':'+') + WMS.formatNumber(m.quantity) + '</td><td>' + (m.reference||'—') + '</td></tr>'; });
          deHtml += '</tbody></table></div>';
        }
        deHtml += '</div>';
        document.getElementById('stockDetail').innerHTML = deHtml;
        document.getElementById('stockDetail').scrollIntoView({ behavior:'smooth', block:'start' });
      });
    });
  }

  // ---- MOVEMENTS ----
  async function renderMovements(el) {
    var [allMovs, prods, locs] = await Promise.all([WMS.Movements.getAll(), WMS.Products.getAll(), WMS.Locations.getAll()]);
    var items = allMovs;
    if (movFilter) items = items.filter(function(m) { return m.type === movFilter; });
    var pg = WMS.paginate(items, movPage);
    var rows = ''; pg.data.forEach(function(m) {
      var prod = prods.find(function(p){return p.id===m.productId;});
      var formatLoc = function(val) {
        if (!val) return '—';
        var p = val.split('|'), l = locs.find(function(ll){return ll.id===p[0];});
        var d = (l?l.code:p[0]);
        if (p[1]||p[2]) d += (p[1]?'-F'+(parseInt(p[1])+1):'') + (p[2]?'-P'+p[2]:'');
        return d;
      };
      var dF = formatLoc(m.locationFrom), dT = formatLoc(m.locationTo);
      var locD = m.type==='entrada' ? '→ '+dT : m.type==='salida' ? dF+' →' : dF+' → '+dT;
      rows += '<tr><td style="white-space:nowrap">' + WMS.formatDateTime(m.timestamp) + '</td><td><span class="movement-type ' + m.type + '">' + (typeLabels[m.type]||m.type) + '</span></td><td><span class="product-sku">' + (prod?prod.sku:'—') + '</span></td><td>' + (m.type==='salida'?'-':'+') + WMS.formatNumber(m.quantity) + '</td><td style="font-size:var(--font-xs)">' + locD + '</td><td>' + (m.reference||'—') + '</td><td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (m.notes||'—') + '</td></tr>';
    });
    el.innerHTML = '<div class="card animate-fade-in"><div class="card-header"><h3 class="card-title">📋 Historial de Movimientos</h3><span class="badge badge-neutral">' + pg.total + ' registros</span></div><div class="filter-bar"><select class="form-select" id="movTypeFilter"><option value="">Todos los tipos</option><option value="entrada"' + (movFilter==='entrada'?' selected':'') + '>Entradas</option><option value="salida"' + (movFilter==='salida'?' selected':'') + '>Salidas</option><option value="ajuste"' + (movFilter==='ajuste'?' selected':'') + '>Ajustes</option><option value="transferencia"' + (movFilter==='transferencia'?' selected':'') + '>Transferencias</option></select></div>'
      + (pg.data.length===0 ? '<div class="empty-state"><div class="empty-state-icon">📋</div><h3 class="empty-state-title">Sin movimientos</h3></div>' :
      '<div class="table-wrapper"><table class="table"><thead><tr><th>Fecha/Hora</th><th>Tipo</th><th>Producto</th><th>Cantidad</th><th>Ubicación</th><th>Referencia</th><th>Notas</th></tr></thead><tbody>' + rows + '</tbody></table></div><div class="pagination" id="movPagination"></div>')
      + '</div>';
    var mf = document.getElementById('movTypeFilter');
    if (mf) mf.addEventListener('change', async function(e) { movFilter = e.target.value; movPage = 1; await renderMovements(el); });
    var pEl = document.getElementById('movPagination');
    if (pEl) WMS.renderPagination(pEl, pg, async function(p) { movPage = p; await renderMovements(el); });
  }
})();
