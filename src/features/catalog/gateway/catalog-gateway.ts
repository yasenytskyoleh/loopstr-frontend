import type { Tool } from "../catalog.types";

/** Transport-agnostic catalog boundary. Pages depend on this interface, never on
 *  a concrete adapter. Reads only — HOME-01 is browse-only. */
export interface CatalogGateway {
  /** All catalog tools. Rejects if the source can't be reached or is malformed. */
  getCatalog(): Promise<Tool[]>;
  /** A single tool by id, or `null` when no tool has that id (404). */
  getTool(id: string): Promise<Tool | null>;
}
