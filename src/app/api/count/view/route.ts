import { NextResponse } from 'next/server';
import { sql } from '../../../_lib/db/postgres';

export async function GET(
  request: Request,
  { params }: { params?: { slug: string } | { slug: string }[] }
): Promise<NextResponse> {
  try {
    
    let query = (await sql<{ slug: string, view_count: number }[]>`
    SELECT 
      slug, COUNT(*) as view_count
    FROM views
    GROUP BY slug
    ORDER BY slug;
  `).map(v => ({ slug: v.slug, views: v.view_count })); 

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

  } catch (error: any) {
    if (error.code === '42P01') { // PostgreSQL error code for undefined table
      return NextResponse.json({ error: 'Table "shares" does not exist' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
