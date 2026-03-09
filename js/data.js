// ============================================
// WMS - Data Access Layer (global namespace)
// ============================================
(function() {
  var KEYS = {
    users: 'wms_users', products: 'wms_products', locations: 'wms_locations',
    inventory: 'wms_inventory', movements: 'wms_movements', seeded: 'wms_seeded'
  };

  function getAll(k) { try { return JSON.parse(localStorage.getItem(k)) || []; } catch(e) { return []; } }
  function setAll(k, d) { localStorage.setItem(k, JSON.stringify(d)); }
  function getById(k, id) { return getAll(k).find(function(i) { return i.id === id; }) || null; }
  function create(k, item) {
    var items = getAll(k);
    var n = Object.assign({}, item, { id: WMS.generateId(), createdAt: new Date().toISOString() });
    items.push(n); setAll(k, items); return n;
  }
  function update(k, id, upd) {
    var items = getAll(k), idx = items.findIndex(function(i) { return i.id === id; });
    if (idx === -1) return null;
    items[idx] = Object.assign({}, items[idx], upd, { updatedAt: new Date().toISOString() });
    setAll(k, items); return items[idx];
  }
  function remove(k, id) {
    var items = getAll(k), f = items.filter(function(i) { return i.id !== id; });
    setAll(k, f); return f.length < items.length;
  }

  WMS.Products = {
    getAll: function() { return getAll(KEYS.products); },
    getById: function(id) { return getById(KEYS.products, id); },
    create: function(p) { return create(KEYS.products, p); },
    update: function(id, p) { return update(KEYS.products, id, p); },
    delete: function(id) {
      var inv = getAll(KEYS.inventory).filter(function(i) { return i.productId === id && i.quantity > 0; });
      if (inv.length > 0) return { error: 'No se puede eliminar: producto con stock en almacén.' };
      return remove(KEYS.products, id);
    },
    search: function(q) {
      q = q.toLowerCase();
      return getAll(KEYS.products).filter(function(p) {
        return (p.sku||'').toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q);
      });
    }
  };

  WMS.Locations = {
    getAll: function() { return getAll(KEYS.locations); },
    getById: function(id) { return getById(KEYS.locations, id); },
    create: function(l) { return create(KEYS.locations, l); },
    update: function(id, l) { return update(KEYS.locations, id, l); },
    delete: function(id) {
      var inv = getAll(KEYS.inventory).filter(function(i) { return i.locationId === id && i.quantity > 0; });
      if (inv.length > 0) return { error: 'No se puede eliminar: ubicación con mercancía.' };
      return remove(KEYS.locations, id);
    },
    getByCode: function(c) { return getAll(KEYS.locations).find(function(l) { return l.code === c; }) || null; },
    getRoots: function() { return getAll(KEYS.locations).filter(function(l) { return !l.parentId; }); }
  };

  WMS.Inventory = {
    getAll: function() { return getAll(KEYS.inventory); },
    addStock: function(productId, locationId, quantity, lot, entryDate, col, row, pos) {
      var items = getAll(KEYS.inventory);
      var ex = items.find(function(i) { return i.productId === productId && i.locationId === locationId && (i.lot||'') === (lot||'') && (i.col||'') === (col||'') && (i.row||'') === (row||'') && (i.pos||'') === (pos||''); });
      if (ex) {
        ex.quantity = (ex.quantity||0) + quantity;
        ex.updatedAt = new Date().toISOString();
        setAll(KEYS.inventory, items); return ex;
      }
      return create(KEYS.inventory, { productId: productId, locationId: locationId, quantity: quantity, lot: lot||'', entryDate: entryDate || new Date().toISOString(), col: col||'', row: row||'', pos: pos||'' });
    },
    removeStock: function(productId, locationId, quantity, lot, col, row, pos) {
      var items = getAll(KEYS.inventory);
      var e = items.find(function(i) { return i.productId === productId && i.locationId === locationId && (i.lot||'') === (lot||'') && (i.col||'') === (col||'') && (i.row||'') === (row||'') && (i.pos||'') === (pos||''); });
      if (!e) return { error: 'No hay stock en esta ubicación.' };
      if (e.quantity < quantity) return { error: 'Stock insuficiente. Disponible: ' + e.quantity };
      e.quantity -= quantity; e.updatedAt = new Date().toISOString();
      setAll(KEYS.inventory, items); return e;
    },
    getTotalStock: function(pid) {
      return getAll(KEYS.inventory).filter(function(i) { return i.productId === pid; })
        .reduce(function(s, i) { return s + (i.quantity||0); }, 0);
    },
    getStockSummary: function() {
      var inv = getAll(KEYS.inventory), prods = getAll(KEYS.products), map = {};
      inv.forEach(function(i) {
        if (!map[i.productId]) map[i.productId] = { totalQty: 0, locations: 0 };
        map[i.productId].totalQty += (i.quantity||0);
        if (i.quantity > 0) map[i.productId].locations++;
      });
      return prods.map(function(p) {
        return Object.assign({}, p, { totalStock: (map[p.id]||{}).totalQty||0, locationCount: (map[p.id]||{}).locations||0 });
      });
    }
  };

  WMS.Movements = {
    getAll: function() { return getAll(KEYS.movements).sort(function(a,b) { return new Date(b.timestamp) - new Date(a.timestamp); }); },
    create: function(m) { return create(KEYS.movements, Object.assign({}, m, { timestamp: new Date().toISOString() })); },
    getByProduct: function(pid) { return getAll(KEYS.movements).filter(function(m) { return m.productId === pid; }); },
    getRecent: function(n) { return WMS.Movements.getAll().slice(0, n||10); }
  };

  WMS.Users = {
    getAll: function() { return getAll(KEYS.users); },
    getById: function(id) { return getById(KEYS.users, id); },
    getByEmail: function(email) { return getAll(KEYS.users).find(function(u) { return u.email === email; }) || null; },
    create: function(u) { return create(KEYS.users, u); },
    update: function(id, u) { return update(KEYS.users, id, u); },
    delete: function(id) {
      var mvs = getAll(KEYS.movements).filter(function(m) { return m.userId === id; });
      if (mvs.length > 0) return { error: 'Usuario con operaciones registradas. Solo se puede inactivar.' };
      return remove(KEYS.users, id);
    }
  };

  WMS.Stats = {
    getTotalProducts: function() { return getAll(KEYS.products).length; },
    getTotalStock: function() { return getAll(KEYS.inventory).reduce(function(s,i) { return s+(i.quantity||0); }, 0); },
    getTotalLocations: function() { return getAll(KEYS.locations).length; },
    getTotalShelves: function() {
      var locs = getAll(KEYS.locations);
      var s = new Set();
      locs.forEach(function(l) {
        var m = (l.code||'').match(/^([A-Z])-/);
        if (m) s.add(m[1]);
      });
      return s.size;
    },
    getTotalSlots: function() {
      return getAll(KEYS.locations).reduce(function(sum, l) {
        if (l.maxCapacity) return sum + l.maxCapacity;
        return sum + ((l.rows||1) * (l.slotsPerRow||3));
      }, 0);
    },
    getOccupiedLocations: function() {
      var s = new Set(); getAll(KEYS.inventory).filter(function(i){ return i.quantity>0; }).forEach(function(i){ s.add(i.locationId); }); return s.size;
    },
    getOccupancyPercent: function() {
      var t = WMS.Stats.getTotalLocations(); if(t===0) return 0;
      return Math.round((WMS.Stats.getOccupiedLocations()/t)*100);
    },
    getLowStockProducts: function() {
      var prods = getAll(KEYS.products), inv = getAll(KEYS.inventory), sm = {};
      inv.forEach(function(i) { sm[i.productId] = (sm[i.productId]||0) + (i.quantity||0); });
      return prods.filter(function(p) { return p.minStock > 0 && (sm[p.id]||0) <= p.minStock; });
    },
    getMovementsToday: function() {
      var t = new Date().toISOString().slice(0,10);
      return getAll(KEYS.movements).filter(function(m) { return (m.timestamp||'').startsWith(t); }).length;
    },
    getMovementsThisMonth: function() {
      var mon = new Date().toISOString().slice(0,7);
      return getAll(KEYS.movements).filter(function(m) { return (m.timestamp||'').startsWith(mon); }).length;
    }
  };

  // Seed Data (Minimal for new setup)
  WMS.seedData = function() {
    if (localStorage.getItem(KEYS.seeded)) return;
    
    // Solo creamos el administrador por defecto al empezar
    setAll(KEYS.users, [
      { id:'admin001', email:'admin@wms.com', password:'Admin123!', name:'Administrador', role:'admin', status:'active', createdAt:new Date().toISOString() }
    ]);
    
    // Inicializamos las tablas vacías
    setAll(KEYS.products, []);
    setAll(KEYS.locations, []);
    setAll(KEYS.inventory, []);
    setAll(KEYS.movements, []);
    
    localStorage.setItem(KEYS.seeded, 'true');
  };
})();
