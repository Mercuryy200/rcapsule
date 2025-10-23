import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const {auth, handlers, signIn, signOut} = NextAuth({
    providers: [GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        params: {
          prompt: "consent",  
          access_type: "offline",
          response_type: "code"
        }
      }
    })] ,
})
