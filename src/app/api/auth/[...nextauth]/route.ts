import NextAuth from "next-auth/next";

export default async function handler(req, res) {
  const providers = [
    {
      id: "wynnlogin",
      name: "wynnLogin",
      type: "oauth" as const,
      wellKnown: "https://login-intg.wynntesting.com/.well-known/openid-configuration",
      authorization: {
        url: "https://login-intg.wynntesting.com/connect/authorize",
        params: {
          scope: "openid",
          redirect_uri: "http://localhost:31234/api/auth/callback/wynnlogin",
          response_type: "code id_token",
          nonce: Math.random().toString(36).substring(7),
          grant_type: "authorization_code",
        },
      },
      idToken: true,
      //  checks: ["pkce", "state"],
      profile(profile: any) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
        };
      },
      clientId: process.env.WynnLogin_CLIENT_ID,
      clientSecret: process.env.WynnLogin_CLIENT_SECRET,
    },
    {
      id: "auth0",
      name: "auth0",
      type: "oauth" as const,
      wellKnown: "https://csnkarthik.auth0.com/.well-known/openid-configuration",
      authorization: { params: { scope: "openid email profile" } },
      idToken: true,
      //checks: ["pkce", "state"],
      profile(profile: any) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
        };
      },
      clientId: process.env.IdentityServer4_CLIENT_ID,
      clientSecret: process.env.IdentityServer4_CLIENT_SECRET,
    },
  ];
  for (const key in req) {
    console.log(`${key}:`, req[key], "nextAUTH- request");
  }
  for (const key in res) {
    console.log(`${key}:`, res[key], "nextAUTH - response");
  }
  return await NextAuth(req, res, {
    providers,
  });
}

export { handler as GET, handler as POST };
