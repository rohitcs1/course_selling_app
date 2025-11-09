-- Schema for Supabase/PostgreSQL database

-- Admins table for authentication
CREATE TABLE IF NOT EXISTS admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    poster TEXT,
    video_url TEXT,
    drive_link TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

-- Customer pre-purchase records
CREATE TABLE IF NOT EXISTS purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer JSONB NOT NULL,
    course_id UUID REFERENCES courses(id),
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'pending',
    razorpay_order_id TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Payment records
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_id UUID REFERENCES purchases(id),
    razorpay_payment_id TEXT NOT NULL,
    razorpay_order_id TEXT NOT NULL,
    razorpay_signature TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_razorpay_order ON purchases(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_purchase ON payments(purchase_id);