import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

/** Branded 404 page (es-CO). Shown for invalid routes / unknown slugs. */
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-5 px-6 py-20 text-center">
      <Image
        src="/brand/logo_coko.png"
        alt="Personaje de Cokonu confundido"
        width={120}
        height={120}
        className="h-28 w-28 object-contain"
      />
      <h1 className="font-display text-3xl text-ink sm:text-4xl">
        Página no encontrada
      </h1>
      <p className="font-meta text-sm text-ink-soft">
        Lo sentimos, no pudimos encontrar lo que buscas. Puede que el enlace
        haya cambiado o el producto ya no esté disponible.
      </p>
      <Link href="/">
        <Button variant="primary" size="lg">
          Volver al inicio
        </Button>
      </Link>
    </div>
  );
}
