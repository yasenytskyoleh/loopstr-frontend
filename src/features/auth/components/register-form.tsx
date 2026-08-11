"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { PasswordField } from "@/components/auth/password-field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TextLink } from "@/components/ui/link";

import { authConfig } from "../auth.config";
import { authErrorMessage, toAuthError } from "../auth-errors";
import {
  registerSchema,
  type RegisterFormInput,
  type RegisterFormValues,
} from "../auth.validation";
import { createAuthGateway } from "../gateway/create-auth-gateway";
import type { AuthGateway } from "../gateway/auth-gateway";

const NAME_ERROR_ID = "signup-name-error";
const EMAIL_ERROR_ID = "signup-email-error";
const PASSWORD_HELP_ID = "signup-password-help";
const CONFIRM_ERROR_ID = "signup-confirm-error";

/** Registration screen (ACC-02). On success the backend logs the new Member in,
 *  so submit lands on the Homepage. `gateway` is injectable for tests; production
 *  resolves the real HTTP gateway lazily. */
export function RegisterForm({ gateway }: { gateway?: AuthGateway }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInput, unknown, RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  // The Create account button stays disabled until every field has a value.
  const [fullName, email, password, confirmPassword] = useWatch({
    control,
    name: ["fullName", "email", "password", "confirmPassword"],
  });
  const canSubmit =
    Boolean(fullName) &&
    Boolean(email) &&
    Boolean(password) &&
    Boolean(confirmPassword) &&
    !isSubmitting;

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const authGateway = gateway ?? createAuthGateway();
      await authGateway.register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      });
      // The backend has set the session cookie; land the new Member on the Homepage.
      // refresh() invalidates the Router Cache so the destination re-renders with
      // the new session instead of a cached logged-out payload.
      router.push(authConfig.postAuthPath);
      router.refresh();
    } catch (error) {
      const { code } = toAuthError(error);
      // A taken email is a field-level problem, shown inline on the email input.
      if (code === "EMAIL_TAKEN") {
        setError("email", { message: authErrorMessage(code) }, { shouldFocus: true });
        return;
      }
      setFormError(authErrorMessage(code));
    }
  });

  return (
    <>
      <AuthCard labelledBy="signup-title">
        <AuthHeader
          id="signup-title"
          title="Create your account"
          subtitle="Borrow tools at Maker Commons in minutes."
        />

        {formError && <Alert role="alert">{formError}</Alert>}

        <form onSubmit={onSubmit} noValidate>
          <fieldset
            disabled={isSubmitting}
            className="flex flex-col gap-5 border-0 p-0"
          >
            <div className="flex flex-col gap-1">
              <Label htmlFor="signup-name">Full name</Label>
              <Input
                id="signup-name"
                autoComplete="name"
                placeholder="Your full name"
                invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? NAME_ERROR_ID : undefined}
                {...register("fullName")}
              />
              <FieldError id={NAME_ERROR_ID}>
                {errors.fullName?.message}
              </FieldError>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? EMAIL_ERROR_ID : undefined}
                {...register("email")}
              />
              <FieldError id={EMAIL_ERROR_ID}>{errors.email?.message}</FieldError>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="signup-password">Password</Label>
              <PasswordField
                id="signup-password"
                autoComplete="new-password"
                placeholder="Create a password"
                invalid={Boolean(errors.password)}
                aria-describedby={PASSWORD_HELP_ID}
                {...register("password")}
              />
              {/* The rule doubles as helper text; it turns into the error on violation. */}
              {errors.password ? (
                <FieldError id={PASSWORD_HELP_ID}>
                  {errors.password.message}
                </FieldError>
              ) : (
                <p id={PASSWORD_HELP_ID} className="text-sm text-content-secondary">
                  At least 8 characters, with a letter and a number.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="signup-confirm">Confirm password</Label>
              <PasswordField
                id="signup-confirm"
                autoComplete="new-password"
                placeholder="Repeat your password"
                invalid={Boolean(errors.confirmPassword)}
                aria-describedby={
                  errors.confirmPassword ? CONFIRM_ERROR_ID : undefined
                }
                {...register("confirmPassword")}
              />
              <FieldError id={CONFIRM_ERROR_ID}>
                {errors.confirmPassword?.message}
              </FieldError>
            </div>

            <Button
              type="submit"
              loading={isSubmitting}
              disabled={!canSubmit}
              className="w-full"
            >
              {isSubmitting ? "Creating account…" : "Create account"}
            </Button>
          </fieldset>
        </form>
      </AuthCard>

      <footer className="flex items-center gap-2 text-sm text-content-secondary">
        <span>Already have an account?</span>
        <TextLink href={authConfig.routes.login}>Log in</TextLink>
      </footer>
    </>
  );
}
