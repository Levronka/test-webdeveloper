import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./jwt";
import { JWTPayload } from "../types";

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export function withAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>,
) {
  return async (request: NextRequest) => {
    try {
      // Get token from cookies
      const token = request.cookies.get("auth_token")?.value;

      if (!token) {
        return NextResponse.json(
          { success: false, message: "Token tidak ditemukan" },
          { status: 401 },
        );
      }

      // Verify token
      const user = verifyToken(token);

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: "Token tidak valid atau sudah kadaluarsa",
          },
          { status: 401 },
        );
      }

      // Attach user to request
      (request as AuthenticatedRequest).user = user;

      return handler(request as AuthenticatedRequest);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Validasi token gagal" },
        { status: 401 },
      );
    }
  };
}
