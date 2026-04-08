import { NextRequest, NextResponse } from "next/server";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 5;

export function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  // Fallback untuk development
  return "127.0.0.1";
}

export function checkRateLimit(clientIP: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const key = `rate_limit:${clientIP}`;

  if (!rateLimitStore[key]) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + WINDOW_MS,
    };
    return {
      allowed: true,
      remaining: MAX_ATTEMPTS - 1,
      resetTime: rateLimitStore[key].resetTime,
    };
  }

  const record = rateLimitStore[key];

  // Reset jika window sudah lewat
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + WINDOW_MS;
    return {
      allowed: true,
      remaining: MAX_ATTEMPTS - 1,
      resetTime: record.resetTime,
    };
  }

  // Increment counter
  record.count++;

  const allowed = record.count <= MAX_ATTEMPTS;
  const remaining = Math.max(0, MAX_ATTEMPTS - record.count);

  return {
    allowed,
    remaining,
    resetTime: record.resetTime,
  };
}

export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
) {
  return async (request: NextRequest) => {
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP);

    // Create response
    let response: NextResponse;

    if (!rateLimit.allowed) {
      response = NextResponse.json(
        {
          success: false,
          message: `Terlalu banyak percobaan. Coba lagi dalam ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} detik.`,
        },
        { status: 429 },
      );
    } else {
      response = await handler(request);
    }

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", MAX_ATTEMPTS.toString());
    response.headers.set(
      "X-RateLimit-Remaining",
      rateLimit.remaining.toString(),
    );
    response.headers.set(
      "X-RateLimit-Reset",
      Math.ceil(rateLimit.resetTime / 1000).toString(),
    );

    return response;
  };
}

// Cleanup: Remove old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    Object.keys(rateLimitStore).forEach((key) => {
      if (now > rateLimitStore[key].resetTime) {
        delete rateLimitStore[key];
      }
    });
  },
  5 * 60 * 1000,
);
