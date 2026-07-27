import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { User } from "next-auth";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

// Extend User type to include our custom flag
declare module "next-auth" {
  interface User {
    _exists?: boolean;
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        try {
          const res = await fetch(`${process.env.BACKEND_URL ?? "http://localhost:8000"}/api/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          });
          
          if (res.ok) {
            const user = await res.json();
            return {
              id: user.id,
              email: user.email,
              name: user.name
            };
          }
          const err = await res.json().catch(() => null);
          throw new Error(err?.detail || "Invalid login credentials.");
        } catch (e) {
          throw new Error(e instanceof Error ? e.message : "Unable to complete request.");
        }
      }
    })
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async signIn({ user, account }) {
      // For Google OAuth, check if user exists in database
      if (account?.provider === "google" && user?.email) {
        try {
          const res = await fetch(`${BACKEND_URL}/api/v1/auth/lookup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email }),
          });
          
          if (res.ok) {
            const data = await res.json();
            // If user exists, set flag for session/jwt callbacks
            if (data.exists) {
              user._exists = true;
              // Don't redirect here - let the profile page handle it
            }
          }
        } catch (e) {
          console.error("Failed to check user existence:", e);
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // If URL contains existing-user flag, redirect to home
      if (url.includes("existing-user=true")) {
        return baseUrl;
      }
      
      // If coming from signup flow with source=signup, check if user exists
      if (url.includes("source=signup")) {
        // Extract email from URL if present (it won't be, we need to check session)
        // Since we can't access session here, we'll let the profile page handle the redirect
        // But we should remove the source=signup parameter
        return url.replace(/[?&]source=signup/, "");
      }
      
      if (url === baseUrl || url === `${baseUrl}/`) {
        return baseUrl;
      }
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
    async jwt({ token, user }) {
      // Pass user existence flag to token
      if (user?._exists !== undefined) {
        token._exists = user._exists;
      }
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.id;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        // Pass existence flag to session
        if (token._exists !== undefined) {
          (session.user as Record<string, unknown>)._exists = token._exists;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
