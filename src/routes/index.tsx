import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { queries } from "@/lib/api";
import { ProductCard } from "@/components/site/ProductCard";
import { Button, EmptyState, SectionHeading, Skeleton, Stars } from "@/components/ui-kit";
import { whatsappLink } from "@/config/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Auburn Coffee — Speciality Coffee from Chikkamagaluru" },
      {
        name: "description",
        content:
          "From the hills where Indian coffee found its home. Estate-sourced speciality Arabica, filter coffee, green beans, cascara and spices, shipped across India.",
      },
      { property: "og:title", content: "Auburn Coffee — Coffee, Rooted in Chikkamagaluru" },
      {
        property: "og:description",
        content:
          "Carefully sourced coffee, estate products and flavours from Chikkamagaluru, Karnataka.",
      },
      { name: "twitter:title", content: "Auburn Coffee — Coffee, Rooted in Chikkamagaluru" },
      {
        name: "twitter:description",
        content: "Speciality coffee and estate products from Chikkamagaluru, Karnataka.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const COLLECTIONS = [
  { label: "Filter Coffee", slug: "filter-coffee", image: "/images/product-filter.jpg" },
  { label: "Roasted Beans", slug: "roasted-beans", image: "/images/product-roasting.jpg" },
  { label: "Green Coffee & Seeds", slug: "green-coffee-beans", image: "/images/product-green.jpg" },
  { label: "Spices", slug: "spices", image: "/images/product-spices.jpg" },
];

const JOURNEY = [
  ["Seed", "Selected from healthy mother plants in the estate nursery."],
  ["Plant", "Three to four years under silver oak shade before the first real crop."],
  ["Cherry", "Ripening staggered across the slope, so picking happens in passes."],
  ["Harvest", "Only ripe cherries, picked by hand, weighed the same evening."],
  ["Processing", "Washed, natural or honey — each lot kept separate."],
  ["Roasting", "Small batches, profiled to the lot rather than to a house curve."],
  ["Brewing", "Ground for your method, whether dabara or pour over."],
];

