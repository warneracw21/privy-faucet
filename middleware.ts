import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/api/faucet",
];

// Cache the JWKS for performance
let jwks: jose.JWTVerifyGetKey | null = null;

function getJWKS(appId: string) {
  if (!jwks) {
    jwks = jose.createRemoteJWKSet(
      new URL(`https://auth.privy.io/api/v1/apps/${appId}/jwks.json`)
    );
  }
  return jwks;
}

async function verifyPrivyToken(token: string): Promise<{ valid: boolean; userId?: string }> {
  try {
    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
    
    if (!appId) {
      console.error("Missing NEXT_PUBLIC_PRIVY_APP_ID");
      return { valid: false };
    }

    const { payload } = await jose.jwtVerify(token, getJWKS(appId), {
      issuer: "privy.io",
      audience: appId,
    });

    // Extract user ID from the 'sub' claim
    const userId = payload.sub;
    
    return { valid: true, userId };
  } catch (error) {
    console.error("Token verification failed:", error);
    return { valid: false };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a protected API route
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Check for Authorization header
  const authHeader = request.headers.get("Authorization");
  
  if (!authHeader) {
    return NextResponse.json(
      { error: "Authorization header required" },
      { status: 401 }
    );
  }

  const token = authHeader.split(" ")[1];
  
  if (!token) {
    return NextResponse.json(
      { error: "Bearer token required" },
      { status: 401 }
    );
  }

  // Verify token with jose
  const { valid, userId } = await verifyPrivyToken(token);
  
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  // Add user ID to request headers for route handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", userId || "");

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    // Match all API routes under /api/faucet
    "/api/faucet/:path*",
  ],
};
