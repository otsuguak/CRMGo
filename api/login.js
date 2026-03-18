export default function handler(req, res) {
    // 1. Vercel lee automáticamente de qué dominio viene la petición
    const dominioOrigen = req.headers.host || "localhost"; 

    // 2. NUESTRA TABLA MAESTRA (Aquí dices qué compró cada cliente)
    const clientesSaaS = {
        "127.0.0.1:5500": { nombre: "Conjunto Pruebas Local", plan: "START", bd: "SHEETS" },
        "localhost:5500": { nombre: "Torre de Antaño", plan: "PRO", bd: "SHEETS" },
        "misitio.vercel.app": { nombre: "Altos de la Colina", plan: "MASTER", bd: "SUPABASE" }
    };

    // 3. Buscamos si el dominio existe en tu lista
    const cliente = clientesSaaS[dominioOrigen];

    // 4. Respondemos a tu página web
    if (cliente) {
        return res.status(200).json({
            exito: true,
            mensaje: "Cliente autorizado",
            datos: cliente
        });
    } else {
        // Si entra un dominio que no ha pagado, le damos el plan básico por defecto o lo bloqueamos
        return res.status(200).json({
            exito: true,
            mensaje: "Cliente no registrado, usando plan por defecto",
            datos: { nombre: "Nuevo Cliente", plan: "START", bd: "SHEETS" }
        });
    }
}