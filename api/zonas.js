export default async function handler(req, res) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    if (req.method === 'GET') {
        try {
            // 1. Pedimos el carnet de seguridad
            const idConjunto = req.query.copropiedad_id;

            if (!idConjunto) {
                return res.status(401).json({ exito: false, mensaje: "Falta ID de copropiedad" });
            }

            // 2. Armamos la ruta exacta como en tus otros archivos
            const urlConsulta = `${SUPABASE_URL}/rest/v1/zonas_comunes?copropiedad_id=eq.${idConjunto}&select=*`;
            
            const respuestaSupa = await fetch(urlConsulta, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });

            const zonas = await respuestaSupa.json();
            
            // 3. Devolvemos la data limpia
            return res.status(200).json({ exito: true, datos: zonas });

        } catch (error) {
            return res.status(500).json({ exito: false, mensaje: "Error del servidor" });
        }
    }
}