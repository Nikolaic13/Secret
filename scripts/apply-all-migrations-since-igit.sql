-- ==============================================================================
-- CONSOLIDATED DATABASE MIGRATION (All Changes Since Commit "igit")
-- ==============================================================================
-- This script safely and idempotently applies all 4 migrations created since "igit":
-- 1. scripts/add-beneficiaries-and-distributions.sql
-- 2. scripts/add-food-inventory-and-packs.sql
-- 3. scripts/add-pickup-map-override-and-transactions.sql
-- 4. scripts/add-expiry-columns.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ADD COLUMNS TO food_items
-- ------------------------------------------------------------------------------
DO $$ 
BEGIN
    -- Coordinates & Override columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'food_items' AND column_name = 'pickup_latitude') THEN
        ALTER TABLE food_items ADD COLUMN pickup_latitude DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'food_items' AND column_name = 'pickup_longitude') THEN
        ALTER TABLE food_items ADD COLUMN pickup_longitude DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'food_items' AND column_name = 'is_manual_override') THEN
        ALTER TABLE food_items ADD COLUMN is_manual_override BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'food_items' AND column_name = 'override_reason') THEN
        ALTER TABLE food_items ADD COLUMN override_reason TEXT;
    END IF;

    -- Expiry columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'food_items' AND column_name = 'expiry_type') THEN
        ALTER TABLE food_items ADD COLUMN expiry_type TEXT DEFAULT 'exact';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'food_items' AND column_name = 'expiry_date_from') THEN
        ALTER TABLE food_items ADD COLUMN expiry_date_from DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'food_items' AND column_name = 'expiry_date_to') THEN
        ALTER TABLE food_items ADD COLUMN expiry_date_to DATE;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. CREATE transaction_logs TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transaction_logs (
    id TEXT PRIMARY KEY,
    food_item_id TEXT NOT NULL,
    item_title TEXT NOT NULL,
    actor_id TEXT,
    actor_name TEXT,
    actor_role TEXT,
    action_type TEXT NOT NULL,
    old_status TEXT,
    new_status TEXT,
    target_barangay TEXT,
    quantity NUMERIC,
    unit TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tx_food_item ON transaction_logs(food_item_id);
CREATE INDEX IF NOT EXISTS idx_tx_actor ON transaction_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_tx_created ON transaction_logs(created_at DESC);

ALTER TABLE transaction_logs ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transaction_logs' AND policyname = 'Allow read transaction_logs') THEN
        CREATE POLICY "Allow read transaction_logs" ON transaction_logs FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'transaction_logs' AND policyname = 'Allow insert transaction_logs') THEN
        CREATE POLICY "Allow insert transaction_logs" ON transaction_logs FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 3. CREATE food_inventory & food_packs TABLES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS food_inventory (
    id TEXT PRIMARY KEY,
    barangay_name TEXT NOT NULL,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('grains', 'canned_goods', 'produce', 'dairy', 'baby_food', 'beverages', 'snacks', 'condiments', 'other')),
    quantity NUMERIC NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    unit TEXT NOT NULL,
    expiry_type TEXT NOT NULL DEFAULT 'exact' CHECK (expiry_type IN ('exact', 'range', 'non_perishable')),
    expiry_date DATE,
    expiry_date_from DATE,
    expiry_date_to DATE,
    condition TEXT DEFAULT 'good' CHECK (condition IN ('good', 'slightly_damaged_packaging')),
    storage_condition TEXT DEFAULT 'ambient' CHECK (storage_condition IN ('ambient', 'chilled', 'dry_store')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_inventory_barangay ON food_inventory(barangay_name);
CREATE INDEX IF NOT EXISTS idx_food_inventory_category ON food_inventory(category);
CREATE INDEX IF NOT EXISTS idx_food_inventory_expiry ON food_inventory(expiry_date);
CREATE INDEX IF NOT EXISTS idx_food_inventory_expiry_range ON food_inventory(expiry_date_from, expiry_date_to);

CREATE TABLE IF NOT EXISTS food_packs (
    id TEXT PRIMARY KEY,
    barangay_name TEXT NOT NULL,
    pack_name TEXT NOT NULL,
    description TEXT,
    target_beneficiary_type TEXT,
    contents JSONB NOT NULL DEFAULT '[]'::jsonb,
    quantity_available INTEGER NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
    earliest_expiry_date DATE NOT NULL,
    urgency_level TEXT DEFAULT 'safe' CHECK (urgency_level IN ('critical', 'high', 'medium', 'safe')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_packs_barangay ON food_packs(barangay_name);
CREATE INDEX IF NOT EXISTS idx_food_packs_earliest_expiry ON food_packs(earliest_expiry_date);

ALTER TABLE food_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_packs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'food_inventory' AND policyname = 'Allow all food_inventory') THEN
        CREATE POLICY "Allow all food_inventory" ON food_inventory FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'food_packs' AND policyname = 'Allow all food_packs') THEN
        CREATE POLICY "Allow all food_packs" ON food_packs FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 4. CREATE barangay_beneficiaries, clothing_inventory & aid_distributions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS barangay_beneficiaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    barangay_name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 125),
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    household_size INTEGER DEFAULT 1 CHECK (household_size >= 1),
    address_purok TEXT NOT NULL,
    contact_number TEXT,
    vulnerability_category TEXT DEFAULT 'low_income' 
      CHECK (vulnerability_category IN ('low_income', 'senior', 'pwd', 'pregnant', 'solo_parent', 'malnourished_child', 'displaced_family', 'infant_care')),
    is_urgent BOOLEAN DEFAULT FALSE,
    urgency_reason TEXT,
    last_aid_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_beneficiaries_barangay ON barangay_beneficiaries(barangay_name);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_urgent ON barangay_beneficiaries(is_urgent);

