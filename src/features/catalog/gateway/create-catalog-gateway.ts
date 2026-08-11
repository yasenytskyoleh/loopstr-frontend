import type { CatalogGateway } from "./catalog-gateway";
import { FixtureCatalogGateway } from "./fixture-catalog-gateway";

/** Catalog gateway selection. The catalog backend (`GET /tools`) does not exist
 *  yet, so the PoC is served entirely from the local fixture. `HttpCatalogGateway`
 *  is the ready, Zod-validated adapter documenting the contract for the BE dev;
 *  swap it in here once the endpoint ships:
 *
 *    return new HttpCatalogGateway(requireApiBaseUrl());
 *
 *  This is a deliberate departure from the auth gateway's fail-closed policy —
 *  catalog data is non-security browsing content and must render without a backend. */
export function createCatalogGateway(): CatalogGateway {
  return new FixtureCatalogGateway();
}
