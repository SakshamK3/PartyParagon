-- Party Paragon Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Products table (prices and images are editable)
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  sku TEXT NOT NULL,
  brand TEXT,
  size TEXT,
  material TEXT,
  description TEXT NOT NULL,
  image_url TEXT,
  colors TEXT[], -- array of color strings
  customizable BOOLEAN DEFAULT FALSE,
  pricing JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Site settings table (phone, email, instagram, etc)
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Insert default site settings
INSERT INTO site_settings (key, value) VALUES
  ('phone', '+91 97117 38500'),
  ('email', 'info@partyparagon.com'),
  ('instagram', '@partyparagonofficial'),
  ('instagram_url', 'https://instagram.com/partyparagonofficial'),
  ('location', 'Delhi NCR, India'),
  ('whatsapp', '919711738500'),
  ('business_hours', 'Mon–Sat, 9 AM – 7 PM IST');

-- 4. Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 5. Allow public read access
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON site_settings FOR SELECT USING (true);

-- 6. Allow authenticated users to update (for admin panel)
CREATE POLICY "Auth update products" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth insert products" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update settings" ON site_settings FOR UPDATE USING (auth.role() = 'authenticated');

-- 7. Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- 8. Allow public read access to images
CREATE POLICY "Public read images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

-- 9. Allow authenticated users to upload images
CREATE POLICY "Auth upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Auth update images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Auth delete images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- 10. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
