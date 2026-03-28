// --- 1. VARIABLES GLOBALES (Cero llaves expuestas, 100% seguro) ---
let noticiasGlobales = [];
let inmueblesGlobales = [];

// --- 2. EL MOTOR DE ARRANQUE SEGURO UNIFICADO ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Portal Comunitario iniciado. Preparando motores...");

    // 1. Animaciones (Scroll Reveal)
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // 2. Configuración inicial
    cargarConfiguracionPortal();

    try {
        // 3. Llamada a Vercel para obtener datos del conjunto y permisos
        const respConfig = await fetch('/api/login');
        const infoSaaS = await respConfig.json();
        
       if (infoSaaS.copropiedad_id) {
             // Guardamos el ID para que cargarNoticias, cargarDocumentos, etc., lo encuentren
            sessionStorage.setItem('copropiedad_id_publico', infoSaaS.copropiedad_id);
            console.log("✅ ID de copropiedad cargado:", infoSaaS.copropiedad_id);
        } else {
            console.error("❌ No se recibió el ID de la copropiedad de la API");
        }
        
        // 4. Guardar ID en sesión
        sessionStorage.setItem('copropiedad_id_publico', infoSaaS.copropiedad_id);

        // 5. Guardar permisos granulares en memoria (Estructura Modular)
        const permisosGuardar = {
            zonas: infoSaaS.mod_zonas || false,
            reservas: infoSaaS.mod_reservas || false,
            mercado: infoSaaS.mod_mercado || false,
            documentos: infoSaaS.mod_documentos !== false, 
            formularios: infoSaaS.mod_formularios !== false
        };
        sessionStorage.setItem('permisos_saas', JSON.stringify(permisosGuardar));

        // 6. Aplicar lógica de visibilidad (Feature Flags)
        const misPermisos = aplicarPermisosPublicos();

        // 7. Carga selectiva de datos según permisos
        cargarConfiguracionPortal(); 
        await cargarNoticiasPublicas();

        if (misPermisos.reservas) await cargarZonasComunes(); 
        if (misPermisos.mercado) await cargarInmueblesPublicos();
        if (misPermisos.documentos) await cargarDocumentos();
        if (misPermisos.formularios) await cargarFormularios();

    } catch (error) {
        console.error("Error iniciando el portal público:", error);
    }
}); 


async function cargarConfiguracionPortal() {
    try {
        const { data, error } = await supabase.from('configuracion').select('*').eq('id', 1).single();
        
        // Si hay data y el título no está vacío
        if (data && data.titulo_hero) {
            const titulo = data.titulo_hero;
            const partesTitulo = titulo.split(' ');
            const ultimaPalabra = partesTitulo.pop();
            const tituloFormat = `${partesTitulo.join(' ')} <span class="text-gradient">${ultimaPalabra}</span>`;
            
            document.getElementById('hero-titulo').innerHTML = tituloFormat;
            document.getElementById('hero-desc').innerText = data.desc_hero || '';
        } else {
            // Valores por defecto si la base de datos está vacía
            document.getElementById('hero-titulo').innerHTML = `Tu Comunidad <span class="text-gradient">Inteligente</span>`;
            document.getElementById('hero-desc').innerText = 'Noticias, reservas de zonas comunes y mercado inmobiliario.';
        }
    } catch (e) {
        console.warn("Aún no hay configuración de portada guardada. Usando la de por defecto.");
        document.getElementById('hero-titulo').innerHTML = `Tu Comunidad <span class="text-gradient">Inteligente</span>`;
        document.getElementById('hero-desc').innerText = 'Noticias, reservas de zonas comunes y mercado inmobiliario.';
    }
}

