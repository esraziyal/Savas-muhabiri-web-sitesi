/*
  # Add title, subtitle, interview_slug columns to hero_slides

  1. Modified Tables
    - `hero_slides`
      - `title` (text, nullable) - Slide title displayed on hero
      - `subtitle` (text, nullable) - Slide subtitle
      - `interview_slug` (text, nullable) - Links slide to an interview for navigation

  2. Security
    - No RLS changes needed (already enabled)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hero_slides' AND column_name = 'title'
  ) THEN
    ALTER TABLE hero_slides ADD COLUMN title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hero_slides' AND column_name = 'subtitle'
  ) THEN
    ALTER TABLE hero_slides ADD COLUMN subtitle text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hero_slides' AND column_name = 'interview_slug'
  ) THEN
    ALTER TABLE hero_slides ADD COLUMN interview_slug text;
  END IF;
END $$;
