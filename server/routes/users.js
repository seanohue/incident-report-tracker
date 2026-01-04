import express from 'express';
import { PrismaClient } from '@prisma/client';
import { defineAbility } from '../auth/ability.js';
import { logAudit } from '../utils/audit.js';
import { getUser, getRequestMetadata } from '../utils/request.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get users (filtered by role)
// Roles: Player (own only), Moderator (all), Admin (all)
router.get('/', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const ability = defineAbility(user);
    if (!ability.can('read', 'User')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const where = user.role === 'Player' 
      ? { id: user.id }
      : {};

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        banned: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single user
// Roles: Player (own only), Moderator (all), Admin (all)
router.get('/:id', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        banned: true,
        createdAt: true,
      },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const ability = defineAbility(user);
    if (!ability.can('read', 'User', { id: targetUser.id })) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(targetUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user (ban/unban, role changes)
// Roles: Moderator (ban/unban players only), Admin (all)
router.patch('/:id', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const ability = defineAbility(user);
    const updateData = {};
    const beforeState = { ...targetUser };
    let auditAction = null;

    // Handle ban/unban
    if (req.body.banned !== undefined) {
      if (!ability.can('update', 'User', { role: targetUser.role })) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      updateData.banned = req.body.banned;
      auditAction = req.body.banned ? 'USER_BANNED' : 'USER_UNBANNED';
    }

    // Handle role changes (admin only)
    if (req.body.role !== undefined && user.role === 'Admin') {
      updateData.role = req.body.role;
      auditAction = 'USER_ROLE_CHANGED';
      
      // If promoting to moderator, log that too
      if (req.body.role === 'Moderator' && targetUser.role !== 'Moderator') {
        // Will log MODERATOR_ADDED separately below
      }
      // If demoting from moderator, log that too
      if (targetUser.role === 'Moderator' && req.body.role !== 'Moderator') {
        // Will log MODERATOR_REMOVED separately below
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const updated = await prisma.user.update({
      where: { id: targetUser.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        banned: true,
        createdAt: true,
      },
    });

    const metadata = getRequestMetadata(req);

    // Log role change
    if (updateData.role !== undefined) {
      await logAudit({
        action: auditAction || 'USER_ROLE_CHANGED',
        actorId: user.id,
        entityType: 'User',
        entityId: targetUser.id,
        metadata: { before: beforeState, after: updated },
        ...metadata,
      });

      // Log moderator add/remove
      if (updateData.role === 'Moderator' && beforeState.role !== 'Moderator') {
        await logAudit({
          action: 'MODERATOR_ADDED',
          actorId: user.id,
          entityType: 'User',
          entityId: targetUser.id,
          metadata: { userId: targetUser.id, email: targetUser.email },
          ...metadata,
        });
      } else if (beforeState.role === 'Moderator' && updateData.role !== 'Moderator') {
        await logAudit({
          action: 'MODERATOR_REMOVED',
          actorId: user.id,
          entityType: 'User',
          entityId: targetUser.id,
          metadata: { userId: targetUser.id, email: targetUser.email },
          ...metadata,
        });
      }
    } else if (auditAction) {
      // Log ban/unban
      await logAudit({
        action: auditAction,
        actorId: user.id,
        entityType: 'User',
        entityId: targetUser.id,
        metadata: { before: beforeState, after: updated },
        ...metadata,
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

