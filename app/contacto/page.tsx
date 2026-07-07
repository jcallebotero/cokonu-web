import type { Metadata } from "next";
import {
  LegalPage,
  MailLink,
  WaLink,
} from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Contacto / PQR" };

export default function ContactoPage() {
  return (
    <LegalPage title="Contacto / PQR">
      <p>Canal de Peticiones, Quejas y Reclamos (PQR) de Cokonu.</p>

      <dl className="space-y-4">
        <div>
          <dt className="font-medium text-ink">WhatsApp</dt>
          <dd>
            <WaLink /> (canal principal).
          </dd>
        </div>
        <div>
          <dt className="font-medium text-ink">Correo</dt>
          <dd>
            <MailLink />
          </dd>
        </div>
        <div>
          <dt className="font-medium text-ink">Ubicación</dt>
          <dd>
            Medellín, Colombia. Central mayorista de Antioquia, Itagüí, bloque
            13 local 77 y 78.
          </dd>
        </div>
        <div>
          <dt className="font-medium text-ink">Horario de atención</dt>
          <dd>
            Lun y Sáb 5:00 a.m – 1:00 p.m · Mar a Vie 5:00 a.m – 3:00 p.m.
          </dd>
        </div>
        <div>
          <dt className="font-medium text-ink">
            Tiempo de respuesta estimado a PQR
          </dt>
          <dd>Hasta 10 días hábiles.</dd>
        </div>
      </dl>
    </LegalPage>
  );
}