export default function Home() {
  const products = useQuery(queries.products());
  const reviews = useQuery(queries.approvedReviews());
  const gallery = useQuery(queries.gallery());

  const featured = (products.data ?? []).filter((p) => p.featured);
  const bestSellers = [...(products.data ?? [])]
    .sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0))
    .slice(0, 4);

  return (
    <>
      {/* HERO */}
      <section className="relative isolate">
        <img
          src="/images/hero-estate.jpg"
          alt="Coffee rows under silver oak shade with mist settling over the Chikkamagaluru hills at sunrise"
          width={1920}
          height={1280}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-espresso/55" aria-hidden="true" />
        <div className="container-editorial flex min-h-[82vh] flex-col justify-end pb-16 pt-28 sm:min-h-[88vh] sm:pb-24">
          <p className="eyebrow text-ivory/80">Chikkamagaluru, Karnataka</p>
          <h1 className="mt-5 max-w-3xl text-[2.5rem] leading-[1.05] text-ivory sm:text-6xl lg:text-7xl">
            Coffee, Rooted in Chikkamagaluru.
          </h1>
          <p className="mt-6 max-w-xl text-[0.9375rem] leading-relaxed text-ivory/85 sm:text-base">
            From the hills where Indian coffee found its home, Auburn brings carefully sourced
            coffee, estate products and flavours crafted with character.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/shop" search={{}}>
              <Button size="lg">Shop Coffee</Button>
            </Link>
            <Link to="/story">
              <Button size="lg" variant="outline" className="border-ivory/50 text-ivory">
                Discover Our Story
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section className="container-editorial py-20 sm:py-24">
        <SectionHeading
          eyebrow="Featured collections"
          title="Choose your coffee"
          intro="Six ways into the estate — from a bright washed micro-lot to the filter blend that starts most mornings in Karnataka."
        />
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
          {COLLECTIONS.map((c) => (
            <Link
              key={c.slug}
              to="/shop"
              search={{ category: c.slug }}
              className="group relative isolate flex aspect-[4/5] items-end overflow-hidden bg-secondary sm:aspect-[3/2]"
            >
              <img
                src={c.image}
                alt={`${c.label} from Auburn Coffee`}
                loading="lazy"
                width={1280}
                height={1280}
                className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 -z-10 bg-espresso/40" aria-hidden="true" />
              <span className="p-4 font-display text-lg text-ivory sm:p-6 sm:text-2xl">
                {c.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="bg-secondary py-20 sm:py-24">
        <div className="container-editorial">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Best sellers"
              title="What our regulars reorder"
              intro="Rated by the people who drink it every week."
            />
            <Link to="/shop" search={{}} className="hidden items-center gap-2 text-sm text-primary sm:flex">
              View all products <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] w-full" />
                ))
              : bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ORIGIN STORY */}
      <section className="container-editorial grid gap-12 py-20 sm:py-24 lg:grid-cols-2 lg:items-center">
        <img
          src="/images/gallery-cherries.jpg"
          alt="Ripe red coffee cherries on the branch after early morning rain"
          loading="lazy"
          width={1280}
          height={1280}
          className="aspect-[4/5] w-full object-cover"
        />
        <div>
          <SectionHeading
            eyebrow="The origin"
            title="Where Indian coffee found its home"
            intro="Chikkamagaluru is where coffee first took root in India, on slopes that hold monsoon mist late into the morning. Elevation, shade and a long, slow ripening season give the coffee here its particular sweetness."
          />
          <p className="mt-5 text-[0.9375rem] leading-relaxed text-muted-foreground">
            The estates are small and mostly family-held. Pepper vines climb the silver oaks,
            cardamom grows in the wetter corners, and the picking still happens in passes, by hand,
            because the cherries never ripen all at once. We buy lot by lot, keep them separate, and
            roast to what each one already is.
          </p>
          <Link to="/story" className="mt-8 inline-block">
            <Button variant="forest">Discover the Origin</Button>
          </Link>
        </div>
      </section>

      {/* WHY AUBURN */}
      <section className="bg-forest py-20 text-forest-foreground sm:py-24">
        <div className="container-editorial">
          <p className="eyebrow text-forest-foreground/65">Why Auburn</p>
          <h2 className="mt-3 max-w-2xl text-3xl leading-[1.15] sm:text-4xl">
            Fewer lots, chosen carefully
          </h2>
          <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Origin-focused sourcing", "Every lot is traced to a named estate and block."],
              ["Carefully selected coffee", "We reject far more than we buy. Cup score decides."],
              ["Small-batch quality", "Roasted in batches sized to actual orders."],
              ["Freshness", "Roast date on every pouch, dispatched within days."],
              ["Traceability", "Variety, process, altitude and harvest, all on the label."],
              ["Thoughtful processing", "Washed, natural and honey lots dried on our own beds."],
            ].map(([title, body]) => (
              <div key={title} className="border-t border-forest-foreground/20 pt-5">
                <h3 className="text-lg">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-forest-foreground/70">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COFFEE JOURNEY */}
      <section className="container-editorial py-20 sm:py-24">
        <SectionHeading
          eyebrow="The coffee journey"
          title="Seed to cup, seven steps"
          intro="Nothing here is unusual on an estate. It is only rarely written down."
        />
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {JOURNEY.map(([step, body], i) => (
            <li key={step} className="border-t border-border pt-5">
              <span className="eyebrow text-primary">Step {i + 1}</span>
              <h3 className="mt-2 text-xl">{step}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="container-editorial pb-20 sm:pb-24">
        <SectionHeading eyebrow="Featured" title="Explore the collection" />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4]" />)
          ) : featured.length ? (
            featured.slice(0, 6).map((p) => <ProductCard key={p.id} product={p} />)
          ) : (
            <div className="sm:col-span-2 lg:col-span-3">
              <EmptyState
                title="Nothing featured yet"
                description="Our featured selection is being updated. The full catalogue is still open."
                action={
                  <Link to="/shop" search={{}}>
                    <Button>Browse all coffee</Button>
                  </Link>
                }
              />
            </div>
          )}
        </div>
      </section>

      {/* BULK */}
      <section className="relative isolate">
        <img
          src="/images/gallery-harvest.jpg"
          alt="Estate workers gathering hand-picked coffee cherries into a woven basket"
          loading="lazy"
          width={1280}
          height={1280}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <span className="absolute inset-0 -z-10 bg-espresso/70" aria-hidden="true" />
        <div className="container-editorial py-20 text-center sm:py-28">
          <p className="eyebrow text-ivory/70">Bulk & corporate</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl text-ivory sm:text-4xl">
            Coffee for offices, cafés, hotels and businesses.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ivory/80">
            Consistent lots, repeat schedules and grind profiles matched to your equipment.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link to="/bulk-orders">
              <Button size="lg">Explore Bulk Orders</Button>
            </Link>
            <a
              href={whatsappLink("Hello Auburn Coffee, I would like to discuss a bulk order.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline" className="border-ivory/50 text-ivory">
                Discuss on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      <section className="container-editorial py-20 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Gallery" title="From the estate" />
          <Link to="/gallery" className="flex items-center gap-2 text-sm text-primary">
            See the full gallery <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(gallery.data ?? []).slice(0, 4).map((g) => (
            <img
              key={g.id}
              src={g.image_url}
              alt={g.alt_text}
              loading="lazy"
              width={1280}
              height={1280}
              className="aspect-square w-full object-cover"
            />
          ))}
        </div>
      </section>

      {/* FEEDBACK */}
      <section className="bg-secondary py-20 sm:py-24">
        <div className="container-editorial">
          <SectionHeading eyebrow="Customer feedback" title="In their words" align="center" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(reviews.data ?? []).slice(0, 3).map((r) => (
              <figure key={r.id} className="border border-border bg-card p-6">
                <Stars rating={r.rating} />
                <blockquote className="mt-4 text-[0.9375rem] leading-relaxed text-foreground/85">
                  “{r.feedback}”
                </blockquote>
                <figcaption className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {r.name}
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/feedback">
              <Button variant="quiet">Share your feedback</Button>
            </Link>
          </div>
        </div>
      </section>

    </>
  );
}
