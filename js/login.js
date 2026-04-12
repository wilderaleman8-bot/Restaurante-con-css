(function() {
  const userKey = 'saboresUser';

  function getStoredUser() {
    const data = localStorage.getItem(userKey);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  function saveUser(user) {
    localStorage.setItem(userKey, JSON.stringify(user));
  }

  function clearUser() {
    localStorage.removeItem(userKey);
  }

  function renderUserPanel() {
    const panel = document.getElementById('user-panel');
    if (!panel) return;

    let user = getStoredUser();
    if (!user) {
      panel.innerHTML = '<a href="login.html" class="login-link">Iniciar sesión</a>';
      return;
    }

    saveUser(user);

    panel.innerHTML = `
      <div class="user-box">
        <img src="${user.imageUrl || 'imagenes/Logo.jpg'}" alt="Avatar de ${user.name}">
        <div>
          <span>${user.name}</span>
        </div>
      </div>
      <button id="logout-btn" type="button">Cerrar sesión</button>
    `;

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        clearUser();
        location.reload();
      });
    }
  }

  function showMessage(container, message, success = true) {
    if (!container) return;
    container.textContent = message;
    container.style.color = success ? '#1c7c24' : '#a22a2a';
    container.style.marginTop = '10px';
  }

  function attachForms() {
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');
    if (loginForm) {
      loginForm.addEventListener('submit', async event => {
        event.preventDefault();
        const email = loginForm.email.value.trim();
        const password = loginForm.password.value.trim();
        if (!email || !password) {
          showMessage(loginMessage, 'Completa tu correo y contraseña.', false);
          return;
        }

        try {
          const data = new URLSearchParams();
          data.append('email', email);
          data.append('password', password);

          const response = await fetch('php/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: data.toString()
          });

          const result = await response.json();
          if (result.success) {
            saveUser({
              id: result.user.id,
              name: result.user.name,
              email: result.user.email,
              imageUrl: result.user.imageUrl || 'imagenes/Logo.jpg'
            });
            showMessage(loginMessage, 'Bienvenido ' + result.user.name + '! Redirigiendo...', true);
            setTimeout(() => { window.location.href = 'index.html'; }, 900);
          } else {
            showMessage(loginMessage, result.message || 'No se pudo iniciar sesión.', false);
          }
        } catch (err) {
          showMessage(loginMessage, 'Error de conexión. Intenta de nuevo.', false);
        }
      });
    }

    const registerForm = document.getElementById('register-form');
    const registerMessage = document.getElementById('register-message');
    const imageInput = document.getElementById('register-image');
    const imagePreview = document.getElementById('register-image-preview');

    if (imageInput && imagePreview) {
      imageInput.addEventListener('change', () => {
        const file = imageInput.files[0];
        if (!file) {
          imagePreview.textContent = 'Tu foto aparecerá aquí';
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          imagePreview.innerHTML = `<img src="${reader.result}" alt="Vista previa" style="width:100%;height:auto;border-radius:12px;">`;
        };
        reader.readAsDataURL(file);
      });
    }

    if (registerForm) {
      registerForm.addEventListener('submit', async event => {
        event.preventDefault();
        const nombre = registerForm.nombre.value.trim();
        const email = registerForm.email.value.trim();
        const password = registerForm.password.value;
        const confirmPassword = registerForm.confirm_password.value;

        if (!nombre || !email || !password || !confirmPassword) {
          showMessage(registerMessage, 'Completa todos los campos.', false);
          return;
        }

        if (password !== confirmPassword) {
          showMessage(registerMessage, 'Las contraseñas no coinciden.', false);
          return;
        }

        const formData = new FormData(registerForm);

        try {
          const response = await fetch('php/register.php', {
            method: 'POST',
            body: formData
          });
          const result = await response.json();
          if (result.success) {
            saveUser({
              id: result.user.id,
              name: result.user.name,
              email: result.user.email,
              imageUrl: result.user.imageUrl || 'imagenes/Logo.jpg'
            });
            showMessage(registerMessage, 'Cuenta creada. Redirigiendo...', true);
            setTimeout(() => { window.location.href = 'index.html'; }, 1000);
          } else {
            showMessage(registerMessage, result.message || 'Error al crear cuenta.', false);
          }
        } catch (err) {
          showMessage(registerMessage, 'Error de conexión. Intenta de nuevo.', false);
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderUserPanel();
    attachForms();
  });
})();
