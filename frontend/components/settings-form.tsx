"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { settingsApi } from "@/lib/api-client";
import { ApiError } from "@/lib/api";

interface SettingsFormProps {
  initialThreshold: number;
}

export function SettingsForm({ initialThreshold }: SettingsFormProps) {
  const [threshold, setThreshold] = useState(String(initialThreshold));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const value = Number(threshold);
    if (!Number.isInteger(value) || value < 0) {
      const message = "Threshold must be a whole number zero or greater";
      setError(message);
      toast.error(message);
      return;
    }

    setLoading(true);
    try {
      await settingsApi.update(value);
      toast.success("Settings saved successfully");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <FormField
        id="defaultLowStockThreshold"
        label="Default low stock threshold"
      >
        <Input
          id="defaultLowStockThreshold"
          type="number"
          min={0}
          step={1}
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          required
        />
      </FormField>
      <p className="text-sm text-muted-foreground">
        Used when a product has no low-stock threshold set. Products at or
        below this quantity appear in the dashboard low-stock list.
      </p>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}
