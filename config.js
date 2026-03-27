// ==========================================
// CONFIGURACIÓN GLOBAL DEL SAAS LUMENGROUP
// ==========================================

window.CONFIG_SAAS = {
    // Aquí defines qué módulos se prenden (true) o se apagan (false) en cada plan
    // El plan más básico: No tiene reservas ni mercado
    "STAR": { 
        zonas: false, 
        reservas: false, 
        mercado: false, 
        documentos: true, 
        formularios: true, 
        noticias: true, 
        portada: true,
        exportar: false,
        salas: false
    },
    // El plan intermedio: Tiene reservas pero no mercado inmobiliario
    "PRO": { 
        zonas: true, 
        reservas: true, 
        mercado: false, 
        documentos: true, 
        formularios: true, 
        noticias: true,
        portada: true,
        exportar: false,
        salas: false
    },
    // El plan premium: Tiene todo encendido
    "MASTER": { 
        zonas: true, 
        reservas: true, 
        mercado: true, 
        documentos: true, 
        formularios: true, 
        noticias: true, 
        portada: true,
        exportar: true,
        salas: true 
    }
};
};