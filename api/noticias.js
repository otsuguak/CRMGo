// Archivo: api/noticias.js
export default async function handler(req, res) {
    // 1. Sacamos las llaves de la caja fuerte de Vercel
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    if (req.method === 'GET') {
        try {
            // Así le decimos a Vercel que traiga máximo 8 noticias ordenadas por 'fecha'
            const urlConsulta = `${SUPABASE_URL}/rest/v1/noticias?select=*&order=fecha.desc&limit=8`;
            
            const respuestaSupa = await fetch(urlConsulta, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });

            const noticias = await respuestaSupa.json();

            // 3. Vercel le entrega las noticias limpias a tu página web
            return res.status(200).json({ exito: true, datos: noticias });

        } catch (error) {
            console.error("Error trayendo noticias:", error);
            return res.status(500).json({ exito: false, mensaje: "Error del servidor" });
        }
    }
}