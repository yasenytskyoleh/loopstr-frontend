import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Log in · loopstr",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginForm />;
}
