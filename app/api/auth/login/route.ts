import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { usersTable } from "@/lib/db/schema";
import { loginSchema } from "@/lib/validation/schemas";
import { comparePassword } from "@/lib/auth/password";
import { generateToken } from "@/lib/auth/jwt";
import { withRateLimit } from "@/lib/middleware/rateLimit";
import { eq } from "drizzle-orm";

async function loginHandler(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = loginSchema.parse(body);

    // Find user by email
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, validatedData.email));

    const user = users[0];

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Email atau password salah" },
        { status: 401 },
      );
    }

    // Compare password
    const isPasswordValid = await comparePassword(
      validatedData.password,
      user.password,
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Email atau password salah" },
        { status: 401 },
      );
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Login berhasil",
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
          },
        },
      },
      { status: 200 },
    );

    // Set auth token cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      // Handle Zod validation errors
      if (error.message.includes("validation")) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 400 },
        );
      }
    }

    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat login" },
      { status: 500 },
    );
  }
}

export const POST = withRateLimit(loginHandler);
