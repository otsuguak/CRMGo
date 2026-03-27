// api/zonas.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    const { copropiedad_id } = req.query;

    if (!copropiedad_id) {
        return res.status(400).json({ exito: false, mensaje: "Falta el ID" });
    }

    try {
        const { data, error } = await supabase
            .from('zonas_comunes')
            .select('*')
            .eq('copropiedad_id', copropiedad_id);

        if (error) throw error;

        return res.status(200).json({ exito: true, datos: data });
    } catch (err) {
        return res.status(500).json({ exito: false, mensaje: err.message });
    }
}