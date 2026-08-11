/** The sentinel category shown as the first filter pill — "view everything". */
export const ALL_CATEGORY = "All";

/** Catalog route builders. Kept here so links don't hardcode path strings. */
export const catalogRoutes = {
  home: "/",
  tool: (id: string) => `/tools/${id}`,
} as const;
