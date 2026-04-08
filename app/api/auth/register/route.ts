import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { usersTable } from "@/lib/db/schema";
import { registerSchema } from "@/lib/validation/schemas";
import { hashPassword } from "@/lib/auth/password";
import { generateToken } from "@/lib/auth/jwt";
import { withRateLimit } from "@/lib/middleware/rateLimit";
import { eq } from "drizzle-orm";

async function registerHandler(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if email already exists
    const existingEmail = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, validatedData.email));

    if (existingEmail.length > 0) {
      return NextResponse.json(
        { success: false, message: "Email sudah terdaftar" },
        { status: 400 },
      );
    }

    // Check if username already exists
    const existingUsername = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, validatedData.username));

    if (existingUsername.length > 0) {
      return NextResponse.json(
        { success: false, message: "Username sudah terdaftar" },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Insert user
    const result = await db.insert(usersTable).values({
      email: validatedData.email,
      username: validatedData.username,
      password: hashedPassword,
    });

    // Get inserted user
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, validatedData.email));

    const user = users[0];

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
        message: "Registrasi berhasil",
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
          },
        },
      },
      { status: 201 },
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

    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan saat registrasi" },
      { status: 500 },
    );
  }
}

export const POST = withRateLimit(registerHandler);
