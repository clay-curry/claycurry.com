'use server';

import { sql } from './postgres';
import { auth } from '@/utils/auth';
import { 
  revalidatePath, 
  unstable_noStore as noStore,
} from 'next/cache';


export async function createGuestbookTable() {
      // Table for Guestbook
      await sql`
      CREATE TABLE guestbook (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        created_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `;
}

export async function dropGuestbookTable() {
  await sql`DROP TABLE IF EXISTS guestbook;`;

  revalidatePath('/admin');
  revalidatePath('/guestbook');
}

export async function pushGuestbookEntry(formData: FormData) {
  let gh = await auth();

  if (!gh || !gh.user)
    throw new Error('Unauthorized');

  let email = gh.user?.email as string;
  let created_by = gh.user?.name as string;

  if (!gh.user) {
    throw new Error('Unauthorized');
  }

  let entry = formData.get('entry')?.toString() || '';
  let body = entry.slice(0, 500);

  await sql`
    INSERT INTO guestbook (email, body, created_by, created_at)
    VALUES (${email}, ${body}, ${created_by}, NOW())
  `;

  revalidatePath('/guestbook');

  let data = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'guestbook@claycurry.com',
      to: 'hello@claycurry.com',
      subject: 'New Guestbook Entry',
      html: `<p>Email: ${email}</p><p>Message: ${body}</p>`,
    }),
  });

  let response = await data.json();
  console.log('Email sent', response);
}

export async function deleteGuestbookEntries(entries: string[]) {
  let gh = await auth();
  let email = gh?.user?.email as string;

  if (email !== 'hello@claycurry.com') {
    throw new Error('Unauthorized');
  }

  let selectedEntriesAsNumbers = entries.map(Number);
  let arrayLiteral = `{${selectedEntriesAsNumbers.join(',')}}`;

  await sql`
    DELETE FROM guestbook
    WHERE id = ANY(${arrayLiteral}::int[])
  `;

  revalidatePath('/admin');
  revalidatePath('/guestbook');
}

export async function selectGuestbookEntries() {
  noStore();
  return sql`
    SELECT id, body, created_by, updated_at
    FROM guestbook
    ORDER BY created_at DESC
    LIMIT 100
  `;
}
