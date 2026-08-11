import {
  BrandMark,
  CameraIcon,
  PrinterIcon,
  WrenchIcon,
} from "@/components/ui/icons";

/** Desktop-only brand panel (Figma left column, 560px). Decorative; hidden below
 *  the `xl` breakpoint so the form gets the full width on tablet and mobile. */
export function AuthBrandPanel() {
  return (
    <aside
      className="relative hidden w-[560px] shrink-0 flex-col justify-between overflow-hidden bg-brand-subtle p-16 xl:flex"
      style={{
        backgroundImage:
          "radial-gradient(60% 40% at 25% 15%, rgb(232 108 38 / 0.12), transparent 70%), radial-gradient(50% 40% at 85% 95%, rgb(232 108 38 / 0.08), transparent 70%)",
      }}
    >
      <div className="relative flex flex-col gap-10">
        <div className="flex items-center gap-3">
          <BrandMark className="size-8 text-brand-solid" />
          <span className="text-2xl font-medium text-content-primary">
            loopstr
          </span>
        </div>

        {/* Decorative isometric toolbox illustration (Figma left column). A
            static SVG gains nothing from next/image optimization. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/auth/toolbox.svg"
          alt=""
          aria-hidden="true"
          className="mx-auto w-full max-w-[380px]"
        />
      </div>

      <div className="relative flex max-w-[432px] flex-col gap-4">
        <p className="text-3xl leading-9 text-content-primary">
          Borrow the tools.
          <br />
          Keep the trust.
        </p>
        <p className="text-base leading-7 text-content-secondary">
          Reserve, pick up and return shared tools at Maker Commons — with a
          waitlist that plays fair.
        </p>
      </div>

      <div className="relative flex flex-col gap-3">
        <div className="flex gap-2">
          <IconChip>
            <WrenchIcon className="size-5 text-content-primary" />
          </IconChip>
          <IconChip>
            <PrinterIcon className="size-5 text-content-primary" />
          </IconChip>
          <IconChip>
            <CameraIcon className="size-5 text-content-primary" />
          </IconChip>
        </div>
        <p className="text-xs text-content-secondary">
          500+ shared tools · one community inventory
        </p>
      </div>
    </aside>
  );
}

function IconChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex size-9 items-center justify-center rounded-lg bg-surface shadow-card">
      {children}
    </span>
  );
}
