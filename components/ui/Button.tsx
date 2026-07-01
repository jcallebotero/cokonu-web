import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Reusable Button.
 *
 * Variants:
 *  - "primary" → solid ink (#1A1A1A) with white text. The default, clean
 *                high-contrast call to action.
 *  - "add"     → brand-forward add-to-cart: green bg + light-green text,
 *                hover flips to pink bg + light-pink text.
 *  - "green"   → brand green, for brand-forward accents.
 *  - "outline" → hairline border, transparent fill.
 *  - "ghost"   → no border/fill until hover; for low-emphasis actions.
 *
 * Styling stays minimal: crisp square corners (global), subtle transitions.
 */
export type ButtonVariant = "primary" | "add" | "green" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const base =
  "inline-flex items-center justify-center gap-2 font-medium " +
  "transition-all duration-200 select-none " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-surface hover:bg-green-dark",
  // Legible dark-green text on brand green; hover flips to pink + bold + a
  // subtle size bump for a tactile "click-ready" feel.
  add: "bg-green text-green-deep hover:bg-pink hover:text-pink-tint hover:font-bold hover:scale-[1.04]",
  green: "bg-green-dark text-surface hover:bg-green",
  outline:
    "border border-line bg-transparent text-ink hover:border-ink hover:bg-surface",
  ghost: "bg-transparent text-ink hover:bg-green-tint",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, type, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
