import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useState } from "react";
import { formatINR } from "@/config/site";
import {
  effectivePrice,
  isCoffee,
  productImage,
  variantsOf,
  type Product,
} from "@/lib/api";
import { useCart } from "@/context/cart";
import { Button, Stars } from "@/components/ui-kit";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [quickView, setQuickView] = useState(false);
  const variants = variantsOf(product);
  const first = variants[0];
  const price = first ? Number(first.price) : effectivePrice(product);
  const outOfStock = product.stock <= 0;

  function addToCart() {
    if (outOfStock) return;
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: productImage(product),
      variantId: first?.id ?? null,
      variantLabel: first?.weight_label ?? null,
      grind: product.grind_options?.[0] ?? null,
      unitPrice: price,
    });
    toast.success(`${product.name} added to your cart.`);
  }

  return (
    <article className="group flex h-full flex-col border border-border bg-card">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative block overflow-hidden bg-secondary"
      >
        <img
          src={productImage(product)}
          alt={`${product.name} — ${product.short_description ?? "Auburn Coffee"}`}
          loading="lazy"
          width={1280}
          height={1280}
          className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        {product.discount_price ? (
          <span className="absolute left-0 top-3 bg-primary px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-primary-foreground">
            Offer
          </span>
        ) : null}
        {outOfStock ? (
          <span className="absolute left-0 top-3 bg-forest px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-forest-foreground">
            Sold out
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="text-lg leading-snug">
          <Link to="/product/$slug" params={{ slug: product.slug }} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>

        <p className="mt-1.5 text-xs text-muted-foreground">
          {[
            isCoffee(product) ? product.coffee_variety : product.subcategory,
            product.roast_level,
          ]
            .filter(Boolean)
            .join(" · ") || product.origin}
        </p>

        {product.tasting_notes?.length ? (
          <p className="mt-2.5 text-[0.8125rem] italic leading-relaxed text-foreground/75">
            {product.tasting_notes.join(", ")}
          </p>
        ) : null}

        <div className="mt-3 flex items-center gap-3">
          {product.rating ? <Stars rating={Number(product.rating)} /> : null}
          {first ? (
            <span className="text-xs text-muted-foreground">{first.weight_label}</span>
          ) : null}
        </div>

        <div className="mt-auto pt-4">
          <p className="flex items-baseline gap-2">
            <span className="text-base font-semibold">{formatINR(price)}</span>
            {product.discount_price ? (
              <span className="text-xs text-muted-foreground line-through">
                {formatINR(Number(product.price))}
              </span>
            ) : null}
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={addToCart} disabled={outOfStock} className="flex-1">
              {outOfStock ? "Sold out" : "Add to Cart"}
            </Button>
            <Button
              size="sm"
              variant="quiet"
              onClick={() => setQuickView((v) => !v)}
              aria-expanded={quickView}
            >
              Quick View
            </Button>
          </div>
          {quickView ? (
            <dl className="mt-4 space-y-1.5 border-t border-border pt-3 text-xs">
              {[
                ["Origin", product.origin],
                ["Variety", product.coffee_variety],
                ["Process", product.processing_method],
                ["Roast", product.roast_level],
                ["Altitude", product.altitude],
              ]
                .filter(([, v]) => Boolean(v))
                .map(([k, v]) => (
                  <div key={k as string} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              <div className="pt-2">
                <Link
                  to="/product/$slug"
                  params={{ slug: product.slug }}
                  className="text-primary underline"
                >
                  See full details
                </Link>
              </div>
            </dl>
          ) : null}
        </div>
      </div>
    </article>
  );
}
