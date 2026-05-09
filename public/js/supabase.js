// ===============================
// CONFIGURACIÓN SUPABASE
// ===============================

// DATOS Principales de conexion a Supabase
const SUPABASE_URL = "https://dgdwpcrxrhxnsjpnfddw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnZHdwY3J4cmh4bnNqcG5mZGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMzM3MDYsImV4cCI6MjA5MjkwOTcwNn0.g_Val0wkG03XKmEMdomjpvBmv0keAEH11iVwuI1g2IM";

// Crear cliente
if (!window.supabase || typeof window.supabase.createClient !== 'function') {
  throw new Error('No se encontró la librería de Supabase. Asegúrate de cargar https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js antes de js/supabase.js');
}
window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);