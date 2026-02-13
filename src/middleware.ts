import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { FEATURES } from "@/config/features";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected routes and their corresponding feature flags
  const protectedRoutes = [
    { path: "/partners", feature: FEATURES.SERVICE_MARKETPLACE },
    { path: "/documents/marketplace", feature: FEATURES.DOCUMENT_VAULT },
  ];

  for (const route of protectedRoutes) {
    if (pathname.startsWith(route.path) && !route.feature) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard"; // or '/' if dashboard is root? Page says /dashboard/page.tsx? No, src/app/page.tsx is Home.
      // Wait, src/app/page.tsx is likely '/' route.
      // src/app/dashboard/page.tsx exists?
      // list_dir showed src/app/page.tsx AND src/app/dashboard/feed/page.tsx.
      // Does src/app/dashboard/page.tsx exist?
      // list_dir src/app showed dashboard folder.
      // list_dir src/app/dashboard showed feed folder.
      // It did NOT explicitly show page.tsx in dashboard root.
      // But Sidebar has `href: "/"` for Home.
      // And `href: "/dashboard/feed"`.
      // So Dashboard Home is likely `/`.
      // I'll redirect to `/`.
      url.pathname = "/";
      url.searchParams.set("error", "feature_disabled");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/partners/:path*",
    "/documents/marketplace/:path*",
  ],
};
