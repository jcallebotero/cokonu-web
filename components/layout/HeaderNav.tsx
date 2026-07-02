"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { departments, type NavNode } from "@/config/navigation";
import { ChevronDownIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/**
 * Desktop department navigation.
 *
 * - Confitería opens a full-width image mega-menu (5 cards) on CLICK.
 * - Papelería opens a small text dropdown on click.
 * Only one menu is open at a time; both close on outside-click and Escape.
 * Data comes from config/navigation.ts (single source of truth), including the
 * per-category card images.
 */
export function HeaderNav() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Close on outside-click / Escape while a menu is open.
  useEffect(() => {
    if (!openKey) return;
    const onDown = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpenKey(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenKey(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openKey]);

  const confiteria = departments.find((d) => d.slug === "confiteria");
  const papeleria = departments.find((d) => d.slug === "papeleria");

  const toggle = (key: string) =>
    setOpenKey((cur) => (cur === key ? null : key));
  const close = () => setOpenKey(null);

  return (
    <nav
      ref={navRef}
      aria-label="Departamentos"
      className="flex items-center gap-8"
    >
      {confiteria && (
        <ConfiteriaMenu
          dept={confiteria}
          open={openKey === confiteria.slug}
          onToggle={() => toggle(confiteria.slug)}
          onClose={close}
        />
      )}
      {papeleria && (
        <PapeleriaMenu
          dept={papeleria}
          open={openKey === papeleria.slug}
          onToggle={() => toggle(papeleria.slug)}
          onClose={close}
        />
      )}
    </nav>
  );
}

function Trigger({
  label,
  open,
  panelId,
  onToggle,
  accent,
}: {
  label: string;
  open: boolean;
  panelId: string;
  onToggle: () => void;
  accent: string;
}) {
  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={panelId}
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-1 py-2 text-sm text-ink transition-colors",
        accent,
      )}
    >
      {label}
      <ChevronDownIcon
        width={14}
        height={14}
        className={cn("transition-transform duration-200", open && "rotate-180")}
      />
    </button>
  );
}

/** Confitería — full-width image mega-menu (5 cards). */
function ConfiteriaMenu({
  dept,
  open,
  onToggle,
  onClose,
}: {
  dept: NavNode;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const panelId = useId();
  const categories = dept.children ?? [];

  return (
    // `static` so the panel below positions against the (sticky) header, i.e.
    // spans the full header width.
    <div className="static">
      <Trigger
        label={dept.label}
        open={open}
        panelId={panelId}
        onToggle={onToggle}
        accent="hover:text-green-dark"
      />

      <div
        id={panelId}
        role="region"
        aria-label={`Categorías de ${dept.label}`}
        className={cn(
          "absolute inset-x-0 top-full z-40 border-t border-line bg-surface shadow-[0_12px_30px_-18px_rgba(0,0,0,0.25)]",
          open ? "block" : "hidden",
        )}
      >
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={cat.href}
                onClick={onClose}
                className="group flex flex-col items-center gap-3 p-4 transition-colors hover:bg-green-tint"
              >
                <div className="relative aspect-square w-full max-w-[150px]">
                  {cat.image && (
                    <Image
                      src={cat.image}
                      alt={`Cokonu — ${cat.label}`}
                      fill
                      sizes="150px"
                      className="object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                  )}
                </div>
                <span className="text-sm font-medium text-ink">
                  {cat.label}
                </span>
              </Link>
            ))}

            {/* Text-only "Ver todo" card, same box as the rest. */}
            <Link
              href={dept.href}
              onClick={onClose}
              className="group flex flex-col items-center justify-center gap-3 p-4 text-center transition-colors hover:bg-green-tint"
            >
              <span className="font-display text-2xl text-ink transition-colors group-hover:text-green-dark">
                Ver todo
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Papelería — simple text dropdown. */
function PapeleriaMenu({
  dept,
  open,
  onToggle,
  onClose,
}: {
  dept: NavNode;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const panelId = useId();

  return (
    <div className="relative">
      <Trigger
        label={dept.label}
        open={open}
        panelId={panelId}
        onToggle={onToggle}
        accent="hover:text-pink-dark"
      />

      <div
        id={panelId}
        role="menu"
        aria-label={`Categorías de ${dept.label}`}
        className={cn(
          "absolute left-0 top-full z-40 min-w-44 border border-line bg-surface py-2 shadow-[0_12px_30px_-18px_rgba(0,0,0,0.25)]",
          open ? "block" : "hidden",
        )}
      >
        {dept.children?.map((cat) => (
          <Link
            key={cat.slug}
            href={cat.href}
            onClick={onClose}
            role="menuitem"
            className="block px-4 py-2 text-sm text-ink transition-colors hover:bg-green-tint hover:text-pink-dark"
          >
            {cat.label}
          </Link>
        ))}
        <Link
          href={dept.href}
          onClick={onClose}
          role="menuitem"
          className="block px-4 py-2 text-sm text-ink-soft transition-colors hover:bg-green-tint hover:text-pink-dark"
        >
          Ver todo
        </Link>
      </div>
    </div>
  );
}
