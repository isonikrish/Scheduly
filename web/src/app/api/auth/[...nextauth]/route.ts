import { prisma } from "@/lib/prisma";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }

      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          // Create new user
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name ?? "Guest",
              image: user.image,
            },
          });
        }
      } catch (error) {
        return false;
      }

      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET ?? "secret",
});

export { handler as GET, handler as POST };
