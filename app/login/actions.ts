"use server";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, auth, roleHome } from "@/lib/auth";

export type LoginState = { error: string | null };

export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false
    });
  } catch (error) {
    if (error instanceof AuthError) { return { error: "Invalid email or password." }; }
    throw error;
  }
  const session = await auth();
  redirect(session?.user ? roleHome[session.user.role] : "/dashboard");
}
