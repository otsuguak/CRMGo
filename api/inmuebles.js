export default async function handler(req, res) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    if (req.method === 'GET') {
        try {
            // 1. El portero de Vercel exige el carnet (ID del conjunto)
            const idConjunto = req.query.copropiedad_id;

            if (!idConjunto) {
                return res.status(401).json({ exito: false, mensaje: "Falta ID de copropiedad" });
            }

            // 2. Vamos a Supabase y filtramos SOLO los inmuebles de ese conjunto
            // Le pongo un límite de 4 para que sean solo los "destacados" de la portada
            const urlConsulta = `${SUPABASE_URL}/rest/v1/inmuebles?copropiedad_id=eq.${idConjunto}&select=*&limit=4`;
            
            const respuestaSupa = await fetch(urlConsulta, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });

            const inmuebles = await respuestaSupa.json();
            
            // 3. Devolvemos los inmuebles limpios y seguros
            return res.status(200).json({ exito: true, datos: inmuebles });

        } catch (error) {
            return res.status(500).json({ exito: false, mensaje: "Error del servidor" });
        }
    }
}