import { z } from "zod";

/** Availability lifecycle for a catalog tool. "Under maintenance" and "Retired"
 *  are surfaced as unavailable (grayed card) rather than hidden — HOME-01 AC #5. */
export const toolStatusSchema = z.enum([
  "Available",
  "Under maintenance",
  "Retired",
]);

/** A single catalog tool as returned by the backend. External data is validated
 *  against this at the gateway boundary; the `Tool` type is derived from it. */
export const toolSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  price_per_day_usd: z.number().nonnegative(),
  /** Ordered gallery; `photos[0]` is the cover. Absolute URLs. */
  photos: z.array(z.url()).min(1),
  description: z.string(),
  condition: z.string(),
  brand_model: z.string(),
  status: toolStatusSchema,
});

export const catalogSchema = z.array(toolSchema);

export type ToolStatus = z.infer<typeof toolStatusSchema>;
export type Tool = z.infer<typeof toolSchema>;
