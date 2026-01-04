import express from 'express';
import { PrismaClient } from '@prisma/client';
import { defineAbility } from '../auth/ability.js';
import { logAudit } from '../utils/audit.js';
import { getUser, getRequestMetadata } from '../utils/request.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get report reasons
// Roles: Player, Moderator, Admin
router.get('/', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const ability = defineAbility(user);
    if (!ability.can('read', 'ReportReason')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const reasons = await prisma.reportReason.findMany({
      orderBy: { textKey: 'asc' },
    });

    res.json(reasons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create report reason
// Roles: Admin
router.post('/', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { textKey } = req.body;
    if (!textKey) {
      return res.status(400).json({ error: 'textKey is required' });
    }

    const reason = await prisma.reportReason.create({
      data: { textKey },
    });

    const metadata = getRequestMetadata(req);
    await logAudit({
      action: 'REPORT_REASON_CREATED',
      actorId: user.id,
      entityType: 'ReportReason',
      entityId: reason.id,
      metadata: { textKey: reason.textKey },
      ...metadata,
    });

    res.status(201).json(reason);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete report reason
// Roles: Admin
router.delete('/:id', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const reason = await prisma.reportReason.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!reason) {
      return res.status(404).json({ error: 'Report reason not found' });
    }

    await prisma.reportReason.delete({
      where: { id: reason.id },
    });

    const metadata = getRequestMetadata(req);
    await logAudit({
      action: 'REPORT_REASON_DELETED',
      actorId: user.id,
      entityType: 'ReportReason',
      entityId: reason.id,
      metadata: { textKey: reason.textKey },
      ...metadata,
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

