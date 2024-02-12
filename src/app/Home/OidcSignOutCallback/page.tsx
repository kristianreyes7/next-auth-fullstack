import { redirect } from "next/navigation";
// only needed for PostLogoutRedirectUris
export default function page() {
  return redirect(process.env.NEXTAUTH_URL ?? "");
}
