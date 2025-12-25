import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { defineAbility } from './auth/ability.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// Example protected route
app.get('/api/protected', async (req, res) => {
  try {
    // In a real app, you'd get user from JWT/session
    const user = { id: 1, role: 'user' };
    const ability = defineAbility(user);
    
    if (ability.can('read', 'Post')) {
      res.json({ message: 'You can read posts!' });
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

