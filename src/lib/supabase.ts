// src/lib/supabase.ts
//
// Cliente Supabase do SERVIDOR.
//
// SEGURANÇA — por que a chave muda por ambiente:
// A `NEXT_PUBLIC_SUPABASE_ANON_KEY` é pública (vai no HTML do site). Com ela o
// PostgREST aplica RLS e, como as tabelas de usuário só têm política de leitura,
// TODA escrita voltava 401: setlists, bookmarks, perfil, XP e activity nunca
// gravaram nada em produção.
//
// A `SUPABASE_SERVICE_ROLE_KEY` é secreta e ignora RLS. Ela só é usada se
// `typeof window === "undefined"`, ou seja, no servidor. No navegador o
// empacotador não encontra `SUPABASE_SERVICE_ROLE_KEY` (não tem prefixo
// NEXT_PUBLIC_), então o bundle do cliente continua saindo com a anon key.
//
// Enquanto a variável não existir no ambiente do servidor, cai para a anon —
// o deploy não muda nada e nada quebra. Com a chave configurada, as escritas
// passam a funcionar.
//
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const isServer = typeof window === "undefined";
const serviceKey = isServer ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined;

/** true quando este processo do servidor tem poder de escrita (service role). */
export const hasAdminKey = !!serviceKey;

export const supabase = createClient(url, serviceKey || anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
