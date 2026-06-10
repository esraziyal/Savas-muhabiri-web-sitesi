/*
  # Update image URLs from old to new Supabase project

  All image URLs in interviews, war_correspondents, hero_slides, and content JSONB
  are updated from the old project (uyuuvfyicgdmjdgmxuox) to the new project (vzygrtxwrejdmcgtnbum).
*/

-- interviews: interviewee_photo and header_image
UPDATE interviews
SET
  interviewee_photo = replace(interviewee_photo, 'https://uyuuvfyicgdmjdgmxuox.supabase.co', 'https://vzygrtxwrejdmcgtnbum.supabase.co'),
  header_image = replace(header_image, 'https://uyuuvfyicgdmjdgmxuox.supabase.co', 'https://vzygrtxwrejdmcgtnbum.supabase.co')
WHERE interviewee_photo LIKE '%uyuuvfyicgdmjdgmxuox%'
   OR header_image LIKE '%uyuuvfyicgdmjdgmxuox%';

-- interviews: content JSONB
UPDATE interviews
SET content = replace(content::text, 'uyuuvfyicgdmjdgmxuox.supabase.co', 'vzygrtxwrejdmcgtnbum.supabase.co')::jsonb
WHERE content::text LIKE '%uyuuvfyicgdmjdgmxuox%';

-- war_correspondents: photo_url
UPDATE war_correspondents
SET photo_url = replace(photo_url, 'https://uyuuvfyicgdmjdgmxuox.supabase.co', 'https://vzygrtxwrejdmcgtnbum.supabase.co')
WHERE photo_url LIKE '%uyuuvfyicgdmjdgmxuox%';

-- hero_slides: image_url
UPDATE hero_slides
SET image_url = replace(image_url, 'https://uyuuvfyicgdmjdgmxuox.supabase.co', 'https://vzygrtxwrejdmcgtnbum.supabase.co')
WHERE image_url LIKE '%uyuuvfyicgdmjdgmxuox%';
