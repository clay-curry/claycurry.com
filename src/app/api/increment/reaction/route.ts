import { sql } from "@/app/_db/postgres";
import { getSessionId } from "@/app/_lib/session";
import { ReactionType } from "@/app/_utils/types";


export const incrementReaction = async ({
  slug,
  type,
}: {
  slug: string;
  type: ReactionType;
}) => {

  const session_id = await getSessionId();

  try {
    await sql`
        INSERT INTO reactions (slug, count, type)
        VALUES (${slug}, ${session_id}, ${ReactionType[type]})
        ON CONFLICT (slug)
        DO UPDATE SET count = views.count + 1
      `;
  } catch (err) {
    //
  }
};

