import { createFileRoute } from "@tanstack/react-router";
import { Clause, LegalPage } from "@/components/site/Prose";
import { SITE } from "@/config/site";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Auburn Coffee" },
      {
        name: "description",
        content:
          "How Auburn Coffee collects, uses, stores and protects your personal information when you shop with us.",
      },
      { property: "og:title", content: "Privacy Policy — Auburn Coffee" },
      { property: "og:description", content: "How we handle your personal information." },
      { name: "twitter:title", content: "Privacy Policy — Auburn Coffee" },
      { name: "twitter:description", content: "How we handle your personal information." },
    ],
    links: [{ rel: "canonical", href: "/privacy-policy" }],
  }),
  component: () => (
    <LegalPage
      title="Privacy Policy"
      intro="We collect the minimum information needed to take your order, deliver it and support you afterwards."
    >
      <Clause heading="What we collect">
        <p>
          Your name, email address, mobile number and delivery address; your order history; and any
          message you send us through a form or WhatsApp.
        </p>
        <p>
          We do not collect or store card details. UPI payments are completed inside your own
          payment app.
        </p>
      </Clause>
      <Clause heading="How we use it">
        <p>
          To process and deliver orders, confirm payment, send order updates, respond to enquiries,
          and improve our products and website.
        </p>
      </Clause>
      <Clause heading="Sharing">
        <p>
          We share your delivery details with courier partners only, and only as needed to deliver
          your order. We do not sell personal information.
        </p>
      </Clause>
      <Clause heading="Storage and security">
        <p>
          Data is stored on managed cloud infrastructure with access controls and row-level security
          so that you can only see your own orders and addresses. Passwords are hashed and never
          visible to us.
        </p>
      </Clause>
      <Clause heading="Your rights">
        <p>
          You can view and edit your details from your account page, and request correction or
          deletion of your data by writing to {SITE.email}. Deleting your account removes your
          profile and addresses; order records may be retained where required for tax and accounting.
        </p>
      </Clause>
      <Clause heading="Cookies">
        <p>
          We use essential storage only: a sign-in session and your shopping cart. No advertising
          trackers are set by us.
        </p>
      </Clause>
      <Clause heading="Contact">
        <p>
          Questions about privacy: {SITE.email} · {SITE.address}
        </p>
      </Clause>
    </LegalPage>
  ),
});
