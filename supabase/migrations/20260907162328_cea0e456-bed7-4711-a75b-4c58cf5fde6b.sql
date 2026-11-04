-- ============ helpers ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

-- ============ profiles ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  mobile TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, mobile)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email,
          NEW.raw_user_meta_data ->> 'mobile')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ addresses ============
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT,
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO service_role;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own addresses" ON public.addresses FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ catalogue ============
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT USING (active = true);
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  category_slug TEXT NOT NULL REFERENCES public.categories(slug) ON UPDATE CASCADE,
  subcategory TEXT,
  product_kind TEXT NOT NULL DEFAULT 'coffee',
  origin TEXT,
  coffee_variety TEXT,
  processing_method TEXT,
  roast_level TEXT,
  tasting_notes TEXT[] NOT NULL DEFAULT '{}',
  acidity TEXT,
  body TEXT,
  sweetness TEXT,
  altitude TEXT,
  brewing_methods TEXT[] NOT NULL DEFAULT '{}',
  grind_options TEXT[] NOT NULL DEFAULT '{}',
  price NUMERIC(10,2) NOT NULL,
  discount_price NUMERIC(10,2),
  stock INT NOT NULL DEFAULT 0,
  images TEXT[] NOT NULL DEFAULT '{}',
  rating NUMERIC(2,1),
  product_story TEXT,
  farm_details TEXT,
  brewing_guide TEXT,
  storage_note TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT USING (active = true);
CREATE POLICY "products admin read all" ON public.products FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "products admin write" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  weight_label TEXT NOT NULL,
  weight_grams INT,
  price NUMERIC(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0
);
GRANT SELECT ON public.product_variants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_variants TO authenticated;
GRANT ALL ON public.product_variants TO service_role;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "variants public read" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "variants admin write" ON public.product_variants FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ orders ============
CREATE SEQUENCE public.order_number_seq START 145;

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  shipping NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Awaiting Payment',
  payment_method TEXT NOT NULL DEFAULT 'UPI',
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own orders read" ON public.orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "own orders insert" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admin orders update" ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.assign_order_number()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'AUB-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('public.order_number_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END; $$;
ALTER TABLE public.orders ALTER COLUMN order_number DROP NOT NULL;
CREATE TRIGGER orders_number BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.assign_order_number();
GRANT USAGE ON SEQUENCE public.order_number_seq TO authenticated, service_role;

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  variant_label TEXT,
  grind TEXT,
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own order items read" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id
    AND (o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));
CREATE POLICY "own order items insert" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

-- ============ reviews / enquiries / gallery ============
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  contact TEXT,
  order_reference TEXT,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approved reviews public read" ON public.reviews FOR SELECT USING (approved = true);
CREATE POLICY "reviews admin read" ON public.reviews FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "anyone can submit feedback" ON public.reviews FOR INSERT
  WITH CHECK (approved = false);
CREATE POLICY "reviews admin write" ON public.reviews FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "reviews admin delete" ON public.reviews FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.bulk_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  business_type TEXT,
  product_interest TEXT,
  expected_quantity TEXT,
  frequency TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'New',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.bulk_enquiries TO anon;
GRANT SELECT, INSERT, UPDATE ON public.bulk_enquiries TO authenticated;
GRANT ALL ON public.bulk_enquiries TO service_role;
ALTER TABLE public.bulk_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit enquiry" ON public.bulk_enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "enquiries admin read" ON public.bulk_enquiries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "enquiries admin update" ON public.bulk_enquiries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gallery public read" ON public.gallery_images FOR SELECT USING (active = true);
CREATE POLICY "gallery admin write" ON public.gallery_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ demo data ============
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
  ('Speciality Coffee', 'speciality-coffee', 'Micro-lot Arabica from selected Chikkamagaluru estates.', 1),
  ('Filter Coffee', 'filter-coffee', 'Classic South Indian filter blends, ground fresh.', 2),
  ('Roasted Beans', 'roasted-beans', 'Small-batch roasted whole beans.', 3),
  ('Ground Coffee', 'ground-coffee', 'Ground to your brewing method.', 4),
  ('Green Coffee Beans', 'green-coffee-beans', 'Unroasted estate lots for home and craft roasters.', 5),
  ('Coffee Seeds', 'coffee-seeds', 'Viable estate seeds for planting.', 6),
  ('Cascara', 'cascara', 'Dried coffee cherry husk, gently sweet.', 7),
  ('Spices', 'spices', 'Shade-grown estate spices from the same hills.', 8);

