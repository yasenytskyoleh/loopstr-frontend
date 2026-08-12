"use client";

import { useQuery } from "@tanstack/react-query";

import { createAuthGateway } from "../gateway/create-auth-gateway";

export const currentUserQueryKey = ["auth", "currentUser"] as const;

/** The signed-in Member for the header (HOME-01: signed-in account read).
 *  `data` is `null` when there is no usable session — the homepage isn't
 *  route-guarded, so callers must handle that case. */
export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: () => createAuthGateway().getCurrentUser(),
  });
}
