-- Run this in your Supabase SQL Editor

-- 1. Create products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  "lowStockThreshold" INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Enable Row Level Security (Optional but recommended)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for public access (Simplified for POS use)
CREATE POLICY "Public Access" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access" ON transactions FOR ALL USING (true) WITH CHECK (true);

-- 5. Insert initial data
INSERT INTO products (id, name, category, price, stock, "lowStockThreshold")
VALUES 
('1', 'Premium Coffee Beans', 'Beverages', 15.00, 45, 10),
('2', 'Organic Green Tea', 'Beverages', 8.50, 8, 10),
('3', 'Ceramic Mug', 'Merchandise', 12.00, 20, 5),
('4', 'Oat Milk', 'Dairy', 4.50, 30, 10),
('5', 'Almond Croissant', 'Bakery', 3.75, 5, 10),
('6', 'Blueberry Muffin', 'Bakery', 3.50, 15, 5)
ON CONFLICT (id) DO NOTHING;
