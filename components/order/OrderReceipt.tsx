import { formatCOP } from "@/lib/money";
import { siteConfig } from "@/config/site";
import { unitPriceForQty, hasPrice } from "@/lib/pricing";
import type { CartLine } from "@/context/CartContext";

/**
 * Branded order "recibo", laid out for PNG export (fixed 720px width, white
 * background). Styled with INLINE styles + hex colors on purpose: html-to-image
 * captures this reliably without depending on Tailwind v4's generated CSS.
 *
 * Null-price handling: when not every item has a price, per-line amounts and
 * the subtotal render as "Por confirmar" and a clarifying note is shown — so it
 * looks intentional now, and shows real money with no rework once prices exist.
 */

// Brand tokens (mirrors the design system; inline for capture reliability).
const C = {
  ink: "#1A1A1A",
  inkSoft: "#5C5C5C",
  green: "#429600",
  greenTint: "#E1FFCA",
  line: "#ECECEC",
  surface: "#FFFFFF",
};

export const RECEIPT_WIDTH = 720;

export function OrderReceipt({
  items,
  orderRef,
  date,
}: {
  items: CartLine[];
  orderRef: string;
  date: Date;
}) {
  const allPriced = items.length > 0 && items.every((l) => hasPrice(l.product));
  const subtotal = allPriced
    ? items.reduce(
        (sum, l) =>
          sum + (unitPriceForQty(l.product, l.quantity) as number) * l.quantity,
        0,
      )
    : null;

  const dateLabel = date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        width: RECEIPT_WIDTH,
        boxSizing: "border-box",
        background: C.surface,
        color: C.ink,
        fontFamily: "var(--font-montserrat), system-ui, sans-serif",
        padding: "40px 44px",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/logo_cokonufull.png"
          alt="Cokonu"
          width={120}
          height={154}
          style={{ width: 120, height: "auto", margin: "0 auto 12px" }}
        />
        <div
          style={{ fontWeight: 900, fontStyle: "italic", fontSize: 22, lineHeight: 1.1 }}
        >
          {siteConfig.storeName}
        </div>
        <div style={{ fontWeight: 300, fontSize: 13, color: C.inkSoft, marginTop: 4 }}>
          {siteConfig.city}
        </div>
      </div>

      {/* Title band */}
      <div
        style={{
          background: C.greenTint,
          borderRadius: 10,
          padding: "10px 16px",
          textAlign: "center",
          margin: "20px 0",
          fontWeight: 900,
          fontStyle: "italic",
          fontSize: 16,
          letterSpacing: 0.5,
        }}
      >
        RECIBO DE COTIZACIÓN
      </div>

      {/* Ref + date */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 14,
          marginBottom: 18,
        }}
      >
        <div>
          <span style={{ color: C.inkSoft }}>Pedido: </span>
          <span style={{ fontWeight: 400 }}>{orderRef}</span>
        </div>
        <div>
          <span style={{ color: C.inkSoft }}>Fecha: </span>
          <span style={{ fontWeight: 400 }}>{dateLabel}</span>
        </div>
      </div>

      {/* Items table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${C.green}`, textAlign: "left" }}>
            <th style={{ padding: "8px 6px", fontWeight: 400, color: C.inkSoft }}>
              Producto
            </th>
            <th
              style={{
                padding: "8px 6px",
                fontWeight: 400,
                color: C.inkSoft,
                textAlign: "center",
                width: 70,
              }}
            >
              Cant.
            </th>
            <th
              style={{
                padding: "8px 6px",
                fontWeight: 400,
                color: C.inkSoft,
                textAlign: "right",
                width: 150,
              }}
            >
              Importe
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map(({ product, quantity }) => {
            const unit = unitPriceForQty(product, quantity);
            const priced = unit !== null;
            return (
              <tr key={product.code} style={{ borderBottom: `1px solid ${C.line}` }}>
                <td style={{ padding: "10px 6px", verticalAlign: "top" }}>
                  <div style={{ fontWeight: 400 }}>{product.name}</div>
                  {product.presentation && (
                    <div style={{ fontWeight: 300, fontSize: 12, color: C.inkSoft }}>
                      {product.presentation}
                    </div>
                  )}
                  {priced && (
                    <div style={{ fontWeight: 300, fontSize: 12, color: C.inkSoft }}>
                      {formatCOP(unit)} c/u
                    </div>
                  )}
                </td>
                <td
                  style={{
                    padding: "10px 6px",
                    textAlign: "center",
                    verticalAlign: "top",
                  }}
                >
                  {quantity}
                </td>
                <td
                  style={{
                    padding: "10px 6px",
                    textAlign: "right",
                    verticalAlign: "top",
                    fontWeight: priced ? 400 : 300,
                    color: priced ? C.ink : C.inkSoft,
                  }}
                >
                  {priced ? formatCOP(unit * quantity) : "Por confirmar"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Subtotal */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginTop: 18,
          paddingTop: 14,
          borderTop: `2px solid ${C.green}`,
        }}
      >
        <span style={{ fontWeight: 400, fontSize: 15 }}>Subtotal</span>
        <span
          style={{
            fontWeight: subtotal !== null ? 900 : 300,
            fontStyle: subtotal !== null ? "normal" : "italic",
            fontSize: subtotal !== null ? 20 : 15,
            color: subtotal !== null ? C.ink : C.inkSoft,
          }}
        >
          {subtotal !== null ? formatCOP(subtotal) : "Por confirmar"}
        </span>
      </div>

      {!allPriced && (
        <p
          style={{
            fontWeight: 300,
            fontSize: 12,
            color: C.inkSoft,
            marginTop: 8,
          }}
        >
          Confirmamos precios y disponibilidad por WhatsApp.
        </p>
      )}

      {/* Footer */}
      <p
        style={{
          fontWeight: 300,
          fontSize: 12,
          color: C.inkSoft,
          textAlign: "center",
          marginTop: 28,
          lineHeight: 1.5,
        }}
      >
        Cotización generada desde cokonu — confirmamos disponibilidad y total por
        WhatsApp.
      </p>
    </div>
  );
}
