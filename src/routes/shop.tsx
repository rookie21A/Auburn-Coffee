import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { queries, variantsOf, type Product } from "@/lib/api";
import { ProductCard } from "@/components/site/ProductCard";
import { Button, EmptyState, Select, Skeleton } from "@/components/ui-kit";
import { GRIND_OPTIONS, PROCESSING_METHODS, ROAST_LEVELS, VARIETIES, formatINR } from "@/config/site";

interface ShopSearch {
  category?: string;
  q?: string;
  roast?: string;
  variety?: string;
  process?: string;
  grind?: string;
  weight?: string;
  availability?: string;
  maxPrice?: string;
  sort?: string;
}

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => {
    const pick = (k: string) =>
      typeof search[k] === "string" && search[k] !== "" ? (search[k] as string) : undefined;
    return {
      category: pick("category"),
      q: pick("q"),
      roast: pick("roast"),
      variety: pick("variety"),
      process: pick("process"),
      grind: pick("grind"),
      weight: pick("weight"),
      availability: pick("availability"),
      maxPrice: pick("maxPrice"),
      sort: pick("sort"),
    };
  },
  head: () => ({
    meta: [
      { title: "Shop Coffee, Green Beans & Spices — Auburn Coffee" },
      {
        name: "description",
        content:
          "Browse Auburn Coffee: speciality Arabica, South Indian filter coffee, roasted and ground beans, green coffee, seeds, cascara and estate spices.",
      },
      { property: "og:title", content: "Shop — Auburn Coffee" },
      {
        property: "og:description",
        content: "Filter by roast, variety, processing method, grind and weight.",
      },
      { name: "twitter:title", content: "Shop — Auburn Coffee" },
      { name: "twitter:description", content: "Speciality Indian coffee, green beans and spices." },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: Shop,
});

function matches(p: Product, s: ShopSearch) {
  if (s.category && p.category_slug !== s.category) return false;
  if (s.roast && p.roast_level !== s.roast) return false;
  if (s.variety && p.coffee_variety !== s.variety) return false;
  if (s.process && p.processing_method !== s.process) return false;
  if (s.grind && !(p.grind_options ?? []).includes(s.grind)) return false;
  if (s.weight && !variantsOf(p).some((v) => v.weight_label === s.weight)) return false;
  if (s.availability === "in-stock" && p.stock <= 0) return false;
  if (s.maxPrice) {
    const max = Number(s.maxPrice);
    const low = variantsOf(p)[0]?.price ?? p.price;
    if (Number(low) > max) return false;
  }
  if (s.q) {
    const needle = s.q.toLowerCase();
    const haystack = [
      p.name,
      p.category_slug,
      p.subcategory,
      p.origin,
      p.coffee_variety,
      p.processing_method,
      p.roast_level,
      p.short_description,
      ...(p.tasting_notes ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

function Shop() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const products = useQuery(queries.products());
  const categories = useQuery(queries.categories());
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useMemo(() => {
    const list = (products.data ?? []).filter((p) => matches(p, search));
    if (search.sort === "price-asc")
      list.sort((a, b) => Number(variantsOf(a)[0]?.price ?? a.price) - Number(variantsOf(b)[0]?.price ?? b.price));
    if (search.sort === "price-desc")
      list.sort((a, b) => Number(variantsOf(b)[0]?.price ?? b.price) - Number(variantsOf(a)[0]?.price ?? a.price));
    if (search.sort === "rating") list.sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0));
    return list;
  }, [products.data, search]);

  const set = (patch: Partial<ShopSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });

  const activeCategory = (categories.data ?? []).find((c) => c.slug === search.category);
  const weightOptions = ["250 g", "500 g", "1 kg"];

  const filterControls = (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
      <FilterSelect
        id="f-category"
        label="Category"
        value={search.category ?? ""}
        onChange={(v) => set({ category: v || undefined })}
        options={(categories.data ?? []).map((c) => ({ value: c.slug, label: c.name }))}
      />
      <FilterSelect
        id="f-roast"
        label="Roast level"
        value={search.roast ?? ""}
        onChange={(v) => set({ roast: v || undefined })}
        options={ROAST_LEVELS.map((r) => ({ value: r, label: r }))}
      />
      <FilterSelect
        id="f-variety"
        label="Coffee variety"
        value={search.variety ?? ""}
        onChange={(v) => set({ variety: v || undefined })}
        options={VARIETIES.map((r) => ({ value: r, label: r }))}
      />
      <FilterSelect
        id="f-process"
        label="Processing method"
        value={search.process ?? ""}
        onChange={(v) => set({ process: v || undefined })}
        options={PROCESSING_METHODS.map((r) => ({ value: r, label: r }))}
      />
      <FilterSelect
        id="f-grind"
        label="Grind / whole bean"
        value={search.grind ?? ""}
        onChange={(v) => set({ grind: v || undefined })}
        options={GRIND_OPTIONS.map((r) => ({ value: r, label: r }))}
      />
      <FilterSelect
        id="f-weight"
        label="Weight"
        value={search.weight ?? ""}
        onChange={(v) => set({ weight: v || undefined })}
        options={weightOptions.map((r) => ({ value: r, label: r }))}
      />
      <FilterSelect
        id="f-availability"
        label="Availability"
        value={search.availability ?? ""}
        onChange={(v) => set({ availability: v || undefined })}
        options={[{ value: "in-stock", label: "In stock only" }]}
      />
      <div className="space-y-1.5">
        <label htmlFor="f-price" className="block text-xs font-semibold tracking-wide">
          Maximum price {search.maxPrice ? `— ${formatINR(Number(search.maxPrice))}` : ""}
        </label>
        <input
          id="f-price"
          type="range"
          min={300}
          max={4000}
          step={100}
          value={search.maxPrice ?? 4000}
          onChange={(e) => set({ maxPrice: e.target.value === "4000" ? undefined : e.target.value })}
          className="h-11 w-full accent-primary"
        />
      </div>
      <Button
        variant="quiet"
        onClick={() =>
          navigate({
            search: {},
          })
        }
      >
        Clear all filters
      </Button>
    </div>
  );

  return (
    <div className="container-editorial py-12 sm:py-16">
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
          {activeCategory ? (
            <>
              <li aria-hidden="true">/</li>
              <li className="text-foreground">{activeCategory.name}</li>
            </>
          ) : null}
        </ol>
      </nav>

      <header className="mt-6 max-w-2xl">
        <p className="eyebrow">The collection</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">{activeCategory?.name ?? "Shop Auburn"}</h1>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
          {activeCategory?.description ??
            "Coffee, green beans, seeds, cascara and estate spices — all from Chikkamagaluru."}
        </p>
      </header>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {products.isLoading ? "Loading products…" : `${results.length} product${results.length === 1 ? "" : "s"}`}
          {search.q ? ` matching “${search.q}”` : ""}
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="sr-only">
            Sort products
          </label>
          <Select
            id="sort"
            value={search.sort ?? ""}
            onChange={(e) => set({ sort: e.target.value || undefined })}
            className="w-auto"
          >
            <option value="">Sort: Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating">Highest rated</option>
          </Select>
          <Button
            variant="quiet"
            className="lg:hidden"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            aria-controls="filter-panel"
          >
            <SlidersHorizontal size={15} aria-hidden="true" /> Filters
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside
          id="filter-panel"
          className={`${filtersOpen ? "block" : "hidden"} border border-border bg-card p-5 lg:block lg:border-0 lg:bg-transparent lg:p-0`}
        >
          <h2 className="eyebrow mb-5">Refine</h2>
          {filterControls}
        </aside>

        <div>
          {products.isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4]" />
              ))}
            </div>
          ) : products.isError ? (
            <EmptyState
              title="We couldn't load the catalogue"
              description="There was a problem reaching our store. Please check your connection and try again."
              action={<Button onClick={() => products.refetch()}>Try again</Button>}
            />
          ) : results.length === 0 ? (
            <EmptyState
              title={search.q ? `No results for “${search.q}”` : "Nothing matches those filters"}
              description="Try a broader search — a variety, a roast level, or a tasting note like “cocoa”."
              action={<Button onClick={() => navigate({ search: {} })}>Clear filters</Button>}
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold tracking-wide">
        {label}
      </label>
      <Select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
