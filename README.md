# Incident Report Tracking App

React frontend + Node.js backend with Prisma ORM, CASL auth, and PostgreSQL. A system for tracking and managing incident reports with role-based access control (Player, Moderator, Admin).

## Setup

1. Copy `.env.example` to `.env` and update your PostgreSQL connection string:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   cd server
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```
   
   The seed script creates three test users:
   - Alice Player (Player role)
   - Bob Moderator (Moderator role)
   - Charlie Admin (Admin role)
   
   It also creates default report reasons: Inappropriate Communications, Griefing, Cheating, and Other.

4. Start development servers:
   ```bash
   npm run dev
   ```

This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:5000

## Project Structure

```
├── client/          # React frontend (Vite)
│   ├── src/
│   └── package.json
├── server/          # Node.js backend
│   ├── auth/        # CASL ability definitions
│   ├── prisma/      # Prisma schema and migrations
│   └── package.json
└── package.json     # Root workspace config
```

## Scripts

- `npm run dev` - Start both frontend and backend
- `npm run dev:client` - Start only frontend
- `npm run dev:server` - Start only backend
- `npm run prisma:studio` - Open Prisma Studio (from server directory)
- `npm run prisma:seed` - Seed database with test users and report reasons (from server directory)

