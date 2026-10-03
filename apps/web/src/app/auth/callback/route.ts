import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const tokenHash = req.nextUrl.searchParams.get('token_hash');
  if (code || tokenHash) {
    try {
      const client = await supabaseServer();
      const { error } = code
        ? await client.auth.exchangeCodeForSession(code)
        : await client.auth.verifyOtp({ token_hash: tokenHash!, type: 'email' });
      if (!error) return NextResponse.redirect(new URL('/', req.url));
    } catch {
      /* Configuration errors return to sign-in. */
    }
  }
  return NextResponse.redirect(new URL('/sign-in?error=expired', req.url));
}
