export default async function handler(req, res) {
    const dominioOrigen = req.headers.host || "localhost"; 
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    try {
        // ACTUALIZACIÓN: Ahora pedimos explícitamente los campos mod_...
        const columnas = "plan,mod_zonas,mod_reservas,mod_mercado,mod_exportar,mod_documentos,copropiedades(id,nombre)";
        const urlConsulta = `${SUPABASE_URL}/rest/v1/clientes_saas?dominio=eq.${dominioOrigen}&select=${columnas}`;
        
        const respuestaSupa = await fetch(urlConsulta, {
            headers: { 
                'apikey': SUPABASE_KEY, 
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const clientes = await respuestaSupa.json();

        if (clientes && clientes.length > 0) {
            const miCliente = clientes[0]; 
            const idDelConjunto = (miCliente.copropiedades) ? miCliente.copropiedades.id : null;
            
            // Enviamos TODO el paquete de permisos a la página
            return res.status(200).json({
                exito: true,
                copropiedad_id: idDelConjunto,
                plan: miCliente.plan,
                // Estos son los que leen tus interruptores de la BD
                mod_zonas: miCliente.mod_zonas,
                mod_reservas: miCliente.mod_reservas,
                mod_mercado: miCliente.mod_mercado,
                mod_exportar: miCliente.mod_exportar,
                mod_documentos: miCliente.mod_documentos
            });
        } else {
            return res.status(200).json({ 
                exito: false, 
                mensaje: "Cliente no registrado", 
                plan: "STAR", 
                copropiedad_id: null,
                mod_documentos: true // Por defecto dejamos lo básico
            });
        }
    } catch (error) {
        console.error("Error en API Login:", error);
        return res.status(500).json({ exito: false, mensaje: "Error del servidor" });
    }
}