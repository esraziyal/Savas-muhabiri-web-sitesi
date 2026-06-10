/*
  # Enable RLS with appropriate security policies
  
  Re-enable Row Level Security on all tables and add policies
  to allow public read access while protecting admin operations.
  
  Public can read all interviews and hero slides.
  Admin operations are unrestricted for data management.
*/

-- Re-enable RLS on all tables
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE war_correspondents ENABLE ROW LEVEL SECURITY;

-- Interviews: public read, no write (data managed via admin)
CREATE POLICY "Interviews are publicly readable"
  ON interviews
  FOR SELECT
  USING (true);

-- Hero slides: public read
CREATE POLICY "Hero slides are publicly readable"
  ON hero_slides
  FOR SELECT
  USING (true);

-- Comments: public read of approved, anyone can insert
CREATE POLICY "Comments publicly readable if approved"
  ON comments
  FOR SELECT
  USING (status = 'approved' OR status IS NULL);

CREATE POLICY "Anyone can submit comments"
  ON comments
  FOR INSERT
  WITH CHECK (true);

-- War correspondents: public read
CREATE POLICY "War correspondents are publicly readable"
  ON war_correspondents
  FOR SELECT
  USING (true);
