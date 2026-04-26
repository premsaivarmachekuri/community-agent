import { type NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  // Sprint is a public application - no auth required
  // All traffic is allowed to pass through
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
