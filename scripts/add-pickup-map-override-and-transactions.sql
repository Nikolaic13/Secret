-- Migration: Add Pickup Geolocation Coordinates, Manual Override and Transaction Logs
-- Enables:
-- 1. Exact GPS coordinates (pickup_latitude, pickup_longitude) for donors & drivers
-- 2. MSWD manual override flags & reason tracking
-- 3. Unified transaction_logs table for tracking the entire lifecycle of donations

-- 1. Add coordinates and manual override columns to food_items
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'food_items' AND column_name = 'pickup_latitude') THEN
        ALTER TABLE food_items ADD COLUMN pickup_latitude DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'food_items' AND column_name = 'pickup_longitude') THEN
        ALTER TABLE food_items ADD COLUMN pickup_longitude DOUBLE PRECISION;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'food_items' AND column_name = 'is_manual_override') THEN
        ALTER TABLE food_items ADD COLUMN is_manual_override BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'food_items' AND column_name = 'override_reason') THEN
        ALTER TABLE food_items ADD COLUMN override_reason TEXT;
    END IF;
END $$;

-- 2. Create transaction_logs table
CREATE TABLE IF NOT EXISTS transaction_logs (
    id TEXT PRIMARY KEY,
    food_item_id TEXT NOT NULL,
    item_title TEXT NOT NULL,
    actor_id TEXT,
    actor_name TEXT,
    actor_role TEXT,
    action_type TEXT NOT NULL CHECK (action_type IN (
        'donated',
        'pickup_requested',
        'driver_assigned',
        'claimed',
        'stored',
        'algo_allocated',
        'manual_allocated',
        'manual_overridden',
        'distributed',
        'rejected',
        'status_change'
    )),
    old_status TEXT,
    new_status TEXT,
    target_barangay TEXT,
    quantity NUMERIC,
    unit TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transaction_logs_food_item ON transaction_logs(food_item_id);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_action ON transaction_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_created_at ON transaction_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_barangay ON transaction_logs(target_barangay);

-- Enable RLS
ALTER TABLE transaction_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read transaction_logs" ON transaction_logs FOR SELECT USING (true);
CREATE POLICY "Allow all insert transaction_logs" ON transaction_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update transaction_logs" ON transaction_logs FOR UPDATE USING (true);
