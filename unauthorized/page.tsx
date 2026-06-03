import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold">Access unavailable</h1>
        <p className="mt-2 text-muted-foreground">Your account does not have permission to open that workspace area.</p>
        <Button asChild className="mt-6">
          <Link href="/">Go back</Link>
        </Button>
      </div>
    </main>
  );
}
