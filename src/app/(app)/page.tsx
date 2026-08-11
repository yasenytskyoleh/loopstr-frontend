import type { Metadata } from "next";

import { CatalogBrowser } from "@/features/catalog/components/catalog-browser";
import { createCatalogGateway } from "@/features/catalog/gateway/create-catalog-gateway";

export const metadata: Metadata = {
  title: "Browse tools · loopstr",
};

/** Homepage (HOME-01). Loads the catalog on the server and hands it to the
 *  client browser for search/filter. A thrown gateway error surfaces to
 *  `error.tsx`; the loading fallback lives in `loading.tsx`. */
export default async function HomePage() {
  const tools = await createCatalogGateway().getCatalog();
  return <CatalogBrowser tools={tools} />;
}
