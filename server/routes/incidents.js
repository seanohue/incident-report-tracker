import express from 'express';
import { PrismaClient } from '@prisma/client';
import { defineAbility } from '../auth/ability.js';
import { logAudit } from '../utils/audit.js';
import { getUser, getRequestMetadata } from '../utils/request.js';

const router = express.Router();
const prisma = new PrismaClient();

// Helper to determine audit action based on incident update
const getIncidentAuditAction = (updateData, beforeState) => {
  if (updateData.resolved === false && beforeState.resolved === true) {
    return 'INCIDENT_REOPENED';
  }
  if (updateData.resolved === true && beforeState.resolved === false) {
    return 'INCIDENT_RESOLVED';
  }
  return 'INCIDENT_UPDATED';
};

// Get incidents (filtered by role)
// Roles: Player (own only), Moderator (all), Admin (all)
router.get('/', async (req, res) => {
  let user;
  try {
    user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const ability = defineAbility(user);
    if (!ability.can('read', 'Incident')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const where = user.role === 'Player' 
      ? { reporterId: user.id }
      : {};

    const incidents = await prisma.incident.findMany({
      where,
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        reportedUser: { select: { id: true, name: true, email: true } },
        resolver: { select: { id: true, name: true, email: true } },
        reportReason: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    console.error('Error code:', error.code);
    console.error('Error meta:', error.meta);
    console.error('User role:', user?.role);
    res.status(500).json({ error: error.message });
  }
});

// Get single incident
// Roles: Player (own only), Moderator (all), Admin (all)
router.get('/:id', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const incident = await prisma.incident.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        reportedUser: { select: { id: true, name: true, email: true } },
        resolver: { select: { id: true, name: true, email: true } },
        reportReason: true,
      },
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const ability = defineAbility(user);
    if (!ability.can('read', 'Incident', { reporterId: incident.reporterId })) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(incident);
  } catch (error) {
    console.error('Error fetching single incident:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create incident
// Roles: Player
router.post('/', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (user.banned) {
      return res.status(403).json({ error: 'Banned users cannot create incidents' });
    }

    const ability = defineAbility(user);
    if (!ability.can('create', 'Incident')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { reportReasonId, details, reportedUserId } = req.body;

    if (!reportReasonId || !details) {
      return res.status(400).json({ error: 'reportReasonId and details are required' });
    }

    const incident = await prisma.incident.create({
      data: {
        reporterId: user.id,
        reportReasonId: parseInt(reportReasonId),
        details,
        reportedUserId: reportedUserId ? parseInt(reportedUserId) : null,
      },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        reportedUser: { select: { id: true, name: true, email: true } },
        reportReason: true,
      },
    });

    const metadata = getRequestMetadata(req);
    await logAudit({
      action: 'INCIDENT_CREATED',
      actorId: user.id,
      entityType: 'Incident',
      entityId: incident.id,
      metadata: { details: incident.details, reportReason: incident.reportReason.textKey },
      ...metadata,
    });

    res.status(201).json(incident);
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update incident
// Roles: Moderator (unresolved only), Admin (all)
router.patch('/:id', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const incident = await prisma.incident.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const ability = defineAbility(user);
    
    // Check if user can update this incident
    if (!ability.can('update', 'Incident', { resolved: incident.resolved })) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // If incident is resolved and user is not admin, prevent editing
    if (incident.resolved && user.role !== 'Admin') {
      return res.status(403).json({ error: 'Cannot edit resolved incidents' });
    }

    const updateData = {};
    const beforeState = { ...incident };

    // Handle resolution
    if (req.body.resolved !== undefined) {
      if (req.body.resolved && !incident.resolved) {
        updateData.resolved = true;
        updateData.resolverId = user.id;
      } else if (!req.body.resolved && incident.resolved && user.role === 'Admin') {
        updateData.resolved = false;
        updateData.resolverId = null;
      }
    }

    // Allow updating details if not resolved (or if admin)
    if (req.body.details !== undefined && (!incident.resolved || user.role === 'Admin')) {
      updateData.details = req.body.details;
    }

    // Allow updating report reason if not resolved (or if admin)
    if (req.body.reportReasonId !== undefined && (!incident.resolved || user.role === 'Admin')) {
      updateData.reportReasonId = parseInt(req.body.reportReasonId);
    }

    const updated = await prisma.incident.update({
      where: { id: incident.id },
      data: updateData,
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        reportedUser: { select: { id: true, name: true, email: true } },
        resolver: { select: { id: true, name: true, email: true } },
        reportReason: true,
      },
    });

    const metadata = getRequestMetadata(req);
    const action = getIncidentAuditAction(updateData, beforeState);

    await logAudit({
      action,
      actorId: user.id,
      entityType: 'Incident',
      entityId: incident.id,
      metadata: { before: beforeState, after: updated },
      ...metadata,
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating incident:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete incident
// Roles: Admin
router.delete('/:id', async (req, res) => {
  try {
    const user = await getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const ability = defineAbility(user);
    if (!ability.can('delete', 'Incident')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const incident = await prisma.incident.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    await prisma.incident.delete({
      where: { id: incident.id },
    });

    const metadata = getRequestMetadata(req);
    await logAudit({
      action: 'INCIDENT_DELETED',
      actorId: user.id,
      entityType: 'Incident',
      entityId: incident.id,
      metadata: { incident: { id: incident.id, reporterId: incident.reporterId } },
      ...metadata,
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting incident:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

