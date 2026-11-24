import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/health/supabase — diagnóstico do acesso ao banco.
 *
 * Responde apenas BOOLEANOS e o tipo de chave em uso. Nunca devolve chave,
 * e-mail, contagem de usuários nem qualquer dado de cliente.
 *
 * `privateReadOk` é o teste que realmente importa: `users` tem RLS ligado e
 * NENHUMA política, então a anon key lê vazio. Só a service role vê linhas.
 * Se der true, a chave existe E é válida.
 */
export async function GET() {
  const keyType = process.env.SUPABASE_SERVICE_ROLE_KEY ? "service-role" : "anon";

  const { data, error } = await supabase.from("users").select("id").limit(1);

  return NextResponse.json({
    keyType,
    privateReadOk: !error && Array.isArray(data) && data.length > 0,
    rlsError: error ? error.code || "error" : null,
  });
}
