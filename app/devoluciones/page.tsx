import type { Metadata } from "next";
import {
  LegalPage,
  LegalSection,
  MailLink,
  WaLink,
} from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Cambios y Devoluciones" };

export default function DevolucionesPage() {
  return (
    <LegalPage title="Cambios y Devoluciones">
      <p>
        De acuerdo con el Estatuto del Consumidor (Ley 1480 de 2011), el cliente
        tiene derechos frente a los productos adquiridos.
      </p>

      <LegalSection title="1. Alcance">
        <p>
          Como los pedidos se cierran por WhatsApp, las condiciones específicas
          de cambio, devolución o garantía se acuerdan con Cokonu por ese canal
          al momento de la compra.
        </p>
      </LegalSection>

      <LegalSection title="2. Garantía / producto en mal estado">
        <p>
          Si un producto presenta defectos de calidad, se encuentra vencido,
          presenta daños atribuibles al despacho o no corresponde al producto
          solicitado, el cliente podrá comunicarse con Cokonú para solicitar la
          revisión del caso.
        </p>
        <p>
          La solicitud deberá realizarse dentro de los ocho (8) días calendario
          siguientes a la fecha de compra o entrega del producto. Una vez
          recibida la información y verificadas las condiciones del producto,
          Cokonú dará respuesta y, de ser procedente, realizará el cambio,
          reposición o solución correspondiente.
        </p>
      </LegalSection>

      <LegalSection title="3. Condiciones">
        <p>Para hacer efectivo un cambio o garantía, el cliente deberá:</p>
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>
            Presentar la factura, comprobante de compra o evidencia del pedido
            realizado en Cokonu.
          </li>
          <li>
            Reportar la novedad dentro de los ocho (8) días calendario
            siguientes a la fecha de compra.
          </li>
          <li>
            Conservar el producto y su empaque original para permitir la
            validación de la solicitud.
          </li>
          <li>
            Permitir la verificación del producto por parte de Cokonu,
            incluyendo fotografías o evidencia que demuestren el estado del
            producto.
          </li>
          <li>
            En caso de productos alimenticios, por razones sanitarias y de
            seguridad alimentaria, no se aceptarán cambios o devoluciones de
            productos que hayan sido consumidos, manipulados indebidamente o
            almacenados en condiciones inadecuadas después de la entrega.
          </li>
          <li>
            Cokonú se reserva el derecho de evaluar cada caso para determinar si
            la solicitud corresponde a una garantía por defecto, error en el
            despacho o producto no conforme.
          </li>
        </ol>
      </LegalSection>

      <LegalSection title="4. Cómo solicitarlo">
        <p>
          Escribe a <MailLink /> · <WaLink /> con la descripción y evidencia del
          caso.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
