import NextLink from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** Brand-styled text link over next/link. */
export function TextLink({
  className,
  ...props
}: ComponentProps<typeof NextLink>) {
  return (
    <NextLink
      className={cn(
        "rounded-sm text-sm font-medium text-content-brand hover:underline",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        className,
      )}
      {...props}
    />
  );
}
