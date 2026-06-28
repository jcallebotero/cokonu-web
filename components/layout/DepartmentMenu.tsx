"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import type { NavNode } from "@/config/navigation";
import { ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/**
 * Desktop department entry + mega-menu panel.
 *
 * - Opens on hover (pointer) and on keyboard focus entering the group.
 * - Closes on mouse leave, on Escape, and when focus leaves the group.
 * - The trigger is a real link to the department page, so clicking it
 *   navigates while hovering reveals its categories.
 *
 * Papelería is the pink-accented department, so its panel uses pink hovers.
 */
export function DepartmentMenu({ department }: { department: NavNode }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLLIElement>(null);
  // Short close-delay so the cursor can travel from the trigger into the
  // panel (across the small gap below the trigger) without the menu flickering
  // closed. Re-entering cancels the pending close.
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();

  const isPapeleria = department.slug === "papeleria";
  const accentText = isPapeleria
    ? "hover:text-pink-dark"
    : "hover:text-green-dark";

  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function handleEnter() {
    cancelClose();
    setOpen(true);
  }

  function handleLeave() {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  // Clean up any pending timer on unmount.
  useEffect(() => cancelClose, []);

  // Close when focus moves outside the whole group (keyboard navigation).
  function handleBlur(event: React.FocusEvent<HTMLLIElement>) {
    if (!wrapperRef.current?.contains(event.relatedTarget as Node)) {
      setOpen(false);
    }
  }

  return (
    <li
      ref={wrapperRef}
      className="static"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleBlur}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
    >
      <Link
        href={department.href}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "inline-flex items-center gap-1 py-2 text-sm tracking-wide text-ink transition-colors",
          accentText,
        )}
      >
        {department.label}
        <ChevronDownIcon
          width={14}
          height={14}
          className={cn(
            "transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </Link>

      {/* Mega-menu panel: full-width, light, lots of whitespace. */}
      <div
        id={panelId}
        role="region"
        aria-label={`Categorías de ${department.label}`}
        className={cn(
          "absolute inset-x-0 top-full z-40 border-t border-line bg-surface shadow-[0_12px_30px_-18px_rgba(0,0,0,0.25)] transition-all duration-150",
          open
            ? "visible opacity-100"
            : "invisible opacity-0",
        )}
      >
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-10 gap-y-8 px-6 py-10 sm:grid-cols-3 lg:grid-cols-4">
          {department.children?.map((category) => (
            <div key={category.slug}>
              <Link
                href={category.href}
                className={cn(
                  "block text-sm font-medium text-ink transition-colors",
                  accentText,
                )}
              >
                {category.label}
              </Link>

              {/* Subcategories (e.g. Confites → Gomas, Chicles, …). */}
              {category.children && (
                <ul className="mt-3 space-y-2">
                  {category.children.map((sub) => (
                    <li key={sub.slug}>
                      <Link
                        href={sub.href}
                        className={cn(
                          "font-meta text-sm text-ink-soft transition-colors",
                          accentText,
                        )}
                      >
                        {sub.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </li>
  );
}
