import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase do SERVIDOR.
 *
 * Por que existe: a `NEXT_PUBLIC_SUPABASE_ANON_KEY` é pública (vai no HTML do
 * site). Com ela o PostgREST aplica RLS e, como as tabelas de usuário não têm
 * política de INSERT, TODA escrita voltava 401 — setlists, bookmarks, perfil,
 * XP e activity nunca gravaram nada em produção.
 *
 * A `SUPABASE_SERVICE_ROLE_KEY` é secreta, só vive no servidor e ignora RLS.
 * NUNCA importe este módulo de um componente "use client" — o bundler jogaria
 * a chave para o navegador. Ele só pode ser usado em route handlers, server
 * components e código que eles importam.
 *
 * Enquanto a variável não existir no ambiente, cai para a anon (comportamento
 * antigo): o deploy não muda nada e nada quebra. Assim que a chave entrar na
 * Vercel, o próximo deploy já escreve de verdade.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** true quando o servidor tem poder de escrita (service role presente). */
export const hasAdminKey = !!serviceKey;

if (!serviceKey) {
  // Só a AUSÊNCIA vai para o log — nunca o valor da chave.
  console.warn(
    "[supabase-admin] SUPABASE_SERVICE_ROLE_KEY ausente — usando anon key; escritas seguirão bloqueadas por RLS."
  );
}

export const supabaseAdmin = createClient(url, serviceKey || anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
