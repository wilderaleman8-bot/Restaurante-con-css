const supabase = require('../lib/supabaseClient');
const { sanitizar } = require('../utils/validation');
const cache = require('../utils/cache');

// GET /api/platillos - Lista platillos activos, paginados, con caché de 60s
async function listar(req, res) {
  const page = Math.max(0, parseInt(req.query.page) || 0);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 100));
  const from = page * limit;
  const to = from + limit - 1;
  const cacheKey = `platillos:${page}:${limit}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    res.set('Cache-Control', 'public, max-age=60');
    return res.json(cached);
  }

  const { data, error } = await supabase
    .from('platillos')
    .select('*')
    .eq('active', true)
    .order('order', { ascending: true })
    .order('name', { ascending: true })
    .range(from, to);

  if (error) return res.status(500).json({ error: error.message });
  cache.set(cacheKey, data);
  res.set('Cache-Control', 'public, max-age=60');
  res.json(data || []);
}

// GET /api/platillos/admin - Lista todos los platillos (incluyendo inactivos, protegido)
async function listarAdmin(req, res) {
  const page = Math.max(0, parseInt(req.query.page) || 0);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 100));
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('platillos')
    .select('*')
    .order('order', { ascending: true })
    .order('name', { ascending: true })
    .range(from, to);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

// POST /api/platillos - Crea un nuevo platillo (admin)
async function crear(req, res) {
  const { category, subcategory, name, description, price, currency, image } = req.body;

  if (!category || !name || price === undefined) {
    return res.status(400).json({ error: 'Faltan datos obligatorios (category, name, price)' });
  }
  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ error: 'Precio inválido' });
  }

  const { data, error } = await supabase
    .from('platillos')
    .insert([{ category, subcategory, name: sanitizar(name), description: description ? sanitizar(description) : null, price, currency: currency || 'C$', image }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  cache.clear('platillos:');
  res.status(201).json(data);
}

// PUT /api/platillos/:id - Actualiza un platillo (admin). Invalida caché.
async function actualizar(req, res) {
  const { id } = req.params;
  const { category, subcategory, name, description, price, currency, image, active, order } = req.body;

  if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
    return res.status(400).json({ error: 'Precio inválido' });
  }

  const updates = {};
  if (category !== undefined) updates.category = category;
  if (subcategory !== undefined) updates.subcategory = subcategory;
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (price !== undefined) updates.price = price;
  if (currency !== undefined) updates.currency = currency;
  if (image !== undefined) updates.image = image;
  if (active !== undefined) updates.active = active;
  if (order !== undefined) updates.order = order;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No hay campos para actualizar' });
  }

  const { data, error } = await supabase
    .from('platillos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Platillo no encontrado' });

  cache.clear('platillos:');
  res.json(data);
}

// DELETE /api/platillos/:id - Elimina un platillo de la BD (admin)
async function eliminar(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('platillos')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Platillo no encontrado' });

  cache.clear('platillos:');
  res.json({ message: 'Platillo eliminado correctamente', platillo: data });
}

// POST /api/platillos/seed - Inserta el menú por defecto. Solo funciona si la tabla está vacía.
async function seed(req, res) {
  const menuData = {
    entradas: [
      { name: 'Combo Familiar', description: 'Pan crujiente con tomate confitado, aceite de oliva y albahaca fresca.', price: 280.00, image: 'imagenes/entrada-1.jpg' },
      { name: 'Indio Viejo', description: 'Guiso espeso y sustancioso a base de carne desmenuzada y masa de maíz.', price: 130.00, image: 'imagenes/entrada-2.jpg' },
      { name: 'Ensalada Caprese', description: 'Mozzarella cremosa con tomate heirloom y reducción de balsámico.', price: 250.00, image: 'imagenes/entrada3.png' },
      { name: 'Queso Frito con Tajadas', description: 'Queso frito acompañado de plátano maduro frito.', price: 150.00, image: 'imagenes/queso-frito-con-tajadas.png' },
      { name: 'Tostones con Guacamole', description: 'Plátano verde frito acompañado de guacamole fresco.', price: 130.00, image: 'imagenes/Tostones con Guacamole.png' },
      { name: 'Nacatamalito', description: 'Versión pequeña del tradicional nacatamal.', price: 100.00, image: 'imagenes/Nacatamalito.png' },
      { name: 'Empanadas de Queso', description: 'Empanadas rellenas de queso derretido, fritas.', price: 140.00, image: 'imagenes/Empanadas de Queso.png' },
      { name: 'Sopa de Albóndigas', description: 'Sopa tradicional con albóndigas de carne.', price: 200.00, image: 'imagenes/Sopa de Albóndigas.png' }
    ],
    platos: [
      { name: 'Risotto de Champiñones', description: 'Arroz cremoso con setas silvestres y parmesano.', price: 250.00, image: 'imagenes/risotto-de-champinones.png' },
      { name: 'Salmón a la Parrilla', description: 'Salmón sellado con verduras asadas y reducción cítrica.', price: 280.00, image: 'imagenes/salmon-a-la-parrilla.png' },
      { name: 'Pasta Carbonara', description: 'Pasta al dente con salsa cremosa de huevo y pancetta.', price: 150.00, image: 'imagenes/pasta-carbonara.png' },
      { name: 'Gallo Pinto', description: 'Frijoles y arroz revueltos, servidos con tajadas y queso.', price: 200.00, image: 'imagenes/3.jpg' },
      { name: 'Nacatamal', description: 'Tamal tradicional nicaragüense relleno de carne de cerdo.', price: 160.00, image: 'imagenes/Nacatama.png' },
      { name: 'Vigorón', description: 'Yuca cocida con chicharrón y ensalada de repollo.', price: 150.00, image: 'imagenes/Vigorón.png' },
      { name: 'Carne Asada', description: 'Corte de res a la parrilla acompañado de gallo pinto.', price: 200.00, image: 'imagenes/arne Asada.png' },
      { name: 'Pescado a la Tipitapa', description: 'Pescado entero frito acompañado de salsa criolla.', price: 250.00, image: 'imagenes/Pescado a la Tipitapa.png' }
    ],
    postres: [
      { name: 'Buñuelos', description: 'Bolitas fritas de yuca bañadas en miel de panela.', price: 100.00, image: 'imagenes/postre-1.jpg' },
      { name: 'Raspados y Viejitas', description: 'Variedad de dulces tradicionales nicaragüenses.', price: 120.00, image: 'imagenes/postre-2.jpg' },
      { name: 'Cajeta de Leche', description: 'Dulce espeso y cremoso hecho a base de leche y azúcar.', price: 130.00, image: 'imagenes/postre-3.jpg' },
      { name: 'Tres Leches', description: 'Pastel esponjoso bañado en tres leches.', price: 130.00, image: 'imagenes/Tres Leches.png' },
      { name: 'Leche Poleada', description: 'Postre cremoso a base de leche, canela y azúcar.', price: 100.00, image: 'imagenes/Leche Poleada.png' },
      { name: 'Arroz con Leche', description: 'Arroz cocido en leche con canela y pasas.', price: 120.00, image: 'imagenes/Arroz con Leche.png' },
      { name: 'Pio Quinto', description: 'Pastel de ron con natilla.', price: 120.00, image: 'imagenes/Pio Quinto.png' },
      { name: 'Atolillo', description: 'Bebida espesa y dulce a base de maíz.', price: 120.00, image: 'imagenes/Atolillo.png' }
    ],
    bebidas: {
      licores: [
        { name: 'Vino Tinto', description: 'Copa de nuestro tinto seleccionado.', price: 400.00, image: 'imagenes/vino-tinto-de-la-casa.png' },
        { name: 'Margarita', description: 'Tequila, triple sec y jugo de limón.', price: 140.00, image: 'imagenes/Coctel-Margarita.png' },
        { name: 'Ron Flor de Caña', description: 'Ron nicaragüense premium.', price: 200.00, image: 'imagenes/flor de Caña Ron & Cola.png' },
        { name: 'Pisco Sour', description: 'Cóctel clásico a base de pisco.', price: 160.00, image: 'imagenes/pisco.png' },
        { name: 'Cuba Libre', description: 'Ron con cola y limón.', price: 150.00, image: 'imagenes/Cuba libre.jpg' }
      ],
      cervezas: [
        { name: 'Toña', description: 'Cerveza lager nicaragüense clásica.', price: 80.00, image: 'imagenes/Toña.png' },
        { name: 'Victoria', description: 'Cerveza lager con cuerpo y sabor marcado.', price: 80.00, image: 'imagenes/victoria.png' },
        { name: 'Premium', description: 'Cerveza lager premium equilibrada.', price: 85.00, image: 'imagenes/Premium.png' },
        { name: 'Brahva', description: 'Cerveza lager ligera y refrescante.', price: 85.00, image: 'imagenes/Brahva.png' },
        { name: 'Toña Light', description: 'Cerveza suave con menos calorías.', price: 75.00, image: 'imagenes/Toña Light.png' },
        { name: 'Victoria Frost', description: 'Victoria con un toque de limón.', price: 75.00, image: 'imagenes/Victoria Frost.png' },
        { name: 'Cerveza Artesanal', description: 'Cerveza artesanal nica de sabor único.', price: 100.00, image: 'imagenes/Cerveza Artesanal Nica.png' }
      ],
      enbotellados: [
        { name: 'Coca Cola', description: 'Refresco gaseoso clásico.', price: 40.00, image: 'imagenes/coca cola.jpg' },
        { name: 'Fanta Naranja', description: 'Refresco sabor naranja.', price: 40.00, image: 'imagenes/Fanta Naranja.jpg' },
        { name: 'Agua Purificada', description: 'Agua embotellada pura.', price: 25.00, image: 'imagenes/Agua Purificada.jpg' }
      ],
      refrescos: [
        { name: 'Jugo de Tamarindo', description: 'Refrescante jugo natural de tamarindo.', price: 60.00, image: 'imagenes/Jugo de Tamarindo.png' },
        { name: 'Cacao Caliente', description: 'Bebida de cacao puro, espesa y aromática.', price: 80.00, image: 'imagenes/Cacao Caliente.png' },
        { name: 'Limonada con Menta', description: 'Limonada refrescante con hojas de menta.', price: 60.00, image: 'imagenes/Limonada con Menta.png' },
        { name: 'Batido de Guanábana', description: 'Batido cremoso de guanábana fresca.', price: 90.00, image: 'imagenes/Batido de Guanábana.png' },
        { name: 'Té de Jamaica', description: 'Infusión de flor de jamaica refrescante.', price: 60.00, image: 'imagenes/Té de Jamaica.png' },
        { name: 'Espresso', description: 'Café espresso italiano corto e intenso.', price: 100.00, image: 'imagenes/cafe-espresso-italiano.png' }
      ]
    }
  };

  const rows = [];

  let order = 0;
  for (const category of ['entradas', 'platos', 'postres']) {
    menuData[category].forEach(item => {
      rows.push({
        category,
        name: item.name,
        description: item.description,
        price: item.price,
        currency: item.currency || 'C$',
        image: item.image,
        active: true,
        order: order++
      });
    });
  }

  for (const subcategory of Object.keys(menuData.bebidas)) {
    menuData.bebidas[subcategory].forEach(item => {
      rows.push({
        category: 'bebidas',
        subcategory,
        name: item.name,
        description: item.description,
        price: item.price,
        currency: item.currency || 'C$',
        image: item.image,
        active: true,
        order: order++
      });
    });
  }

  const { data: existing } = await supabase.from('platillos').select('id').limit(1);
  if (existing && existing.length > 0) {
    return res.status(400).json({ error: 'Ya existen platillos en la base de datos. Elimínalos primero si deseas resembrar.' });
  }

  const { data, error } = await supabase.from('platillos').insert(rows).select();

  if (error) return res.status(500).json({ error: error.message });
  cache.clear('platillos:');
  res.status(201).json({ message: 'Platillos insertados correctamente', count: data.length });
}

module.exports = { listar, listarAdmin, crear, actualizar, eliminar, seed };
