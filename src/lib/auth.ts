import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

/**
 * Só o Google está configurado. O provider do GitHub foi removido porque não
 * existe OAuth App criado: o botão aparecia na tela de login e, ao clicar,
 * devolvia erro. Quando as chaves GITHUB_CLIENT_ID/SECRET existirem, basta
 * reativar o provider e o botão em src/app/auth/signin/page.tsx.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({ session, token }) {
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
