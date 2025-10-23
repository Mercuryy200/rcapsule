import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

const protectedRoutes = ["/profile"];

export default async function  middleware (req: NextRequest) {
    const session = await auth();
    const {pathname} = req.nextUrl;
    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
    if (isProtected && !session?.user) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
}