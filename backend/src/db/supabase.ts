import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cargar variables de entorno. necesitas node 22 o superior para que ande esto.. sino bajate dotenv jaja
process.loadEnvFile();

// Configuración del cliente
const supabaseUrl: string = process.env.SUPABASE_URL as string;
const supabaseKey: string = process.env.SUPABASE_KEY as string;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is not set in .env.local');
}

if (!supabaseKey) {
  throw new Error('SUPABASE_KEY is not set in .env.local');
}

// Creación del cliente
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
