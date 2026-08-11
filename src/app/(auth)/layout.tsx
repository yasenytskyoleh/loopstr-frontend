import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";

/** Shared auth canvas: fills the dynamic viewport, shows the brand panel on
 *  desktop, and centers the form column. Grid centering keeps content reachable
 *  (page scrolls) on short viewports instead of clipping the top. No business
 *  logic lives here. */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-canvas">
      <AuthBrandPanel />
      <main className="grid flex-1 place-items-center px-4 py-10 sm:px-6">
        <div className="flex w-full max-w-[440px] flex-col items-center gap-6">
          {children}
        </div>
      </main>
    </div>
  );
}
