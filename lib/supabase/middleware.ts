import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase session on every request and guards member-only routes.
 * Called from the root `middleware.ts`.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: getClaims()/getUser() must be called to refresh the token.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // A stale/invalid session (e.g. the user was deleted, or keys changed) leaves
  // a dead refresh token in the browser. Drop the auth cookies so it self-heals
  // instead of erroring on every request.
  if (error && (error.code === "refresh_token_not_found" || error.status === 400)) {
    for (const cookie of request.cookies.getAll()) {
      if (cookie.name.startsWith("sb-")) supabaseResponse.cookies.delete(cookie.name);
    }
  }

  // Protect the member area: bounce unauthenticated users to /login.
  const isProtected = request.nextUrl.pathname.startsWith("/tracker");
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
