import type { Metadata } from "next";
import {
  LegalPage,
  LegalSection,
  MailLink,
  WaLink,
} from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Política de Privacidad y Tratamiento de Datos",
};

export default function PrivacidadPage() {
  return (
    <LegalPage
      title="Política de Privacidad y Tratamiento de Datos Personales"
      lastUpdated="[COMPLETAR: fecha]"
    >
      <p>
        En cumplimiento de la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás
        normas concordantes de Colombia, Cokonu informa su política de
        tratamiento de datos personales.
      </p>

      <LegalSection title="1. Responsable del tratamiento">
        <p>
          Cokonu — Confitería y Papelería, NIT 98538341, Medellín, Colombia.
          Contacto para asuntos de datos: <MailLink /> · WhatsApp <WaLink />.
        </p>
      </LegalSection>

      <LegalSection title="2. Datos que recolectamos">
        <p>
          Cuando envías una cotización por WhatsApp, se comparte la información
          que tú proporcionas por ese medio (por ejemplo, nombre y número de
          teléfono). Si te suscribes al boletín, recolectamos tu correo
          electrónico. El sitio puede recolectar datos técnicos básicos de
          navegación.
        </p>
      </LegalSection>

      <LegalSection title="3. Finalidad">
        <p>Los datos se usan para:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>atender y responder cotizaciones y pedidos;</li>
          <li>
            contactar al cliente para confirmar disponibilidad, precios y
            entrega;
          </li>
          <li>
            enviar información comercial o promociones si el usuario lo autoriza;
          </li>
          <li>y mejorar el servicio.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Autorización">
        <p>
          Al enviar una cotización o suscribirte, autorizas el tratamiento de
          tus datos conforme a esta política.
        </p>
      </LegalSection>

      <LegalSection title="5. Derechos del titular">
        <p>
          Como titular tienes derecho a conocer, actualizar, rectificar y
          suprimir tus datos, y a revocar la autorización, según la ley. Puedes
          ejercerlos escribiendo a <MailLink /> · WhatsApp <WaLink />.
        </p>
      </LegalSection>

      <LegalSection title="6. Conservación y seguridad">
        <p>
          Conservamos los datos por el tiempo necesario para las finalidades
          descritas y aplicamos medidas razonables para protegerlos.
        </p>
      </LegalSection>

      <LegalSection title="7. Imágenes ilustrativas">
        <p>
          Las imágenes publicadas en el catálogo tienen fines ilustrativos. La
          presentación, empaque, diseño, colores o características visuales de
          algunos productos pueden variar según disponibilidad del fabricante,
          sin que ello afecte la calidad o funcionalidad del producto.
        </p>
      </LegalSection>

      <LegalSection title="8. Transferencia a terceros">
        <p>
          No vendemos datos personales. La comunicación se realiza
          principalmente por WhatsApp, sujeto a las políticas de dicha
          plataforma.
        </p>
      </LegalSection>

      <LegalSection title="9. Vigencia y cambios">
        <p>
          Esta política puede actualizarse; los cambios se publican en esta
          página.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
