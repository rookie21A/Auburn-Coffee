import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { db, queries } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Badge, Button, EmptyState, Field, Input, Skeleton } from "@/components/ui-kit";
import { formatINR } from "@/config/site";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account — Auburn Coffee" },
      {
        name: "description",
        content: "Your Auburn Coffee profile, saved addresses and order history.",
      },
      { property: "og:title", content: "My Account — Auburn Coffee" },
      { property: "og:description", content: "Profile, addresses and order history." },
      { name: "twitter:title", content: "My Account — Auburn Coffee" },
      { name: "twitter:description", content: "Profile, addresses and order history." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Account,
});

type Tab = "profile" | "addresses" | "orders";

function Account() {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("profile");

  const profile = useQuery({ ...queries.myProfile(user?.id ?? ""), enabled: Boolean(user) });
  const addresses = useQuery({ ...queries.myAddresses(), enabled: Boolean(user) });
  const orders = useQuery({ ...queries.myOrders(), enabled: Boolean(user) });

  const [profileForm, setProfileForm] = useState({ full_name: "", mobile: "", email: "" });
  useEffect(() => {
    if (profile.data) {
      setProfileForm({
        full_name: profile.data.full_name ?? "",
        mobile: profile.data.mobile ?? "",
        email: profile.data.email ?? user?.email ?? "",
      });
    }
  }, [profile.data, user?.email]);

  const [addr, setAddr] = useState({
    recipient_name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  if (loading) {
    return (
      <div className="container-editorial space-y-4 py-16">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-editorial py-16">
        <EmptyState
          title="Sign in to view your account"
          description="Your profile, saved addresses and orders live here."
          action={
            <Link to="/auth" search={{ redirect: "/account" }}>
              <Button>Sign in</Button>
            </Link>
          }
        />
      </div>
    );
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await db
      .from("profiles")
      .update({
        full_name: profileForm.full_name,
        mobile: profileForm.mobile,
        email: profileForm.email,
      })
      .eq("id", user!.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile updated.");
    qc.invalidateQueries({ queryKey: ["profile"] });
  }

  async function addAddress(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await db.from("addresses").insert({ ...addr, user_id: user!.id });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Address saved.");
    setAddr({ recipient_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" });
    qc.invalidateQueries({ queryKey: ["addresses"] });
  }

  async function deleteAddress(id: string) {
    const { error } = await db.from("addresses").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["addresses"] });
  }

  return (
    <div className="container-editorial py-12 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your account</p>
          <h1 className="mt-3 text-4xl">
            {profileForm.full_name ? profileForm.full_name.split(" ")[0] : "Welcome"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex gap-3">
          {isAdmin ? (
            <Link to="/admin">
              <Button variant="forest">Admin Dashboard</Button>
            </Link>
          ) : null}
          <Button
            variant="quiet"
            onClick={async () => {
              await signOut();
              toast.success("Signed out.");
              navigate({ to: "/" });
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="mt-10 border-b border-border">
        <div role="tablist" aria-label="Account sections" className="flex gap-6">
          {(
            [
              ["profile", "Profile"],
              ["addresses", "Saved Addresses"],
              ["orders", "Order History"],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`-mb-px min-h-11 border-b-2 text-sm font-semibold ${
                tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 max-w-3xl">
        {tab === "profile" ? (
          <form onSubmit={saveProfile} className="space-y-5 border border-border bg-card p-6">
            <h2 className="text-2xl">Profile</h2>
            <Field label="Full name" htmlFor="p-name" required>
              <Input
                id="p-name"
                value={profileForm.full_name}
                required
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
              />
            </Field>
            <Field label="Mobile number" htmlFor="p-mobile">
              <Input
                id="p-mobile"
                type="tel"
                value={profileForm.mobile}
                onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
              />
            </Field>
            <Field label="Email" htmlFor="p-email">
              <Input
                id="p-email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              />
            </Field>
            <Button type="submit">Save changes</Button>
          </form>
        ) : null}

        {tab === "addresses" ? (
          <div className="space-y-8">
            {(addresses.data ?? []).length ? (
              <ul className="grid gap-4 sm:grid-cols-2">
                {(addresses.data ?? []).map((a: any) => (
                  <li key={a.id} className="border border-border bg-card p-5 text-sm">
                    <p className="font-semibold">{a.recipient_name}</p>
                    <p className="mt-1 whitespace-pre-line text-muted-foreground">
                      {[a.line1, a.line2, `${a.city}, ${a.state} ${a.pincode}`]
                        .filter(Boolean)
                        .join("\n")}
                    </p>
                    <p className="mt-1 text-muted-foreground">{a.phone}</p>
                    <button
                      type="button"
                      onClick={() => deleteAddress(a.id)}
                      className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No saved addresses yet.</p>
            )}

            <form onSubmit={addAddress} className="space-y-5 border border-border bg-card p-6">
              <h2 className="text-2xl">Add an address</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Recipient name" htmlFor="ad-name" required>
                  <Input
                    id="ad-name"
                    required
                    value={addr.recipient_name}
                    onChange={(e) => setAddr({ ...addr, recipient_name: e.target.value })}
                  />
                </Field>
                <Field label="Phone" htmlFor="ad-phone" required>
                  <Input
                    id="ad-phone"
                    type="tel"
                    required
                    value={addr.phone}
                    onChange={(e) => setAddr({ ...addr, phone: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Address line 1" htmlFor="ad-1" required>
                <Input
                  id="ad-1"
                  required
                  value={addr.line1}
                  onChange={(e) => setAddr({ ...addr, line1: e.target.value })}
                />
              </Field>
              <Field label="Address line 2" htmlFor="ad-2">
                <Input
                  id="ad-2"
                  value={addr.line2}
                  onChange={(e) => setAddr({ ...addr, line2: e.target.value })}
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="City" htmlFor="ad-city" required>
                  <Input
                    id="ad-city"
                    required
                    value={addr.city}
                    onChange={(e) => setAddr({ ...addr, city: e.target.value })}
                  />
                </Field>
                <Field label="State" htmlFor="ad-state" required>
                  <Input
                    id="ad-state"
                    required
                    value={addr.state}
                    onChange={(e) => setAddr({ ...addr, state: e.target.value })}
                  />
                </Field>
                <Field label="Pincode" htmlFor="ad-pin" required>
                  <Input
                    id="ad-pin"
                    required
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    value={addr.pincode}
                    onChange={(e) => setAddr({ ...addr, pincode: e.target.value })}
                  />
                </Field>
              </div>
              <Button type="submit">Save address</Button>
            </form>
          </div>
        ) : null}

        {tab === "orders" ? (
          orders.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (orders.data ?? []).length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="When you place your first order it will appear here with live status."
              action={
                <Link to="/shop" search={{}}>
                  <Button>Explore the Collection</Button>
                </Link>
              }
            />
          ) : (
            <ul className="space-y-4">
              {(orders.data ?? []).map((o) => (
                <li key={o.id} className="border border-border bg-card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{o.order_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <Badge tone={o.status === "Delivered" ? "forest" : "neutral"}>{o.status}</Badge>
                  </div>
                  <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
                    {(o.order_items ?? []).map((i) => (
                      <li key={i.id}>
                        {i.product_name} {i.variant_label ? `(${i.variant_label})` : ""} × {i.quantity}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold">{formatINR(Number(o.total))}</p>
                    <Link
                      to="/order/$orderNumber"
                      params={{ orderNumber: o.order_number }}
                      className="text-sm text-primary underline"
                    >
                      Order details
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : null}
      </div>
    </div>
  );
}
