// URL base del backend (mismo origen)
const BACKEND_URL = window.location.origin;

// Obtiene el token JWT guardado en localStorage
function getToken() {
  return localStorage.getItem('saboresToken');
}

// Obtiene los datos del usuario desde localStorage (cualquier clave que exista)
function getUsuario() {
  try {
    const stored = localStorage.getItem('usuario') || localStorage.getItem('saboresUser');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Redirige al login si no hay sesión
function redirectLogin() {
  window.location.href = '../login.html';
}

// Verifica que el usuario esté autenticado y tenga rol admin
// Si no es admin, cierra la sesión
function checkAuth() {
  const token = getToken();
  if (!token) { redirectLogin(); return null; }

  const usuario = getUsuario();
  let role = localStorage.getItem('saboresRole') || usuario?.rol || null;

  if (role === 'admin') {
    localStorage.setItem('saboresRole', 'admin');
    return token;
  }

  if (usuario?.rol === 'admin') {
    localStorage.setItem('saboresRole', 'admin');
    return token;
  }

  logout();
}

// Fetch con autenticación automática (incluye JWT en headers)
// Si la respuesta es 401, cierra sesión automáticamente
function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = options.headers || {};
  headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  return fetch(`${BACKEND_URL}${path}`, { ...options, headers, credentials: 'include' })
    .then(res => {
      if (res.status === 401) {
        logout();
        throw new Error('Sesión expirada');
      }
      return res.json().then(data => {
        if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
        return data;
      });
    });
}

// Cierra sesión: elimina datos locales y redirige al login
function logout() {
  fetch(`${BACKEND_URL}/api/usuarios/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
  localStorage.removeItem('usuario');
  localStorage.removeItem('saboresUser');
  localStorage.removeItem('saboresToken');
  localStorage.removeItem('saboresRole');
  window.location.href = '../login.html';
}

// Muestra un toast flotante en la parte superior de la pantalla
// type: 'success' (verde), 'error' (rojo), cualquier otro (gris)
function showToast(message, type) {
  const existing = document.getElementById('admin-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'admin-toast';
  toast.textContent = message;
  const bg = type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#333';
  toast.style.cssText = `
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
    background: ${bg}; color: white; padding: 14px 28px;
    border-radius: 10px; font-weight: 600; font-size: 0.95rem;
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

// Marca el enlace de la página actual en la barra lateral como activo
function setActiveLink() {
  const current = window.location.pathname.split('/').pop();
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

// Renderiza la foto y nombre del usuario en el header del admin
function renderUserInfo() {
  const container = document.getElementById('admin-user-info');
  if (!container) return;
  const usuario = getUsuario();
  if (!usuario) {
    container.innerHTML = '<span>Invitado</span>';
    return;
  }
  const imgSrc = usuario.imageUrl
    ? usuario.imageUrl
    : (usuario.image_path
      ? `${BACKEND_URL}/uploads/${usuario.image_path}`
      : '../imagenes/Logo.jpg');
  container.innerHTML = `
    <img src="${imgSrc}" alt="">
    <strong>${usuario.nombre || 'Admin'}</strong>
  `;
}

// Renderiza el nombre del usuario en el pie de la barra lateral
function renderSidebarUser() {
  const el = document.getElementById('sidebar-user-name');
  if (!el) return;
  const u = getUsuario();
  el.textContent = u ? (u.nombre || 'Admin') : 'Invitado';
}

// Configura el botón hamburguesa para mostrar/ocultar la sidebar en móvil
function setupSidebarToggle() {
  const btn = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.admin-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (!btn || !sidebar) return;

  function toggleSidebar(open) {
    sidebar.classList.toggle('open', open);
    if (overlay) overlay.classList.toggle('active', open);
  }

  btn.addEventListener('click', () => {
    const isOpen = sidebar.classList.contains('open');
    toggleSidebar(!isOpen);
  });

  if (overlay) {
    overlay.addEventListener('click', () => {
      toggleSidebar(false);
    });
  }

  document.addEventListener('click', (e) => {
    if (window.innerWidth > 768) return;
    if (!sidebar.contains(e.target) && !btn.contains(e.target)) {
      toggleSidebar(false);
    }
  });
}

function setLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn._originalText = btn.innerHTML;
    btn.disabled = true;
    btn.classList.add('btn-loading');
    btn.innerHTML = '<span class="spinner"></span><span class="btn-text">Cargando...</span>';
  } else {
    btn.disabled = false;
    btn.classList.remove('btn-loading');
    btn.innerHTML = btn._originalText || '';
  }
}

// Genera HTML de filas esqueleto para simular una tabla cargando
function renderSkeletonTable(rows, cols) {
  let html = '';
  for (let r = 0; r < rows; r++) {
    html += '<div class="skeleton-row">';
    for (let c = 0; c < cols; c++) {
      const w = ['w-20', 'w-25', 'w-30', 'w-40'][c % 4];
      html += `<div class="skeleton-cell ${w}"></div>`;
    }
    html += '</div>';
  }
  return html;
}

// Genera HTML de tarjetas esqueleto para estados de carga
function renderSkeletonCards(count) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += '<div class="skeleton-card"></div>';
  }
  return html;
}

