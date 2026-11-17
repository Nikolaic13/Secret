-- Add image_url column to food_items table idempotently
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'food_items' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE food_items ADD COLUMN image_url TEXT;
    END IF;
END $$;

COMMENT ON COLUMN food_items.image_url IS 'Public URL or encoded image data for the donated food item';

-- Create public storage bucket for food donation images
INSERT INTO storage.buckets (id, name, public)
VALUES ('food-images', 'food-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for food-images bucket
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read food-images'
    ) THEN
        CREATE POLICY "Public read food-images"
            ON storage.objects FOR SELECT
            USING (bucket_id = 'food-images');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated upload food-images'
    ) THEN
        CREATE POLICY "Authenticated upload food-images"
            ON storage.objects FOR INSERT
            TO authenticated
            WITH CHECK (bucket_id = 'food-images');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated update food-images'
    ) THEN
        CREATE POLICY "Authenticated update food-images"
            ON storage.objects FOR UPDATE
            TO authenticated
            USING (bucket_id = 'food-images');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated delete food-images'
    ) THEN
        CREATE POLICY "Authenticated delete food-images"
            ON storage.objects FOR DELETE
            TO authenticated
            USING (bucket_id = 'food-images');
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
