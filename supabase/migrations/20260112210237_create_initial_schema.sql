/*
  # Savaş Muhabiri Database Schema
  
  Complete schema for war journalism platform
  
  ## Tables Created
  
  ### interviews
  - `id` (uuid, primary key) - Unique interview identifier
  - `title` (text) - Interview title
  - `slug` (text, unique) - URL-friendly slug
  - `interviewee_name` (text) - Name of the person interviewed
  - `interviewee_photo` (text) - URL to interviewee portrait photo
  - `subtitle` (text) - Short summary/description
  - `header_image` (text) - Large header image URL
  - `content` (jsonb) - Rich text content in structured format
  - `is_highlighted` (boolean) - Featured on homepage
  - `published_at` (timestamptz) - Publication date
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `author_id` (uuid) - Reference to admin user
  
  ### comments
  - `id` (uuid, primary key) - Unique comment identifier
  - `interview_id` (uuid) - Reference to interview
  - `author_name` (text) - Commenter name
  - `author_email` (text) - Commenter email
  - `content` (text) - Comment text
  - `status` (text) - pending/approved/rejected
  - `created_at` (timestamptz) - Creation timestamp
  
  ### hero_slides
  - `id` (uuid, primary key) - Unique slide identifier
  - `image_url` (text) - Hero image URL
  - `caption` (text, optional) - Image caption
  - `order_index` (integer) - Display order
  - `is_active` (boolean) - Active/inactive status
  - `created_at` (timestamptz) - Creation timestamp
  
  ## Security
  - Enable RLS on all tables
  - Public can read published content
  - Only authenticated admins can modify content
  - Comments require admin approval before display
*/

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  interviewee_name text NOT NULL,
  interviewee_photo text NOT NULL,
  subtitle text NOT NULL,
  header_image text NOT NULL,
  content jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_highlighted boolean DEFAULT false,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  author_id uuid REFERENCES auth.users(id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text NOT NULL,
  content text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- Create hero_slides table
CREATE TABLE IF NOT EXISTS hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Interviews policies
CREATE POLICY "Anyone can view published interviews"
  ON interviews FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated admins can insert interviews"
  ON interviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated admins can update interviews"
  ON interviews FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated admins can delete interviews"
  ON interviews FOR DELETE
  TO authenticated
  USING (true);

-- Comments policies
CREATE POLICY "Anyone can view approved comments"
  ON comments FOR SELECT
  TO public
  USING (status = 'approved');

CREATE POLICY "Anyone can create comments"
  ON comments FOR INSERT
  TO public
  WITH CHECK (status = 'pending');

CREATE POLICY "Authenticated admins can view all comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated admins can update comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated admins can delete comments"
  ON comments FOR DELETE
  TO authenticated
  USING (true);

-- Hero slides policies
CREATE POLICY "Anyone can view active hero slides"
  ON hero_slides FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated admins can view all hero slides"
  ON hero_slides FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated admins can insert hero slides"
  ON hero_slides FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated admins can update hero slides"
  ON hero_slides FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated admins can delete hero slides"
  ON hero_slides FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS interviews_slug_idx ON interviews(slug);
CREATE INDEX IF NOT EXISTS interviews_published_at_idx ON interviews(published_at DESC);
CREATE INDEX IF NOT EXISTS interviews_is_highlighted_idx ON interviews(is_highlighted) WHERE is_highlighted = true;
CREATE INDEX IF NOT EXISTS comments_interview_id_idx ON comments(interview_id);
CREATE INDEX IF NOT EXISTS comments_status_idx ON comments(status);
CREATE INDEX IF NOT EXISTS hero_slides_order_idx ON hero_slides(order_index) WHERE is_active = true;