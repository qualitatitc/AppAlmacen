// ============================================
// WMS - Auth Module (global namespace)
// ============================================
(function() {
  var SESSION_KEY = 'wms_session';

  WMS.seedData(); // Init seed data

  WMS.getCurrentUser = function() {
    try {
      var s = JSON.parse(localStorage.getItem(SESSION_KEY));
      if (!s) return null;
      return WMS.Users.getById(s.userId);
    } catch(e) { return null; }
  };

  WMS.isAuthenticated = function() { return WMS.getCurrentUser() !== null; };

  WMS.login = function(email, password) {
    var user = WMS.Users.getByEmail(email);
    if (!user) return { error: 'Usuario no encontrado.' };
    if (user.password !== password) return { error: 'Contraseña incorrecta.' };
    if (user.status === 'inactive') return { error: 'Cuenta inactiva. Contacte al administrador.' };
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, loginAt: new Date().toISOString() }));
    return { success: true, user: user };
  };

  WMS.register = function(name, email, password, role) {
    if (WMS.Users.getByEmail(email)) return { error: 'Este email ya está registrado.' };
    if (password.length < 8) return { error: 'La contraseña debe tener mínimo 8 caracteres.' };
    var user = WMS.Users.create({ email: email, password: password, name: name, role: role || 'operador', status: 'active' });
    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, loginAt: new Date().toISOString() }));
    return { success: true, user: user };
  };

  WMS.logout = function() {
    localStorage.removeItem(SESSION_KEY);
    window.location.hash = '#/login';
  };

  WMS.hasPermission = function(mod, action) {
    var user = WMS.getCurrentUser(); if (!user) return false;
    action = action || 'read';
    var perms = {
      admin: { all: 'rw' },
      supervisor: { users:'r', config:'r', products:'rw', locations:'rw', entries:'rw', exits:'rw', transfers:'rw', adjustments:'rw', orders:'rw', reports:'rw' },
      operador: { products:'r', locations:'r', entries:'rw', exits:'rw', transfers:'rw', adjustments:'r', orders:'rw', reports:'r' },
      inventarista: { products:'r', locations:'r', entries:'r', exits:'r', transfers:'r', adjustments:'rw', orders:'r', reports:'r' },
      consultor: { products:'r', locations:'r', entries:'r', exits:'r', orders:'r', reports:'r' }
    };
    var rp = perms[user.role]; if (!rp) return false;
    if (rp.all === 'rw') return true;
    var p = rp[mod]; if (!p) return false;
    if (action === 'read' || action === 'r') return p.includes('r');
    if (action === 'write' || action === 'w') return p.includes('w');
    return false;
  };

  WMS.getUserInitials = function(name) {
    if (!name) return '??';
    var parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  WMS.getRoleLabel = function(role) {
    var labels = { admin:'Administrador', supervisor:'Supervisor', operador:'Operador', inventarista:'Inventarista', consultor:'Consultor' };
    return labels[role] || role;
  };
})();
