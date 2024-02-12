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

    return NextResponse.redirect(
      new URL(
        `${process.env.PROVIDER_DOMAIN}/connect/endsession?${new URLSearchParams({
          id_token_hint: token.id_token as string,
          post_logout_redirect_uri: `${process.env.NEXTAUTH_URL}/Home/OidcSignOutCallback`,
        }).toString()}`
      ).toString()
    );
  } catch (error) {
    console.error(error);
    NextResponse.redirect(process.env.NEXTAUTH_URL ?? "");
  } finally {
    // Clear the session token cookie to signout user
    cookies().delete("next-auth.session-token");
    cookies().delete("next-auth.csrf-token");
  }
}

export { handler as GET, handler as POST };
