export default async function handler(req, res) {
    const dominioOrigen = req.headers.host || "localhost"; 
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    try {
        const urlConsulta = `${SUPABASE_URL}/rest/v1/clientes_saas?dominio=eq.${dominioOrigen}&select=plan,copropiedades(id,nombre)`;
        
        const respuestaSupa = await fetch(urlConsulta, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });

        const clientes = await respuestaSupa.json();

        if (clientes && clientes.length > 0) {
            const miCliente = clientes[0]; 
            const idDelConjunto = (miCliente.copropiedades && miCliente.copropiedades.length > 0) ? miCliente.copropiedades[0].id : null;
            
            return res.status(200).json({
                exito: true,
                mensaje: "Cliente autorizado",
                plan: miCliente.plan,         
                copropiedad_id: idDelConjunto // <--- ESTO ES LO QUE NECESITAMOS QUE VERCEL LEA
            });
        } else {
            return res.status(200).json({ exito: false, mensaje: "Cliente no registrado", plan: "START", copropiedad_id: null });
        }
    } catch (error) {
        return res.status(500).json({ exito: false, mensaje: "Error del servidor", plan: "START" });
    }
}