import Image from "next/image";
import Link from "next/link";
import { departments } from "@/config/navigation";
import { siteConfig, whatsappLink } from "@/config/site";

/**
 * Site footer.
 *
 * - Newsletter signup (left) — UI only, no submit logic.
 * - Social icons (right) — custom PNGs used as-is: WhatsApp (real link) and
 *   TikTok (placeholder "#").
 * - Department nav (from config/navigation.ts, single source of truth).
 * - Legal/info links to placeholder pages.
 * - Business identity line with placeholder NIT.
 * - Full-width "COKONU" hero wordmark in brand pink (fluid vw size).
 *
 * All supporting text is intentionally small/refined; only the COKONU wordmark
 * is large.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-bg-soft">
      <div className="w-full px-4 pb-6 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Newsletter signup — placeholder UI, no backend. */}
          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="font-display text-sm text-ink">Suscríbete</h3>
            <p className="mt-1.5 max-w-xs font-meta text-xs text-ink-soft">
              Novedades, lanzamientos y promociones de Cokonu en tu correo.
            </p>
            <div className="mt-3 flex max-w-xs">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                aria-label="Correo electrónico"
                className="w-full min-w-0 border border-line bg-surface px-2.5 py-1.5 text-xs text-ink outline-none placeholder:text-ink-soft focus:border-ink"
              />
              <button
                type="button"
                className="shrink-0 bg-ink px-3 text-xs font-medium text-surface transition-colors hover:bg-green-dark"
              >
                Enviar
              </button>
            </div>

            {/* Social icons — custom PNGs (used as-is, not recolored). */}
            <div className="mt-4 flex items-center gap-3">
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="block h-8 w-8 overflow-hidden transition-transform hover:scale-105"
              >
                <Image
                  src="/brand/whatsapp_cokonu.png"
                  alt="WhatsApp"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              </a>
              <a
                href="#"
                aria-label="TikTok"
                className="block h-8 w-8 overflow-hidden transition-transform hover:scale-105"
              >
                <Image
                  src="/brand/tiktok_cokonu.png"
                  alt="TikTok"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              </a>
            </div>
          </div>

          {/* One column per department, listing its categories. */}
          {departments.map((dept) => (
            <nav key={dept.slug} aria-label={dept.label}>
              <h3 className="font-display text-sm text-ink">{dept.label}</h3>
              <ul className="mt-3 space-y-2">
                {dept.children?.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={cat.href}
                      className="text-xs text-ink-soft transition-colors hover:text-green-dark"
                    >
                      {cat.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Legal / info links → placeholder pages. */}
          <nav aria-label="Ayuda">
            <h3 className="font-display text-sm text-ink">Ayuda</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href="/terminos"
                  className="text-xs text-ink-soft transition-colors hover:text-green-dark"
                >
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidad"
                  className="text-xs text-ink-soft transition-colors hover:text-green-dark"
                >
                  Política de Privacidad y Tratamiento de Datos
                </Link>
              </li>
              <li>
                <Link
                  href="/devoluciones"
                  className="text-xs text-ink-soft transition-colors hover:text-green-dark"
                >
                  Cambios y Devoluciones
                </Link>
              </li>
              <li>
                <Link
                  href="/contacto"
                  className="text-xs text-ink-soft transition-colors hover:text-green-dark"
                >
                  Contacto / PQR
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Business identity line — placeholder NIT. */}
        <p className="mt-8 font-meta text-[10px] text-ink-soft">
          {siteConfig.storeName} · NIT: 000000000-0 · {siteConfig.city}
        </p>
      </div>

      {/* Hero wordmark spanning the full width. The fluid vw size is tuned so
          the single word COKONU fills the row edge-to-edge at any width;
          overflow-hidden guards against a stray horizontal scrollbar. Swap
          text-pink → text-green to switch the brand color later. */}
      <div className="overflow-hidden text-center">
        <p
          aria-hidden
          className="font-display inline-block select-none whitespace-nowrap text-pink"
          style={{ fontSize: "21vw", lineHeight: 0.82 }}
        >
          COKONU
        </p>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line/70">
        <div className="flex flex-col items-center justify-between gap-1.5 px-4 py-3 text-center sm:flex-row sm:px-6 lg:px-8">
          <p className="font-meta text-[10px] text-ink-soft">
            © {year} {siteConfig.name}. Todos los derechos reservados.
          </p>
          <p className="font-meta text-[10px] text-ink-soft">
            Hecho con cariño en {siteConfig.city}.
          </p>
        </div>
      </div>
    </footer>
  );
}
