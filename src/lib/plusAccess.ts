import { getServerSession } from "next-auth";
import { supabase } from "@/lib/supabase";
import { authOptions } from "@/lib/auth";

/**
 * Helper server-side do gate ChordProof+.
 *
 * Regra de acesso (a MESMA do /api/plus-status e do usePlusAccess):
 *  - sem sessão             -> sem acesso
 *  - assinatura ativa       -> acesso
 *  - trial de 15 dias ativo -> acesso
 *
 * Usa a RPC SECURITY DEFINER get_plus_status porque users/subscriptions
 * têm RLS sem políticas e a anon key não passa por elas.
 */

export type PlusServerStatus = {
  email: string | null;
  signedIn: boolean;
  hasAccess: boolean;
  inTrial: boolean;
  trialEnd: string | null;
};

export async function getPlusStatus(): Promise<PlusServerStatus> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;

  if (!email) {
    return { email: null, signedIn: false, hasAccess: false, inTrial: false, trialEnd: null };
  }

  const { data, error } = await supabase.rpc("get_plus_status", { p_email: email });

  if (error) {
    // Falha fechada: sem conseguir confirmar o acesso, NÃO libera o recurso.
    console.error("getPlusStatus error:", error.message);
    return { email, signedIn: true, hasAccess: false, inTrial: false, trialEnd: null };
  }

  const status = typeof data === "string" ? JSON.parse(data) : data;

  return {
    email,
    signedIn: true,
    hasAccess: !!status?.hasAccess,
    inTrial: !!status?.inTrial,
    trialEnd: status?.trialEnd ?? null,
  };
}
