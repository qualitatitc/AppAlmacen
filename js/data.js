// ============================================
// WMS - Data Access Layer (global namespace)
// ============================================
(function() {
  var SUPABASE_URL = 'https://jjumuwwalquiimfvzwgs.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqdW11d3dhbHF1aWltZnZ6d2dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNzQ4NDYsImV4cCI6MjA4ODc1MDg0Nn0.1-QncUnJV_OocW4t2bE3NNYiIQl0IhZaxRyW99FCMl8';
  
  var sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  WMS.supabase = sb;

  var KEYS = {
    users: 'users', products: 'products', locations: 'locations',
    inventory: 'inventory', movements: 'movements', material_requests: 'solicitudes_material'
  };

  // Helper to convert LocalStorage keys to Supabase table names
  async function getAll(table) {
    const { data, error } = await sb.from(table).select('*');
    if (error) { console.error('Error fetching ' + table, error); return []; }
    return data || [];
}

  async function getById(table, id) {
    const { data, error } = await sb.from(table).select('*').eq('id', id).single();
    if (error) { console.error('Error fetching record', error); return null; }
    return data;
}

  async function create(table, item) {
    var n = Object.assign({}, item, { id: WMS.generateId(), createdAt: new Date().toISOString() });
    const { data, error } = await sb.from(table).insert([n]).select().single();
    if (error) { console.error('Error creating record', error); throw error; }
    return data;
}

  async function update(table, id, upd) {
    var itm = Object.assign({}, upd, { updatedAt: new Date().toISOString() });
    const { data, error } = await sb.from(table).update(itm).eq('id', id).select().single();
    if (error) { console.error('Error updating record', error); throw error; }
    return data;
}

  async function remove(table, id) {
    const { error } = await sb.from(table).delete().eq('id', id);
    if (error) { console.error('Error deleting record', error); throw error; }
    return true;
}

  WMS.Products = {
    getAll: async function() { return await getAll(KEYS.products); },
    getById: async function(id) { return await getById(KEYS.products, id); },
    create: async function(p) { return await create(KEYS.products, p); },
    update: async function(id, p) { return await update(KEYS.products, id, p); },
    delete: async function(id) {
      const inv = (await getAll(KEYS.inventory)).filter(function(i) { return i.productId === id && (i.quantity||0) > 0; });
      if (inv.length > 0) return { error: 'No se puede eliminar: producto con stock en almacén.' };
      return await remove(KEYS.products, id);
    },
    search: async function(q) {
      q = q.toLowerCase();
      const all = await getAll(KEYS.products);
      return all.filter(function(p) {
        return (p.sku||'').toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q);
      });
    }
  };

  WMS.Locations = {
    getAll: async function() { return await getAll(KEYS.locations); },
    getById: async function(id) { return await getById(KEYS.locations, id); },
    create: async function(l) { return await create(KEYS.locations, l); },
    update: async function(id, l) { return await update(KEYS.locations, id, l); },
    delete: async function(id) {
      const inv = (await getAll(KEYS.inventory)).filter(function(i) { return i.locationId === id && (i.quantity||0) > 0; });
      if (inv.length > 0) return { error: 'No se puede eliminar: ubicación con mercancía.' };
      return await remove(KEYS.locations, id);
    },
    getByCode: async function(c) {
      const all = await getAll(KEYS.locations);
      return all.find(function(l) { return l.code === c; }) || null;
    },
    getRoots: async function() {
      const all = await getAll(KEYS.locations);
      return all.filter(function(l) { return !l.parentId; });
    }
  };

  WMS.Inventory = {
    getAll: async function() { return await getAll(KEYS.inventory); },
    addStock: async function(productId, locationId, quantity, lot, entryDate, col, row, pos) {
      const items = await getAll(KEYS.inventory);
      const ex = items.find(function(i) { return i.productId === productId && i.locationId === locationId && (i.lot||'') === (lot||'') && (i.col||'') === (col||'') && (i.row||'') === (row||'') && (i.pos||'') === (pos||''); });
      if (ex) {
        return await update(KEYS.inventory, ex.id, { quantity: (ex.quantity||0) + quantity });
      }
      return await create(KEYS.inventory, { productId: productId, locationId: locationId, quantity: quantity, lot: lot||'', entryDate: entryDate || new Date().toISOString(), col: col||'', row: row||'', pos: pos||'' });
    },
    removeStock: async function(productId, locationId, quantity, lot, col, row, pos) {
      const items = await getAll(KEYS.inventory);
      const e = items.find(function(i) { return i.productId === productId && i.locationId === locationId && (i.lot||'') === (lot||'') && (i.col||'') === (col||'') && (i.row||'') === (row||'') && (i.pos||'') === (pos||''); });
      if (!e) return { error: 'No hay stock en esta ubicación.' };
      if (e.quantity < quantity) return { error: 'Stock insuficiente. Disponible: ' + e.quantity };
      return await update(KEYS.inventory, e.id, { quantity: e.quantity - quantity });
    },
    getTotalStock: async function(pid) {
      const inv = await getAll(KEYS.inventory);
      return inv.filter(function(i) { return i.productId === pid; })
        .reduce(function(s, i) { return s + (i.quantity||0); }, 0);
    },
    getStockSummary: async function() {
      const [inv, prods] = await Promise.all([getAll(KEYS.inventory), getAll(KEYS.products)]);
      const map = {};
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
    getAll: async function() {
      const all = await getAll(KEYS.movements);
      return all.sort(function(a,b) { return new Date(b.timestamp) - new Date(a.timestamp); });
    },
    create: async function(m) { return await create(KEYS.movements, Object.assign({}, m, { timestamp: new Date().toISOString() })); },
    getByProduct: async function(pid) {
      const all = await getAll(KEYS.movements);
      return all.filter(function(m) { return m.productId === pid; });
    },
    getRecent: async function(n) { return (await WMS.Movements.getAll()).slice(0, n||10); }
  };

  WMS.Users = {
    getAll: async function() { return await getAll(KEYS.users); },
    getById: async function(id) { return await getById(KEYS.users, id); },
    getByEmail: async function(email) {
      const all = await getAll(KEYS.users);
      return all.find(function(u) { return u.email === email; }) || null;
    },
    create: async function(u) { return await create(KEYS.users, u); },
    update: async function(id, u) { return await update(KEYS.users, id, u); },
    delete: async function(id) {
      const mvs = (await getAll(KEYS.movements)).filter(function(m) { return m.userId === id; });
      if (mvs.length > 0) return { error: 'Usuario con operaciones registradas. Solo se puede inactivar.' };
      return await remove(KEYS.users, id);
    }
  };

  WMS.MaterialRequests = {
    getAll: async function() {
      try {
        const all = await getAll(KEYS.material_requests);
        return all.sort(function(a,b) { return new Date(b.creado_en) - new Date(a.creado_en); });
      } catch (e) {
        console.warn('Table material_requests might not exist yet', e);
        return [];
      }
    },
    getById: async function(id) { return await getById(KEYS.material_requests, id); },
    create: async function(r) { 
      if (!r.estado) r.estado = 'pendiente';
      var n = Object.assign({}, r, { id: WMS.generateId(), creado_en: new Date().toISOString() });
      const { data, error } = await sb.from(KEYS.material_requests).insert([n]).select().single();
      if (error) throw error;
      return data;
    },
    update: async function(id, r) { 
      const { data, error } = await sb.from(KEYS.material_requests).update(r).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    delete: async function(id) { return await remove(KEYS.material_requests, id); }
  };

  WMS.Stats = {
    getTotalProductsInWarehouse: async function() {
      const inv = await getAll(KEYS.inventory);
      var s = new Set(); inv.filter(function(i){ return (i.quantity||0)>0; }).forEach(function(i){ s.add(i.productId); }); return s.size;
    },
    getTotalStock: async function() {
      return (await getAll(KEYS.inventory)).reduce(function(s,i) { return s+(i.quantity||0); }, 0);
    },
    getTotalLocations: async function() { return (await getAll(KEYS.locations)).length; },
    getTotalShelves: async function() {
      var locs = await getAll(KEYS.locations);
      var s = new Set();
      locs.forEach(function(l) {
        var m = (l.code||'').match(/^([A-Z])-/);
        if (m) s.add(m[1]);
      });
      return s.size;
    },
    getTotalSlots: async function() {
      const locs = await getAll(KEYS.locations);
      return locs.reduce(function(sum, l) {
        if (l.maxCapacity) return sum + l.maxCapacity;
        return sum + ((l.rows||1) * (l.slotsPerRow||3));
      }, 0);
    },
    getOccupiedSlots: async function() {
      const inv = await getAll(KEYS.inventory);
      var s = new Set(); 
      inv.filter(function(i){ return (i.quantity||0) > 0; }).forEach(function(i){ 
        // Unique key for a slot: locationId + row + position
        s.add(i.locationId + '-' + i.row + '-' + i.pos); 
      }); 
      return s.size;
    },
    getOccupancyPercent: async function() {
      var [occ, tot] = await Promise.all([WMS.Stats.getOccupiedSlots(), WMS.Stats.getTotalSlots()]);
      if(tot===0) return 0;
      return Math.round((occ/tot)*100);
    },
    getLowStockProducts: async function() {
      const [prods, inv] = await Promise.all([getAll(KEYS.products), getAll(KEYS.inventory)]);
      const sm = {};
      inv.forEach(function(i) { sm[i.productId] = (sm[i.productId]||0) + (i.quantity||0); });
      return prods.filter(function(p) { return p.minStock > 0 && (sm[p.id]||0) <= p.minStock; });
    },
    getMovementsToday: async function() {
      var t = new Date().toISOString().slice(0,10);
      const all = await getAll(KEYS.movements);
      return all.filter(function(m) { return (m.timestamp||'').startsWith(t); }).length;
    },
    getMovementsThisMonth: async function() {
      var mon = new Date().toISOString().slice(0,7);
      const all = await getAll(KEYS.movements);
      return all.filter(function(m) { return (m.timestamp||'').startsWith(mon); }).length;
    }
  };
})();
