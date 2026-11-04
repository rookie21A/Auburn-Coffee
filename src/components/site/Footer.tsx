import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SITE } from "@/config/site";
import { Button, Input } from "@/components/ui-kit";
import logo from "@/assets/auburn-logo.png.asset.json";

const shopLinks = [
  { label: "Filter Coffee", category: "filter-coffee" },
  { label: "Green Beans", category: "green-coffee-beans" },
  { label: "Coffee Seeds", category: "coffee-seeds" },
  { label: "Spices", category: "spices" },
];

export function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="mt-24 bg-forest text-forest-foreground">
      <div className="container-editorial grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="inline-block rounded-sm bg-background px-4 py-3">
            <img src={logo.url} alt="Auburn Coffee" width={1154} height={595} className="h-20 w-auto sm:h-24" />
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-forest-foreground/75">
            Estate-sourced coffee, green beans, cascara and spices from the hills of
            Chikkamagaluru, Karnataka — selected in small lots and roasted with care.
          </p>
          <form
            className="mt-8 max-w-sm"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.includes("@")) {
                toast.error("Please enter a valid email address.");
                return;
              }
              setEmail("");
              toast.success("Thank you — you're on the list.");
            }}
          >
            <label htmlFor="newsletter" className="eyebrow text-forest-foreground/70">
              Letters from the estate
            </label>
            <div className="mt-3 flex gap-2">
              <Input
                id="newsletter"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="border-forest-foreground/25 bg-forest text-forest-foreground placeholder:text-forest-foreground/45"
              />
              <Button type="submit" variant="primary">
                Join
              </Button>
            </div>
          </form>
        </div>

        <FooterColumn title="Shop">
          {shopLinks.map((l) => (
            <li key={l.category}>
              <Link to="/shop" search={{ category: l.category }} className="hover:text-copper">
                {l.label}
              </Link>
            </li>
          ))}
        </FooterColumn>

        <FooterColumn title="Company">
          <li>
            <Link to="/story" className="hover:text-copper">
              Our Story
            </Link>
          </li>
          <li>
            <Link to="/gallery" className="hover:text-copper">
              Gallery
            </Link>
          </li>
          <li>
            <Link to="/bulk-orders" className="hover:text-copper">
              Bulk Orders
            </Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-copper">
              Contact
            </Link>
          </li>
        </FooterColumn>

        <div className="space-y-10">
          <FooterColumn title="Support">
            <li>
              <Link to="/shipping-policy" className="hover:text-copper">
                Shipping
              </Link>
            </li>
            <li>
              <Link to="/returns-policy" className="hover:text-copper">
                Returns & Refunds
              </Link>
            </li>
            <li>
              <Link to="/cancellation-policy" className="hover:text-copper">
                Cancellation
              </Link>
            </li>
            <li>
              <Link to="/privacy-policy" className="hover:text-copper">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-copper">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-copper">
                FAQs
              </Link>
            </li>
          </FooterColumn>
        </div>
      </div>

      <div className="border-t border-forest-foreground/15">
        <div className="container-editorial flex flex-col gap-2 py-6 text-xs text-forest-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Auburn Coffee, Chikkamagaluru. All rights reserved.
          </p>
          <p>{SITE.email}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="eyebrow text-forest-foreground/70">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-sm text-forest-foreground/85">{children}</ul>
    </div>
  );
}
