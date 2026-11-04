import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { db, queries, type Product } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Badge, Button, EmptyState, Field, Input, Select, Skeleton, Stars } from "@/components/ui-kit";
import { ORDER_STATUSES, formatINR } from "@/config/site";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Auburn Coffee" },
      { name: "description", content: "Auburn Coffee store administration." },
      { property: "og:title", content: "Admin — Auburn Coffee" },
      { property: "og:description", content: "Store administration." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Admin,
});

type Tab = "orders" | "products" | "feedback" | "enquiries" | "gallery";

function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("orders");

  if (loading) return <div className="container-editorial py-16"><Skeleton className="h-40" /></div>;
  if (!user || !isAdmin) {
    return (
      <div className="container-editorial py-16">
        <EmptyState
          title="Admins only"
          description="This area is restricted to Auburn Coffee staff."
          action={<Link to={user ? "/account" : "/auth"}><Button>{user ? "Go to my account" : "Sign in"}</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="container-editorial py-12">
      <p className="eyebrow">Staff</p>
      <h1 className="mt-3 text-4xl">Store dashboard</h1>
      <div role="tablist" className="mt-8 flex flex-wrap gap-x-6 border-b border-border">
        {(["orders", "products", "feedback", "enquiries", "gallery"] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`-mb-px min-h-11 border-b-2 text-sm font-semibold capitalize ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-8">
        {tab === "orders" && <OrdersTab />}
        {tab === "products" && <ProductsTab />}
        {tab === "feedback" && <FeedbackTab />}
        {tab === "enquiries" && <EnquiriesTab />}
        {tab === "gallery" && <GalleryTab />}
      </div>
    </div>
  );
}

function OrdersTab() {
  const qc = useQueryClient();
  const orders = useQuery(queries.allOrders());
  async function setStatus(id: string, status: string) {
    const { error } = await db.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Order marked ${status}.`);
    qc.invalidateQueries({ queryKey: ["admin", "orders"] });
  }
  if (orders.isLoading) return <Skeleton className="h-40" />;
  if (!orders.data?.length) return <EmptyState title="No orders yet" description="New orders appear here as Awaiting Payment." />;
  return (
    <ul className="space-y-4">
      {orders.data.map((o) => (
        <li key={o.id} className="border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-semibold">{o.order_number}</p>
              <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("en-IN")}</p>
              <p className="mt-2 text-sm">{o.customer_name} · {o.customer_phone}</p>
              <p className="whitespace-pre-line text-xs text-muted-foreground">{o.delivery_address}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatINR(Number(o.total))}</p>
              <label className="sr-only" htmlFor={`st-${o.id}`}>Order status</label>
              <Select id={`st-${o.id}`} value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="mt-2 w-auto">
                {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </Select>
            </div>
          </div>
          <ul className="mt-3 text-sm text-muted-foreground">
            {(o.order_items ?? []).map((i) => (
              <li key={i.id}>{i.product_name} {[i.variant_label, i.grind].filter(Boolean).join(" · ")} × {i.quantity}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

function ProductsTab() {
  const qc = useQueryClient();
  const products = useQuery(queries.allProducts());
  const categories = useQuery(queries.categories());
  const [draft, setDraft] = useState({ name: "", category_slug: "filter-coffee", price: "", stock: "", image: "" });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  async function update(p: Product, patch: Partial<Product>) {
    const { error } = await db.from("products").update(patch).eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success(`${p.name} updated.`);
    refresh();
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name || !draft.price) return toast.error("Name and price are required.");
    const slug = draft.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const kind = draft.category_slug === "spices" ? "spice" : ["cascara", "coffee-seeds"].includes(draft.category_slug) ? "other" : "coffee";
    const { data, error } = await db.from("products").insert({
      name: draft.name, slug, category_slug: draft.category_slug, product_kind: kind,
      price: Number(draft.price), stock: Number(draft.stock || 0),
      images: draft.image ? [draft.image] : ["/images/product-beans.jpg"],
      origin: "Chikkamagaluru, Karnataka",
    }).select("id").single();
    if (error) return toast.error(error.message);
    await db.from("product_variants").insert({ product_id: data.id, weight_label: "250 g", weight_grams: 250, price: Number(draft.price), stock: Number(draft.stock || 0), sort_order: 1 });
    toast.success("Product added.");
    setDraft({ name: "", category_slug: "filter-coffee", price: "", stock: "", image: "" });
    refresh();
  }

  if (products.isLoading) return <Skeleton className="h-40" />;
  return (
    <div className="space-y-8">
      <form onSubmit={create} className="grid gap-4 border border-border bg-card p-5 sm:grid-cols-6">
        <div className="sm:col-span-2"><Field label="New product name" htmlFor="np-name"><Input id="np-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field></div>
        <Field label="Category" htmlFor="np-cat">
          <Select id="np-cat" value={draft.category_slug} onChange={(e) => setDraft({ ...draft, category_slug: e.target.value })}>
            {(categories.data ?? []).map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label="Price (₹)" htmlFor="np-price"><Input id="np-price" inputMode="numeric" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} /></Field>
        <Field label="Stock" htmlFor="np-stock"><Input id="np-stock" inputMode="numeric" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: e.target.value })} /></Field>
        <Field label="Image URL" htmlFor="np-img"><Input id="np-img" value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} /></Field>
        <div className="sm:col-span-6"><Button type="submit">Add product</Button></div>
      </form>

      <div className="overflow-x-auto border border-border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <tr><th className="p-3">Product</th><th className="p-3">Price</th><th className="p-3">Offer price</th><th className="p-3">Stock</th><th className="p-3">Featured</th><th className="p-3">Status</th></tr>
          </thead>
          <tbody>
            {(products.data ?? []).map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3 font-medium">{p.name}<span className="block text-xs text-muted-foreground">{p.category_slug}</span></td>
                <td className="p-3"><Input aria-label={`Price for ${p.name}`} defaultValue={p.price} className="w-24" onBlur={(e) => Number(e.target.value) !== Number(p.price) && update(p, { price: Number(e.target.value) })} /></td>
                <td className="p-3"><Input aria-label={`Offer price for ${p.name}`} defaultValue={p.discount_price ?? ""} className="w-24" onBlur={(e) => update(p, { discount_price: e.target.value ? Number(e.target.value) : null })} /></td>
                <td className="p-3"><Input aria-label={`Stock for ${p.name}`} defaultValue={p.stock} className="w-20" onBlur={(e) => Number(e.target.value) !== p.stock && update(p, { stock: Number(e.target.value) })} /></td>
                <td className="p-3"><input type="checkbox" aria-label={`Feature ${p.name}`} className="h-5 w-5 accent-primary" checked={p.featured} onChange={(e) => update(p, { featured: e.target.checked })} /></td>
                <td className="p-3"><Button size="sm" variant="quiet" onClick={() => update(p, { active: !p.active })}>{p.active ? "Archive" : "Restore"}</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FeedbackTab() {
  const qc = useQueryClient();
  const reviews = useQuery(queries.allReviews());
  async function setApproved(id: string, approved: boolean) {
    const { error } = await db.from("reviews").update({ approved }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    qc.invalidateQueries({ queryKey: ["reviews"] });
  }
  async function remove(id: string) {
    const { error } = await db.from("reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
  }
  if (reviews.isLoading) return <Skeleton className="h-40" />;
  if (!reviews.data?.length) return <EmptyState title="No feedback yet" description="Submissions appear here for approval." />;
  return (
    <ul className="space-y-4">
      {reviews.data.map((r) => (
        <li key={r.id} className="border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold">{r.name} <Stars rating={r.rating} className="ml-2" /></p>
            <Badge tone={r.approved ? "forest" : "neutral"}>{r.approved ? "Published" : "Pending"}</Badge>
          </div>
          <p className="mt-2 text-sm">{r.feedback}</p>
          <p className="mt-1 text-xs text-muted-foreground">{[r.contact, r.order_reference].filter(Boolean).join(" · ")}</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant={r.approved ? "quiet" : "primary"} onClick={() => setApproved(r.id, !r.approved)}>{r.approved ? "Unpublish" : "Approve"}</Button>
            <Button size="sm" variant="quiet" onClick={() => remove(r.id)}>Delete</Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function EnquiriesTab() {
  const qc = useQueryClient();
  const enquiries = useQuery(queries.allEnquiries());
  async function setStatus(id: string, status: string) {
    const { error } = await db.from("bulk_enquiries").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin", "enquiries"] });
  }
  if (enquiries.isLoading) return <Skeleton className="h-40" />;
  if (!enquiries.data?.length) return <EmptyState title="No enquiries yet" description="Bulk-order and contact messages appear here." />;
  return (
    <ul className="space-y-4">
      {enquiries.data.map((q) => (
        <li key={q.id} className="border border-border bg-card p-5 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{q.full_name}{q.company ? ` · ${q.company}` : ""}</p>
              <p className="text-xs text-muted-foreground">{q.email} · {q.phone} · {q.business_type ?? "—"}</p>
            </div>
            <Select aria-label="Enquiry status" value={q.status} onChange={(e) => setStatus(q.id, e.target.value)} className="w-auto">
              {["New", "Contacted", "Quoted", "Won", "Closed"].map((s) => <option key={s}>{s}</option>)}
            </Select>
          </div>
          <p className="mt-2">{[q.product_interest, q.expected_quantity, q.frequency].filter(Boolean).join(" · ")}</p>
          {q.message ? <p className="mt-2 text-muted-foreground">{q.message}</p> : null}
        </li>
      ))}
    </ul>
  );
}

function GalleryTab() {
  const qc = useQueryClient();
  const gallery = useQuery(queries.gallery());
  const [d, setD] = useState({ title: "", category: "Estates", image_url: "", alt_text: "" });
  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!d.title || !d.image_url || !d.alt_text) return toast.error("Title, image URL and alt text are required.");
    const { error } = await db.from("gallery_images").insert({ ...d, sort_order: (gallery.data?.length ?? 0) + 1 });
    if (error) return toast.error(error.message);
    setD({ title: "", category: "Estates", image_url: "", alt_text: "" });
    qc.invalidateQueries({ queryKey: ["gallery"] });
  }
  async function remove(id: string) {
    const { error } = await db.from("gallery_images").update({ active: false }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["gallery"] });
  }
  return (
    <div className="space-y-8">
      <form onSubmit={add} className="grid gap-4 border border-border bg-card p-5 sm:grid-cols-4">
        <Field label="Title" htmlFor="g-title"><Input id="g-title" value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} /></Field>
        <Field label="Category" htmlFor="g-cat">
          <Select id="g-cat" value={d.category} onChange={(e) => setD({ ...d, category: e.target.value })}>
            {["Estates", "Harvest", "Coffee Cherries", "Processing", "Roasting", "Products", "Brewing", "People", "Chikkamagaluru"].map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Image URL" htmlFor="g-url"><Input id="g-url" value={d.image_url} onChange={(e) => setD({ ...d, image_url: e.target.value })} /></Field>
        <Field label="Alt text" htmlFor="g-alt"><Input id="g-alt" value={d.alt_text} onChange={(e) => setD({ ...d, alt_text: e.target.value })} /></Field>
        <div className="sm:col-span-4"><Button type="submit">Add photo</Button></div>
      </form>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(gallery.data ?? []).map((g) => (
          <li key={g.id} className="border border-border bg-card">
            <img src={g.image_url} alt={g.alt_text} loading="lazy" className="aspect-square w-full object-cover" />
            <div className="flex items-center justify-between gap-2 p-2 text-xs">
              <span>{g.title}</span>
              <button className="text-muted-foreground hover:text-destructive" onClick={() => remove(g.id)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
