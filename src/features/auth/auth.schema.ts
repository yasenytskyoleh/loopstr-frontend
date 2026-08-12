import { z } from "zod";

/** The signed-in account, as every session-bearing response answers it (login,
 *  register, `GET /users/me`) — see docs/api/auth-api.md. */
export const authUserSchema = z.object({
  id: z.number(),
  email: z.email(),
  fullName: z.string(),
  role: z.literal("member"),
});

/** `{ "user": {...} }` envelope every session-bearing response uses. */
export const sessionUserSchema = z.object({ user: authUserSchema });

export type AuthUser = z.infer<typeof authUserSchema>;
