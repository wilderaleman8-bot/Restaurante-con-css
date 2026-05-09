// ===============================
// CONFIGURACIÓN GLOBAL Y SESIÓN
// ===============================
function getUsuario() {
  const stored = localStorage.getItem('usuario') || localStorage.getItem('saboresUser');
  return stored ? JSON.parse(stored) : null;
}

function logout() {
  localStorage.removeItem('usuario');
  localStorage.removeItem('saboresUser');
  alert('Has cerrado sesión correctamente');
  window.location.href = './index.html';
}

// ===============================
// UI - PANEL DE USUARIO Y MENÚ MÓVIL
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  const backendUrl = window.location.protocol.startsWith('http')
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : 'http://127.0.0.1:3000';

  // 1. Renderizar Panel de Usuario
  const userPanel = document.getElementById('user-panel');
  if (userPanel) {
    const usuario = getUsuario();
    if (usuario) {
      // Determinar la URL de la imagen (priorizar imageUrl guardada o construirla)
      let imgPath = usuario.imageUrl || usuario.image_path;
      if (usuario.image_path && !usuario.image_path.startsWith('http')) {
        imgPath = `${backendUrl}/uploads/${usuario.image_path}`;
      }
      // Fallback final si no hay nada
      if (!imgPath) imgPath = './imagenes/Logo.jpg';

      userPanel.innerHTML = `
        <div class="user-box">
          <img src="${imgPath}" alt="Avatar" onerror="this.src='./imagenes/Logo.jpg'">
          <div class="user-labels">
            <span>${usuario.nombre}</span>
            <button id="logout-btn">Cerrar sesión</button>
          </div>
        </div>
      `;

      document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
    } else {
      userPanel.innerHTML = '<a href="login.html">Iniciar sesión</a>';
    }
  }

  // 2. Menú Móvil Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('active');
    });
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        navLinks.classList.remove('active');
      }
    });
  }
});

// ===============================
// AUTH - LOGIN Y REGISTRO
// ===============================
async function login(email, password) {
  const backendUrl = window.location.protocol.startsWith('http')
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : 'http://127.0.0.1:3000';

  try {
    const response = await fetch(`${backendUrl}/api/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || 'Correo o contraseña incorrectos');
      return null;
    }

    const usuario = result.usuario;
    const imageUrl = usuario.image_path
      ? `${backendUrl}/uploads/${usuario.image_path}`
      : './imagenes/Logo.jpg';
    
    const sessionUser = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      image_path: usuario.image_path || null,
      imageUrl: imageUrl
    };

    localStorage.setItem('usuario', JSON.stringify(sessionUser));
    localStorage.setItem('saboresUser', JSON.stringify(sessionUser));
    alert('Bienvenido ' + usuario.nombre);
    window.location.href = './menu.html';
    return sessionUser;
  } catch (error) {
    console.error('Error login:', error);
    alert('Error al conectar con el servidor');
    return null;
  }
}

async function registrar(formData) {
  const backendUrl = window.location.protocol.startsWith('http')
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : 'http://127.0.0.1:3000';

  try {
    const response = await fetch(`${backendUrl}/api/usuarios/registro`, {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || 'Error al registrar');
      return null;
    }

    return result.usuario;
  } catch (error) {
    console.error('Error registro:', error);
    alert('Error al conectar con el servidor');
    return null;
  }
}

// Eventos de formulario (si existen en la página)
document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.querySelector("#login-form");
  if (formLogin) {
    formLogin.addEventListener("submit", e => {
      e.preventDefault();
      const email = e.target.email.value;
      const password = e.target.password.value;
      login(email, password);
    });
  }

  const formRegistro = document.querySelector("#register-form");
  if (formRegistro) {
    formRegistro.addEventListener("submit", async e => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const usuario = await registrar(formData);

      if (usuario) {
        const backendUrl = window.location.protocol.startsWith('http')
          ? `${window.location.protocol}//${window.location.hostname}:3000`
          : 'http://127.0.0.1:3000';
        
        const imageUrl = usuario.image_path
          ? `${backendUrl}/uploads/${usuario.image_path}`
          : './imagenes/Logo.jpg';

        const sessionUser = {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          image_path: usuario.image_path || null,
          imageUrl: imageUrl
        };
        localStorage.setItem('usuario', JSON.stringify(sessionUser));
        localStorage.setItem('saboresUser', JSON.stringify(sessionUser));
        alert('Usuario creado con éxito');
        window.location.href = './menu.html';
      }
    });
  }

  // Preview de imagen de registro
  const registerImageInput = document.getElementById('register-image');
  const registerImagePreview = document.getElementById('register-image-preview');
  if (registerImageInput && registerImagePreview) {
    registerImageInput.addEventListener('change', function() {
      const file = this.files[0];
      if (!file) {
        registerImagePreview.textContent = 'Tu foto aparecerá aquí';
        registerImagePreview.style.backgroundImage = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        registerImagePreview.style.backgroundImage = `url('${reader.result}')`;
        registerImagePreview.style.backgroundSize = 'cover';
        registerImagePreview.style.backgroundPosition = 'center';
        registerImagePreview.textContent = '';
      };
      reader.readAsDataURL(file);
    });
  }
});

