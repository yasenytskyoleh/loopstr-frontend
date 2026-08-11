"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TextLink } from "@/components/ui/link";

import { authConfig } from "../auth.config";
import { authErrorMessage, toAuthError } from "../auth-errors";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormInput,
  type ForgotPasswordFormValues,
} from "../auth.validation";
import { createAuthGateway } from "../gateway/create-auth-gateway";
import type { AuthGateway } from "../gateway/auth-gateway";

const EMAIL_ERROR_ID = "forgot-email-error";

/** Password-reset entry screen (PoC ACC-01 #5): collects an email and requests a
 *  reset link. The confirmation is intentionally neutral (anti-enumeration) and
 *  the rest of the reset flow is out of scope. `gateway` is injectable for tests. */
export function ForgotPasswordForm({ gateway }: { gateway?: AuthGateway }) {
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormInput, unknown, ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const authGateway = gateway ?? createAuthGateway();
      await authGateway.requestPasswordReset(values);
      setSubmitted(true);
    } catch (error) {
      setFormError(authErrorMessage(toAuthError(error).code));
    }
  });

  return (
    <>
      <AuthCard labelledBy="forgot-title">
        <AuthHeader
          id="forgot-title"
          title="Reset your password"
          subtitle="Enter your email and we'll send you a link to reset it."
        />

        {submitted ? (
          <Alert variant="success" role="status">
            If an account exists for that email, we&apos;ve sent a reset link.
          </Alert>
        ) : (
          <>
            {formError && <Alert role="alert">{formError}</Alert>}

            <form onSubmit={onSubmit} noValidate>
              <fieldset
                disabled={isSubmitting}
                className="flex flex-col gap-5 border-0 p-0"
              >
                <div className="flex flex-col gap-1">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    inputMode="email"
                    autoComplete="username"
                    placeholder="you@example.com"
                    invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? EMAIL_ERROR_ID : undefined}
                    {...register("email")}
                  />
                  <FieldError id={EMAIL_ERROR_ID}>
                    {errors.email?.message}
                  </FieldError>
                </div>

                <Button type="submit" loading={isSubmitting} className="w-full">
                  Send link
                </Button>
              </fieldset>
            </form>
          </>
        )}
      </AuthCard>

      <footer className="flex items-center gap-2 text-sm text-content-secondary">
        <TextLink href={authConfig.routes.login}>Back to login</TextLink>
      </footer>
    </>
  );
}