// Función Segura que va a Vercel, trae las 8 últimas y dibuja tus tarjetas
async function cargarNoticiasPublicas() {
    const contenedor = document.getElementById('contenedor-noticias');
    if (!contenedor) return;

    
    try {
        // --- INICIO FLUJO PÚBLICO SEGURO ---
        // 1. Primero averiguamos quiénes somos preguntándole a Vercel por nuestro dominio
        const respConfig = await fetch('/api/login');
        const infoSaaS = await respConfig.json();
        
        const idConjunto = infoSaaS.copropiedad_id;

        if (!idConjunto) {
            console.warn("⚠️ No se encontró la copropiedad para este dominio. Las noticias no cargarán.");
            return; // Detenemos la función aquí para no causar errores
        }

        // 2. Ahora que tenemos el carnet del conjunto, pedimos las noticias
        const rutaSegura = `/api/noticias?copropiedad_id=${idConjunto}`;
        const respuesta = await fetch(rutaSegura);
        const resultado = await respuesta.json();
        // --- FIN FLUJO PÚBLICO SEGURO ---
       
        if (!resultado.exito) {
            console.error("Error desde Vercel:", resultado.mensaje);
            contenedor.innerHTML = '<p class="text-red-400 col-span-full text-center py-8">No se pudieron cargar las noticias.</p>';
            return;
        }

        // Sacamos la data limpia
        const data = resultado.datos;
        
        noticiasGlobales = data;
        contenedor.innerHTML = ''; // Limpiamos el letrero de "Cargando..."

        if (data.length === 0) {
            contenedor.innerHTML = '<p class="text-slate-400 col-span-full text-center py-8">No hay avisos recientes en la comunidad.</p>';
            return;
        }

        // ==========================================
        // 2. TU DISEÑO MAGISTRAL (SE QUEDA INTACTO)
        // ==========================================
        data.forEach((noti, index) => {
            const colores = {
                'Urgente': { bg: 'bg-red-500', bgLight: 'bg-red-500/20', text: 'text-red-400', border: 'hover:border-red-500' },
                'Alerta': { bg: 'bg-orange-500', bgLight: 'bg-orange-500/20', text: 'text-orange-400', border: 'hover:border-orange-500' },
                'Exclusivo': { bg: 'bg-purple-500', bgLight: 'bg-purple-500/20', text: 'text-purple-400', border: 'hover:border-purple-500' },
                'Informativo': { bg: 'bg-blue-500', bgLight: 'bg-blue-500/20', text: 'text-blue-400', border: 'hover:border-blue-500' }
            };
            const c = colores[noti.tipo] || colores['Informativo'];

            const tarjeta = `
                <div onclick="abrirNoticiaDetalle(${index})" class="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden group border-slate-700 ${c.border}">
                    <div class="absolute top-0 left-0 w-1 h-full ${c.bg}"></div>
                    <span class="px-2 py-1 ${c.bgLight} ${c.text} text-xs font-bold rounded mb-3 inline-block">${noti.tipo}</span>
                    <h3 class="text-lg font-bold mb-2 text-slate-100">${noti.titulo}</h3>
                    <p class="text-slate-400 text-sm mb-4 line-clamp-2">${noti.resumen}</p>
                    <span class="text-xs ${c.text} font-bold group-hover:underline">Leer más <i class="fa-solid fa-arrow-right ml-1"></i></span>
                </div>
            `;
            contenedor.innerHTML += tarjeta;
        });

    } catch (error) {
        console.error("Error de red conectando con Vercel:", error);
        contenedor.innerHTML = '<p class="text-red-400 col-span-full text-center py-8">No se pudieron cargar las noticias.</p>';
    }
}

// ==========================================
//  CONTROL DE VENTANAS EMERGENTES (MODALES)
// ==========================================

// Esta función se activa cuando alguien hace clic en una tarjeta de noticia
window.abrirNoticiaDetalle = (index) => {
    const noti = noticiasGlobales[index];
    if (!noti) return;

    const colores = {
        'Urgente': { bgLight: 'bg-red-500/20', text: 'text-red-400' },
        'Alerta': { bgLight: 'bg-orange-500/20', text: 'text-orange-400' },
        'Exclusivo': { bgLight: 'bg-purple-500/20', text: 'text-purple-400' },
        'Informativo': { bgLight: 'bg-blue-500/20', text: 'text-blue-400' }
    };
    const c = colores[noti.tipo] || colores['Informativo'];

    const modal = document.getElementById('modal-noticia');
    // Si la noticia no tiene imagen, ponemos una de edificio por defecto
    const imagenSrc = noti.imagen_url || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80'; 

    // Reemplazamos el contenido del Modal con los datos de Supabase
    modal.innerHTML = `
        <div class="glass-card bg-slate-800/90 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-600 shadow-2xl">
            <div class="h-48 bg-slate-700 relative shrink-0">
                <img src="${imagenSrc}" class="w-full h-full object-cover opacity-60">
                <button onclick="cerrarModal('modal-noticia')" class="absolute top-4 right-4 bg-black/50 hover:bg-red-500 text-white w-8 h-8 rounded-full transition-colors flex items-center justify-center"><i class="fa-solid fa-times"></i></button>
            </div>
            <div class="p-6 overflow-y-auto no-scrollbar">
                <span class="px-2 py-1 ${c.bgLight} ${c.text} text-xs font-bold rounded mb-3 inline-block">${noti.tipo}</span>
                <h2 class="text-2xl font-bold text-white mb-2">${noti.titulo}</h2>
                <p class="text-xs text-slate-400 mb-6"><i class="fa-regular fa-calendar mr-1"></i> Publicado: ${new Date(noti.fecha).toLocaleDateString()}</p>
                <div class="text-slate-300 space-y-4 text-sm leading-relaxed whitespace-pre-wrap">${noti.contenido}</div>
            </div>
        </div>
    `;

    abrirModal('modal-noticia');
};

