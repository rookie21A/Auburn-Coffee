import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { queries } from "@/lib/api";
import { EmptyState, Skeleton } from "@/components/ui-kit";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Estates, Harvest & Roasting | Auburn Coffee" },
      {
        name: "description",
        content:
          "Photographs from the Auburn Coffee estates in Chikkamagaluru: harvest, coffee cherries, processing, roasting, brewing and the hills themselves.",
      },
      { property: "og:title", content: "Gallery — Auburn Coffee" },
      {
        property: "og:description",
        content: "Editorial photography from the coffee estates of Chikkamagaluru.",
      },
      { name: "twitter:title", content: "Gallery — Auburn Coffee" },
      { name: "twitter:description", content: "Photography from the estates of Chikkamagaluru." },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  component: Gallery,
});

function Gallery() {
  const gallery = useQuery(queries.gallery());
  const [filter, setFilter] = useState("All");

  const categories = useMemo(
    () => ["All", ...new Set((gallery.data ?? []).map((g) => g.category))],
    [gallery.data],
  );

  const images = (gallery.data ?? []).filter((g) => filter === "All" || g.category === filter);

  return (
    <div className="container-editorial py-12 sm:py-16">
      <p className="eyebrow">Gallery</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">From the estate</h1>
      <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-muted-foreground">
        Harvest passes, drying beds, roast days and the hills that hold the mist until mid-morning.
      </p>

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter gallery by category">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilter(c)}
            aria-pressed={filter === c}
            className={`min-h-10 border px-4 text-xs font-semibold uppercase tracking-[0.12em] ${
              filter === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {gallery.isLoading ? (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No photographs here yet"
            description="This category is being added to. Try another part of the estate."
          />
        </div>
      ) : (
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4">
          {images.map((g) => (
            <li key={g.id} className="group">
              <figure>
                <img
                  src={g.image_url}
                  alt={g.alt_text}
                  loading="lazy"
                  width={1280}
                  height={1280}
                  className="aspect-square w-full object-cover transition-opacity duration-500 group-hover:opacity-90"
                />
                <figcaption className="mt-2 text-xs text-muted-foreground">
                  {g.title} · {g.category}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
