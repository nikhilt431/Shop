import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login"
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: { id: true, name: true, email: true, passwordHash: true, role: true, status: true, branchId: true }
        });

        if (!user || user.status !== "ACTIVE") return null;

        const passwordIsValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!passwordIsValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          branchId: user.branchId
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: Role }).role;
        token.branchId = (user as { branchId?: string }).branchId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as Role;
        session.user.branchId = token.branchId as string | undefined;
      }
      return session;
    }
  }
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export const roleHome: Record<Role, string> = {
  SUPER_ADMIN: "/dashboard",
  RECEPTION: "/jobs/new",
  TECHNICIAN: "/technician/workbench",
  CUSTOMER: "/portal"
};
