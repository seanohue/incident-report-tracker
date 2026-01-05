import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PrismaClient } from '@prisma/client';
import incidentsRouter from './routes/incidents.js';
import usersRouter from './routes/users.js';
import reportReasonsRouter from './routes/report-reasons.js';
import auditLogsRouter from './routes/audit-logs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from root directory (parent of server/), in a real app this would be set differently
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();

// Initialize Prisma with error handling
let prisma;
try {
  prisma = new PrismaClient();
} catch (error) {
  console.error('Failed to initialize Prisma Client:', error);
  process.exit(1);
}

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// Test endpoint to get users without auth (for frontend dropdown)
app.get('/api/test/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        banned: true,
      },
      orderBy: { role: 'asc' },
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Routes
app.use('/api/incidents', incidentsRouter);
app.use('/api/users', usersRouter);
app.use('/api/report-reasons', reportReasonsRouter);
app.use('/api/audit-logs', auditLogsRouter);

// Ensure PORT is explicitly set to 5000 (not from DATABASE_URL)
// Only use PORT from env if it's explicitly set and not 5432 (PostgreSQL port)
const envPort = parseInt(process.env.PORT);
const PORT = (envPort && envPort !== 5432) ? envPort : 5000;

console.log(`PORT from env: ${process.env.PORT}, using: ${PORT}`);

// Test database connection on startup
async function startServer() {
  try {
    // Test Prisma connection
    await prisma.$connect();
    console.log('Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    }).on('error', (error) => {
      console.error('Failed to start server:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to connect to database:', error);
    console.error('Make sure DATABASE_URL is set correctly in .env file');
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
