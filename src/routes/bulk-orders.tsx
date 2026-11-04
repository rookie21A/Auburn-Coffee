import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { db } from "@/lib/api";
import { Button, Field, Input, Select, Textarea } from "@/components/ui-kit";
import { whatsappLink } from "@/config/site";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/bulk-orders")({
  head: () => ({
    meta: [
      { title: "Bulk & Corporate Coffee Orders — Auburn Coffee" },
      {
        name: "description",
        content:
          "Wholesale coffee for offices, cafés, hotels, restaurants, retailers and gifting. Request a bulk quote from Auburn Coffee, Chikkamagaluru.",
      },
      { property: "og:title", content: "Bulk & Corporate Orders — Auburn Coffee" },
      {
        property: "og:description",
        content: "Coffee for offices, cafés, hotels and businesses. Request a bulk quote.",
      },
      { name: "twitter:title", content: "Bulk & Corporate Orders — Auburn Coffee" },
      { name: "twitter:description", content: "Wholesale coffee from Chikkamagaluru." },
    ],
    links: [{ rel: "canonical", href: "/bulk-orders" }],
  }),
  component: BulkOrders,
});

const BUSINESS_TYPES = [
  "Corporate Office",
  "Hotel",
  "Restaurant",
  "Café",
  "Retailer",
  "Reseller",
  "Event Organiser",
  "Gift Buyer",
];

const FREQUENCIES = ["One-time", "Monthly", "Fortnightly", "Weekly", "Quarterly"];

function BulkOrders() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    full_name: "",
    company: "",
    email: "",
    phone: "",
    business_type: "",
    product_interest: "",
    expected_quantity: "",
    frequency: "",
    message: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const e2: Record<string, string> = {};
    if (form.full_name.trim().length < 2) e2.full_name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e2.email = "Please enter a valid email address.";
    if (form.phone.replace(/\D/g, "").length < 10) e2.phone = "Please enter a valid phone number.";
    setErrors(e2);
    if (Object.keys(e2).length) return;

    setBusy(true);
    const { error } = await db.from("bulk_enquiries").insert(form);
    setBusy(false);
    if (error) {
      toast.error("We couldn't send your enquiry. Please try again or message us on WhatsApp.");
      return;
    }
    track("bulk_order_submitted", { business_type: form.business_type });
    setDone(true);
    toast.success("Enquiry received — we'll reply within one working day.");
  }

  return (
    <div className="container-editorial py-12 sm:py-16">
      <div className="max-w-2xl">
        <p className="eyebrow">Bulk & corporate</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">Coffee for offices, cafés, hotels and businesses.</h1>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
          Consistent lots, repeat delivery schedules, grind profiles matched to your equipment, and
          pricing that reflects volume. Tell us what you pour and we'll put together a quote.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">
        {done ? (
          <div className="border border-border bg-card p-8">
            <h2 className="text-2xl">Thank you — your enquiry is with us</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Our team will reply within one working day with pricing and samples. If it's urgent,
              message us on WhatsApp and mention your company name.
            </p>
            <a
              href={whatsappLink(
                `Hello Auburn Coffee, I've submitted a bulk enquiry for ${form.company || form.full_name}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block"
            >
              <Button variant="forest">Discuss on WhatsApp</Button>
            </a>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5 border border-border bg-card p-6 sm:p-8">
            <h2 className="text-2xl">Request a bulk quote</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" htmlFor="b-name" required error={errors.full_name}>
                <Input
                  id="b-name"
                  value={form.full_name}
                  aria-invalid={Boolean(errors.full_name)}
                  aria-describedby={errors.full_name ? "b-name-error" : undefined}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </Field>
              <Field label="Company" htmlFor="b-company">
                <Input
                  id="b-company"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
              </Field>
              <Field label="Email" htmlFor="b-email" required error={errors.email}>
                <Input
                  id="b-email"
                  type="email"
                  value={form.email}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "b-email-error" : undefined}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
              <Field label="Phone" htmlFor="b-phone" required error={errors.phone}>
                <Input
                  id="b-phone"
                  type="tel"
                  value={form.phone}
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "b-phone-error" : undefined}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Field>
              <Field label="Business type" htmlFor="b-type">
                <Select
                  id="b-type"
                  value={form.business_type}
                  onChange={(e) => setForm({ ...form, business_type: e.target.value })}
                >
                  <option value="">Select one</option>
                  {BUSINESS_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Frequency" htmlFor="b-freq">
                <Select
                  id="b-freq"
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                >
                  <option value="">Select one</option>
                  {FREQUENCIES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Product interest" htmlFor="b-interest">
                <Input
                  id="b-interest"
                  placeholder="Filter blend, speciality Arabica, green beans…"
                  value={form.product_interest}
                  onChange={(e) => setForm({ ...form, product_interest: e.target.value })}
                />
              </Field>
              <Field label="Expected quantity" htmlFor="b-qty">
                <Input
                  id="b-qty"
                  placeholder="e.g. 25 kg per month"
                  value={form.expected_quantity}
                  onChange={(e) => setForm({ ...form, expected_quantity: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Message" htmlFor="b-message">
              <Textarea
                id="b-message"
                value={form.message}
                placeholder="Tell us about your equipment, brewing style and timelines."
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </Field>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" size="lg" disabled={busy}>
                {busy ? "Sending…" : "Request a Bulk Quote"}
              </Button>
              <a
                href={whatsappLink("Hello Auburn Coffee, I would like to discuss a bulk order.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button type="button" variant="quiet" size="lg">
                  Discuss on WhatsApp
                </Button>
              </a>
            </div>
          </form>
        )}

        <aside className="h-fit border border-border bg-secondary p-6">
          <h2 className="eyebrow">Who we supply</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {BUSINESS_TYPES.map((t) => (
              <li key={t} className="border-b border-border/60 pb-2">
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Minimum order for wholesale pricing is 10 kg. Custom labelling and gift packaging are
            available for corporate gifting.
          </p>
        </aside>
      </div>
    </div>
  );
}
