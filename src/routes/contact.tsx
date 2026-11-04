import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { db } from "@/lib/api";
import { Button, Field, Input, Textarea } from "@/components/ui-kit";
import { SITE, whatsappLink } from "@/config/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Auburn Coffee — Chikkamagaluru, Karnataka" },
      {
        name: "description",
        content:
          "Reach Auburn Coffee by WhatsApp, email or phone for orders, wholesale, brewing advice and estate visits in Chikkamagaluru, Karnataka.",
      },
      { property: "og:title", content: "Contact — Auburn Coffee" },
      {
        property: "og:description",
        content: "WhatsApp, email or call Auburn Coffee in Chikkamagaluru, Karnataka.",
      },
      { name: "twitter:title", content: "Contact — Auburn Coffee" },
      { name: "twitter:description", content: "Get in touch with Auburn Coffee." },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const e2: Record<string, string> = {};
    if (form.name.trim().length < 2) e2.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e2.email = "Please enter a valid email address.";
    if (form.message.trim().length < 10) e2.message = "Please tell us a little more.";
    setErrors(e2);
    if (Object.keys(e2).length) return;

    setBusy(true);
    const { error } = await db.from("bulk_enquiries").insert({
      full_name: form.name,
      email: form.email,
      phone: form.phone || "Not provided",
      business_type: "General enquiry",
      message: form.message,
    });
    setBusy(false);
    if (error) {
      toast.error("We couldn't send your message. Please try WhatsApp or email instead.");
      return;
    }
    setDone(true);
    toast.success("Message sent — we usually reply within one working day.");
  }

  return (
    <div className="container-editorial py-12 sm:py-16">
      <div className="max-w-2xl">
        <p className="eyebrow">Contact</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">We're a message away</h1>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
          Orders, brewing advice, wholesale, estate visits — WhatsApp is fastest, but everything
          below reaches us.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_340px]">
        {done ? (
          <div className="border border-border bg-card p-8">
            <h2 className="text-2xl">Thank you for writing in</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Your message has reached our team. We reply within one working day, Monday to Saturday.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5 border border-border bg-card p-6 sm:p-8">
            <h2 className="text-2xl">Send a message</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Name" htmlFor="c-name" required error={errors.name}>
                <Input
                  id="c-name"
                  value={form.name}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "c-name-error" : undefined}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field label="Email" htmlFor="c-email" required error={errors.email}>
                <Input
                  id="c-email"
                  type="email"
                  value={form.email}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "c-email-error" : undefined}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Phone" htmlFor="c-phone">
              <Input
                id="c-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Field>
            <Field label="Message" htmlFor="c-message" required error={errors.message}>
              <Textarea
                id="c-message"
                value={form.message}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "c-message-error" : undefined}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </Field>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" size="lg" disabled={busy}>
                {busy ? "Sending…" : "Send message"}
              </Button>
              <a
                href={whatsappLink("Hello Auburn Coffee, I have a question.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button type="button" variant="forest" size="lg">
                  Chat on WhatsApp
                </Button>
              </a>
            </div>
          </form>
        )}

        <aside className="h-fit space-y-6 border border-border bg-secondary p-6">
          <div>
            <h2 className="eyebrow">Reach us</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <span className="block text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  WhatsApp
                </span>
                <a
                  className="underline decoration-copper/50 underline-offset-4"
                  href={whatsappLink("Hello Auburn Coffee!")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Message us
                </a>
              </li>
              <li>
                <span className="block text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Email
                </span>
                <a
                  className="underline decoration-copper/50 underline-offset-4"
                  href={`mailto:${SITE.email}`}
                >
                  {SITE.email}
                </a>
              </li>
              <li>
                <span className="block text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Address
                </span>
                {SITE.address}
              </li>
              <li>
                <span className="block text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Hours
                </span>
                {SITE.hours}
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
