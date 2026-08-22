# DAYFLOW HRMS — COMPREHENSIVE SYSTEM ARCHITECTURE & PROJECT FLOW DOCUMENTATION

**Project Name:** Dayflow HRMS  
**Event:** Odoo Hackathon 2026  
**Type:** Full-Stack Enterprise Human Resource Management System (HRMS)  
**Document Version:** 1.0.0  
**Date:** February 2026  

---

## 1. Executive Summary

**Dayflow HRMS** is an enterprise-grade, full-stack Human Resource Management System engineered to digitize and automate workforce operations. It simplifies core HR processes into an intuitive interface with strict Role-Based Access Control (RBAC).

### Key Business Problems Addressed:
1. **Disjointed Employee Records:** Replaces scattered spreadsheets with a centralized, relational employee database.
2. **Attendance Leakage & Inaccuracies:** Provides one-click daily check-in / check-out with timestamps, history, and status tracking (`PRESENT`, `ABSENT`, `HALF_DAY`, `LEAVE`).
3. **Chaotic Leave Management:** Replaces manual leave emails with a structured multi-status approval pipeline (`PENDING`, `APPROVED`, `REJECTED`) with administrator remarks.
4. **Opaque Payroll Structures:** Automates compensation breakdowns (Base Salary + Allowances - Deductions = Net Salary) with dedicated views for HR and employees.

---

## 2. System Architecture & Tech Stack

Dayflow utilizes a decoupled 3-tier architecture with TypeScript type safety across the entire stack.

```
┌────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                   │
│             React + TypeScript + Vite + CSS            │
│  ┌───────────────────────┐  ┌───────────────────────┐  │
│  │   Admin / HR Portal   │  │ Employee Self-Service │  │
│  └───────────────────────┘  └───────────────────────┘  │
└───────────────────────────┬────────────────────────────┘
                            │ RESTful JSON APIs (Axios / Fetch)
                            ▼
┌────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                   │
│               Node.js + Express + TypeScript           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Authentication & Role Guard Middleware (JWT)    │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌───────────────┬───────────────┬──────────────────┐  │
│  │ Employee Ctrl │ Attndnc Ctrl  │ Time-off Ctrl    │  │
│  │ Salary Ctrl   │ Dashbrd Ctrl  │ Auth Controller  │  │
│  └───────────────┴───────────────┴──────────────────┘  │
└───────────────────────────┬────────────────────────────┘
                            │ Prisma Client ORM
                            ▼
┌────────────────────────────────────────────────────────┐
│                       DATA LAYER                       │
│                   Prisma ORM + SQLite                  │
│       (Users, Employees, Attendance, Leaves, Salary)   │
└────────────────────────────────────────────────────────┘
```

### Technology Breakdown

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | React 18, TypeScript, Vite | Fast Single Page Application (SPA) with responsive UI |
| **Routing & State** | React Router v6, React Context API | Dynamic client routing with protected role gates |
| **Backend API** | Node.js, Express, TypeScript | Modular REST API with structured controllers & services |
| **Database & ORM** | Prisma ORM, SQLite | Type-safe schema migrations, relationships, and queries |
| **Security & Auth** | JWT (JSON Web Tokens), `bcrypt` | Secure session handling and password hashing |

---

## 3. Database Schema & Data Models

The data layer is defined via Prisma (`schema.prisma`):

### 3.1 Core Models and Relationships

```
 ┌──────────────┐          1:1          ┌──────────────────┐
 │     User     ├───────────────────────┤     Employee     │
 └──────────────┘                       └────────┬─────────┘
                                                 │
                                 ┌───────────────┼───────────────┐
                                 │ 1:N           │ 1:N           │ 1:1
                                 ▼               ▼               ▼
                        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
                        │  Attendance  │ │ LeaveRequest │ │    Salary    │
                        └──────────────┘ └──────────────┘ └──────────────┘
```

### 3.2 Data Dictionary

#### 1. `User` Model
- `id` (String, UUID, Primary Key)
- `email` (String, Unique) — Login identifier
- `password` (String) — Bcrypt-hashed password
- `role` (Enum: `ADMIN`, `EMPLOYEE`) — Access privilege level
- `isEmailVerified` (Boolean)
- `createdAt` / `updatedAt` (DateTime)

