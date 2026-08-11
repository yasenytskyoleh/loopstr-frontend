import { AUTH_ERROR_CODES, type AuthErrorCode } from "./auth.types";

/** Typed error for expected authentication outcomes and transport failures.
 *  Pages catch this and read `.code` — no string-matching of raw messages. */
export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message?: string) {
    super(message ?? code);
    this.name = "AuthError";
    this.code = code;
  }
}

export function isAuthError(value: unknown): value is AuthError {
  return value instanceof AuthError;
}

export function isAuthErrorCode(value: unknown): value is AuthErrorCode {
  return (
    typeof value === "string" &&
    (AUTH_ERROR_CODES as readonly string[]).includes(value)
  );
}

/** Coerce any thrown value into an AuthError so callers get a stable `.code`. */
export function toAuthError(value: unknown): AuthError {
  return isAuthError(value) ? value : new AuthError("UNKNOWN_ERROR");
}

/** Stable, user-facing copy per code (PoC ACC-01). The invalid-credentials copy
 *  is deliberately generic to avoid account enumeration. */
const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: "Email or password is incorrect.",
  ACCOUNT_LOCKED: "Too many failed attempts. Try again in 15 minutes.",
  EMAIL_TAKEN: "An account with this email already exists. Log in instead.",
  NETWORK_ERROR: "We couldn't reach the server. Check your connection and try again.",
  UNKNOWN_ERROR: "Something went wrong. Please try again.",
};

export function authErrorMessage(code: AuthErrorCode): string {
  return AUTH_ERROR_MESSAGES[code];
}