// Conecta con Socket.io para recibir notificaciones en tiempo real
// Eventos: new-order, new-reservation, order-status
function setupSocket() {
  if (typeof io === 'undefined') return;
  const socket = io(BACKEND_URL);

  socket.on('new-order', (data) => {
    showToast(`🆕 Nuevo pedido — C$${(data.total || 0).toFixed(2)} (${data.metodo_pago || '—'})`, 'success');
    const badge = document.querySelector('.sidebar-nav a[href="pedidos.html"] .badge');
    if (badge) badge.textContent = (parseInt(badge.textContent) || 0) + 1;
  });

  socket.on('new-reservation', (data) => {
    showToast(`🆕 Nueva reserva — ${data.nombre} ${data.apellido} (${data.personas} pers.)`, 'success');
  });

  socket.on('order-status', (data) => {
    showToast(`📋 Pedido #${data.id.slice(0,8)} → ${data.status}`, 'info');
  });
}

// Banner de consentimiento de cookies (GDPR)
function initCookieConsent() {
  if (localStorage.getItem('cookieConsent')) return;
  const banner = document.createElement('div');
  banner.className = 'cookie-consent';
  banner.innerHTML = `
    <div class="cc-inner">
      <div class="cc-header">🍪 Cookies</div>
      <p>Usamos cookies para mejorar tu experiencia. Al continuar, aceptás nuestra <a href="../privacidad.html">política de privacidad</a>.</p>
      <div class="cc-btns">
        <button class="cc-btn reject" data-action="reject">Rechazar</button>
        <button class="cc-btn accept" data-action="accept">Aceptar todas</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);
  requestAnimationFrame(() => banner.classList.add('active'));
  banner.addEventListener('click', (e) => {
    const btn = e.target.closest('.cc-btn');
    if (!btn) return;
    localStorage.setItem('cookieConsent', btn.dataset.action);
    banner.classList.remove('active');
    setTimeout(() => banner.remove(), 400);
  });
}

// Registra el Service Worker para funcionalidad offline (PWA)
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../service-worker.js').catch(() => {});
  }
}

// Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  // Manejador global de errores en imágenes (reemplaza onerror inline por CSP)
  document.addEventListener('error', e => {
    const t = e.target;
    if (t.tagName === 'IMG' && !t.dataset.errorFallback) {
      t.dataset.errorFallback = '1';
      t.src = '../imagenes/Logo.jpg';
    }
  }, true);

  initCookieConsent();
  registerSW();
  checkAuth();
  setActiveLink();
  renderUserInfo();
  renderSidebarUser();
  setupSidebarToggle();
  setupSocket();

  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  });
});
