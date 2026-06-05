//Funcionamiento del test con: Npm test.

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const app = require('../app');

let server;

before(() => {
  server = app.listen(3002);
});

after(() => {
  server.close();
});

describe('API - Platillos', () => {
  it('GET /api/platillos - debe devolver un array', async () => {
    const res = await fetch('http://localhost:3002/api/platillos');
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
  });
});

describe('API - Opiniones', () => {
  it('GET /api/opiniones - debe devolver un array', async () => {
    const res = await fetch('http://localhost:3002/api/opiniones');
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
  });
});

describe('API - Valoraciones', () => {
  it('GET /api/valoraciones - debe devolver un array', async () => {
    const res = await fetch('http://localhost:3002/api/valoraciones');
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
  });
});

describe('API - Auth', () => {
  it('POST /api/usuarios/login - debe rechazar credenciales vacías', async () => {
    const res = await fetch('http://localhost:3002/api/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '', password: '' })
    });
    assert.strictEqual(res.status, 400);
  });

  it('GET /api/admin/usuarios - debe rechazar sin token', async () => {
    const res = await fetch('http://localhost:3002/api/admin/usuarios');
    assert.strictEqual(res.status, 401);
  });

  it('GET /api/usuarios - debe rechazar sin token', async () => {
    const res = await fetch('http://localhost:3002/api/usuarios');
    assert.strictEqual(res.status, 401);
  });

  it('GET /api/pedidos - debe rechazar sin token', async () => {
    const res = await fetch('http://localhost:3002/api/pedidos');
    assert.strictEqual(res.status, 401);
  });

  it('GET /api/reservas - debe rechazar sin token', async () => {
    const res = await fetch('http://localhost:3002/api/reservas');
    assert.strictEqual(res.status, 401);
  });
});

describe('API - 404', () => {
  it('GET /api/ruta-inexistente - debe devolver 404', async () => {
    const res = await fetch('http://localhost:3002/api/ruta-inexistente');
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.strictEqual(data.error, 'Endpoint no encontrado');
  });
});
