import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import { authOptions } from "./authOptions";

const handler = NextAuth({ ...authOptions } satisfies NextAuthOptions);

export { handler as GET, handler as POST };
