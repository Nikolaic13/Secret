-- Table to store Community Impact Stories & Proof of Distribution for Donors
CREATE TABLE IF NOT EXISTS donation_impact_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_item_id INTEGER REFERENCES food_items(id) ON DELETE SET NULL,
    donor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    barangay_name TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    description TEXT,
    photos TEXT[] DEFAULT '{}',
    target_group TEXT DEFAULT 'community_families',
    beneficiaries_served INTEGER DEFAULT 1,
    families_count INTEGER DEFAULT 1,
    purok TEXT,
    officials_involved TEXT[] DEFAULT '{}',
    cheer_count INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    distribution_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking individual donor cheers/gratitude reactions
CREATE TABLE IF NOT EXISTS impact_story_cheers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES donation_impact_stories(id) ON DELETE CASCADE,
    donor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (story_id, donor_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_impact_stories_donor ON donation_impact_stories(donor_id);
CREATE INDEX IF NOT EXISTS idx_impact_stories_barangay ON donation_impact_stories(barangay_name);
CREATE INDEX IF NOT EXISTS idx_impact_stories_food_item ON donation_impact_stories(food_item_id);

-- Enable RLS
ALTER TABLE donation_impact_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_story_cheers ENABLE ROW LEVEL SECURITY;

-- Policies:
-- 1. Anyone logged in can view impact stories
CREATE POLICY "Public read impact stories" ON donation_impact_stories
    FOR SELECT USING (true);

-- 2. Officials and admins can insert/update impact stories
CREATE POLICY "Officials can insert impact stories" ON donation_impact_stories
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('municipal', 'barangay', 'admin'))
    );

CREATE POLICY "Officials can update impact stories" ON donation_impact_stories
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('municipal', 'barangay', 'admin'))
    );

-- 3. Donors can manage their cheers
CREATE POLICY "Users can manage cheers" ON impact_story_cheers
    FOR ALL USING (auth.uid() = donor_id);
