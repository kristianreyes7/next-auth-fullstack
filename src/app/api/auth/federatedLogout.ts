// /api/auth/federated-logout
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "next-auth/jwt";
import { redirect } from "next/navigation";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = await jwt.getToken({ req, secret: process.env.SECRET });
    if (!token) {
      console.warn("No JWT token found when calling /federated-logout endpoint");
      return redirect(process.env.NEXTAUTH_URL ?? "");
    }
    if (!token.idToken) console.warn("Without an id_token the user won't be redirected back from the IdP after logout.");

    const endsessionURL = `https://${process.env.PROVIDER_DOMAIN}/connect/endsession`;
    const endsessionParams = new URLSearchParams({
      id_token_hint: token.idToken,
      post_logout_redirect_uri: process.env.NEXTAUTH_URL,
    } as { [key: string]: string });
    return redirect(`${endsessionURL}?${endsessionParams}`);
  } catch (error) {
    console.error(error);
    redirect(process.env.NEXTAUTH_URL ?? "");
  }
}
