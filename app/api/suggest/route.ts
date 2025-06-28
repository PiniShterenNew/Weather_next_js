// src/app/api/suggest/route.ts
// GET /api/suggest?q=tel

import { NextRequest, NextResponse } from 'next/server';
import { getSuggestions } from '@/lib/helpers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const suggestions = await getSuggestions(query);
    return NextResponse.json(suggestions);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}
