import { cn } from "@/lib/utils";

/** Shared auth surface: white card, 16px radius, soft shadow, matching the Figma
 *  auth card. Holds no page-specific logic — pages compose their content inside. */
export function AuthCard({
  children,
  labelledBy,
  className,
}: {
  children: React.ReactNode;
  /** id of the heading that names this card (for `aria-labelledby`). */
  labelledBy?: string;
  className?: string;
}) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cn(
        "flex w-full flex-col gap-5 rounded-2xl bg-surface p-6 shadow-card sm:p-10",
        className,
      )}
    >
      {children}
    </section>
  );
}