// Funciones globales para abrir y cerrar ventanas
window.abrirModal = (id) => document.getElementById(id).classList.remove('hidden');
window.cerrarModal = (id) => document.getElementById(id).classList.add('hidden');

// ==========================================
//  MÓDULO 2: ZONAS COMUNES (RESIDENTE)
// ==========================================

window.enviarReserva = async () => {
    const zona = document.getElementById('res-zona').value;
    const fecha = document.getElementById('res-fecha').value;
    const apto = document.getElementById('res-apto').value.trim();
    const email = document.getElementById('res-email').value.trim();

    if (!fecha || !apto || !email) {
        return Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'Por favor completa todos los campos.', background: '#1e293b', color: '#fff' });
    }

    // 1. Validar si la fecha ya pasó (A prueba de Zonas Horarias)
    const hoyLocal = new Date();
    hoyLocal.setMinutes(hoyLocal.getMinutes() - hoyLocal.getTimezoneOffset());
    const fechaHoyStr = hoyLocal.toISOString().split('T')[0]; // Ej: "2026-03-04"

    if (fecha < fechaHoyStr) {
        return Swal.fire({ icon: 'error', title: 'Fecha inválida', text: 'No puedes reservar en fechas pasadas.', background: '#1e293b', color: '#fff' });
    }

    Swal.fire({ title: 'Procesando...', allowOutsideClick: false, background: '#1e293b', color: '#fff', didOpen: () => Swal.showLoading() });

    try {
    
    // --- PEGAR ESTO EN REEMPLAZO ---
        // Necesitamos el carnet del conjunto para que la reserva quede asociada a esta copropiedad
        const idConjunto = sessionStorage.getItem('copropiedad_id_publico');

        if (!idConjunto) {
            throw new Error("No se encontró el ID de la copropiedad.");
        }

        // Usamos fetch para llamar a nuestra API segura en Vercel
        const respuesta = await fetch('/api/reservas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                copropiedad_id: idConjunto, // Pasamos el carnet
                zona: zona,
                fecha: fecha,
                apto: apto,
                email: email
            })
        });

        const resultado = await respuesta.json();

        if (!resultado.exito) {
            return Swal.fire({ icon: 'error', title: 'Error', text: resultado.mensaje || 'No se pudo hacer la reserva.', background: '#1e293b', color: '#fff' });
        }

        Swal.fire({ icon: 'success', title: 'Solicitud Enviada', text: 'El administrador revisará tu solicitud y te notificará.', background: '#1e293b', color: '#fff' });
        
        // Limpiar y cerrar
        document.getElementById('res-fecha').value = '';
        document.getElementById('res-apto').value = '';
        document.getElementById('res-email').value = '';
        cerrarModal('modal-reserva');
        // --- FIN DE LO QUE HAY QUE PEGAR --- 

    } catch (e) {
        console.error(e);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Hubo un problema de conexión.', background: '#1e293b', color: '#fff' });
    }
};

