/**
 * Payment gateway abstraction — SCAFFOLD ONLY (Phase 1).
 *
 * Defines a provider-agnostic interface so a real gateway (Wompi, Mercado
 * Pago, Stripe…) can be plugged in later WITHOUT restructuring the app or
 * touching the UI. UI/business code should depend on `PaymentProvider`, never
 * on a concrete SDK.
 *
 * When integrating:
 *   1. Implement `PaymentProvider` in e.g. lib/payments/wompi.ts.
 *   2. Select it via env config in `getPaymentProvider()`.
 *   3. Keep secrets server-side only.
 */

/** Money amount in COP (integer pesos). */
export interface PaymentAmount {
  /** Integer pesos, no decimals. */
  value: number;
  currency: "COP";
}

export interface PaymentLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateCheckoutInput {
  reference: string;
  amount: PaymentAmount;
  items: PaymentLineItem[];
  customerEmail?: string;
}

export interface CheckoutSession {
  /** Gateway-specific session/transaction id. */
  id: string;
  /** URL to redirect the customer to, when applicable. */
  redirectUrl?: string;
}

/** Contract every gateway adapter must satisfy. */
export interface PaymentProvider {
  readonly name: string;
  createCheckout(input: CreateCheckoutInput): Promise<CheckoutSession>;
}

/**
 * Returns the active payment provider.
 * Not implemented yet — wired up in a later phase.
 */
export function getPaymentProvider(): PaymentProvider {
  throw new Error(
    "No hay pasarela de pago configurada todavía (Fase 1). " +
      "Implementa un PaymentProvider y selecciónalo aquí.",
  );
}
