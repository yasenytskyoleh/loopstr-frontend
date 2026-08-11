/**
 * Typed environment accessor. Never read `process.env` directly elsewhere.
 * Only `NEXT_PUBLIC_`-prefixed values are safe to read on the client.
 */
export const env = {
  /** Base URL of the loopstr auth/backend API, e.g. https://api.loopstr.app. */
  get apiBaseUrl(): string | undefined {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  },
} as const;

/** Returns the API base URL or throws — used so the app fails closed when unconfigured. */
export function requireApiBaseUrl(): string {
  const value = env.apiBaseUrl;
  if (!value) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set. The auth gateway cannot reach the backend.",
    );
  }
  return value.replace(/\/$/, "");
}
