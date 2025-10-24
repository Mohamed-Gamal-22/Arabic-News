import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // حماية صفحات الداشبورد
    if (pathname.startsWith("/dashboard")) {
      if (!token) {
        return NextResponse.redirect(new URL("/auth/signin", req.url));
      }

      // التحقق من الصلاحيات حسب الدور
      if (pathname.startsWith("/dashboard/writer")) {
        if (
          token.role !== "writer" &&
          token.role !== "admin" &&
          token.role !== "super_admin"
        ) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }

      if (pathname.startsWith("/dashboard/admin")) {
        if (token.role !== "admin" && token.role !== "super_admin") {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }

      if (pathname.startsWith("/dashboard/super-admin")) {
        if (token.role !== "super_admin") {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }
    }

    // توجيه المستخدم حسب دوره عند الدخول للداشبورد الرئيسي
    if (pathname === "/dashboard" && token) {
      switch (token.role) {
        case "writer":
          return NextResponse.redirect(new URL("/dashboard/writer", req.url));
        case "admin":
          return NextResponse.redirect(new URL("/dashboard/admin", req.url));
        case "super_admin":
          return NextResponse.redirect(
            new URL("/dashboard/super-admin", req.url)
          );
        default:
          return NextResponse.redirect(new URL("/auth/signin", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // السماح بالوصول للصفحات العامة
        if (
          pathname.startsWith("/auth") ||
          pathname === "/" ||
          pathname.startsWith("/news")
        ) {
          return true;
        }

        // التحقق من وجود التوكن للصفحات المحمية
        if (pathname.startsWith("/dashboard")) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
