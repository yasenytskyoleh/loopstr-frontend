import { z } from "zod";

import { AuthError, isAuthErrorCode } from "../auth-errors";
import { sessionUserSchema } from "../auth.schema";
import type {
  AuthErrorCode,
  AuthUser,
  RegisterInput,
  RequestPasswordResetInput,
  SignInInput,
} from "../auth.types";
import type { AuthGateway } from "./auth-gateway";

const errorBodySchema = z.object({
  code: z.string(),
  message: z.string().optional(),
});

/** Abort a request that never responds, so the form doesn't stay stuck submitting. */
const REQUEST_TIMEOUT_MS = 10_000;

/** Fallback status → code mapping when the error body omits a known `code`. */
const STATUS_ERROR_CODES: Record<number, AuthErrorCode> = {
  401: "INVALID_CREDENTIALS",
  409: "EMAIL_TAKEN",
  423: "ACCOUNT_LOCKED",
  429: "ACCOUNT_LOCKED",
};

/** HTTP adapter for the loopstr auth API. A 2xx response is success; the session
 *  is carried by the backend's `Set-Cookie`, so no response body is consumed.
 *  Transport and error payloads are mapped to a typed `AuthError`. */
export class HttpAuthGateway implements AuthGateway {
  constructor(private readonly baseUrl: string) {}

  async signIn(input: SignInInput): Promise<AuthUser> {
    return this.post("/auth/login", input);
  }

  async register(input: RegisterInput): Promise<AuthUser> {
    return this.post("/auth/register", input);
  }

  async requestPasswordReset(input: RequestPasswordResetInput): Promise<void> {
    // Anti-enumeration: any completed server response is treated as success so
    // the UI shows one neutral confirmation. Only a transport failure (thrown by
    // fetchJson as NETWORK_ERROR) surfaces to the user.
    await this.fetchJson("/auth/forgot-password", input);
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/users/me`, {
        headers: { Accept: "application/json" },
        credentials: "include",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch {
      throw new AuthError("NETWORK_ERROR");
    }
    // No usable session cookie — DRF's own `{"detail": ...}` shape, not the
    // `/auth/*` error envelope, so the body is intentionally not read here.
    if (response.status === 403) {
      return null;
    }
    if (!response.ok) {
      throw new AuthError("UNKNOWN_ERROR");
    }
    return sessionUserSchema.parse(await response.json()).user;
  }

  private async post(path: string, payload: unknown): Promise<AuthUser> {
    const response = await this.fetchJson(path, payload);
    if (!response.ok) {
      throw await this.toError(response);
    }
    return sessionUserSchema.parse(await response.json()).user;
  }

  private async fetchJson(path: string, payload: unknown): Promise<Response> {
    try {
      return await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch {
      // Transport failure or timeout — both surface as a retryable network error.
      throw new AuthError("NETWORK_ERROR");
    }
  }

  private async toError(response: Response): Promise<AuthError> {
    const parsed = errorBodySchema.safeParse(await this.readBody(response));
    if (parsed.success && isAuthErrorCode(parsed.data.code)) {
      return new AuthError(parsed.data.code);
    }
    return new AuthError(STATUS_ERROR_CODES[response.status] ?? "UNKNOWN_ERROR");
  }

  private async readBody(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
}
