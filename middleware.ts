import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
    const protectedRoutes = ["/profile", "/closet"];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  
  if (isProtected) {
    const sessionToken = 
      req.cookies.get("next-auth.session-token")?.value || // Production
      req.cookies.get("__Secure-next-auth.session-token")?.value; // HTTPS
    
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
  ],
};