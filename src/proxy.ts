import { auth } from "@/lib/auth/auth-options";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuth = !!req.auth;

  const publicPaths = ["/login", "/design", "/api/auth", "/api/health"];

  // Skip auth checks for public paths and static assets (like logo.png)
  const isStaticAsset = /\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js)$/i.test(pathname);
  if (isStaticAsset || publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (!isAuth) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role Authorization (RBAC) - Admin only
  const role = (req.auth?.user as { role?: string })?.role;
  if (role !== "admin") {
    if (pathname === "/unauthorized") {
      return NextResponse.next();
    }

    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  const correlationId = crypto.randomUUID();
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-correlation-id", correlationId);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js)$).*)"],
};
