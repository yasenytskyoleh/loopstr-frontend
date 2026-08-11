import { cn } from "@/lib/utils";

/** Inline validation message. Render with an `id` referenced by the field's
 *  `aria-describedby`. Returns null when there is nothing to show. */
export function FieldError({
  id,
  children,
  className,
}: {
  id?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  if (!children) return null;
  return (
    <p id={id} className={cn("text-sm text-danger", className)}>
      {children}
    </p>
  );
}
