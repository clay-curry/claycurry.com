import { NextResponse } from 'next/server';
import { sql } from '../../../_lib/db/postgres';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params?: { slug: string } | { slug: string }[] }
): Promise<NextResponse> {
  try {
    
    let query = await sql<{ slug: string, share_count: number }[]>`
      SELECT 
        slug, 
        COUNT(*) as share_count, 
        type as source 
      FROM shares
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

  } catch (error: any) {
    if (error.code === '42P01') { // PostgreSQL error code for undefined table
      return NextResponse.json({ error: 'Table "shares" does not exist' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
