import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/context/cart";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-4 text-4xl">This page has wandered off the estate</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you are looking for doesn't exist or has moved. Our coffee, thankfully, is
          exactly where it should be.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/shop"
            className="inline-flex min-h-11 items-center justify-center bg-primary px-5 text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-primary-foreground"
          >
            Explore the Collection
          </Link>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center border border-foreground/25 px-5 text-[0.8125rem] font-semibold uppercase tracking-[0.12em]"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-4 text-3xl">This page didn't load</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The connection may have dropped. Try again, or head back home.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex min-h-11 items-center justify-center bg-primary px-5 text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-primary-foreground"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex min-h-11 items-center justify-center border border-foreground/25 px-5 text-[0.8125rem] font-semibold uppercase tracking-[0.12em]"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Auburn Coffee — Speciality Coffee from Chikkamagaluru" },
      {
        name: "description",
        content:
          "Estate-sourced speciality Arabica, filter coffee, green beans, cascara and spices from Chikkamagaluru, Karnataka.",
      },
      { name: "author", content: "Auburn Coffee" },
      { property: "og:site_name", content: "Auburn Coffee" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Manrope:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Auburn Coffee",
          description:
            "Speciality coffee, green beans, cascara and estate spices from Chikkamagaluru, Karnataka.",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Estate Road",
            addressLocality: "Chikkamagaluru",
            addressRegion: "Karnataka",
            postalCode: "577101",
            addressCountry: "IN",
          },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main id="main" className="flex-1">
              {/* Required: nested routes render here. */}
              <Outlet />
            </main>
            <Footer />
          </div>
          <Toaster position="top-center" />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
