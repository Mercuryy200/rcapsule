import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const protectedRoutes = [
    "/profile",
    "/closet",
    "/settings",
    "/outfits",
    "/wishlist",
    "/calendar",
    "/collections",
  ];

  const guestRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/update-password",
  ];

  const sessionToken =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value;

  const isLoggedIn = !!sessionToken;

  if (isLoggedIn && guestRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/closet", req.url));
  }
  if (
    !isLoggedIn &&
    protectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    const loginUrl = new URL("/login", req.url);

    loginUrl.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/closet/:path*",
    "/settings/:path*",
    "/outfits/:path*",
    "/wishlist/:path*",
    "/calendar/:path*",

    "/login",
    "/signup",
    "/forgot-password",
    "/update-password",
  ],
};
