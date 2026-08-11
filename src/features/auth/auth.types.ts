/** Application error codes. Adapter/transport errors are mapped to these before
 *  reaching page components (see auth-errors.ts). */
export const AUTH_ERROR_CODES = [
  "INVALID_CREDENTIALS",
  "ACCOUNT_LOCKED",
  "EMAIL_TAKEN",
  "NETWORK_ERROR",
  "UNKNOWN_ERROR",
] as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];

export interface SignInInput {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
}

export interface RequestPasswordResetInput {
  email: string;
}
