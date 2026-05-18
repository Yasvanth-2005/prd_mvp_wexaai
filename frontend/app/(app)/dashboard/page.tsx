import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api";
import { serverAuthApi } from "@/lib/api-server";

export default async function DashboardPage() {
  try {
    const { organization } = await serverAuthApi.me();
    return (
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Signed in to {organization.name}. Full dashboard UI ships in the next
          phase.
        </p>
      </div>
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect("/login");
    }
    throw err;
  }
}
