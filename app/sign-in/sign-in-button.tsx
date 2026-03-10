"use client";

import { Slack } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignInButton() {
  const isDev = process.env.NODE_ENV !== "production";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDevSignIn() {
    setLoading(true);
    setError(null);
    const email = "dev@example.com";
    const password = "dev-password";

    try {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) {
        const signUp = await authClient.signUp.email({
          email,
          password,
          name: "Dev User",
        });
        if (signUp.error) {
          setError("Failed to create dev account.");
          setLoading(false);
          return;
        }
        const retry = await authClient.signIn.email({ email, password });
        if (retry.error) {
          setError("Failed to sign in after creating account.");
          setLoading(false);
          return;
        }
      }
      window.location.href = "/";
    } catch {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  }

  async function handleSlackSignIn() {
    setError(null);
    try {
      await authClient.signIn.social({
        provider: "slack",
        callbackURL: "/",
      });
    } catch {
      setError("Failed to start Slack sign-in.");
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}
      <Button className="w-full" onClick={handleSlackSignIn}>
        <Slack className="mr-2 h-4 w-4" />
        Sign in with Slack
      </Button>
      {isDev && (
        <Button
          className="w-full"
          disabled={loading}
          onClick={handleDevSignIn}
          variant="outline"
        >
          {loading ? "Signing in..." : "Dev Sign In (local only)"}
        </Button>
      )}
    </div>
  );
}
