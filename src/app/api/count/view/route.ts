import { NextResponse } from 'next/server';
import { sql } from '../../../_db/postgres';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params?: { slug: string } | { slug: string }[] }
): Promise<NextResponse> {

  if (!process.env.POSTGRES_URL) {
    return NextResponse.json([], { status: 200 });
  }

  let query = await sql<{ slug: string, view_count: number }[]>`
    SELECT 
      slug, COUNT(*) as view_count
    FROM views
    GROUP BY slug
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
