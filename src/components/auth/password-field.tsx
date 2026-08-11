"use client";

import { forwardRef, useState } from "react";

import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PasswordFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

/** Password input with a show/hide toggle whose accessible name flips between
 *  "Show password" and "Hide password". Forwards the ref to the input for RHF. */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ invalid, className, ...props }, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          invalid={invalid}
          className={cn("pr-10", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex items-center rounded-r-lg pr-3 pl-2 text-content-secondary hover:text-content-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {visible ? (
            <EyeOffIcon className="size-5" />
          ) : (
            <EyeIcon className="size-5" />
          )}
        </button>
      </div>
    );
  },
);
