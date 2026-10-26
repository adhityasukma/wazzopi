import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/jwt";

const KARYAWAN_ALLOWED = ["/admin/products", "/admin/products/new", "/admin/forbidden"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  const isStaff = session?.role === "ADMIN" || session?.role === "KARYAWAN";

  // Admin panel
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      if (isStaff) {
        const target = session!.role === "ADMIN" ? "/admin" : "/admin/products/new";
        return NextResponse.redirect(new URL(target, request.url));
      }
      return NextResponse.next();
    }
    if (!isStaff) {
      const url = new URL("/admin/login", request.url);
      return NextResponse.redirect(url);
    }
    if (session!.role === "KARYAWAN" && !KARYAWAN_ALLOWED.includes(pathname)) {
      if (pathname === "/admin") return NextResponse.redirect(new URL("/admin/products/new", request.url));
      return NextResponse.redirect(new URL("/admin/forbidden", request.url));
    }
    return NextResponse.next();
  }

  // Member area
  if (pathname.startsWith("/account")) {
    if (!session) {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if ((pathname === "/login" || pathname === "/register") && session) {
    return NextResponse.redirect(new URL(isStaff ? "/admin" : "/account", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/login", "/register"],
};
