import { requireApiBaseUrl } from "@/lib/env";

import type { AuthGateway } from "./auth-gateway";
import { HttpAuthGateway } from "./http-auth-gateway";

/** Single, explicit gateway selection point. There is no silent mock fallback:
 *  a missing API base URL throws (fail closed) rather than degrading to a stub. */
export function createAuthGateway(): AuthGateway {
  return new HttpAuthGateway(requireApiBaseUrl());
}
