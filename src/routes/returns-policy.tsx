import { createFileRoute } from "@tanstack/react-router";
import { Clause, LegalPage } from "@/components/site/Prose";
import { SITE } from "@/config/site";

export const Route = createFileRoute("/returns-policy")({
  head: () => ({
    meta: [
      { title: "Returns & Refund Policy — Auburn Coffee" },
      { name: "description", content: "How returns, replacements and refunds work for Auburn Coffee orders." },
      { property: "og:title", content: "Returns & Refunds — Auburn Coffee" },
      { property: "og:description", content: "Returns, replacements and refunds explained." },
      { name: "twitter:title", content: "Returns & Refunds — Auburn Coffee" },
      { name: "twitter:description", content: "Returns, replacements and refunds explained." },
    ],
    links: [{ rel: "canonical", href: "/returns-policy" }],
  }),
  component: () => (
    <LegalPage title="Returns & Refund Policy" intro="Food products can't be resold once opened, but we always make things right.">
      <Clause heading="Damaged or incorrect items">
        <p>Tell us within 48 hours of delivery with a photo and we'll replace or refund the item.</p>
      </Clause>
      <Clause heading="Unopened products">
        <p>Unopened, sealed pouches may be returned within 7 days. Return shipping is paid by the customer.</p>
      </Clause>
      <Clause heading="Refunds">
        <p>Approved refunds go back to the original UPI account within 5–7 working days.</p>
      </Clause>
      <Clause heading="How to request">
        <p>WhatsApp us or email {SITE.email} with your order ID.</p>
      </Clause>
    </LegalPage>
  ),
});
