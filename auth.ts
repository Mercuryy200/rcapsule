// auth.ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const { auth, handlers, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          if (error || !data.user) {
            return null;
          }

          const { data: existingUser } = await supabase
            .from("User")
            .select("id, email, name, image")
            .eq("email", data.user.email!)
            .single();

          if (existingUser) {
            return {
              id: existingUser.id,
              email: existingUser.email,
              name: existingUser.name,
              image: existingUser.image,
            };
          }

          return {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || null,
            image: data.user.user_metadata?.image || null,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" || account?.provider === "google") {
        try {
          const { data: existingUser } = await supabase
            .from("User")
            .select("id, name, image")
            .eq("email", user.email!)
            .single();

          let userId: any;

          if (existingUser) {
            userId = existingUser.id;
            console.log(
              `Linking ${account.provider} account to existing user ${userId}`
            );

            if (!existingUser.name && user.name) {
              await supabase
                .from("User")
                .update({
                  name: user.name,
                  image: user.image,
                  updatedAt: new Date().toISOString(),
                })
                .eq("id", userId);
            }
          } else {
            userId = user.id;
            await supabase.from("User").insert({
              id: userId,
              email: user.email!,
              name: user.name,
              image: user.image,
              emailVerified: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }

          const { error: accountError } = await supabase.from("Account").upsert(
            {
              userId: userId,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refresh_token: account.refresh_token,
              access_token: account.access_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              session_state: account.session_state,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              onConflict: "provider,providerAccountId",
            }
          );

          if (accountError) {
            console.error("Error linking account:", accountError);
            return false;
          }

          user.id = userId;

          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      if (trigger === "update" && session) {
        token.name = session.user.name;
        token.picture = session.user.image;
        return token;
      }

      if (token.id) {
        try {
          const { data: userData } = await supabase
            .from("User")
            .select("name, image")
            .eq("id", token.id as string)
            .single();

          if (userData) {
            token.name = userData.name;
            token.picture = userData.image;
          }
        } catch (error) {
          console.error("Error fetching user data in JWT callback:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
});
