import { type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button, SectionHeading } from "@/components/ui-kit";
import mullayanagiri from "@/assets/mullayanagiri-chikkamagaluru.jpg.asset.json";

export const Route = createFileRoute("/story")({
  head: () => ({
    meta: [
      { title: "Our Story — Auburn Coffee, Chikkamagaluru" },
      {
        name: "description",
        content:
          "Auburn Coffee's story: Chikkamagaluru's coffee heritage, estate culture, our sourcing philosophy, craftsmanship and the farm-to-cup journey.",
      },
      { property: "og:title", content: "Our Story — Auburn Coffee" },
      {
        property: "og:description",
        content: "Coffee heritage, sourcing and craftsmanship from the hills of Chikkamagaluru.",
      },
      { name: "twitter:title", content: "Our Story — Auburn Coffee" },
      { name: "twitter:description", content: "Coffee heritage and craftsmanship from Chikkamagaluru." },
    ],
    links: [{ rel: "canonical", href: "/story" }],
  }),
  component: Story,
});

type StorySection = {
  title: string;
  image: string;
  alt: string;
  body: string[];
  credit?: ReactNode;
};

const SECTIONS: StorySection[] = [
  {
    title: "Chikkamagaluru",
    image: mullayanagiri.url,
    alt: "Grassy shola slopes of Mullayanagiri, the highest peak in Chikkamagaluru district",
    credit: (
      <>
        Photo{" "}
        <a
          href="https://commons.wikimedia.org/wiki/File:Mullayanagiri,_Chikmagalur_district_of_Karnataka.jpg"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-primary"
        >
          RakeshRaju M
        </a>
        , via Wikimedia Commons ·{" "}
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-primary"
        >
          CC BY-SA 4.0
        </a>
      </>
    ),
    body: [
      "Chikkamagaluru sits in the Western Ghats, where the monsoon arrives early and leaves late. The hills hold mist until mid-morning, and the coffee ripens slowly under shade trees that were planted long before any of us were here.",
      "This is where coffee first took root in India — brought, the story goes, in a handful of seeds, and grown ever since on slopes that never quite flatten out.",
    ],
  },
  {
    title: "Coffee heritage",
    image: "/images/gallery-harvest.jpg",
    alt: "Hand-picking ripe coffee cherries into a woven basket",
    body: [
      "Most estates here are small and family-held, passed down rather than bought. The knowledge is the same: when to pick, how long to dry, which block will surprise you this year.",
      "We work with these families lot by lot. Nothing is bought blind, and nothing is blended to hide a weakness.",
    ],
  },
  {
    title: "Our philosophy",
    image: "/images/gallery-cherries.jpg",
    alt: "Ripe red coffee cherries on the branch",
    body: [
      "Buy less, choose better. We would rather release four excellent lots a season than twenty acceptable ones.",
      "We also believe a coffee should taste like where it came from, not like a house style imposed on it. The roast follows the lot.",
    ],
  },
  {
    title: "Sourcing",
    image: "/images/product-green.jpg",
    alt: "Unroasted green coffee beans in a linen sack",
    body: [
      "Every lot is traced to a named estate and, where we can, to a block within it. Variety, processing method, altitude and harvest window are recorded and printed.",
      "We pay above the local benchmark for selectively picked cherry, because that is the only way to get it.",
    ],
  },
  {
    title: "Craftsmanship",
    image: "/images/product-roasting.jpg",
    alt: "Roasted coffee beans leaving a small-batch drum roaster",
    body: [
      "Roasting happens in small batches, profiled per lot and cupped before release. Pouches carry a roast date, not a vague best-before.",
      "Grinding is done to order — dabara-fine for filter, coarse for press, and everything between.",
    ],
  },
  {
    title: "Farm to cup",
    image: "/images/gallery-brewing.jpg",
    alt: "South Indian filter coffee poured between a dabara and tumbler",
    body: [
      "Seed, plant, cherry, harvest, processing, roasting, brewing. Seven steps, most of them measured in years rather than minutes.",
      "The last one belongs to you. We try to make it as easy as possible to get right.",
    ],
  },
  {
    title: "Sustainability",
    image: "/images/product-spices.jpg",
    alt: "Estate black pepper and green cardamom in brass bowls",
    body: [
      "Shade-grown coffee keeps the canopy, and the canopy keeps the birds, the pepper vines and the soil. Intercropping with pepper and cardamom is not a marketing idea here; it is how the land has always been farmed.",
      "Cherry pulp returns to the blocks as compost. Cascara, once discarded, is now something we are proud to sell.",
    ],
  },
];

function Story() {
  return (
    <div>
      <section className="relative isolate">
        <img
          src="/images/hero-estate.jpg"
          alt="Morning mist over the coffee estates of Chikkamagaluru"
          width={1920}
          height={1280}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <span className="absolute inset-0 -z-10 bg-espresso/60" aria-hidden="true" />
        <div className="container-editorial py-28 sm:py-40">
          <p className="eyebrow text-ivory/75">Who we are</p>
          <h1 className="mt-5 max-w-3xl text-[2.5rem] leading-[1.05] text-ivory sm:text-6xl">
            A small house, on a hill, in coffee country.
          </h1>
          <p className="mt-6 max-w-xl text-[0.9375rem] leading-relaxed text-ivory/85">
            Auburn began with a simple frustration: the coffee grown around us was excellent, and
            almost none of it came back to us in a form worth drinking.
          </p>
        </div>
      </section>

      {SECTIONS.map((s, i) => (
        <section
          key={s.title}
          className="container-editorial grid gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16"
        >
          <figure className={i % 2 === 1 ? "lg:order-2" : ""}>
            <img
              src={s.image}
              alt={s.alt}
              loading="lazy"
              width={1280}
              height={1280}
              className="aspect-[4/3] w-full object-cover"
            />
            {s.credit ? (
              <figcaption className="mt-2 text-[0.6875rem] leading-snug text-muted-foreground/70">
                {s.credit}
              </figcaption>
            ) : null}
          </figure>
          <div>
            <SectionHeading eyebrow={`0${i + 1}`} title={s.title} />
            {s.body.map((p) => (
              <p key={p} className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
          </div>
        </section>
      ))}

      <section className="bg-secondary py-20 text-center sm:py-24">
        <div className="container-editorial">
          <h2 className="text-3xl sm:text-4xl">Taste the place</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground">
            Start with the filter blend if you grew up on decoction, or Hillside Arabica if you brew
            by hand.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/shop" search={{}}>
              <Button size="lg">Explore the Collection</Button>
            </Link>
            <Link to="/gallery">
              <Button size="lg" variant="quiet">
                See the estate
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
