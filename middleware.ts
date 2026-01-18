import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Debug logging
  console.log('[MIDDLEWARE] Path:', path);
  console.log('[MIDDLEWARE] Auth User:', user ? user.email : 'NOT AUTHENTICATED');

  // Check if user has a profile in the database (stricter check)
  let hasProfile = false;
  if (user) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();
    
    hasProfile = !!profile && !error;
    console.log('[MIDDLEWARE] Has Profile:', hasProfile);
  }

  // Determine if user is truly "authenticated" (has both auth session AND profile)
  const isAuthenticated = user && hasProfile;

  // 1. Authenticated (with profile) -> Block Public Auth Routes
  // If user is logged in AND has profile, they shouldn't see login/register pages
  if (isAuthenticated && (path === '/login' || path === '/register' || path === '/')) {
    console.log('[MIDDLEWARE] Redirecting authenticated user from', path, 'to /home');
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // 1.5. Has Auth but NO Profile -> Sign them out and redirect to login
  // This handles the case where profile was deleted but auth session remains
  if (user && !hasProfile && path !== '/login' && path !== '/register' && path !== '/') {
    console.log('[MIDDLEWARE] 🚫 User has auth but NO PROFILE - revoking session');
    // Sign out the user by clearing cookies
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('reason', 'no_profile');
    const redirectResponse = NextResponse.redirect(loginUrl);
    
    // Clear all Supabase auth cookies
    request.cookies.getAll().forEach(cookie => {
      if (cookie.name.startsWith('sb-')) {
        redirectResponse.cookies.set(cookie.name, '', {
          expires: new Date(0),
          path: '/',
        });
      }
    });
    
    return redirectResponse;
  }

  // 2. Not Logged In -> Block ALL Protected Dashboard Routes AND API Routes
  // Protected routes require authentication - includes ALL dashboard pages
  const protectedPageRoutes = [
    '/home',      // Dashboard home
    '/profile',   // User profile
    '/recipes',   // Saved recipes
    '/scan',      // Food scanner
    '/shop',      // Accessory shop
    '/history',   // Cooking history
    '/friends',   // Friends list
  ];
  
  // Protected API routes - these should return 401 instead of redirect
  const protectedApiRoutes = [
    '/api/recipes',
    '/api/generate-recipe',
    '/api/food-logs',
    '/api/food-plate-analyze',
    '/api/vision-analyze',
    '/api/cook-history',
    '/api/friends',
  ];
  
  const isProtectedPage = protectedPageRoutes.some(route => path.startsWith(route));
  const isProtectedApi = protectedApiRoutes.some(route => path.startsWith(route));
  console.log('[MIDDLEWARE] Is protected page:', isProtectedPage);
  console.log('[MIDDLEWARE] Is protected API:', isProtectedApi);
  
  // Block unauthenticated API requests with 401
  if (!isAuthenticated && isProtectedApi) {
    console.log('[MIDDLEWARE] 🚫 BLOCKING unauthenticated API access to:', path);
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }
  
  if (!isAuthenticated && isProtectedPage) {
    console.log('[MIDDLEWARE] 🚫 BLOCKING unauthenticated page access to:', path);
    // Create redirect response to login with the intended destination preserved
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    loginUrl.searchParams.set('reason', 'unauthenticated');
    const redirectResponse = NextResponse.redirect(loginUrl);
    
    // Revoke any stale auth cookies to prevent unauthorized access attempts
    // Clear Supabase auth cookies
    const supabaseCookies = [
      'sb-access-token',
      'sb-refresh-token',
      `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`,
    ];
    
    supabaseCookies.forEach(cookieName => {
      redirectResponse.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
      });
    });
    
    // Also clear any cookies that start with 'sb-' (Supabase cookies)
    request.cookies.getAll().forEach(cookie => {
      if (cookie.name.startsWith('sb-')) {
        redirectResponse.cookies.set(cookie.name, '', {
          expires: new Date(0),
          path: '/',
        });
      }
    });
    
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - public folder content
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
