import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function logAudit({
  action,
  actorId,
  entityType,
  entityId,
  metadata = null,
  ipAddress = null,
  userAgent = null,
}) {
  return await prisma.auditLog.create({
    data: {
      action,
      actorId,
      entityType,
      entityId,
      metadata,
      ipAddress,
      userAgent,
    },
  });
}

