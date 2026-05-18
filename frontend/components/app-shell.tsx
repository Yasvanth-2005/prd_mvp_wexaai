"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";

interface AppShellProps {
  organizationName: string;
  children: React.ReactNode;
}

export function AppShell({ organizationName, children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-full flex-1">
      <AppSidebar organizationName={organizationName} currentPath={pathname} />
      <main className="flex-1 overflow-auto bg-background">{children}</main>
    </div>
  );
}
