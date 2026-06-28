"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { departments, type NavNode } from "@/config/navigation";
import { CloseIcon, ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/**
 * Mobile navigation: a slide-in panel from the left listing departments as
 * collapsible accordions. Tapping a department toggles its categories; the
 * 7 subcategories of Confites are shown indented.
 *
 * Closes on overlay click, on the close button, and on Escape.
 */
export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // Which department accordion is expanded.
  const [expanded, setExpanded] = useState<string | null>(null);

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      {/* Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-ink/40 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <nav
        aria-label="Menú principal"
        className={cn(
          "absolute left-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-surface shadow-xl transition-transform duration-250 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <span className="font-display text-lg">Menú</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="rounded-md p-1.5 text-ink hover:bg-green-tint"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          {departments.map((dept) => (
            <MobileDepartment
              key={dept.slug}
              dept={dept}
              isExpanded={expanded === dept.slug}
              onToggle={() =>
                setExpanded((cur) => (cur === dept.slug ? null : dept.slug))
              }
              onNavigate={onClose}
            />
          ))}
        </div>
      </nav>
    </div>
  );
}

function MobileDepartment({
  dept,
  isExpanded,
  onToggle,
  onNavigate,
}: {
  dept: NavNode;
  isExpanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const isPapeleria = dept.slug === "papeleria";
  const accent = isPapeleria ? "text-pink-dark" : "text-green-dark";

  return (
    <div className="border-b border-line/70 last:border-0">
      <div className="flex items-center justify-between">
        <Link
          href={dept.href}
          onClick={onNavigate}
          className="flex-1 py-3 pl-3 font-display text-base"
        >
          {dept.label}
        </Link>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? "Contraer" : "Expandir"} ${dept.label}`}
          className="rounded-md p-3 text-ink hover:bg-green-tint"
        >
          <ChevronDownIcon
            className={cn(
              "transition-transform duration-200",
              isExpanded && "rotate-180",
            )}
          />
        </button>
      </div>

      {isExpanded && dept.children && (
        <ul className="pb-2 pl-3">
          {dept.children.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={cat.href}
                onClick={onNavigate}
                className={cn("block py-2 text-sm font-medium", accent)}
              >
                {cat.label}
              </Link>
              {cat.children && (
                <ul className="mb-1 ml-3 border-l border-line pl-3">
                  {cat.children.map((sub) => (
                    <li key={sub.slug}>
                      <Link
                        href={sub.href}
                        onClick={onNavigate}
                        className="block py-1.5 font-meta text-sm text-ink-soft"
                      >
                        {sub.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
