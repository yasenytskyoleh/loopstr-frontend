import type {
  RegisterInput,
  RequestPasswordResetInput,
  SignInInput,
} from "../auth.types";

/** Transport-agnostic authentication boundary. Pages depend on this interface,
 *  never on a concrete adapter. Expected failures surface as a thrown `AuthError`
 *  carrying a typed `code`; a resolved promise means success. */
export interface AuthGateway {
  /** Authenticate credentials. On success the backend establishes the session
   *  cookie; resolves with no value. Throws `AuthError` on failure. */
  signIn(input: SignInInput): Promise<void>;
  /** Create an account. On success the backend logs the new Member in (session
   *  cookie); resolves with no value. Throws `AuthError` (e.g. `EMAIL_TAKEN`). */
  register(input: RegisterInput): Promise<void>;
  /** Request a password-reset link. Resolves for any completed server response
   *  (neutral, anti-enumeration); rejects only on a transport/network failure. */
  requestPasswordReset(input: RequestPasswordResetInput): Promise<void>;
}
