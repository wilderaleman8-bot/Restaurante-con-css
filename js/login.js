// Mostrar panel de usuario si está logueado
document.addEventListener('DOMContentLoaded', function() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (usuario) {
    // Usuario logueado - mostrar panel
    const userPanel = document.getElementById('user-panel');
    if (userPanel) {
      userPanel.innerHTML = `
        <div class="user-box">
          <img src="${usuario.imageUrl || '../imagenes/Logo.jpg'}" alt="Avatar" onerror="this.src='../imagenes/Logo.jpg'">
          <div class="user-labels">
            <span>${usuario.nombre}</span>
            <button id="logout-btn">Cerrar sesión</button>
          </div>
        </div>
      `;

      // Evento logout
      document.getElementById('logout-btn').addEventListener('click', function() {
        localStorage.removeItem('usuario');
        window.location.href = 'login.html';
      });
    }
  } else {
    // Usuario no logueado - mostrar enlace a login
    const userPanel = document.getElementById('user-panel');
    if (userPanel) {
      userPanel.innerHTML = '<a href="login.html">Iniciar sesión</a>';
    }
  }
});