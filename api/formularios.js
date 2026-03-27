// api/formularios.js
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

            // 2. Buscamos en Supabase (Solo los que tengan activo = true)
            const urlConsulta = `${SUPABASE_URL}/rest/v1/formularios_externos?copropiedad_id=eq.${idConjunto}&activo=eq.true&select=*&order=created_at.desc`;
            
            const respuestaSupa = await fetch(urlConsulta, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });

            const formularios = await respuestaSupa.json();
            
            // 3. Devolvemos la data limpia
            return res.status(200).json({ exito: true, datos: formularios });

        } catch (error) {
            return res.status(500).json({ exito: false, mensaje: "Error del servidor" });
        }
    } else {
        return res.status(405).json({ exito: false, mensaje: "Método no permitido" });
    }
}