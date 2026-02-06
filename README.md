# School Bar Pre-order System (MVP)

A Next.js 15 + Prisma + SQLite mobile-first web application for school bar pre-ordering.

## Features

- **Student Interface**:
  - Menu navigation by category
  - Cart management
  - Order checkout with name/class
  - **Numeric Pickup Code** generation (4 digits)
  - "My Orders" history (local storage based)
- **Admin Interface**:
  - Dashboard with order filters (PAID, PREPARATION, READY, etc.)
  - Print Queue management (simulated printing)
  - Product CRUD
  - Settings (Cutoff time, Open/Close toggle)
- **Authentication**:
  - Admin: Credentials (seeded `admin@schoolbar.local`)
  - Student: Guest/Public access

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite
- **ORM**: Prisma 5
- **Styling**: Tailwind CSS via postcss
- **Validation**: Server Actions

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment:
   ```bash
   cp .env.example .env
   ```
   (Example: `DATABASE_URL="file:./dev.db"`)

4. Run migrations and seed database:
   ```bash
   npx prisma migrate dev --name init
   # This creates the dev.db and runs the seed script
   # Seed creates admin user: admin@schoolbar.local / Admin123!
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

6. Open `http://localhost:3000`

### Admin Access

- Login at `http://localhost:3000/admin/login`
- Email: `admin@schoolbar.local`
- Password: `Admin123!`


## Project Structure

- `app/(student)`: Student-facing pages (Menu, Cart, Orders)
- `app/admin`: Admin-facing pages (Dashboard, Products, Settings)
- `app/actions`: Server Actions for backend logic
- `app/components`: Shared UI components
- `lib/prisma.ts`: DB client instance
- `prisma/schema.prisma`: Database schema

## Notes

- Payment is simulated (Status = PAID immediately).
- Pickup codes are unique for the day.
- "Printing" is simulated via the `PrintJob` table visible in Admin Dashboard.
>>>>>>> 12f9424 (feat: Bootstrap BarScuola application with Next.js, Prisma, authentication, and a complete ordering system including student and admin interfaces.)
