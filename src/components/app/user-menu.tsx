"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { authConfig } from "@/features/auth/auth.config";
import { LogOutIcon } from "@/components/ui/icons";

interface UserMenuProps {
  name: string;
  role: string;
  initials: string;
}

/** Account button + dropdown. Logging out returns to the login screen; real
 *  session teardown lands with the auth work (deferred). Closes on outside click
 *  and Escape. */
export function UserMenu({ name, role, initials }: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-brand-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <span
          aria-hidden="true"
          className="flex size-9 items-center justify-center rounded-lg bg-brand-subtle text-sm font-medium text-content-brand"
        >
          {initials}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium text-content-primary">
            {name}
          </span>
          <span className="block text-xs text-content-secondary">{role}</span>
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-2 w-44 rounded-lg border border-line bg-surface p-1 shadow-card"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => router.push(authConfig.routes.login)}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-content-primary transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            <LogOutIcon className="size-4 text-content-secondary" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
