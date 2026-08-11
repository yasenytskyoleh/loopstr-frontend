import type { ComponentType, SVGProps } from "react";

interface CatalogEmptyStateProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}

/** Centered placeholder for the "no tools" and "no matches" states. */
export function CatalogEmptyState({
  icon: Icon,
  title,
  description,
}: CatalogEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-surface text-content-secondary shadow-card">
        <Icon className="size-6" />
      </span>
      <p className="text-lg font-medium text-content-primary">{title}</p>
      <p className="max-w-xs text-sm text-content-secondary">{description}</p>
    </div>
  );
}
