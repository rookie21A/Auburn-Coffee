import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Button, Field, Input } from "@/components/ui-kit";
import { track } from "@/lib/analytics";

type Mode = "signin" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign In or Create an Account — Auburn Coffee" },
      {
        name: "description",
        content:
          "Sign in to Auburn Coffee to track orders, save delivery addresses and reorder your favourite estate lots.",
      },
      { property: "og:title", content: "Sign In — Auburn Coffee" },
      { property: "og:description", content: "Track orders and save addresses." },
      { name: "twitter:title", content: "Sign In — Auburn Coffee" },
      { name: "twitter:description", content: "Track orders and save addresses." },
    ],
  }),
  component: AuthPage,
});

function safePath(path?: string) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/account";
  return path;
}

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", mobile: "", email: "", password: "" });

  useEffect(() => {
    if (user) navigate({ to: safePath(redirect) as never });
  }, [user, redirect, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { full_name: form.name, mobile: form.mobile },
          },
        });
        if (err) throw err;
        track("signup_completed", {});
        toast.success("Account created. Welcome to Auburn.");
      } else if (mode === "signin") {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (err) throw err;
        toast.success("Welcome back.");
      } else {
        const { error: err } = await supabase.auth.resetPasswordForEmail(form.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (err) throw err;
        toast.success("Password reset link sent. Check your inbox.");
        setMode("signin");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in didn't complete. Please try again or use your email.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: safePath(redirect) as never });
  }

  return (
    <div className="container-editorial max-w-md py-16 sm:py-24">
      <p className="eyebrow">Your account</p>
      <h1 className="mt-3 text-4xl">
        {mode === "signup" ? "Create an account" : mode === "forgot" ? "Reset password" : "Sign in"}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {mode === "signup"
          ? "Save addresses, follow your orders and reorder in a tap."
          : mode === "forgot"
            ? "We'll email you a secure link to set a new password."
            : "Welcome back to Auburn Coffee."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {mode === "signup" ? (
          <>
            <Field label="Full name" htmlFor="name" required>
              <Input
                id="name"
                value={form.name}
                autoComplete="name"
                required
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="Mobile number" htmlFor="mobile" required>
              <Input
                id="mobile"
                type="tel"
                inputMode="numeric"
                value={form.mobile}
                autoComplete="tel"
                required
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              />
            </Field>
          </>
        ) : null}

        <Field label="Email" htmlFor="email" required>
          <Input
            id="email"
            type="email"
            value={form.email}
            autoComplete="email"
            required
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>

        {mode !== "forgot" ? (
          <Field
            label="Password"
            htmlFor="password"
            required
            hint={mode === "signup" ? "At least 8 characters." : undefined}
          >
            <Input
              id="password"
              type="password"
              value={form.password}
              minLength={8}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Field>
        ) : null}

        {error ? (
          <p role="alert" className="border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" block size="lg" disabled={busy}>
          {busy
            ? "Please wait…"
            : mode === "signup"
              ? "Create account"
              : mode === "forgot"
                ? "Send reset link"
                : "Sign in"}
        </Button>
      </form>

      {mode !== "forgot" ? (
        <>
          <div className="my-6 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
            or
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
          </div>
          <Button variant="quiet" block size="lg" onClick={handleGoogle}>
            Continue with Google
          </Button>
        </>
      ) : null}

      <div className="mt-8 space-y-2 text-sm">
        {mode === "signin" ? (
          <>
            <p>
              New to Auburn?{" "}
              <button type="button" className="text-primary underline" onClick={() => setMode("signup")}>
                Create an account
              </button>
            </p>
            <p>
              <button type="button" className="text-primary underline" onClick={() => setMode("forgot")}>
                Forgot your password?
              </button>
            </p>
          </>
        ) : (
          <p>
            Already have an account?{" "}
            <button type="button" className="text-primary underline" onClick={() => setMode("signin")}>
              Sign in
            </button>
          </p>
        )}
        <p className="pt-2 text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <Link to="/terms" className="underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy-policy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
