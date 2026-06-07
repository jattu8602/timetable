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
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
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
