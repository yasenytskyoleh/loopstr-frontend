---
name: tailwind
description: Use when styling with Tailwind CSS — composing utilities, conditional/variant classes with cn and cva, design tokens and theme config, dark mode, responsive layout, or deciding when to extract a component vs keep utilities inline.
---

# Tailwind CSS

Tailwind's value is that styles are colocated, deletable, and constrained to a scale. All
three are lost the moment you reach for arbitrary values or `@apply`.

## Use the scale, not arbitrary values

Every arbitrary value (`w-[327px]`, `text-[#3b82f6]`, `mt-[13px]`) is a decision made
outside the design system. It won't respond to a theme change and it won't match anything
else on the page.

```tsx
// WRONG — off-scale, off-palette, invisible to the theme
<div className="mt-[13px] text-[#3b82f6] w-[327px]">

// CORRECT
<div className="mt-3 text-blue-500 w-80">
```

If the design genuinely needs a value that isn't on the scale, the scale is wrong — add
the token to the theme rather than inlining it at one call site.

Define tokens once. Tailwind v4 does this in CSS:

```css
@import "tailwindcss";

@theme {
  --color-brand: oklch(0.62 0.19 259);
  --spacing-gutter: 1.5rem;
}
```

v3 does it in `tailwind.config.ts` under `theme.extend`. Check which major the project is
on before writing config — the two are not interchangeable.

Semantic names (`text-danger`, `bg-surface`) survive a redesign. Literal names
(`text-red-500`, `bg-gray-50`) scatter the redesign across every file.

## Never build class names by concatenation

Tailwind's compiler scans source for **complete, literal** class strings. A name assembled
at runtime is invisible to it and gets purged from the build — it works in dev and vanishes
in production.

```tsx
// WRONG — `text-red-500` never appears literally; it will not exist in the CSS bundle
<p className={`text-${color}-500`}>

// CORRECT — full strings the scanner can see
const tone = { danger: "text-red-500", muted: "text-gray-500" } as const;
<p className={tone[variant]}>
```

## Merge conditional classes with `cn`

Later utilities in a class string do not reliably win — CSS specificity decides, not source
order. `"px-2 px-4"` is a coin flip. `tailwind-merge` resolves conflicts properly; `clsx`
handles the conditionals.

```ts
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
<button
  className={cn("rounded px-4 py-2", isActive && "bg-brand", className)}
/>
```

Always pass `className` through on a reusable component and merge it last, so callers can
override without `!important`.

## Variants with `cva`

Once a component has more than two style axes, ternaries stop scaling. `class-variance-authority`
makes the matrix explicit and type-safe.

```ts
import { cva, type VariantProps } from "class-variance-authority";

const button = cva("inline-flex items-center rounded font-medium transition-colors", {
  variants: {
    variant: {
      primary: "bg-brand text-white hover:bg-brand/90",
      ghost: "hover:bg-gray-100",
    },
    size: { sm: "h-8 px-3 text-sm", md: "h-10 px-4" },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

type ButtonProps = React.ComponentPropsWithoutRef<"button"> & VariantProps<typeof button>;

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={cn(button({ variant, size }), className)} {...props} />;
}
```

## Don't `@apply`

`@apply` recreates the CSS-file indirection Tailwind exists to remove: you lose colocation,
you lose deletability, and you gain a `.btn` class that nobody dares change. If markup
repeats, extract a **component** — that's the reuse mechanism.

The narrow exception is styling markup you don't control (third-party HTML, `prose`
overrides).

## Responsive and dark mode

Mobile-first: an unprefixed utility is the small-screen case; prefixes are floors, not
ranges.

```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
```

For dark mode, prefer semantic tokens that flip at the theme layer over `dark:` on every
element. When you do use `dark:`, apply it where the color is decided, not scattered:

```tsx
// Noisy — every element restates the theme
<div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">

// Better — the token knows; the markup doesn't
<div className="bg-surface text-content">
```

## Keep class lists legible

Order utilities consistently — layout → box → typography → color → state. Install
`prettier-plugin-tailwindcss` and let it sort; it removes the argument entirely.

When a class list gets genuinely unreadable, that is usually a signal the element is doing
too much, not that you need `@apply`.

## Review checklist

- [ ] No arbitrary values where a scale token exists; new values added to the theme
- [ ] No runtime-constructed class names
- [ ] Conditional classes merged with `cn`; `className` accepted and merged last
- [ ] Multi-axis components use `cva` rather than nested ternaries
- [ ] No `@apply` for first-party markup
- [ ] Mobile-first responsive prefixes
- [ ] Semantic tokens over literal colors, especially for dark mode
