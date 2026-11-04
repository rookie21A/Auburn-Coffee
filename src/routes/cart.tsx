import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useCart } from "@/context/cart";
import { Button, EmptyState } from "@/components/ui-kit";
import { FREE_SHIPPING_THRESHOLD, formatINR } from "@/config/site";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Auburn Coffee" },
      {
        name: "description",
        content: "Review your Auburn Coffee selection before checkout. UPI payment via WhatsApp confirmation.",
      },
      { property: "og:title", content: "Your Cart — Auburn Coffee" },
      { property: "og:description", content: "Review your Auburn Coffee selection." },
      { name: "twitter:title", content: "Your Cart — Auburn Coffee" },
      { name: "twitter:description", content: "Review your Auburn Coffee selection." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, subtotal, shipping, total, setQuantity, remove } = useCart();

  useEffect(() => {
    track("cart_viewed", { lines: lines.length });
  }, [lines.length]);

  return (
    <div className="container-editorial py-12 sm:py-16">
      <p className="eyebrow">Your selection</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">Cart</h1>

      {lines.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Your cart is empty"
            description="Nothing here yet. Start with the filter blend, or a bright washed Arabica."
            action={
              <Link to="/shop" search={{}}>
                <Button>Explore the Collection</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <ul className="divide-y divide-border border-y border-border">
            {lines.map((line) => (
              <li key={line.key} className="flex gap-4 py-5 sm:gap-6">
                <Link to="/product/$slug" params={{ slug: line.slug }} className="shrink-0">
                  <img
                    src={line.image}
                    alt={line.name}
                    loading="lazy"
                    width={160}
                    height={160}
                    className="h-24 w-24 object-cover sm:h-28 sm:w-28"
                  />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1">
                    <h2 className="text-lg leading-snug">
                      <Link
                        to="/product/$slug"
                        params={{ slug: line.slug }}
                        className="hover:text-primary"
                      >
                        {line.name}
                      </Link>
                    </h2>
                    <p className="font-semibold">{formatINR(line.unitPrice * line.quantity)}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[line.variantLabel, line.grind].filter(Boolean).join(" · ")} ·{" "}
                    {formatINR(line.unitPrice)} each
                  </p>
                  <div className="mt-auto flex items-center gap-4 pt-4">
                    <div className="inline-flex items-center border border-border">
                      <button
                        type="button"
                        className="h-10 w-10"
                        onClick={() => setQuantity(line.key, line.quantity - 1)}
                        aria-label={`Decrease quantity of ${line.name}`}
                      >
                        −
                      </button>
                      <span className="w-9 text-center text-sm font-semibold">{line.quantity}</span>
                      <button
                        type="button"
                        className="h-10 w-10"
                        onClick={() => setQuantity(line.key, line.quantity + 1)}
                        aria-label={`Increase quantity of ${line.name}`}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(line.key)}
                      className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit border border-border bg-card p-6 lg:sticky lg:top-28">
            <h2 className="text-xl">Order summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <Row label="Subtotal" value={formatINR(subtotal)} />
              <Row
                label="Shipping"
                value={shipping === 0 ? "Free" : formatINR(shipping)}
              />
              <div className="hairline pt-3">
                <Row label="Total" value={formatINR(total)} strong />
              </div>
            </dl>
            {shipping > 0 ? (
              <p className="mt-4 text-xs text-muted-foreground">
                Add {formatINR(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping.
              </p>
            ) : null}
            <div className="mt-6 space-y-3">
              <Link to="/checkout" className="block">
                <Button block size="lg">
                  Proceed to Checkout
                </Button>
              </Link>
              <Link to="/shop" search={{}} className="block">
                <Button block variant="quiet">
                  Continue Shopping
                </Button>
              </Link>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
              Payment is by UPI, confirmed over WhatsApp. No card or net-banking details are ever
              collected.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className={strong ? "font-semibold" : "text-muted-foreground"}>{label}</dt>
      <dd className={strong ? "text-base font-semibold" : ""}>{value}</dd>
    </div>
  );
}
