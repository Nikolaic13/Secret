-- Migration: Add Food Inventory and Food Packs Management
-- This script creates the tables and seed data needed for:
-- 1. Generalized Food Inventory with Expiration Types (exact, range, non_perishable)
-- 2. Food Pack Creation and Bundling with Earliest Expiration Date tracking
-- 3. Expiry Urgency monitoring (FEFO - First Expired, First Out)

-- 1. Food Inventory Table
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

-- 2. Food Packs Table
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

-- Enable RLS
ALTER TABLE food_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read food_inventory" ON food_inventory FOR SELECT USING (true);
CREATE POLICY "Allow all insert food_inventory" ON food_inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update food_inventory" ON food_inventory FOR UPDATE USING (true);
CREATE POLICY "Allow all delete food_inventory" ON food_inventory FOR DELETE USING (true);

CREATE POLICY "Allow all read food_packs" ON food_packs FOR SELECT USING (true);
CREATE POLICY "Allow all insert food_packs" ON food_packs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update food_packs" ON food_packs FOR UPDATE USING (true);
CREATE POLICY "Allow all delete food_packs" ON food_packs FOR DELETE USING (true);
