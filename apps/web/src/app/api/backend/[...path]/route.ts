import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { hasSameOrigin } from '@/lib/request-origin';
const ALLOWED = /^(profiles|dashboard|checkins|demo|push|configuration)(\/|$)/;
async function proxy(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const path = (await ctx.params).path.join('/');
  if (!ALLOWED.test(path) || path.includes('..'))
    return NextResponse.json({ detail: 'Not found' }, { status: 404 });
  if (req.method !== 'GET' && !hasSameOrigin(req))
    return NextResponse.json({ detail: 'Origin not allowed' }, { status: 403 });
  let token: string | undefined;
  if ((process.env.LINEA_MODE ?? 'demo') === 'demo') {
    if ((await cookies()).get('linea-demo')?.value !== 'active')
      return NextResponse.json({ detail: 'Sign in required' }, { status: 401 });
    token = process.env.LINEA_DEMO_API_TOKEN ?? 'local-demo-only-change-me';
  } else {
    try {
      const supabase = await supabaseServer();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) return NextResponse.json({ detail: 'Sign in required' }, { status: 401 });
      const {
        data: { session },
      } = await supabase.auth.getSession();
      token = session?.access_token;
    } catch {
      return NextResponse.json({ detail: 'Authentication is not configured' }, { status: 503 });
    }
  }
  if (!token) return NextResponse.json({ detail: 'Sign in required' }, { status: 401 });
  try {
    const response = await fetch(
      `${process.env.LINEA_API_URL ?? 'http://127.0.0.1:8000'}/${path}${req.nextUrl.search}`,
      {
        method: req.method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : await req.text(),
        cache: 'no-store',
        signal: AbortSignal.timeout(15000),
      },
    );
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
    });
  } catch {
    return NextResponse.json(
      { detail: 'Linea’s local API is unavailable. Start the API and try again.' },
      { status: 503 },
    );
  }
}
export const GET = proxy,
  POST = proxy,
  PUT = proxy;
