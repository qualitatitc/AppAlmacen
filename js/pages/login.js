// ============================================
// WMS - Login Page (global namespace)
// ============================================
(function() {
  var isRegisterMode = false;

  WMS.renderLogin = function() {
    isRegisterMode = false;
    document.getElementById('app').innerHTML = '\
      <div class="login-page">\
        <div class="login-card">\
          <div class="login-logo">\
            <div class="login-logo-icon">📦</div>\
            <span class="login-logo-text">ITC Warehouse</span>\
          </div>\
          <h1 class="login-title" id="login-heading">Iniciar Sesión</h1>\
          <p class="login-subtitle" id="login-sub">Accede al Sistema de Gestión de Almacén</p>\
          <form class="login-form" id="loginForm">\
            <div class="form-group hidden" id="nameGroup">\
              <label class="form-label">Nombre completo</label>\
              <input type="text" class="form-input" id="loginName" placeholder="Tu nombre" autocomplete="name">\
            </div>\
            <div class="form-group">\
              <label class="form-label">Email</label>\
              <input type="email" class="form-input" id="loginEmail" placeholder="tu@email.com" autocomplete="email" required>\
            </div>\
            <div class="form-group">\
              <label class="form-label">Contraseña</label>\
              <input type="password" class="form-input" id="loginPassword" placeholder="••••••••" autocomplete="current-password" required>\
            </div>\
            <button type="submit" class="btn btn-primary login-btn" id="loginBtn">Iniciar Sesión</button>\
          </form>\
          <p class="login-footer" id="loginFooter">\
            ¿No tienes cuenta? <a href="#" id="toggleAuth">Registrarse</a>\
          </p>\
          <div style="margin-top:var(--space-4);padding:var(--space-3);background:var(--bg-card-alt);border-radius:var(--radius-md);font-size:var(--font-xs);color:var(--text-muted);">\
            <strong style="color:var(--text-secondary)">Demo:</strong> admin@wms.com / Admin123!\
          </div>\
        </div>\
      </div>';
    document.getElementById('loginForm').addEventListener('submit', handleSubmit);
    document.getElementById('toggleAuth').addEventListener('click', toggleMode);
  };

  function toggleMode(e) {
    e.preventDefault();
    isRegisterMode = !isRegisterMode;
    var h = document.getElementById('login-heading');
    var s = document.getElementById('login-sub');
    var ng = document.getElementById('nameGroup');
    var btn = document.getElementById('loginBtn');
    var ft = document.getElementById('loginFooter');
    if (isRegisterMode) {
      h.textContent = 'Crear Cuenta'; s.textContent = 'Regístrate para acceder al sistema';
      ng.classList.remove('hidden'); btn.textContent = 'Registrarse';
      ft.innerHTML = '¿Ya tienes cuenta? <a href="#" id="toggleAuth">Iniciar Sesión</a>';
    } else {
      h.textContent = 'Iniciar Sesión'; s.textContent = 'Accede al Sistema de Gestión de Almacén';
      ng.classList.add('hidden'); btn.textContent = 'Iniciar Sesión';
      ft.innerHTML = '¿No tienes cuenta? <a href="#" id="toggleAuth">Registrarse</a>';
    }
    document.getElementById('toggleAuth').addEventListener('click', toggleMode);
  }

  function handleSubmit(e) {
    e.preventDefault();
    var email = document.getElementById('loginEmail').value.trim();
    var password = document.getElementById('loginPassword').value;
    if (!email || !password) { WMS.showToast('Completa todos los campos.', 'warning'); return; }
    if (isRegisterMode) {
      var name = document.getElementById('loginName').value.trim();
      if (!name) { WMS.showToast('Ingresa tu nombre.', 'warning'); return; }
      var res = WMS.register(name, email, password);
      if (res.error) { WMS.showToast(res.error, 'error'); return; }
      WMS.showToast('¡Bienvenido, ' + res.user.name + '!', 'success');
    } else {
      var res = WMS.login(email, password);
      if (res.error) { WMS.showToast(res.error, 'error'); return; }
      WMS.showToast('¡Bienvenido, ' + res.user.name + '!', 'success');
    }
    window.location.hash = '#/dashboard';
  }
})();
