import { cn } from "@/lib/utils";
import { AlertTriangleIcon, CheckCircleIcon } from "./icons";

type AlertVariant = "danger" | "success";

type AlertProps = {
  variant?: AlertVariant;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  /** "alert" (assertive) for blocking errors, "status" (polite) for confirmations. */
  role?: "alert" | "status";
};

const VARIANT_STYLES: Record<AlertVariant, string> = {
  danger: "border-danger-line bg-danger-subtle text-danger",
  success: "border-success-line bg-success-subtle text-success",
};

/** Status banner for form-level messages. The icon is decorative; the text
 *  carries the meaning, and the container is a live region. */
export function Alert({
  variant = "danger",
  title,
  children,
  className,
  role = "alert",
}: AlertProps) {
  const Icon = variant === "danger" ? AlertTriangleIcon : CheckCircleIcon;
  return (
    <div
      role={role}
      className={cn(
        "flex gap-3 rounded-lg border p-3 text-sm",
        VARIANT_STYLES[variant],
        className,
      )}
    >
      <Icon className="mt-0.5 size-5 shrink-0" />
      <div className="flex flex-col gap-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <p>{children}</p>}
      </div>
    </div>
  );
}