#### 2. `Employee` Model
- `id` (String, UUID, Primary Key)
- `userId` (String, Unique, Foreign Key -> `User.id` with `onDelete: Cascade`)
- `employeeId` (String, Unique) — Human-readable company ID (e.g. `EMP001`)
- `name` (String) — Full Name
- `phone` (String, Optional)
- `address` (String, Optional)
- `jobTitle` (String) — Role title (e.g. "Software Engineer")
- `profilePicture` (String, Optional) — Profile image path
- `documents` (String, Optional) — Attached employee docs

#### 3. `Attendance` Model
- `id` (String, UUID, Primary Key)
- `employeeId` (String, Foreign Key -> `Employee.id` with `onDelete: Cascade`)
- `date` (DateTime) — Date of attendance
- `checkIn` (DateTime, Optional) — Clock-in timestamp
- `checkOut` (DateTime, Optional) — Clock-out timestamp
- `status` (Enum: `PRESENT`, `ABSENT`, `HALF_DAY`, `LEAVE`)
- *Composite Unique Constraint:* `[employeeId, date]` prevents duplicate records for the same day.

#### 4. `LeaveRequest` Model
- `id` (String, UUID, Primary Key)
- `employeeId` (String, Foreign Key -> `Employee.id` with `onDelete: Cascade`)
- `leaveType` (Enum: `PAID`, `SICK`, `UNPAID`)
- `startDate` (DateTime)
- `endDate` (DateTime)
- `remarks` (String, Optional) — Reason submitted by employee
- `status` (Enum: `PENDING`, `APPROVED`, `REJECTED`)
- `adminComment` (String, Optional) — Remarks from HR reviewer

#### 5. `Salary` Model
- `id` (String, UUID, Primary Key)
- `employeeId` (String, Unique, Foreign Key -> `Employee.id` with `onDelete: Cascade`)
- `baseSalary` (Float) — Fixed monthly pay
- `allowances` (Float, Default: 0) — Benefits / HRA / Medical
- `deductions` (Float, Default: 0) — Tax / Provident fund / penalties
- `netSalary` (Float) — Computed as `baseSalary + allowances - deductions`
- `details` (String, Optional) — Additional breakdown notes

---

## 4. End-to-End User Workflows

### Flow 1: Authentication & Role-Based Redirection

```
[ User Lands on App (/) ]
           │
           ▼
[ Check Active Token / Session ]
    ├── No Token ───────────► Navigate to /login
    └── Token Valid
            ├── Role: ADMIN ────► Navigate to /admin
            └── Role: EMPLOYEE ─► Navigate to /employee
```

1. User submits credentials at `/login`.
2. Backend verifies hash with `bcrypt`, signs a JWT payload (`{ userId, email, role }`).
3. Frontend stores token, initializes `AuthContext`, and redirects dynamically based on user role.
4. Route guards (`ProtectedRoute`) prevent unauthorized URL tampering.

---

### Flow 2: Attendance Tracking Workflow

```
[ Employee Portal: /employee/attendance ]
           │
           ├── [ Click "Check-In" ]
           │          │
           │          ▼
           │   POST /api/attendance/check-in
           │   └── Record created for today's date with checkIn = NOW(), status = PRESENT
           │
           └── [ Click "Check-Out" ]
                      │
                      ▼
               POST /api/attendance/check-out
               └── Updates today's record with checkOut = NOW()
```

- **Admin Oversight:** Admin visits `/admin/attendance` to view aggregate organization-wide attendance logs, filter by date, and identify absentees.

---

### Flow 3: Leave Application & Multi-Status Approval

```
[ Employee applies at /employee/time-off ]
     │ (Selects Type: SICK / PAID / UNPAID, Date Range, Reason)
     ▼
POST /api/timeoff ──► Stored in DB with status: PENDING
                           │
                           ▼
[ Admin views review queue at /admin/time-off ]
     │
     ├── [ Click "Approve" ] ──► PATCH /api/timeoff/:id/status (APPROVED)
     └── [ Click "Reject" ]  ──► PATCH /api/timeoff/:id/status (REJECTED + adminComment)
                           │
                           ▼
[ Real-time status reflected in Employee's Leave History Table ]
```

---

### Flow 4: Compensation & Payroll Management

