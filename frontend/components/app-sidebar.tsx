import Link from "next/link";
import { LayoutDashboard, Package, Settings } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

interface AppSidebarProps {
  organizationName: string;
  currentPath: string;
}

export function AppSidebar({
  organizationName,
  currentPath,
}: AppSidebarProps) {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r bg-card">
      <div className="border-b px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          StockFlow
        </p>
        <p className="mt-1 truncate text-sm font-semibold">{organizationName}</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            currentPath === href || currentPath.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <LogoutButton />
      </div>
    </aside>
  );
}

