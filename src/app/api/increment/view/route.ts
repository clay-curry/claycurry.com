export async function incrementView(slug: string) {
  noStore();

  if (!cookies().has('session_id'))
    await setCookie();
  
  await sql`
    INSERT INTO views (slug, session_id)
    VALUES (${slug}, ${cookies().get('session_id')!.value})
    ON CONFLICT DO NOTHING;
  `;  
}