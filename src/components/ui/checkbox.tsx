import { forwardRef } from "react";

import { cn } from "@/lib/utils";

/** Native checkbox tinted with the brand accent. Native semantics keep it fully
 *  keyboard- and screen-reader-accessible; pair it with a clickable label. */
export const Checkbox = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Checkbox({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        "size-[18px] shrink-0 cursor-pointer rounded-sm accent-brand-solid",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
