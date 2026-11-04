import { createFileRoute } from "@tanstack/react-router";
import { Clause, LegalPage } from "@/components/site/Prose";
import { SITE } from "@/config/site";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Auburn Coffee" },
      {
        name: "description",
        content:
          "The terms that apply when you browse, order or buy coffee and estate products from Auburn Coffee.",
      },
      { property: "og:title", content: "Terms & Conditions — Auburn Coffee" },
      { property: "og:description", content: "Terms that apply to orders placed with Auburn Coffee." },
      { name: "twitter:title", content: "Terms & Conditions — Auburn Coffee" },
      { name: "twitter:description", content: "Terms that apply to orders with Auburn Coffee." },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: () => (
    <LegalPage
      title="Terms & Conditions"
      intro="By placing an order with Auburn Coffee you agree to the terms below."
    >
      <Clause heading="Orders">
        <p>
          An order is confirmed only after payment is verified by our team. Until then it stays in
          the “Awaiting Payment” state and no stock is reserved.
        </p>
        <p>
          We may cancel an order if an item is unavailable, if payment cannot be verified, or if
          delivery details are incomplete. You will be informed and refunded in full.
        </p>
      </Clause>
      <Clause heading="Pricing">
        <p>
          All prices are in Indian Rupees and include applicable taxes unless stated otherwise.
          Shipping is charged at checkout and is free above {SITE.currency}999.
        </p>
      </Clause>
      <Clause heading="Product information">
        <p>
          Coffee is an agricultural product. Tasting notes, roast dates and harvest details are
          accurate at the time of listing, and lots change through the season.
        </p>
      </Clause>
      <Clause heading="Accounts">
        <p>
          You are responsible for keeping your account credentials confidential and for activity
          under your account. Tell us immediately if you suspect unauthorised use.
        </p>
      </Clause>
      <Clause heading="Intellectual property">
        <p>
          Photography, text, branding and page design on this site belong to Auburn Coffee and may
          not be reused without written permission.
        </p>
      </Clause>
      <Clause heading="Liability">
        <p>
          Our liability for any order is limited to the value of that order. We are not liable for
          delays caused by couriers, weather or events outside our control.
        </p>
      </Clause>
      <Clause heading="Governing law">
        <p>
          These terms are governed by the laws of India, with jurisdiction in Chikkamagaluru,
          Karnataka. Questions: {SITE.email}.
        </p>
      </Clause>
    </LegalPage>
  ),
});
