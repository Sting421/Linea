import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { hasSameOrigin } from '@/lib/request-origin';
import { passwordSession } from '@/lib/password-auth';
export async function POST(req: NextRequest) {
  if (!hasSameOrigin(req))
    return NextResponse.json({ detail: 'Origin not allowed' }, { status: 403 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object')
    return NextResponse.json({ detail: 'Invalid sign-in request.' }, { status: 400 });
  if (body.action === 'demo' && (process.env.LINEA_MODE ?? 'connected') === 'demo') {
    (await cookies()).set('linea-demo', 'active', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 86400,
    });
    return NextResponse.json({ ok: true });
  }
  if (body.action === 'signout') {
    (await cookies()).delete('linea-demo');
    if (['connected', 'live'].includes(process.env.LINEA_MODE ?? 'connected'))
      await (await supabaseServer()).auth.signOut();
    return NextResponse.json({ ok: true });
  }
  if (
    ['signin', 'signup'].includes(body.action) &&
    ['connected', 'live'].includes(process.env.LINEA_MODE ?? 'connected')
  ) {
    try {
      const client = await supabaseServer();
      const result = await passwordSession(
        client.auth,
        body,
        `${process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin}/auth/callback`,
      );
      return NextResponse.json(result.body, {
        status: result.status,
        headers: { 'Cache-Control': 'no-store' },
      });
    } catch {
      return NextResponse.json(
        { detail: 'Authentication is temporarily unavailable. Please try again.' },
        { status: 503 },
      );
    }
  }
  return NextResponse.json({ detail: 'This sign-in action is unavailable.' }, { status: 400 });
}
