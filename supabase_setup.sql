-- 1. DROP EXISTING TABLES (Reset Database)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS agency_wallets CASCADE;
DROP TABLE IF EXISTS vendor_wallets CASCADE;

-- 2. CREATE USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    address TEXT NOT NULL,
    business_type TEXT DEFAULT 'Kirana Store',
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CREATE VENDORS/AGENCIES TABLE
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    store_name TEXT NOT NULL,
    store_address TEXT NOT NULL,
    gst_number TEXT UNIQUE NOT NULL,
    turnover TEXT,
    phone TEXT UNIQUE NOT NULL,
    alternate_phone TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'blocked')),
    role TEXT DEFAULT 'vendor',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CREATE PRODUCTS TABLE
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_hi TEXT NOT NULL,
    price NUMERIC NOT NULL,
    unit TEXT DEFAULT 'kg' CHECK (unit IN ('kg', 'g', 'pcs', 'pack', 'liter', 'ml')),
    min_qty NUMERIC DEFAULT 1,
    stock NUMERIC NOT NULL DEFAULT 0,
    offer TEXT DEFAULT '',
    status TEXT DEFAULT 'In Stock' CHECK (status IN ('In Stock', 'Out of Stock')),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. CREATE ORDERS TABLE
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT UNIQUE,
    master_order_id TEXT NOT NULL,
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    user_id UUID NOT NULL REFERENCES users(id),
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled')),
    payment_status TEXT DEFAULT 'Unpaid' CHECK (payment_status IN ('Unpaid', 'Paid', 'Pending Approval')),
    payment_method TEXT DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'Online')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. CREATE ORDER ITEMS TABLE
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    name_en TEXT,
    name_hi TEXT,
    price NUMERIC,
    quantity NUMERIC,
    total NUMERIC
);

-- 7. INITIALIZE SUPER ADMIN (ojas / 121)
-- Note: Password '121' hashed with bcrypt (cost 10)
INSERT INTO users (name, phone, password, address, business_type, role)
VALUES (
    'Super Admin', 
    'ojas', 
    '$2a$10$Tf.7F6oUj6R.wN0q4LhEGO3f4B/uFv8rMvBwzE4Rz5G6vUa9R.K3i', -- This is '121' hashed
    'Admin Headquarters', 
    'Management', 
    'admin'
);
