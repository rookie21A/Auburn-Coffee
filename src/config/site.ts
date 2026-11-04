/**
 * Auburn Coffee — central configuration.
 * Change these values in ONE place; never hardcode them in components.
 */

export const BUSINESS_WHATSAPP_NUMBER = "918000000000"; // country code + number, digits only
export const BUSINESS_UPI_ID = "auburncoffee@upi";
export const BUSINESS_UPI_NAME = "Auburn Coffee";

export const SITE = {
  name: "Auburn Coffee",
  tagline: "Coffee, rooted in Chikkamagaluru.",
  description:
    "Auburn Coffee sources speciality Arabica, filter coffee, green beans, cascara and estate spices from the coffee hills of Chikkamagaluru, Karnataka.",
  email: "feedback.peopleco@gmail.com",
  phone: "+91 80000 00000",
  address: "Auburn Coffee, Estate Road, Chikkamagaluru, Karnataka 577101, India",
  hours: "Monday – Saturday, 9:00 AM – 7:00 PM IST",
  currency: "₹",
} as const;

/**
 * Kept here so the "Connect" sections can be switched back on once the real
 * social accounts exist. These handles are placeholders until then, so the
 * links are not rendered anywhere on the site.
 */
export const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com/auburncoffee" },
  { label: "Facebook", href: "https://facebook.com/auburncoffee" },
  { label: "YouTube", href: "https://youtube.com/@auburncoffee" },
  { label: "LinkedIn", href: "https://linkedin.com/company/auburncoffee" },
  { label: "WhatsApp", href: `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}` },
] as const;

/** Free shipping above this order value (in ₹). */
export const FREE_SHIPPING_THRESHOLD = 999;
export const FLAT_SHIPPING_RATE = 79;

export function shippingFor(subtotal: number) {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
}

export function formatINR(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function whatsappLink(message: string) {
  return `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** UPI deep link (opens the customer's installed UPI app). */
export function upiIntentLink(amount: number, orderNumber: string) {
  const params = new URLSearchParams({
    pa: BUSINESS_UPI_ID,
    pn: BUSINESS_UPI_NAME,
    am: amount.toFixed(2),
    cu: "INR",
    tn: `Auburn Coffee - ${orderNumber}`,
  });
  return `upi://pay?${params.toString()}`;
}

export const ROAST_LEVELS = [
  "Light Roast",
  "Medium Roast",
  "Medium Dark",
  "Dark Roast",
] as const;

export const PROCESSING_METHODS = ["Washed", "Natural", "Honey", "Anaerobic"] as const;

export const VARIETIES = ["Arabica", "Robusta", "Blend"] as const;

export const GRIND_OPTIONS = [
  "Whole Bean",
  "Espresso",
  "Moka Pot",
  "Pour Over",
  "French Press",
  "South Indian Filter",
  "Cold Brew",
] as const;

export const ORDER_STATUSES = [
  "Awaiting Payment",
  "Payment Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
