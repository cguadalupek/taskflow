import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/projects", "/tasks", "/users", "/profile"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("taskflow_token");
  const pathname = request.nextUrl.pathname;

  const isProtectedPath = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isLoginPath = pathname === "/login";

  if (!token && (isProtectedPath || pathname === "/")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isLoginPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard/:path*", "/projects/:path*", "/tasks/:path*", "/users/:path*", "/profile/:path*"],
};