INSERT INTO public.products (name, slug, short_description, description, category_slug, product_kind, origin, coffee_variety, processing_method, roast_level, tasting_notes, acidity, body, sweetness, altitude, brewing_methods, grind_options, price, discount_price, stock, images, rating, featured, product_story, farm_details, brewing_guide, storage_note) VALUES
('Hillside Arabica', 'hillside-arabica', 'A bright, balanced washed Arabica from the upper slopes.', 'Grown on the upper slopes of a family-run estate, Hillside Arabica is picked selectively and washed the same evening. Clean, layered and quietly sweet.', 'speciality-coffee', 'coffee', 'Chikkamagaluru, Karnataka', 'Arabica', 'Washed', 'Medium Roast', ARRAY['Orange zest','Cocoa','Jaggery'], 'Bright', 'Medium', 'Rounded', '1,150 – 1,300 m', ARRAY['Pour Over','Espresso','French Press'], ARRAY['Whole Bean','Espresso','Moka Pot','Pour Over','French Press','South Indian Filter','Cold Brew'], 690, 640, 48, ARRAY['/images/product-beans.jpg'], 4.8, true, 'The lot comes from four contiguous blocks planted in the 1970s under silver oak shade.', 'Family estate, 22 acres, shade-grown under silver oak and pepper vine.', 'Pour over: 18g coffee to 280g water at 94°C, 2:45 total.', 'Store in an airtight container away from light and heat. Do not refrigerate.'),
('Estate Filter Coffee', 'estate-filter-coffee', 'The classic 80:20 filter blend, ground for the traditional dabara.', 'Our filter blend keeps the ratio our families grew up with — 80% coffee, 20% chicory — roasted a shade darker for that unmistakable decoction.', 'filter-coffee', 'coffee', 'Chikkamagaluru, Karnataka', 'Blend', 'Washed', 'Medium Dark', ARRAY['Dark chocolate','Roasted nut','Caramel'], 'Low', 'Full', 'Sweet', '950 – 1,150 m', ARRAY['South Indian Filter','Moka Pot'], ARRAY['South Indian Filter','Moka Pot','Whole Bean'], 420, NULL, 120, ARRAY['/images/product-filter.jpg'], 4.9, true, 'Built for the morning dabara, refined over three roast trials.', 'Blended from two estates within 30 km of Chikkamagaluru town.', 'Filter: 4 tbsp in the upper chamber, press lightly, add water just off the boil.', 'Keep the pouch sealed; use within six weeks of opening.'),
('Peaberry Reserve', 'peaberry-reserve', 'Hand-sorted peaberry — concentrated and aromatic.', 'Only about five percent of a harvest forms a single round bean. We sort them out by hand and roast them separately.', 'speciality-coffee', 'coffee', 'Chikkamagaluru, Karnataka', 'Arabica', 'Washed', 'Medium Roast', ARRAY['Blackcurrant','Toffee','Cardamom'], 'Bright', 'Medium', 'Sweet', '1,250 – 1,400 m', ARRAY['Pour Over','Espresso'], ARRAY['Whole Bean','Espresso','Pour Over','Moka Pot'], 890, NULL, 26, ARRAY['/images/product-beans.jpg'], 4.7, true, 'A reserve lot, released only when the sorting yields enough.', 'Single block, north-facing, harvested in one pass.', 'Espresso: 18g in, 38g out, 28 seconds.', 'Airtight, cool and dark. Best within eight weeks of roast.'),
('Honey Process Arabica', 'honey-process-arabica', 'Mucilage left on during drying — syrupy and fruit-forward.', 'The cherries are pulped but dried with the mucilage intact on raised beds, turned hourly for twelve days.', 'speciality-coffee', 'coffee', 'Chikkamagaluru, Karnataka', 'Arabica', 'Honey', 'Light Roast', ARRAY['Red apple','Honey','Jasmine'], 'Bright', 'Silky', 'Very sweet', '1,200 – 1,350 m', ARRAY['Pour Over','Cold Brew'], ARRAY['Whole Bean','Pour Over','Cold Brew','Espresso'], 950, 880, 18, ARRAY['/images/product-beans.jpg'], 4.6, true, 'Our first experimental drying lot, now an annual release.', 'Raised-bed drying yard at 1,240 m.', 'Pour over: 15g to 250g at 92°C, gentle pours.', 'Airtight, away from spices.'),
('Washed Arabica', 'washed-arabica', 'A clean, everyday washed lot for daily brewing.', 'Fully washed and dried on patio, this is the coffee we drink at the estate most mornings.', 'roasted-beans', 'coffee', 'Chikkamagaluru, Karnataka', 'Arabica', 'Washed', 'Medium Roast', ARRAY['Almond','Cocoa','Brown sugar'], 'Medium', 'Medium', 'Rounded', '1,050 – 1,200 m', ARRAY['French Press','Moka Pot','Pour Over'], ARRAY['Whole Bean','Espresso','Moka Pot','Pour Over','French Press','Cold Brew'], 560, NULL, 90, ARRAY['/images/product-beans.jpg'], 4.5, false, 'The estate house coffee.', 'Sourced across three neighbouring smallholdings.', 'French press: 30g to 500g, four minutes, single plunge.', 'Airtight container, cool and dark.'),
('Natural Robusta', 'natural-robusta', 'Dried in cherry — deep, heavy and low in acidity.', 'A natural-processed Robusta with real structure. Excellent as a single origin espresso or as blend backbone.', 'roasted-beans', 'coffee', 'Chikkamagaluru, Karnataka', 'Robusta', 'Natural', 'Dark Roast', ARRAY['Bitter chocolate','Tobacco','Dried date'], 'Low', 'Full', 'Low', '750 – 900 m', ARRAY['Espresso','South Indian Filter'], ARRAY['Whole Bean','Espresso','South Indian Filter','Moka Pot'], 480, NULL, 75, ARRAY['/images/product-roasting.jpg'], 4.4, false, 'Robusta, treated with the same care as our Arabica.', 'Lower-elevation blocks, cherry-dried on patio for 18 days.', 'Espresso: 19g in, 40g out, 30 seconds.', 'Airtight, cool and dark.'),
('Green Arabica Beans', 'green-arabica-beans', 'Unroasted washed Arabica for home roasters.', 'Screen 17 washed Arabica, moisture 10.5–11.5%, delivered in the same crop year.', 'green-coffee-beans', 'coffee', 'Chikkamagaluru, Karnataka', 'Arabica', 'Washed', NULL, ARRAY['Sweet','Clean','Balanced'], NULL, NULL, NULL, '1,100 – 1,300 m', ARRAY[]::text[], ARRAY[]::text[], 620, NULL, 60, ARRAY['/images/product-green.jpg'], 4.6, true, 'For roasters who want to shape the profile themselves.', 'Single estate, one crop year, screen 17.', 'Roast to first crack plus 60–90 seconds for a medium profile.', 'Store in breathable jute or GrainPro at stable humidity.'),
('Coffee Seeds', 'coffee-seeds', 'Viable estate seeds for planting.', 'Selected from healthy mother plants, prepared for nursery sowing. Germination is best within three months.', 'coffee-seeds', 'other', 'Chikkamagaluru, Karnataka', 'Arabica', NULL, NULL, ARRAY[]::text[], NULL, NULL, NULL, NULL, ARRAY[]::text[], ARRAY[]::text[], 350, NULL, 40, ARRAY['/images/product-green.jpg'], 4.3, false, 'Seed from the same blocks that grow our speciality lots.', 'Mother plants aged 12–18 years.', NULL, 'Keep cool and slightly moist; sow within three months.'),
('Cascara', 'cascara', 'Dried coffee cherry husk — a delicate, tea-like infusion.', 'The fruit around the bean, dried and lightly sorted. Steeps into something between hibiscus and stewed fruit.', 'cascara', 'other', 'Chikkamagaluru, Karnataka', NULL, 'Natural', NULL, ARRAY['Hibiscus','Raisin','Rosehip'], NULL, NULL, NULL, NULL, ARRAY[]::text[], ARRAY[]::text[], 390, 360, 55, ARRAY['/images/product-cascara.jpg'], 4.5, true, 'Once discarded, now one of our favourite afternoon drinks.', 'Collected during the washing season and sun-dried.', 'Steep 8g in 300ml water at 90°C for five minutes.', 'Airtight, away from light.'),
('Estate Black Pepper', 'estate-black-pepper', 'Vine-grown pepper from the shade trees between coffee rows.', 'Pepper vines climb the silver oaks that shade our coffee. Sun-dried whole, sharp and floral.', 'spices', 'spice', 'Chikkamagaluru, Karnataka', NULL, NULL, NULL, ARRAY['Sharp','Floral','Woody'], NULL, NULL, NULL, NULL, ARRAY[]::text[], ARRAY[]::text[], 320, NULL, 80, ARRAY['/images/product-spices.jpg'], 4.7, false, 'Intercropped with coffee, harvested by the same hands.', 'Vines trained on silver oak shade trees.', NULL, 'Store whole in an airtight jar; grind fresh.'),
('Estate Cardamom', 'estate-cardamom', 'Green cardamom, hand-picked and slow-cured.', 'Bold green pods, cured slowly to keep the oils in. A little goes a long way.', 'spices', 'spice', 'Chikkamagaluru, Karnataka', NULL, NULL, NULL, ARRAY['Eucalyptus','Citrus','Camphor'], NULL, NULL, NULL, NULL, ARRAY[]::text[], ARRAY[]::text[], 640, NULL, 45, ARRAY['/images/product-spices.jpg'], 4.8, false, 'Grown in the wettest corner of the estate.', 'Shade-grown under natural canopy.', NULL, 'Keep pods whole in an airtight jar.');