// ==========================================
//  MÓDULO 2: Cargar zonas comunes
// ==========================================
async function cargarZonasComunes() {
    const contenedor = document.getElementById('contenedor-zonas');
    const selectZona = document.getElementById('res-zona');
    if (!contenedor || !selectZona) return;

    try {
        const idConjunto = sessionStorage.getItem('copropiedad_id_publico');
        if (!idConjunto) return;

        // Cambiamos el 'await supabase' por un 'fetch' a nuestra API segura
        const respuesta = await fetch(`/api/zonas?copropiedad_id=${idConjunto}`);
        const resultado = await respuesta.json();

        if (!resultado.exito || !resultado.datos) {
            contenedor.innerHTML = '<p class="text-slate-400 col-span-full text-center py-4">No hay zonas configuradas.</p>';
            return;
        }

        const data = resultado.datos;
        contenedor.innerHTML = '';
        selectZona.innerHTML = '<option value="">Selecciona una zona...</option>';

        data.forEach(zona => {
            contenedor.innerHTML += `
                <div onclick="abrirModalReservaConZona('${zona.nombre}')" class="glass-card rounded-2xl p-5 flex flex-col items-center text-center hover:bg-slate-800 transition-colors cursor-pointer border-slate-700 hover:border-purple-500">
                    <div class="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400 text-2xl">
                        <i class="fa-solid ${zona.icono || 'fa-tree-city'}"></i>
                    </div>
                    <h4 class="font-bold text-white">${zona.nombre}</h4>
                    ${zona.aforo ? `<p class="text-xs text-slate-400 mt-2">Aforo: ${zona.aforo}</p>` : ''}
                </div>`;
            selectZona.innerHTML += `<option value="${zona.nombre}">${zona.nombre}</option>`;
        });
    } catch (error) {
        console.error("Error en la API de zonas:", error);
    }
}

// ==========================================
//  MÓDULO 3: MERCADO INMOBILIARIO (PÚBLICO)
// ==========================================

async function cargarInmueblesPublicos() {
    try {
        // --- INICIO SEGURIDAD INMUEBLES ---
        // 1. Buscamos el carnet que guardamos cuando cargamos la página
        const idConjunto = sessionStorage.getItem('copropiedad_id_publico');

        // Si no hay carnet, no podemos buscar inmuebles
        if (!idConjunto) {
            console.warn("⚠️ No se encontró la copropiedad. Los inmuebles no cargarán.");
            return;
        }

        // 2. Usamos el cajero seguro de Vercel
        const rutaSeguraInmuebles = `/api/inmuebles?copropiedad_id=${idConjunto}`;
        const respuesta = await fetch(rutaSeguraInmuebles);
        const resultado = await respuesta.json();

        if (!resultado.exito || !resultado.datos) {
            console.error("Error trayendo inmuebles de Vercel:", resultado.mensaje);
            return;
        }

        const data = resultado.datos;
        // --- FIN SEGURIDAD INMUEBLES ---

        inmueblesGlobales = data;

    // --- 2. AQUÍ ESTÁ EL CAMBIO (El Filtro) ---
        
        // Filtramos estrictamente los que tengan el campo 'destacado' en true
        const destacados = data.filter(inm => inm.destacado === true);
        
        // Renderizamos SOLO los destacados arriba (Máximo 8)
        renderizarTarjetasInmuebles(destacados.slice(0, 8), 'contenedor-inmuebles-destacados');

        // Llenamos el catálogo completo abajo (Aquí sí van todos)
        renderizarTarjetasInmuebles(data, 'contenedor-catalogo-completo');   

    } catch (error) {
        console.error("Error de red conectando con Vercel para inmuebles:", error);
    }
}

