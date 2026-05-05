// ===============================
 // LOGIN
 // ===============================
 async function login(email, password) {
   const { data, error } = await supabase
     .from('usuarios')
     .select('*')
     .eq('email', email)
     .eq('password', password)
     .single();

   if (error) {
     console.error('Login error:', error);
     alert("Correo o contraseña incorrectos o no se pudo conectar a la base de datos.");
   } else {
     localStorage.setItem("usuario", JSON.stringify(data));
     alert("Bienvenido " + data.nombre);
     window.location.href = "menu.html";
   }
 }

 // Evento login
 const formLogin = document.querySelector("#login-form");
 if (formLogin) {
   formLogin.addEventListener("submit", e => {
     e.preventDefault();

     const email = e.target.email.value;
     const password = e.target.password.value;

     login(email, password);
   });
 }

 // ===============================
 // REGISTRO
 // ===============================
 async function registrar(nombre, email, password) {
   const { error } = await supabase
     .from('usuarios')
     .insert([{ nombre, email, password }]);

   if (error) {
     console.error('Registro error:', error);
     alert("Error al registrar en la base de datos. Revisa la consola.");
   } else {
     alert("Usuario creado");
     window.location.href = "login.html";
   }
 }

 // Evento registro
 const formRegistro = document.querySelector("#register-form");
 if (formRegistro) {
   formRegistro.addEventListener("submit", e => {
     e.preventDefault();

     const nombre = e.target.nombre.value;
     const email = e.target.email.value;
     const password = e.target.password.value;

     registrar(nombre, email, password);
   });
 }

 // ===============================
 // RESERVAS
 // ===============================
 async function guardarReserva(nombre, apellido, personas, fecha, mensaje) {
  const reservaMessage = document.getElementById('reserva-message');
  const confirmacion = document.getElementById('confirmacion');
  const resumen = document.getElementById('resumen');
  const backendUrl = window.location.protocol.startsWith('http')
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : 'http://127.0.0.1:3000';

  try {
    const response = await fetch(`${backendUrl}/api/reservas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, apellido, personas, fecha, mensaje })
    });

    const body = await response.json();

    if (!response.ok) {
      throw new Error(body.error || 'Error del servidor en reservas');
    }

    if (reservaMessage) reservaMessage.textContent = 'Reserva enviada correctamente.';
    if (confirmacion && resumen) {
      resumen.textContent = `Reserva para ${nombre} ${apellido} con ${personas} persona(s) el ${fecha}.`;
      confirmacion.style.display = 'block';
    }
    return body;
  } catch (backendError) {
    console.warn('Falling back to Supabase direct insert:', backendError);

    const { data, error } = await supabase
      .from('reservas')
      .insert([{ nombre, apellido, personas, fecha_reserva: fecha, mensaje }]);

    if (error) {
      console.error('Reserva error:', error);
      if (reservaMessage) reservaMessage.textContent = `Error: ${error.message}`;
      alert("Error al guardar reserva. Revisa la consola del navegador.");
      return null;
    }

    alert("Reserva realizada");
    if (reservaMessage) reservaMessage.textContent = 'Reserva enviada correctamente.';
    if (confirmacion && resumen) {
      resumen.textContent = `Reserva para ${nombre} ${apellido} con ${personas} persona(s) el ${fecha}.`;
      confirmacion.style.display = 'block';
    }
    return data;
  }
}

 // Evento reservas
 const formReserva = document.querySelector("#reserva-form");
 if (formReserva) {
   formReserva.addEventListener("submit", e => {
     e.preventDefault();

     const nombre = e.target.nombre.value;
     const apellido = e.target.apellido.value;
     const personas = e.target.personas.value;
     const fecha = e.target.fecha.value;
     const mensaje = e.target.mensaje.value;

     guardarReserva(nombre, apellido, personas, fecha, mensaje);
   });
 }

 // ===============================
 // OPINIONES
 // ===============================
 async function guardarOpinion(nombre, apellido, comentario) {
   const { error } = await supabase.from('opiniones').insert([
     { nombre, apellido, comentario }
   ]);

   if (error) {
     console.error('Opinión error:', error);
     alert("Error al enviar opinión. Revisa la consola del navegador.");
   } else {
     alert("Gracias por tu opinión");
   }
 }

 // Evento opinión
 const formOpinion = document.querySelector("#opinion-form");
 if (formOpinion) {
   formOpinion.addEventListener("submit", e => {
     e.preventDefault();

     const nombre = e.target.nombre.value;
     const apellido = e.target.apellido.value;
     const comentario = e.target.comentario.value;

     guardarOpinion(nombre, apellido, comentario);
   });
 }

 // ===============================
 // VALORACIONES
 // ===============================
 async function guardarValoracion(nombre, apellido, calificacion, comentario) {
   const { error } = await supabase.from('valoraciones').insert([
     { nombre, apellido, calificacion: Number(calificacion), comentario }
   ]);

   if (error) {
     console.error('Valoración error:', error);
     alert("Error al enviar valoración. Revisa la consola del navegador.");
   } else {
     alert("Gracias por tu valoración");
   }
 }

 const formValoracion = document.querySelector("#valoracion-form");
 if (formValoracion) {
   formValoracion.addEventListener("submit", e => {
     e.preventDefault();

     const nombre = e.target.nombre.value;
     const apellido = e.target.apellido.value;
     const comentario = e.target.comentario.value;
     const calificacion = e.target.estrellas.value;

     guardarValoracion(nombre, apellido, calificacion, comentario);
   });
 }

 // ===============================
 // PEDIDOS
 // ===============================
 async function guardarPedido(detalle, total, metodo_pago, card_last4, card_exp, card_brand) {

   const { error } = await supabase
     .from('pedidos')
     .insert([{
       detalle,
       total,
       metodo_pago,
       card_last4,
       card_exp,
       card_brand
     }]);

   if (error) {
     alert("Error al procesar pedido");
   } else {
     alert("Pedido realizado");
   }
 }