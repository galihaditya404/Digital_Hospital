import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const path = request.nextUrl.pathname

  // Protected routes: redirect to login if not authenticated
  if (path.startsWith('/dashboard') || path.startsWith('/portal')) {
     if (!user) {
       return NextResponse.redirect(new URL('/login', request.url))
     }
  }

  // Auth routes: redirect to dashboard if already authenticated
  if (path === '/login' || path === '/register') {
    if (user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