```
[ Admin at /admin/employees/:id/salary ]
     │
     ├── Enters: Base Salary, Allowances, Deductions
     ▼
POST /api/salary/:employeeId
     │
     ├── Backend calculates: Net Salary = Base + Allowances - Deductions
     └── Upserts record into Database
               │
               ▼
[ Employee visits /employee/payroll ]
     └── GET /api/salary/my-salary
     └── Displays transparent itemized salary breakdown
```

---

## 5. API Reference Summary

### Authentication (`/api/auth`)
| Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user & return JWT | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user session | Bearer Token |

### Employee Management (`/api/employees`)
| Method | Route | Description | Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/employees` | List all employee records | `ADMIN` |
| `POST` | `/api/employees` | Create a new employee profile | `ADMIN` |
| `GET` | `/api/employees/:id` | Get specific employee details | `ADMIN` |
| `PUT` | `/api/employees/:id` | Update profile information | `ADMIN` |
| `DELETE` | `/api/employees/:id` | Delete employee record | `ADMIN` |

### Attendance (`/api/attendance`)
| Method | Route | Description | Role |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/attendance/check-in` | Record clock-in timestamp | `EMPLOYEE` |
| `POST` | `/api/attendance/check-out` | Record clock-out timestamp | `EMPLOYEE` |
| `GET` | `/api/attendance/my` | Get own attendance history | `EMPLOYEE` |
| `GET` | `/api/attendance/all` | Get company-wide attendance | `ADMIN` |

### Time-Off / Leave (`/api/timeoff`)
| Method | Route | Description | Role |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/timeoff` | Apply for leave | `EMPLOYEE` |
| `GET` | `/api/timeoff/my` | Get own leave requests | `EMPLOYEE` |
| `GET` | `/api/timeoff/all` | Get all pending/processed requests | `ADMIN` |
| `PATCH` | `/api/timeoff/:id/status`| Approve or reject leave request | `ADMIN` |

### Payroll (`/api/salary`)
| Method | Route | Description | Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/salary/my-salary` | Get own salary breakdown | `EMPLOYEE` |
| `GET` | `/api/salary/:employeeId` | Get specific employee salary | `ADMIN` |
| `POST` | `/api/salary/:employeeId` | Set / update employee salary | `ADMIN` |

### Dashboard (`/api/dashboard`)
| Method | Route | Description | Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard/stats` | Aggregate stats (Headcount, Today Present, Pending Leaves, Monthly Payroll) | `ADMIN` |

---

## 6. Frontend Page & Route Mapping

```
/
├── /login ────────────────────────── LoginPage
│
├── Admin Portal (Role: ADMIN / HR)
│   ├── /admin ────────────────────── AdminPage (KPI Dashboard & Overview)
│   ├── /admin/employees ──────────── EmployeesPage (Staff Directory & Add Modal)
│   ├── /admin/employees/:id ──────── EmployeeDetailPage (Profile & Documents)
│   ├── /admin/employees/:id/salary ─ SalaryPage (Payroll Calculator & Setup)
│   ├── /admin/attendance ─────────── AttendancePage (Organization Logs)
│   └── /admin/time-off ───────────── TimeOffManagementPage (Leave Approvals)
│
└── Employee Portal (Role: EMPLOYEE)
    ├── /employee ─────────────────── EmployeePage (Overview & Quick Actions)
    ├── /employee/profile ─────────── MyProfilePage (Personal Information)
    ├── /employee/attendance ──────── MyAttendancePage (Check-in/Out & History)
    ├── /employee/time-off ────────── MyTimeOffPage (Leave Request Form & List)
    └── /employee/payroll ─────────── MyPayrollPage (Salary Slip & Breakdown)
```

---

## 7. Key Features & Competitive Advantages

1. **Integrated Role-Based Security:** End-to-end token validation with automatic client redirection ensures secure data isolation between employees and administrators.
2. **Clean Separation of Concerns:** Micro-structured architecture with clear controller, service, validation, and route layers in the backend.
3. **Comprehensive Lifecycle Coverage:** Encompasses all essential HR pillars: Onboarding, Daily Attendance, Leave Governance, and Compensation calculation.
4. **Modern, Responsive Frontend:** Designed with contemporary UI aesthetics, interactive cards, status badges, and rapid navigation.
