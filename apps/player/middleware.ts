import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import type { SupabaseCookieToSet } from "@/src/lib/supabase/cookie-types";

const PUBLIC_PATHS = new Set([
  "/login",
  "/register",
  "/forget",
  "/api/spotify/login",
  "/api/spotify/callback",
  "/api/auth/session",
]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/favicon")) return true;
  return false;
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
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!user && !isPublicPath(pathname)) {
    if (pathname === "/logout") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (pathname === "/create" || isDynamicSlug) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (!user && pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
