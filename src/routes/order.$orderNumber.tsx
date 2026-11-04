import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { queries, type Order } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Badge, Button, EmptyState, Skeleton } from "@/components/ui-kit";
import {
  BUSINESS_UPI_ID,
  formatINR,
  upiIntentLink,
  whatsappLink,
} from "@/config/site";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/order/$orderNumber")({
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.orderNumber} — Auburn Coffee` },
      { name: "description", content: "Your Auburn Coffee order summary and UPI payment details." },
      { property: "og:title", content: `Order ${params.orderNumber} — Auburn Coffee` },
      { property: "og:description", content: "Order summary and UPI payment details." },
      { name: "twitter:title", content: `Order ${params.orderNumber} — Auburn Coffee` },
      { name: "twitter:description", content: "Order summary and UPI payment details." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

export function buildWhatsappMessage(order: Order) {
  const products = (order.order_items ?? [])
    .map(
      (i) =>
        `${i.product_name} × ${i.quantity}${i.grind ? `\n${i.grind}` : ""}${
          i.variant_label ? `\n${i.variant_label}` : ""
        }`,
    )
    .join("\n\n");

  return `Hello Auburn Coffee,

I would like to confirm my order.

Order ID:
${order.order_number}

Customer:
${order.customer_name}

Products:
${products}

Subtotal:
₹${Number(order.subtotal)}

Shipping:
₹${Number(order.shipping)}

Order Total:
₹${Number(order.total)}

Delivery Address:
${order.delivery_address}

I would like to complete the payment via UPI.

Please share/confirm the payment details.

Thank you.`;
}

function OrderPage() {
  const { orderNumber } = Route.useParams();
  const { user, loading } = useAuth();
  const order = useQuery({ ...queries.orderByNumber(orderNumber), enabled: Boolean(user) });

  if (loading || order.isLoading) {
    return (
      <div className="container-editorial space-y-4 py-16">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-editorial py-16">
        <EmptyState
          title="Sign in to view this order"
          description="Order details are private to your account."
          action={
            <Link to="/auth" search={{ redirect: `/order/${orderNumber}` }}>
              <Button>Sign in</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (!order.data) {
    return (
      <div className="container-editorial py-16">
        <EmptyState
          title="Order not found"
          description={`We couldn't find order ${orderNumber} on your account.`}
          action={
            <Link to="/account">
              <Button>Go to my orders</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const o = order.data;
  const message = buildWhatsappMessage(o);
  const upiLink = upiIntentLink(Number(o.total), o.order_number);
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiLink)}`;

  return (
    <div className="container-editorial max-w-3xl py-12 sm:py-16">
      <p className="eyebrow text-primary">Order received</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">Thank you, {o.customer_name.split(" ")[0]}</h1>
      <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
        Your order reference is <strong className="text-foreground">{o.order_number}</strong>. It is
        held as <strong>Awaiting Payment</strong> until our team confirms your UPI transfer — we
        never mark payments confirmed automatically.
      </p>

      <div className="mt-8 border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl">Order summary</h2>
          <Badge tone="forest">{o.status}</Badge>
        </div>
        <ul className="mt-5 divide-y divide-border border-y border-border">
          {(o.order_items ?? []).map((i) => (
            <li key={i.id} className="flex justify-between gap-4 py-3 text-sm">
              <span>
                {i.product_name}
                <span className="block text-xs text-muted-foreground">
                  {[i.variant_label, i.grind].filter(Boolean).join(" · ")} × {i.quantity}
                </span>
              </span>
              <span className="font-semibold">
                {formatINR(Number(i.unit_price) * i.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatINR(Number(o.subtotal))}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>{Number(o.shipping) === 0 ? "Free" : formatINR(Number(o.shipping))}</dd>
          </div>
          <div className="hairline flex justify-between pt-2">
            <dt className="font-semibold">Total</dt>
            <dd className="text-base font-semibold">{formatINR(Number(o.total))}</dd>
          </div>
        </dl>
        <div className="mt-6 text-sm">
          <h3 className="eyebrow">Delivering to</h3>
          <p className="mt-2 whitespace-pre-line text-foreground/85">{o.delivery_address}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="border border-border bg-card p-6">
          <h2 className="text-xl">Pay via UPI</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Pay {formatINR(Number(o.total))} to <strong className="text-foreground">{BUSINESS_UPI_ID}</strong> with the note{" "}
            <em>Auburn Coffee - {o.order_number}</em>.
          </p>
          <img
            src={qrSrc}
            alt={`UPI payment QR code for order ${o.order_number}`}
            loading="lazy"
            width={220}
            height={220}
            className="mt-5 border border-border bg-card p-2"
          />
          <a href={upiLink} className="mt-5 block" onClick={() => track("upi_payment_initiated", { order: o.order_number })}>
            <Button block>Open my UPI app</Button>
          </a>
          <p className="mt-3 text-xs text-muted-foreground">
            On a phone this opens your installed UPI app. On desktop, scan the QR code.
          </p>
        </div>

        <div className="border border-border bg-card p-6">
          <h2 className="text-xl">Confirm on WhatsApp</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Send us your order summary and payment screenshot so we can confirm and pack it.
          </p>
          <a
            href={whatsappLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 block"
            onClick={() => track("whatsapp_checkout_opened", { order: o.order_number })}
          >
            <Button block variant="forest">
              I've Completed Payment
            </Button>
          </a>
          <a
            href={whatsappLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block"
          >
            <Button block variant="quiet">
              Send order summary on WhatsApp
            </Button>
          </a>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/account">
          <Button variant="quiet">View my orders</Button>
        </Link>
        <Link to="/shop" search={{}}>
          <Button variant="quiet">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}
