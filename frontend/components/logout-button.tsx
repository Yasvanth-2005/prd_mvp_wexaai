"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api-client";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await authApi.logout();
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full justify-center gap-2"
      onClick={handleLogout}
      disabled={loading}
    >
      <LogOut className="size-4 shrink-0" />
      {loading ? "Logging out…" : "Log out"}
    </Button>
  );
}
