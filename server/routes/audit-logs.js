import express from 'express';
import { PrismaClient } from '@prisma/client';
import { defineAbility } from '../auth/ability.js';
import { getUser } from '../utils/request.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get audit logs
// Roles: Admin
router.get('/', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const ability = defineAbility(user);
    if (!ability.can('read', 'AuditLog')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { entityType, entityId, actorId, limit = 100 } = req.query;

    const where = {};
    if (entityType && entityId) {
      where.entityType = entityType;
      where.entityId = parseInt(entityId);
    }
    if (actorId) {
      where.actorId = parseInt(actorId);
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

