// ============================================
// WMS - Users Page (global namespace)
// ============================================
(function() {
  WMS.renderUsers = async function(container) {
    var [users, cur, canWrite] = await Promise.all([
        WMS.Users.getAll(),
        WMS.getCurrentUser(),
        WMS.hasPermission('users', 'write')
    ]);

    var rows = ''; users.forEach(function(u) {
      rows += '<tr><td><div class="user-avatar-lg">' + WMS.getUserInitials(u.name) + '</div></td>'
        + '<td><strong>' + u.name + '</strong>' + (u.id===cur.id?' <span class="badge badge-primary">Tú</span>':'') + '</td>'
        + '<td>' + u.email + '</td><td><span class="role-badge ' + u.role + '">' + WMS.getRoleLabel(u.role) + '</span></td>'
        + '<td><span class="status-dot ' + (u.status==='active'?'active':'inactive') + '"></span> ' + (u.status==='active'?'Activo':'Inactivo') + '</td>'
        + '<td>' + WMS.formatDate(u.createdAt) + '</td>'
        + (canWrite ? '<td><div class="flex gap-1"><button class="btn btn-ghost btn-icon btn-sm edit-user-btn" data-id="' + u.id + '">✏️</button>' + (u.id!==cur.id?'<button class="btn btn-ghost btn-icon btn-sm delete-user-btn" data-id="' + u.id + '">🗑️</button>':'') + '</div></td>':'')
        + '</tr>';
    });

    container.innerHTML = '<div class="page-header"><div><h1 class="page-title">Usuarios</h1><p class="page-subtitle">Gestión de usuarios y roles</p></div>' + (canWrite?'<button class="btn btn-primary" id="addUserBtn">+ Nuevo Usuario</button>':'') + '</div>'
      + '<div class="card"><div class="table-wrapper"><table class="table"><thead><tr><th></th><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Creado</th>' + (canWrite?'<th>Acciones</th>':'') + '</tr></thead><tbody>' + rows + '</tbody></table></div></div>'
      + '<div class="modal-overlay" id="userModal"><div class="modal"><div class="modal-header"><h3 class="modal-title" id="userModalTitle">Nuevo Usuario</h3><button class="modal-close" onclick="WMS.closeModal(\'userModal\')">✕</button></div><div class="modal-body"><form id="userForm"><div class="form-group"><label class="form-label form-required">Nombre</label><input type="text" class="form-input" id="userName" required></div><div class="form-group"><label class="form-label form-required">Email</label><input type="email" class="form-input" id="userEmail" required></div><div class="form-group"><label class="form-label" id="pwLabel">Contraseña</label><input type="password" class="form-input" id="userPassword" minlength="8"></div><div class="form-row"><div class="form-group"><label class="form-label">Rol</label><select class="form-select" id="userRole"><option value="operador">Operador</option><option value="supervisor">Supervisor</option><option value="inventarista">Inventarista</option><option value="consultor">Consultor</option><option value="admin">Administrador</option></select></div><div class="form-group"><label class="form-label">Estado</label><select class="form-select" id="userStatus"><option value="active">Activo</option><option value="inactive">Inactivo</option></select></div></div><input type="hidden" id="userEditId"></form></div><div class="modal-footer"><button class="btn btn-secondary" onclick="WMS.closeModal(\'userModal\')">Cancelar</button><button class="btn btn-primary" id="saveUserBtn">Guardar</button></div></div></div>';

    var ab = document.getElementById('addUserBtn');
    if (ab) ab.addEventListener('click', async function() { await openUModal(); });
    document.getElementById('saveUserBtn').addEventListener('click', async function() { await saveU(container); });
    container.querySelectorAll('.edit-user-btn').forEach(function(b) { b.addEventListener('click', async function() { await openUModal(b.dataset.id); }); });
    container.querySelectorAll('.delete-user-btn').forEach(function(b) { b.addEventListener('click', async function() { await delU(b.dataset.id, container); }); });
  };

  async function openUModal(editId) {
    document.getElementById('userForm').reset(); document.getElementById('userEditId').value = '';
    if (editId) {
      var u = await WMS.Users.getById(editId); if(!u) return;
      document.getElementById('userModalTitle').textContent = 'Editar Usuario';
      document.getElementById('userName').value = u.name||'';
      document.getElementById('userEmail').value = u.email||'';
      document.getElementById('userRole').value = u.role||'operador';
      document.getElementById('userStatus').value = u.status||'active';
      document.getElementById('userEditId').value = editId;
    } else { document.getElementById('userModalTitle').textContent = 'Nuevo Usuario'; }
    WMS.openModal('userModal');
  }

  async function saveU(container) {
    var name = document.getElementById('userName').value.trim(), email = document.getElementById('userEmail').value.trim();
    var pw = document.getElementById('userPassword').value, editId = document.getElementById('userEditId').value;
    if (!name || !email) { WMS.showToast('Nombre y email son obligatorios.', 'warning'); return; }
    if (editId) {
      var upd = { name:name, email:email, role:document.getElementById('userRole').value, status:document.getElementById('userStatus').value };
      if (pw) upd.password = pw;
      await WMS.Users.update(editId, upd); WMS.showToast('Usuario actualizado.', 'success');
    } else {
      if (!pw || pw.length < 8) { WMS.showToast('Contraseña mínimo 8 caracteres.', 'warning'); return; }
      var ex = await WMS.Users.getByEmail(email);
      if (ex) { WMS.showToast('Email ya registrado.', 'error'); return; }
      await WMS.Users.create({ name:name, email:email, password:pw, role:document.getElementById('userRole').value, status:document.getElementById('userStatus').value });
      WMS.showToast('Usuario creado.', 'success');
    }
    WMS.closeModal('userModal'); await WMS.renderUsers(container);
  }

  async function delU(id, container) {
    var u = await WMS.Users.getById(id);
    if (!u || !confirm('¿Eliminar "' + u.name + '"?')) return;
    var r = await WMS.Users.delete(id);
    if (r && r.error) { WMS.showToast(r.error, 'error'); return; }
    WMS.showToast('Usuario eliminado.', 'success'); await WMS.renderUsers(container);
  }
})();
