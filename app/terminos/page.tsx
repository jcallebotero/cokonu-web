import type { Metadata } from "next";
import {
  LegalPage,
  LegalSection,
  MailLink,
  WaLink,
} from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Términos y Condiciones" };

export default function TerminosPage() {
  return (
    <LegalPage title="Términos y Condiciones" lastUpdated="[COMPLETAR: fecha]">
      <LegalSection title="1. Identificación del titular">
        <p>
          Este sitio es operado por Cokonu — Confitería y Papelería, Sergio
          Ignacio Cano Velásquez, NIT 98538341, domiciliado en Medellín,
          Colombia. Contacto: <WaLink /> · <MailLink />.
        </p>
      </LegalSection>

      <LegalSection title="2. Objeto">
        <p>
          Cokonu es un catálogo en línea de productos de confitería y papelería.
          El sitio permite armar un pedido y enviarlo como cotización por
          WhatsApp; NO se realizan pagos ni ventas directamente en el sitio web.
        </p>
      </LegalSection>

      <LegalSection title="3. Productos, precios y disponibilidad">
        <p>
          Los precios y existencias mostrados provienen del sistema de
          inventario de Cokonu y pueden cambiar sin previo aviso. Los precios
          están en pesos colombianos (COP). La disponibilidad se confirma al
          momento de la cotización por WhatsApp. Los precios pueden variar según
          la cantidad (precios por mayor).
        </p>
      </LegalSection>

      <LegalSection title="4. Proceso de cotización">
        <p>
          El usuario selecciona productos y cantidades, y al finalizar es
          dirigido a WhatsApp con el resumen de su pedido. La cotización no
          constituye una venta cerrada hasta que Cokonu confirme disponibilidad,
          precio final y condiciones de entrega/pago por ese medio.
        </p>
      </LegalSection>

      <LegalSection title="5. Uso del sitio">
        <p>
          El usuario se compromete a usar el sitio de forma lícita y a no
          afectar su funcionamiento. El contenido, marca, logos e imágenes son
          propiedad de Cokonu y no pueden usarse sin autorización.
        </p>
      </LegalSection>

      <LegalSection title="6. Limitación de responsabilidad">
        <p>
          Cokonu procura que la información sea correcta, pero no garantiza que
          esté libre de errores; imágenes y presentaciones son ilustrativas.
        </p>
      </LegalSection>

      <LegalSection title="7. Ley aplicable">
        <p>
          Estos términos se rigen por las leyes de la República de Colombia.
          Para controversias aplican los jueces y tribunales competentes en
          Medellín.
        </p>
      </LegalSection>

      <LegalSection title="8. Contacto">
        <p>
          <MailLink /> · WhatsApp <WaLink />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
