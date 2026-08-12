"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { PasswordField } from "@/components/auth/password-field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TextLink } from "@/components/ui/link";

import { authConfig } from "../auth.config";
import { authErrorMessage, toAuthError } from "../auth-errors";
import {
  loginSchema,
  type LoginFormInput,
  type LoginFormValues,
} from "../auth.validation";
import { createAuthGateway } from "../gateway/create-auth-gateway";
import type { AuthGateway } from "../gateway/auth-gateway";
import { currentUserQueryKey } from "../hooks/use-current-user";

const EMAIL_ERROR_ID = "login-email-error";
const PASSWORD_ERROR_ID = "login-password-error";

/** Login screen. `gateway` is injectable for tests; production resolves the real
 *  HTTP gateway lazily so a fake can be supplied without touching the network. */
export function LoginForm({ gateway }: { gateway?: AuthGateway }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    resetField,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInput, unknown, LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
    mode: "onBlur",
  });

  // ACC-01: the Log in button stays disabled until both fields have a value.
  const [email, password] = useWatch({ control, name: ["email", "password"] });
  const canSubmit = Boolean(email) && Boolean(password) && !isSubmitting;

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      // Resolve the gateway lazily so the page still renders when the backend
      // URL is unconfigured — only submitting surfaces the error.
      const authGateway = gateway ?? createAuthGateway();
      const user = await authGateway.signIn(values);
      // Seed the header's account query so it shows the real Member immediately
      // instead of re-fetching GET /users/me after the redirect.
      queryClient.setQueryData(currentUserQueryKey, user);
      // On success the backend has set the session cookie; land on the Homepage.
      // refresh() invalidates the Router Cache so the destination re-renders with
      // the new session instead of a cached logged-out payload.
      router.push(authConfig.postAuthPath);
      router.refresh();
    } catch (error) {
      // Email is preserved; the password field is cleared on any failure.
      resetField("password");
      setFormError(authErrorMessage(toAuthError(error).code));
    }
  });

  return (
    <>
      <AuthCard labelledBy="login-title">
        <AuthHeader
          id="login-title"
          title="Welcome back"
          subtitle="Log in to reserve tools at Maker Commons."
        />

        {formError && <Alert role="alert">{formError}</Alert>}

        <form onSubmit={onSubmit} noValidate>
          <fieldset
            disabled={isSubmitting}
            className="flex flex-col gap-5 border-0 p-0"
          >
            <div className="flex flex-col gap-1">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                inputMode="email"
                autoComplete="username"
                placeholder="you@example.com"
                invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? EMAIL_ERROR_ID : undefined}
                {...register("email")}
              />
              <FieldError id={EMAIL_ERROR_ID}>{errors.email?.message}</FieldError>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="login-password">Password</Label>
              <PasswordField
                id="login-password"
                autoComplete="current-password"
                placeholder="Enter your password"
                invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? PASSWORD_ERROR_ID : undefined
                }
                {...register("password")}
              />
              <FieldError id={PASSWORD_ERROR_ID}>
                {errors.password?.message}
              </FieldError>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="login-remember" {...register("rememberMe")} />
              <Label
                htmlFor="login-remember"
                className="font-normal text-content-primary"
              >
                Remember me for 30 days
              </Label>
              <span className="flex-1" />
              <TextLink href={authConfig.routes.forgotPassword}>
                Forgot password?
              </TextLink>
            </div>

            <Button
              type="submit"
              loading={isSubmitting}
              disabled={!canSubmit}
              className="w-full"
            >
              Log in
            </Button>
          </fieldset>
        </form>
      </AuthCard>

      <footer className="flex items-center gap-2 text-sm text-content-secondary">
        <span>Don&apos;t have an account?</span>
        <TextLink href={authConfig.routes.signup}>Sign up</TextLink>
      </footer>
    </>
  );
}
