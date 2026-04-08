"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState<number | null>(
    null,
  );
  const [rateLimitTotal, setRateLimitTotal] = useState<number>(0);

  // Handle countdown timer
  useEffect(() => {
    if (rateLimitCountdown === null) return;

    if (rateLimitCountdown <= 0) {
      setRateLimitCountdown(null);
      setRateLimitTotal(0);
      return;
    }

    const timer = setTimeout(() => {
      setRateLimitCountdown((prev) => (prev ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [rateLimitCountdown]);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = "Email harus diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (!formData.password) {
      newErrors.password = "Password harus diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (rateLimitCountdown !== null) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        // Check for rate limit
        if (response.status === 429) {
          const resetTime = response.headers.get("X-RateLimit-Reset");
          if (resetTime) {
            const resetSeconds = parseInt(resetTime, 10);
            const now = Math.floor(Date.now() / 1000);
            const countdown = Math.max(1, resetSeconds - now);
            setRateLimitTotal(countdown);
            setRateLimitCountdown(countdown);
          }
        }
        setErrors({
          general: data.message || "Login gagal. Cek email dan password Anda.",
        });
        return;
      }

      // Login successful
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        general: "Terjadi kesalahan saat login. Coba lagi nanti.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormDisabled = isLoading || rateLimitCountdown !== null;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Login</h1>
            <p className="text-gray-600">Selamat datang kembali</p>
          </div>

          {/* Error Alert */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Rate Limit Alert */}
          {rateLimitCountdown !== null && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">⏱️</span>
                  <span className="text-yellow-800 font-medium">
                    Terlalu banyak percobaan
                  </span>
                </div>
              </div>
              <p className="text-yellow-700 text-sm mt-2">
                Coba lagi dalam{" "}
                <span className="font-bold text-lg text-yellow-900">
                  {rateLimitCountdown}
                </span>{" "}
                detik
              </p>
              <div className="w-full bg-yellow-200 rounded-full h-2 mt-3">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${rateLimitTotal > 0 ? ((rateLimitTotal - (rateLimitCountdown ?? 0)) / rateLimitTotal) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isFormDisabled}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  errors.email
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 focus:border-transparent"
                }`}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-10 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.password
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 focus:border-transparent"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isFormDisabled}
                  className="absolute right-3 top-1/2 -translate-y-1/2 disabled:opacity-50 w-5 h-5 flex items-center justify-center"
                  title={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                >
                  <img
                    src={
                      showPassword
                        ? "/eye-svgrepo-com.svg"
                        : "/eye-closed-svgrepo-com.svg"
                    }
                    alt={showPassword ? "Hide password" : "Show password"}
                    className="w-5 h-5"
                  />
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isFormDisabled}
              className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Memproses...
                </>
              ) : rateLimitCountdown !== null ? (
                <>
                  <span className="text-lg mr-2">⏱️</span>
                  Tunggu {rateLimitCountdown}s
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-2 text-sm text-gray-500">atau</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Register Link */}
          <p className="text-center text-gray-600">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="text-blue-600 font-medium hover:text-blue-700 transition"
            >
              Daftar di sini
            </Link>
          </p>

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800 mb-2">
              <strong>Demo Accounts:</strong>
            </p>
            <p className="text-xs text-blue-800">
              admin@example.com / admin123
            </p>
            <p className="text-xs text-blue-800">
              user@example.com / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
