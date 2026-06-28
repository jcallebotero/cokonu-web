/**
 * Tiny className combiner.
 *
 * Joins truthy class fragments into a single space-separated string.
 * Kept dependency-free on purpose — if the project later adds `clsx` +
 * `tailwind-merge`, swap the implementation here without touching callers.
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
