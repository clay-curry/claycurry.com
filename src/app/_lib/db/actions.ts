'use server';

import { sql } from './postgres';
import { auth } from '@/app/_lib/auth';
import { revalidatePath, unstable_noStore as noStore } from 'next/cache';

export async function saveGuestbookEntry(formData: FormData) {
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

export async function deleteGuestbookEntries(selectedEntries: string[]) {
  let gh = await auth();
  let email = gh?.user?.email as string;

  if (email !== 'hello@claycurry.com') {
    throw new Error('Unauthorized');
  }

  let selectedEntriesAsNumbers = selectedEntries.map(Number);
  let arrayLiteral = `{${selectedEntriesAsNumbers.join(',')}}`;

  await sql`
    DELETE FROM guestbook
    WHERE id = ANY(${arrayLiteral}::int[])
  `;

  revalidatePath('/admin');
  revalidatePath('/guestbook');
}





