import { redirect } from "next/navigation";
import { auth, roleHome } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();
  redirect(session?.user ? roleHome[session.user.role] : "/login");
}
