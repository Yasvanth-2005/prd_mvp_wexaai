import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ApiError } from "@/lib/api";
import { serverAuthApi } from "@/lib/api-server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const { organization } = await serverAuthApi.me();

    return (
      <AppShell organizationName={organization.name}>{children}</AppShell>
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect("/login");
    }
    throw err;
  }
}
