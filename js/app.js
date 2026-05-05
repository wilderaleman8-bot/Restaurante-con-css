// ===============================
 // LOGIN
 // ===============================
 async function login(email, password) {
   const backendUrl = window.location.protocol.startsWith('http')
     ? `${window.location.protocol}//${window.location.hostname}:3000`
     : 'http://127.0.0.1:3000';

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
     : '../imagenes/Logo.jpg';
   const sessionUser = {
     id: usuario.id,
     nombre: usuario.nombre,
     email: usuario.email,
     image_path: usuario.image_path || null,
     imageUrl
   };

   localStorage.setItem('saboresUser', JSON.stringify(sessionUser));
   localStorage.setItem('usuario', JSON.stringify(sessionUser));
   alert('Bienvenido ' + usuario.nombre);
   window.location.href = 'menu.html';
   return sessionUser;
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
 async function registrar(formData) {
   const backendUrl = window.location.protocol.startsWith('http')
     ? `${window.location.protocol}//${window.location.hostname}:3000`
     : 'http://127.0.0.1:3000';

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

 // Evento registro
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
         : '../imagenes/Logo.jpg';
       const sessionUser = {
         id: usuario.id,
         nombre: usuario.nombre,
         email: usuario.email,
         image_path: usuario.image_path || null,
         imageUrl
       };
       localStorage.setItem('saboresUser', JSON.stringify(sessionUser));
       localStorage.setItem('usuario', JSON.stringify(sessionUser));
       alert('Usuario creado');
       window.location.href = 'menu.html';
     }
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