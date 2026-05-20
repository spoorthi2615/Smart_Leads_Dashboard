# Smart Leads Dashboard

A production-ready MERN lead management dashboard with JWT authentication, role-based access control, filtering, pagination, analytics, CSV export, validation, security hardening, Docker support, and OpenAPI documentation.

## Tech Stack

- Frontend: React, TypeScript, Vite, TailwindCSS, Axios, React Router
- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose
- Security: JWT, bcryptjs, Helmet, rate limiting, Mongo sanitization, strict CORS
- Documentation: Swagger/OpenAPI at `/api-docs`

## Project Structure

```text
smart_lead/
  backend/
    src/
      config/          # db, env, security, swagger
      controllers/     # auth, leads, analytics
      middlewares/     # auth, validation, error handling
      models/          # User and Lead Mongoose models
      routes/          # auth, lead, analytics routes
      validation/      # Zod schemas
  frontend/
    src/
      components/      # layout, route guards, modals, badges, boundary
      context/         # auth context
      hooks/           # debounce and validation helpers
      pages/           # auth, leads, details, analytics
      services/        # Axios API client
      types/           # shared frontend types
```

## Features

- JWT register/login and protected frontend routes
- Admin/Sales User RBAC
- Admin-only lead deletion on backend and frontend
- Lead CRUD with strict Zod validation
- Search, status/source filters, sorting, pagination, and debounced search
- Filter-aware CSV export from `GET /api/leads/export`
- Analytics dashboard backed by MongoDB aggregations
- Secure headers, rate-limited auth endpoints, sanitized requests, and locked-down CORS
- Docker Compose setup with MongoDB, backend, and frontend

## Local Setup

Install dependencies:

```bash
cd backend
npm install
cd ../frontend
npm install
```

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/smart_leads
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_ORIGIN=http://localhost:5173
```

Optional `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Run the apps:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.

## Docker Setup

From the repository root:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:5000/api`
- Swagger docs: `http://localhost:5000/api-docs`
- MongoDB: `localhost:27017`

For production, replace `JWT_SECRET`, `FRONTEND_ORIGIN`, and MongoDB credentials before deploying.

## API Overview

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Leads:

- `GET /api/leads`
- `GET /api/leads/export`
- `POST /api/leads`
- `GET /api/leads/:id`
- `PUT /api/leads/:id`
- `DELETE /api/leads/:id` admin only

Analytics:

- `GET /api/analytics`

## Deployment Guide

Frontend on Vercel:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://your-render-api.onrender.com/api`

Backend on Render:

- Root directory: `backend`
- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Environment variables:
  - `NODE_ENV=production`
  - `PORT=5000`
  - `MONGO_URI=<MongoDB Atlas connection string>`
  - `JWT_SECRET=<long random secret>`
  - `FRONTEND_ORIGIN=https://your-vercel-app.vercel.app`

Database on MongoDB Atlas:

- Create an Atlas cluster and database user.
- Add Render outbound access or temporarily allow required IP ranges.
- Use the Atlas connection string as `MONGO_URI`.

## Verification

```bash
cd backend && npm run build
cd frontend && npm run build
```

The backend must compile before deployment. The frontend build should be run locally or in CI with normal process spawn permissions.
