import { forwardRef } from "react";

import { cn } from "@/lib/utils";
import { LoadingIndicator } from "./loading-indicator";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: "solid" | "outline";
};

const VARIANT_STYLES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  solid:
    "bg-brand-solid text-content-on-solid hover:bg-brand-solid-hover disabled:opacity-50",
  outline:
    "border border-line bg-surface text-content-brand hover:bg-brand-subtle disabled:opacity-60",
};

/** Primary brand button. `outline` is the low-emphasis variant (e.g. Retry).
 *  When `loading`, it shows a spinner, is disabled, and marks itself busy for
 *  assistive tech. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    children,
    loading = false,
    variant = "solid",
    disabled,
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        "disabled:cursor-not-allowed",
        VARIANT_STYLES[variant],
        className,
      )}
      {...props}
    >
      {loading && <LoadingIndicator className="size-4" />}
      {children}
    </button>
  );
});
