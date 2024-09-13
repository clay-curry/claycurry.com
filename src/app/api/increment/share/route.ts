
export const incrementShare = async ({
  slug,
  type,
}: {
  slug: string;
  type: ShareType;
}) => {

  noStore();

  if (!cookies().has('session_id'))
    await setCookie();

  try {
   await sql`
   INSERT INTO share (slug, session_id, type)
   VALUES (${slug}, ${cookies().get('session_id')!.value},  ${ShareType[type]})
   ON CONFLICT DO NOTHING
 `;
  } catch (err) {
    //
  }
};