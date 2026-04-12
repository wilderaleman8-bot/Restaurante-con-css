// js/main.js — comportamientos comunes para todo el sitio
document.addEventListener('DOMContentLoaded', () => {
  // menú móvil toggle
  const toggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.style.display = getComputedStyle(navLinks).display === 'flex' ? 'none' : 'flex';
    });
  }

  // cerrar menú al hacer click en un enlace (en móvil)
  if (navLinks) {
    navLinks.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && window.innerWidth <= 768) {
        navLinks.style.display = 'none';
      }
    });
  }

  // marcar link activo según URL
  try {
    const links = document.querySelectorAll('.nav-links a');
    const path = window.location.pathname.split('/').pop();
    links.forEach(a => {
      const href = a.getAttribute('href');
      if (href === path || (href === 'index.html' && path === '')) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  } catch (err) { /* no pasa nada si falla */ }

  // cargar datos desde localStorage
  function loadFromLocal(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {
      return [];
    }
  }

  const listOp = document.getElementById('list-op');
  const listRes = document.getElementById('list-res');
  const listVal = document.getElementById('list-val');

  if (listOp || listRes || listVal) {
    const ops = loadFromLocal('ops');
    const res = loadFromLocal('res');
    const vals = loadFromLocal('vals');

    if (listOp) {
      listOp.innerHTML = ops.length ? ops.map(o => `<li><strong>${escapeHtml(o.nombre)}</strong> - ${escapeHtml(o.fecha)}</li>`).join('') : '<li class="empty">Sin datos</li>';
    }
    if (listRes) {
      listRes.innerHTML = res.length ? res.map(r => `<li><strong>${escapeHtml(r.nombre)}</strong> - ${escapeHtml(r.fecha)}</li>`).join('') : '<li class="empty">Sin datos</li>';
    }
    if (listVal) {
      listVal.innerHTML = vals.length ? vals.map(v => `<li><strong>${escapeHtml(v.nombre)}</strong> - ${escapeHtml(v.fecha)}</li>`).join('') : '<li class="empty">Sin datos</li>';
    }
  }

  // carga visual en la página de opiniones si hay reviews guardadas en localStorage
  const opinionesLista = document.getElementById('opinionesLista');
  if (opinionesLista) {
    const ops = loadFromLocal('ops');
    if (ops.length) {
      ops.slice().reverse().forEach(o => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `<h3>${escapeHtml(o.nombre)} ${escapeHtml(o.apellidos||'')}</h3><p>${escapeHtml(o.comentario||'')}</p><small>${escapeHtml(o.fecha)}</small>`;
        opinionesLista.prepend(div);
      });
    }
  }

  // helper: escapar texto simple para evitar inyección
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  }
});