INSERT INTO public.product_variants (product_id, weight_label, weight_grams, price, stock, sort_order)
SELECT p.id, v.label, v.grams, ROUND(p.price * v.mult), 25, v.ord
FROM public.products p
CROSS JOIN (VALUES ('250 g', 250, 1.0, 1), ('500 g', 500, 1.85, 2), ('1 kg', 1000, 3.5, 3)) AS v(label, grams, mult, ord);

INSERT INTO public.gallery_images (title, category, image_url, alt_text, sort_order) VALUES
('Misty estate slopes', 'Estates', '/images/hero-estate.jpg', 'Coffee estate rows disappearing into morning mist in the Chikkamagaluru hills', 1),
('Ripe cherries', 'Coffee Cherries', '/images/gallery-cherries.jpg', 'Close view of ripe red coffee cherries on the branch', 2),
('Harvest hands', 'Harvest', '/images/gallery-harvest.jpg', 'Estate worker hand-picking ripe coffee cherries into a basket', 3),
('Drum roasting', 'Roasting', '/images/product-roasting.jpg', 'Roasted coffee beans tumbling out of a small-batch drum roaster', 4),
('Green lots', 'Processing', '/images/product-green.jpg', 'Unroasted green coffee beans spread out for sorting', 5),
('Filter decoction', 'Brewing', '/images/gallery-brewing.jpg', 'South Indian filter coffee being poured between a dabara and tumbler', 6),
('Estate spices', 'Products', '/images/product-spices.jpg', 'Whole black pepper and green cardamom from the estate', 7),
('Chikkamagaluru hills', 'Chikkamagaluru', '/images/hero-estate.jpg', 'Layered hills of Chikkamagaluru at sunrise', 8);

INSERT INTO public.reviews (name, contact, rating, feedback, approved) VALUES
('Meera R.', 'meera@example.com', 5, 'The Estate Filter Coffee makes a decoction exactly like my grandmother''s. It has become a standing monthly order.', true),
('Arjun K.', 'arjun@example.com', 5, 'Hillside Arabica as pour over is superb — the orange note is really there. Packaging arrived sealed and fresh.', true),
('Fatima S.', 'fatima@example.com', 4, 'Peaberry Reserve is excellent, though it sells out fast. Delivery to Bengaluru took two days.', true),
('Rohit D.', 'rohit@example.com', 5, 'Ordered green beans for home roasting. Consistent screen size and clean cup. Will buy again.', true);