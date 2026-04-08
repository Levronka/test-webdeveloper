# Web Programmer Challenge - Authentication System

Sistem autentikasi full-stack yang dibangun dengan Next.js, menampilkan login, registrasi, rate limiting, dan dashboard yang aman.

## 📋 Daftar Isi

- [Cara Menjalankan Project](#cara-menjalankan-project)
- [Tech Stack](#tech-stack)
- [Arsitektur](#arsitektur)
- [Struktur File](#struktur-file)
- [API Routes](#api-routes)
- [Fitur](#fitur)
- [Demo Accounts](#demo-accounts)

---

## 🚀 Cara Menjalankan Project

### Prerequisites

- Node.js 18+
- MySQL 5.7+
- npm atau yarn

### 1. Setup Environment Variables

Buat file `.env.local` di root directory:

```bash
DATABASE_URL="mysql://username:password@localhost:3306/testwebprogrammer"
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

```bash
# Install Drizzle ORM CLI
npm install -D drizzle-kit

# Jalankan migrations
npm run db:migrate

# (Optional) Populate dengan test data
npm run db:seed
```

### 4. Jalankan Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

### 5. Build untuk Production

```bash
npm run build
npm start
```

---

## 🛠 Tech Stack

### Frontend

- **Next.js 16.2.2** - React framework dengan App Router
- **React 19.2.4** - UI library
- **Tailwind CSS 4** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript

### Backend

- **Next.js API Routes** - Serverless API endpoints
- **Node.js** - JavaScript runtime

### Database & ORM

- **MySQL** - Relational database
- **Drizzle ORM 0.45.2** - Type-safe query builder

### Authentication & Security

- **jsonwebtoken 9.0.3** - JWT token generation & verification
- **bcryptjs 3.0.3** - Password hashing
- **httpOnly Cookies** - Secure token storage

### Validation

- **Zod** - Schema validation library

### Development Tools

- **tsx** - TypeScript executor untuk scripts
- **TypeScript** - Type checking

---

## 🏗 Arsitektur

### Overview

Aplikasi menggunakan **Next.js Full-Stack Architecture** dengan pemisahan yang jelas antara:

- **Client-side** - React components dengan state management
- **Server-side** - API routes untuk business logic
- **Database** - MySQL dengan Drizzle ORM

### Alur Autentikasi

```
┌─────────────────────────────────────────────────────┐
│ User Login/Register                                 │
│ (Client Component)                                  │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│ /api/auth/login atau /api/auth/register             │
│ - Validasi input                                    │
│ - Rate limiting check                               │
│ - DB query                                          │
│ - Password hash/compare                             │
│ - JWT token generation                              │
│ - Set httpOnly cookie                               │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│ Client-side                                         │
│ - Token disimpan di httpOnly cookie                 │
│ - Redirect ke dashboard                             │
│ - State management update                           │
└─────────────────────────────────────────────────────┘
```

### Rate Limiting

- **In-memory store** - Tracking attempt per IP
- **Limit: 5 attempts per 60 seconds**
- **Auto-cleanup** - Setiap 5 menit
- **Real-time countdown** - UI progress bar tanpa refresh

### Protected Routes

```
Regular Pages (Public)
├── / (Root - redirect based on auth)
├── /login (Auth page)
└── /register (Auth page)

Protected Routes (Require Authentication)
├── /dashboard (User info & logout)
└── /api/auth/me (Verify token)
```

### File Structure

```
app/
├── (auth)/                      # Auth routes group
│   ├── layout.tsx               # Auth guard wrapper
│   ├── login/page.tsx           # Login form
│   └── register/page.tsx        # Register form
│
├── (protected)/                 # Protected routes group
│   ├── layout.tsx               # Auth check + loading
│   └── dashboard/page.tsx       # Dashboard page
│
├── api/auth/
│   ├── login/route.ts           # POST login endpoint
│   ├── register/route.ts        # POST register endpoint
│   ├── logout/route.ts          # POST logout endpoint
│   └── me/route.ts              # GET current user
│
└── page.tsx                     # Root page (redirect logic)

lib/
├── auth/
│   ├── jwt.ts                   # JWT token functions
│   ├── password.ts              # Password hashing/compare
│   └── middleware.ts            # Auth middleware wrapper
│
├── db/
│   ├── client.ts                # MySQL connection
│   └── schema.ts                # Drizzle table definitions
│
├── middleware/
│   └── rateLimit.ts             # Rate limiter middleware
│
├── types/
│   └── index.ts                 # TypeScript interfaces
│
└── validation/
    └── schemas.ts               # Zod validation schemas

public/
├── eye-svgrepo-com.svg          # Show password icon
└── eye-closed-svgrepo-com.svg   # Hide password icon

scripts/
└── seed.ts                      # Database seeder

```

### Component Architecture

**Client Components** (dengan "use client"):

- Login form dengan real-time validation
- Register form dengan password strength indicator
- Dashboard dengan user info cards
- Rate limit countdown timer

**Server Components** (default):

- API route handlers
- Layout wrappers
- Auth guards

---

## 📡 API Routes

### Authentication Endpoints

#### POST /api/auth/register

Registrasi user baru

```json
Request Body:
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}

Response (201):
{
  "message": "Registrasi berhasil",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username"
    }
  }
}
```

#### POST /api/auth/login

Login dengan email & password

```json
Request Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username"
    }
  }
}
```

#### POST /api/auth/logout

Logout user (hapus session)

```json
Response (200):
{
  "message": "Logout berhasil"
}
```

#### GET /api/auth/me

Verifikasi token & dapatkan user info

```json
Response (200):
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username"
    }
  }
}

Response (401):
{
  "message": "Token tidak valid atau kadaluarsa"
}
```

---

## ✨ Fitur

### Authentication

- ✅ User registration dengan validasi email/username unique
- ✅ User login dengan password verification
- ✅ JWT token generation & validation
- ✅ Secure httpOnly cookies
- ✅ Auto logout on token expiry

### Validation

- ✅ Real-time form validation (client-side)
- ✅ Server-side validation dengan Zod
- ✅ Email format validation
- ✅ Password strength requirements
- ✅ Username format validation

### Security

- ✅ Password hashing dengan bcryptjs
- ✅ JWT token dengan 7 hari expiry
- ✅ Rate limiting (5 attempts/minute)
- ✅ Protected routes dengan auth check
- ✅ Error handling yang aman (no sensitive data leakage)

### User Experience

- ✅ Real-time password toggle (show/hide)
- ✅ Real-time countdown timer untuk rate limit
- ✅ Responsive design (mobile-friendly)
- ✅ Loading states & transitions
- ✅ Error messages yang user-friendly
- ✅ Password strength indicator (register page)

### Dashboard

- ✅ User info display (username, email, ID)
- ✅ Account status information
- ✅ Quick action buttons
- ✅ Beautiful card-based layout

---

## 👥 Demo Accounts

Gunakan akun berikut untuk testing setelah menjalankan `npm run db:seed`:

| Email             | Password    | Username |
| ----------------- | ----------- | -------- |
| admin@example.com | admin123    | admin    |
| user@example.com  | password123 | user     |
| john@example.com  | john1234    | johndoe  |

---

## 📝 Notes

- Token JWT berlaku selama **7 hari**
- Rate limit reset otomatis setelah **60 detik**
- Database user table memiliki UUID sebagai primary key
- Semua passwords di-hash menggunakan bcryptjs sebelum disimpan
- Production: Gunakan persistent database untuk rate limiting (Redis recommended)

---

Dibuat dengan ❤️ untuk Web Programmer Challenge 2026
# test-webdeveloper
