import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function handler(req: NextRequest, res: NextResponse) {
  try {
    const token = await getToken({ req, secret: process.env.SECRET });
    if (!token) {
      console.warn("No JWT token found when calling /federated-logout endpoint");
      return NextResponse.redirect(process.env.NEXTAUTH_URL ?? "");
    }
    if (!token.id_token) console.warn("Without an id_token the user won't be redirected back from the IdP after logout.");
    const endsessionURL = `${process.env.PROVIDER_DOMAIN}/connect/endsession`;
    const endsessionParams = new URLSearchParams({
      id_token_hint: token.id_token,
      post_logout_redirect_uri: `${process.env.NEXTAUTH_URL}/Home/OidcSignOutCallback`,
    } as { [key: string]: string });
    // Clear the session token cookie
    cookies().delete("next-auth.session-token");
    return NextResponse.redirect(`${endsessionURL}?${endsessionParams}`);
  } catch (error) {
    console.error(error);
    NextResponse.redirect(process.env.NEXTAUTH_URL ?? "");
  }
}

export { handler as GET, handler as POST };
