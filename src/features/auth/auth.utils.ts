import type { AuthUser } from "./auth.types";

/** Up to two initials from a full name for the header avatar, e.g. "Maya
 *  Lindqvist" -> "ML"; a single-word name uses its first two letters. */
export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/** Display label for a role, e.g. "member" -> "Member". */
export function formatRole(role: AuthUser["role"]): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
