import { config } from "dotenv";
import path from "path";

// Load environment variables FIRST before any other imports
config({ path: path.resolve(".env.local") });

async function seed() {
  try {
    console.log("🌱 Starting database seed...");

    // Import after dotenv is loaded
    const { db } = await import("@/lib/db/client");
    const { usersTable } = await import("@/lib/db/schema");
    const { hashPassword } = await import("@/lib/auth/password");
    const { eq } = await import("drizzle-orm");

    // Sample users data
    const sampleUsers = [
      {
        email: "admin@example.com",
        username: "admin",
        password: "admin123",
      },
      {
        email: "user@example.com",
        username: "testuser",
        password: "password123",
      },
      {
        email: "john@example.com",
        username: "johndoe",
        password: "john1234",
      },
    ];

    // Hash passwords and insert
    for (const user of sampleUsers) {
      const hashedPassword = await hashPassword(user.password);

      // Check if user already exists
      const existingUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, user.email));

      if (existingUser.length === 0) {
        await db.insert(usersTable).values({
          email: user.email,
          username: user.username,
          password: hashedPassword,
        });
        console.log(`✅ Inserted user: ${user.username} (${user.email})`);
      } else {
        console.log(`⏭️  User already exists: ${user.email}`);
      }
    }

    console.log("✅ Database seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
