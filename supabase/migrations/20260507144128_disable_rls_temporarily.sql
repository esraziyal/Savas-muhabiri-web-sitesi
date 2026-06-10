/*
  # Temporarily disable RLS for data migration
  
  Disable RLS policies to allow bulk data insertion from old Supabase.
  Will re-enable after migration is complete.
*/

ALTER TABLE interviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE war_correspondents DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides DISABLE ROW LEVEL SECURITY;
