import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import type { SupabaseCookieToSet } from "@/src/lib/supabase/cookie-types";

const PUBLIC_PATHS = new Set([
  "/login",
  "/register",
  "/forget",
  "/manifest.webmanifest",
  "/api/spotify/login",
  "/api/spotify/callback",
  "/api/spotify/clear-session",
  "/api/auth/session",
  "/api/health/env",
  "/api/internal/playback-tick",
]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon")) return true;
  if (pathname.startsWith("/brand/")) return true;
  return false;
}

/** Supabase session cookies must survive redirects (avoids / ↔ /login loops). */
function redirectWithSessionCookies(
  request: NextRequest,
  sessionResponse: NextResponse,
  pathname: string,
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const redirect = NextResponse.redirect(url);
  sessionResponse.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie);
  });
  return redirect;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: SupabaseCookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isDynamicSlug =
    /^\/[^/]+$/.test(pathname) &&
    !PUBLIC_PATHS.has(pathname) &&
    pathname !== "/create" &&
    pathname !== "/logout" &&
    pathname !== "/";

  if (user && (pathname === "/login" || pathname === "/register")) {
    return redirectWithSessionCookies(request, response, "/");
  }

  if (!user && !isPublicPath(pathname)) {
    if (pathname === "/logout") {
      return redirectWithSessionCookies(request, response, "/login");
    }
    if (pathname === "/create" || isDynamicSlug) {
      return redirectWithSessionCookies(request, response, "/login");
    }
  }

  if (!user && pathname === "/") {
    return redirectWithSessionCookies(request, response, "/login");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
