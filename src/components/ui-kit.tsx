import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-sm px-5 text-[0.8125rem] font-semibold uppercase tracking-[0.12em] transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-copper",
        forest: "bg-forest text-forest-foreground hover:bg-olive",
        outline: "border border-foreground/25 text-foreground hover:bg-secondary",
        ghost: "text-foreground hover:bg-secondary",
        quiet: "border border-border bg-card text-foreground hover:bg-secondary",
        danger: "bg-destructive text-destructive-foreground hover:opacity-90",
      },
      size: {
        md: "min-h-11",
        lg: "min-h-13 px-7 text-sm",
        sm: "min-h-10 px-4 text-[0.6875rem]",
      },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", block: false },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export const inputClass =
  "min-h-11 w-full rounded-sm border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(inputClass, className)} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(inputClass, "min-h-28 py-2.5", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select ref={ref} className={cn(inputClass, "pr-8", className)} {...props} />
  ),
);
Select.displayName = "Select";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-xs font-semibold tracking-wide text-foreground">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
        {required ? <span className="sr-only"> (required)</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="mt-3 text-3xl leading-[1.15] sm:text-4xl">{title}</h2>
      {intro ? (
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">{intro}</p>
      ) : null}
    </div>
  );
}

export function Stars({ rating, className }: { rating: number; className?: string }) {
  const rounded = Math.round(rating);
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs text-gold", className)}>
      <span aria-hidden="true" className="tracking-[0.1em]">
        {"★".repeat(rounded)}
        <span className="text-muted-foreground/40">{"★".repeat(5 - rounded)}</span>
      </span>
      <span className="sr-only">{rating} out of 5 stars</span>
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "forest" | "auburn";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.14em]",
        tone === "neutral" && "bg-secondary text-secondary-foreground",
        tone === "forest" && "bg-forest text-forest-foreground",
        tone === "auburn" && "bg-primary text-primary-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="border border-border bg-card px-6 py-14 text-center">
      <h3 className="text-xl">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-secondary", className)} />;
}
