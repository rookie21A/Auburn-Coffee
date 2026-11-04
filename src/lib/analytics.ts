/**
 * Lightweight analytics event bus. No third-party keys.
 * Wire a real provider later by subscribing to window "auburn:analytics".
 */
export type AnalyticsEvent =
  | "product_viewed"
  | "product_added_to_cart"
  | "cart_viewed"
  | "checkout_started"
  | "order_created"
  | "upi_payment_initiated"
  | "whatsapp_checkout_opened"
  | "bulk_order_submitted"
  | "feedback_submitted"
  | "signup_completed";

export function track(event: AnalyticsEvent, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("auburn:analytics", { detail: { event, payload, ts: Date.now() } }),
  );
}
