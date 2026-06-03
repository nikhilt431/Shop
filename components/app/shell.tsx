import { LogOut, Moon, Search } from "lucide-react";
import { signOut } from "@/lib/auth";
import { AppNav } from "@/components/app/nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Role } from "@prisma/client";

export function AppShell({
  user,
  children
}: {
  user: { name?: string | null; email?: string | null; role: Role };
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="flex min-h-16 items-center gap-3 px-4 lg:px-6">
          <div className="mr-2 flex items-center gap-2 font-semibold">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">RP</div>
            <span>RepairPro Cloud</span>
          </div>
          <div className="hidden max-w-xl flex-1 md:block">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search tickets, customers, serial numbers, technicians" />
            </div>
          </div>
          <Button variant="ghost" size="icon" title="Dark mode">
            <Moon className="h-4 w-4" />
          </Button>
          <div className="hidden text-right text-sm sm:block">
            <div className="font-medium">{user.name}</div>
            <div className="text-muted-foreground">{user.role.replaceAll("_", " ")}</div>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <Button variant="outline" size="icon" title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
        <div className="border-t px-4 py-2 lg:hidden">
          <AppNav role={user.role} />
        </div>
      </header>
      <div className="grid lg:grid-cols-[250px_1fr]">
        <aside className="no-print hidden border-r p-4 lg:block">
          <AppNav role={user.role} />
        </aside>
        <main className="min-w-0 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
