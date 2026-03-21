import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory store for rate limiting
// Note: In production, use Redis or a proper distributed cache
const rateLimit = new Map();

export function proxy(request: NextRequest) {
  // Only apply rate limiting to explicit API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    
    // Clean up old entries to prevent memory leak
    for (const [key, value] of rateLimit.entries()) {
      if (value.timestamp < windowStart) {
        rateLimit.delete(key);
      }
    }
    
    // Get existing limit data for IP
    const currentLimit = rateLimit.get(ip) || { count: 0, timestamp: now };
    
    // Reset if outside window
    if (currentLimit.timestamp < windowStart) {
      currentLimit.count = 0;
      currentLimit.timestamp = now;
    }
    
    // Increment counter
    currentLimit.count += 1;
    rateLimit.set(ip, currentLimit);
    
    // Check if limit exceeded (e.g., 60 requests per minute)
    if (currentLimit.count > 60) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests, please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60"
          }
        }
      );
    }
  }

  // Basic security headers for all routes
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  
  return response;
}

export const config = {
  matcher: [
    // Apply to all routes
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
