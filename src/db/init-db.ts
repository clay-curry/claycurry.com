import { sql } from './postgres';
import { dropGuestbookTable, createGuestbookTable } from './guestbook';

export const drop = async () => {
    // Drop tables if they already exist (in the correct order to avoid FK issues)
    await sql`DROP TABLE IF EXISTS reaction;`;
    await sql`DROP TABLE IF EXISTS share;`;
    await sql`DROP TABLE IF EXISTS views;`;
    await sql`DROP TABLE IF EXISTS content_meta;`;
    await dropGuestbookTable();

    // Drop types if they already exist
    await sql`DROP TYPE IF EXISTS content_type;`;
    await sql`DROP TYPE IF EXISTS share_type;`;
    await sql`DROP TYPE IF EXISTS reaction_type;`;

}

export const init = async () => {
  try {
    // Enum for ContentType
    await sql`CREATE TYPE content_type AS ENUM ('PAGE', 'POST', 'PROJECT');`;

    // Enum for ShareType
    await sql`CREATE TYPE share_type AS ENUM ('TWITTER', 'CLIPBOARD', 'OTHERS');`;

    // Enum for ReactionType
    await sql`CREATE TYPE reaction_type AS ENUM ('CLAPPING', 'THINKING', 'AMAZED');`;

    // Table for ContentMeta
    await sql`
      CREATE TABLE content_meta (
        slug TEXT NOT NULL,
        PRIMARY KEY (slug)
      );
    `;

    // Table for Views
    await sql`
      CREATE TABLE views (
        slug TEXT REFERENCES content_meta(slug) ON DELETE CASCADE,
        session_id TEXT NOT NULL,
        PRIMARY KEY (slug, session_id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `;

    // Table for Shares
    await sql`
      CREATE TABLE share (
        slug TEXT REFERENCES content_meta(slug) ON DELETE CASCADE,
        session_id TEXT NOT NULL,
        type share_type DEFAULT 'OTHERS',
        PRIMARY KEY (slug, session_id, type),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `;

    // Table for Reactions
    await sql`
      CREATE TABLE reaction (
        slug TEXT REFERENCES content_meta(slug) ON DELETE CASCADE,
        session_id TEXT,
        type reaction_type DEFAULT 'CLAPPING',
        PRIMARY KEY (slug, session_id, type),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `;

    await createGuestbookTable();



    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Error initializing the database:', error);
    throw error;
  }
};

/* do not run this unless you want to reset the database */
/*
(async () => {
  await init();
  })();
*/