import type { Metadata } from "next";
import {
  LegalPage,
  LegalSection,
  MailLink,
  WaLink,
} from "@/components/legal/LegalPage";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Política de Privacidad y Tratamiento de Datos",
};

export default function PrivacidadPage() {
  return (
    <LegalPage title="Política de Privacidad y Tratamiento de Datos Personales">
      <p>
        En cumplimiento de la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás
        normas concordantes de Colombia, Cokonu informa su política de
        tratamiento de datos personales.
      </p>

      <LegalSection title="1. Responsable del tratamiento">
        <p>
          Cokonu — Confitería y Papelería, NIT 98538341. Dirección:{" "}
          {siteConfig.address}. Contacto para asuntos de datos: <MailLink /> ·
          WhatsApp <WaLink />.
        </p>
      </LegalSection>

      <LegalSection title="2. Datos que recolectamos">
        <p>
          Cuando envías una cotización por WhatsApp, se comparte la información
          que tú proporcionas por ese medio (por ejemplo, nombre y número de
          teléfono). El sitio puede recolectar datos técnicos básicos de
          navegación.
        </p>
      </LegalSection>

      <LegalSection title="3. Almacenamiento en tu navegador">
        <p>
          Este sitio no utiliza cookies ni herramientas de analítica o rastreo
          de terceros. Para funcionar, guarda únicamente dos elementos de forma
          local en tu propio dispositivo, que no identifican a ninguna persona y
          que nunca se envían a Cokonu:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            el carrito de compras (los productos y cantidades que seleccionas),
            para que no se pierda al recargar la página; y
          </li>
          <li>
            una marca que indica que la animación de introducción ya se mostró
            durante esa sesión.
          </li>
        </ul>
        <p>
          Puedes eliminar ambos en cualquier momento borrando los datos de
          navegación (datos del sitio) de tu navegador.
        </p>
      </LegalSection>

      <LegalSection title="4. Finalidad">
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

      <LegalSection title="5. Autorización">
        <p>
          Al enviar una cotización, autorizas el tratamiento de tus datos
          conforme a esta política.
        </p>
      </LegalSection>

      <LegalSection title="6. Derechos del titular">
        <p>
          Como titular tienes derecho a conocer, actualizar, rectificar y
          suprimir tus datos, y a revocar la autorización, según la ley. Puedes
          ejercerlos escribiendo a <MailLink /> · WhatsApp <WaLink />.
        </p>
        <p>
          Conforme a la Ley 1581 de 2012, atenderemos las consultas en un
          término máximo de diez (10) días hábiles, prorrogable por cinco (5)
          días hábiles más; y los reclamos en un término máximo de quince (15)
          días hábiles, prorrogable por ocho (8) días hábiles más.
        </p>
      </LegalSection>

      <LegalSection title="7. Conservación y seguridad">
        <p>
          Conservamos los datos por el tiempo necesario para las finalidades
          descritas y aplicamos medidas razonables para protegerlos.
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
          Esta política entra en vigencia el 8 de septiembre de 2026. Esta
          política puede actualizarse; los cambios se publican en esta página.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
