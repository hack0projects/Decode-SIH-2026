-- =============================================================================
-- CodeSeekho -- Supabase Setup SQL
-- Run this ONCE in your Supabase project:
--   Dashboard -> SQL Editor -> New Query -> paste all -> Run
-- =============================================================================

-- 1. Enable UUID extension (already active on most Supabase projects)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the videos table
CREATE TABLE IF NOT EXISTS public.videos (
    id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id        TEXT          NOT NULL UNIQUE,
    title         TEXT          NOT NULL,
    language      TEXT          NOT NULL CHECK (language IN ('Python', 'C++')),
    scene_count   INTEGER       NOT NULL,
    script_json   JSONB         NOT NULL,
    video_url     TEXT          NOT NULL,
    storage_path  TEXT          NOT NULL,
    status        TEXT          NOT NULL DEFAULT 'completed',
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 3. Performance indexes
CREATE INDEX IF NOT EXISTS idx_videos_job_id  ON public.videos (job_id);
CREATE INDEX IF NOT EXISTS idx_videos_created ON public.videos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_lang    ON public.videos (language);

-- 4. Enable Row Level Security
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- 5. Service role policy (backend API uses service_role key -- full access)
DROP POLICY IF EXISTS "service_role_full_access" ON public.videos;
CREATE POLICY "service_role_full_access" ON public.videos
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 6. Anon read policy (public-facing reads, e.g. a video gallery page)
DROP POLICY IF EXISTS "anon_read_only" ON public.videos;
CREATE POLICY "anon_read_only" ON public.videos
    FOR SELECT
    USING (true);

-- =============================================================================
-- STORAGE BUCKET
-- If the SELECT below errors, create the bucket manually instead:
--   Dashboard -> Storage -> New Bucket
--   Name:   sih_videos
--   Public: YES  (so video_url works without a signed URL)
-- =============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('sih_videos', 'sih_videos', true)
ON CONFLICT (id) DO NOTHING;
