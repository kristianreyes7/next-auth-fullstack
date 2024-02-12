import { AuthOptions, NextAuthOptions, Session, TokenSet } from "next-auth";
import { JWT } from "next-auth/jwt";
import NextAuth from "next-auth/next";
import IdentityServer4Provider from "next-auth/providers/identity-server4";
import federatedLogout from "../federatedLogout";

export const authOptions: AuthOptions = {
  providers: [
    IdentityServer4Provider({
      id: "wynnlogin",
      name: "wynnlogin",
      issuer: process.env.IdentityServer4_Issuer,
      clientId: process.env.IdentityServer4_CLIENT_ID,
      clientSecret: process.env.IdentityServer4_CLIENT_SECRET,
      wellKnown: `${process.env.PROVIDER_DOMAIN}/.well-known/openid-configuration`,
      idToken: true,
      checks: ["none"],
      authorization: {
        params: {
          scope: "openid profile",
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/wynnlogin`,
          response_type: "code id_token",
          nonce: Math.random().toString(36).substring(7),
          response_mode: "form_post",
        },
      },
      token: {
        async request(context: any) {
          const formBody = createFormBody({
            redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/wynnlogin`,
            client_id: process.env.IdentityServer4_CLIENT_ID ?? "",
            client_secret: process.env.IdentityServer4_CLIENT_SECRET ?? "",
            code: context.params.code,
            grant_type: "authorization_code",
          });

          const tokensResponse = await fetch(`${process.env.PROVIDER_DOMAIN}/connect/token`, {
            method: "POST",
            body: formBody.toString(),
            headers: {
              "Content-type": "application/x-www-form-urlencoded",
            },
          });

          const response = async (): Promise<TokenSet> => {
            const token = await tokensResponse.json();
            return {
              access_token: token.access_token,
              refresh_token: token.refresh_token,
              id_token: token.id_token,
              token_type: token.token_type,
              expires_in: token.expires_in,
            };
          };
          const tokens = await response();
          return { tokens };
        },
      },
      userinfo: {
        async request(context: any) {
          const userResponse = await fetch(`${process.env.PROVIDER_DOMAIN}/connect/userinfo`, {
            headers: {
              Authorization: `Bearer ${context.tokens.access_token}`,
            },
          });
          const profile = await userResponse.json();
          return profile;
        },
      },
      profile(profile, tokens) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,

          image: profile.picture,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session, profile }) {
      if (trigger == "update") {
        return { ...token, ...session.user, ...profile };
      }
      return { ...token, ...user, ...profile };
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.user = token;
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url === "signOut") {
        await fetch(`${process.env.NEXTAUTH_URL}/api/auth/federated-logout`);
      }
      if (url.startsWith("/")) return new URL(url, baseUrl).toString();
      return baseUrl;
    },
  },
};

const handler = NextAuth({ ...authOptions } satisfies NextAuthOptions);

export { handler as GET, handler as POST };

function createFormBody<T extends Record<string, string | number>>(params: T): string {
  const formBody = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`)
    .join("&");
  return formBody;
}
