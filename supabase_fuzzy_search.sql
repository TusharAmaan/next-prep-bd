CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION get_search_suggestion(search_term text)
RETURNS text AS $BODY$
DECLARE
  suggestion text;
BEGIN
  SELECT word INTO suggestion
  FROM (
    SELECT unnest(regexp_split_to_array(lower(title), '\s+')) as word
    FROM (
      SELECT title FROM courses
      UNION ALL SELECT title FROM ebooks
      UNION ALL SELECT title FROM news
      UNION ALL SELECT title FROM resources
    ) all_data
  ) words
  WHERE word IS NOT NULL AND length(word) > 3
  ORDER BY similarity(word, lower(search_term)) DESC
  LIMIT 1;

  IF similarity(suggestion, lower(search_term)) > 0.3 THEN
    RETURN suggestion;
  ELSE
    RETURN NULL;
  END IF;
END;
$BODY$ LANGUAGE plpgsql;