// Función que dibuja las tarjetas donde se lo pidamos
function renderizarTarjetasInmuebles(lista, contenedorId) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    contenedor.innerHTML = '';
    
    if (lista.length === 0) {
        contenedor.innerHTML = `<p class="text-slate-400 col-span-full text-center py-8">No hay propiedades disponibles por ahora.</p>`;
        return;
    }

    lista.forEach(inm => {
        const precioFormat = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(inm.precio);
        const colorBg = inm.tipo_oferta === 'Se Arrienda' ? 'bg-blue-600' : 'bg-green-600';
        const colorBorder = inm.tipo_oferta === 'Se Arrienda' ? 'hover:border-blue-500' : 'hover:border-green-500';
        const foto = (inm.imagenes && inm.imagenes.length > 0) ? inm.imagenes[0] : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&q=80';

        // Convertimos el objeto completo a un string seguro para pasarlo por la función onclick
        const tarjeta = `
            <div onclick="abrirDetalleInmueble('${inm.id}')" class="glass-card rounded-2xl overflow-hidden group border-slate-700 ${colorBorder} cursor-pointer shadow-lg hover:shadow-xl transition-all">
                <div class="h-44 bg-slate-700 relative overflow-hidden">
                    <img src="${foto}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                    <span class="absolute top-3 right-3 ${colorBg} text-white text-[10px] font-extrabold uppercase px-3 py-1.5 rounded shadow-lg tracking-wider">${inm.tipo_oferta}</span>
                    ${inm.destacado ? '<span class="absolute top-3 left-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded shadow-lg"><i class="fas fa-star"></i></span>' : ''}
                </div>
                <div class="p-5">
                    <h4 class="font-bold text-lg text-slate-100 truncate">${inm.titulo}</h4>
                    <p class="text-green-400 font-extrabold text-xl my-2">${precioFormat}</p>
                    <div class="flex gap-4 text-xs text-slate-400 mt-3 border-t border-slate-700/50 pt-3">
                        <span title="Habitaciones"><i class="fa-solid fa-bed text-slate-500 mr-1"></i> ${inm.habitaciones}</span>
                        <span title="Baños"><i class="fa-solid fa-bath text-slate-500 mr-1"></i> ${inm.banos}</span>
                        <span title="Metros Cuadrados"><i class="fa-solid fa-ruler-combined text-slate-500 mr-1"></i> ${inm.area}m²</span>
                    </div>
                </div>
            </div>
        `;
        contenedor.innerHTML += tarjeta;
    });
}

// 3. El Buscador en Tiempo Real
document.getElementById('input-buscador-inm')?.addEventListener('input', (e) => {
    const texto = e.target.value.toLowerCase();
    const filtrados = inmueblesGlobales.filter(inm => 
        inm.titulo.toLowerCase().includes(texto) || 
        inm.tipo_oferta.toLowerCase().includes(texto) || 
        inm.precio.toString().includes(texto)
    );
    renderizarTarjetasInmuebles(filtrados, 'contenedor-catalogo-completo');
});

// 4. Abrir la Super Ventana de Detalles con Carrusel
window.abrirDetalleInmueble = (id) => {
    const inm = inmueblesGlobales.find(i => i.id === id);
    if (!inm) return;

    // Llenar datos de texto
    document.getElementById('det-inm-titulo').innerText = inm.titulo;
    document.getElementById('det-inm-precio').innerText = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(inm.precio);
    document.getElementById('det-inm-hab').innerText = inm.habitaciones;
    document.getElementById('det-inm-banos').innerText = inm.banos;
    document.getElementById('det-inm-area').innerText = inm.area;
    document.getElementById('det-inm-parq').innerText = inm.parqueadero;
    document.getElementById('det-inm-desc').innerText = inm.descripcion;
    
    // Configurar etiqueta (Venta o Arriendo)
    const spanTipo = document.getElementById('det-inm-tipo');
    spanTipo.innerText = inm.tipo_oferta;
    spanTipo.className = `px-3 py-1 text-xs font-bold uppercase rounded block w-max mb-3 ${inm.tipo_oferta === 'Se Arrienda' ? 'bg-blue-600/20 text-blue-400' : 'bg-green-600/20 text-green-400'}`;

    // Configurar WhatsApp
    const mensajeWsp = encodeURIComponent(`Hola ${inm.contacto_nombre}, estoy interesado en el inmueble "${inm.titulo}" que vi publicado en la cartelera digital del conjunto.`);
    document.getElementById('det-inm-whatsapp').href = `https://wa.me/57${inm.contacto_tel}?text=${mensajeWsp}`;

    // Configurar Galería de Fotos
    const imgPrincipal = document.getElementById('det-inm-foto-principal');
    const miniaturasContenedor = document.getElementById('det-inm-miniaturas');
    
    // Foto por defecto si no hay
    const fotos = (inm.imagenes && inm.imagenes.length > 0) ? inm.imagenes : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80'];
    
    imgPrincipal.src = fotos[0];
    miniaturasContenedor.innerHTML = '';

    // Dibujar miniaturas solo si hay más de 1 foto
    if (fotos.length > 1) {
        fotos.forEach((url, index) => {
            miniaturasContenedor.innerHTML += `
                <img src="${url}" onclick="document.getElementById('det-inm-foto-principal').src='${url}'" 
                     class="w-16 h-16 object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-white transition-all opacity-80 hover:opacity-100 shadow-xl bg-slate-800">
            `;
        });
    }

    abrirModal('modal-detalle-inmueble');
};

