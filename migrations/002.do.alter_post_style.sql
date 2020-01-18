CREATE TYPE post_category AS ENUM (
  'Music',
  'School',
  'News',
  'Misc'
);

ALTER TABLE posts
  ADD COLUMN
    style post_category;
