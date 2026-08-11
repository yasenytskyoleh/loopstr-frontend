import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** Returns false during SSR and the first client render, true afterwards.
 *  Lets components safely read client-only state (e.g. sessionStorage) after
 *  hydration without a setState-in-effect. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
