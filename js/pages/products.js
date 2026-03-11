// ============================================
// WMS - Products Page (global namespace)
// ============================================
(function() {
  var currentPage = 1, searchQuery = '', categoryFilter = '';

  WMS.renderProducts = async function(container) {
    currentPage = 1; searchQuery = ''; categoryFilter = '';
    await renderPage(container);
  };

  async function renderPage(container) {
    var [allItems, inv, locations] = await Promise.all([WMS.Products.getAll(), WMS.Inventory.getAll(), WMS.Locations.getAll()]);
    var items = allItems;
    if (searchQuery) { var q = searchQuery.toLowerCase(); items = items.filter(function(p) { return (p.sku||'').toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q); }); }
    if (categoryFilter) { items = items.filter(function(p) { return p.category === categoryFilter; }); }
    
    var cats = []; allItems.forEach(function(p) { if (p.category && cats.indexOf(p.category) === -1) cats.push(p.category); }); cats.sort();
    var pg = WMS.paginate(items, currentPage);
    var canWrite = await WMS.hasPermission('products', 'write');

    var rows = ''; pg.data.forEach(function(p) {
      var prodInv = inv.filter(function(i){return i.productId===p.id && (i.quantity||0) > 0;});
      var st = prodInv.reduce(function(s,i){return s+(i.quantity||0);}, 0);
      var isLow = p.minStock > 0 && st <= p.minStock;
      
      var locNames = [];
      prodInv.forEach(function(i) {
        var l = locations.find(function(loc) { return loc.id === i.locationId; });
        if (l) {
          var name = l.code;
          if (i.row || i.pos) name += (i.row ? '-F'+i.row : '') + (i.pos ? '-P'+i.pos : '');
          if (locNames.indexOf(name) === -1) locNames.push(name);
        }
      });
      var locStr = locNames.length > 0 ? locNames.join(', ') : '—';

      rows += '<tr><td><span class="product-sku">' + p.sku + '</span></td><td>' + p.description + '</td><td><span class="badge badge-neutral">' + (p.category||'—') + '</span></td><td><span class="badge ' + (isLow?'badge-danger':'badge-success') + '">' + WMS.formatNumber(st) + '</span></td><td>' + (p.minStock?WMS.formatNumber(p.minStock):'—') + '</td><td>' + locStr + '</td>'
      + (canWrite ? '<td><div class="flex gap-1"><button class="btn btn-ghost btn-icon btn-sm print-label-btn" data-id="' + p.id + '" title="Imprimir Etiqueta">🏷️</button><button class="btn btn-ghost btn-icon btn-sm edit-product-btn" data-id="' + p.id + '" title="Editar">✏️</button><button class="btn btn-ghost btn-icon btn-sm delete-product-btn" data-id="' + p.id + '" title="Eliminar">🗑️</button></div></td>' : '') + '</tr>';
    });

    var catOpts = ''; cats.forEach(function(c) { catOpts += '<option value="' + c + '"' + (c===categoryFilter?' selected':'') + '>' + c + '</option>'; });

    container.innerHTML = '<div class="page-header"><div><h1 class="page-title">Productos</h1><p class="page-subtitle">Catálogo de productos del almacén</p></div><div style="display:flex;gap:var(--space-2)">' + (canWrite?'<button class="btn btn-secondary" id="importExcelBtn">📄 Cargar Excel</button><input type="file" id="excelInput" style="display:none" accept=".xlsx, .xls"><button class="btn btn-primary" id="addProductBtn">+ Nuevo Producto</button>':'') + '</div></div>'
      + '<div class="card"><div class="filter-bar"><div class="search-bar"><span class="search-bar-icon">🔍</span><input type="text" id="productSearch" placeholder="Buscar por código o descripción..." value="' + searchQuery + '"></div><select class="form-select" id="categoryFilter"><option value="">Todas las categorías</option>' + catOpts + '</select></div>'
      + (pg.data.length === 0 ? '<div class="empty-state"><div class="empty-state-icon">📦</div><h3 class="empty-state-title">No hay productos</h3><p class="empty-state-text">' + (searchQuery||categoryFilter?'No se encontraron productos con los filtros aplicados.':'Empieza añadiendo tu primer producto.') + '</p></div>' :
      '<div class="table-wrapper"><table class="table"><thead><tr><th>Código</th><th>Descripción</th><th>Categoría</th><th>Stock</th><th>Stock Mín.</th><th>Ubicación</th>' + (canWrite?'<th>Acciones</th>':'') + '</tr></thead><tbody>' + rows + '</tbody></table></div><div class="pagination" id="productPagination"></div>')
      + '</div>'
      + '<div class="modal-overlay" id="productModal"><div class="modal"><div class="modal-header"><h3 class="modal-title" id="productModalTitle">Nuevo Producto</h3><button class="modal-close" onclick="WMS.closeModal(\'productModal\')">✕</button></div><div class="modal-body"><form id="productForm"><div class="form-row"><div class="form-group"><label class="form-label form-required">Código</label><input type="text" class="form-input" id="prodSku" placeholder="Ej: TOR-M10-50" required></div><div class="form-group"><label class="form-label form-required">Categoría</label><input type="text" class="form-input" id="prodCategory" placeholder="Ej: Tornillería" required></div></div><div class="form-group"><label class="form-label form-required">Descripción</label><input type="text" class="form-input" id="prodDescription" placeholder="Descripción del producto" required></div><div class="form-row"><div class="form-group"><label class="form-label">Unidad de medida</label><select class="form-select" id="prodUnit"><option value="uds">Unidades</option><option value="kg">Kilogramos</option><option value="m">Metros</option><option value="l">Litros</option><option value="cajas">Cajas</option></select></div><div class="form-group"><label class="form-label">Peso unitario (kg)</label><input type="number" step="0.001" class="form-input" id="prodWeight" placeholder="0.00"></div></div><div class="form-row"><div class="form-group"><label class="form-label">Stock mínimo</label><input type="number" class="form-input" id="prodMinStock" placeholder="0" min="0"></div><div class="form-group"><label class="form-label">Inventario (Manual)</label><input type="number" class="form-input" id="prodInventory" placeholder="0" min="0"></div><div class="form-group" style="display:flex;align-items:flex-end;padding-bottom:var(--space-4)"><label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer;font-size:var(--font-sm);color:var(--text-secondary)"><input type="checkbox" id="prodLotRequired" style="width:18px;height:18px;accent-color:var(--primary-500)"> Lote obligatorio</label></div></div><input type="hidden" id="prodEditId"></form></div><div class="modal-footer"><button class="btn btn-secondary" onclick="WMS.closeModal(\'productModal\')">Cancelar</button><button class="btn btn-primary" id="saveProductBtn">Guardar</button></div></div></div>'
      + '<div class="modal-overlay" id="labelModal"><div class="modal" style="width:400px"><div class="modal-header"><h3 class="modal-title">Vista Previa de Etiqueta</h3><button class="modal-close" onclick="WMS.closeModal(\'labelModal\')">✕</button></div><div class="modal-body" style="display:flex;justify-content:center;padding:20px;background:#f0f2f5">'
      + '<div id="labelPreview" style="width:75mm;height:55mm;background:#fff;border:1px solid #ccc;position:relative;padding:4mm;box-sizing:border-box;color:#000;display:flex;flex-direction:column;font-family:Arial,sans-serif;overflow:hidden">'
      + '<div style="font-size:32px;font-weight:900;margin-bottom:4px;word-break:break-all;line-height:1" id="labelSku">SKU-EXAMPLE</div>'
      + '<div style="font-size:18px;line-height:1.2;font-weight:500;margin-bottom:8px;flex:1;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical" id="labelDesc">Product description goes here...</div>'
      + '<div style="display:flex;justify-content:flex-end;align-items:flex-end;margin-top:auto"><div id="labelQr"></div></div>'
      + '</div></div><div class="modal-footer"><button class="btn btn-secondary" onclick="WMS.closeModal(\'labelModal\')">Cerrar</button><button class="btn btn-primary" onclick="window.printLabel()">🖨️ Imprimir</button></div></div></div>';

    var si = document.getElementById('productSearch');
    if (si) si.addEventListener('input', WMS.debounce(async function(e) { searchQuery = e.target.value; currentPage = 1; await renderPage(container); }, 250));
    var cf = document.getElementById('categoryFilter');
    if (cf) cf.addEventListener('change', async function(e) { categoryFilter = e.target.value; currentPage = 1; await renderPage(container); });
    var ab = document.getElementById('addProductBtn');
    if (ab) ab.addEventListener('click', function() { openProductModal(); });
    
    var ib = document.getElementById('importExcelBtn');
    if (ib) ib.addEventListener('click', function() { document.getElementById('excelInput').click(); });
    var ein = document.getElementById('excelInput');
    if (ein) ein.addEventListener('change', async function(e) { await importExcel(e, container); });

    container.querySelectorAll('.print-label-btn').forEach(function(b) { b.addEventListener('click', async function() { await showLabel(b.dataset.id); }); });
    container.querySelectorAll('.edit-product-btn').forEach(function(b) { b.addEventListener('click', async function() { await openProductModal(b.dataset.id); }); });
    container.querySelectorAll('.delete-product-btn').forEach(function(b) { b.addEventListener('click', async function() { await deleteProduct(b.dataset.id, container); }); });
    var sp = document.getElementById('saveProductBtn');
    if (sp) sp.addEventListener('click', async function() { await saveProduct(container); });
    var pgEl = document.getElementById('productPagination');
    if (pgEl) WMS.renderPagination(pgEl, pg, async function(p) { currentPage = p; await renderPage(container); });
  }

  async function importExcel(e, container) {
    var file = e.target.files[0]; if (!file) return;
    var reader = new FileReader();
    reader.onload = async function(evt) {
      try {
        var data = new Uint8Array(evt.target.result);
        var workbook = XLSX.read(data, { type: 'array' });
        var sheet = workbook.Sheets[workbook.SheetNames[0]];
        var rows = XLSX.utils.sheet_to_json(sheet);
        var count = 0;
        for (var r of rows) {
          if (r.sku || r.SKU) {
            await WMS.Products.create({
              sku: String(r.sku || r.SKU || ''),
              description: String(r.description || r.DESCRIPCION || ''),
              category: String(r.category || r.CATEGORIA || ''),
              unit: String(r.unit || r.UNIDAD || 'uds'),
              minStock: parseInt(r.minStock || r.STOCK_MIN || 0),
              inventario: parseInt(r.inventario || r.INVENTARIO || 0),
              lotRequired: !!(r.lotRequired || r.LOTE_OBLIGATORIO)
            });
            count++;
          }
        }
        WMS.showToast('Se han importado ' + count + ' productos.', 'success');
        await renderPage(container);
      } catch (err) { WMS.showToast('Error al procesar el archivo Excel.', 'error'); }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  }

  window.printLabel = function() {
    var content = document.getElementById('labelPreview').innerHTML;
    var win = window.open('', 'PRINT', 'height=600,width=800');
    win.document.write('<html><head><title>Imprimir Etiqueta</title>');
    win.document.write('<style>@page { size: 75mm 55mm; margin: 0; } body { margin: 0; padding: 0; } #label { width: 75mm; height: 55mm; padding: 4mm; box-sizing: border-box; display: flex; flex-direction: column; font-family: Arial, sans-serif; color: #000; overflow: hidden; }</style>');
    win.document.write('</head><body><div id="label">');
    win.document.write(content);
    win.document.write('</div></body></html>');
    win.document.close();
    win.focus();
    setTimeout(function() { win.print(); win.close(); }, 500);
  };

  async function showLabel(id) {
    var p = await WMS.Products.getById(id); if (!p) return;
    document.getElementById('labelSku').textContent = p.sku;
    document.getElementById('labelDesc').textContent = p.description;
    var qrEl = document.getElementById('labelQr');
    qrEl.innerHTML = '';
    new QRCode(qrEl, { text: p.sku, width: 90, height: 90, colorDark: "#000000", colorLight: "#ffffff" });
    WMS.openModal('labelModal');
  }

  async function openProductModal(editId) {
    var title = document.getElementById('productModalTitle');
    document.getElementById('productForm').reset();
    document.getElementById('prodEditId').value = '';
    if (editId) {
      var p = await WMS.Products.getById(editId);
      if (p) {
        title.textContent = 'Editar Producto';
        document.getElementById('prodSku').value = p.sku||'';
        document.getElementById('prodDescription').value = p.description||'';
        document.getElementById('prodCategory').value = p.category||'';
        document.getElementById('prodUnit').value = p.unit||'uds';
        document.getElementById('prodWeight').value = p.weight||'';
        document.getElementById('prodMinStock').value = p.minStock||'';
        document.getElementById('prodInventory').value = p.inventario||'';
        document.getElementById('prodLotRequired').checked = p.lotRequired||false;
        document.getElementById('prodEditId').value = editId;
      }
    } else { title.textContent = 'Nuevo Producto'; }
    WMS.openModal('productModal');
  }

  async function saveProduct(container) {
    var sku = document.getElementById('prodSku').value.trim();
    var desc = document.getElementById('prodDescription').value.trim();
    var cat = document.getElementById('prodCategory').value.trim();
    var unit = document.getElementById('prodUnit').value;
    var weight = parseFloat(document.getElementById('prodWeight').value) || 0;
    var minStock = parseInt(document.getElementById('prodMinStock').value) || 0;
    var inventario = parseInt(document.getElementById('prodInventory').value) || 0;
    var lotReq = document.getElementById('prodLotRequired').checked;
    var editId = document.getElementById('prodEditId').value;
    
    if (!sku || !desc) { WMS.showToast('Código y descripción son obligatorios.', 'warning'); return; }
    
    try {
      if (editId) { 
        await WMS.Products.update(editId, { sku:sku, description:desc, category:cat, unit:unit, weight:weight, minStock:minStock, inventario:inventario, lotRequired:lotReq }); 
        WMS.showToast('Producto actualizado.', 'success'); 
      } else { 
        await WMS.Products.create({ sku:sku, description:desc, category:cat, unit:unit, weight:weight, minStock:minStock, inventario:inventario, lotRequired:lotReq }); 
        WMS.showToast('Producto creado.', 'success'); 
      }
      WMS.closeModal('productModal'); 
      await renderPage(container);
    } catch (err) {
      console.error("Error al guardar producto:", err);
      WMS.showToast('Error al guardar: ' + (err.message || 'Revisa la consola'), 'error');
    }
  }

  async function deleteProduct(id, container) {
    var p = await WMS.Products.getById(id);
    if (!p || !confirm('¿Eliminar el producto "' + p.description + '"?')) return;
    var r = await WMS.Products.delete(id);
    if (r && r.error) { WMS.showToast(r.error, 'error'); return; }
    WMS.showToast('Producto eliminado.', 'success'); await renderPage(container);
  }
})();
