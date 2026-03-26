export default async function handler(req, res) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    if (req.method === 'GET') {
        try {
            // Exigimos el carnet
            const idConjunto = req.query.copropiedad_id;

            if (!idConjunto) {
                return res.status(401).json({ exito: false, mensaje: "Falta ID de copropiedad" });
            }

            // Buscamos solo las noticias de ESE conjunto
            const urlConsulta = `${SUPABASE_URL}/rest/v1/noticias?copropiedad_id=eq.${idConjunto}&select=*&order=fecha.desc&limit=8`;
            
            const respuestaSupa = await fetch(urlConsulta, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });

            const noticias = await respuestaSupa.json();
            return res.status(200).json({ exito: true, datos: noticias });

        } catch (error) {
            return res.status(500).json({ exito: false, mensaje: "Error del servidor" });
        }
    }
}