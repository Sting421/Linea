import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (code) {
    try {
      const { error } = await (await supabaseServer()).auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL('/', req.url));
    } catch {
      /* Configuration errors return to sign-in. */
    }
  }
  return NextResponse.redirect(new URL('/sign-in?error=expired', req.url));
}
