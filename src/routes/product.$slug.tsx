import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { queries, productImage, variantsOf, isCoffee, type Product } from "@/lib/api";
import { useCart } from "@/context/cart";
import { Badge, Button, EmptyState, Select, Skeleton, Stars } from "@/components/ui-kit";
import { formatINR } from "@/config/site";
import { track } from "@/lib/analytics";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => {
    const title = params.slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    return {
      meta: [
        { title: `${title} — Auburn Coffee` },
        {
          name: "description",
          content: `${title} from Auburn Coffee — estate-sourced in Chikkamagaluru, Karnataka. Roast level, processing, tasting notes and brewing guidance.`,
        },
        { property: "og:title", content: `${title} — Auburn Coffee` },
        {
          property: "og:description",
          content: `${title}, sourced and roasted in small batches in Chikkamagaluru.`,
        },
        { name: "twitter:title", content: `${title} — Auburn Coffee` },
        { name: "twitter:description", content: `${title} from Auburn Coffee, Chikkamagaluru.` },
      ],
      links: [{ rel: "canonical", href: `/product/${params.slug}` }],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const productQuery = useQuery(queries.product(slug));
  const allProducts = useQuery(queries.products());

  const product = productQuery.data ?? null;
  const variants = product ? variantsOf(product) : [];
  const [variantId, setVariantId] = useState<string | null>(null);
  const [grind, setGrind] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (product) {
      setVariantId(variantsOf(product)[0]?.id ?? null);
      setGrind(product.grind_options?.[0] ?? "");
      track("product_viewed", { slug: product.slug, name: product.name });
    }
  }, [product]);

  const variant = variants.find((v) => v.id === variantId) ?? variants[0];
  const unitPrice = variant ? Number(variant.price) : Number(product?.discount_price ?? product?.price ?? 0);

  const related = useMemo(
    () =>
      (allProducts.data ?? [])
        .filter((p) => p.category_slug === product?.category_slug && p.id !== product?.id)
        .slice(0, 3),
    [allProducts.data, product],
  );

  if (productQuery.isLoading) {
    return (
      <div className="container-editorial grid gap-10 py-16 lg:grid-cols-2">
        <Skeleton className="aspect-square" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-11 w-40" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-editorial py-20">
        <EmptyState
          title="This product isn't available"
          description="It may have sold out or been retired. The rest of the collection is still here."
          action={
            <Link to="/shop" search={{}}>
              <Button>Explore the Collection</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const coffee = isCoffee(product);
  const images = product.images?.length ? product.images : [productImage(product)];
  const outOfStock = product.stock <= 0;

  function buildLine() {
    return {
      productId: product!.id,
      slug: product!.slug,
      name: product!.name,
      image: productImage(product!),
      variantId: variant?.id ?? null,
      variantLabel: variant?.weight_label ?? null,
      grind: grind || null,
      unitPrice,
    };
  }

  function handleAdd() {
    add(buildLine(), qty);
    toast.success(`${product!.name} (${variant?.weight_label ?? "standard"}) added to your cart.`);
  }

  function handleBuyNow() {
    add(buildLine(), qty);
    navigate({ to: "/checkout" });
  }

  const specs: [string, string | null][] = [
    ["Origin", product.origin],
    ["Variety", coffee ? product.coffee_variety : null],
    ["Processing method", coffee ? product.processing_method : null],
    ["Roast level", coffee ? product.roast_level : null],
    ["Altitude", coffee ? product.altitude : null],
    ["Acidity", coffee ? product.acidity : null],
    ["Body", coffee ? product.body : null],
    ["Sweetness", coffee ? product.sweetness : null],
    ["Category", product.subcategory],
  ];

  return (
    <div className="container-editorial py-10 sm:py-14">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <ol className="flex flex-wrap gap-1.5">
          <li>
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/shop" search={{}} className="hover:text-primary">
              Shop
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              to="/shop"
              search={{ category: product.category_slug }}
              className="hover:text-primary"
            >
              {product.category_slug.replace(/-/g, " ")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">{product.name}</li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <img
            src={images[activeImage]}
            alt={`${product.name} — ${product.short_description ?? "Auburn Coffee product photograph"}`}
            width={1280}
            height={1280}
            className="aspect-square w-full object-cover"
          />
          {images.length > 1 ? (
            <ul className="mt-3 flex gap-3">
              {images.map((img, i) => (
                <li key={img + i}>
                  <button
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1} of ${product.name}`}
                    aria-current={i === activeImage}
                    className={`h-20 w-20 overflow-hidden border ${i === activeImage ? "border-primary" : "border-border"}`}
                  >
                    <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.featured ? <Badge tone="forest">Estate favourite</Badge> : null}
            {product.discount_price ? <Badge tone="auburn">Offer</Badge> : null}
            <Badge>{outOfStock ? "Out of stock" : `In stock — ${product.stock} left`}</Badge>
          </div>

          <h1 className="mt-4 text-4xl leading-[1.1] sm:text-5xl">{product.name}</h1>
          {product.rating ? <div className="mt-3"><Stars rating={Number(product.rating)} /></div> : null}
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
            {product.short_description}
          </p>

          <p className="mt-6 flex items-baseline gap-3">
            <span className="text-2xl font-semibold">{formatINR(unitPrice)}</span>
            {variant ? (
              <span className="text-sm text-muted-foreground">per {variant.weight_label}</span>
            ) : null}
          </p>

          <div className="mt-8 space-y-5 border-t border-border pt-6">
            {variants.length > 1 ? (
              <fieldset>
                <legend className="text-xs font-semibold tracking-wide">Weight</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVariantId(v.id)}
                      aria-pressed={v.id === variant?.id}
                      className={`min-h-11 min-w-20 border px-4 text-sm ${
                        v.id === variant?.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card"
                      }`}
                    >
                      {v.weight_label}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {coffee && product.grind_options?.length ? (
              <div className="space-y-1.5">
                <label htmlFor="grind" className="block text-xs font-semibold tracking-wide">
                  Grind
                </label>
                <Select id="grind" value={grind} onChange={(e) => setGrind(e.target.value)}>
                  {product.grind_options.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}

            <div className="space-y-1.5">
              <span className="block text-xs font-semibold tracking-wide" id="qty-label">
                Quantity
              </span>
              <div
                className="inline-flex items-center border border-border"
                role="group"
                aria-labelledby="qty-label"
              >
                <button
                  type="button"
                  className="h-11 w-11 text-lg"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-semibold" aria-live="polite">
                  {qty}
                </span>
                <button
                  type="button"
                  className="h-11 w-11 text-lg"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={handleAdd} disabled={outOfStock} block size="lg">
                Add to Cart
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={outOfStock}
                variant="forest"
                block
                size="lg"
              >
                Buy Now
              </Button>
            </div>
            {outOfStock ? (
              <p role="status" className="text-sm font-medium text-destructive">
                Out of stock — this lot has sold out. Write to us and we'll tell you when the next
                one lands.
              </p>
            ) : null}
          </div>

          {product.tasting_notes?.length ? (
            <div className="mt-8 border-t border-border pt-6">
              <h2 className="eyebrow">Tasting notes</h2>
              <p className="mt-2 font-display text-xl italic">
                {product.tasting_notes.join(" · ")}
              </p>
            </div>
          ) : null}

          <dl className="mt-8 grid gap-x-8 gap-y-3 border-t border-border pt-6 text-sm sm:grid-cols-2">
            {specs
              .filter(([, v]) => Boolean(v))
              .map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-border/60 pb-2">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
          </dl>

          {coffee && product.brewing_methods?.length ? (
            <div className="mt-8">
              <h2 className="eyebrow">Recommended brewing</h2>
              <p className="mt-2 text-sm">{product.brewing_methods.join(", ")}</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-20 grid gap-10 lg:grid-cols-2">
        <Prose title="The story" body={product.product_story ?? product.description} />
        <Prose title="Farm & origin" body={product.farm_details} />
        {coffee ? <Prose title="Brewing guide" body={product.brewing_guide} /> : null}
        <Prose title="Storage" body={product.storage_note} />
        <Prose
          title="Shipping"
          body="Dispatched from Chikkamagaluru within 2 working days. Delivery across India in 2–6 days. Free shipping on orders above ₹999."
        />
      </div>

      {related.length ? (
        <section className="mt-20">
          <h2 className="text-2xl sm:text-3xl">You may also like</h2>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.short_description,
            brand: { "@type": "Brand", name: "Auburn Coffee" },
            offers: {
              "@type": "Offer",
              priceCurrency: "INR",
              price: unitPrice,
              availability: outOfStock
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
            },
          }),
        }}
      />
    </div>
  );
}

function Prose({ title, body }: { title: string; body?: string | null }) {
  if (!body) return null;
  return (
    <section className="border-t border-border pt-6">
      <h2 className="eyebrow">{title}</h2>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-foreground/80">{body}</p>
    </section>
  );
}
