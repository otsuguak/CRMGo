// ==========================================
// CONFIGURACIÓN GLOBAL DEL SAAS LUMENGROUP
// ==========================================

const CONFIG_SAAS = {
    // Aquí defines qué módulos se prenden (true) o se apagan (false) en cada plan
    "START": { 
        mercado: false, 
        reservas: false, 
        salas: false 
    },
    "PRO": { 
        mercado: false, 
        reservas: true,  
        salas: true 
    },
    "MASTER": { 
        mercado: true,  
        reservas: true,  
        salas: true 
    }
};