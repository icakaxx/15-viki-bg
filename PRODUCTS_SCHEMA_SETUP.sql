-- P0 - Products Management Schema Setup
-- Run this in your Supabase SQL Editor

-- 1. Drop existing old table if exists (case-sensitive)
DROP TABLE IF EXISTS public."Product" CASCADE;

-- 2. Create new products table with all required fields
CREATE TABLE IF NOT EXISTS public.products (
  id BIGSERIAL PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  colour TEXT,
  type TEXT,
  capacity_btu INTEGER,
  energy_rating TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  previous_price NUMERIC(10,2) CHECK (previous_price >= 0),
  image_url TEXT,
  
  -- New inventory and management fields
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  discount NUMERIC(5,2) DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
  is_archived BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicates
  UNIQUE(brand, model, capacity_btu, type)
);

-- 3. Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON public.products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_model ON public.products(model);
CREATE INDEX IF NOT EXISTS idx_products_type ON public.products(type);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_is_archived ON public.products(is_archived);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON public.products(updated_at DESC);

-- 5. Enable RLS (Row Level Security)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Service role can manage products" ON public.products;
DROP POLICY IF EXISTS "Anon can manage products (temporary)" ON public.products;

-- 7. Create RLS Policies
-- SELECT: Everyone can see non-archived products
CREATE POLICY "Anyone can view active products" ON public.products
    FOR SELECT
    USING (is_archived = FALSE);

-- INSERT/UPDATE/DELETE: Service role only (for API usage)
CREATE POLICY "Service role can manage products" ON public.products
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Temporarily allow anon role for development (remove in production)
CREATE POLICY "Anon can manage products (temporary)" ON public.products
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- 8. Insert sample data for testing
INSERT INTO public.products (brand, model, colour, type, capacity_btu, energy_rating, price, previous_price, image_url, stock, discount) VALUES
('Daikin', 'FTXS35K', 'White', 'Split', 12000, 'A++', 899.00, 999.00, '/images/daikin-ftxs35k.jpg', 15, 10.00),
('Mitsubishi', 'MSZ-LN35VG', 'White', 'Split', 12000, 'A+++', 1099.00, 1199.00, '/images/mitsubishi-msz-ln35vg.jpg', 8, 8.33),
('LG', 'ArtCool Gallery', 'Black', 'Split', 9000, 'A++', 749.00, 849.00, '/images/lg-artcool-gallery.jpg', 12, 11.78),
('Gree', 'Fairy', 'White', 'Split', 9000, 'A++', 549.00, 649.00, '/images/gree-fairy.jpg', 20, 15.41),
('Samsung', 'WindFree', 'White', 'Split', 12000, 'A+++', 999.00, 1099.00, '/images/samsung-windfree.jpg', 5, 9.10)
ON CONFLICT (brand, model, capacity_btu, type) DO NOTHING;

-- 9. Verify the setup
SELECT 'Products table created successfully' as status;
SELECT COUNT(*) as total_products FROM public.products;
SELECT COUNT(*) as active_products FROM public.products WHERE is_archived = FALSE; 