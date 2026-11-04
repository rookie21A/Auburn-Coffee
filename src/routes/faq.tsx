import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/Prose";

const FAQS = [
  ["How do I pay?", "We accept UPI only. After placing your order you can pay from your UPI app or by scanning a QR code, then confirm on WhatsApp."],
  ["When is my order confirmed?", "Once our team verifies your UPI payment, your order moves from Awaiting Payment to Payment Confirmed."],
  ["Which grind should I choose?", "South Indian Filter for a dabara, Espresso for machines, Pour Over for V60 or Chemex, French Press for a press. Whole Bean if you grind at home."],
  ["How fresh is the coffee?", "We roast in small batches and dispatch within days of roasting. The roast date is printed on every pouch."],
  ["Do you ship outside India?", "Not yet. We currently deliver across India."],
  ["Can I order in bulk?", "Yes — see our Bulk Orders page or message us on WhatsApp."],
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQs — Auburn Coffee" },
      { name: "description", content: "Answers about UPI payment, grinding, freshness, shipping and bulk orders at Auburn Coffee." },
      { property: "og:title", content: "FAQs — Auburn Coffee" },
      { property: "og:description", content: "Payment, grinding, freshness and shipping questions." },
      { name: "twitter:title", content: "FAQs — Auburn Coffee" },
      { name: "twitter:description", content: "Payment, grinding, freshness and shipping questions." },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  component: () => (
    <LegalPage title="Frequently Asked Questions" updated="2026">
      {FAQS.map(([q, a]) => (
        <details key={q} className="border-b border-border pb-4">
          <summary className="flex min-h-11 cursor-pointer items-center font-display text-lg">{q}</summary>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground">{a}</p>
        </details>
      ))}
    </LegalPage>
  ),
});
