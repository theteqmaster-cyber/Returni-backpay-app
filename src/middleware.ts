import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';
import { cookies } from 'next/headers';

const protectedRoutes = {
  merchant: '/merchant',
  agent: '/agent',
  admin: '/admin',
};

const publicRoutes = ['/merchant/login', '/merchant/setup', '/agent/login', '/admin/login'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Skip API routes and static files
  if (path.startsWith('/api') || path.startsWith('/_next') || path.includes('.')) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.includes(path);
  
  // Check session
  const cookieOptions = cookies().get('returni_session');
  const session = await decrypt(cookieOptions?.value);

  // 1. Redirect unauthenticated users
  if (!session?.id && !isPublicRoute) {
    // Determine where to send them based on path
    if (path.startsWith('/merchant')) {
      return NextResponse.redirect(new URL('/merchant/login', req.nextUrl));
    }
    if (path.startsWith('/agent')) {
      return NextResponse.redirect(new URL('/agent/login', req.nextUrl));
    }
    if (path.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', req.nextUrl));
    }
    // Default fallback
    return NextResponse.next();
  }

  // 2. Redirect authenticated users away from login pages
  if (session?.id && isPublicRoute) {
    if (session.role === 'merchant_user') {
      return NextResponse.redirect(new URL('/merchant/dashboard', req.nextUrl));
    }
    if (session.role === 'agent') {
      return NextResponse.redirect(new URL('/agent/dashboard', req.nextUrl));
    }
    if (session.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.nextUrl));
    }
    return NextResponse.next();
  }

  // 3. Role-based route protection
  if (session?.id && !isPublicRoute) {
    if (path.startsWith('/merchant') && session.role !== 'merchant_user' && session.role !== 'admin') {
      return NextResponse.redirect(new URL(`/${session.role === 'agent' ? 'agent' : 'merchant'}/dashboard`, req.nextUrl));
    }
    if (path.startsWith('/agent') && session.role !== 'agent' && session.role !== 'admin') {
      return NextResponse.redirect(new URL(`/${session.role === 'merchant_user' ? 'merchant' : 'agent'}/dashboard`, req.nextUrl));
    }
    if (path.startsWith('/admin') && session.role !== 'admin') {
      return NextResponse.redirect(new URL('/merchant/login', req.nextUrl)); // Generic fallback
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
