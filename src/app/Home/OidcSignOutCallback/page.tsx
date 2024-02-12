import { redirect } from "next/navigation";

export default function page() {
  return redirect(process.env.NEXTAUTH_URL ?? "");
}
