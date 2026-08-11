import { catalogFixture } from "../catalog.fixture";
import type { Tool } from "../catalog.types";
import type { CatalogGateway } from "./catalog-gateway";

/** In-memory adapter backing the PoC with the local fixture. Same async contract
 *  as the HTTP adapter so pages can't tell them apart. */
export class FixtureCatalogGateway implements CatalogGateway {
  async getCatalog(): Promise<Tool[]> {
    return catalogFixture;
  }

  async getTool(id: string): Promise<Tool | null> {
    return catalogFixture.find((tool) => tool.id === id) ?? null;
  }
}
