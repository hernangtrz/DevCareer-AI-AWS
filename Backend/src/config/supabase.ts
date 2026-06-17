import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("⚠️ Advertencia: Falta SUPABASE_URL o SUPABASE_SERVICE_KEY en las variables de entorno.");
}

export const supabase = createClient(
  supabaseUrl || "",
  supabaseServiceKey || ""
);