// ===============================
// OTROS (Reservas, Opiniones, etc.)
// ===============================
async function guardarReserva(nombre, apellido, personas, fecha, mensaje) {
  const backendUrl = window.location.protocol.startsWith('http')
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : 'http://127.0.0.1:3000';

  const usuario = getUsuario();
  const bodyData = { nombre, apellido, personas, fecha, mensaje };
  if (usuario && usuario.id) {
    bodyData.usuario_id = usuario.id;
  }

  try {
    const response = await fetch(`${backendUrl}/api/reservas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Error en reserva');
    alert("Reserva realizada con éxito");
    return body;
  } catch (err) {
    console.error(err);
    alert("Error al guardar reserva");
    return null;
  }
}

async function guardarPedido(pedidoData) {
  const backendUrl = window.location.protocol.startsWith('http')
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : 'http://127.0.0.1:3000';

  const usuario = getUsuario();
  if (usuario && usuario.id) {
    pedidoData.usuario_id = usuario.id;
  }

  try {
    const response = await fetch(`${backendUrl}/api/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedidoData)
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Error en pedido');
    return body;
  } catch (err) {
    console.error(err);
    alert("Error al guardar el pedido en el servidor");
    return null;
  }
}

async function guardarOpinion(nombre, apellido, comentario) {
  const backendUrl = window.location.protocol.startsWith('http')
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : 'http://127.0.0.1:3000';

  const usuario = getUsuario();
  const bodyData = { nombre, apellido, comentario };
  if (usuario && usuario.id) {
    bodyData.usuario_id = usuario.id;
  }

  try {
    const response = await fetch(`${backendUrl}/api/opiniones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Error en opinión');
    alert("Opinión enviada con éxito");
    return body;
  } catch (err) {
    console.error(err);
    alert("Error al enviar la opinión");
    return null;
  }
}

async function guardarValoracion(nombre, apellido, calificacion, comentario) {
  const backendUrl = window.location.protocol.startsWith('http')
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : 'http://127.0.0.1:3000';

  const usuario = getUsuario();
  const bodyData = { nombre, apellido, calificacion: parseInt(calificacion), comentario };
  if (usuario && usuario.id) {
    bodyData.usuario_id = usuario.id;
  }

  try {
    const response = await fetch(`${backendUrl}/api/valoraciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Error en valoración');
    alert("Valoración enviada con éxito");
    return body;
  } catch (err) {
    console.error(err);
    alert("Error al enviar la valoración");
    return null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const formReserva = document.querySelector("#reserva-form");
  if (formReserva) {
    formReserva.addEventListener("submit", e => {
      e.preventDefault();
      guardarReserva(
        e.target.nombre.value,
        e.target.apellido.value,
        e.target.personas.value,
        e.target.fecha.value,
        e.target.mensaje.value
      );
    });
  }

  const formOpinion = document.querySelector("#opinion-form");
  if (formOpinion) {
    formOpinion.addEventListener("submit", e => {
      e.preventDefault();
      guardarOpinion(
        e.target.nombre.value,
        e.target.apellido.value,
        e.target.comentario.value
      );
      e.target.reset();
    });
  }

  const formValoracion = document.querySelector("#valoracion-form");
  if (formValoracion) {
    formValoracion.addEventListener("submit", e => {
      e.preventDefault();
      guardarValoracion(
        e.target.nombre.value,
        e.target.apellido.value,
        e.target.estrellas.value,
        e.target.comentario.value
      );
      e.target.reset();
    });
  }
});
