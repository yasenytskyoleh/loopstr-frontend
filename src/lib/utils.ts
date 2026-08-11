export type ClassValue = string | number | false | null | undefined;

/**
 * Join conditional class names. Falsy values are dropped so callers can write
 * `cn("base", isActive && "active")`. No tailwind-merge: compose classes that
 * don't conflict rather than relying on last-wins resolution.
 */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
