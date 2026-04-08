import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/auth/middleware";

async function handler(request: AuthenticatedRequest) {
  try {
    if (!request.user) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User ditemukan",
        data: {
          user: {
            id: request.user.id,
            email: request.user.email,
            username: request.user.username,
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan" },
      { status: 500 },
    );
  }
}

export const GET = withAuth(handler);
