// ============================================
// WMS - Locations Page (global namespace)
// ============================================
(function() {
  WMS.renderLocations = function(container) {
    var locations = WMS.Locations.getAll();
    var canWrite = WMS.hasPermission('locations', 'write'), inv = WMS.Inventory.getAll();

    // Grouping logic
    var shelves = {};
    locations.forEach(function(loc) {
      var match = loc.code.match(/^([A-Z])-M(\d+)$/);
      if (match) {
        var letter = match[1];
        if (!shelves[letter]) shelves[letter] = [];
        shelves[letter].push(loc);
      }
    });

    function renderPosition(loc, rowIndex, posIndex) {
      var slotInv = inv.filter(function(i) {
        return i.locationId === loc.id && (parseInt(i.row) === rowIndex || i.row === String(rowIndex)) && (parseInt(i.pos) === posIndex || i.pos === String(posIndex));
      });
      var qty = slotInv.reduce(function(s, i) { return s + (i.quantity||0); }, 0);
      var materials = slotInv.map(function(i) {
        var p = WMS.Products.getById(i.productId);
        return '• ' + (p ? p.sku : i.productId) + ': ' + i.quantity + ' uds';
      }).join('<br>');

      var badgeClass = qty > 0 ? 'badge-info' : 'badge-neutral';
      return '<div class="tree-node">' +
        '<div class="tree-item' + (materials ? ' has-children' : '') + '">' +
          (materials ? '<span class="tree-toggle">▶</span>' : '<span style="width:20px;display:inline-block"></span>') +
          '<span class="tree-icon">📍</span>' +
          '<span class="tree-label">Posición P' + posIndex + '</span>' +
          '<span class="badge ' + badgeClass + '">' + WMS.formatNumber(qty) + ' uds</span>' +
        '</div>' +
        (materials ? '<div class="tree-children hidden" style="padding-left:40px; font-size:var(--font-xs); color:var(--text-secondary); line-height:1.4">' + materials + '</div>' : '') +
      '</div>';
    }

    function renderRow(loc, rowIndex) {
      var rowQty = inv.filter(function(i) {
        return i.locationId === loc.id && (parseInt(i.row) === rowIndex || i.row === String(rowIndex));
      }).reduce(function(s, i) { return s + (i.quantity||0); }, 0);
      
      var positionsHtml = '';
      for (var p = 1; p <= (loc.slotsPerRow || 3); p++) {
        positionsHtml += renderPosition(loc, rowIndex, p);
      }

      var badgeClass = rowQty > 0 ? 'badge-info' : 'badge-neutral';
      return '<div class="tree-node">' +
        '<div class="tree-item has-children">' +
          '<span class="tree-toggle">▶</span>' +
          '<span class="tree-icon">📑</span>' +
          '<span class="tree-label">Fila F' + (rowIndex + 1) + '</span>' +
          '<span class="badge ' + badgeClass + '">' + WMS.formatNumber(rowQty) + ' uds</span>' +
        '</div>' +
        '<div class="tree-children hidden">' + positionsHtml + '</div>' +
      '</div>';
    }

    function renderModule(loc) {
      var qty = inv.filter(function(i) { return i.locationId === loc.id; }).reduce(function(s, i) { return s + (i.quantity||0); }, 0);
      var badgeClass = qty > 0 ? 'badge-info' : 'badge-neutral';
      var rowsHtml = '';
      if (loc.rows) {
        for (var i = 0; i < loc.rows; i++) {
          rowsHtml += renderRow(loc, i);
        }
      }
      
      return '<div class="tree-node">' +
        '<div class="tree-item has-children" data-id="' + loc.id + '">' +
          '<span class="tree-toggle">▶</span>' +
          '<span class="tree-icon">📦</span>' +
          '<span class="tree-label">' + loc.code.split('-')[1] + ' <span style="font-weight:400;color:var(--text-secondary);margin-left:8px">' + loc.name + '</span></span>' +
          '<span class="badge ' + badgeClass + '">' + WMS.formatNumber(qty) + ' uds</span>' +
          (canWrite ? '<div style="margin-left:auto"><button class="btn btn-ghost btn-icon btn-sm edit-loc-btn" data-id="' + loc.id + '" title="Editar">✏️</button><button class="btn btn-ghost btn-icon btn-sm delete-loc-btn" data-id="' + loc.id + '" title="Eliminar">🗑️</button></div>' : '') +
        '</div>' +
        '<div class="tree-children hidden">' + rowsHtml + '</div>' +
      '</div>';
    }

    function renderShelf(letter, mods) {
      mods.sort(function(a, b) {
        var m1 = parseInt(a.code.split('-M')[1]);
        var m2 = parseInt(b.code.split('-M')[1]);
        return m1 - m2;
      });
      
      var qty = mods.reduce(function(sum, m) {
        return sum + inv.filter(function(i) { return i.locationId === m.id; }).reduce(function(s, i) { return s + (i.quantity||0); }, 0);
      }, 0);
      
      var badgeClass = qty > 0 ? 'badge-info' : 'badge-neutral';
      var modsHtml = mods.map(renderModule).join('');

      return '<div class="tree-node">' +
        '<div class="tree-item has-children">' +
          '<span class="tree-toggle">▶</span>' +
          '<span class="tree-icon">🏗️</span>' +
          '<span class="tree-label">Estantería ' + letter + '</span>' +
          '<span class="badge ' + badgeClass + '">' + WMS.formatNumber(qty) + ' uds</span>' +
        '</div>' +
        '<div class="tree-children hidden">' + modsHtml + '</div>' +
      '</div>';
    }

    var shelfLetters = Object.keys(shelves).sort();
    var treeHtml = shelfLetters.map(function(l) { return renderShelf(l, shelves[l]); }).join('');

    var totalQty = inv.reduce(function(s, i) { return s + (i.quantity||0); }, 0);
    var totalShelves = WMS.Stats.getTotalShelves();
    var totalMods = WMS.Stats.getTotalLocations();
    var totalSlotsCap = WMS.Stats.getTotalSlots();

    container.innerHTML = '<div class="page-header"><div><h1 class="page-title">Ubicaciones</h1><p class="page-subtitle">Estructura jerárquica del almacén</p></div><div style="display:flex;gap:var(--space-2)">' + (canWrite ? '<button class="btn btn-danger" id="deleteAllLocsBtn">🗑️ Borrar Todas</button><button class="btn btn-secondary" id="openGenBtn">🛠️ Generar Estructura</button><button class="btn btn-primary" id="addLocationBtn">+ Nueva Ubicación</button>' : '') + '</div></div>'
      + '<div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:var(--space-4);margin-bottom:var(--space-6)">'
      +   '<div class="card" style="padding:var(--space-4);display:flex;align-items:center;gap:var(--space-4)"><div style="font-size:2rem">🏗️</div><div><div style="font-size:var(--font-xs);color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px">Estanterías</div><div style="font-size:1.5rem;font-weight:700">' + totalShelves + '</div></div></div>'
      +   '<div class="card" style="padding:var(--space-4);display:flex;align-items:center;gap:var(--space-4)"><div style="font-size:2rem">📦</div><div><div style="font-size:var(--font-xs);color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px">Módulos</div><div style="font-size:1.5rem;font-weight:700">' + totalMods + '</div></div></div>'
      +   '<div class="card" style="padding:var(--space-4);display:flex;align-items:center;gap:var(--space-4)"><div style="font-size:2rem">📥</div><div><div style="font-size:var(--font-xs);color:var(--text-secondary);text-transform:uppercase;letter-spacing:1px">Capacidad Total (Pallets)</div><div style="font-size:1.5rem;font-weight:700">' + WMS.formatNumber(totalSlotsCap) + '</div></div></div>'
      + '</div>'
      + '<div class="card"><div class="card-header"><h3 class="card-title">🏢 Almacén General</h3></div>'
      + '<div class="location-tree">'
      +   '<div class="tree-node">'
      +     '<div class="tree-item has-children">'
      +       '<span class="tree-toggle">▶</span>'
      +       '<span class="tree-icon">🏭</span>'
      +       '<span class="tree-label">IW — ITC Warehouse</span>'
      +       '<span class="badge ' + (totalQty > 0 ? 'badge-info' : 'badge-neutral') + '">' + WMS.formatNumber(totalQty) + ' uds</span>'
      +     '</div>'
      +     '<div class="tree-children hidden">' + (treeHtml || '<div style="padding:var(--space-8);text-align:center;color:var(--text-muted)">No hay estanterías configuradas</div>') + '</div>'
      +   '</div>'
      + '</div>'
      + '</div>'
      // Modals...
      + '<div class="modal-overlay" id="locationModal"><div class="modal"><div class="modal-header"><h3 class="modal-title" id="locationModalTitle">Nueva Ubicación</h3><button class="modal-close" onclick="WMS.closeModal(\'locationModal\')">✕</button></div><div class="modal-body"><form id="locationForm"><div class="form-row"><div class="form-group"><label class="form-label form-required">Código</label><input type="text" class="form-input" id="locCode" required placeholder="Ej: A-M1"></div><div class="form-group"><label class="form-label form-required">Nombre</label><input type="text" class="form-input" id="locName" required></div></div><input type="hidden" id="locEditId"></form></div><div class="modal-footer"><button class="btn btn-secondary" onclick="WMS.closeModal(\'locationModal\')">Cancelar</button><button class="btn btn-primary" id="saveLocationBtn">Guardar</button></div></div></div>'
      + '<div class="modal-overlay" id="genModal"><div class="modal" style="max-width:600px"><div class="modal-header"><h3 class="modal-title">Generar Estructura masiva</h3><button class="modal-close" onclick="WMS.closeModal(\'genModal\')">✕</button></div><div class="modal-body"><p style="margin-bottom:var(--space-3);color:var(--text-secondary)">Generación automática con formato: <br><strong>[Estantería]-[Modulo]</strong><br>Ejemplo: A-M1, A-M2...</p><form id="genForm"><div class="form-row"><div class="form-group"><label class="form-label form-required">Nº Estanterías (A-Z)</label><input type="number" class="form-input" id="genEst" min="1" max="26" required value="1"></div><div class="form-group"><label class="form-label form-required">Nº Módulos por estantería (M)</label><input type="number" class="form-input" id="genMod" min="1" required value="10"></div></div><div class="form-row"><div class="form-group"><label class="form-label">Filas por módulo (incluye suelo)</label><input type="number" class="form-input" id="genRows" min="1" value="3"></div><div class="form-group"><label class="form-label">Huecos por fila</label><input type="number" class="form-input" id="genSlotsPerRow" min="1" value="3"></div></div><div style="background:var(--bg-secondary);padding:var(--space-4);border-radius:var(--radius-md);margin-top:var(--space-4);text-align:center"><div style="font-size:var(--font-xs);color:var(--text-secondary);text-transform:uppercase">Total Huecos Estimados</div><div style="font-size:2rem;font-weight:700;color:var(--primary)" id="genPreview">90</div></div></form></div><div class="modal-footer"><button class="btn btn-secondary" onclick="WMS.closeModal(\'genModal\')">Cancelar</button><button class="btn btn-primary" id="runGenBtn">Generar Estructura</button></div></div></div>';

    // Event Delegation for Tree toggles
    container.querySelectorAll('.tree-item.has-children').forEach(function(item) {
      item.addEventListener('click', function(e) {
        // Prevent toggle if clicking on edit/delete buttons
        if (e.target.closest('.edit-loc-btn') || e.target.closest('.delete-loc-btn')) return;
        
        var children = item.nextElementSibling;
        var toggle = item.querySelector('.tree-toggle');
        if (children) {
          children.classList.toggle('hidden');
          toggle.classList.toggle('open');
          toggle.textContent = toggle.classList.contains('open') ? '▼' : '▶';
        }
      });
    });
    if (canWrite) {
      container.querySelectorAll('.edit-loc-btn').forEach(function(b) { b.addEventListener('click', function(e) { e.stopPropagation(); openLocModal(b.dataset.id); }); });
      container.querySelectorAll('.delete-loc-btn').forEach(function(b) { b.addEventListener('click', function(e) { e.stopPropagation(); delLoc(b.dataset.id, container); }); });
      
      var delAll = document.getElementById('deleteAllLocsBtn');
      if (delAll) {
        delAll.addEventListener('click', function() {
          if (confirm('⚠️ ATENCIÓN ⚠️\n¿Estás seguro de que quieres BORRAR TODAS LAS UBICACIONES? Esta acción no se puede deshacer.')) {
            var allLocs = WMS.Locations.getAll();
            var fails = 0;
            allLocs.forEach(function(L) {
              var r = WMS.Locations.delete(L.id);
              if (r && r.error) fails++;
            });
            if (fails > 0) WMS.showToast(fails + ' ubicaciones no se pudieron borrar porque contienen stock.', 'warning');
            else WMS.showToast('Todas las ubicaciones han sido eliminadas.', 'success');
            WMS.renderLocations(container);
          }
        });
      }
    }
    
    // Main button listeners
    var addBtn = document.getElementById('addLocationBtn');
    if (addBtn) addBtn.addEventListener('click', function() { openLocModal(); });
    
    var genBtn = document.getElementById('openGenBtn');
    if (genBtn) genBtn.addEventListener('click', function() { 
      document.getElementById('genForm').reset(); 
      updateGenPreview();
      WMS.openModal('genModal'); 
    });

    ['genEst', 'genMod', 'genRows', 'genSlotsPerRow'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', updateGenPreview);
    });

    function updateGenPreview() {
      var est = parseInt(document.getElementById('genEst').value)||0;
      var mod = parseInt(document.getElementById('genMod').value)||0;
      var rows = parseInt(document.getElementById('genRows').value)||0;
      var slots = parseInt(document.getElementById('genSlotsPerRow').value)||0;
      var total = est * mod * rows * slots;
      document.getElementById('genPreview').textContent = WMS.formatNumber(total);
    }
    
    var runBtn = document.getElementById('runGenBtn');
    if (runBtn) runBtn.addEventListener('click', function() { generateStructure(container); });
    
    var saveBtn = document.getElementById('saveLocationBtn');
    if (saveBtn) saveBtn.addEventListener('click', function() { saveLoc(container); });
  };

  function openLocModal(editId) {
    document.getElementById('locationForm').reset();
    document.getElementById('locEditId').value = '';
    if (editId) {
      var l = WMS.Locations.getById(editId); if(!l) return;
      document.getElementById('locationModalTitle').textContent = 'Editar Ubicación';
      document.getElementById('locCode').value = l.code||'';
      document.getElementById('locName').value = l.name||'';
      document.getElementById('locEditId').value = editId;
    } else { 
      document.getElementById('locationModalTitle').textContent = 'Nueva Ubicación'; 
    }
    WMS.openModal('locationModal');
  }

  function saveLoc(container) {
    var code = document.getElementById('locCode').value.trim(), name = document.getElementById('locName').value.trim();
    if (!code || !name) { WMS.showToast('Código y nombre son obligatorios.', 'warning'); return; }
    var editId = document.getElementById('locEditId').value;
    var ex = WMS.Locations.getByCode(code);
    if (ex && ex.id !== editId) { WMS.showToast('Ya existe una ubicación con este código.', 'error'); return; }
    var data = { code:code, name:name, level:'position', type:'almacenaje', parentId:null, status:'active' };
    
    // For manual locations, we default to 1 row and 3 slots (or retain existing if editing)
    if (editId) {
       var existing = WMS.Locations.getById(editId);
       if(existing) {
           data.rows = existing.rows || 1;
           data.slotsPerRow = existing.slotsPerRow || 3;
           data.maxCapacity = existing.maxCapacity || (data.rows * data.slotsPerRow);
           if(existing.x_pos !== undefined) data.x_pos = existing.x_pos;
           if(existing.z_pos !== undefined) data.z_pos = existing.z_pos;
           if(existing.rotation !== undefined) data.rotation = existing.rotation;
       }
       WMS.Locations.update(editId, data); WMS.showToast('Ubicación actualizada.', 'success'); 
    } else { 
       data.rows = 1;
       data.slotsPerRow = 3;
       data.maxCapacity = 3;
       WMS.Locations.create(data); WMS.showToast('Ubicación creada.', 'success'); 
    }
    WMS.closeModal('locationModal'); WMS.renderLocations(container);
  }

  function generateStructure(container) {
    var est = parseInt(document.getElementById('genEst').value)||0;
    var mod = parseInt(document.getElementById('genMod').value)||0;
    var rows = parseInt(document.getElementById('genRows').value)||1;
    var slotsPerRow = parseInt(document.getElementById('genSlotsPerRow').value)||3;

    if (!est || !mod) {
      WMS.showToast('Completa los campos de estanterías y módulos.', 'warning');
      return;
    }

    var abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var added = 0;
    var totalSlots = est * mod * rows * slotsPerRow;
    var calcCap = rows * slotsPerRow;

    for (var e=0; e<est; e++) {
      var letter = abc[e % 26];
      for (var m=1; m<=mod; m++) {
        var code = letter + '-M' + m;
        var name = 'Estantería ' + letter + ' Módulo ' + m;
        if (!WMS.Locations.getByCode(code)) {
          WMS.Locations.create({ 
            code:code, 
            name:name, 
            level:'position', 
            type:'almacenaje', 
            parentId:null, 
            status:'active', 
            maxCapacity:calcCap,
            rows: rows,
            slotsPerRow: slotsPerRow
          });
          added++;
        }
      }
    }
    WMS.showToast('Generadas ' + added + ' ubicaciones. Total de huecos: ' + totalSlots, 'success');
    WMS.closeModal('genModal');
    WMS.renderLocations(container);
  }

  function delLoc(id, container) {
    var l = WMS.Locations.getById(id);
    if (!l || !confirm('¿Eliminar "' + l.code + '"?')) return;
    var r = WMS.Locations.delete(id);
    if (r && r.error) { WMS.showToast(r.error, 'error'); return; }
    WMS.showToast('Ubicación eliminada.', 'success'); WMS.renderLocations(container);
  }
})();
