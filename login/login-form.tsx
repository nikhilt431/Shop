"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/app/login/actions";

function SubmitButton() {
  const status = useFormStatus();
  return <Button className="w-full">{status.pending ? "Signing in..." : "Sign in"}</Button>;
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, { error: null });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="mb-3 grid h-11 w-11 place-items-center rounded-md bg-primary text-primary-foreground">
          <Wrench className="h-5 w-5" />
        </div>
        <CardTitle>RepairPro Cloud</CardTitle>
        <CardDescription>Secure repair shop operations for staff, technicians, and customers.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue="admin@repairpro.local" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" defaultValue="Password123!" required />
          </div>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <SubmitButton />
        </form>
        <div className="mt-5 rounded-md bg-muted p-3 text-xs text-muted-foreground">
          Demo roles use `Password123!`: admin, reception, tech, and customer at `@repairpro.local`.
        </div>
      </CardContent>
    </Card>
  );
}
