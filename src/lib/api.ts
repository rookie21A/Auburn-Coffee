import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  weight_label: string;
  weight_grams: number | null;
  price: number;
  stock: number;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  category_slug: string;
  subcategory: string | null;
  product_kind: string;
  origin: string | null;
  coffee_variety: string | null;
  processing_method: string | null;
  roast_level: string | null;
  tasting_notes: string[];
  acidity: string | null;
  body: string | null;
  sweetness: string | null;
  altitude: string | null;
  brewing_methods: string[];
  grind_options: string[];
  price: number;
  discount_price: number | null;
  stock: number;
  images: string[];
  rating: number | null;
  product_story: string | null;
  farm_details: string | null;
  brewing_guide: string | null;
  storage_note: string | null;
  featured: boolean;
  active: boolean;
  product_variants?: ProductVariant[];
}

export interface GalleryImage {
  id: string;
  title: string;
  category: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
}

export interface Review {
  id: string;
  name: string;
  contact: string | null;
  order_reference: string | null;
  rating: number;
  feedback: string;
  approved: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  delivery_address: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  product_name: string;
  variant_label: string | null;
  grind: string | null;
  unit_price: number;
  quantity: number;
}

export interface BulkEnquiry {
  id: string;
  full_name: string;
  company: string | null;
  email: string;
  phone: string;
  business_type: string | null;
  product_interest: string | null;
  expected_quantity: string | null;
  frequency: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

const db = supabase as unknown as {
  from: (t: string) => any;
};

function unwrap<T>(res: { data: unknown; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
}

export const productSelect =
  "*, product_variants(id, product_id, weight_label, weight_grams, price, stock, sort_order)";

export const queries = {
  categories: () => ({
    queryKey: ["categories"],
    queryFn: async () =>
      unwrap<Category[]>(
        await db.from("categories").select("*").order("sort_order", { ascending: true }),
      ),
  }),
  products: () => ({
    queryKey: ["products"],
    queryFn: async () =>
      unwrap<Product[]>(
        await db
          .from("products")
          .select(productSelect)
          .eq("active", true)
          .order("created_at", { ascending: true }),
      ),
  }),
  product: (slug: string) => ({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await db.from("products").select(productSelect).eq("slug", slug).maybeSingle();
      if (res.error) throw new Error(res.error.message);
      return res.data as Product | null;
    },
  }),
  gallery: () => ({
    queryKey: ["gallery"],
    queryFn: async () =>
      unwrap<GalleryImage[]>(
        await db.from("gallery_images").select("*").order("sort_order", { ascending: true }),
      ),
  }),
  approvedReviews: () => ({
    queryKey: ["reviews", "approved"],
    queryFn: async () =>
      unwrap<Review[]>(
        await db
          .from("reviews")
          .select("*")
          .eq("approved", true)
          .order("created_at", { ascending: false }),
      ),
  }),
  myOrders: () => ({
    queryKey: ["orders", "mine"],
    queryFn: async () =>
      unwrap<Order[]>(
        await db
          .from("orders")
          .select("*, order_items(*)")
          .order("created_at", { ascending: false }),
      ),
  }),
  orderByNumber: (orderNumber: string) => ({
    queryKey: ["order", orderNumber],
    queryFn: async () => {
      const res = await db
        .from("orders")
        .select("*, order_items(*)")
        .eq("order_number", orderNumber)
        .maybeSingle();
      if (res.error) throw new Error(res.error.message);
      return res.data as Order | null;
    },
  }),
  myAddresses: () => ({
    queryKey: ["addresses"],
    queryFn: async () =>
      unwrap<any[]>(
        await db.from("addresses").select("*").order("created_at", { ascending: false }),
      ),
  }),
  myProfile: (userId: string) => ({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const res = await db.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (res.error) throw new Error(res.error.message);
      return res.data as {
        id: string;
        full_name: string | null;
        mobile: string | null;
        email: string | null;
      } | null;
    },
  }),
  // Admin
  allProducts: () => ({
    queryKey: ["admin", "products"],
    queryFn: async () =>
      unwrap<Product[]>(
        await db.from("products").select(productSelect).order("name", { ascending: true }),
      ),
  }),
  allOrders: () => ({
    queryKey: ["admin", "orders"],
    queryFn: async () =>
      unwrap<Order[]>(
        await db
          .from("orders")
          .select("*, order_items(*)")
          .order("created_at", { ascending: false }),
      ),
  }),
  allReviews: () => ({
    queryKey: ["admin", "reviews"],
    queryFn: async () =>
      unwrap<Review[]>(
        await db.from("reviews").select("*").order("created_at", { ascending: false }),
      ),
  }),
  allEnquiries: () => ({
    queryKey: ["admin", "enquiries"],
    queryFn: async () =>
      unwrap<BulkEnquiry[]>(
        await db.from("bulk_enquiries").select("*").order("created_at", { ascending: false }),
      ),
  }),
};

export { db };

export function variantsOf(product: Product): ProductVariant[] {
  const list = [...(product.product_variants ?? [])];
  list.sort((a, b) => a.sort_order - b.sort_order);
  return list;
}

export function effectivePrice(product: Product) {
  return product.discount_price ?? product.price;
}

export function productImage(product: Product) {
  return product.images?.[0] ?? "/images/product-beans.jpg";
}

export function isCoffee(product: Product) {
  return product.product_kind === "coffee";
}
