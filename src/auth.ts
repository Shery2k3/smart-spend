import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import User from "@/app/models/User";
import dbConnect from "@/app/lib/dbConnect";
import Category from "./app/models/Category";

declare module "next-auth" {
  interface Session {
    user: {
      userId: string;
      name?: string;
      email?: string;
    } & DefaultSession["user"];
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        prompt: "consent",
        accessType: "offline",
        response_type: "code",
      },
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await dbConnect();

        // password has `select: false`, so it must be explicitly requested
        const user = await User.findOne({ email: credentials.email }).select(
          "+password",
        );

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isValid) return null;

        return {
          id: user.userId,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ profile, user, account }) {
      // Only run the Google-specific "create user + default categories" flow for Google sign-ins
      if (account?.provider === "google") {
        await dbConnect();
        const existingUser = await User.findOne({ userId: profile?.sub });

        if (!existingUser) {
          await User.create({
            userId: profile?.sub,
            name: profile?.name,
            email: profile?.email,
            currency: "USD",
          });

          await Category.create([
            {
              userId: profile?.sub,
              categoryName: "Shopping",
              totalSpend: 0,
              budget: 500,
              transactionCount: 0,
              color: "#E5FF70",
            },
            {
              userId: profile?.sub,
              categoryName: "Food",
              totalSpend: 0,
              budget: 500,
              transactionCount: 0,
              color: "#70cbff",
            },
            {
              userId: profile?.sub,
              categoryName: "Transportation",
              totalSpend: 0,
              budget: 500,
              transactionCount: 0,
              color: "#ffd470",
            },
            {
              userId: profile?.sub,
              categoryName: "Healthcare",
              totalSpend: 0,
              budget: 500,
              transactionCount: 0,
              color: "#ff8170",
            },
            {
              userId: profile?.sub,
              categoryName: "Health",
              totalSpend: 0,
              budget: 0,
              transactionCount: 0,
              color: "#FF00FF",
            },
          ]);
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.userId = token.sub;
      }
      return session;
    },
    async jwt({ token, profile, account }) {
      if (account?.provider === "google" && profile?.sub) {
        token.sub = profile.sub;
      }
      return token;
    },
  },
});
