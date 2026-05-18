import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SettingsForm } from "@/components/settings-form";
import { ApiError } from "@/lib/api";
import { serverSettingsApi } from "@/lib/api-server";

export default async function SettingsPage() {
  try {
    const settings = await serverSettingsApi.get();

    return (
      <div className="space-y-6 p-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organization preferences for inventory alerts
          </p>
        </div>

        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Low stock defaults</CardTitle>
            <CardDescription>
              Configure when products are flagged as low stock on your
              dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm
              initialThreshold={settings.defaultLowStockThreshold}
            />
          </CardContent>
        </Card>
      </div>
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      redirect("/login");
    }
    throw err;
  }
}
