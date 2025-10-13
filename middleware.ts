import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for auth pages and API routes
  if (pathname.startsWith("/signin") || pathname.startsWith("/api/") || pathname === "/") {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/logs") || 
      pathname.startsWith("/receptionist") || pathname.startsWith("/settings")) {
    
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
