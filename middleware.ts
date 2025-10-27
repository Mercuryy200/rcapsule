export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    "/profile/:path*",
    "/closet/:path*",
    "/api/clothes/:path*",
    
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};