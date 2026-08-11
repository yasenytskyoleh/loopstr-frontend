import type { Metadata } from "next";

import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Create account · loopstr",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return <RegisterForm />;
}
