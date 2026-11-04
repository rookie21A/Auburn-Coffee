import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/context/cart";
import { useAuth } from "@/hooks/useAuth";
import { Button, Input } from "@/components/ui-kit";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import logo from "@/assets/auburn-logo.png.asset.json";

type NavItem = {
  label: string;
  to: "/" | "/shop" | "/bulk-orders" | "/story" | "/gallery" | "/feedback";
  search?: Record<string, string | undefined>;
};

/** Buying sections — grouped under Shop in both the desktop dropdown and the mobile menu. */
const SHOP_MENU: NavItem[] = [
  { label: "All Products", to: "/shop", search: {} },
  { label: "Seeds / Green Coffee", to: "/shop", search: { category: "green-coffee-beans" } },
  { label: "Spices", to: "/shop", search: { category: "spices" } },
  { label: "Bulk Orders", to: "/bulk-orders", search: undefined },
];

/** Editorial pages shown at the top level. */
const SECONDARY: NavItem[] = [
  { label: "Our Story", to: "/story", search: undefined },
  { label: "Gallery", to: "/gallery", search: undefined },
  { label: "Feedback", to: "/feedback", search: undefined },
];

function navCls(active: boolean) {
  return cn(
    "link-underline py-2 transition-colors hover:text-primary",
    active ? "text-primary" : "text-foreground/80",
  );
}

export function Header() {
  const { count } = useCart();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const shopActive = pathname === "/shop" || pathname === "/bulk-orders";

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setShopOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
    setShopOpen(false);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchOpen(false);
    closeMenu();
    navigate({ to: "/shop", search: { q: term.trim() || undefined } });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="container-editorial flex h-16 items-center justify-between gap-4 md:h-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="-ml-2 flex h-11 w-11 items-center justify-center lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
          <Link to="/" className="flex items-center" aria-label="Auburn Coffee home">
            <img
              src={logo.url}
              alt="Auburn Coffee"
              width={1151}
              height={581}
              className="h-14 w-auto md:h-16"
            />
          </Link>
        </div>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-6 text-[0.8125rem]">
            <li>
              <Link
                to="/"
                className={navCls(pathname === "/")}
                activeOptions={{ exact: true }}
              >
                Home
              </Link>
            </li>
            <li className="flex items-center">
              <Popover>
                <PopoverTrigger
                  className={cn(
                    "flex items-center gap-1.5 py-2 transition-colors hover:text-primary",
                    shopActive ? "text-primary" : "text-foreground/80",
                  )}
                >
                  Shop
                  <ChevronDown size={14} aria-hidden="true" className="opacity-60" />
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  sideOffset={10}
                  className="w-60 rounded-none border-border bg-card p-2"
                >
                  <ul className="space-y-1">
                    {SHOP_MENU.map((item) => (
                      <li key={item.label}>
                        <Link
                          to={item.to}
                          search={item.search as never}
                          className="flex min-h-10 items-center px-3 text-[0.8125rem] text-foreground/85 transition-colors hover:bg-secondary hover:text-primary"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </PopoverContent>
              </Popover>
            </li>
            {SECONDARY.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  search={item.search as never}
                  className={navCls(pathname === item.to)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center hover:text-primary"
            aria-expanded={searchOpen}
            aria-label="Search products"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search size={18} aria-hidden="true" />
          </button>
          <Link
            to={user ? "/account" : "/auth"}
            className="flex h-11 w-11 items-center justify-center hover:text-primary"
            aria-label={user ? "Your account" : "Sign in"}
          >
            <User size={18} aria-hidden="true" />
          </Link>
          <Link
            to="/cart"
            className="relative flex h-11 w-11 items-center justify-center hover:text-primary"
            aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
          >
            <ShoppingBag size={18} aria-hidden="true" />
            {count > 0 ? (
              <span className="absolute right-1 top-1.5 min-w-4 rounded-full bg-primary px-1 text-center text-[0.625rem] font-bold leading-4 text-primary-foreground">
                {count}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      {searchOpen ? (
        <div className="border-t border-border bg-card">
          <form onSubmit={submitSearch} className="container-editorial flex gap-2 py-3" role="search">
            <label htmlFor="site-search" className="sr-only">
              Search coffee, spices and origins
            </label>
            <Input
              id="site-search"
              ref={searchRef}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Try “peaberry”, “washed”, “cardamom”…"
            />
            <Button type="submit" size="md">
              Search
            </Button>
          </form>
        </div>
      ) : null}

      <div
        id="mobile-nav"
        className={cn(
          "overflow-hidden border-t border-border bg-card lg:hidden",
          menuOpen ? "block" : "hidden",
        )}
      >
        <nav aria-label="Mobile" className="container-editorial py-3">
          <ul className="divide-y divide-border">
            <li>
              <Link
                to="/"
                onClick={closeMenu}
                activeOptions={{ exact: true }}
                className="flex min-h-12 items-center text-[0.9375rem]"
              >
                Home
              </Link>
            </li>
            <li>
              <button
                type="button"
                aria-expanded={shopOpen}
                aria-controls="mobile-shop"
                onClick={() => setShopOpen((v) => !v)}
                className="flex min-h-12 w-full items-center justify-between text-left text-[0.9375rem]"
              >
                Shop
                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  className={cn("transition-transform", shopOpen && "rotate-180")}
                />
              </button>
              <ul id="mobile-shop" className={cn("pb-2", shopOpen ? "block" : "hidden")}>
                {SHOP_MENU.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      search={item.search as never}
                      onClick={closeMenu}
                      className="flex min-h-11 items-center border-l border-border pl-4 text-[0.875rem] text-muted-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            {SECONDARY.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  search={item.search as never}
                  onClick={closeMenu}
                  className="flex min-h-12 items-center text-[0.9375rem]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to={user ? "/account" : "/auth"}
                onClick={closeMenu}
                className="flex min-h-12 items-center text-[0.9375rem]"
              >
                {user ? "My Account" : "Sign In / Sign Up"}
              </Link>
            </li>
            {isAdmin ? (
              <li>
                <Link
                  to="/admin"
                  onClick={closeMenu}
                  className="flex min-h-12 items-center text-[0.9375rem] text-primary"
                >
                  Admin Dashboard
                </Link>
              </li>
            ) : null}
          </ul>
        </nav>
      </div>
    </header>
  );
}
