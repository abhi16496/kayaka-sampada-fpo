# 🌾 Kayaka Sampada — Farmer Producer Organisation PWA

A production-ready, full-stack **Progressive Web App** for managing user registrations with an admin approval workflow.

![Tech Stack](https://img.shields.io/badge/stack-Next.js%20%7C%20Express%20%7C%20PostgreSQL-blue)
![PWA](https://img.shields.io/badge/PWA-Installable-green)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## ✨ Features

### Public Portal
- 📋 **Registration Form** — Full name, parent/spouse name, address, area/village, PIN, taluk, district, phone, email
- ✅ **Auto-uppercase** input for names & addresses
- 🔁 **Duplicate phone detection** — prevents re-registration
- 🆔 **Unique Registration ID** (e.g., `REG-20260001`)
- 🎉 **Success popup** with registration summary
- 🔍 **Status Check** — track your application by phone number

### Admin Panel
- 🔐 **JWT-secured admin login**
- 📊 **Dashboard** with stats (Total, Pending, Approved, Rejected, Today)
- 📈 **7-day bar chart** of registrations
- 📋 **Paginated data table** with search & filter by status
- 👁️ **View full applicant details** in modal
- ✅ **Approve** / ❌ **Reject** (with reason) registrations
- 📥 **Export to CSV** (all or filtered)
- 📝 **Activity Logs** — track every admin action
- 📱 **Mobile-responsive sidebar**

### PWA
- 📲 Installable on Android/iOS/Desktop
- 🔄 Offline support (Service Worker)
- 🚀 Fast performance, SEO optimized

---

## 🏗️ Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | Next.js 14, Tailwind CSS, Framer Motion |
| Backend    | Node.js, Express, TypeScript            |
| Database   | PostgreSQL 16                           |
| Auth       | JWT (jsonwebtoken + bcryptjs)           |
| Deployment | Docker + docker-compose (Coolify-ready) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- npm

### 1. Database Setup

```sql
-- Create the database
createdb registration_db

-- Apply schema
psql -d registration_db -f database/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DB credentials and JWT secret
npm install
npm run dev
```
API runs at `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
# .env.local already has NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev
```
App runs at `http://localhost:3000`

---

## 🐳 Docker Deployment (Coolify)

```bash
# Copy and fill production env
cp .env.example .env
# Edit .env: set DB_PASSWORD, JWT_SECRET, FRONTEND_URL, NEXT_PUBLIC_API_URL

# Start all services
docker-compose up -d --build

# Check logs
docker-compose logs -f
```

### Coolify Configuration
1. Push this repo to GitHub/GitLab
2. In Coolify → New Resource → Docker Compose
3. Point to your repo → set env variables
4. Deploy

---

## 🔐 Admin Credentials (Default)

| Username | Password   |
|----------|------------|
| `admin`  | `Admin@123` |

> ⚠️ Change the password hash in `database/schema.sql` before deploying to production!

---

## 📁 Project Structure

```
Registration APP/
├── frontend/           # Next.js 14 PWA
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── register/page.tsx   # Registration form
│   │   ├── status/page.tsx     # Status check
│   │   └── admin/
│   │       ├── login/page.tsx
│   │       └── dashboard/page.tsx
│   ├── components/
│   │   └── ServiceWorkerRegistrar.tsx
│   └── public/
│       ├── manifest.json       # PWA manifest
│       ├── sw.js               # Service worker
│       └── icons/
├── backend/            # Express API
│   └── src/
│       ├── index.ts
│       ├── routes/     # auth, registrations, admin
│       ├── middleware/ # JWT auth
│       └── models/     # DB pool
├── database/
│   └── schema.sql      # PostgreSQL schema
└── docker-compose.yml
```

---

## 📡 API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/register` | Submit registration |
| `GET`  | `/api/register/status/:phone` | Check status by phone |
| `GET`  | `/api/health` | Health check |

### Auth (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Admin login |
| `GET`  | `/api/auth/me` | Get current admin |

### Admin (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/admin/dashboard` | Stats + activity |
| `GET`  | `/api/admin/registrations` | Paginated list |
| `GET`  | `/api/admin/registrations/:id` | Single registration |
| `PUT`  | `/api/admin/registrations/:id/approve` | Approve |
| `PUT`  | `/api/admin/registrations/:id/reject` | Reject |
| `GET`  | `/api/admin/export` | CSV export |
| `GET`  | `/api/admin/logs` | Activity logs |
