# StoreRating — Full Stack Application

A full-stack web app for submitting and managing store ratings.

## Tech Stack
- **Backend**: Express.js + Sequelize ORM
- **Database**: PostgreSQL
- **Frontend**: React.js

---

## Quick Start

### 1. Database Setup

Create a PostgreSQL database:
```sql
CREATE DATABASE storerating_db;
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DB credentials and JWT secret
npm run dev
```

On first start, the server will:
- Auto-sync database tables (Sequelize `alter: true`)
- Seed a default admin account:
  - Email: `admin@storerating.com`
  - Password: `Admin@123`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`, proxies API calls to `http://localhost:5000`.

---

## User Roles & Access

| Role | Access |
|------|--------|
| **Admin** | Dashboard stats, manage users & stores, view user details |
| **Normal User** | Browse stores, submit/modify ratings, change password |
| **Store Owner** | View own store's ratings & average, change password |

---

## API Endpoints

### Auth
- `POST /api/auth/register` — Sign up (normal users)
- `POST /api/auth/login` — Log in (all roles)
- `PUT /api/auth/password` — Update password (authenticated)

### Admin (requires `admin` role)
- `GET /api/admin/dashboard` — Stats
- `POST /api/admin/users` — Create user
- `GET /api/admin/users` — List users (filterable + sortable)
- `GET /api/admin/users/:id` — User detail
- `POST /api/admin/stores` — Create store
- `GET /api/admin/stores` — List stores (filterable + sortable)

### Stores
- `GET /api/stores` — Browse stores (normal users)
- `POST /api/stores/rate` — Submit / update rating
- `GET /api/stores/owner/dashboard` — Store owner dashboard

---

## Form Validations

| Field | Rule |
|-------|------|
| Name | 20–60 characters |
| Address | Max 400 characters |
| Password | 8–16 chars, ≥1 uppercase, ≥1 special char |
| Email | Standard email format |

---

## Project Structure

```
storerating/
├── backend/
│   ├── src/
│   │   ├── config/database.js
│   │   ├── models/          (User, Store, Rating)
│   │   ├── controllers/     (auth, admin, store, owner)
│   │   ├── middleware/      (auth.js)
│   │   ├── routes/          (auth, admin, stores)
│   │   └── index.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── context/AuthContext.js
    │   ├── utils/api.js
    │   ├── components/Layout.js
    │   ├── pages/
    │   │   ├── Login.js / Register.js / ChangePassword.js
    │   │   ├── admin/   (Dashboard, Users, Stores, AddUser, AddStore, UserDetail)
    │   │   ├── user/    (Stores)
    │   │   └── owner/   (Dashboard)
    │   ├── App.js
    │   └── index.css
    └── package.json
```
