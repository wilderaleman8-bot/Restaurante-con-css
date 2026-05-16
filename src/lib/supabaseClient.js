// Carga las variables de entorno desde el archivo .env
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Lee las credenciales de Supabase desde las variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Si faltan las credenciales, lanza un error para evitar conexiones rotas
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Las variables SUPABASE_URL y SUPABASE_KEY deben estar definidas en .env');
}

// Crea y exporta el cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
