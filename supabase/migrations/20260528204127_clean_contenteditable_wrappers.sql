
/*
  # Clean broken contenteditable wrappers from interview content

  The RichTextEditor previously wrapped inline images in a <span contenteditable="false">
  element with control buttons, but the <img> tags were not being serialized correctly
  when saved to the database. This left empty wrapper spans in the content HTML.

  This migration removes those orphaned <span contenteditable="false"> wrappers
  from all paragraph blocks across all interviews.
*/

UPDATE interviews
SET content = (
  SELECT jsonb_agg(
    CASE
      WHEN block->>'type' = 'paragraph' THEN
        jsonb_set(
          block,
          '{content}',
          to_jsonb(
            regexp_replace(
              regexp_replace(
                block->>'content',
                '<span[^>]*contenteditable="false"[^>]*>.*?</span>',
                '',
                'g'
              ),
              '\s{2,}',
              ' ',
              'g'
            )
          )
        )
      ELSE block
    END
  )
  FROM jsonb_array_elements(content) AS block
)
WHERE content::text LIKE '%contenteditable%';
