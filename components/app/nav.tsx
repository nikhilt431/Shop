import Link from "next/link";
import { Role } from "@prisma/client";
import { BarChart3, Boxes, ClipboardList, FileText, Home, Users, Wrench, Receipt, Bell, Settings, Tags } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home, roles: ["SUPER_ADMIN", "RECEPTION"] },
  { href: "/customers", label: "Customers", icon: Users, roles: ["SUPER_ADMIN", "RECEPTION"] },
  { href: "/jobs", label: "Repair Jobs", icon: ClipboardList, roles: ["SUPER_ADMIN", "RECEPTION", "TECHNICIAN"] },
  { href: "/technicians", label: "Technicians", icon: Wrench, roles: ["SUPER_ADMIN"] },
  { href: "/inventory", label: "Inventory", icon: Boxes, roles: ["SUPER_ADMIN", "TECHNICIAN"] },
  { href: "/billing", label: "Billing", icon: Receipt, roles: ["SUPER_ADMIN", "RECEPTION"] },
  { href: "/notifications", label: "Notifications", icon: Bell, roles: ["SUPER_ADMIN"] },
  { href: "/categories", label: "Categories", icon: Tags, roles: ["SUPER_ADMIN"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["SUPER_ADMIN"] },
  { href: "/reports", label: "Reports", icon: BarChart3, roles: ["SUPER_ADMIN"] },
  { href: "/portal", label: "My Repairs", icon: FileText, roles: ["CUSTOMER"] }
] as Array<{ href: string; label: string; icon: React.ComponentType<{ className?: string }>; roles: Role[] }>;

export function AppNav({ role, className }: { role: Role; className?: string }) {
  return (
    <nav className={cn("flex gap-1 overflow-x-auto lg:flex-col", className)}>
      {navItems
        .filter((item) => item.roles.includes(role))
        .map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">{item.label}</span>
          </Link>
        ))}
    </nav>
  );
}
