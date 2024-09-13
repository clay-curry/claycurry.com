-- Drop tables if they already exist (in the correct order to avoid FK issues)
DROP TABLE IF EXISTS reaction;
DROP TABLE IF EXISTS share;
DROP TABLE IF EXISTS views;
DROP TABLE IF EXISTS content_meta;
DROP TABLE IF EXISTS guestbook;

-- Drop types if they already exist
DROP TYPE IF EXISTS content_type;
DROP TYPE IF EXISTS share_type;
DROP TYPE IF EXISTS reaction_type;

-- Enum for ContentType
CREATE TYPE content_type AS ENUM ('PAGE', 'POST', 'PROJECT');

-- Enum for ShareType
CREATE TYPE share_type AS ENUM ('TWITTER', 'CLIPBOARD', 'OTHERS');

-- Enum for ReactionType
CREATE TYPE reaction_type AS ENUM ('CLAPPING', 'THINKING', 'AMAZED');

-- Table for ContentMeta
CREATE TABLE content_meta (
  slug TEXT NOT NULL,
  PRIMARY KEY (slug),
    
  type content_type NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for Views
CREATE TABLE views (
  slug TEXT REFERENCES content_meta(slug) ON DELETE CASCADE,
  session_id TEXT NOT NULL,  
  PRIMARY KEY (slug, session_id),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for Shares
CREATE TABLE share (
  slug TEXT REFERENCES content_meta(slug) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  type share_type DEFAULT 'OTHERS',
  PRIMARY KEY (slug, session_id, type),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for Reactions
CREATE TABLE reaction (
  slug TEXT REFERENCES content_meta(slug) ON DELETE CASCADE,
  session_id TEXT,
  type reaction_type DEFAULT 'CLAPPING',
  PRIMARY KEY (slug, session_id, type),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for Guestbook
CREATE TABLE guestbook (
  id SERIAL PRIMARY KEY,               -- Auto-incrementing primary key
  email VARCHAR(255) NOT NULL,         -- Email of the person submitting the entry
  body TEXT NOT NULL,                  -- The message or entry
  created_by VARCHAR(255) NOT NULL,    -- Name of the person who created the entry
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()  -- Timestamp of when the entry was created
);
