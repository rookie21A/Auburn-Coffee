import type { ReactNode } from "react";

export function LegalPage({
  title,
  updated = "January 2026",
  intro,
  children,
}: {
  title: string;
  updated?: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="container-editorial py-12 sm:py-16">
      <div className="max-w-3xl">
        <p className="eyebrow">Auburn Coffee</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">{title}</h1>
        <p className="mt-3 text-xs uppercase tracking-[0.12em] text-muted-foreground">
          Last updated {updated}
        </p>
        {intro ? (
          <p className="mt-6 text-[0.9375rem] leading-relaxed text-muted-foreground">{intro}</p>
        ) : null}
        <div className="mt-10 space-y-8">{children}</div>
      </div>
    </div>
  );
}

export function Clause({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl">{heading}</h2>
      <div className="mt-3 space-y-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
