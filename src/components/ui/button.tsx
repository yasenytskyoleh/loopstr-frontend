import { forwardRef } from "react";

import { cn } from "@/lib/utils";
import { LoadingIndicator } from "./loading-indicator";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

/** Primary brand button. When `loading`, it shows a spinner, is disabled, and
 *  marks itself busy for assistive tech. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, children, loading = false, disabled, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg bg-brand-solid px-3 py-1.5 text-sm font-medium text-content-on-solid transition-colors",
        "hover:bg-brand-solid-hover",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {loading && <LoadingIndicator className="size-4" />}
      {children}
    </button>
  );
});
