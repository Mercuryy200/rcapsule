import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const protectedRoutes = ["/profile", "/closet", "/settings", "/outfits"];
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected) {
    const sessionToken =
      req.cookies.get("authjs.session-token")?.value ||
      req.cookies.get("__Secure-authjs.session-token")?.value;

    if (!sessionToken) {
      const loginUrl = new URL("/login", req.url);

      loginUrl.searchParams.set("callbackUrl", pathname);

      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/closet/:path*",
    "/settings/:path*",
    "/outfits/:path*",
  ],
};
