# Full-Stack App

React frontend + Node.js backend with Prisma ORM, CASL auth, and PostgreSQL.

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
   ```

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

