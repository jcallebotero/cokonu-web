import Image from "next/image";
import Link from "next/link";
import { departments } from "@/config/navigation";
import { siteConfig, whatsappLink } from "@/config/site";

/**
 * Site footer on the off-white background. Minimal:
 *  - full Cokonu lockup + tagline,
 *  - department/category links generated from config/navigation.ts,
 *  - a placeholder Contacto / WhatsApp link,
 *  - copyright.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-line bg-bg">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand lockup */}
        <div className="space-y-4">
          <Image
            src="/brand/logo_cokonufull.png"
            alt="Cokonu — Confitería y Papelería"
            width={140}
            height={180}
            className="h-36 w-auto object-contain"
          />
          <p className="font-meta text-sm text-ink-soft">
            {siteConfig.tagline}
            <br />
            {siteConfig.location}
          </p>
        </div>

        {/* One column per department, listing its categories */}
        {departments.map((dept) => (
          <nav key={dept.slug} aria-label={dept.label}>
            <h3 className="font-display text-base">{dept.label}</h3>
            <ul className="mt-4 space-y-2.5">
              {dept.children?.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={cat.href}
                    className="text-sm text-ink-soft transition-colors hover:text-green-dark"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {/* Contact */}
        <div>
          <h3 className="font-display text-base">Contacto</h3>
          <ul className="mt-4 space-y-2.5">
            <li>
              <a
                href={whatsappLink("Hola Cokonu, quiero hacer un pedido.")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-ink-soft transition-colors hover:text-pink-dark"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 sm:flex-row">
          <p className="font-meta text-xs text-ink-soft">
            © {year} {siteConfig.name}. Todos los derechos reservados.
          </p>
          <p className="font-meta text-xs text-ink-soft">
            Hecho con cariño en {siteConfig.location}.
          </p>
        </div>
      </div>
    </footer>
  );
}
