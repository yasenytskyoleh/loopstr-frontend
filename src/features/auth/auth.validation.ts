import { z } from "zod";

const EMAIL_MESSAGE = "Enter a valid work email address.";
const PASSWORD_MESSAGE = "Enter your password.";
const FULL_NAME_MESSAGE = "Enter your full name.";
const PASSWORD_RULE_MESSAGE = "At least 8 characters, with a letter and a number.";
const PASSWORDS_MATCH_MESSAGE = "Passwords do not match.";
const CONFIRM_REQUIRED_MESSAGE = "Re-enter your password.";

/** New-password rule (ACC-02): min 8 chars containing at least one letter and
 *  one number. Same string is shown as the field helper text and the error. */
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).*$/;

/** Login form schema. Email is trimmed + lowercased before validation so the
 *  value handed to the gateway is normalized. Password is never transformed. */
export const loginSchema = z.object({
  email: z
    .string()
    .transform((value) => value.trim().toLowerCase())
    .pipe(z.email(EMAIL_MESSAGE)),
  password: z.string().min(1, PASSWORD_MESSAGE),
  rememberMe: z.boolean().default(false),
});

/** Raw field values as bound to the form inputs. */
export type LoginFormInput = z.input<typeof loginSchema>;
/** Normalized values after successful validation — passed to the gateway. */
export type LoginFormValues = z.output<typeof loginSchema>;

/** Forgot-password request schema — email only, normalized like login. */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .transform((value) => value.trim().toLowerCase())
    .pipe(z.email(EMAIL_MESSAGE)),
});

export type ForgotPasswordFormInput = z.input<typeof forgotPasswordSchema>;
export type ForgotPasswordFormValues = z.output<typeof forgotPasswordSchema>;

/** Registration schema (ACC-02). Email is normalized like login; the password
 *  rule matches the helper text; the object-level refine enforces the match and
 *  attaches the error to the confirm field. */
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .transform((value) => value.trim())
      .pipe(z.string().min(1, FULL_NAME_MESSAGE)),
    email: z
      .string()
      .transform((value) => value.trim().toLowerCase())
      .pipe(z.email(EMAIL_MESSAGE)),
    password: z
      .string()
      .min(8, PASSWORD_RULE_MESSAGE)
      .regex(PASSWORD_RULE, PASSWORD_RULE_MESSAGE),
    confirmPassword: z.string().min(1, CONFIRM_REQUIRED_MESSAGE),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: PASSWORDS_MATCH_MESSAGE,
  });

export type RegisterFormInput = z.input<typeof registerSchema>;
export type RegisterFormValues = z.output<typeof registerSchema>;
