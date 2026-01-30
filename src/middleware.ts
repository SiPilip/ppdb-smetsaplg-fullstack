import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Paths that require authentication
  const isStudentPath = pathname.startsWith("/student");
  const isAdminPath = pathname.startsWith("/admin");

  if (isStudentPath || isAdminPath) {
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", encodeURI(request.url));
      return NextResponse.redirect(url);
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      const role = payload.role as string;

      // Role-based protection
      if (isAdminPath && role !== "admin") {
        return NextResponse.redirect(
          new URL("/student/dashboard", request.url),
        );
      }

      if (isStudentPath && role !== "student" && role !== "admin") {
        // Admin is allowed to access student for debugging or maybe not?
        // For now strict separation or admin can view all
        // Let's stick to strict role for dashboard root
        if (role === "admin") return NextResponse.next();
        return NextResponse.redirect(new URL("/login", request.url));
      }

      return NextResponse.next();
    } catch (error) {
      // Token invalid/expired
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Auth pages (Login/Register) - redirect if already logged in
  if (pathname === "/login" || pathname === "/register") {
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        await jwtVerify(token, secret);
        // Valid token, redirect to dashboard
        return NextResponse.redirect(
          new URL("/student/dashboard", request.url),
        );
      } catch (e) {
        // Invalid token, allow access to login
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/admin/:path*", "/login", "/register"],
};