// ==========================================
//  NUEVO MÓDULO: DOCUMENTOS Y MANUALES
// ==========================================
async function cargarDocumentos() {
    const contenedor = document.getElementById('contenedor-documentos');
    if (!contenedor) return;

    try {
        const idConjunto = sessionStorage.getItem('copropiedad_id_publico');
        if (!idConjunto) return;

        const respuesta = await fetch(`/api/documentos?copropiedad_id=${idConjunto}`);
        const resultado = await respuesta.json();

        if (!resultado.exito || !resultado.datos || resultado.datos.length === 0) {
            contenedor.innerHTML = '<p class="text-slate-400 col-span-full text-center py-4">No hay documentos publicados por el momento.</p>';
            return;
        }

        contenedor.innerHTML = '';
        resultado.datos.forEach(doc => {
            // Un pequeño truco para ponerle el icono de PDF, Word o genérico según el link
            let iconClass = 'fa-file-pdf text-red-500';
            if(doc.archivo_url.toLowerCase().includes('.doc')) iconClass = 'fa-file-word text-blue-500';
            else if(doc.archivo_url.toLowerCase().includes('.xls')) iconClass = 'fa-file-excel text-green-500';

            contenedor.innerHTML += `
                <div class="glass-card p-5 rounded-2xl border border-slate-700 hover:border-blue-500 transition-colors flex items-center gap-4 group">
                    <div class="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                        <i class="fa-solid ${iconClass} text-2xl"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${doc.categoria || 'General'}</span>
                        <h4 class="text-white font-bold truncate">${doc.titulo}</h4>
                        <p class="text-xs text-slate-400 truncate">${doc.descripcion || 'Documento adjunto'}</p>
                    </div>
                    <a href="${doc.archivo_url}" target="_blank" title="Descargar" class="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors shrink-0">
                        <i class="fa-solid fa-download"></i>
                    </a>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error cargando documentos:", error);
    }
}

// ==========================================
//  NUEVO MÓDULO: FORMULARIOS E IFRAMES
// ==========================================
async function cargarFormularios() {
    const contenedor = document.getElementById('contenedor-formularios');
    if (!contenedor) return;

    try {
        const idConjunto = sessionStorage.getItem('copropiedad_id_publico');
        if (!idConjunto) return;

        const respuesta = await fetch(`/api/formularios?copropiedad_id=${idConjunto}`);
        const resultado = await respuesta.json();

        if (!resultado.exito || !resultado.datos || resultado.datos.length === 0) {
            contenedor.innerHTML = '<p class="text-slate-400 col-span-full text-center py-4">No hay encuestas activas por ahora.</p>';
            return;
        }

        contenedor.innerHTML = '';
        resultado.datos.forEach(form => {
            contenedor.innerHTML += `
                <div class="glass-card rounded-2xl border border-slate-700 overflow-hidden flex flex-col h-[500px]">
                    <div class="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center shrink-0">
                        <div>
                            <h4 class="text-white font-bold">${form.titulo}</h4>
                            <p class="text-xs text-slate-400">${form.descripcion || 'Completa el siguiente formulario'}</p>
                        </div>
                        <div class="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <i class="fa-solid fa-clipboard-check"></i>
                        </div>
                    </div>
                    <div class="flex-1 w-full bg-white relative">
                        <iframe src="${form.iframe_url}" class="absolute top-0 left-0 w-full h-full border-none" frameborder="0" marginheight="0" marginwidth="0">Cargando…</iframe>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error cargando formularios:", error);
    }
}

function aplicarPermisosPublicos() {
    const permisosStr = sessionStorage.getItem('permisos_saas');
    const permisos = permisosStr ? JSON.parse(permisosStr) : {};
    
    const secReservas = document.getElementById('seccion-reservas');
    const secMercado = document.getElementById('seccion-mercado');
    const secDocumentos = document.getElementById('seccion-documentos'); 
    const secFormularios = document.getElementById('seccion-formularios'); 

    if (secReservas) secReservas.style.display = permisos.reservas ? 'block' : 'none';
    if (secMercado) secMercado.style.display = permisos.mercado ? 'block' : 'none';
    if (secDocumentos) secDocumentos.style.display = permisos.documentos ? 'block' : 'none';
    if (secFormularios) secFormularios.style.display = permisos.formularios ? 'block' : 'none';
    
    
    return permisos; // Devolvemos los permisos para que el motor de arranque los use
}