CREATE TABLE IF NOT EXISTS clothing_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    barangay_name TEXT NOT NULL,
    item_name TEXT NOT NULL,
    clothing_type TEXT NOT NULL CHECK (clothing_type IN ('tops', 'bottoms', 'jacket', 'baby_wear', 'dress', 'footwear', 'undergarment', 'bundle')),
    target_age_group TEXT NOT NULL CHECK (target_age_group IN ('infant', 'child', 'teen', 'adult', 'senior', 'all_ages')),
    min_age INTEGER DEFAULT 0,
    max_age INTEGER DEFAULT 120,
    size TEXT NOT NULL,
    gender_target TEXT DEFAULT 'unisex' CHECK (gender_target IN ('male', 'female', 'unisex', 'kids')),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
    condition TEXT DEFAULT 'gently_used' CHECK (condition IN ('new', 'gently_used')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clothing_barangay ON clothing_inventory(barangay_name);
CREATE INDEX IF NOT EXISTS idx_clothing_age ON clothing_inventory(target_age_group);

CREATE TABLE IF NOT EXISTS aid_distributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    barangay_name TEXT NOT NULL,
    beneficiary_id UUID REFERENCES barangay_beneficiaries(id) ON DELETE SET NULL,
    beneficiary_name TEXT NOT NULL,
    beneficiary_age INTEGER,
    distribution_date DATE DEFAULT CURRENT_DATE,
    item_type TEXT NOT NULL CHECK (item_type IN ('food', 'clothing', 'relief_pack', 'other')),
    item_name TEXT NOT NULL,
    category TEXT,
    clothing_size TEXT,
    clothing_age_group TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit TEXT NOT NULL,
    distributor_name TEXT NOT NULL,
    distributor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_distributions_barangay ON aid_distributions(barangay_name);
CREATE INDEX IF NOT EXISTS idx_distributions_beneficiary ON aid_distributions(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_distributions_date ON aid_distributions(distribution_date);

ALTER TABLE barangay_beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothing_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE aid_distributions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'barangay_beneficiaries' AND policyname = 'Allow all barangay_beneficiaries') THEN
        CREATE POLICY "Allow all barangay_beneficiaries" ON barangay_beneficiaries FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clothing_inventory' AND policyname = 'Allow all clothing_inventory') THEN
        CREATE POLICY "Allow all clothing_inventory" ON clothing_inventory FOR ALL USING (true) WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'aid_distributions' AND policyname = 'Allow all aid_distributions') THEN
        CREATE POLICY "Allow all aid_distributions" ON aid_distributions FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 5. RELOAD SCHEMA CACHE
-- ------------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
