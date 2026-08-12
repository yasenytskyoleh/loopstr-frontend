"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandMark, GridIcon } from "@/components/ui/icons";
import { formatRole, getInitials } from "@/features/auth/auth.utils";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { catalogRoutes } from "@/features/catalog/catalog.config";

import { UserMenu } from "./user-menu";

/** Top navigation shared by the homepage and tool-details routes. */
export function AppHeader() {
  const pathname = usePathname();
  const onHome = pathname === catalogRoutes.home;
  const { data: user } = useCurrentUser();

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href={catalogRoutes.home}
          className="flex items-center gap-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          <BrandMark className="size-7 text-brand-solid" />
          <span className="text-xl font-medium text-content-primary">
            loopstr
          </span>
        </Link>

        <Link
          href={catalogRoutes.home}
          aria-current={onHome ? "page" : undefined}
          className="flex items-center gap-2 rounded-lg bg-brand-subtle px-3 py-2 text-sm font-medium text-content-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          <GridIcon className="size-4" />
          Browse tools
        </Link>

        {user && (
          <div className="ml-auto">
            <UserMenu
              name={user.fullName}
              role={formatRole(user.role)}
              initials={getInitials(user.fullName)}
            />
          </div>
        )}
      </div>
    </header>
  );
}
