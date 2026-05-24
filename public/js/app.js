
const BACKEND_URL = window.location.origin;

function getUsuario() {
  try {
    const stored = localStorage.getItem('usuario') || localStorage.getItem('saboresUser');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function getToken() {
  return localStorage.getItem('saboresToken');
}

function setToken(token) {
  if (token) localStorage.setItem('saboresToken', token);
  else localStorage.removeItem('saboresToken');
}

function logout() {
  fetch(`${BACKEND_URL}/api/usuarios/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
  localStorage.removeItem('usuario');
  localStorage.removeItem('saboresUser');
  localStorage.removeItem('saboresToken');
  localStorage.removeItem('saboresRole');
  window.location.href = './index.html';
}

// ===============================
// Notificaciones, loading states, etc.
// ===============================

function showToast(message, type) {
  const existing = document.getElementById('app-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'app-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
    background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#333'};
    color: white; padding: 14px 28px; border-radius: 10px;
    font-weight: 600; font-size: 0.95rem;
    box-shadow: 0 8px 30px rgba(0,0,0,0.25); z-index: 9999;
    opacity: 0; transition: opacity 0.3s ease;
    max-width: 90vw; text-align: center;
    pointer-events: none;
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => { toast.style.opacity = '1'; });

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function setLoading(button, loading) {
  if (!button) return;
  if (loading) {
    button._originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Cargando...';
    button.style.opacity = '0.7';
  } else {
    button.disabled = false;
    button.textContent = button._originalText || button.textContent;
    button.style.opacity = '1';
  }
}

// ===============================
// UI - panel de usuario, menú responsive, etc.
// ===============================

// ===============================
// Scroll Reveal (Intersection Observer)
// ===============================
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
    observer.observe(el);
  });
}

// ===============================
// Testimonios - Cargar últimas opiniones
// ===============================
async function cargarTestimonios() {
  const grid = document.getElementById('testimonials-grid');
  if (!grid) return;

  try {
    const response = await fetch(`${BACKEND_URL}/api/opiniones`);
    if (!response.ok) return;
    const opiniones = await response.json();
    const ultimas = (Array.isArray(opiniones) ? opiniones : []).slice(-4).reverse();

    if (ultimas.length === 0) {
      document.getElementById('testimonios-section')?.remove();
      return;
    }

    grid.innerHTML = ultimas.map(op => {
      const nombre = op.nombre || 'Cliente';
      const apellido = op.apellido || '';
      return `
        <div class="testimonial-card reveal reveal-delay-${Math.floor(Math.random() * 3) + 1}">
          <div class="stars">★★★★★</div>
          <p>${op.comentario || ''}</p>
          <div class="author">${nombre} ${apellido} <small>· Cliente</small></div>
        </div>
      `;
    }).join('');

    setTimeout(initScrollReveal, 50);
  } catch (e) {
    console.error('Error cargando testimonios:', e);
    document.getElementById('testimonios-section')?.remove();
  }
}

// ===============================
// Valoraciones - Cargar promedio y distribución
// ===============================
async function cargarValoraciones() {
  const container = document.getElementById('valoraciones-container');
  if (!container) return;

  try {
    const response = await fetch(`${BACKEND_URL}/api/valoraciones`);
    if (!response.ok) return;
    const valoraciones = await response.json();
    const ratings = Array.isArray(valoraciones) ? valoraciones : [];

    if (ratings.length === 0) {
      container.innerHTML = '<p class="lead">No hay valoraciones aún. Sé el primero en valorar.</p>';
      return;
    }

    const total = ratings.length;
    const sum = ratings.reduce((acc, v) => acc + (v.calificacion || 0), 0);
    const avg = (sum / total).toFixed(1);

    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach(v => {
      const c = v.calificacion || 0;
      if (dist[c] !== undefined) dist[c]++;
    });

    container.innerHTML = `
      <div class="valoraciones-summary">
        <div class="valoraciones-average">
          <div class="avg-stars">${'★'.repeat(Math.round(avg))}${'☆'.repeat(5 - Math.round(avg))}</div>
          <div class="avg-number">${avg}/5</div>
          <div class="avg-count">${total} valoración${total !== 1 ? 'es' : ''}</div>
        </div>
        <div class="valoraciones-distribution">
          ${[5,4,3,2,1].map(star => {
            const pct = total > 0 ? (dist[star] / total * 100) : 0;
            return `
              <div class="dist-row">
                <span class="dist-label">${star} ★</span>
                <div class="dist-bar-bg">
                  <div class="dist-bar-fill" style="width:${pct}%"></div>
                </div>
                <span class="dist-pct">${Math.round(pct)}%</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  } catch (e) {
    console.error('Error cargando valoraciones:', e);
  }
}

// ===============================
// Back to Top
// ===============================
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initBackToTop();
  cargarTestimonios();
  cargarValoraciones();

  const backendUrl = BACKEND_URL;

  const userPanel = document.getElementById('user-panel');
  if (userPanel) {
    const usuario = getUsuario();
    if (usuario) {
      let imgPath = usuario.imageUrl || usuario.image_path;
      if (usuario.image_path && !usuario.image_path.startsWith('http')) {
        imgPath = `${backendUrl}/uploads/${usuario.image_path}`;
      }
      if (!imgPath) imgPath = './imagenes/Logo.jpg';

      userPanel.innerHTML = `
        <div class="user-box">
          <img src="${imgPath}" alt="Avatar" onerror="this.src='./imagenes/Logo.jpg'">
          <div class="user-labels">
          <span>${usuario.nombre}${usuario.rol === 'admin' ? '<a href="./admin/index.html" class="admin-link"> ⚙ Admin</a>' : ''}</span>
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

  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        navLinks.classList.remove('active');
      }
    });
  }
});

// ===============================
// AUTH - LOGIN y REGISTRO.
// ===============================

async function login(email, password) {
  const backendUrl = BACKEND_URL;
  const btn = document.querySelector('#login-form button[type="submit"]');
  setLoading(btn, true);

  try {
    const response = await fetch(`${backendUrl}/api/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    const result = await response.json();

    if (!response.ok) {
      showToast(result.error || 'Correo o contraseña incorrectos', 'error');
      setLoading(btn, false);
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
          imageUrl: imageUrl,
          rol: usuario.rol
        };

    localStorage.setItem('usuario', JSON.stringify(sessionUser));
    localStorage.setItem('saboresUser', JSON.stringify(sessionUser));
    localStorage.setItem('saboresRole', usuario.rol);
    if (result.token) setToken(result.token);
    showToast('Bienvenido ' + usuario.nombre, 'success');
    const redirectUrl = usuario.rol === 'admin' ? './admin/index.html' : './menu.html';
    setTimeout(() => { window.location.href = redirectUrl; }, 500);
    return sessionUser;
  } catch (error) {
    console.error('Error login:', error);
    showToast('Error al conectar con el servidor', 'error');
    setLoading(btn, false);
    return null;
  }
}

async function registrar(formData) {
  const backendUrl = BACKEND_URL;
  const btn = document.querySelector('#register-form button[type="submit"]');
  setLoading(btn, true);

  const password = formData.get('password');
  const confirmPassword = formData.get('confirm_password');
  if (password !== confirmPassword) {
    showToast('Las contraseñas no coinciden', 'error');
    setLoading(btn, false);
    return null;
  }

  try {
    const response = await fetch(`${backendUrl}/api/usuarios/registro`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    const result = await response.json();

    if (!response.ok) {
      showToast(result.error || 'Error al registrar', 'error');
      setLoading(btn, false);
      return null;
    }

    return result.usuario;
  } catch (error) {
    console.error('Error registro:', error);
    showToast('Error al conectar con el servidor', 'error');
    setLoading(btn, false);
    return null;
  }
}

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
        const backendUrl = BACKEND_URL;

        const imageUrl = usuario.image_path
          ? `${backendUrl}/uploads/${usuario.image_path}`
          : './imagenes/Logo.jpg';

        const sessionUser = {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          image_path: usuario.image_path || null,
          imageUrl: imageUrl,
          rol: usuario.rol
        };
        localStorage.setItem('usuario', JSON.stringify(sessionUser));
        localStorage.setItem('saboresUser', JSON.stringify(sessionUser));
        localStorage.setItem('saboresRole', usuario.rol);
        showToast('Usuario creado con éxito', 'success');
        const redirectUrl = usuario.rol === 'admin' ? './admin/index.html' : './menu.html';
        setTimeout(() => { window.location.href = redirectUrl; }, 500);
      }
    });
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest('.pw-toggle');
    if (!btn) return;
    const input = document.getElementById(btn.dataset.for);
    if (!input) return;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.textContent = show ? '🙈' : '👁';
  });

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
// RESERVAS, OPINIONES, ETC.
// ===============================

async function guardarReserva(nombre, apellido, personas, fecha, mensaje) {
  const backendUrl = BACKEND_URL;
  const token = getToken();
  const btn = document.querySelector('#reserva-form button[type="submit"]');
  setLoading(btn, true);

  const usuario = getUsuario();
  const bodyData = { nombre, apellido, personas, fecha, mensaje };

  if (usuario && usuario.id) {
    bodyData.usuario_id = usuario.id;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const response = await fetch(`${backendUrl}/api/reservas`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      credentials: 'include'
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Error en reserva');
    showToast('Reserva realizada con éxito', 'success');
    setLoading(btn, false);
    return body;
  } catch (err) {
    console.error(err);
    showToast(err.message || 'Error al guardar reserva', 'error');
    setLoading(btn, false);
    return null;
  }
}

async function guardarPedido(pedidoData) {
  const backendUrl = BACKEND_URL;
  const token = getToken();

  const usuario = getUsuario();
  if (usuario && usuario.id) {
    pedidoData.usuario_id = usuario.id;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${backendUrl}/api/pedidos`, {
      method: 'POST',
      headers,
      body: JSON.stringify(pedidoData),
      signal: controller.signal,
      credentials: 'include'
    });
    clearTimeout(timeout);
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Error en pedido');
    return body;
  } catch (err) {
    console.error(err);
    if (err.name === 'AbortError') {
      showToast('El servidor no respondió. Intenta de nuevo.', 'error');
    } else {
      showToast(err.message || 'Error al guardar el pedido en el servidor', 'error');
    }
    return null;
  }
}

async function guardarOpinion(nombre, apellido, comentario) {
  const backendUrl = BACKEND_URL;
  const token = getToken();
  const btn = document.querySelector('#opinion-form button[type="submit"]');
  setLoading(btn, true);

  const usuario = getUsuario();
  const bodyData = { nombre, apellido, comentario };
  if (usuario && usuario.id) {
    bodyData.usuario_id = usuario.id;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const response = await fetch(`${backendUrl}/api/opiniones`, {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyData)
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Error en opinión');
    showToast('Opinión enviada con éxito', 'success');
    setLoading(btn, false);
    return body;
  } catch (err) {
    console.error(err);
    showToast(err.message || 'Error al enviar la opinión', 'error');
    setLoading(btn, false);
    return null;
  }
}

async function guardarValoracion(nombre, apellido, calificacion, comentario) {
  const backendUrl = BACKEND_URL;
  const token = getToken();
  const btn = document.querySelector('#valoracion-form button[type="submit"]');
  setLoading(btn, true);

  const usuario = getUsuario();
  const bodyData = { nombre, apellido, calificacion: parseInt(calificacion), comentario };
  if (usuario && usuario.id) {
    bodyData.usuario_id = usuario.id;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const response = await fetch(`${backendUrl}/api/valoraciones`, {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyData)
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Error en valoración');
    showToast('Valoración enviada con éxito', 'success');
    setLoading(btn, false);
    return body;
  } catch (err) {
    console.error(err);
    showToast(err.message || 'Error al enviar la valoración', 'error');
    setLoading(btn, false);
    return null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const formReserva = document.querySelector("#reserva-form");
  if (formReserva) {
    formReserva.addEventListener("submit", async e => {
      e.preventDefault();
      const offset = -new Date().getTimezoneOffset();
      const signo = offset >= 0 ? '+' : '-';
      const pad = n => String(Math.abs(n)).padStart(2, '0');
      const zona = `${signo}${pad(Math.floor(offset / 60))}:${pad(offset % 60)}`;
      const fechaHora = e.target.hora.value
        ? `${e.target.fecha.value}T${e.target.hora.value}:00${zona}`
        : e.target.fecha.value;
      const result = await guardarReserva(
        e.target.nombre.value,
        e.target.apellido.value,
        e.target.personas.value,
        fechaHora,
        e.target.mensaje.value
      );
      if (result) {
        const confirmacion = document.getElementById('confirmacion');
        const resumen = document.getElementById('resumen');
        if (confirmacion && resumen) {
          const horaSel = e.target.hora.value;
          let horaTexto = '';
          if (horaSel) {
            const [h, m] = horaSel.split(':');
            const hh = parseInt(h);
            const ampm = hh >= 12 ? 'PM' : 'AM';
            const h12 = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
            horaTexto = ` a las ${h12}:${m} ${ampm}`;
          }
          resumen.textContent = `Gracias, ${e.target.nombre.value}. Tu reserva para ${e.target.personas.value} persona(s) el ${e.target.fecha.value}${horaTexto} ha sido registrada.`;
          confirmacion.style.display = 'block';
        }
        e.target.reset();
      }
    });
  }

  const formOpinion = document.querySelector("#opinion-form");
  if (formOpinion) {
    formOpinion.addEventListener("submit", async e => {
      e.preventDefault();
      const result = await guardarOpinion(
        e.target.nombre.value,
        e.target.apellido.value,
        e.target.comentario.value
      );
      if (result) e.target.reset();
    });
  }

  const formValoracion = document.querySelector("#valoracion-form");
  if (formValoracion) {
    formValoracion.addEventListener("submit", async e => {
      e.preventDefault();
      const result = await guardarValoracion(
        e.target.nombre.value,
        e.target.apellido.value,
        e.target.estrellas.value,
        e.target.comentario.value
      );
      if (result) e.target.reset();
    });
  }
});
