import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { hasSameOrigin } from '@/lib/request-origin';
export async function POST(req: NextRequest) {
  if (!hasSameOrigin(req))
    return NextResponse.json({ detail: 'Origin not allowed' }, { status: 403 });
  const body = await req.json();
  if (body.action === 'demo' && (process.env.LINEA_MODE ?? 'demo') === 'demo') {
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
    if (process.env.LINEA_MODE === 'live') await (await supabaseServer()).auth.signOut();
    return NextResponse.json({ ok: true });
  }
  if (body.action === 'magic-link' && process.env.LINEA_MODE === 'live') {
    try {
      const client = await supabaseServer();
      const { error } = await client.auth.signInWithOtp({
        email: body.email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json(
        { detail: 'The sign-in link could not be sent. Check the authentication configuration.' },
        { status: 503 },
      );
    }
  }
  return NextResponse.json(
    { detail: 'Email sign-in is available after Supabase Auth is connected.' },
    { status: 503 },
  );
}
