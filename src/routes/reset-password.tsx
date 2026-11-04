import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button, Field, Input } from "@/components/ui-kit";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a New Password — Auburn Coffee" },
      { name: "description", content: "Choose a new password for your Auburn Coffee account." },
      { property: "og:title", content: "Set a New Password — Auburn Coffee" },
      { property: "og:description", content: "Choose a new password for your account." },
      { name: "twitter:title", content: "Set a New Password — Auburn Coffee" },
      { name: "twitter:description", content: "Choose a new password for your account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    toast.success("Password updated.");
    navigate({ to: "/account" });
  }

  return (
    <div className="container-editorial max-w-md py-16 sm:py-24">
      <p className="eyebrow">Account security</p>
      <h1 className="mt-3 text-4xl">Set a new password</h1>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <Field label="New password" htmlFor="new-password" required hint="At least 8 characters.">
          <Input
            id="new-password"
            type="password"
            minLength={8}
            required
            value={password}
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Button type="submit" block size="lg" disabled={busy}>
          {busy ? "Saving…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
