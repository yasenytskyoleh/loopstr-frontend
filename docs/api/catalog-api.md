# loopstr Catalog API — Backend Contract

This is the contract the **frontend is built against** through its typed `CatalogGateway`
(`src/features/catalog/gateway/http-catalog-gateway.ts`). It powers PoC **HOME-01 Browse the
homepage** and the read-only **Tool details** view.

> **Status:** the endpoints below do **not exist yet**. Until they ship, the frontend serves the
> catalog from a local fixture (`src/features/catalog/catalog.fixture.ts`) via
> `FixtureCatalogGateway`. When the backend is ready, swap the adapter in
> `create-catalog-gateway.ts` (one line) — no other frontend changes are needed.

- **Base URL**: configured on the frontend via `NEXT_PUBLIC_API_BASE_URL`
  (e.g. `https://api.loopstr.app`). The frontend appends `/api/v1` to it
  (`src/lib/env.ts` → `requireApiBaseUrl()`); the paths below already include that prefix.
- **Transport**: JSON over HTTPS. Response bodies are `application/json`.
- **Scope**: **browse-only** (HOME-01 AC #7). There are **no** reservation, booking, or waitlist
  endpoints anywhere in this contract.

---

## Conventions

### Sessions

- These are Member-only reads. The frontend sends `credentials: "include"` on every request so the
  session cookie (set at login — see `auth-api.md`) is attached.
- CORS must allow the frontend origin with `Access-Control-Allow-Credentials: true`.
- Unauthenticated requests should return `401`. (Route guarding is deferred on the frontend for the
  PoC; the homepage is currently public.)

### The `Tool` object

Validated on the frontend at the boundary with Zod (`src/features/catalog/catalog.schema.ts`).
Every field is required.

| Field               | Type                                                | Notes                                                    |
| ------------------- | --------------------------------------------------- | -------------------------------------------------------- |
| `id`                | string (non-empty)                                  | Stable id; used in the details URL `/tools/{id}`.        |
| `name`              | string                                              | Display name.                                            |
| `category`          | string                                              | Free-form; the frontend derives the filter set + counts. |
| `price_per_day_usd` | number (≥ 0)                                        | Whole USD/day; rendered as `"$6 / day"`.                 |
| `photos`            | string[] (≥ 1, absolute URLs)                       | Ordered; `photos[0]` is the card cover.                  |
| `description`       | string                                              | Shown in the details "About this tool" section.          |
| `condition`         | string                                              | e.g. `"Good — serviced Jul 2026"`.                       |
| `brand_model`       | string                                              | e.g. `"DeWalt DCD791"`.                                  |
| `status`            | `"Available" \| "Under maintenance" \| "Retired"`   | Non-`Available` renders as a grayed, still-visible card. |

Photo hosts must be allow-listed in `next.config.ts` (`images.remotePatterns`) for `next/image`.

---

## `GET /api/v1/tools`

Returns the tool catalog as a `Tool[]`.

### Query parameters

All optional; when none are sent, return the full catalog.

> **What the frontend sends today:** nothing. The PoC fetches the whole list once and does the
> category grouping, counts, name search, and availability styling **client-side**. The parameters
> below are the agreed interface for when filtering moves server-side (as the catalog grows).
> Implementing them now is backward-compatible — absent params still means "return everything".

| Param      | Type   | Maps to (frontend)     | Semantics                                                                       |
| ---------- | ------ | ---------------------- | ------------------------------------------------------------------------------- |
| `category` | string | the category pill row  | Exact match on `Tool.category`. Omitted (or the `All` pill) = no category filter. |
| `q`        | string | the "Search tools" box | Case-insensitive substring match on `Tool.name`, trimmed. Empty = no filter.    |

- When both are present they combine with **AND** — exactly how the client filters today.
- **Availability is never a filter.** Tools with `status` = `"Under maintenance"` or `"Retired"`
  must always be returned; the frontend grays them out rather than hiding them (HOME-01 AC #5). Do
  not drop them for any parameter.
- A filter that matches nothing (unknown `category`, non-matching `q`) → **`200`** with `[]`, not
  `404`.

### Response

- **`200`** → JSON array of `Tool` (possibly empty — the frontend shows an empty state). Order is
  taken as-is; the frontend does not re-sort.
- Any non-2xx → the frontend surfaces its catalog error screen.

Pagination and sorting are out of PoC scope. If added later they must be **additive and versioned**
so the bare `Tool[]` response stays valid for existing clients (the frontend validates the body as
an array, not a paged envelope).

### Example

```
GET /api/v1/tools
→ 200 OK
[
  {
    "id": "dewalt-dcd791-drill",
    "name": "DeWalt DCD791 Cordless Drill",
    "category": "Power tools",
    "price_per_day_usd": 6,
    "photos": ["https://cdn.loopstr.app/tools/dewalt-1.jpg", "…"],
    "condition": "Good — serviced Jul 2026",
    "description": "20V MAX brushless compact drill/driver …",
    "brand_model": "DeWalt DCD791",
    "status": "Available"
  }
]

GET /api/v1/tools?category=Power%20tools&q=drill
→ 200 OK
[ { "id": "dewalt-dcd791-drill", … }, { "id": "dewalt-dcd791-drill-unit-2", … } ]
```

---

## `GET /api/v1/tools/{id}`

Returns a single `Tool` for the details view. No query parameters.

### Path parameters

| Param | Type   | Notes                                                                             |
| ----- | ------ | --------------------------------------------------------------------------------- |
| `id`  | string | The `Tool.id` from the list. The frontend URL-encodes it before sending.          |

### Response

- **`200`** → one `Tool`. Every field is required — the frontend validates the whole object and
  renders `photos` in order (all of them, in the gallery), plus `description`, `condition`,
  `price_per_day_usd`, `brand_model`, `category`, and `status`.
- **`404`** → the frontend renders its "not found" page. Return this for any unknown id (including
  a well-formed id that no longer exists).
- Any other non-2xx → the details error path.

### Example

```
GET /api/v1/tools/dewalt-dcd791-drill
→ 200 OK
{ "id": "dewalt-dcd791-drill", "name": "DeWalt DCD791 Cordless Drill", … }

GET /api/v1/tools/does-not-exist
→ 404 Not Found
```
