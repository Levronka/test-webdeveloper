"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          // User is logged in, redirect to dashboard
          router.push("/dashboard");
        }
      } catch (error) {
        // User is not logged in, that's fine
      }
    }

    checkAuth();
  }, [router]);

  return <>{children}</>;
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard>{children}</AuthGuard>;
}
