# Incident Report Tracking App

React frontend + Node.js backend with Prisma ORM, CASL auth, and PostgreSQL. A system for tracking and managing incident reports with role-based access control (Player, Moderator, Admin).

Conceptually, this is an incident-report tracking app for an online gaming service, though it is generic enough to support any system where Players (or users) can report a problem that is then handled by moderators: Social media, forums, chat services, customer service, etc.

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
   
   The seed script creates four test users:
   - Alice Player (Player role)
   - Dave Player (Player role)
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

## Testing

The frontend includes Jest tests for component rendering and form submission. To run tests:

```bash
cd client
npm test
```

To run tests in watch mode:

```bash
npm run test:watch
```

Current test coverage includes:
- Role-based dashboard rendering (Player, Moderator, Admin)
- Invalid role error handling
- Form field rendering and validation
- Form submission with expected data
- Action button presence for moderators

Tests mock the backend API calls and verify component behavior without requiring a running server.

## Areas for Improvement

- **Further automated testing**: Would like to have further automated testing, including end-to-end tests
- **Dockerization**: Would like to have dockerized. My plan was to get a working app and then dockerize after but I ran out of time
- **Administrative features**: Would like to have implemented more administrative features such as adding new report reasons
- **Edge cases and error handling**: I am sure there are edge cases or error cases not accounted for - things like rate limiting. As it is now, users can spam reports if they want to
- **UI/UX improvements**: The UI is far from appealing, I did almost nothing in terms of styling or design so that would be nice to have
- **Authentication**: In a few spots, I call out that a real app may function differently especially in terms of auth, getting something closer to "real" would have been nice
- **State Management**: There may be a better solution on the frontend than `useReducer`, but this worked for now.
- **Audit Logs**: I started building with these in mind but didn't do much with them in terms of making them visible from the frontend.

