"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authApi } from "@/lib/api-client";
import { ApiError } from "@/lib/api";

type AuthMode = "login" | "signup";

interface AuthFormProps {
  mode: AuthMode;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isSignup = mode === "signup";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignup) {
        await authApi.signup({
          email,
          password,
          confirmPassword,
          organizationName,
        });
      } else {
        await authApi.login({ email, password });
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{isSignup ? "Create your account" : "Welcome back"}</CardTitle>
        <CardDescription>
          {isSignup
            ? "Start managing inventory for your organization."
            : "Sign in to your StockFlow workspace."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {isSignup ? (
            <FormField id="organizationName" label="Organization name">
              <Input
                id="organizationName"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="My Test Store"
                required
                autoComplete="organization"
              />
            </FormField>
          ) : null}

          <FormField id="email" label="Email">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </FormField>

          <FormField id="password" label="Password">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignup ? "At least 8 characters" : "Your password"}
              required
              minLength={isSignup ? 8 : 1}
              autoComplete={isSignup ? "new-password" : "current-password"}
            />
          </FormField>

          {isSignup ? (
            <FormField id="confirmPassword" label="Confirm password">
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </FormField>
          ) : null}

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t-0 bg-transparent">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {isSignup ? "Already have an account?" : "Need an account?"}{" "}
            <Link
              href={isSignup ? "/login" : "/signup"}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {isSignup ? "Log in" : "Sign up"}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
