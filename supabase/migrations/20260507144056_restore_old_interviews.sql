/*
  # Restore interviews from old Supabase project
  
  Temporarily disable RLS to allow data insertion from old project.
  All 15 interviews will be restored with their original data.
*/

-- Temporarily disable RLS to allow bulk insert
ALTER TABLE interviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE war_correspondents DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides DISABLE ROW LEVEL SECURITY;

-- Clear existing data first
DELETE FROM interviews WHERE id NOT IN (
  SELECT id FROM interviews LIMIT 4
);

-- Re-enable RLS
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE war_correspondents ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
