-- ============================================================
-- PrimeLink Donation System — Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ===================
-- 1. CAMPAIGNS TABLE
-- ===================
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  target_amount numeric(12,2) NOT NULL CHECK (target_amount > 0),
  raised_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK (raised_amount >= 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  image_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ===================
-- 2. DONATIONS TABLE
-- ===================
CREATE TABLE IF NOT EXISTS donations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_name text NOT NULL,
  donor_email text NOT NULL,
  donor_phone text,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'usd',
  payment_method text NOT NULL CHECK (payment_method IN ('stripe', 'mpesa')),
  transaction_id text NOT NULL UNIQUE,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  anonymous boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ======================
-- 3. PAYMENT_LOGS TABLE
-- ======================
CREATE TABLE IF NOT EXISTS payment_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  donation_id text NOT NULL,
  provider text NOT NULL CHECK (provider IN ('stripe', 'mpesa')),
  request_payload jsonb DEFAULT '{}',
  response_payload jsonb DEFAULT '{}',
  status text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ===================
-- 4. INDEXES
-- ===================
CREATE INDEX IF NOT EXISTS idx_donations_email ON donations(donor_email);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_campaign ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_created ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_logs_donation ON payment_logs(donation_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

-- ===================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ===================================
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- CAMPAIGNS: anyone can read active campaigns
CREATE POLICY "Public can view active campaigns"
  ON campaigns FOR SELECT
  USING (status = 'active');

-- DONATIONS: public can insert (controlled via API only, never expose service key)
CREATE POLICY "Public can insert donations"
  ON donations FOR INSERT
  WITH CHECK (true);

-- DONATIONS: service role can do everything (via createAdminClient)
-- Note: Service role bypasses RLS automatically — no extra policy needed.

-- PAYMENT_LOGS: service role only (no public policies)

-- ============================
-- 6. SAMPLE DATA (OPTIONAL)
-- ============================
INSERT INTO campaigns (title, description, target_amount, raised_amount, status) VALUES
  (
    'Digital Literacy for All',
    'We are equipping underserved communities with the digital skills needed to thrive in a connected world. This campaign funds laptops, training centers, and curriculum development for 500+ youth in rural Kenya.',
    500000,
    138000,
    'active'
  ),
  (
    'Tech Startup Incubator',
    'Launching a state-of-the-art incubator for African tech startups. Your donation funds mentorship programs, co-working spaces, and seed funding access for 50 early-stage companies.',
    1000000,
    423000,
    'active'
  ),
  (
    'Internet Connectivity Drive',
    'Bringing affordable broadband internet to 20 rural schools across Kenya and other countries. We cover infrastructure, hardware, and a 3-year connectivity subscription so students stay online without interruption.',
    300000,
    87500,
    'active'
  )
ON CONFLICT DO NOTHING;
