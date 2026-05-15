import { NextRequest, NextResponse } from 'next/server'

const COOKIE = 'fida_site_auth'
const MAX_AGE = 60 * 60 * 24 * 30  // 30 days

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  // Site password is read from SITE_PASSWORD env var.
  // If unset (e.g. local dev with no .env), fall back to the legacy literal
  // so the gate still works — but in production you MUST set SITE_PASSWORD.
  const expected = process.env.SITE_PASSWORD ?? 'atticus2026'

  if (!password || password !== expected) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE, '1', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  })
  return res
}
