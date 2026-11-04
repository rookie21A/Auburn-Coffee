import { createFileRoute } from "@tanstack/react-router";
import { Clause, LegalPage } from "@/components/site/Prose";
import { FLAT_SHIPPING_RATE, FREE_SHIPPING_THRESHOLD, formatINR } from "@/config/site";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping Policy — Auburn Coffee" },
      { name: "description", content: "Delivery timelines, shipping charges and dispatch details for Auburn Coffee orders across India." },
      { property: "og:title", content: "Shipping Policy — Auburn Coffee" },
      { property: "og:description", content: "Delivery timelines and charges across India." },
      { name: "twitter:title", content: "Shipping Policy — Auburn Coffee" },
      { name: "twitter:description", content: "Delivery timelines and charges across India." },
    ],
    links: [{ rel: "canonical", href: "/shipping-policy" }],
  }),
  component: () => (
    <LegalPage title="Shipping Policy" intro="Every order is packed by hand in Chikkamagaluru.">
      <Clause heading="Dispatch">
        <p>Orders are dispatched within 2 working days of payment confirmation.</p>
      </Clause>
      <Clause heading="Delivery time">
        <p>Most of India receives orders in 2–6 working days. Remote pincodes may take longer.</p>
      </Clause>
      <Clause heading="Charges">
        <p>
          Shipping is free on orders above {formatINR(FREE_SHIPPING_THRESHOLD)}. Below that, a flat{" "}
          {formatINR(FLAT_SHIPPING_RATE)} applies.
        </p>
      </Clause>
      <Clause heading="Tracking">
        <p>A tracking link is shared on WhatsApp once your order ships.</p>
      </Clause>
    </LegalPage>
  ),
});
