import type { Metadata } from "next";
import "./globals.css";
import { montserrat } from "./fonts";
import { siteConfig } from "@/config/site";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-CO"
      data-scroll-behavior="smooth"
      className={`${montserrat.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        {/*
          CartProvider scaffolds cart state (currently an empty array) so the
          header badge, cart drawer and future "add to cart" actions all share
          one source of truth.
        */}
        <CartProvider>
          {/* Skip link for keyboard users */}
          <a
            href="#contenido"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-surface"
          >
            Saltar al contenido
          </a>

          <Header />

          <main id="contenido" className="flex-1">
            {children}
          </main>

          <Footer />

          {/* Slide-in cart panel, controlled via CartContext. */}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
