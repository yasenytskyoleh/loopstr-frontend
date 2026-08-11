import { forwardRef } from "react";

import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

/** Text input matching the Figma field: 8px radius, neutral border, brand focus
 *  ring, danger treatment when `invalid`. Sets `aria-invalid` for assistive tech. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid = false, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "w-full rounded-lg border bg-surface px-3 py-2 text-sm text-content-primary transition-colors",
        "placeholder:text-content-secondary",
        "focus-visible:outline-2 focus-visible:outline-offset-0",
        "disabled:cursor-not-allowed disabled:opacity-60",
        invalid
          ? "border-danger-line focus-visible:outline-danger"
          : "border-line focus-visible:border-focus focus-visible:outline-focus",
        className,
      )}
      {...props}
    />
  );
});
