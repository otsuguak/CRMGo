export default async function handler(req, res) {
    // 1. Vercel lee de qué dominio viene el usuario (ej: miconjunto.com)
    const dominioOrigen = req.headers.host || "localhost"; 

    // 2. Sacamos las llaves secretas de la caja fuerte de Vercel
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    try {
        // 3. Vamos a tu tabla maestra en Supabase a buscar este dominio
        const urlConsulta = `${SUPABASE_URL}/rest/v1/clientes_saas?dominio=eq.${dominioOrigen}&select=*`;
        
        const respuestaSupa = await fetch(urlConsulta, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        const clientes = await respuestaSupa.json();

        // 4. Revisamos si el cliente existe en tu tabla
        if (clientes && clientes.length > 0) {
            const miCliente = clientes[0]; // Tomamos los datos del conjunto
            
            return res.status(200).json({
                exito: true,
                mensaje: "Cliente autorizado",
                plan: miCliente.plan,         // "START", "PRO" o "MASTER"
                bd_url: miCliente.bd_url      // La ruta a su base de datos
            });
        } else {
            // Si el dominio no está registrado en tu tabla, le damos START por defecto
            return res.status(200).json({
                exito: true,
                mensaje: "Cliente no registrado",
                plan: "START"
            });
        }

    } catch (error) {
        console.error("Error conectando a Supabase:", error);
        return res.status(500).json({ exito: false, mensaje: "Error del servidor" });
    }
}