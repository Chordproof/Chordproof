import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { supabase } from "@/lib/supabase";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/progress — quais acordes a conta realmente tocou.
 *
 * O e-mail vem SEMPRE da sessão, nunca da query: as rotas de setlists já
 * aceitaram `?email=` uma vez e isso deixava qualquer pessoa ler os dados de
 * outra. Aqui não há parâmetro nenhum para abusar.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  const { data, error } = await supabase.rpc("get_chord_progress", { p_email: email });
  if (error) {
    console.error("get_chord_progress:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const payload = typeof data === "string" ? JSON.parse(data) : data;

  return NextResponse.json({
    songsPracticed: payload?.songsPracticed ?? 0,
    chords: payload?.chords ?? [],
    /**
     * A INTERFACE PRECISA DESTE AVISO. Não existe medição de acerto: o sistema
     * sabe que a pessoa passou pelos acordes de uma música, não que ela os
     * fez soar. Sem dizer isso, "você domina D" seria invenção.
     */
    measured: "coverage",
    whatWeMeasure:
      "Which chords you passed through while playing a tab to the end of its progression. Not whether they sounded right.",
  });
}
