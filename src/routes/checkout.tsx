import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useCart } from "@/context/cart";
import { useAuth } from "@/hooks/useAuth";
import { db, queries } from "@/lib/api";
import { Button, EmptyState, Field, Input, Select, Textarea } from "@/components/ui-kit";
import { formatINR } from "@/config/site";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Auburn Coffee" },
      {
        name: "description",
        content: "Complete your Auburn Coffee order. UPI payment, confirmed over WhatsApp.",
      },
      { property: "og:title", content: "Checkout — Auburn Coffee" },
      { property: "og:description", content: "UPI checkout, confirmed over WhatsApp." },
      { name: "twitter:title", content: "Checkout — Auburn Coffee" },
      { name: "twitter:description", content: "UPI checkout, confirmed over WhatsApp." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const STEPS = ["Customer Details", "Delivery Address", "Order Review", "Payment"];

interface Form {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
  saveAddress: boolean;
}

function Checkout() {
  const { lines, subtotal, shipping, total, clear } = useCart();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const addresses = useQuery({ ...queries.myAddresses(), enabled: Boolean(user) });
  const profile = useQuery({ ...queries.myProfile(user?.id ?? ""), enabled: Boolean(user) });

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<Form>({
    name: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
    saveAddress: true,
  });

  useEffect(() => {
    track("checkout_started", { lines: lines.length });
  }, [lines.length]);

  useEffect(() => {
    if (profile.data) {
      setForm((f) => ({
        ...f,
        name: f.name || profile.data?.full_name || "",
        email: f.email || profile.data?.email || user?.email || "",
        phone: f.phone || profile.data?.mobile || "",
      }));
    }
  }, [profile.data, user?.email]);

  function useSavedAddress(id: string) {
    const a = (addresses.data ?? []).find((x: any) => x.id === id);
    if (!a) return;
    setForm((f) => ({
      ...f,
      name: a.recipient_name ?? f.name,
      phone: a.phone ?? f.phone,
      line1: a.line1 ?? "",
      line2: a.line2 ?? "",
      city: a.city ?? "",
      state: a.state ?? "",
      pincode: a.pincode ?? "",
      saveAddress: false,
    }));
  }

  function validate(current: number) {
    const e: Record<string, string> = {};
    if (current === 0) {
      if (form.name.trim().length < 2) e.name = "Please enter your full name.";
      if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Please enter a valid email address.";
      if (!/^[0-9]{10}$/.test(form.phone.replace(/\D/g, "").slice(-10)))
        e.phone = "Please enter a 10-digit mobile number.";
    }
    if (current === 1) {
      if (form.line1.trim().length < 5) e.line1 = "Please enter your street address.";
      if (!form.city.trim()) e.city = "Please enter your city.";
      if (!form.state.trim()) e.state = "Please enter your state.";
      if (!/^[0-9]{6}$/.test(form.pincode.trim())) e.pincode = "Please enter a 6-digit pincode.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const addressText = [
    form.line1,
    form.line2,
    `${form.city}, ${form.state} ${form.pincode}`,
  ]
    .filter((s) => s && s.trim())
    .join("\n");

  async function placeOrder() {
    if (!user) return;
    setSubmitting(true);
    try {
      const orderRes = await db
        .from("orders")
        .insert({
          user_id: user.id,
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          delivery_address: addressText,
          subtotal,
          shipping,
          total,
          status: "Awaiting Payment",
          payment_method: "UPI",
          notes: form.notes || null,
        })
        .select("id, order_number")
        .single();

      if (orderRes.error) throw new Error(orderRes.error.message);
      const order = orderRes.data as { id: string; order_number: string };

      const itemsRes = await db.from("order_items").insert(
        lines.map((l) => ({
          order_id: order.id,
          product_id: l.productId,
          product_name: l.name,
          variant_label: l.variantLabel,
          grind: l.grind,
          unit_price: l.unitPrice,
          quantity: l.quantity,
        })),
      );
      if (itemsRes.error) throw new Error(itemsRes.error.message);

      if (form.saveAddress) {
        await db.from("addresses").insert({
          user_id: user.id,
          label: "Delivery",
          recipient_name: form.name,
          phone: form.phone,
          line1: form.line1,
          line2: form.line2 || null,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        });
      }

      track("order_created", { order: order.order_number, total });
      clear();
      navigate({ to: "/order/$orderNumber", params: { orderNumber: order.order_number } });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "We couldn't create your order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="container-editorial py-16">
        <EmptyState
          title="Nothing to check out"
          description="Your cart is empty. Add a coffee and we'll take it from there."
          action={
            <Link to="/shop" search={{}}>
              <Button>Explore the Collection</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (!loading && !user) {
    return (
      <div className="container-editorial py-16">
        <EmptyState
          title="Sign in to place your order"
          description="We keep your order history and saved addresses in your account, so reordering takes seconds."
          action={
            <Link to="/auth" search={{ redirect: "/checkout" }}>
              <Button>Sign in or create an account</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-editorial py-12 sm:py-16">
      <p className="eyebrow">Checkout</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">Almost there</h1>

      <ol className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs">
        {STEPS.map((s, i) => (
          <li
            key={s}
            aria-current={i === step ? "step" : undefined}
            className={`flex items-center gap-2 font-semibold uppercase tracking-[0.12em] ${
              i === step ? "text-primary" : i < step ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <span className="grid h-6 w-6 place-items-center rounded-full border border-current">
              {i < step ? "✓" : i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="border border-border bg-card p-6 sm:p-8">
          {step === 0 ? (
            <div className="space-y-5">
              <h2 className="text-2xl">Customer details</h2>
              <Field label="Full name" htmlFor="c-name" required error={errors.name}>
                <Input
                  id="c-name"
                  value={form.name}
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "c-name-error" : undefined}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field label="Email" htmlFor="c-email" required error={errors.email}>
                <Input
                  id="c-email"
                  type="email"
                  value={form.email}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "c-email-error" : undefined}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
              <Field
                label="Mobile number"
                htmlFor="c-phone"
                required
                error={errors.phone}
                hint="We'll use this on WhatsApp to confirm your order."
              >
                <Input
                  id="c-phone"
                  type="tel"
                  inputMode="numeric"
                  value={form.phone}
                  autoComplete="tel"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? "c-phone-error" : undefined}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Field>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-5">
              <h2 className="text-2xl">Delivery address</h2>
              {(addresses.data ?? []).length ? (
                <Field label="Use a saved address" htmlFor="saved-address">
                  <Select id="saved-address" onChange={(e) => useSavedAddress(e.target.value)}>
                    <option value="">Enter a new address</option>
                    {(addresses.data ?? []).map((a: any) => (
                      <option key={a.id} value={a.id}>
                        {a.line1}, {a.city} {a.pincode}
                      </option>
                    ))}
                  </Select>
                </Field>
              ) : null}
              <Field label="Address line 1" htmlFor="a1" required error={errors.line1}>
                <Input
                  id="a1"
                  value={form.line1}
                  autoComplete="address-line1"
                  aria-invalid={Boolean(errors.line1)}
                  aria-describedby={errors.line1 ? "a1-error" : undefined}
                  onChange={(e) => setForm({ ...form, line1: e.target.value })}
                />
              </Field>
              <Field label="Address line 2" htmlFor="a2">
                <Input
                  id="a2"
                  value={form.line2}
                  autoComplete="address-line2"
                  onChange={(e) => setForm({ ...form, line2: e.target.value })}
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="City" htmlFor="city" required error={errors.city}>
                  <Input
                    id="city"
                    value={form.city}
                    autoComplete="address-level2"
                    aria-invalid={Boolean(errors.city)}
                    aria-describedby={errors.city ? "city-error" : undefined}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </Field>
                <Field label="State" htmlFor="state" required error={errors.state}>
                  <Input
                    id="state"
                    value={form.state}
                    autoComplete="address-level1"
                    aria-invalid={Boolean(errors.state)}
                    aria-describedby={errors.state ? "state-error" : undefined}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  />
                </Field>
                <Field label="Pincode" htmlFor="pin" required error={errors.pincode}>
                  <Input
                    id="pin"
                    inputMode="numeric"
                    value={form.pincode}
                    autoComplete="postal-code"
                    aria-invalid={Boolean(errors.pincode)}
                    aria-describedby={errors.pincode ? "pin-error" : undefined}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Order notes (optional)" htmlFor="notes">
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Landmark, delivery timing, gift message…"
                />
              </Field>
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-primary"
                  checked={form.saveAddress}
                  onChange={(e) => setForm({ ...form, saveAddress: e.target.checked })}
                />
                Save this address to my account
              </label>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-6">
              <h2 className="text-2xl">Review your order</h2>
              <ul className="divide-y divide-border border-y border-border">
                {lines.map((l) => (
                  <li key={l.key} className="flex justify-between gap-4 py-3 text-sm">
                    <span>
                      {l.name}
                      <span className="block text-xs text-muted-foreground">
                        {[l.variantLabel, l.grind].filter(Boolean).join(" · ")} × {l.quantity}
                      </span>
                    </span>
                    <span className="font-semibold">{formatINR(l.unitPrice * l.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="text-sm">
                <h3 className="eyebrow">Delivering to</h3>
                <p className="mt-2 whitespace-pre-line">
                  {form.name}
                  {"\n"}
                  {addressText}
                  {"\n"}
                  {form.phone}
                </p>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-5">
              <h2 className="text-2xl">Payment</h2>
              <div className="border border-primary/30 bg-secondary p-5">
                <p className="text-sm font-semibold">UPI only</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  We accept UPI payments only — no cards, net banking or cash on delivery. When you
                  place the order we'll create your order reference, then open WhatsApp with the full
                  summary so we can share the UPI details and confirm payment.
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Your order will be created with the status <strong>Awaiting Payment</strong> and moves
                to <strong>Payment Confirmed</strong> once our team verifies your UPI transfer.
              </p>
              <Button block size="lg" disabled={submitting} onClick={placeOrder}>
                {submitting ? "Creating your order…" : "Place Order & Pay via WhatsApp"}
              </Button>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            {step > 0 ? (
              <Button variant="quiet" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            ) : (
              <Link to="/cart">
                <Button variant="quiet">Back to cart</Button>
              </Link>
            )}
            {step < 3 ? (
              <Button
                onClick={() => {
                  if (validate(step)) setStep((s) => s + 1);
                }}
              >
                Continue
              </Button>
            ) : null}
          </div>
        </div>

        <aside className="h-fit border border-border bg-card p-6 lg:sticky lg:top-28">
          <h2 className="text-xl">Summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Product subtotal</dt>
              <dd>{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping charges</dt>
              <dd>{shipping === 0 ? "Free" : formatINR(shipping)}</dd>
            </div>
            <div className="hairline flex justify-between pt-3">
              <dt className="font-semibold">Total amount</dt>
              <dd className="text-base font-semibold">{formatINR(total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
