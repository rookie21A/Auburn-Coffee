import { createFileRoute } from "@tanstack/react-router";
import { Clause, LegalPage } from "@/components/site/Prose";

export const Route = createFileRoute("/cancellation-policy")({
  head: () => ({
    meta: [
      { title: "Cancellation Policy — Auburn Coffee" },
      { name: "description", content: "When and how you can cancel an Auburn Coffee order." },
      { property: "og:title", content: "Cancellation Policy — Auburn Coffee" },
      { property: "og:description", content: "When and how you can cancel an order." },
      { name: "twitter:title", content: "Cancellation Policy — Auburn Coffee" },
      { name: "twitter:description", content: "When and how you can cancel an order." },
    ],
    links: [{ rel: "canonical", href: "/cancellation-policy" }],
  }),
  component: () => (
    <LegalPage title="Cancellation Policy">
      <Clause heading="Before payment">
        <p>Orders awaiting payment can be cancelled any time — just let us know on WhatsApp.</p>
      </Clause>
      <Clause heading="After payment, before dispatch">
        <p>Cancel before the order is packed for a full refund to your UPI account.</p>
      </Clause>
      <Clause heading="After dispatch">
        <p>Shipped orders can't be cancelled; see our returns policy instead.</p>
      </Clause>
    </LegalPage>
  ),
});
