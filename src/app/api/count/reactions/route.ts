import { NextResponse } from 'next/server';
import { sql } from '../../../_lib/db/postgres';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params?: { slug: string } | { slug: string }[] }
): Promise<NextResponse> {

  if (!process.env.POSTGRES_URL) {
    return NextResponse.json([], { status: 200 });
  }

  // Query the database for slug, reaction_count, and reaction type
  const query = await sql<{ slug: string, reaction_count: number, reaction: string }[]>`
    SELECT 
      slug, 
      COUNT(*) as reaction_count, 
      type as reaction 
    FROM reaction
    GROUP BY slug, type
    ORDER BY slug;
  `;

  // If no params provided, return the entire query result
  if (!params) {
    return NextResponse.json(query, { status: 200 });
  }

  // If params is an array, filter the query results by matching slugs
  if (Array.isArray(params)) {
    const filteredResults = query.filter(v => params.some(p => p.slug === v.slug));
    return NextResponse.json(filteredResults, { status: 200 });
  }

  // If params is a single slug, filter the query by matching the single slug
  const singleSlugResults = query.filter(v => v.slug === params.slug);
  return NextResponse.json(singleSlugResults, { status: 200 });
}
