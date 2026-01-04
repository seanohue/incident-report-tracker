import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import incidentsRouter from './routes/incidents.js';
import usersRouter from './routes/users.js';
import reportReasonsRouter from './routes/report-reasons.js';
import auditLogsRouter from './routes/audit-logs.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// Routes
app.use('/api/incidents', incidentsRouter);
app.use('/api/users', usersRouter);
app.use('/api/report-reasons', reportReasonsRouter);
app.use('/api/audit-logs', auditLogsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
