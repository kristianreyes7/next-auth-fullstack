import NextAuth from "next-auth/next";

export const authOptions = {
   providers : [
  //  {
  //     id: 'auth0',
  //     name: 'auth0',
  //     type: 'oauth' as const,
  //     version: '2.0',
  //     scope: 'profile openid email',
  //     params: { grant_type: 'authorization_code' },
  //     accessTokenUrl: process.env.IdentityServer4_Issuer + '/connect/token',
  //     requestTokenUrl: process.env.IdentityServer4_Issuer + '/connect/token',
  //     authorizationUrl: process.env.IdentityServer4_Issuer + '/connect/authorize?response_type=code id_token',
  //     profileUrl: process.env.IdentityServer4_Issuer + '/connect/userinfo',
  //     profile: (profile: any) => {
  //       return {
  //         id: profile.sub,
  //         name: profile.name,
  //         email: profile.email,
  //       }
  //     },
  //     clientId: process.env.IdentityServer4_CLIENT_ID,
  //     clientSecret: process.env.IdentityServer4_CLIENT_SECRET
  //   },
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
            email: profile.email          
          }
        },
        clientId: process.env.IdentityServer4_CLIENT_ID,
        clientSecret: process.env.IdentityServer4_CLIENT_SECRET
      }
   ]
};

const handler = NextAuth(authOptions)

export  {handler as GET, handler as POST}