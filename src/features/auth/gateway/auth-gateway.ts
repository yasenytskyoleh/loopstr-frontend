import type {
  AuthUser,
  RegisterInput,
  RequestPasswordResetInput,
  SignInInput,
} from "../auth.types";

/** Transport-agnostic authentication boundary. Pages depend on this interface,
 *  never on a concrete adapter. Expected failures surface as a thrown `AuthError`
 *  carrying a typed `code`; a resolved promise means success. */
export interface AuthGateway {
  /** Authenticate credentials. On success the backend establishes the session
   *  cookie and resolves with the signed-in account. Throws `AuthError` on
   *  failure. */
  signIn(input: SignInInput): Promise<AuthUser>;
  /** Create an account. On success the backend logs the new Member in (session
   *  cookie) and resolves with the new account. Throws `AuthError` (e.g.
   *  `EMAIL_TAKEN`). */
  register(input: RegisterInput): Promise<AuthUser>;
  /** Request a password-reset link. Resolves for any completed server response
   *  (neutral, anti-enumeration); rejects only on a transport/network failure. */
  requestPasswordReset(input: RequestPasswordResetInput): Promise<void>;
  /** The signed-in account for the current session, or `null` when there is no
   *  usable session (never signed in, or an unrecognized/expired one). Throws
   *  `AuthError("NETWORK_ERROR")` only on a transport failure. */
  getCurrentUser(): Promise<AuthUser | null>;
}
