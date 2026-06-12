import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wkuhwajoebdfntcokilx.supabase.co';
const ANON_KEY = 'sb_publishable_3G7eC0rb4fcGHQKzq6qidQ_54IkDdtM';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  // Verificar quien es el usuario a partir de su token
  const supabaseAuth = createClient(SUPABASE_URL, ANON_KEY);
  const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);

  if (userError || !user) {
    return res.status(401).json({ error: 'Token invalido' });
  }

  // Borrar el usuario con la clave de servicio (admin)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return res.status(500).json({ error: 'Falta configuracion del servidor' });
  }

  const supabaseAdmin = createClient(SUPABASE_URL, serviceKey);
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    return res.status(500).json({ error: deleteError.message });
  }

  return res.status(200).json({ success: true });
}
