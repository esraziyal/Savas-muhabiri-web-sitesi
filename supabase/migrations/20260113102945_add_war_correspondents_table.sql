/*
  # Add War Correspondents Table
  
  Create a new table for managing field correspondents and war journalists
  that appear on the homepage.
  
  ## New Table
  
  ### war_correspondents
  - `id` (uuid, primary key) - Unique correspondent identifier
  - `name` (text) - Correspondent name
  - `title` (text) - Job title or location
  - `photo_url` (text) - Portrait or profile photo URL
  - `description` (text) - Short biography or field description
  - `order_index` (integer) - Display order
  - `is_active` (boolean) - Active/inactive status
  - `created_at` (timestamptz) - Creation timestamp
  
  ## Security
  - Enable RLS on table
  - Public can view active correspondents
  - Only authenticated admins can modify
*/

CREATE TABLE IF NOT EXISTS war_correspondents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  title text NOT NULL,
  photo_url text NOT NULL,
  description text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE war_correspondents ENABLE ROW LEVEL SECURITY;

-- Policies for war_correspondents
CREATE POLICY "Anyone can view active correspondents"
  ON war_correspondents FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated admins can view all correspondents"
  ON war_correspondents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated admins can insert correspondents"
  ON war_correspondents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated admins can update correspondents"
  ON war_correspondents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated admins can delete correspondents"
  ON war_correspondents FOR DELETE
  TO authenticated
  USING (true);

-- Create index for display order
CREATE INDEX IF NOT EXISTS war_correspondents_order_idx ON war_correspondents(order_index) WHERE is_active = true;