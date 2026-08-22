# Dayflow HRMS — Backend + Database Foundation

Clean, production-ready TypeScript + Express + Prisma + SQLite backend foundation for the Dayflow Human Resource Management System.

---

## 🛠️ Technology Stack

- **Runtime & Server**: Node.js, Express.js, TypeScript
- **Database & ORM**: SQLite, Prisma ORM
- **Security & Auth Prep**: `bcrypt` (password hashing), `jsonwebtoken` (JWT tokens)
- **Validation**: Zod
- **Utilities**: CORS, `dotenv`

---

## 📂 Project Structure

```text
backend/
├── prisma/
│   ├── schema.prisma      # Prisma ORM Schema (Models: User, Employee, Attendance, LeaveRequest, Salary)
│   └── seed.ts            # Idempotent Database Seed Script
├── src/
│   ├── config/
│   │   ├── env.ts         # Zod Environment Validation
│   │   └── prisma.ts      # Shared PrismaClient Singleton
│   ├── middleware/
│   │   ├── errorHandler.ts # Centralized Error Handling Middleware
│   │   └── notFound.ts     # 404 Route Handler
│   ├── app.ts             # Express Application & Middleware Setup
│   └── server.ts          # Server Lifecycle & HTTP Listener
├── .env                   # Local Environment Configuration (Ignored by Git)
├── .env.example           # Environment Configuration Template
├── package.json           # Scripts & Dependencies
├── tsconfig.json          # TypeScript Configuration
└── README.md              # Project Documentation
```

---

## 🚀 Quick Setup & Getting Started

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` if not already present:

```bash
cp .env.example .env
```

Default environment variables:

```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="dayflow-hrms-super-secret-jwt-key-2026"
JWT_EXPIRES_IN="1d"
CORS_ORIGIN="http://localhost:5173"
NODE_ENV="development"
```

---

## 🗄️ Database Setup & Migration

### 1. Generate Prisma Client

```bash
npx prisma generate
```

### 2. Run Database Migration

Create and apply SQLite database migrations:

```bash
npx prisma migrate dev --name init
```

### 3. Seed Demo Data

Populate demo accounts and initial HRMS records:

```bash
npx prisma db seed
```

### 4. Inspect Database with Prisma Studio

Visually view and manage database tables in your browser:

```bash
npx prisma studio
```

---

## 🔑 Demo Development Accounts

The seed script creates the following pre-configured development accounts (passwords are stored as bcrypt hashes):

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@dayflow.local` | `Admin@123` | Full HRMS administrative privileges |
| **Employee** | `employee@dayflow.local` | `Employee@123` | Employee ID: `EMP001` (Alex Morgan) |

Seeded sample records:
- **Attendance**: Present record for today.
- **Leave Request**: `PENDING` paid leave request ready for admin approval workflow.
- **Salary**: Active base salary, allowances, and net salary structure.

---

## 💻 Running the Backend

### Development Mode

Starts dev server with hot reloading (`ts-node-dev`):

```bash
npm run dev
```

Server listens at: `http://localhost:5000`

### Build TypeScript

Compiles TypeScript to JavaScript in `./dist`:

```bash
npm run build
```

### Production Mode

Runs compiled output from `./dist`:

```bash
npm start
```

---

## 📡 Health Check Endpoint

Verify that the Express server is up and running:

- **Method**: `GET`
- **URL**: `http://localhost:5000/api/health`
- **Response**:

```json
{
  "status": "ok",
  "message": "Dayflow backend is running"
}
```
