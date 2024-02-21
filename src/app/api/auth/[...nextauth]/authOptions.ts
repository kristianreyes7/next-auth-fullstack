import { TokenSet, AuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import IdentityServer4Provider from "next-auth/providers/identity-server4";

function createFormBody<T extends Record<string, string | number>>(params: T): string {
  const formBody = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`)
    .join("&");
  return formBody;
}

async function getProviderToken(code: string) {
  const formBody = createFormBody({
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/wynnlogin`,
    client_id: process.env.IdentityServer4_CLIENT_ID ?? "",
    client_secret: process.env.IdentityServer4_CLIENT_SECRET ?? "",
    code: code,
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

  return await response();
}

async function getProfile(tokens: TokenSet) {
  const userResponse = await fetch(`${process.env.PROVIDER_DOMAIN}/connect/userinfo`, {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
    },
  });
  return await userResponse.json();
}

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
          const tokens = await getProviderToken(context.params.code);
          return { tokens };
        },
      },
      userinfo: {
        async request(context: any) {
          const profile = await getProfile(context.tokens);
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
  session: {
    strategy: "jwt",
  },

  cookies: {
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'None',
        path: '/',
        secure: false,
        // domain: ".wynntesting.com"
      }
    },
  },

  callbacks: {
    async jwt({ token, user, trigger, session, profile, account }) {
      if (trigger == "update") {
        return { ...token, ...session.user, ...profile, ...account };
      }
      return { ...token, ...user, ...profile, ...account };
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.user = token;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  // pages: {
  //   signIn: "/api/auth/signin"
  // },
};
