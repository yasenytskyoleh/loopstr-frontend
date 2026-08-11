import { AppHeader } from "@/components/app/app-header";

/** Signed-in app shell: top navigation over a warm canvas. Wraps the homepage
 *  and tool-details routes. No business logic here. */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-dvh flex-col bg-canvas"
      style={{
        backgroundImage:
          "radial-gradient(50% 30% at 15% 0%, rgb(232 108 38 / 0.06), transparent 70%)",
      }}
    >
      <AppHeader />
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
