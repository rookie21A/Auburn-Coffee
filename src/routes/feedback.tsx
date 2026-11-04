import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { db, queries } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button, Field, Input, Stars, Textarea } from "@/components/ui-kit";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Customer Feedback & Reviews — Auburn Coffee" },
      {
        name: "description",
        content:
          "Read what Auburn Coffee customers say, and share your own feedback on the coffee, packaging and delivery.",
      },
      { property: "og:title", content: "Feedback — Auburn Coffee" },
      { property: "og:description", content: "Reviews from Auburn Coffee customers across India." },
      { name: "twitter:title", content: "Feedback — Auburn Coffee" },
      { name: "twitter:description", content: "Reviews from Auburn Coffee customers." },
    ],
    links: [{ rel: "canonical", href: "/feedback" }],
  }),
  component: Feedback,
});

function Feedback() {
  const { user } = useAuth();
  const reviews = useQuery(queries.approvedReviews());
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: "",
    contact: "",
    order_reference: "",
    rating: 5,
    feedback: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const e2: Record<string, string> = {};
    if (form.name.trim().length < 2) e2.name = "Please enter your name.";
    if (form.feedback.trim().length < 10) e2.feedback = "Please tell us a little more.";
    setErrors(e2);
    if (Object.keys(e2).length) return;

    setBusy(true);
    const { error } = await db.from("reviews").insert({
      name: form.name,
      contact: form.contact || null,
      order_reference: form.order_reference || null,
      rating: form.rating,
      feedback: form.feedback,
      approved: false,
      user_id: user?.id ?? null,
    });
    setBusy(false);
    if (error) {
      toast.error("We couldn't send your feedback. Please try again.");
      return;
    }
    track("feedback_submitted", { rating: form.rating });
    setDone(true);
    toast.success("Thank you — your feedback has been sent for review.");
  }

  return (
    <div className="container-editorial py-12 sm:py-16">
      <div className="max-w-2xl">
        <p className="eyebrow">Feedback</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">Tell us how it tasted</h1>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
          Honest notes help us choose better lots. Reviews are read by our team and published once
          approved.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        {done ? (
          <div className="border border-border bg-card p-8">
            <h2 className="text-2xl">Thank you</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Your feedback is with our team. Reviews appear on the site once a member of staff has
              read and approved them.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5 border border-border bg-card p-6 sm:p-8">
            <h2 className="text-2xl">Share your feedback</h2>
            <Field label="Name" htmlFor="f-name" required error={errors.name}>
              <Input
                id="f-name"
                value={form.name}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "f-name-error" : undefined}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="Email or mobile" htmlFor="f-contact">
              <Input
                id="f-contact"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
              />
            </Field>
            <Field label="Order ID (optional)" htmlFor="f-order" hint="For example AUB-2026-000145.">
              <Input
                id="f-order"
                value={form.order_reference}
                onChange={(e) => setForm({ ...form, order_reference: e.target.value })}
              />
            </Field>
            <fieldset>
              <legend className="text-xs font-semibold tracking-wide">Rating (required)</legend>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, rating: n })}
                    aria-pressed={form.rating === n}
                    aria-label={`${n} star${n === 1 ? "" : "s"}`}
                    className={`h-11 w-11 border text-sm font-semibold ${
                      form.rating === n
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </fieldset>
            <Field label="Feedback" htmlFor="f-text" required error={errors.feedback}>
              <Textarea
                id="f-text"
                value={form.feedback}
                aria-invalid={Boolean(errors.feedback)}
                aria-describedby={errors.feedback ? "f-text-error" : undefined}
                onChange={(e) => setForm({ ...form, feedback: e.target.value })}
              />
            </Field>
            <Button type="submit" size="lg" disabled={busy}>
              {busy ? "Sending…" : "Submit feedback"}
            </Button>
          </form>
        )}

        <div>
          <h2 className="text-2xl">What customers say</h2>
          <ul className="mt-6 space-y-4">
            {(reviews.data ?? []).map((r) => (
              <li key={r.id} className="border border-border bg-card p-5">
                <Stars rating={r.rating} />
                <blockquote className="mt-3 text-[0.9375rem] leading-relaxed text-foreground/85">
                  “{r.feedback}”
                </blockquote>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {r.name}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
