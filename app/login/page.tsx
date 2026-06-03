import { redirect } from "next/navigation";
import { auth, roleHome } from "@/lib/auth";
import { LoginForm } from "@/app/login/login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect(roleHome[session.user.role]);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(120deg,hsl(var(--secondary)),hsl(var(--background)))] p-4">
      <LoginForm />
    </main>
  );
}
