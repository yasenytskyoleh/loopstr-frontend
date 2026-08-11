import { catalogSchema, toolSchema } from "../catalog.schema";
import type { Tool } from "../catalog.types";
import type { CatalogGateway } from "./catalog-gateway";

/** Abort a request that never responds so a route doesn't hang on the server. */
const REQUEST_TIMEOUT_MS = 10_000;

/** HTTP adapter for the loopstr catalog API. Responses are validated against the
 *  Zod schema at the boundary; a non-2xx (other than 404 on a single tool) or a
 *  malformed payload throws, surfacing to the route's error boundary. */
export class HttpCatalogGateway implements CatalogGateway {
  constructor(private readonly baseUrl: string) {}

  async getCatalog(): Promise<Tool[]> {
    const response = await this.get("/tools");
    if (!response.ok) {
      throw new Error(`Failed to load catalog (${response.status})`);
    }
    return catalogSchema.parse(await response.json());
  }

  async getTool(id: string): Promise<Tool | null> {
    const response = await this.get(`/tools/${encodeURIComponent(id)}`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to load tool ${id} (${response.status})`);
    }
    return toolSchema.parse(await response.json());
  }

  private get(path: string): Promise<Response> {
    return fetch(`${this.baseUrl}${path}`, {
      headers: { Accept: "application/json" },
      credentials: "include",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  }
}
